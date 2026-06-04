import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";

const isRolePermission = (permissionName = "") => {
  return (
    permissionName.endsWith("_MODULE") ||
    permissionName.startsWith("VIEW_") ||
    permissionName === "DASHBOARD_ACCESS" ||
    permissionName === "CUSTOMER_LEDGER"
  );
};

export default function RoleManager() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState("");

  const [openModules, setOpenModules] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    permissions: [],
  });

  const token = localStorage.getItem("token");

  // ================= FETCH =================
  const fetchRoles = useCallback(async () => {
    const res = await axios.get(`${API_URL}/roles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRoles(res.data);
  }, [token]);

  const fetchPermissions = useCallback(async () => {
    const res = await axios.get(`${API_URL}/permissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPermissions(res.data);
  }, [token]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchPermissions, fetchRoles]);

  // ================= CREATE ROLE =================
  const createRole = async () => {
    await axios.post(`${API_URL}/roles`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchRoles();

    setFormData({
      name: "",
      permissions: [],
    });
  };

  // ================= TOGGLE PERMISSION =================
  const togglePermission = (id) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter((p) => p !== id)
        : [...prev.permissions, id],
    }));
  };

  // ================= SMART SEARCH + GROUPING =================
  const filteredGrouped = useMemo(() => {
    const keyword = search.toLowerCase();

    const grouped = {};

    permissions.forEach((p) => {
      if (!isRolePermission(p.name)) return;

      const name = p.name.toLowerCase();
      const label = p.label.toLowerCase();
      const module = (p.module || "OTHER").toLowerCase();

      const match =
        name.includes(keyword) ||
        label.includes(keyword) ||
        module.includes(keyword);

      const moduleMatch = module.includes(keyword);

      // no search → show all
      if (!keyword) {
        const key = p.module || "OTHER";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(p);
        return;
      }

      // module match → show all permissions of module
      if (moduleMatch) {
        const key = p.module || "OTHER";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(p);
        return;
      }

      // permission match → show only that permission
      if (match) {
        const key = p.module || "OTHER";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(p);
      }
    });

    return grouped;
  }, [permissions, search]);

  // ================= MODULE TOGGLE =================
  const toggleModule = (module) => {
    setOpenModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  // ================= SELECT ALL =================
  const handleSelectAll = (perms) => {
    const ids = perms.map((p) => p._id);

    const allSelected = ids.every((id) =>
      formData.permissions.includes(id),
    );

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((id) => !ids.includes(id))
        : [...new Set([...prev.permissions, ...ids])],
    }));
  };

  return (
    <div style={styles.container}>
      <h1>👑 Role Manager</h1>

      {/* FORM */}
      <div style={styles.form}>
        <input
          placeholder="Role Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={styles.input}
        />

        {/* SEARCH */}
        <input
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />

        {/* PERMISSIONS */}
        {Object.entries(filteredGrouped).map(([module, perms]) => {
          const expanded = search.trim() !== "" || openModules[module];

          return (
            <div key={module} style={styles.moduleCard}>
              {/* HEADER */}
              <div style={styles.moduleHeader}>
                <input
                  type="checkbox"
                  checked={perms.every((p) =>
                    formData.permissions.includes(p._id),
                  )}
                  onChange={() => handleSelectAll(perms)}
                />

                <div
                  style={styles.moduleTitle}
                  onClick={() => toggleModule(module)}
                >
                  <strong>{module}</strong>
                  <span>{expanded ? "▼" : "▶"}</span>
                </div>
              </div>

              {/* BODY */}
              {expanded && (
                <div style={styles.permissionGrid}>
                  {perms.map((p) => (
                    <label key={p._id} style={styles.permissionItem}>
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(p._id)}
                        onChange={() => togglePermission(p._id)}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <button onClick={createRole} style={styles.button}>
          Create Role
        </button>
      </div>

      {/* ROLES LIST */}
      <div style={styles.grid}>
        {roles.map((role) => (
          <div key={role._id} style={styles.card}>
            <h3>{role.name}</h3>
            <div>
              {role.permissions.map((p) => (
                <div key={p._id}>✔ {p.label || p.name}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
const styles = {
  container: { padding: 20 },

  form: {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  moduleCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
  },

  moduleHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px",
    background: "#f8fafc",
    cursor: "pointer",
  },

  moduleTitle: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: 10,
  },

  permissionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
    padding: 10,
  },

  permissionItem: {
    display: "flex",
    gap: 8,
    padding: 6,
    borderRadius: 6,
    border: "1px solid #eee",
    background: "#fff",
    fontSize: 13,
  },

  button: {
    marginTop: 10,
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
    gap: 15,
  },

  card: {
    background: "#fff",
    padding: 15,
    borderRadius: 12,
  },
};
