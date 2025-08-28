import * as crypto from 'crypto';
import {machineId} from 'node-machine-id';
import * as si from 'systeminformation';
import {execSync} from 'child_process';
import * as os from 'os';

/**
 * 许可证信息接口
 */
interface LicenseInfo {
  machineId: string;
  userId: string;
  productName: string;
  expireDate: string;
  features: string[];
  signature: string;
}

/**
 * 机器码绑定加解密系统
 */
class MachineLicenseSystem {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16;  // 128 bits
  private readonly tagLength = 16; // 128 bits
  private readonly secretKey: Buffer;

  constructor(masterKey?: string) {
    // 使用提供的主密钥或生成默认密钥
    const key = masterKey || 'your-secret-master-key-change-this-in-production';
    this.secretKey = crypto.pbkdf2Sync(key, 'salt', 100000, this.keyLength, 'sha512');
  }

  /**
   * 获取机器唯一标识码
   */
  async getMachineId(): Promise<string> {
    try {
      // 方法1: 使用 node-machine-id 库
      const basicMachineId = await machineId();

      // 方法2: 获取更多硬件信息作为辅助
      const [cpu, system, , networkInterfaces] = await Promise.all([
        si.cpu(),
        si.system(),
        si.osInfo(),
        si.networkInterfaces()
      ]);

      // 获取主板序列号 (需要管理员权限)
      let motherboardSerial = '';
      try {
        if (process.platform === 'win32') {
          motherboardSerial = execSync('wmic baseboard get serialnumber /value', { encoding: 'utf8' })
            .split('\n')
            .find(line => line.includes('SerialNumber='))
            ?.split('=')[1]?.trim() || '';
        } else if (process.platform === 'linux') {
          motherboardSerial = execSync('sudo dmidecode -s baseboard-serial-number', { encoding: 'utf8' }).trim();
        } else if (process.platform === 'darwin') {
          motherboardSerial = execSync('system_profiler SPHardwareDataType | grep "Serial Number"', { encoding: 'utf8' })
            .split(':')[1]?.trim() || '';
        }
      } catch (error) {
        console.warn('无法获取主板序列号:', error.message);
      }

      // 获取第一个非虚拟网卡的MAC地址
      const primaryMac = networkInterfaces
        .filter(iface => !iface.virtual && iface.mac && iface.mac !== '00:00:00:00:00:00')
        .sort((a, b) => a.iface.localeCompare(b.iface))[0]?.mac || '';

      // 组合多种硬件信息生成更可靠的机器码
      const machineInfo = {
        basicId: basicMachineId,
        cpuModel: cpu.model,
        cpuCores: cpu.cores,
        systemModel: system.model,
        systemSerial: system.serial,
        motherboardSerial,
        primaryMac,
        platform: os.platform(),
        arch: os.arch()
      };

      // 生成复合机器码
      const combinedInfo = JSON.stringify(machineInfo);
      return crypto.createHash('sha256').update(combinedInfo).digest('hex');
    } catch (error) {
      console.error('获取机器码失败:', error);
      throw new Error('无法获取机器唯一标识');
    }
  }

  /**
   * 加密数据
   */
  encrypt(data: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
      cipher.setAutoPadding(true);

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // 组合 IV + Tag + 加密数据
      const result = iv.toString('hex') + tag.toString('hex') + encrypted;

      // Base64编码便于传输和存储
      return Buffer.from(result, 'hex').toString('base64');
    } catch (error) {
      throw new Error(`加密失败: ${error.message}`);
    }
  }

  /**
   * 解密数据
   */
  decrypt(encryptedData: string): string {
    try {
      // Base64解码
      const buffer = Buffer.from(encryptedData, 'base64');
      const hex = buffer.toString('hex');

      // 提取 IV、Tag 和加密数据
      const iv = Buffer.from(hex.slice(0, this.ivLength * 2), 'hex');
      const tag = Buffer.from(hex.slice(this.ivLength * 2, (this.ivLength + this.tagLength) * 2), 'hex');
      const encrypted = hex.slice((this.ivLength + this.tagLength) * 2);

      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
      decipher.setAuthTag(tag);
      decipher.setAutoPadding(true);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`解密失败: ${error.message}`);
    }
  }

  /**
   * 生成许可证
   */
  async generateLicense(
    userId: string,
    productName: string,
    expireDays: number,
    features: string[] = []
  ): Promise<string> {
    try {
      const machineId = await this.getMachineId();
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + expireDays);

      const licenseInfo: Omit<LicenseInfo, 'signature'> = {
        machineId,
        userId,
        productName,
        expireDate: expireDate.toISOString(),
        features
      };

      // 生成数字签名
      const dataToSign = JSON.stringify(licenseInfo);
      const signature = crypto
        .createHmac('sha256', this.secretKey)
        .update(dataToSign)
        .digest('hex');

      const fullLicense: LicenseInfo = {
        ...licenseInfo,
        signature
      };

      // 加密许可证
      return this.encrypt(JSON.stringify(fullLicense));
    } catch (error) {
      throw new Error(`生成许可证失败: ${error.message}`);
    }
  }

  /**
   * 验证许可证
   */
  async verifyLicense(encryptedLicense: string): Promise<{
    valid: boolean;
    license?: LicenseInfo;
    error?: string;
  }> {
    try {
      // 解密许可证
      const decryptedData = this.decrypt(encryptedLicense);
      const license: LicenseInfo = JSON.parse(decryptedData);

      // 验证数字签名
      const { signature, ...licenseData } = license;
      const dataToVerify = JSON.stringify(licenseData);
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(dataToVerify)
        .digest('hex');

      if (signature !== expectedSignature) {
        return {
          valid: false,
          error: '许可证签名验证失败'
        };
      }

      // 验证机器码
      const currentMachineId = await this.getMachineId();
      if (license.machineId !== currentMachineId) {
        return {
          valid: false,
          error: '许可证与当前机器不匹配'
        };
      }

      // 验证过期时间
      const expireDate = new Date(license.expireDate);
      const currentDate = new Date();
      if (currentDate > expireDate) {
        return {
          valid: false,
          error: '许可证已过期'
        };
      }

      return {
        valid: true,
        license
      };
    } catch (error) {
      return {
        valid: false,
        error: `许可证验证失败: ${error.message}`
      };
    }
  }

  /**
   * 检查功能权限
   */
  async checkFeature(encryptedLicense: string, featureName: string): Promise<boolean> {
    const result = await this.verifyLicense(encryptedLicense);
    if (!result.valid || !result.license) {
      return false;
    }

    return result.license.features.includes(featureName);
  }

  /**
   * 获取许可证信息
   */
  async getLicenseInfo(encryptedLicense: string): Promise<LicenseInfo | null> {
    const result = await this.verifyLicense(encryptedLicense);
    return result.valid ? result.license! : null;
  }

  /**
   * 生成试用许可证
   */
  async generateTrialLicense(
    userId: string,
    productName: string,
    trialDays: number = 30
  ): Promise<string> {
    return this.generateLicense(userId, productName, trialDays, ['trial']);
  }

  /**
   * 检查是否为试用版
   */
  async isTrialLicense(encryptedLicense: string): Promise<boolean> {
    return this.checkFeature(encryptedLicense, 'trial');
  }
}

