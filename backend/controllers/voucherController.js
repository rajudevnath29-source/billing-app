const Voucher = require("../models/Voucher");

const Account = require("../models/Account");

// ====================================
// CREATE VOUCHER
// ====================================

const createVoucher = async (req, res) => {
  try {
    const {
      voucher_type,

      account,

      to_account,

      amount,

      note,
    } = req.body;

    // MAIN ACCOUNT

    const mainAccount = await Account.findById(account);

    if (!mainAccount) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // ====================================
    // CREDIT
    // ====================================

    if (voucher_type === "CREDIT") {
      mainAccount.balance += Number(amount);
    }

    // ====================================
    // DEBIT
    // ====================================
    else if (voucher_type === "DEBIT") {
      if (mainAccount.balance < amount) {
        return res.status(400).json({
          message: "Insufficient balance",
        });
      }

      mainAccount.balance -= Number(amount);
    }

    // ====================================
    // TRANSFER
    // ====================================
    else if (voucher_type === "TRANSFER") {
      if (account === to_account) {
        return res.status(400).json({
          message: "From Account and To Account cannot be same",
        });
      }
      const secondAccount = await Account.findById(to_account);

      if (!secondAccount) {
        return res.status(404).json({
          message: "Transfer account not found",
        });
      }

      if (mainAccount.balance < amount) {
        return res.status(400).json({
          message: "Insufficient balance",
        });
      }

      // FROM
      mainAccount.balance -= Number(amount);

      // TO
      secondAccount.balance += Number(amount);

      await secondAccount.save();
    }

    await mainAccount.save();

    // SAVE VOUCHER

    // SAVE VOUCHER

    const voucherData = {
      voucher_type,
      account,
      amount: Number(amount),
      note,
      created_by: req.user.id,
    };

    if (voucher_type === "TRANSFER") {
      voucherData.to_account = to_account;
    }

    const voucher = await Voucher.create(voucherData);

    res.status(201).json({
      message: "Voucher created",

      voucher,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",

      error: error.message,
    });
  }
};

// ====================================
// GET VOUCHERS
// ====================================

const getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find()

      .populate("account")
      .populate("to_account")

      .sort({
        createdAt: -1,
      });

    res.json({
      vouchers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching vouchers",

      error: error.message,
    });
  }
};

// ====================================
// DELETE VOUCHER
// ====================================

const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        message: "Voucher not found",
      });
    }

    const mainAccount = await Account.findById(voucher.account);

    if (voucher.voucher_type === "CREDIT") {
      mainAccount.balance -= Number(voucher.amount);
      await mainAccount.save();
    } else if (voucher.voucher_type === "DEBIT") {
      mainAccount.balance += Number(voucher.amount);
      await mainAccount.save();
    } else if (voucher.voucher_type === "TRANSFER") {
      const secondAccount = await Account.findById(voucher.to_account);

      mainAccount.balance += Number(voucher.amount);
      secondAccount.balance -= Number(voucher.amount);

      await mainAccount.save();
      await secondAccount.save();
    }

    await Voucher.findByIdAndDelete(req.params.id);

    res.json({
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};

module.exports = {
  createVoucher,
  getVouchers,
  deleteVoucher,
};
