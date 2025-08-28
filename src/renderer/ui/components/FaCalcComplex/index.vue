<template>
  <div class="calculator-container">
    <el-card class="calculator-card" shadow="hover" :body-style="{ padding: '30px' }">
      <!-- 标题和模式切换 -->
      <div class="header">
        <h1 class="title">🧮 MathJS 高级计算器</h1>
        <el-segmented
          v-model="currentMode"
          :options="modes"
          @change="handleModeChange"
          size="large"
          class="mode-selector"
        />
      </div>

      <!-- 功能设置 -->
      <div class="settings-section">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-select v-model="angleUnit" placeholder="角度单位" size="small">
              <el-option label="弧度 (rad)" value="rad" />
              <el-option label="角度 (deg)" value="deg" />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-input-number
              v-model="precision"
              :min="0"
              :max="15"
              size="small"
              controls-position="right"
              placeholder="精度"
            />
          </el-col>
          <el-col :span="8">
            <el-switch
              v-model="showSteps"
              active-text="显示步骤"
              size="small"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 内存和变量显示 -->
      <div v-if="Object.keys(variables).length > 0 || memory !== 0" class="variables-section">
        <el-tag
          v-if="memory !== 0"
          type="warning"
          size="large"
          closable
          @close="clearMemory"
        >
          内存: {{ formatNumber(memory) }}
        </el-tag>

        <el-tag
          v-for="(value, name) in variables"
          :key="name"
          type="info"
          size="large"
          closable
          @close="deleteVariable(name)"
          class="variable-tag"
        >
          {{ name }} = {{ formatNumber(value) }}
        </el-tag>
      </div>

      <!-- 显示屏 -->
      <div class="display-section">
        <el-card class="display-card" shadow="never">
          <div class="expression">{{ currentExpression }}</div>
          <div class="result">{{ displayResult }}</div>

          <!-- 计算步骤显示 -->
          <div v-if="showSteps && calculationSteps.length > 0" class="steps">
            <el-divider content-position="left">计算步骤</el-divider>
            <div v-for="(step, index) in calculationSteps" :key="index" class="step-item">
              {{ step }}
            </div>
          </div>
        </el-card>
      </div>

      <!-- 进制转换器（程序员模式） -->
      <el-collapse v-if="currentMode === 'programmer'" class="base-converter">
        <el-collapse-item title="📊 进制转换器" name="converter">
          <el-row :gutter="12">
            <el-col :span="6">
              <el-input
                v-model="baseValues.hex"
                placeholder="十六进制"
                readonly
                size="small"
              >
                <template #prepend>HEX</template>
              </el-input>
            </el-col>
            <el-col :span="6">
              <el-input
                v-model="baseValues.dec"
                placeholder="十进制"
                readonly
                size="small"
              >
                <template #prepend>DEC</template>
              </el-input>
            </el-col>
            <el-col :span="6">
              <el-input
                v-model="baseValues.bin"
                placeholder="二进制"
                readonly
                size="small"
              >
                <template #prepend>BIN</template>
              </el-input>
            </el-col>
            <el-col :span="6">
              <el-input
                v-model="baseValues.oct"
                placeholder="八进制"
                readonly
                size="small"
              >
                <template #prepend>OCT</template>
              </el-input>
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>

      <!-- 单位转换器（科学模式） -->
      <el-collapse v-if="currentMode === 'scientific'" class="unit-converter">
        <el-collapse-item title="🔄 单位转换" name="units">
          <el-row :gutter="12">
            <el-col :span="8">
              <el-select v-model="unitCategory" placeholder="选择类别" size="small">
                <el-option label="长度" value="length" />
                <el-option label="重量" value="mass" />
                <el-option label="温度" value="temperature" />
                <el-option label="面积" value="area" />
                <el-option label="体积" value="volume" />
              </el-select>
            </el-col>
            <el-col :span="8">
              <el-input
                v-model="unitValue"
                placeholder="输入数值"
                size="small"
                @input="convertUnits"
              />
            </el-col>
            <el-col :span="8">
              <el-select v-model="fromUnit" placeholder="从" size="small" @change="convertUnits">
                <el-option
                  v-for="unit in availableUnits"
                  :key="unit.value"
                  :label="unit.label"
                  :value="unit.value"
                />
              </el-select>
            </el-col>
          </el-row>

          <div v-if="unitConversions.length > 0" class="conversion-results">
            <el-tag
              v-for="conversion in unitConversions"
              :key="conversion.unit"
              class="conversion-tag"
              size="small"
            >
              {{ conversion.value }} {{ conversion.unit }}
            </el-tag>
          </div>
        </el-collapse-item>
      </el-collapse>

      <!-- 计算器按钮区域 -->
      <div class="calculator-section">
        <transition name="el-fade-in" mode="out-in">
          <!-- 基础模式 -->
          <div v-if="currentMode === 'basic'" key="basic" class="button-grid basic-grid">
            <el-button type="danger" @click="clearAll" size="large">AC</el-button>
            <el-button type="warning" @click="clearEntry" size="large">CE</el-button>
            <el-button type="info" @click="backspace" size="large">
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-button type="primary" @click="appendOperator('/')" size="large">÷</el-button>

            <el-button @click="appendNumber('7')" size="large" plain>7</el-button>
            <el-button @click="appendNumber('8')" size="large" plain>8</el-button>
            <el-button @click="appendNumber('9')" size="large" plain>9</el-button>
            <el-button type="primary" @click="appendOperator('*')" size="large">×</el-button>

            <el-button @click="appendNumber('4')" size="large" plain>4</el-button>
            <el-button @click="appendNumber('5')" size="large" plain>5</el-button>
            <el-button @click="appendNumber('6')" size="large" plain>6</el-button>
            <el-button type="primary" @click="appendOperator('-')" size="large">-</el-button>

            <el-button @click="appendNumber('1')" size="large" plain>1</el-button>
            <el-button @click="appendNumber('2')" size="large" plain>2</el-button>
            <el-button @click="appendNumber('3')" size="large" plain>3</el-button>
            <el-button type="primary" @click="appendOperator('+')" size="large">+</el-button>

            <el-button @click="memoryRecall" type="success" size="large">MR</el-button>
            <el-button @click="appendNumber('0')" size="large" plain>0</el-button>
            <el-button @click="appendNumber('.')" size="large" plain>.</el-button>
            <el-button type="success" @click="calculate" size="large">
              <el-icon><Check /></el-icon> =
            </el-button>
          </div>

          <!-- 科学模式 -->
          <div v-else-if="currentMode === 'scientific'" key="scientific" class="button-grid scientific-grid">
            <el-button type="danger" @click="clearAll" size="large">AC</el-button>
            <el-button type="warning" @click="clearEntry" size="large">CE</el-button>
            <el-button type="info" @click="backspace" size="large">
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-button type="primary" @click="memoryStore" size="large">MS</el-button>
            <el-button type="success" @click="memoryRecall" size="large">MR</el-button>
            <el-button type="warning" @click="memoryAdd" size="large">M+</el-button>

            <el-button type="primary" @click="appendFunction('sin(')" size="large">sin</el-button>
            <el-button type="primary" @click="appendFunction('cos(')" size="large">cos</el-button>
            <el-button type="primary" @click="appendFunction('tan(')" size="large">tan</el-button>
            <el-button type="primary" @click="appendFunction('log(')" size="large">log</el-button>
            <el-button type="primary" @click="appendFunction('ln(')" size="large">ln</el-button>
            <el-button type="primary" @click="appendOperator('/')" size="large">÷</el-button>

            <el-button type="primary" @click="appendFunction('asin(')" size="large">asin</el-button>
            <el-button type="primary" @click="appendFunction('acos(')" size="large">acos</el-button>
            <el-button type="primary" @click="appendFunction('atan(')" size="large">atan</el-button>
            <el-button type="primary" @click="appendFunction('sqrt(')" size="large">√</el-button>
            <el-button type="primary" @click="appendFunction('cbrt(')" size="large">∛</el-button>
            <el-button type="primary" @click="appendOperator('*')" size="large">×</el-button>

            <el-button @click="appendNumber('7')" size="large" plain>7</el-button>
            <el-button @click="appendNumber('8')" size="large" plain>8</el-button>
            <el-button @click="appendNumber('9')" size="large" plain>9</el-button>
            <el-button type="primary" @click="appendOperator('^')" size="large">x^y</el-button>
            <el-button type="primary" @click="appendFunction('factorial(')" size="large">x!</el-button>
            <el-button type="primary" @click="appendOperator('-')" size="large">-</el-button>

            <el-button @click="appendNumber('4')" size="large" plain>4</el-button>
            <el-button @click="appendNumber('5')" size="large" plain>5</el-button>
            <el-button @click="appendNumber('6')" size="large" plain>6</el-button>
            <el-button type="primary" @click="appendConstant('pi')" size="large">π</el-button>
            <el-button type="primary" @click="appendConstant('e')" size="large">e</el-button>
            <el-button type="primary" @click="appendOperator('+')" size="large">+</el-button>

            <el-button @click="appendNumber('1')" size="large" plain>1</el-button>
            <el-button @click="appendNumber('2')" size="large" plain>2</el-button>
            <el-button @click="appendNumber('3')" size="large" plain>3</el-button>
            <el-button type="primary" @click="appendOperator('(')" size="large">(</el-button>
            <el-button type="primary" @click="appendOperator(')')" size="large">)</el-button>
            <el-button type="success" @click="calculate" size="large" class="btn-equals-tall">
              <el-icon><Check /></el-icon> =
            </el-button>

            <el-button @click="appendNumber('0')" size="large" plain class="btn-zero">0</el-button>
            <el-button @click="appendNumber('.')" size="large" plain>.</el-button>
            <el-button type="primary" @click="appendFunction('exp(')" size="large">e^x</el-button>
            <el-button type="primary" @click="appendFunction('abs(')" size="large">|x|</el-button>
          </div>

          <!-- 程序员模式 -->
          <div v-else-if="currentMode === 'programmer'" key="programmer" class="button-grid programmer-grid">
            <el-button type="danger" @click="clearAll" size="large">AC</el-button>
            <el-button type="warning" @click="clearEntry" size="large">CE</el-button>
            <el-button type="info" @click="backspace" size="large">
              <el-icon><Delete /></el-icon>
            </el-button>
            <el-button type="primary" @click="appendBitwise('and')" size="large">AND</el-button>
            <el-button type="primary" @click="appendBitwise('or')" size="large">OR</el-button>

            <el-button type="primary" @click="appendBitwise('xor')" size="large">XOR</el-button>
            <el-button type="primary" @click="appendBitwise('not')" size="large">NOT</el-button>
            <el-button type="primary" @click="appendBitwise('leftShift')" size="large">&lt;&lt;</el-button>
            <el-button type="primary" @click="appendBitwise('rightArithShift')" size="large">&gt;&gt;</el-button>
            <el-button type="primary" @click="appendOperator(' mod ')" size="large">MOD</el-button>

            <el-button @click="appendHex('A')" size="large" plain>A</el-button>
            <el-button @click="appendHex('B')" size="large" plain>B</el-button>
            <el-button @click="appendHex('C')" size="large" plain>C</el-button>
            <el-button @click="appendHex('D')" size="large" plain>D</el-button>
            <el-button @click="appendHex('E')" size="large" plain>E</el-button>

            <el-button @click="appendHex('F')" size="large" plain>F</el-button>
            <el-button @click="appendNumber('9')" size="large" plain>9</el-button>
            <el-button @click="appendNumber('8')" size="large" plain>8</el-button>
            <el-button @click="appendNumber('7')" size="large" plain>7</el-button>
            <el-button type="primary" @click="appendOperator('/')" size="large">/</el-button>

            <el-button @click="appendNumber('6')" size="large" plain>6</el-button>
            <el-button @click="appendNumber('5')" size="large" plain>5</el-button>
            <el-button @click="appendNumber('4')" size="large" plain>4</el-button>
            <el-button @click="appendNumber('3')" size="large" plain>3</el-button>
            <el-button type="primary" @click="appendOperator('*')" size="large">*</el-button>

            <el-button @click="appendNumber('2')" size="large" plain>2</el-button>
            <el-button @click="appendNumber('1')" size="large" plain>1</el-button>
            <el-button @click="appendNumber('0')" size="large" plain>0</el-button>
            <el-button type="primary" @click="appendOperator('-')" size="large">-</el-button>
            <el-button type="primary" @click="appendOperator('+')" size="large">+</el-button>

            <el-button type="success" @click="calculate" size="large" class="btn-equals-wide">
              <el-icon><Check /></el-icon> 计算结果
            </el-button>
          </div>
        </transition>
      </div>

      <!-- 变量赋值 -->
      <div class="variable-input">
        <el-input
          v-model="variableInput"
          placeholder="输入变量赋值，如: x = 5, y = sin(pi/4)"
          @keyup.enter="assignVariable"
          size="small"
        >
          <template #append>
            <el-button @click="assignVariable" type="primary">赋值</el-button>
          </template>
        </el-input>
      </div>

      <!-- 历史记录和功能 -->
      <el-row :gutter="16">
        <el-col :span="16">
          <div class="history-section">
            <el-card class="history-card" shadow="never">
              <template #header>
                <div class="history-header">
                  <el-icon class="history-icon"><Document /></el-icon>
                  <span>计算历史</span>
                  <el-button
                    type="danger"
                    size="small"
                    text
                    @click="clearHistory"
                    v-if="history.length > 0"
                  >
                    清空
                  </el-button>
                </div>
              </template>

              <div v-if="history.length === 0" class="empty-history">
                <el-empty description="暂无计算记录" :image-size="60" />
              </div>

              <div v-else class="history-list">
                <transition-group name="list" tag="div">
                  <el-tag
                    v-for="(item, index) in history"
                    :key="`${item.expression}-${index}`"
                    @click="useHistoryItem(item)"
                    class="history-item"
                    effect="plain"
                    type="info"
                    size="large"
                  >
                    {{ item.expression }} = {{ item.result }}
                  </el-tag>
                </transition-group>
              </div>
            </el-card>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="functions-panel">
            <el-card class="functions-card" shadow="never">
              <template #header>
                <span>🔧 快捷功能</span>
              </template>

              <div class="function-buttons">
                <el-button @click="showHelp" type="info" size="small" block>
                  <el-icon><QuestionFilled /></el-icon> 帮助
                </el-button>
                <el-button @click="exportHistory" type="success" size="small" block>
                  <el-icon><Download /></el-icon> 导出历史
                </el-button>
                <el-button @click="importHistory" type="warning" size="small" block>
                  <el-icon><Upload /></el-icon> 导入历史
                </el-button>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 帮助对话框 -->
    <el-dialog v-model="helpDialogVisible" title="计算器帮助" width="60%">
      <div class="help-content">
        <h3>基础功能</h3>
        <ul>
          <li>支持基本四则运算：+、-、×、÷</li>
          <li>支持括号：()，可以嵌套使用</li>
          <li>支持小数点运算</li>
        </ul>

        <h3>科学计算</h3>
        <ul>
          <li>三角函数：sin, cos, tan, asin, acos, atan</li>
          <li>对数函数：log（以10为底）, ln（自然对数）</li>
          <li>指数函数：exp, 幂运算 x^y</li>
          <li>根号函数：sqrt（平方根）, cbrt（立方根）</li>
          <li>其他函数：abs（绝对值）, factorial（阶乘）</li>
          <li>常数：π (pi), e</li>
        </ul>

        <h3>程序员模式</h3>
        <ul>
          <li>位运算：AND, OR, XOR, NOT</li>
          <li>位移运算：<<（左移）, >>（右移）</li>
          <li>进制转换：支持十进制、十六进制、二进制、八进制</li>
          <li>模运算：MOD</li>
        </ul>

        <h3>高级功能</h3>
        <ul>
          <li>变量赋值：例如 x = 5, y = sin(pi/4)</li>
          <li>内存功能：MS（存储）, MR（读取）, M+（累加）</li>
          <li>单位转换：长度、重量、温度、面积、体积</li>
          <li>计算步骤显示</li>
          <li>精度控制</li>
          <li>角度单位切换（弧度/角度）</li>
        </ul>

        <h3>快捷键</h3>
        <ul>
          <li>数字键：0-9</li>
          <li>运算符：+、-、*、/</li>
          <li>等号：Enter 或 =</li>
          <li>清空：Escape</li>
          <li>退格：Backspace</li>
        </ul>
      </div>

      <template #footer>
        <el-button @click="helpDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {Check, Delete, Document, Download, QuestionFilled, Upload} from '@element-plus/icons-vue'
