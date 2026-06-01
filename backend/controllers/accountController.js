const Account = require("../models/Account");
const Voucher = require("../models/Voucher");

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
const deleteAccount = async (req, res) => {
  try {
    const voucherExists = await Voucher.findOne({
      $or: [{ account: req.params.id }, { to_account: req.params.id }],
    });

    if (voucherExists) {
      return res.status(400).json({
        message: "Cannot delete account with vouchers",
      });
    }

    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    await Account.findByIdAndDelete(req.params.id);

    res.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = { createAccount, getAccounts, deleteAccount };
