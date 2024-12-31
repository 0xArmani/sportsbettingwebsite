let history = JSON.parse(localStorage.getItem("bettingHistory")) || [];

function submitEntry() {
    const currentBalance = parseFloat(document.getElementById("balance").value);
    const withdrawalAmount = parseFloat(document.getElementById("withdrawal").value);

    if (isNaN(currentBalance)) {
        alert("Please enter a valid balance.");
        return;
    }

    const actualWithdrawal = isNaN(withdrawalAmount) ? 0 : withdrawalAmount;

    let profitLoss = 0;
    if (history.length > 0) {
        const lastEntry = history[history.length - 1];
        profitLoss = currentBalance - lastEntry.balance - actualWithdrawal;
    }

    history.push({
        date: new Date().toLocaleDateString(),
        balance: currentBalance,
        profitLoss: profitLoss,
        withdrawal: actualWithdrawal
    });

    localStorage.setItem("bettingHistory", JSON.stringify(history));

    let resultText = "";
    let resultClass = "";

    if (profitLoss > 0) {
        resultText = `Profit: $${profitLoss.toFixed(2)}`;
        resultClass = "profit";
    } else if (profitLoss < 0) {
        resultText = `Loss: $${Math.abs(profitLoss).toFixed(2)}`;
        resultClass = "loss";
    } else {
        resultText = "No change in balance.";
        resultClass = "";
    }

    document.getElementById("result").innerText = resultText;
    document.getElementById("result").className = `result ${resultClass}`;

    displayHistory();
    updateGraph();
}

function displayHistory() {
    const historyTable = document.getElementById("history");
    if (history.length === 0) {
        historyTable.innerHTML = "<p>No entries yet.</p>";
        return;
    }

    let tableHTML = `<table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Balance</th>
                                <th>Profit/Loss</th>
                                <th>Withdrawal</th>
                            </tr>
                        </thead>
                        <tbody>`;

    history.forEach(entry => {
        tableHTML += `<tr>
                        <td>${entry.date}</td>
                        <td>$${entry.balance.toFixed(2)}</td>
                        <td class="${entry.profitLoss >= 0 ? 'profit' : 'loss'}">$${entry.profitLoss.toFixed(2)}</td>
                        <td class="withdrawal">$${entry.withdrawal.toFixed(2)}</td>
                    </tr>`;
    });

    tableHTML += "</tbody></table>";

    historyTable.innerHTML = tableHTML;
}

function updateGraph() {
    const dates = history.map(entry => entry.date);
    const profits = history.map(entry => entry.profitLoss);

    const canvas = document.getElementById("profitChart");
    const ctx = canvas.getContext("2d");

    if (window.profitChart instanceof Chart) {
        window.profitChart.destroy();
    }

    window.profitChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Profit/Loss',
                data: profits,
                borderColor: profits.map(p => p >= 0 ? 'green' : 'red'),
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sports Betting Profit/Loss Over Time'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            }
        }
    });
}

window.onload = function() {
    displayHistory();
    updateGraph();
};
