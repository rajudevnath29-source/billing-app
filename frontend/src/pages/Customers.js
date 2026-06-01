import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const pageSize = 10;

  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  // FETCH CUSTOMERS
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCustomers(res.data.customers);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // DELETE CUSTOMER
  const openDeleteModal = (customer) => {
    setCustomerToDelete(customer);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setCustomerToDelete(null);
    setDeleteModal(false);
  };

  const deleteCustomer = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/customers/${customerToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      closeDeleteModal();
      fetchCustomers();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // SEARCH
  const filteredCustomers = customers.filter((customer) =>
    customer.customer_name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / pageSize),
  );
  const pageCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <>
      {/* TOP BAR */}
      <div style={styles.topBar}>
        <h2>👥 Customers</h2>

        <button
          style={styles.primaryBtn}
          onClick={() => navigate("/customers/add")}
        >
          ➕ Add Customer
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {/* TABLE */}
      <table style={styles.table} className="app-table">
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
          {pageCustomers.map((customer) => (
            <tr key={customer._id} className="table-row">
              <td style={styles.td}>{customer.customer_name}</td>

              <td style={styles.td}>{customer.phone}</td>

              <td style={styles.td}>{customer.gst_number}</td>

              <td style={styles.td}>{customer.city}</td>

              <td style={styles.td}>
                <span className="money-text">₹ {customer.opening_balance}</span>
              </td>

              <td style={styles.td}>
                <div style={styles.actionWrap}>
                  <button
                    className="app-action-btn app-action-view"
                    style={styles.iconBtn}
                    title="View customer"
                    aria-label="View customer"
                    onClick={() => setViewCustomer(customer)}
                  >
                    👁
                  </button>

                  <button
                    className="app-action-btn app-action-edit"
                    style={styles.iconBtn}
                    title="Edit customer"
                    aria-label="Edit customer"
                    onClick={() => navigate(`/customers/edit/${customer._id}`)}
                  >
                    ✎
                  </button>

                  <button
                    className="app-action-btn app-action-delete"
                    style={styles.iconBtn}
                    title="Delete customer"
                    aria-label="Delete customer"
                    onClick={() => openDeleteModal(customer)}
                  >
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredCustomers.length > 0 && (
        <div style={styles.pagination}>
          {currentPage > 1 && (
            <button
              style={styles.pageBtn}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Prev
            </button>
          )}

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;

            return (
              <button
                key={page}
                disabled={currentPage === page}
                onClick={() => setCurrentPage(page)}
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === page ? styles.activePageBtn : {}),
                }}
              >
                {page}
              </button>
            );
          })}

          {currentPage < totalPages && (
            <button
              style={styles.pageBtn}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          )}
        </div>
      )}

      {viewCustomer && (
        <div style={styles.modalOverlay}>
          <div style={styles.viewModal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>{viewCustomer.customer_name}</h3>
                <p style={styles.modalSub}>{viewCustomer.phone || "-"}</p>
              </div>
              <button
                style={styles.closeBtn}
                onClick={() => setViewCustomer(null)}
              >
                X
              </button>
            </div>

            <div style={styles.detailGrid}>
              <Detail label="Phone" value={viewCustomer.phone} />
              <Detail label="Email" value={viewCustomer.email} />
              <Detail label="GST" value={viewCustomer.gst_number} />
              <Detail label="City" value={viewCustomer.city} />
              <Detail label="State" value={viewCustomer.state} />
              <Detail label="Pincode" value={viewCustomer.pincode} />
              <Detail
                label="Balance"
                value={`₹ ${viewCustomer.opening_balance || 0}`}
              />
              <Detail label="Address" value={viewCustomer.address} wide />
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.deleteModal}>
            <div style={styles.deleteModalIcon}>🗑️</div>
            <h2>Delete Customer?</h2>
            <p style={styles.deleteModalText}>
              Are you sure you want to delete{" "}
              <strong>{customerToDelete?.customer_name}</strong>?
            </p>
            <div style={styles.deleteModalActions}>
              <button style={styles.cancelDeleteBtn} onClick={closeDeleteModal}>
                Cancel
              </button>
              <button style={styles.confirmDeleteBtn} onClick={deleteCustomer}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Detail({ label, value, wide }) {
  return (
    <div
      style={
        wide
          ? { ...styles.detailItem, ...styles.detailWide }
          : styles.detailItem
      }
    >
      <span style={styles.detailLabel}>{label}</span>
      <strong style={styles.detailValue}>{value || "-"}</strong>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  search: {
    padding: 9,
    width: 250,
    marginBottom: 14,
    borderRadius: 6,
    border: "1px solid #ccc",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },

  th: {
    background: "#0f172a",
    color: "#fff",
    padding: "10px 12px",
    textAlign: "left",
  },

  td: {
    padding: "8px 12px",
    borderBottom: "1px solid #eee",
  },

  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 6,
    cursor: "pointer",
  },

  actionWrap: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  iconBtn: {
    padding: 0,
    fontWeight: 700,
    fontSize: 14,
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },

  pageBtn: {
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    background: "#e2e8f0",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 700,
  },

  activePageBtn: {
    background: "#2563eb",
    color: "#fff",
    cursor: "not-allowed",
    opacity: 0.85,
  },

  viewModal: {
    width: 620,
    maxWidth: "92vw",
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    background: "#0f172a",
    color: "#fff",
  },

  modalTitle: {
    margin: 0,
  },

  modalSub: {
    margin: "3px 0 0",
    color: "#cbd5e1",
  },

  closeBtn: {
    border: "none",
    height: 32,
    minWidth: 32,
    borderRadius: 6,
    background: "#fee2e2",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: 700,
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
    padding: 14,
  },

  detailItem: {
    background: "#f8fafc",
    borderRadius: 8,
    padding: 10,
  },

  detailWide: {
    gridColumn: "1 / -1",
  },

  detailLabel: {
    display: "block",
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },

  detailValue: {
    color: "#0f172a",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px",
  },
  deleteModal: {
    background: "#fff",
    width: 420,
    padding: 30,
    borderRadius: 24,
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },

  deleteModalIcon: {
    fontSize: 55,
    marginBottom: 10,
  },

  deleteModalText: {
    color: "#64748b",
    marginTop: 10,
    lineHeight: 1.7,
  },

  deleteModalActions: {
    display: "flex",
    gap: 15,
    marginTop: 25,
  },

  cancelDeleteBtn: {
    flex: 1,
    border: "none",
    padding: 12,
    borderRadius: 12,
    background: "#e2e8f0",
    cursor: "pointer",
    fontWeight: 600,
  },

  confirmDeleteBtn: {
    flex: 1,
    border: "none",
    padding: 12,
    borderRadius: 12,
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
};
