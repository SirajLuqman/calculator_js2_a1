"use strict";

// Basic mathematical operations

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    return "Nice try! You can't divide by zero.";
  }

  return a / b;
}

// Select and perform a mathematical operation

function operate(operator, num1, num2) {
  switch (operator) {
    case "+":
      return add(num1, num2);

    case "-":
      return subtract(num1, num2);

    case "*":
      return multiply(num1, num2);

    case "/":
      return divide(num1, num2);

    default:
      return null;
  }
}

// Calculator elements

const display = document.querySelector("#display");
const keypad = document.querySelector(".keypad");

// Calculator state

let displayValue = "0";
let firstNumber = null;
let currentOperator = null;
let waitingForSecondNumber = false;
let shouldResetDisplay = false;
let justCalculated = false;
let errorDisplayed = false;

// Display formatting

function formatNumber(number) {
  if (!Number.isFinite(number)) {
    return "Error";
  }

  // Round floating-point results to avoid long decimals.
  const rounded = Number.parseFloat(number.toPrecision(10));

  // Prevent excessively long display values.
  let formatted = String(rounded);

  if (formatted.length > 15) {
    formatted = rounded.toExponential(6);
  }

  return formatted;
}

function updateDisplay() {
  display.textContent = displayValue;
}

// Input a digit

function inputDigit(digit) {
  if (errorDisplayed) {
    clearCalculator();
  }

  if (shouldResetDisplay || waitingForSecondNumber) {
    displayValue = digit;
    shouldResetDisplay = false;
    waitingForSecondNumber = false;
    justCalculated = false;
  } else if (displayValue === "0") {
    displayValue = digit;
  } else if (displayValue.replace("-", "").length < 15) {
    displayValue += digit;
  }

  updateDisplay();
}

// Input a decimal point

function inputDecimal() {
  if (errorDisplayed) {
    clearCalculator();
  }

  if (shouldResetDisplay || waitingForSecondNumber) {
    displayValue = "0.";
    shouldResetDisplay = false;
    waitingForSecondNumber = false;
    justCalculated = false;
  } else if (!displayValue.includes(".")) {
    displayValue += ".";
  }

  updateDisplay();
}

// Display an error message

function showError(message) {
  displayValue = message;
  firstNumber = null;
  currentOperator = null;
  waitingForSecondNumber = false;
  shouldResetDisplay = true;
  justCalculated = false;
  errorDisplayed = true;

  updateDisplay();
}

// Select an operator

function chooseOperator(operator) {
  if (errorDisplayed) {
    clearCalculator();
    return;
  }

  const inputValue = Number(displayValue);

  if (!Number.isFinite(inputValue)) {
    return;
  }

  // If an operator is already waiting, evaluate that pair first.
  if (currentOperator !== null && !waitingForSecondNumber) {
    const result = operate(currentOperator, firstNumber, inputValue);

    if (typeof result === "string") {
      showError(result);
      return;
    }

    if (!Number.isFinite(result)) {
      showError("Oops! That result is too large.");
      return;
    }

    displayValue = formatNumber(result);
    updateDisplay();

    firstNumber = Number(displayValue);
  } else if (firstNumber === null || justCalculated) {
    firstNumber = inputValue;
  }

  currentOperator = operator;
  waitingForSecondNumber = true;
  shouldResetDisplay = false;
  justCalculated = false;
}

// Calculate the result

function calculate() {
  if (errorDisplayed) {
    return;
  }

  // Ignore Equals if an operand or operator is missing.
  if (
    currentOperator === null ||
    firstNumber === null ||
    waitingForSecondNumber
  ) {
    return;
  }

  const secondNumber = Number(displayValue);

  if (!Number.isFinite(secondNumber)) {
    return;
  }

  const result = operate(currentOperator, firstNumber, secondNumber);

  if (typeof result === "string") {
    showError(result);
    return;
  }

  if (!Number.isFinite(result)) {
    showError("Oops! That result is too large.");
    return;
  }

  displayValue = formatNumber(result);
  updateDisplay();

  firstNumber = null;
  currentOperator = null;
  waitingForSecondNumber = false;
  shouldResetDisplay = true;
  justCalculated = true;
}

// Clear all calculator state

function clearCalculator() {
  displayValue = "0";
  firstNumber = null;
  currentOperator = null;
  waitingForSecondNumber = false;
  shouldResetDisplay = false;
  justCalculated = false;
  errorDisplayed = false;

  updateDisplay();
}

// Delete the last entered character

function backspace() {
  if (errorDisplayed) {
    clearCalculator();
    return;
  }

  if (waitingForSecondNumber || shouldResetDisplay) {
    return;
  }

  if (justCalculated) {
    return;
  }

  if (
    displayValue.length <= 1 ||
    (displayValue.length === 2 && displayValue.startsWith("-"))
  ) {
    displayValue = "0";
  } else {
    displayValue = displayValue.slice(0, -1);
  }

  updateDisplay();
}

// Change the sign of the displayed number

function toggleSign() {
  if (errorDisplayed) {
    clearCalculator();
  }

  if (displayValue === "0" || displayValue === "0.") {
    return;
  }

  if (displayValue.startsWith("-")) {
    displayValue = displayValue.slice(1);
  } else {
    displayValue = "-" + displayValue;
  }

  shouldResetDisplay = false;
  waitingForSecondNumber = false;
  justCalculated = false;

  updateDisplay();
}

// Convert the displayed number to a percentage

function calculatePercentage() {
  if (errorDisplayed) {
    clearCalculator();
  }

  const number = Number(displayValue);

  if (!Number.isFinite(number)) {
    return;
  }

  displayValue = formatNumber(number / 100);
  shouldResetDisplay = true;
  waitingForSecondNumber = false;
  justCalculated = false;

  updateDisplay();
}

// Handle button clicks

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.dataset.digit !== undefined) {
    inputDigit(button.dataset.digit);
    return;
  }

  if (button.dataset.operator !== undefined) {
    chooseOperator(button.dataset.operator);
    return;
  }

  switch (button.dataset.action) {
    case "clear":
      clearCalculator();
      break;

    case "decimal":
      inputDecimal();
      break;

    case "equals":
      calculate();
      break;

    case "backspace":
      backspace();
      break;

    case "sign":
      toggleSign();
      break;

    case "percent":
      calculatePercentage();
      break;
  }
});

// Keyboard support

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
    return;
  }

  if (key === ".") {
    inputDecimal();
    return;
  }

  if (["+", "-", "*", "/"].includes(key)) {
    event.preventDefault();
    chooseOperator(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
    return;
  }

  if (key === "Backspace") {
    event.preventDefault();
    backspace();
    return;
  }

  if (key === "Escape" || key === "Delete") {
    clearCalculator();
    return;
  }

  if (key === "%") {
    calculatePercentage();
  }
});
