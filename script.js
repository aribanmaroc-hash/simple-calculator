const display = document.getElementById("display");

let current = "0";
let previous = null;
let operator = null;
let waitingForOperand = false;

function updateDisplay() {
  display.textContent = current;
}

function formatResult(result) {
  if (!isFinite(result) || isNaN(result)) return "Error";
  // Round to 10 decimal places to avoid floating-point artifacts (e.g. 0.1+0.2)
  const rounded = Math.round(result * 1e10) / 1e10;
  return String(rounded);
}

function inputNumber(num) {
  if (current === "Error") clearAll();
  if (waitingForOperand) {
    current = num === "." ? "0." : num;
    waitingForOperand = false;
  } else {
    if (num === "." && current.includes(".")) return;
    if (current === "0" && num !== ".") current = num;
    else if (current === "-0" && num !== ".") current = "-" + num;
    else current += num;
  }
  updateDisplay();
}

function toggleSign() {
  if (current === "Error" || current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  updateDisplay();
}

function inputPercent() {
  if (current === "Error") return;
  current = formatResult(parseFloat(current) / 100);
  updateDisplay();
}

function inputOperator(op) {
  if (current === "Error") return;
  const value = parseFloat(current);

  if (operator && !waitingForOperand) {
    const result = compute(previous, value, operator);
    current = formatResult(result);
    previous = parseFloat(current);
    if (current === "Error") { operator = null; return; }
    updateDisplay();
  } else {
    previous = value;
  }

  waitingForOperand = true;
  operator = op;
}

function compute(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function inputEquals() {
  if (operator === null || previous === null || current === "Error") return;
  const value = parseFloat(current);
  const result = compute(previous, value, operator);
  current = formatResult(result);
  previous = null;
  operator = null;
  waitingForOperand = true;
  updateDisplay();
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  waitingForOperand = false;
  updateDisplay();
}

document.querySelector(".keys").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case "number":
      inputNumber(value);
      break;
    case "operator":
      if (value === "±") toggleSign();
      else if (value === "%") inputPercent();
      else inputOperator(value);
      break;
    case "equals":
      inputEquals();
      break;
    case "clear":
      clearAll();
      break;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") inputNumber(e.key);
  else if (e.key === ".") inputNumber(".");
  else if (["+", "-", "*", "/"].includes(e.key)) {
    // Allow starting a negative number with "-" when waiting for operand
    if (e.key === "-" && (waitingForOperand || current === "0")) {
      current = "-";
      waitingForOperand = false;
      updateDisplay();
    } else {
      inputOperator(e.key);
    }
  }
  else if (e.key === "Enter" || e.key === "=") inputEquals();
  else if (e.key === "Escape" || e.key === "c" || e.key === "C") clearAll();
  else if (e.key === "Backspace") {
    if (current === "Error") { clearAll(); return; }
    if (waitingForOperand) return;
    current = current.length > 1 ? current.slice(0, -1) : "0";
    if (current === "-") current = "0";
    updateDisplay();
  }
});

updateDisplay();
