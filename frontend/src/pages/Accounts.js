import { useEffect, useState } from "react";

import axios from "axios";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);

  const [account_name, setAccountName] = useState("");

  const [account_type, setAccountType] = useState("CASH");

  const [balance, setBalance] = useState("");

  const token = localStorage.getItem("token");

  // ====================================
  // LOAD
  // ====================================

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/accounts",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAccounts(res.data.accounts);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // ====================================
  // CREATE
  // ====================================

  const createAccount = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/accounts",

        {
          account_name,

          account_type,

          balance,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Account Created");

      setAccountName("");
      setBalance("");

      fetchAccounts();
    } catch (error) {
      console.log(error);
    }
  };

  // ====================================
  // TOTALS
  // ====================================

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + acc.balance,

    0,
  );

  return (
    <div style={page}>
      <h1>🏦 Bank / Cash Accounts</h1>

      {/* FORM */}

      <div style={formBox}>
        <input
          placeholder="Account Name"
          value={account_name}
          onChange={(e) => setAccountName(e.target.value)}
        />

        <select
          value={account_type}
          onChange={(e) => setAccountType(e.target.value)}
        >
          <option value="CASH">CASH</option>

          <option value="BANK">BANK</option>
        </select>

        <input
          type="number"
          placeholder="Opening Balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />

        <button onClick={createAccount}>Create</button>
      </div>

      {/* TOTAL */}

      <div style={card}>
        <h2>Total Balance</h2>

        <h1>₹ {totalBalance.toFixed(2)}</h1>
      </div>

      {/* TABLE */}

      <table style={table} className="app-table">
        <thead>
          <tr>
            <th>Account</th>

            <th>Type</th>

            <th>Balance</th>
          </tr>
        </thead>

        <tbody>
          {accounts.map((acc) => (
            <tr key={acc._id} className="table-row">
              <td>{acc.account_name}</td>

              <td>{acc.account_type}</td>

              <td>₹ {acc.balance}</td>
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
  gridTemplateColumns: "2fr 1fr 1fr 1fr",
  gap: 10,
  marginBottom: 20,
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
};
