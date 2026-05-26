const Expense =
  require("../models/Expense");

// ====================================
// CREATE EXPENSE
// ====================================

const createExpense = async (
  req,
  res
) => {

  try {

    const {
      title,
      category,
      amount,
      note
    } = req.body;

    const expense =
      await Expense.create({

        title,

        category,

        amount,

        note,

        created_by:
          req.user.id

      });

    res.status(201).json({

      message:
        "Expense added",

      expense

    });

  } catch (error) {

    res.status(500).json({

      message:
        "Server Error",

      error:
        error.message

    });

  }

};

// ====================================
// GET EXPENSES
// ====================================

const getExpenses = async (
  req,
  res
) => {

  try {

    const expenses =
      await Expense.find()
        .sort({
          createdAt: -1
        });

    res.json({
      expenses
    });

  } catch (error) {

    res.status(500).json({

      message:
        "Error fetching expenses",

      error:
        error.message

    });

  }

};

// ====================================
// DELETE EXPENSE
// ====================================

const deleteExpense = async (
  req,
  res
) => {

  try {

    await Expense.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Expense deleted"
    });

  } catch (error) {

    res.status(500).json({

      message:
        "Delete failed",

      error:
        error.message

    });

  }

};

module.exports = {

  createExpense,

  getExpenses,

  deleteExpense

};