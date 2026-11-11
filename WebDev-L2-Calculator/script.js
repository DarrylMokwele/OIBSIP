
const display = document.querySelector("#display");
const historyDisplay = document.querySelector("#history");

const buttons = document.querySelectorAll("button");

let expression = "";
let justCalculated = false;

const operators = ["+", "−", "×", "÷"];

function updateDisplay() {
    display.textContent = expression || "0";
}

function isOperator(character) {
    return operators.includes(character);
}

// Insert a number or decimal point
function appendValue(value) {

    if (justCalculated) {
        if (!isOperator(value)) {
            expression = "";
        }
        justCalculated = false;
    }

    if (value === ".") {
        const currentNumber =
            expression.split(/[+−×÷]/).pop();

        if (currentNumber.includes(".")) {
            return;
        }

        if (currentNumber === "") {
            expression += "0";
        }
    }

    if (isOperator(value)) {
        if (!expression || expression === "Error") {
            return;
        }

        const lastCharacter = expression.slice(-1);

        // Replace an operator if one already exists
        if (isOperator(lastCharacter)) {
            expression = expression.slice(0, -1);
        }

        if (expression.endsWith(".")) {
            expression += "0";
        }
    }

    if (expression === "Error") {
        expression = "";
    }

    expression += value;
    updateDisplay();
}

// Clear calculator
function clearDisplay() {
    expression = "";
    historyDisplay.textContent = "";
    justCalculated = false;
    updateDisplay();
}

// Delete last character
function backspace() {
    if (expression === "Error" || justCalculated) {
        clearDisplay();
        return;
    }

    expression = expression.slice(0, -1);
    updateDisplay();
}

// Calculate using arithmetic precedence
function evaluateExpression(input) {

    const normalized = input
        .replaceAll("×", "*")
        .replaceAll("÷", "/")
        .replaceAll("−", "-");

    const tokens =
        normalized.match(/\d+(?:\.\d+)?|[+\-*/]/g);

    if (!tokens || tokens.join("") !== normalized) {
        throw new Error("Invalid expression");
    }

    const numbers = [];
    const operations = [];

    // First pass: multiplication and division
    let current = Number(tokens[0]);

    if (!Number.isFinite(current)) {
        throw new Error("Invalid number");
    }

    for (let i = 1; i < tokens.length; i += 2) {

        const operator = tokens[i];
        const next = Number(tokens[i + 1]);

        if (!Number.isFinite(next) ||
            !["+", "-", "*", "/"].includes(operator)) {
            throw new Error("Invalid expression");
        }

        if (operator === "*") {
            current *= next;
        }
        else if (operator === "/") {
            if (next === 0) {
                throw new Error("Division by zero");
            }
            current /= next;
        }
        else {
            numbers.push(current);
            operations.push(operator);
            current = next;
        }
    }

    numbers.push(current);

    // Second pass: addition and subtraction
    let result = numbers[0];

    for (let i = 0; i < operations.length; i++) {
        if (operations[i] === "+") {
            result += numbers[i + 1];
        }
        else {
            result -= numbers[i + 1];
        }
    }

    if (!Number.isFinite(result)) {
        throw new Error("Invalid result");
    }

    return Number(result.toPrecision(12));
}

// Calculate result
function calculate() {
    if (!expression || justCalculated) {
        return;
    }

    try {
        const originalExpression = expression;
        const result = evaluateExpression(expression);

        historyDisplay.textContent =
            originalExpression + " =";

        expression = String(result);
        justCalculated = true;

        updateDisplay();
    }
    catch (error) {
        historyDisplay.textContent = expression + " =";
        expression = "Error";
        justCalculated = true;
        updateDisplay();
    }
}

// Event listeners for all calculator buttons
buttons.forEach(button => {

    button.addEventListener("click", () => {

        const value = button.dataset.value;
        const action = button.dataset.action;

        if (action === "clear") {
            clearDisplay();
        }
        else if (action === "backspace") {
            backspace();
        }
        else if (action === "equals") {
            calculate();
        }
        else if (value !== undefined) {
            appendValue(value);
        }
    });

});

// Optional keyboard support
document.addEventListener("keydown", event => {

    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        appendValue(key);
    }
    else if (key === "+") {
        appendValue("+");
    }
    else if (key === "-") {
        appendValue("−");
    }
    else if (key === "*") {
        appendValue("×");
    }
    else if (key === "/") {
        event.preventDefault();
        appendValue("÷");
    }
    else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    }
    else if (key === "Backspace") {
        backspace();
    }
    else if (key === "Escape") {
        clearDisplay();
    }
});
