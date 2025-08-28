import * as crypto from "crypto";
import { machineId } from "node-machine-id";

interface LicenseInfo {
  machineId: string;
  userId: string;
  productName: string;
  expireDate: string;
  features: string[];
  signature: string;
}

interface KeyPair {
  publicKey: string;
  privateKey?: string;
}

/**
 * 非对称加密版本的许可证系统（基于签名/验签）
 */
class AsymmetricLicenseSystem {
  private readonly publicKey: string;
  private readonly privateKey?: string;

  constructor(keyPair?: KeyPair) {
    if (keyPair) {
      this.publicKey = keyPair.publicKey;
      this.privateKey = keyPair.privateKey;
    } else {
      const generated = this.generateKeyPair();
      this.publicKey = generated.publicKey;
      this.privateKey = generated.privateKey;
    }
  }

  /** 生成 RSA 密钥对 */
  generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    return { publicKey, privateKey };
  }

  /** 服务端生成许可证（私钥签名） */
  generateLicense(licenseData: Omit<LicenseInfo, "signature">): LicenseInfo {
    if (!this.privateKey) {
      throw new Error("服务端需要私钥来生成许可证");
    }

    const licenseBody = JSON.stringify(licenseData);
    const signature = crypto
      .sign("sha256", Buffer.from(licenseBody), {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      })
      .toString("base64");

    return { ...licenseData, signature };
  }

  /** 客户端验证许可证（公钥验签） */
  verifyLicense(license: LicenseInfo): boolean {
    const { signature, ...licenseData } = license;
    const licenseBody = JSON.stringify(licenseData);

    return crypto.verify(
      "sha256",
      Buffer.from(licenseBody),
      {
        key: this.publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      Buffer.from(signature, "base64")
    );
  }
}

