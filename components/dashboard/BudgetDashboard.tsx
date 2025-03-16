"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "react-hot-toast";

function BudgetDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense",
  });

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, []);

  async function fetchTransactions() {
    try {
      const response = await fetch("/api/transactions");
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }

  async function fetchBudgets() {
    try {
      const response = await fetch("/api/budgets");
      const data = await response.json();
      setBudgets(data.budgets || {});
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  }

  async function addTransaction() {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      toast.error("Please fill all fields!");
      return;
    }

    const transactionData = {
      ...newTransaction,
      amount: Number(newTransaction.amount),
      date: new Date().toISOString(),
    };

    if (checkBudgetExceeded(transactionData.category, transactionData.amount)) return;

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });
      const data = await response.json();

      setTransactions((prev) => [...prev, { ...transactionData, id: data.id || Date.now() }]);
      setNewTransaction({ description: "", amount: "", category: "", type: "expense" });
      toast.success("Transaction added successfully!");
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  }

  function checkBudgetExceeded(category, amount) {
    const totalSpent = transactions
      .filter((t) => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0) + amount;

    if (budgets[category] && totalSpent > budgets[category]) {
      toast.error(`🚨 Budget exceeded for ${category}!`);
      return true;
    }
    return false;
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Budget Dashboard</h1>

      {/* Add Transaction Form */}
      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-bold mb-2">Add Transaction</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Description"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Amount (₹)"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Category (e.g., Food, Travel)"
            value={newTransaction.category}
            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
            className="border p-2 rounded"
          />
          <select
            value={newTransaction.type}
            onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <Button onClick={addTransaction} className="col-span-2">Add Transaction</Button>
        </div>
      </div>

      {/* Transactions List */}
      {transactions.map((transaction, index) => (
        <div key={transaction.id || index} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className={`rounded-full p-2 ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
              {transaction.type === "income" ? <ArrowUp className="h-4 w-4 text-green-600" /> : <ArrowDown className="h-4 w-4 text-red-600" />}
            </div>
            <div>
              <p className="text-sm font-medium">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">{transaction.category}</p>
            </div>
          </div>
          <p className={`text-sm font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
            {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default BudgetDashboard;
