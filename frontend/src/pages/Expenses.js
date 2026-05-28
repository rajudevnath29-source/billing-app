import { useEffect, useState } from "react";

import axios from "axios";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");

  const [category, setCategory] = useState("");

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const token = localStorage.getItem("token");

  // ====================================
  // LOAD
  // ====================================

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/expenses",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setExpenses(res.data.expenses);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ====================================
  // CREATE
  // ====================================

  const addExpense = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/expenses",

        {
          title,
          category,
          amount,
          note,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Expense Added");

      setTitle("");
      setCategory("");
      setAmount("");
      setNote("");

      fetchExpenses();
    } catch (error) {
      console.log(error);
    }
  };

  // ====================================
  // DELETE
  // ====================================

  const deleteExpense = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/expenses/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchExpenses();
    } catch (error) {
      console.log(error);
    }
  };

  // ====================================
  // TOTAL
  // ====================================

  const totalExpense = expenses.reduce(
    (sum, exp) => sum + exp.amount,

    0,
  );

  return (
    <div style={page}>
      <h1>💸 Expense Module</h1>

      {/* FORM */}

      <div style={formBox}>
        <input
          placeholder="Expense Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

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

        <button onClick={addExpense}>Add Expense</button>
      </div>

      {/* TOTAL */}

      <div style={totalCard}>
        <h2>Total Expense</h2>

        <h1>₹ {totalExpense}</h1>
      </div>

      {/* TABLE */}

      <table style={table}>
        <thead>
          <tr>
            <th>Title</th>

            <th>Category</th>

            <th>Amount</th>

            <th>Note</th>

            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((exp) => (
            <tr key={exp._id}>
              <td>{exp.title}</td>

              <td>{exp.category}</td>

              <td>₹ {exp.amount}</td>

              <td>{exp.note}</td>

              <td>
                <button onClick={() => deleteExpense(exp._id)}>❌</button>
              </td>
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
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 10,
  marginTop: 20,
  marginBottom: 20,
};

const totalCard = {
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