import * as math from 'mathjs'

// 配置 MathJS
const mathConfig = {
  number: 'BigNumber',
  precision: 64
}
const mathjs = math.create(math.all, mathConfig)

// 响应式数据
const currentExpression = ref('')
const currentResult = ref('0')
const memory = ref(0)
const variables = ref({})
const history = ref([])
const currentMode = ref('basic')
const angleUnit = ref('rad')
const precision = ref(6)
const showSteps = ref(false)
const calculationSteps = ref([])
const helpDialogVisible = ref(false)
const variableInput = ref('')

// 单位转换相关
const unitCategory = ref('length')
const unitValue = ref('')
const fromUnit = ref('')
const unitConversions = ref([])

// 模式配置
const modes = [
  { label: '基础计算', value: 'basic' },
  { label: '科学计算', value: 'scientific' },
  { label: '程序员', value: 'programmer' }
]

// 单位定义
const unitDefinitions = {
  length: [
    { label: '米 (m)', value: 'm' },
    { label: '千米 (km)', value: 'km' },
    { label: '厘米 (cm)', value: 'cm' },
    { label: '毫米 (mm)', value: 'mm' },
    { label: '英寸 (in)', value: 'in' },
    { label: '英尺 (ft)', value: 'ft' },
    { label: '码 (yd)', value: 'yd' },
    { label: '英里 (mi)', value: 'mi' }
  ],
  mass: [
    { label: '千克 (kg)', value: 'kg' },
    { label: '克 (g)', value: 'g' },
    { label: '磅 (lb)', value: 'lb' },
    { label: '盎司 (oz)', value: 'oz' },
    { label: '吨 (t)', value: 't' }
  ],
  temperature: [
    { label: '摄氏度 (°C)', value: 'degC' },
    { label: '华氏度 (°F)', value: 'degF' },
    { label: '开尔文 (K)', value: 'K' }
  ],
  area: [
    { label: '平方米 (m²)', value: 'm2' },
    { label: '平方厘米 (cm²)', value: 'cm2' },
    { label: '平方英尺 (ft²)', value: 'ft2' },
    { label: '公顷 (ha)', value: 'hectare' }
  ],
  volume: [
    { label: '立方米 (m³)', value: 'm3' },
    { label: '升 (L)', value: 'L' },
    { label: '毫升 (mL)', value: 'mL' },
    { label: '加仑 (gal)', value: 'gal' }
  ]
}

