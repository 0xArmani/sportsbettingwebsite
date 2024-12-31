// Retrieve stored history from localStorage
let history = JSON.parse(localStorage.getItem("bettingHistory")) || [];

// Function to submit the balance entry
function submitEntry() {
    const currentBalance = parseFloat(document.getElementById("balance").value);
    const withdrawalAmount = parseFloat(document.getElementById("withdrawal").value);

    // Manually entered date or default to today's date if not provided
    const entryDate = document.getElementById("entryDate").value.trim() || new Date().toISOString().split('T')[0];  // Ensure date format is YYYY-MM-DD

    // Validate the balance input
    if (isNaN(currentBalance)) {
        alert("Please enter a valid balance.");
        return;
    }

    // If the withdrawal amount is negative, treat it as 0 (no withdrawal)
    const actualWithdrawal = isNaN(withdrawalAmount) ? 0 : withdrawalAmount;

    // Calculate profit or loss (compared to the last balance)
    let profitLoss = 0;
    if (history.length > 0) {
        const lastEntry = history[history.length - 1];
        profitLoss = currentBalance - lastEntry.balance - actualWithdrawal; // Subtract withdrawal from profit
    }

    // Save the current balance, profit/loss, and withdrawal to history
    history.push({
        date: entryDate,  // Store the manually entered date
        balance: currentBalance,
        profitLoss: profitLoss,
        withdrawal: actualWithdrawal
    });

    // Store updated history in localStorage
    localStorage.setItem("bettingHistory", JSON.stringify(history));

    // Display result (profit or loss)
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

    // Show result
    document.getElementById("result").innerText = resultText;
    document.getElementById("result").className = `result ${resultClass}`;

    // Update the history table
    displayHistory();

    // Update the graph with new data
    updateGraph();
}

// Function to display the history of bets
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
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>`;

    history.forEach((entry, index) => {
        tableHTML += `<tr>
                        <td>${entry.date}</td>
                        <td>$${entry.balance.toFixed(2)}</td>
                        <td class="${entry.profitLoss >= 0 ? 'profit' : 'loss'}">$${entry.profitLoss.toFixed(2)}</td>
                        <td class="withdrawal">$${entry.withdrawal.toFixed(2)}</td>
                        <td><button onclick="deleteEntry(${index})">Delete</button></td> <!-- Delete button -->
                      </tr>`;
    });

    tableHTML += "</tbody></table>";

    historyTable.innerHTML = tableHTML;
}

// Function to delete an entry
function deleteEntry(index) {
    // Remove the entry from the history array
    history.splice(index, 1);

    // Update the history in localStorage
    localStorage.setItem("bettingHistory", JSON.stringify(history));

    // Update the table and graph after deletion
    displayHistory();
    updateGraph();
}

// Function to update the graph with new data
function updateGraph() {
    const dates = history.map(entry => entry.date);
    const profits = history.map(entry => entry.profitLoss);

    // Log data for debugging
    console.log(dates, profits);

    // Get the canvas context
    const canvas = document.getElementById("profitChart");
    const ctx = canvas.getContext("2d");

    // Destroy previous chart if it exists
    if (window.profitChart instanceof Chart) {
        window.profitChart.destroy(); // Destroy the previous chart
    }

    // Create the graph
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



// Display the history and graph when the page loads
window.onload = function() {
    displayHistory();
    updateGraph();
};
