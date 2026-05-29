import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function EditUser() {
  const { id } = useParams();

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [allPermissions, setAllPermissions] = useState([]);
  const [allRoles, setAllRoles] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    permissions: [],
  });

  // =========================
  // GET USER + PERMISSIONS
  // =========================
  const getData = async () => {
    try {
      const [userRes, permissionRes, roleRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        axios.get("http://localhost:5000/api/permissions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        axios.get("http://localhost:5000/api/roles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);
      console.log(userRes);
      console.log(roleRes.data);
      console.log(userRes.data.role);
      console.log(permissionRes.data);
      setFormData({
        name: userRes.data.name,
        email: userRes.data.email,
        role: userRes.data.role,
        permissions: userRes.data.permissions || [],
      });

      setAllPermissions(permissionRes.data);
      setAllRoles(roleRes.data);

      setLoading(false);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // =========================
  // HANDLE PERMISSION
  // =========================
  const handlePermission = (permissionName) => {
    const exists = formData.permissions.includes(permissionName);

    if (exists) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== permissionName),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permissionName],
      });
    }
  };

  // =========================
  // FILTERED PERMISSIONS
  // =========================
  const filteredPermissions = useMemo(() => {
    return allPermissions.filter((permission) =>
      permission.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [allPermissions, search]);

  // =========================
  // UPDATE USER
  // =========================
  const updateUser = async (e) => {
    e.preventDefault();
    try {
      const selectedPermissionIds = allPermissions
        .filter((p) => formData.permissions.includes(p.name))
        .map((p) => p._id);

      const payload = {
        ...formData,
        permissions: selectedPermissionIds,
      };

      await axios.put(`http://localhost:5000/api/users/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("User updated successfully");

      navigate("/users");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>👤 Edit User</h1>

        <form onSubmit={updateUser}>
          {/* NAME */}
          <div style={styles.inputGroup}>
            <label>Name</label>

            <input
              type="text"
              value={formData.name}
              disabled
              style={styles.input}
            />
          </div>

          {/* EMAIL */}
          <div style={styles.inputGroup}>
            <label>Email</label>

            <input
              type="email"
              value={formData.email}
              disabled
              style={styles.input}
            />
          </div>

          {/* ROLE */}
          <div style={styles.inputGroup}>
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value,
                })
              }
              style={styles.input}
            >
              <option value="">Select Role</option>

              {allRoles.map((role) => (
                <option key={role._id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH */}
          <div style={styles.inputGroup}>
            <label>Search Permission</label>

            <input
              type="text"
              placeholder="Search permission..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* PERMISSIONS */}
          <div style={styles.permissionBox}>
            <h3>Permissions</h3>

            <div style={styles.permissionsGrid}>
              {filteredPermissions.map((permission) => (
                <label key={permission._id} style={styles.permissionItem}>
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.name)}
                    onChange={() => handlePermission(permission.name)}
                  />

                  {permission.name}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" style={styles.button}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
  },

  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 20,
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
  },

  title: {
    marginBottom: 30,
  },

  inputGroup: {
    marginBottom: 20,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    marginTop: 8,
    outline: "none",
  },

  permissionBox: {
    marginTop: 30,
  },

  permissionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 12,
    marginTop: 20,
  },

  permissionItem: {
    background: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    display: "flex",
    gap: 10,
    alignItems: "center",
    border: "1px solid #e2e8f0",
    fontSize: 14,
  },

  button: {
    marginTop: 30,
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 12,
    background: "#2563eb",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer",
    fontWeight: "bold",
  },
};