// 计算属性
const displayResult = computed(() => {
  return formatNumber(currentResult.value) || '0'
})

const availableUnits = computed(() => {
  return unitDefinitions[unitCategory.value] || []
})

// 程序员模式的进制转换
const baseValues = computed(() => {
  if (currentMode.value !== 'programmer') {
    return { hex: '', dec: '', bin: '', oct: '' }
  }

  try {
    const num = parseFloat(currentResult.value)
    if (isNaN(num)) return { hex: '', dec: '', bin: '', oct: '' }

    const decimal = Math.floor(num)
    return {
      hex: decimal.toString(16).toUpperCase(),
      dec: decimal.toString(10),
      bin: decimal.toString(2),
      oct: decimal.toString(8)
    }
  } catch (error) {
    return { hex: '', dec: '', bin: '', oct: '' }
  }
})

// 监听角度单位变化
watch(angleUnit, (newUnit) => {
  mathjs.config({
    angles: newUnit
  })
})

// 方法
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '0'

  try {
    const num = mathjs.evaluate(value.toString())
    if (mathjs.isComplex(num)) {
      return mathjs.format(num, { precision: precision.value })
    }
    return mathjs.format(num, {
      precision: precision.value,
      notation: 'auto'
    })
  } catch (error) {
    return value.toString()
  }
}

