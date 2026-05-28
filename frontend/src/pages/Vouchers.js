import { useEffect, useState } from "react";

import axios from "axios";

export default function Vouchers() {
  const [accounts, setAccounts] = useState([]);

  const [vouchers, setVouchers] = useState([]);

  const [voucher_type, setVoucherType] = useState("CREDIT");

  const [account, setAccount] = useState("");

  const [to_account, setToAccount] = useState("");

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const token = localStorage.getItem("token");

  // ====================================
  // LOAD
  // ====================================

  const loadData = async () => {
    try {
      const accRes = await axios.get(
        "http://localhost:5000/api/accounts",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAccounts(accRes.data.accounts);

      const vouRes = await axios.get(
        "http://localhost:5000/api/vouchers",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setVouchers(vouRes.data.vouchers);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ====================================
  // CREATE
  // ====================================

  const createVoucher = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/vouchers",

        {
          voucher_type,

          account,

          to_account,

          amount,

          note,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Voucher added");

      setAmount("");
      setNote("");

      loadData();
    } catch (error) {
      alert(error?.response?.data?.message);
    }
  };

  return (
    <div style={page}>
      <h1>💳 Voucher Entry</h1>

      {/* FORM */}

      <div style={formBox}>
        <select
          value={voucher_type}
          onChange={(e) => setVoucherType(e.target.value)}
        >
          <option value="CREDIT">CREDIT</option>

          <option value="DEBIT">DEBIT</option>

          <option value="TRANSFER">TRANSFER</option>
        </select>

        {/* ACCOUNT */}

        <select value={account} onChange={(e) => setAccount(e.target.value)}>
          <option value="">Select Account</option>

          {accounts.map((acc) => (
            <option key={acc._id} value={acc._id}>
              {acc.account_name}

              {" - ₹"}

              {acc.balance}
            </option>
          ))}
        </select>

        {/* TRANSFER */}

        {voucher_type === "TRANSFER" && (
          <select
            value={to_account}
            onChange={(e) => setToAccount(e.target.value)}
          >
            <option value="">To Account</option>

            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.account_name}
              </option>
            ))}
          </select>
        )}

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button onClick={createVoucher}>Save</button>
      </div>

      {/* TABLE */}

      <table style={table}>
        <thead>
          <tr>
            <th>Type</th>

            <th>Account</th>

            <th>To</th>

            <th>Amount</th>

            <th>Note</th>
          </tr>
        </thead>

        <tbody>
          {vouchers.map((vou) => (
            <tr key={vou._id}>
              <td>{vou.voucher_type}</td>

              <td>{vou.account?.account_name}</td>

              <td>{vou.to_account?.account_name}</td>

              <td>₹ {vou.amount}</td>

              <td>{vou.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ====================================
   STYLES
==================================== */

const page = {
  padding: 20,
};

const formBox = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr 2fr 1fr",
  gap: 10,
  marginBottom: 20,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
};
