document.addEventListener('DOMContentLoaded', () => {
    // Select calculator specific elements
    const outputDisplay = document.querySelector(".output-display");
    const inputDisplay = document.querySelector(".input-display");
    const buttons = document.querySelectorAll(".button");

    // Site-wide elements for theme and navigation
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');

    // Calculator state variables
    let currentInput = '0'; // The number currently being entered or the result
    let previousValue = null; // Stores the first operand for binary operations
    let operator = null;    // Stores the selected operator (+, -, ×, ÷, ^)
    let awaitingNewOperand = false; // Flag to indicate if we're expecting the next number
    let isCalculated = false; // Flag to know if a calculation has just happened (for continuous operations)

    // --- Theme Logic ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
    } else {
        document.body.classList.add('light-mode');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');

        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark-mode');
        } else {
            localStorage.setItem('theme', 'light-mode');
        }
    });

    // --- Hamburger Menu Logic ---
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('show');
            hamburger.classList.toggle('open');
        });

        document.addEventListener('click', (event) => {
            if (!nav.contains(event.target) && !hamburger.contains(event.target) && nav.classList.contains('show')) {
                nav.classList.remove('show');
                hamburger.classList.remove('open');
            }
        });
    }

    // --- Calculator Core Logic ---

    // Initial display update
    updateDisplay();

    function updateDisplay() {
        // Build the expression string for the input display
        let exprString = '';
        if (previousValue !== null) {
            exprString += formatNumber(previousValue);
            if (operator) {
                exprString += ` ${operator}`;
            }
            if (!awaitingNewOperand && currentInput !== '0') {
                 // Only append currentInput to expression if it's the second operand being typed
                exprString += ` ${currentInput}`;
            }
        }
        inputDisplay.textContent = exprString;
        outputDisplay.textContent = currentInput;
    }

    // Helper to format numbers for display (avoiding excessive decimals)
    function formatNumber(num) {
        if (!Number.isFinite(num)) {
            return 'Error';
        }
        // Limit floating point precision for display, but keep significant digits
        return parseFloat(num.toPrecision(12)).toString();
    }

    function resetCalculatorState() {
        currentInput = '0';
        previousValue = null;
        operator = null;
        awaitingNewOperand = false;
        isCalculated = false;
    }

    function handleNumber(num) {
        if (currentInput === 'Error' || currentInput.startsWith('Error:')) {
            resetCalculatorState(); // Clear error on new number input
        }

        if (awaitingNewOperand) {
            currentInput = num;
            awaitingNewOperand = false;
            isCalculated = false; // A new number means we're starting a new part of calculation
        } else {
            if (currentInput === '0' && num !== '.') { // Prevent multiple leading zeros unless it's "0."
                currentInput = num;
            } else if (currentInput.length < 15) { // Keep reasonable length for current input
                currentInput += num;
            }
        }
        updateDisplay();
    }

    function handleDecimal() {
        if (currentInput === 'Error' || currentInput.startsWith('Error:')) {
            resetCalculatorState();
        }
        if (awaitingNewOperand) {
            currentInput = '0.';
            awaitingNewOperand = false;
            isCalculated = false;
        } else if (!currentInput.includes('.')) {
            currentInput += '.';
        }
        updateDisplay();
    }

    function handleOperator(nextOperator) {
        if (currentInput === 'Error' || currentInput.startsWith('Error:')) return;

        const inputValue = parseFloat(currentInput);

        if (previousValue === null && !isNaN(inputValue)) {
            previousValue = inputValue;
        } else if (operator) {
            // Perform calculation if there's a previous value and an operator
            let result = calculate(previousValue, inputValue, operator);
            if (typeof result === 'string' && result.startsWith('Error')) {
                currentInput = result;
                resetCalculatorState(); // Reset on error
                updateDisplay();
                return;
            }
            previousValue = result;
            currentInput = formatNumber(result); // Show intermediate result on output display
        }

        operator = nextOperator;
        awaitingNewOperand = true;
        isCalculated = false; // Awaiting next operand, not a final calculation
        updateDisplay();
    }

    function handleEquals() {
        if (currentInput === 'Error' || currentInput.startsWith('Error:')) {
            clearAll();
            return;
        }

        if (previousValue === null || operator === null) {
            // If only a number entered or no operator, just display the number
            isCalculated = true;
            updateDisplay();
            return;
        }

        const inputValue = parseFloat(currentInput);
        let result = calculate(previousValue, inputValue, operator);

        if (typeof result === 'string' && result.startsWith('Error')) {
            currentInput = result;
        } else {
            currentInput = formatNumber(result);
        }

        // Reset for next operation, but keep current result
        previousValue = null;
        operator = null;
        awaitingNewOperand = true;
        isCalculated = true; // Mark that a final calculation has occurred
        updateDisplay();
    }

    // Core calculation logic
    function calculate(num1, num2, op) {
        if (isNaN(num1) || isNaN(num2)) return 'Error: Invalid Input';

        switch (op) {
            case '+': return num1 + num2;
            case '-': return num1 - num2;
            case '×': return num1 * num2;
            case '÷':
                if (num2 === 0) return 'Error: Div by 0';
                return num1 / num2;
            case '^': return Math.pow(num1, num2); // Power operation
            default: return num2; // Fallback, should not be reached with proper operator handling
        }
    }

    function handleFactorial() {
        if (currentInput === 'Error' || currentInput.startsWith('Error:')) {
            resetCalculatorState();
            return;
        }
        const num = parseFloat(currentInput);
        if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
            currentInput = 'Error: Invalid Fact';
        } else if (num > 20) { // Max factorial for standard JS Number precision
            currentInput = 'Error: Too Large';
        } else {
            let result = 1;
            for (let i = 2; i <= num; i++) {
                result *= i;
            }
            currentInput = formatNumber(result);
        }
        previousValue = null; // Clear previous state as this is a unary op
        operator = null;
        awaitingNewOperand = true; // Ready for new input
        isCalculated = true;
        updateDisplay();
    }

    function clearAll() {
        resetCalculatorState();
        updateDisplay();
    }

    function deleteLastChar() {
        if (currentInput === 'Error' || currentInput.startsWith('Error:')) {
            clearAll();
            return;
        }

        if (isCalculated) { // If a result is displayed, DEL should clear everything
            clearAll();
            return;
        }

        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        updateDisplay();
    }

    // Add event listeners to all calculator buttons
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent.trim();
            button.classList.add('pressed'); // Add pressed animation class
            setTimeout(() => button.classList.remove('pressed'), 150); // Remove after short delay

            if (button.classList.contains('number-btn')) {
                handleNumber(value);
            } else if (button.classList.contains('dot-btn')) {
                handleDecimal();
            } else if (button.classList.contains('operation-btn-main')) {
                handleOperator(value);
            } else if (button.classList.contains('equals-btn-main')) {
                handleEquals();
            } else if (button.classList.contains('specific-ac-btn')) {
                clearAll();
            } else if (button.classList.contains('specific-del-btn')) {
                deleteLastChar();
            } else if (button.classList.contains('scientific-btn')) {
                if (value === 'x!') {
                    handleFactorial();
                } else if (value === '^') {
                    handleOperator('^'); // Power is a binary operator
                }
            }
        });
    });
}); // End DOMContentLoaded