const handleModeChange = (mode) => {
  currentMode.value = mode
  clearAll()
  ElMessage.success(`已切换到${modes.find(m => m.value === mode)?.label}模式`)
}

const appendNumber = (num) => {
  if (currentResult.value === '0' || currentResult.value === 'Error') {
    currentResult.value = num
  } else {
    currentResult.value += num
  }
}

const appendOperator = (op) => {
  if (currentExpression.value && currentResult.value !== '') {
    currentExpression.value += currentResult.value + ' ' + op + ' '
    currentResult.value = ''
  } else if (currentResult.value !== '') {
    currentExpression.value = currentResult.value + ' ' + op + ' '
    currentResult.value = ''
  }
}

const appendFunction = (func) => {
  if (currentExpression.value === '' && currentResult.value !== '0') {
    currentExpression.value = func + currentResult.value + ')'
    currentResult.value = ''
  } else {
    currentExpression.value += func
  }
}

const appendConstant = (constant) => {
  currentResult.value = constant
}

const appendHex = (hex) => {
  if (currentResult.value === '0' || currentResult.value === 'Error') {
    currentResult.value = '0x' + hex
  } else if (currentResult.value.startsWith('0x')) {
    currentResult.value += hex
  } else {
    currentResult.value = '0x' + hex
  }
}