/** 模拟演示 */
async function main() {
  console.log("=== 非对称加密许可证系统示例 ===\n");

  console.log("1. 生成 RSA 密钥对...");
  const server = new AsymmetricLicenseSystem();
  // const { publicKey, privateKey } = server.generateKeyPair();
  const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA+Ad9DsVKakNFmKnBf3Up
Pd8lSgdkrvHgCZrujZFvkII7R1dKA/Bf7oIW9BlrQMNVo0GFxSZ8hpcITFzEuBlV
cAjjKg029Q4/rCV9YjmoK5Zv330DqUImiwQj/u9qLZm1YHAd+H3l34QDUtrjPwLG
1JoYYIxbGTwYAoDyKyNZm58Pt9TleMG4W04UttDeSZhtcyR4sHMwC2phRMBi6kHk
iHA8ggvE0B1TEHM+iBa5bTn/fbztoT+XTuGLP/QhcSoKXJbdFe3TIEPyP+1qkIyl
TDL7ym1fcxsIJhDoBeMLvB0xlewqYs704nO/9b5I3+owwdN1eWqzj+eldq+9fi4h
9wIDAQAB
-----END PUBLIC KEY-----`

  const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD4B30OxUpqQ0WY
qcF/dSk93yVKB2Su8eAJmu6NkW+QgjtHV0oD8F/ughb0GWtAw1WjQYXFJnyGlwhM
XMS4GVVwCOMqDTb1Dj+sJX1iOagrlm/ffQOpQiaLBCP+72otmbVgcB34feXfhANS
2uM/AsbUmhhgjFsZPBgCgPIrI1mbnw+31OV4wbhbThS20N5JmG1zJHiwczALamFE
wGLqQeSIcDyCC8TQHVMQcz6IFrltOf99vO2hP5dO4Ys/9CFxKgpclt0V7dMgQ/I/
7WqQjKVMMvvKbV9zGwgmEOgF4wu8HTGV7CpizvTic7/1vkjf6jDB03V5arOP56V2
r71+LiH3AgMBAAECggEAOFqnOPRtqIA5b2remqGZqcOqOsw8PZ2aTERmAEdzpE9a
vaZhHE0A1vW61mJyIohfTFUmWjmY4JGvYn5Peg7TgT2bs6HGA17l66ym9OrpwWGQ
cKR8cPglPr/Fl/Z41vyOH+fJf3zHfoYFpU0zhc0RNRv//uvVBQJI6ES5AUEqaneC
fThYwImfN7xQMHkksqt3Q9FnL2+lyQd2ZwRcUV11C9INmODVXT6HVigMGfubn1eS
q54i+9xEtKeC+qorNzG1RCxI7ydJW1E/JgM+rD7CfyWTXPsaa3lMXNCYJp3DN4Lf
1ElQTxEp1h4c7ui9c9H+5aDHk001iRHISnKZCqvl6QKBgQD+Yy4cejwPay+esVme
t/QD6Z9yXImSCtkx06aRFz6CusCX17ZMZPu22sOKkVobeQfdbR8fzzcsmb68NNRE
Cxk/39LXYyounVwhIUUh1fustIBcfGpE2obDBRCteNseHK4ftYxCbV4IWzZZReQN
Dv1I2/uzRWb4brWc2V+YoJwj+QKBgQD5mf2HWREcHFqZu7BBLfn2LD/M5m1W/KbS
pb0fTjUjQOo35nkoO50tciuepR84i/cGs0Zc5Ms2KTjsmADPKnqVasyMODBZOZ0Q
31laBjaHCjaqpFoOFCuA9t0WqJvTpAXJqHIwNf1VhBpn1G82++yGHX/Z/uljA9fL
WtdphI8RbwKBgEIJky3XWYITLDCBD6fRTyo42qiAd0IPSOTTcdkWdKbRPi/s0qkw
SdvlHH/7Ta32FGGZ80t5qnQMkWQgPr5PN0XKn9xEJO4m8YS0M1MeTpA951ia/6dS
J0u3I+Y0ioVdoqIeqgOQiqmWrBwutY3iR0RDvyqBqMJzUvgdweBISWBZAoGBALGo
aKtIuwPuLpKT5A1Qo0UUE8lNDfBHXpo6e9Vnfiz8jHmDYyM+404woFmIICPIg+hR
/DgsZXPEfY7xVkoeaygk3zjC2a74chJLVzbbiz4tB+IHn028D4b4rz7sfhVy/ued
LMGh/BI9N+pFa2+QeravEoxgg1AFsTg+DWs+ffKjAoGBAPzqgcMvnTNuH13qO3Fu
mrJPkikwxX7nm6IuZB0vFzsNuL/uz6QN+YMpRaLAloCYfbevVLO0Pc6jzDAYFR2y
0i7TBzaO0Le1wB3MTEMYRLvIdSSZZ3Mpf2y+9xtu6Fu2ZcKe5KG23Hu+EfRo8zek
mpZo+ealIBY+qY999IbVzzxn
-----END PRIVATE KEY-----`
  console.log("公钥/私钥生成完成\n", privateKey ,'\n', publicKey);

  console.log("2. 获取机器码...");
  const id = await machineId();
  console.log("机器码:", id, "\n");

  console.log("3. 服务端生成许可证...");
  const licenseData = {
    machineId: id,
    userId: "user123",
    productName: "MyProduct",
    expireDate: "2026-12-31",
    features: ["featureA", "featureB"],
  };
  const serverSystem = new AsymmetricLicenseSystem({ publicKey, privateKey });
  const license = serverSystem.generateLicense(licenseData);
  console.log("许可证生成完成\n");

  console.log("4. 客户端验证许可证...");
  const clientSystem = new AsymmetricLicenseSystem({ publicKey });
  const isValid = clientSystem.verifyLicense(license);
  console.log("验证结果:", isValid ? "✅ 有效" : "❌ 无效", "\n");

  console.log("5. 测试客户端安全性...");
  try {
    // 客户端只有公钥，无法生成许可证
    const fakeClient = new AsymmetricLicenseSystem({ publicKey });
    fakeClient.generateLicense(licenseData);
  } catch (err: any) {
    console.log("✅ 客户端无法生成许可证:", err.message);
  }
}

main().catch(console.error);
