import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
});

const Budget = mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);

export default Budget;
