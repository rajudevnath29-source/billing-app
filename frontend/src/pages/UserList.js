import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function UserList() {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [showPermissionsModal, setShowPermissionsModal] =
    useState(false);

  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  // =========================
  // GET USERS
  // =========================
  const getUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers(res.data);

      setLoading(false);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // =========================
  // OPEN DELETE MODAL
  // =========================
  const openDeleteModal = (user) => {
    setSelectedUser(user);

    setDeleteModal(true);
  };

  // =========================
  // DELETE USER
  // =========================
  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("User deleted successfully");

      setDeleteModal(false);

      getUsers();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // =========================
  // FILTER USERS
  // =========================
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchRole =
      roleFilter === "ALL" ||
      user.role === roleFilter;

    return matchSearch && matchRole;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pageUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={styles.page}>
      {/* TOP */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>
            👥 User Management
          </h1>

          <p style={styles.subtitle}>
            Manage users, roles and permissions
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={styles.search}
        />

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
          style={styles.select}
        >
          <option value="ALL">All Roles</option>

          <option value="SUPER_ADMIN">
            SUPER_ADMIN
          </option>

          <option value="ITEM_MANAGER">
            ITEM_MANAGER
          </option>

          <option value="INVOICE_USER">
            INVOICE_USER
          </option>
        </select>
      </div>

      {/* TABLE */}
      <div style={styles.tableWrapper} className="app-table-card">
        <table style={styles.table} className="app-table">
          <thead>
            <tr>
              <th style={styles.th}>User</th>

              <th style={styles.th}>Role</th>

              <th style={styles.th}>
                Permissions
              </th>

              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pageUsers.map((user) => (
              <tr key={user._id} className="table-row">
                {/* USER */}
                <td style={styles.td}>
                  <div style={styles.userInfo}>
                    <img
                      src={
                        user.profile_image
                          ? `http://localhost:5000/uploads/${user.profile_image}`
                          : "https://i.pravatar.cc/60"
                      }
                      alt=""
                      style={styles.avatar}
                    />

                    <div>
                      <h4 style={{ margin: 0 }}>
                        {user.name}
                      </h4>

                      <p style={styles.email}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* ROLE */}
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.roleBadge,

                      background:
                        user.role ===
                          "SUPER_ADMIN"
                          ? "#fee2e2"
                          : user.role ===
                            "ITEM_MANAGER"
                            ? "#dcfce7"
                            : "#dbeafe",

                      color:
                        user.role ===
                          "SUPER_ADMIN"
                          ? "#dc2626"
                          : user.role ===
                            "ITEM_MANAGER"
                            ? "#15803d"
                            : "#2563eb",
                    }}
                  >
                    {user.role}
                  </span>
                </td>

                {/* PERMISSIONS */}
                <td style={styles.td}>
                  <div
                    style={
                      styles.permissionWrap
                    }
                  >
                    {(user.permissions || [])
                      .length === 0 ? (
                      <span
                        style={
                          styles.noPermission
                        }
                      >
                        No Permissions
                      </span>
                    ) : (
                      <>
                        {(user.permissions || [])
                          .slice(0, 3)
                          .map(
                            (permission) => (
                              <span
                                key={
                                  permission._id
                                }
                                style={
                                  styles.permissionBadge
                                }
                              >
                                {permission.label ||
                                  permission.name}
                              </span>
                            ),
                          )}

                        {(user.permissions ||
                          []).length > 3 && (
                            <button
                              style={
                                styles.moreBtn
                              }
                              onClick={() => {
                                setSelectedPermissions(
                                  user.permissions,
                                );

                                setShowPermissionsModal(
                                  true,
                                );
                              }}
                            >
                              +{" "}
                              {(user.permissions ||
                                []).length -
                                3}
                            </button>
                          )}
                      </>
                    )}
                  </div>
                </td>

                {/* ACTIONS */}
                <td style={styles.td}>
                  <div
                    style={styles.actionWrap}
                  >
                    <Link
                      to={`/users/edit/${user._id}`}
                      className="app-action-btn app-action-edit"
                      style={styles.iconBtn}
                      title="Edit user"
                      aria-label="Edit user"
                    >
                      ✎
                    </Link>

                    <button
                      onClick={() =>
                        openDeleteModal(user)
                      }
                      className="app-action-btn app-action-delete"
                      style={styles.iconBtn}
                      title="Delete user"
                      aria-label="Delete user"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={styles.empty}>
            No users found
          </div>
        )}
      </div>

      {filteredUsers.length > 0 && (
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

      {/* PERMISSIONS MODAL */}
      <AnimatePresence>
        {showPermissionsModal && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={styles.modal}
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
              }}
            >
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0 }}>
                  All Permissions
                </h3>

                <button
                  style={styles.closeBtn}
                  onClick={() =>
                    setShowPermissionsModal(
                      false,
                    )
                  }
                >
                  ✕
                </button>
              </div>

              <div style={styles.modalBody}>
                {selectedPermissions.map(
                  (permission) => (
                    <span
                      key={permission._id}
                      style={
                        styles.permissionBadge
                      }
                    >
                      {permission.label ||
                        permission.name}
                    </span>
                  ),
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={styles.deleteModal}
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
              }}
            >
              <div style={styles.deleteIcon}>
                🗑️
              </div>

              <h2 style={styles.deleteTitle}>
                Delete User?
              </h2>

              <p style={styles.deleteText}>
                Are you sure you want to
                delete{" "}
                <b>
                  {selectedUser?.name}
                </b>
                ?
              </p>

              <div style={styles.modalActions}>
                <button
                  style={styles.cancelBtn}
                  onClick={() =>
                    setDeleteModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  style={styles.confirmBtn}
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  page: {
    padding: 10,
  },

  topBar: {
    marginBottom: 16,
  },

  title: {
    margin: 0,
    fontSize: 26,
    color: "#0f172a",
  },

  subtitle: {
    color: "#64748b",
    marginTop: 4,
  },

  filters: {
    display: "flex",
    gap: 10,
    marginBottom: 14,
  },

  search: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    outline: "none",
  },

  select: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    outline: "none",
  },

  tableWrapper: {
    background: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "10px 12px",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
  },

  td: {
    padding: "8px 12px",
    borderTop: "1px solid #eee",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    objectFit: "cover",
  },

  email: {
    margin: "2px 0 0",
    color: "#64748b",
    fontSize: 12,
  },

  roleBadge: {
    padding: "4px 8px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 12,
  },

  permissionWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 5,
  },

  permissionBadge: {
    // background: "#eff6ff",
    // background: "#dceaf0",
    background: "#e3ecef",
    color: "#2563eb",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 12,
  },

  noPermission: {
    color: "#94a3b8",
    fontSize: 13,
  },

  moreBtn: {
    border: "none",
    background: "#e2e8f0",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 700,
  },

  actionWrap: {
    display: "flex",
    gap: 8,
  },

  iconBtn: {
    padding: 0,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
  },

  empty: {
    padding: 40,
    textAlign: "center",
    color: "#64748b",
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

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15,23,42,0.45)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },

  modal: {
    width: 450,
    background:
      "rgba(255,255,255,0.9)",
    borderRadius: 24,
    padding: 25,
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.2)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  closeBtn: {
    border: "none",
    background: "transparent",
    fontSize: 20,
    cursor: "pointer",
  },

  modalBody: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  deleteModal: {
    width: 420,
    background:
      "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: 28,
    padding: 30,
    textAlign: "center",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.2)",
  },

  deleteIcon: {
    fontSize: 55,
    marginBottom: 15,
  },

  deleteTitle: {
    margin: 0,
    color: "#0f172a",
  },

  deleteText: {
    color: "#64748b",
    marginTop: 12,
    lineHeight: 1.7,
  },

  modalActions: {
    display: "flex",
    justifyContent: "center",
    gap: 15,
    marginTop: 30,
  },

  cancelBtn: {
    padding: "12px 18px",
    borderRadius: 14,
    border: "none",
    background: "#e2e8f0",
    color: "#0f172a",
    cursor: "pointer",
    fontWeight: 600,
  },

  confirmBtn: {
    padding: "12px 18px",
    borderRadius: 14,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
};