const appendBitwise = (operation) => {
  const operations = {
    'and': ' bitAnd ',
    'or': ' bitOr ',
    'xor': ' bitXor ',
    'not': 'bitNot(',
    'leftShift': ' leftShift ',
    'rightArithShift': ' rightArithShift '
  }

  if (operation === 'not') {
    if (currentResult.value !== '0') {
      currentExpression.value += operations[operation] + currentResult.value + ')'
      currentResult.value = ''
    } else {
      currentExpression.value += operations[operation]
    }
  } else {
    appendOperator(operations[operation])
  }
}

const clearAll = () => {
  currentExpression.value = ''
  currentResult.value = '0'
  calculationSteps.value = []
}

const clearEntry = () => {
  currentResult.value = '0'
}

const backspace = () => {
  if (currentResult.value.length > 1) {
    currentResult.value = currentResult.value.slice(0, -1)
  } else {
    currentResult.value = '0'
  }
}

const calculate = () => {
  try {
    let expression = currentExpression.value + currentResult.value
    if (!expression.trim()) {
      ElMessage.warning('请输入计算表达式')
      return
    }

    calculationSteps.value = []

    // 处理变量替换
    Object.keys(variables.value).forEach(varName => {
      const regex = new RegExp(`\\b${varName}\\b`, 'g')
      expression = expression.replace(regex, variables.value[varName].toString())
    })

    // 设置 MathJS 配置
    mathjs.config({
      angles: angleUnit.value
    })
    console.log(angleUnit.value)

    let result
    if (currentMode.value === 'programmer') {
      // 程序员模式：处理十六进制数
      expression = expression.replace(/0x([0-9A-Fa-f]+)/g, (match, hex) => {
        return parseInt(hex, 16).toString()
      })
    }

    function normalizeDegrees(expr) {
      return expr.replace(
        /\b(sin|cos|tan|asin|acos|atan)\s*\(\s*([0-9]+(\.[0-9]+)?)\s*\)/g,
        (match, fn, num) => `${fn}(${num} ${angleUnit.value})`
      )
    }

    // 使用 MathJS 计算
    console.log(normalizeDegrees(expression))
    result = mathjs.evaluate(normalizeDegrees(expression))

    // 处理复数结果
    if (mathjs.isComplex(result)) {
      currentResult.value = mathjs.format(result, {precision: precision.value})
    } else {
      currentResult.value = mathjs.format(result, {
        precision: precision.value,
        notation: 'auto'
      })
    }

    // 添加到历史记录
    addToHistory({
      expression: currentExpression.value + (currentExpression.value.endsWith(' ') ? '' : ' ') +
        (currentExpression.value.includes(currentResult.value) ? '' : currentResult.value),
      result: currentResult.value,
      mode: currentMode.value,
      timestamp: new Date().toLocaleTimeString()
    })

    // 显示计算步骤（如果启用）
    if (showSteps.value) {
      try {
        calculationSteps.value = getCalculationSteps(expression, result)
      } catch (error) {
        // 步骤显示失败不影响主要计算
      }
    }

    currentExpression.value = ''
    ElMessage.success('计算完成')

  } catch (error) {
    currentResult.value = 'Error'
    calculationSteps.value = []
    ElMessage.error(`计算错误: ${error.message}`)
  }
}

