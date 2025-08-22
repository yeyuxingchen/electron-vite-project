<template>
  <div class="calculator-container">
    <div class="calculator">
      <!-- 显示区域 -->
      <div class="display">{{ formattedDisplay }}</div>

      <!-- 按钮区域 -->
      <div class="buttons">
        <button @click="clear">C</button>
        <button @click="appendParentheses">()</button>
        <button @click="backspace">⌫</button>
        <button @click="append('/')">÷</button>

        <button @click="append('7')">7</button>
        <button @click="append('8')">8</button>
        <button @click="append('9')">9</button>
        <button @click="append('*')">×</button>

        <button @click="append('4')">4</button>
        <button @click="append('5')">5</button>
        <button @click="append('6')">6</button>
        <button @click="append('-')">−</button>

        <button @click="append('1')">1</button>
        <button @click="append('2')">2</button>
        <button @click="append('3')">3</button>
        <button @click="append('+')">+</button>

        <button @click="append('%')">%</button>
        <button @click="append('0')">0</button>
        <button @click="append('.')">.</button>
        <button class="equals" @click="calculate">=</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" >
import { ref, computed } from "vue";
import { evaluate } from "mathjs";
defineOptions({
  name: 'FaCalc',
})

// 表达式和显示内容
const expression = ref("");
const display = ref("0");

// 格式化显示内容：将 * → ×，/ → ÷
const formattedDisplay = computed(() => {
  return expression.value.replace(/\*/g, "×").replace(/\//g, "÷");
});

// 添加字符到表达式
function append(char:string) {
  const expr = expression.value;
  const lastChar = expr.slice(-1);

  // 如果表达式为空，且输入非法起始字符（如 + - * / % )），则阻止
  if (expr === "" && ["+", "-", "*", "/", "%", ")"].includes(char)) {
    return;
  }

  // 特别允许：如果前一个是左括号，并且当前字符是 + - 数字 → 允许
  if (lastChar === "(" && (["+", "-"].includes(char) || /\d/.test(char))) {
    expression.value += char;
    updateDisplay();
    return;
  }

  // 特别阻止：如果前一个是左括号，并且当前字符是 * / × ÷ % ( . → 不允许
  if (lastChar === "(" && ["*", "/", "×", "÷", "%", "(", "."].includes(char)) {
    return;
  }

  // 阻止连续运算符（比如 ++, +*, -- 等）
  const operators = ["+", "-", "*", "/", "×", "÷", "%"];
  if (operators.includes(lastChar) && operators.includes(char)) {
    return;
  }

  // 阻止非法插入：数字或右括号后插入左括号 (
  if ((/[\d]/.test(lastChar) || lastChar === ")") && char === "(") {
    return;
  }

  // 默认情况下允许添加字符（包括继续输入数字、小数点、括号等）
  expression.value += char;
  updateDisplay();
}

// 清除输入
function clear() {
  expression.value = "";
  updateDisplay();
}

// 删除最后一个字符
function backspace() {
  expression.value = expression.value.slice(0, -1);
  updateDisplay();
}

// 插入括号：智能判断插入 '(' 还是 ')'
function appendParentheses() {
  const expr = expression.value;
  const lastChar = expr.slice(-1);

  // 第一步：统计所有未闭合的左括号数量
  let openCount = 0;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') openCount++;
    else if (expr[i] === ')') openCount--;
  }

  // 第二步：如果最后一个字符是 ( → 强制插入 )
  if (lastChar === '(') {
    expression.value += ')';
    updateDisplay();
    return;
  }

  // 第三步：如果有未闭合的左括号，允许插入 )
  if (openCount > 0) {
    expression.value += ')';
    updateDisplay();
    return;
  }

  // 第四步：如果前一个是数字或 ) → 不允许插入新的 (
  if (expr && /[\d)]/.test(lastChar)) {
    return;
  }

  // 第五步：没有未闭合的左括号，可以插入新的 (
  expression.value += '(';
  updateDisplay();
}

// 执行计算
function calculate() {
  try {
    let expr = expression.value.replace(/(\d+)%/g, "($1 / 100)");
    expr = expr.replace(/\^/g, "**");
    const result = evaluate(expr).toString();
    expression.value = result;
    updateDisplay();
  } catch (e) {
    display.value = "错误";
  }
}

// 更新显示内容
function updateDisplay() {
  display.value = formattedDisplay.value || "0";
}
</script>

<style scoped>
.calculator-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-color: #F0F3F9;
}

.calculator {
  background-color: #F0F3F9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 320px;
  max-width: 100%;
}

.display {
  width: 100%;
  height: 60px;
  font-size: 1.5rem;
  line-height: 40px;
  text-align: right;
  padding: 10px 15px;
  margin-bottom: 15px;
  background-color: #F7F9FC;
  border-radius: 8px;
  overflow-x: auto;
  white-space: nowrap;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    display: none;          /* Chrome/Safari 隐藏滚动条 */
  }
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.buttons button {
  width: 100%;
  height: 45px;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  background-color: #FFFFFF;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.buttons button:hover {
  background-color: #ddd;
}

.buttons button:active {
  background-color: #ccc;
}

/* 特殊按钮：等号 */
.buttons button.equals {
  background-color: #ff9800 !important;
  color: #000 !important;
  font-weight: bold;
}
</style>
