import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Customers() {

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  // FETCH CUSTOMERS
  const fetchCustomers = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCustomers(res.data.customers);

    } catch (err) {
      console.log(err);
    }

  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // DELETE CUSTOMER
  const deleteCustomer = async (id) => {

    try {

      await axios.delete(
        `http://localhost:5000/api/customers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchCustomers();

    } catch (err) {
      alert("Delete failed");
    }

  };

  // SEARCH
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customer_name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <>

      {/* TOP BAR */}
      <div style={styles.topBar}>

        <h2>👥 Customers</h2>

        <button
          style={styles.primaryBtn}
          onClick={() =>
            navigate("/customers/add")
          }
        >
          ➕ Add Customer
        </button>

      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search customer..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={styles.search}
      />

      {/* TABLE */}
      <table style={styles.table}>

        <thead>

          <tr>

            <th style={styles.th}>Name</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>GST</th>
            <th style={styles.th}>City</th>
            <th style={styles.th}>Balance</th>
            <th style={styles.th}>Action</th>

          </tr>

        </thead>

        <tbody>

          {filteredCustomers.map((customer) => (

            <tr
              key={customer._id}
              className="table-row"
            >

              <td style={styles.td}>
                {customer.customer_name}
              </td>

              <td style={styles.td}>
                {customer.phone}
              </td>

              <td style={styles.td}>
                {customer.gst_number}
              </td>

              <td style={styles.td}>
                {customer.city}
              </td>

              <td style={styles.td}>
                ₹ {customer.opening_balance}
              </td>

              <td style={styles.td}>

                <button
                  style={styles.editBtn}
                  onClick={() =>
                    navigate(
                      `/customers/edit/${customer._id}`
                    )
                  }
                >
                  ✏️
                </button>

                <button
                  style={styles.deleteBtn}
                  onClick={() =>
                    deleteCustomer(customer._id)
                  }
                >
                  ❌
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </>
  );
}

/* ================= STYLES ================= */

const styles = {

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },

  search: {
    padding: 10,
    width: 250,
    marginBottom: 20,
    borderRadius: 6,
    border: "1px solid #ccc"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },

  th: {
    background: "#0f172a",
    color: "#fff",
    padding: 14,
    textAlign: "left"
  },

  td: {
    padding: 14,
    borderBottom: "1px solid #eee"
  },

  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 6,
    cursor: "pointer"
  },

  editBtn: {
    marginRight: 8,
    border: "none",
    padding: 8,
    borderRadius: 5,
    cursor: "pointer"
  },

  deleteBtn: {
    border: "none",
    padding: 8,
    borderRadius: 5,
    cursor: "pointer"
  }

};