const getCalculationSteps = (expression, result) => {
  const steps = []
  steps.push(`原始表达式: ${expression}`)

  // 简化的步骤显示
  if (expression.includes('sin') || expression.includes('cos') || expression.includes('tan')) {
    steps.push(`三角函数计算 (${angleUnit.value} 模式)`)
  }
  if (expression.includes('log') || expression.includes('ln')) {
    steps.push('对数函数计算')
  }
  if (expression.includes('^') || expression.includes('sqrt')) {
    steps.push('指数/根号计算')
  }

  steps.push(`最终结果: ${mathjs.format(result, { precision: precision.value })}`)
  return steps
}

// 内存功能
const memoryStore = () => {
  try {
    memory.value = mathjs.evaluate(currentResult.value)
    ElMessage.success('已存储到内存')
  } catch (error) {
    ElMessage.error('无法存储当前值到内存')
  }
}

const memoryRecall = () => {
  if (memory.value !== 0) {
    currentResult.value = memory.value.toString()
    ElMessage.info('已从内存读取')
  } else {
    ElMessage.warning('内存为空')
  }
}

const memoryAdd = () => {
  try {
    const current = mathjs.evaluate(currentResult.value)
    memory.value = mathjs.add(memory.value, current)
    ElMessage.success('已累加到内存')
  } catch (error) {
    ElMessage.error('无法累加到内存')
  }
}

