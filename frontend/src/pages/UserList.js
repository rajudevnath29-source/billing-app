import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function UserList() {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("ALL");

  // =========================
  // GET USERS
  // =========================
  const getUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
  // DELETE USER
  // =========================
  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User deleted");

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
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchSearch && matchRole;
  });

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={styles.page}>
      {/* TOP */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.title}>👥 User Management</h1>

          <p style={styles.subtitle}>Manage users, roles and permissions</p>
        </div>
      </div>

      {/* FILTERS */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={styles.select}
        >
          <option value="ALL">All Roles</option>

          <option value="SUPER_ADMIN">SUPER_ADMIN</option>

          <option value="ITEM_MANAGER">ITEM_MANAGER</option>

          <option value="INVOICE_USER">INVOICE_USER</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User</th>

              <th style={styles.th}>Role</th>

              <th style={styles.th}>Permissions</th>

              <th style={styles.th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
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
                      <h4 style={{ margin: 0 }}>{user.name}</h4>

                      <p style={styles.email}>{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* ROLE */}
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.roleBadge,

                      background:
                        user.role === "SUPER_ADMIN"
                          ? "#fee2e2"
                          : user.role === "ITEM_MANAGER"
                            ? "#dcfce7"
                            : "#dbeafe",

                      color:
                        user.role === "SUPER_ADMIN"
                          ? "#dc2626"
                          : user.role === "ITEM_MANAGER"
                            ? "#15803d"
                            : "#2563eb",
                    }}
                  >
                    {user.role}
                  </span>
                </td>

                {/* PERMISSIONS */}
                <td style={styles.td}>
                  <div style={styles.permissionWrap}>
                    {(user.permissions || []).slice(0, 3).map((permission) => (
                      <span key={permission} style={styles.permissionBadge}>
                        {permission}
                      </span>
                    ))}

                    {(user.permissions || []).length > 3 && (
                      <span style={styles.moreBadge}>
                        +{(user.permissions || []).length - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* ACTIONS */}
                <td style={styles.td}>
                  <div style={styles.actionWrap}>
                    <Link to={`/users/edit/${user._id}`} style={styles.editBtn}>
                      Edit
                    </Link>

                    <button
                      onClick={() => deleteUser(user._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={styles.empty}>No users found</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 10,
  },

  topBar: {
    marginBottom: 25,
  },

  title: {
    margin: 0,
    fontSize: 30,
    color: "#0f172a",
  },

  subtitle: {
    color: "#64748b",
    marginTop: 8,
  },

  filters: {
    display: "flex",
    gap: 15,
    marginBottom: 20,
  },

  search: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
  },

  select: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
  },

  tableWrapper: {
    background: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: 18,
    background: "#f8fafc",
    color: "#334155",
    fontWeight: 600,
    fontSize: 14,
  },

  td: {
    padding: 18,
    borderTop: "1px solid #f1f5f9",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 15,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    objectFit: "cover",
  },

  email: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: 14,
  },

  roleBadge: {
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 12,
  },

  permissionWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  permissionBadge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
  },

  moreBadge: {
    background: "#e2e8f0",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
  },

  actionWrap: {
    display: "flex",
    gap: 10,
  },

  editBtn: {
    padding: "8px 14px",
    borderRadius: 10,
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    fontSize: 14,
  },

  deleteBtn: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
  },

  empty: {
    padding: 40,
    textAlign: "center",
    color: "#64748b",
  },
};
