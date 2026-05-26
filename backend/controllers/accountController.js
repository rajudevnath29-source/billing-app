const Account = require("../models/Account");

const createAccount = async (req, res) => {
  try {
    const { account_name, account_type, balance } = req.body;

    const account = await Account.create({
      account_name,
      account_type,
      balance,
      created_by: req.user.id,
    });

    res.status(201).json({
      message: "Account created",
      account,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().sort({
      createdAt: -1,
    });

    res.json({
      accounts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching accounts",
      error: error.message,
    });
  }
};

module.exports = { createAccount, getAccounts };
