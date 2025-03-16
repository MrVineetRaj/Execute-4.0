import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Budget from "@/models/budget"; // Make sure you have a Budget model
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Get budgets
export async function GET() {
  try {
    await connectToDatabase();
    const budgets = await Budget.findOne({}); // Fetch the stored budgets
    return NextResponse.json(budgets || {});
  } catch (error) {
    console.error("Get budgets error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update budgets
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newBudgets = await req.json();
    await connectToDatabase();

    // Update or create a budget record
    const updatedBudget = await Budget.findOneAndUpdate(
      {},
      { $set: newBudgets },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Budget updated!", updatedBudget });
  } catch (error) {
    console.error("Update budget error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
