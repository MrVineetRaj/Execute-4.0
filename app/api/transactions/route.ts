import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Transaction } from "@/models/transaction";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Get all transactions for the authenticated user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const category = url.searchParams.get("category");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // Build query
    const query: any = { userId };
    // console.log(startDate, endDate);
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(parseInt(startDate));
      if (endDate) query.date.$lte = new Date(parseInt(endDate));
    }

    console.log("query ->", query);
    // Get transactions
    const transactions = await Transaction.find(query).sort({ date: -1 });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new transaction
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { type, amount, category, date, description } = await req.json();

    // Validate input
    if (!type || !amount || !category || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Fetch all transactions for this user and category
    const userTransactions = await Transaction.find({ userId, category });

    // Calculate total spent
    const totalSpent = userTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Define category budgets (modify as needed)
    let budgets = { food: 5000, travel: 3000, shopping: 8000 };

    // Check budget limit
    if (totalSpent + Math.abs(Number(amount)) > (budgets[category] || 0)) {
      return NextResponse.json(
        { message: `⚠️ Warning! Budget for ${category} exceeded!` },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = new Transaction({
      userId,
      type,
      amount: type === "expense" ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
      category,
      date: new Date(date),
      description,
    });

    await transaction.save();

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
