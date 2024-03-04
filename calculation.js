var damageData = [ [], [], [], [], [], [], [], [], [], [], ];
var labels = [];
var dmgChart;
var sortChart = false;
var simulate = false;
var shots = 0;
var btm = 0;


const getStats = (array) => {
    const mean = array.reduce((a, b) => a + b) / array.length
    const sd = Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / array.length)
    return { mean, sd }
}

const sub = (count, sides) => {
    const data = []
    if (count > 1) {
        const calculated = sub(count-1, sides);
        for (let calcI = 0; calcI < calculated.length; calcI++) {
            for (let sideI = 1; sideI <= sides; sideI++) {
                data.push(calculated[calcI] + sideI);
            }
        }
    } else if (count == 1) {
        for (let i = 1; i <= sides; i++) {
            data.push(i);
        }
    }
    return data;
}

const getDiceArray = (count, sides) => {
    return sub(count, sides).sort();
}

const rollDice = (count, sides) => {
    let sum = 0;
    for (let i = 0; i < count; i++) {
        sum += Math.floor(Math.random() * sides) + 1;
    }
    return sum;
}

const calculatePureDamage = () => {
    const countElement = document.getElementById('count');
    const sidesElement = document.getElementById('sides');
    const count = parseInt(countElement.value);
    const sides = parseInt(sidesElement.value);
    return rollDice(count,sides);
}

const calculateHitLocDamage = (hitLoc, pureDamage) => {
    const headElement = document.getElementById('head');
    const torsoElement = document.getElementById('torso');
    const rightArmElement = document.getElementById('rightArm');
    const leftArmElement = document.getElementById('leftArm');
    const rightLegElement = document.getElementById('rightLeg');
    const leftLegElement = document.getElementById('leftLeg');

    const head = parseInt(headElement.value);
    const torso = parseInt(torsoElement.value);
    const rightArm = parseInt(rightArmElement.value);
    const leftArm = parseInt(leftArmElement.value);
    const rightLeg = parseInt(rightLegElement.value);
    const leftLeg = parseInt(leftLegElement.value);

    let returnDamage;
    switch (hitLoc) {
        case 1:
            returnDamage = pureDamage - head;
            break;
        case 2:
            returnDamage = pureDamage - torso;
            break;
        case 3:
        case 4:
            returnDamage = pureDamage - rightArm;
            break;
        case 5:
        case 6:
            returnDamage = pureDamage - leftArm;
            break;
        case 7:
        case 8:
            returnDamage = pureDamage - rightLeg;
            break;
        case 9:
        case 10:
            returnDamage = pureDamage - leftLeg;
            break;
        default:
            returnDamage = 0;
    }
    return Math.max(0, returnDamage - btm);
}

const pushNewData = (data, value) => {
    if (simulate) {
        if (data.length == 0) {
            data.push(value);
        } else {
            data.push(data[data.length - 1] + value);
        }
    } else {
        data.push(value);
    }
}

const onAttack = () => {
    const resultElement = document.getElementById('result');
    const rangeElement = document.getElementById('range');
    const attackElement = document.getElementById('attack');
    
    const range = parseInt(rangeElement.value);
    const attack = parseInt(attackElement.value);
    
    /* Attack Calculation Goes Here */
    let attackDice = rollDice(1,10) + attack;
    // attackDice -= Math.floor(shots/2);
    attackDice -= (2*shots)-1;
    let curData = damageData[shots-1];

    if (attackDice >= range) {
        resultElement.innerText += `Hit: ${attackDice}>${range}; `;
        let totalDamage = 0;
        for (let i = 0; i < shots; i++) {
            const hitLoc = rollDice(1,10);
            const pureDamage = calculatePureDamage();
            const remainDamage = calculateHitLocDamage(hitLoc, pureDamage);
            totalDamage += remainDamage;
            resultElement.innerText += `(${hitLoc}: ${pureDamage}) `;
        }
        pushNewData(curData, totalDamage);
        resultElement.innerText += `Total Dmg: ${totalDamage}\n`;
    } else {
        pushNewData(curData, 0);
        resultElement.innerText += `Miss: ${attackDice}<${range}; \n`;
    }
}

const updateChart = () => {
    let max = 0;
    for (let i = 0; i < damageData.length; i++) {
        if (sortChart) {
            damageData[i].sort((a,b) => (a>b));
        }
        max = Math.max(max, damageData[i].length)
    }
    for (let i = labels.length-1; i < max-1; i++) {
        labels.push(i+1);
    }
    dmgChart.update();
}

const rangeCheckerUpdate = () => {
    const rangeCheckerElement = document.getElementById('rangeChecker');
    const closeValueElement = document.getElementById('closeValue');
    const mediumValueElement = document.getElementById('mediumValue');
    const longValueElement = document.getElementById('longValue');
    
    const rangeVal = parseInt(rangeCheckerElement.value);
    closeValueElement.value = Math.round(rangeVal / 4) + " ft";
    mediumValueElement.value = Math.round(rangeVal / 2) + " ft";
    longValueElement.value = rangeVal + " ft";
}

window.onload = () => {
    const rangeChecker = document.getElementById('rangeChecker');
    rangeChecker.onchange = rangeCheckerUpdate;
    
    const btmElement = document.getElementById('btm');
    btm = btmElement.value;
    btmElement.onchange = () => { btm = btmElement.value; };
    
    const shotsElement = document.getElementById('shots');
    shots = shotsElement.value;
    console.log(shots);
    shotsElement.onchange = () => { shots = shotsElement.value; };

    const simulateElement = document.getElementById('simulate');
    simulate = simulateElement.checked;
    simulateElement.onchange = () => { simulate = simulateElement.checked; };

    const sortChartElement = document.getElementById('sortChart');
    sortChart = sortChartElement.checked;
    sortChartElement.onchange = () => { sortChart = sortChartElement.checked; };

    const attackButton = document.getElementById('attackButton');
    const bulkButton = document.getElementById('bulkButton');
    attackButton.onclick = () => { onAttack(); updateChart(); }
    bulkButton.onclick = () => {
        for (let i = 0; i < 100; i++) {
            onAttack();
        }
        updateChart();
    }
    
    dataset = [];
    for (let i = 0; i < damageData.length; i++) {
        dataset.push({
            label: i+1,
            data: damageData[i],
            borderWidth: 1
        });
    }
    
    const chart = document.getElementById('myChart');
    
    dmgChart = new Chart(chart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: dataset
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 50
                }
            }
        }
    });
}