const clearMemory = () => {
  memory.value = 0
  ElMessage.info('内存已清空')
}

// 变量功能
const assignVariable = () => {
  if (!variableInput.value.trim()) {
    ElMessage.warning('请输入变量赋值表达式')
    return
  }

  try {
    const input = variableInput.value.trim()
    if (input.includes('=')) {
      const [varName, expression] = input.split('=').map(s => s.trim())
      if (varName && expression) {
        const result = mathjs.evaluate(expression)
        variables.value[varName] = result
        variableInput.value = ''
        ElMessage.success(`变量 ${varName} 已赋值为 ${mathjs.format(result, { precision: precision.value })}`)
      } else {
        ElMessage.error('变量赋值格式错误，请使用: 变量名 = 表达式')
      }
    } else {
      ElMessage.error('请使用等号进行变量赋值')
    }
  } catch (error) {
    ElMessage.error(`变量赋值错误: ${error.message}`)
  }
}

const deleteVariable = (varName) => {
  delete variables.value[varName]
  ElMessage.info(`变量 ${varName} 已删除`)
}

// 单位转换
const convertUnits = () => {
  if (!unitValue.value || !fromUnit.value || !unitCategory.value) return

  try {
    const value = parseFloat(unitValue.value)
    if (isNaN(value)) return

    unitConversions.value = []
    const targetUnits = unitDefinitions[unitCategory.value].filter(u => u.value !== fromUnit.value)

    targetUnits.forEach(targetUnit => {
      try {
        const result = mathjs.unit(value, fromUnit.value).to(targetUnit.value)
        unitConversions.value.push({
          unit: targetUnit.label,
          value: mathjs.format(result.toNumber(), { precision: precision.value })
        })
      } catch (error) {
        // 某些单位转换可能不支持，忽略错误
      }
    })
  } catch (error) {
    ElMessage.error('单位转换失败')
  }
}

// 历史记录功能
const addToHistory = (calculation) => {
  history.value.unshift(calculation)
  if (history.value.length > 20) {
    history.value.pop()
  }
}

