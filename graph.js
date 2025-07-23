document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('graph');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawGraph();
    }
    window.addEventListener('resize', resizeCanvas);

    let xMin = -10, xMax = 10, yMin = -10, yMax = 10, step = 1;
    let functions = [];

    const functionInput = document.getElementById('functionInput');
    const colorPicker = document.getElementById('colorPicker');
    const addFunctionBtn = document.getElementById('addFunction');
    const functionTableBody = document.getElementById('functionTableBody');
    const updateGraphBtn = document.getElementById('updateGraph');
    const xMinInput = document.getElementById('xMin');
    const xMaxInput = document.getElementById('xMax');
    const yMinInput = document.getElementById('yMin');
    const yMaxInput = document.getElementById('yMax');
    const stepInput = document.getElementById('step');
    const presetButtons = document.querySelectorAll('.preset-buttons button');
    const degreeModeCheckbox = document.getElementById('degreeMode');

    updateGraphBtn.addEventListener('click', function() {
        xMin = parseFloat(xMinInput.value);
        xMax = parseFloat(xMaxInput.value);
        yMin = parseFloat(yMinInput.value);
        yMax = parseFloat(yMaxInput.value);
        step = parseFloat(stepInput.value);
        drawGraph();
    });

    addFunctionBtn.addEventListener('click', function() { addFunction(); });
    functionInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') addFunction(); });

    function addFunction() {
        const expression = functionInput.value.trim();
        if (expression) {
            const processedExpr = expression.replace(/\^/g, '**').replace(/²/g, '**2').replace(/³/g, '**3');
            const color = colorPicker.value;
            functions.push({ expression: processedExpr, color });
            updateFunctionList();
            drawGraph();
            functionInput.value = '';
        }
    }

    presetButtons.forEach(button => {
        button.addEventListener('click', function() { functionInput.value = button.dataset.expr; });
    });

    functionTableBody.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            const index = parseInt(e.target.dataset.index);
            functions.splice(index, 1);
            updateFunctionList();
            drawGraph();
        }
    });

    function updateFunctionList() {
        functionTableBody.innerHTML = '';
        functions.forEach((func, index) => {
            const row = document.createElement('tr');
            const exprCell = document.createElement('td');
            exprCell.textContent = func.expression.replace(/\*\*/g, '^').replace(/Math\./g, '');
            const colorCell = document.createElement('td');
            const colorBox = document.createElement('div');
            colorBox.style.width = '20px';
            colorBox.style.height = '20px';
            colorBox.style.backgroundColor = func.color;
            colorBox.style.display = 'inline-block';
            colorBox.style.marginRight = '5px';
            colorCell.appendChild(colorBox);
            colorCell.appendChild(document.createTextNode(func.color));
            const actionCell = document.createElement('td');
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.classList.add('remove-btn');
            removeBtn.dataset.index = index;
            actionCell.appendChild(removeBtn);
            row.appendChild(exprCell); row.appendChild(colorCell); row.appendChild(actionCell);
            functionTableBody.appendChild(row);
        });
    }

    function drawGraph() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawAxes();
        functions.forEach(func => { plotFunction(func.expression, func.color); });
    }

    function xToPixel(x) { return ((x - xMin) / (xMax - xMin)) * canvas.width; }
    function yToPixel(y) { return canvas.height - ((y - yMin) / (yMax - yMin)) * canvas.height; }

    function drawAxes() {
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
        const yAxisPixel = yToPixel(0);
        if (yAxisPixel >= 0 && yAxisPixel <= canvas.height) {
            ctx.beginPath(); ctx.moveTo(0, yAxisPixel); ctx.lineTo(canvas.width, yAxisPixel); ctx.stroke();
            const xTickInterval = getTickInterval(xMax - xMin);
            for (let x = Math.ceil(xMin / xTickInterval) * xTickInterval; x <= xMax; x += xTickInterval) {
                if (x === 0) continue;
                const xPixel = xToPixel(x);
                ctx.beginPath(); ctx.moveTo(xPixel, yAxisPixel - 5); ctx.lineTo(xPixel, yAxisPixel + 5); ctx.stroke();
                ctx.font = '10px Arial'; ctx.fillStyle = '#000'; ctx.textAlign = 'center';
                ctx.fillText(degreeModeCheckbox.checked ? `${x}°` : x.toFixed(1), xPixel, yAxisPixel + 20);
            }
        }
        const xAxisPixel = xToPixel(0);
        if (xAxisPixel >= 0 && xAxisPixel <= canvas.width) {
            ctx.beginPath(); ctx.moveTo(xAxisPixel, 0); ctx.lineTo(xAxisPixel, canvas.height); ctx.stroke();
            const yTickInterval = getTickInterval(yMax - yMin);
            for (let y = Math.ceil(yMin / yTickInterval) * yTickInterval; y <= yMax; y += yTickInterval) {
                if (y === 0) continue;
                const yPixel = yToPixel(y);
                ctx.beginPath(); ctx.moveTo(xAxisPixel - 5, yPixel); ctx.lineTo(xAxisPixel + 5, yPixel); ctx.stroke();
                ctx.font = '10px Arial'; ctx.fillStyle = '#000'; ctx.textAlign = 'right';
                ctx.fillText(y.toFixed(1), xAxisPixel - 10, yPixel + 3);
            }
        }
    }

    function drawGrid() {
        ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
        const xGridInterval = getTickInterval(xMax - xMin);
        for (let x = Math.ceil(xMin / xGridInterval) * xGridInterval; x <= xMax; x += xGridInterval) {
            if (x === 0) continue;
            const xPixel = xToPixel(x);
            ctx.beginPath(); ctx.moveTo(xPixel, 0); ctx.lineTo(xPixel, canvas.height); ctx.stroke();
        }
        const yGridInterval = getTickInterval(yMax - yMin);
        for (let y = Math.ceil(yMin / yGridInterval) * yGridInterval; y <= yMax; y += yGridInterval) {
            if (y === 0) continue;
            const yPixel = yToPixel(y);
            ctx.beginPath(); ctx.moveTo(0, yPixel); ctx.lineTo(canvas.width, yPixel); ctx.stroke();
        }
    }

    function getTickInterval(range) {
        const log10 = Math.log10(range);
        const exponent = Math.floor(log10);
        const fraction = log10 - exponent;
        let interval;
        if (fraction < Math.log10(2)) interval = Math.pow(10, exponent) * 1;
        else if (fraction < Math.log10(5)) interval = Math.pow(10, exponent) * 2;
        else interval = Math.pow(10, exponent) * 5;
        if (range / interval > 10) interval *= 2;
        else if (range / interval < 5) interval /= 2;
        return interval;
    }

    function plotFunction(expression, color) {
        try {
            let expr = expression.replace(/sin|cos|tan|log|exp|sqrt|abs/g, m => `Math.${m}`);
            const degreeMode = degreeModeCheckbox.checked;
            const fn = new Function('x', `
                if (${degreeMode}) x = x * Math.PI / 180;
                return ${expr};
            `);
            ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
            let firstPoint = true;
            for (let x = xMin; x <= xMax; x += step) {
                try {
                    const y = fn(x);
                    if (isNaN(y) || !isFinite(y)) { firstPoint = true; continue; }
                    const xPixel = xToPixel(x);
                    const yPixel = yToPixel(y);
                    if (firstPoint) { ctx.moveTo(xPixel, yPixel); firstPoint = false; }
                    else { ctx.lineTo(xPixel, yPixel); }
                } catch { firstPoint = true; }
            }
            ctx.stroke();
        } catch (e) { console.error(`Error plotting function: ${expression}`, e); }
    }

    resizeCanvas();
    
    updateFunctionList();
    drawGraph();
});
