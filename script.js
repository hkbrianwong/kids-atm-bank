let enteredPin = "";
let savedPin = localStorage.getItem("pin") || null;
let balance = parseFloat(localStorage.getItem("balance")) || 0;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

document.getElementById("date").value = new Date().toISOString().split('T')[0];

function enterPin(num) {
    if (enteredPin.length < 4) {
        enteredPin += num;
        document.getElementById("pin-input").value = enteredPin.replace(/./g, "*");
    }
}

function clearPin() {
    enteredPin = "";
    document.getElementById("pin-input").value = "";
}

function submitPin() {
    if (!savedPin) {
        savedPin = enteredPin;
        localStorage.setItem("pin", savedPin);
        alert("PIN set successfully!");
    }

    if (enteredPin === "0000") {
        openAdminScreen();
    } else if (enteredPin === savedPin) {
        openAtmScreen();
    } else {
        alert("Wrong code! Try again!");
        clearPin();
    }
}

function addMoney() {
    let amount = parseFloat(document.getElementById("amount").value);
    let description = document.getElementById("description").value.trim();
    let date = document.getElementById("date").value;

    if (amount > 0) {
        balance += amount;
        transactions.push({ type: "Deposit", amount, description, date });
        saveData();
        alert("Money added successfully!");
        document.getElementById("amount").value = "";
        document.getElementById("description").value = "";
    } else {
        alert("Please enter a valid amount.");
    }
}

function subtractMoney() {
    let amount = parseFloat(document.getElementById("amount").value);
    let description = document.getElementById("description").value.trim();
    let date = document.getElementById("date").value;

    if (amount > 0 && amount <= balance) {
        balance -= amount;
        transactions.push({ type: "Withdrawal", amount, description, date });
        saveData();
        alert("Money withdrawn successfully!");
        document.getElementById("amount").value = "";
        document.getElementById("description").value = "";
    } else {
        alert("Invalid amount or insufficient balance.");
    }
}

function undoLastTransaction() {
    if (transactions.length > 0) {
        let lastTransaction = transactions.pop();
        balance += lastTransaction.type === "Deposit" ? -lastTransaction.amount : lastTransaction.amount;
        saveData();
        alert("Last transaction undone.");
    } else {
        alert("No transactions to undo.");
    }
}

function saveData() {
    localStorage.setItem("balance", balance);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    document.getElementById("balance").innerText = balance.toFixed(2);
    updateHistory();
    updateWeeklySummary();
    updateMonthlySummary();
}

function updateHistory() {
    let historyContainer = document.getElementById("history");
    historyContainer.innerHTML = "";
    transactions.forEach(trx => {
        let item = document.createElement("p");
        item.innerText = `${trx.date} - ${trx.type}: $${trx.amount.toFixed(2)}${trx.description ? ` (${trx.description})` : ''}`;
        historyContainer.appendChild(item);
    });
}

function updateWeeklySummary() {
    let summaryContainer = document.getElementById("weekly-summary");
    summaryContainer.innerHTML = "";

    let weeklyData = {};
    transactions.forEach(trx => {
        let date = new Date(trx.date);
        let weekNumber = getWeekNumber(date);
        let weekStartDate = getWeekStartDate(date);
        if (!weeklyData[weekNumber]) {
            weeklyData[weekNumber] = { deposit: 0, spend: 0, startDate: weekStartDate };
        }
        if (trx.type === "Deposit") {
            weeklyData[weekNumber].deposit += trx.amount;
        } else {
            weeklyData[weekNumber].spend += trx.amount;
        }
    });

    let sortedWeeks = Object.keys(weeklyData).sort((a, b) => b - a);

    sortedWeeks.forEach(week => {
        let data = weeklyData[week];
        let summaryItem = document.createElement("p");
        summaryItem.innerHTML = `Week ${week} (Start: ${data.startDate}): Deposited <strong>$${data.deposit.toFixed(2)}</strong>, Spent <strong>$${data.spend.toFixed(2)}</strong>`;
        summaryContainer.appendChild(summaryItem);
    });
}

function updateMonthlySummary() {
    let summaryContainer = document.getElementById("monthly-summary");
    summaryContainer.innerHTML = "";

    let monthlyData = {};
    transactions.forEach(trx => {
        let date = new Date(trx.date);
        let monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { deposit: 0, spend: 0 };
        }
        if (trx.type === "Deposit") {
            monthlyData[monthKey].deposit += trx.amount;
        } else {
            monthlyData[monthKey].spend += trx.amount;
        }
    });

    for (let month in monthlyData) {
        let summaryItem = document.createElement("p");
        summaryItem.innerText = `Month ${month}: Deposited $${monthlyData[month].deposit.toFixed(2)}, Spent $${monthlyData[month].spend.toFixed(2)}`;
        summaryContainer.appendChild(summaryItem);
    }
}

function getWeekNumber(date) {
    let startOfYear = new Date(date.getFullYear(), 0, 1);
    let pastDaysOfYear = (date - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

function getWeekStartDate(date) {
    let dayOfWeek = date.getDay();
    let startDate = new Date(date);
    startDate.setDate(startDate.getDate() - dayOfWeek);
    return startDate.toISOString().split('T')[0];
}

function openAtmScreen() {
    hideAllScreens();
    document.getElementById("atm-screen").classList.remove("hidden");
    document.getElementById("balance").innerText = balance.toFixed(2);
    updateWeeklySummary();
    updateMonthlySummary();
}

function openAdminScreen() {
    hideAllScreens();
    document.getElementById("admin-screen").classList.remove("hidden");
}

function endSession() {
    hideAllScreens();
    document.getElementById("pin-screen").classList.remove("hidden");
    clearPin();
}

function hideAllScreens() {
    document.getElementById("pin-screen").classList.add("hidden");
    document.getElementById("atm-screen").classList.add("hidden");
    document.getElementById("admin-screen").classList.add("hidden");
}

function resetAllData() {
    if (confirm("Are you sure you want to reset all data?")) {
        localStorage.clear();
        balance = 0;
        transactions = [];
        savedPin = null;
        alert("All data has been reset!");
        location.reload();
    }
}
