import { useEffect, useState } from "react";
import axios from "axios";

export default function RoleManager() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    label: "",
    permissions: [],
  });

  const token = localStorage.getItem("token");

  // FETCH ROLES
  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRoles(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // FETCH PERMISSIONS
  const fetchPermissions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/permissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPermissions(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // CREATE ROLE
  const createRole = async () => {
    try {
      await axios.post("http://localhost:5000/api/roles", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchRoles();

      setFormData({
        name: "",
        label: "",
        permissions: [],
      });
    } catch (error) {
      console.log(error);
    }
  };

  // TOGGLE PERMISSION
  const togglePermission = (id) => {
    const exists = formData.permissions.includes(id);

    if (exists) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== id),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, id],
      });
    }
  };

  // FILTERED
  const filteredPermissions = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={styles.container}>
      <h1>👑 Role Manager</h1>

      {/* FORM */}
      <div style={styles.form}>
        <input
          placeholder="Role Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
          style={styles.input}
        />

        <input
          placeholder="Role Label"
          value={formData.label}
          onChange={(e) =>
            setFormData({
              ...formData,
              label: e.target.value,
            })
          }
          style={styles.input}
        />

        {/* SEARCH */}
        <input
          placeholder="Search permission..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />

        {/* PERMISSIONS */}
        <div style={styles.permissionBox}>
          {filteredPermissions.map((permission) => (
            <label key={permission._id} style={styles.permissionItem}>
              <input
                type="checkbox"
                checked={formData.permissions.includes(permission._id)}
                onChange={() => togglePermission(permission._id)}
              />

              {permission.label}
            </label>
          ))}
        </div>

        <button onClick={createRole} style={styles.button}>
          Create Role
        </button>
      </div>

      {/* ROLE LIST */}
      <div style={styles.grid}>
        {roles.map((role) => (
          <div key={role._id} style={styles.card}>
            <h3>{role.label}</h3>

            <p>{role.name}</p>

            <hr />

            {role.permissions.map((p) => (
              <div key={p._id}>✅ {p.label}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
  },

  form: {
    background: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 15,
    borderRadius: 12,
    border: "1px solid #ddd",
  },

  permissionBox: {
    maxHeight: 300,
    overflowY: "auto",
    border: "1px solid #eee",
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
  },

  permissionItem: {
    display: "block",
    padding: 8,
  },

  button: {
    padding: "12px 20px",
    border: "none",
    borderRadius: 12,
    background: "#7c93e6",
    color: "#fff",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
    gap: 20,
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 20,
    boxShadow: "0 5px 20px rgba(0,0,0,0.05)",
  },
};