/**
 * 许可证管理器 - 单例模式
 */
class LicenseManager {
  private static instance: LicenseManager;
  private licenseSystem: MachineLicenseSystem;
  private currentLicense: string | null = null;

  private constructor(masterKey?: string) {
    this.licenseSystem = new MachineLicenseSystem(masterKey);
  }

  static getInstance(masterKey?: string): LicenseManager {
    if (!LicenseManager.instance) {
      LicenseManager.instance = new LicenseManager(masterKey);
    }
    return LicenseManager.instance;
  }

  /**
   * 安装许可证
   */
  installLicense(license: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const result = await this.licenseSystem.verifyLicense(license);
      if (result.valid) {
        this.currentLicense = license;
        // 这里可以将许可证保存到文件或注册表
        resolve(true);
      } else {
        console.error('许可证安装失败:', result.error);
        resolve(false);
      }
    });
  }

  /**
   * 检查当前许可证状态
   */
  async checkLicenseStatus(): Promise<{
    licensed: boolean;
    trial: boolean;
    daysRemaining?: number;
    error?: string;
  }> {
    if (!this.currentLicense) {
      return { licensed: false, trial: false, error: '未安装许可证' };
    }

    const result = await this.licenseSystem.verifyLicense(this.currentLicense);
    if (!result.valid) {
      return { licensed: false, trial: false, error: result.error };
    }

    const license = result.license!;
    const expireDate = new Date(license.expireDate);
    const currentDate = new Date();
    const daysRemaining = Math.ceil((expireDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    const trial = license.features.includes('trial');

    return {
      licensed: true,
      trial,
      daysRemaining
    };
  }

  /**
   * 获取机器码（用于许可证申请）
   */
  async getMachineCode(): Promise<string> {
    return this.licenseSystem.getMachineId();
  }
}

// 导出
export type {
  LicenseInfo
}
export {
  MachineLicenseSystem,
  LicenseManager
};

// 使用示例
async function example() {
  try {
    // 创建许可证系统实例
    const licenseSystem = new MachineLicenseSystem('your-secret-key');

    // 获取机器码
    const machineId = await licenseSystem.getMachineId();
    console.log('机器码:', machineId);

    // 生成许可证（通常在服务端执行）
    const license = await licenseSystem.generateLicense(
      'user123',
      'MyElectronApp',
      365, // 365天有效期
      ['premium', 'export', 'cloud-sync']
    );
    console.log('生成的许可证:', license);

    // 验证许可证（在客户端执行）
    const verifyResult = await licenseSystem.verifyLicense(license);
    console.log('验证结果:', verifyResult);

    // 检查特定功能权限
    const hasPremium = await licenseSystem.checkFeature(license, 'premium');
    console.log('是否有高级功能:', hasPremium);

    // 使用许可证管理器
    const manager = LicenseManager.getInstance('your-secret-key');
    await manager.installLicense(license);

    const status = await manager.checkLicenseStatus();
    console.log('许可证状态:', status);

  } catch (error) {
    console.error('示例执行失败:', error);
  }
}

// 如果直接运行此文件，执行示例
if (require.main === module) {
  example();
}
