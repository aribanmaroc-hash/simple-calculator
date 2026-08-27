const display = document.getElementById("display");

let current = "0";
let previous = null;
let operator = null;
let waitingForOperand = false;

function updateDisplay() {
  display.textContent = current;
}

function inputNumber(num) {
  if (waitingForOperand) {
    current = num;
    waitingForOperand = false;
  } else {
    current = current === "0" && num !== "." ? num : current + num;
  }
  updateDisplay();
}

function inputOperator(op) {
  const value = parseFloat(current);

  if (operator && !waitingForOperand) {
    const result = compute(previous, value, operator);
    current = String(result);
    previous = result;
    updateDisplay();
  } else {
    previous = value;
  }

  if (op === "±") {
    current = String(value * -1);
    updateDisplay();
    return;
  }
  if (op === "%") {
    current = String(value / 100);
    updateDisplay();
    return;
  }

  waitingForOperand = true;
  operator = op;
}

function compute(a, b, op) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b === 0 ? 0 : a / b;
    default:
      return b;
  }
}

function inputEquals() {
  if (operator === null || previous === null) return;
  const value = parseFloat(current);
  const result = compute(previous, value, operator);
  current = String(result);
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

  switch (action) {
    case "number":
      inputNumber(btn.dataset.value);
      break;
    case "operator":
      inputOperator(btn.dataset.value);
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
  else if (["+", "-", "*", "/"].includes(e.key)) inputOperator(e.key);
  else if (e.key === "Enter" || e.key === "=") inputEquals();
  else if (e.key === "Escape" || e.key === "c" || e.key === "C") clearAll();
  else if (e.key === "Backspace") {
    if (waitingForOperand) return;
    current = current.length > 1 ? current.slice(0, -1) : "0";
    updateDisplay();
  }
});

updateDisplay();
