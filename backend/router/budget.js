const express = require("express");
const router = express.Router();

const {
  createOrUpdateBudget,
  listBudgets,
  getBudgetById,
  deleteBudget,
  getCurrentBudget,
} = require("../controller/budget");

// Create or update budget (overall, percentage-based)
router.post("/", createOrUpdateBudget);

// List all budgets for a user: GET /budget?user_id=...
router.get("/", listBudgets);

// Get current month budget + summary: GET /budget/current?user_id=...
router.get("/current", getCurrentBudget);

// Get budget by id with summary
router.get("/:id", getBudgetById);

// Delete budget by id
router.delete("/:id", deleteBudget);

module.exports = router;