const useHistoryItem = (item) => {
  currentResult.value = item.result
  currentExpression.value = ''
  calculationSteps.value = []
  ElMessage.info('已使用历史结果')
}

const clearHistory = () => {
  history.value = []
  ElMessage.success('历史记录已清空')
}

// 帮助和导入导出功能
const showHelp = () => {
  helpDialogVisible.value = true
}

const exportHistory = () => {
  if (history.value.length === 0) {
    ElMessage.warning('没有历史记录可导出')
    return
  }

  const data = {
    history: history.value,
    variables: variables.value,
    settings: {
      angleUnit: angleUnit.value,
      precision: precision.value,
      currentMode: currentMode.value
    },
    exportDate: new Date().toISOString()
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `calculator-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('数据已导出')
}

const importHistory = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        if (data.history) {
          history.value = data.history
        }
        if (data.variables) {
          variables.value = data.variables
        }
        if (data.settings) {
          angleUnit.value = data.settings.angleUnit || 'rad'
          precision.value = data.settings.precision || 6
          currentMode.value = data.settings.currentMode || 'basic'
        }

        ElMessage.success('数据导入成功')
      } catch (error) {
        ElMessage.error('文件格式错误，导入失败')
      }
    }
    reader.readAsText(file)
  }

  input.click()
}

// 键盘事件处理
const handleKeyDown = (event) => {
  const key = event.key

  if (key >= '0' && key <= '9') {
    appendNumber(key)
  } else if (['+', '-', '*', '/'].includes(key)) {
    appendOperator(key === '*' ? '×' : key === '/' ? '÷' : key)
  } else if (key === '=' || key === 'Enter') {
    event.preventDefault()
    calculate()
  } else if (key === 'Escape') {
    clearAll()
  } else if (key === 'Backspace') {
    backspace()
  } else if (key === '.') {
    appendNumber('.')
  } else if (key === '(') {
    appendOperator('(')
  } else if (key === ')') {
    appendOperator(')')
  }
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)

  // 初始化 MathJS 配置
  mathjs.config({
    angles: angleUnit.value
  })

  ElMessage.success('MathJS 计算器已准备就绪')
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.calculator-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.calculator-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mode-selector {
  margin-bottom: 15px;
}

.memory-alert {
  margin-bottom: 15px;
}

.display-section {
  margin-bottom: 20px;
}

.display-card {
  background: #1a1a1a;
  border: none;
  border-radius: 15px;
}

.display-card :deep(.el-card__body) {
  padding: 20px;
  color: #00ff41;
  font-family: 'Consolas', 'Monaco', monospace;
  text-align: right;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.expression {
  font-size: 14px;
  opacity: 0.7;
  margin-bottom: 5px;
  min-height: 20px;
}

.result {
  font-size: 32px;
  font-weight: bold;
  word-break: break-all;
}

.base-converter {
  margin-bottom: 20px;
}

.calculator-section {
  margin-bottom: 20px;
}

.button-grid {
  display: grid;
  gap: 12px;
}

.basic-grid {
  grid-template-columns: repeat(4, 1fr);
}

.scientific-grid {
  grid-template-columns: repeat(5, 1fr);
}

.programmer-grid {
  grid-template-columns: repeat(5, 1fr);
}

.btn-zero {
  grid-column: span 2;
}

.btn-equals {
  grid-column: span 1;
}

.btn-equals-tall {
  grid-row: span 2;
}

.btn-equals-wide {
  grid-column: span 5;
}

.history-section {
  margin-top: 20px;
}

.history-card {
  border-radius: 15px;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-icon {
  margin-right: 8px;
}

.empty-history {
  text-align: center;
  padding: 20px 0;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: block;
  margin-bottom: 8px;
  cursor: pointer;
  font-family: 'Consolas', 'Monaco', monospace;
  transition: all 0.3s ease;
}

.history-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .calculator-container {
    padding: 10px;
  }

  .basic-grid,
  .scientific-grid,
  .programmer-grid {
    gap: 8px;
  }

  .result {
    font-size: 24px;
  }
}
</style>
