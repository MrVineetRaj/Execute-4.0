"use client"

import { ITransaction } from "@/models/transaction"
import { useEffect, useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"


export function ExpenseBreakdown() {
  const [data, setData] = useState<ITransaction[]>([])

  useEffect(() => {
    fetchExpenses()
  }, [])

  async function fetchExpenses() {
    try {
      const response = await fetch("/api/transactions")
      const result = await response.json()
      
      if (!result.transactions) return

      // Filter only expenses
      const expenses = result.transactions.filter((t:ITransaction) => t.type === "expense")

      // Group by category
      const groupedExpenses: { [key: string]: number } = {}
      expenses.forEach((expense:ITransaction) => {
        if (!groupedExpenses[expense.category]) {
          groupedExpenses[expense.category] = 0
        }
        groupedExpenses[expense.category] += Math.abs(expense.amount)
      })

      // Convert to chart format
      const expenseData = Object.keys(groupedExpenses).map((category, index) => ({
        name: category,
        value: groupedExpenses[category],
        color: chartColors[index % chartColors.length], // Cycle through colors
      }))

      setData(expenseData)
    } catch (error) {
      console.error("Error fetching expenses:", error)
    }
  }

  const chartColors = ["#ef4444", "#f97316", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
