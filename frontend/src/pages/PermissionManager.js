import { useEffect, useState } from "react";
import axios from "axios";

export default function PermissionManager() {
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

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
    fetchPermissions();
  }, []);

  const filteredPermissions = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h1>🔐 Permission Manager</h1>

        <input
          type="text"
          placeholder="Search permission..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />
      </div>

      <div style={styles.grid}>
        {filteredPermissions.map((permission) => (
          <div key={permission._id} style={styles.card}>
            <h3>{permission.label}</h3>

            <p>{permission.name}</p>

            <small>{permission.module}</small>
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

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  search: {
    padding: 12,
    width: 300,
    borderRadius: 12,
    border: "1px solid #ddd",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
    gap: 20,
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 20,
    boxShadow: "0 5px 20px rgba(0,0,0,0.06)",
  },
};
