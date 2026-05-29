import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function UserAccessManager() {
  const [users, setUsers] = useState([]);

  const [roles, setRoles] = useState([]);

  const [permissions, setPermissions] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  // ==========================
  // FETCH USERS
  // ==========================
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================
  // FETCH ROLES
  // ==========================
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

  // ==========================
  // FETCH PERMISSIONS
  // ==========================
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
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, []);

  // ==========================
  // TOGGLE ROLE
  // ==========================
  const toggleRole = (roleId) => {
    const exists = selectedUser.roles.includes(roleId);

    if (exists) {
      setSelectedUser({
        ...selectedUser,
        roles: selectedUser.roles.filter((r) => r !== roleId),
      });
    } else {
      setSelectedUser({
        ...selectedUser,
        roles: [...selectedUser.roles, roleId],
      });
    }
  };

  // ==========================
  // TOGGLE EXTRA PERMISSION
  // ==========================
  const togglePermission = (permissionId) => {
    const exists = selectedUser.permissions.includes(permissionId);

    if (exists) {
      setSelectedUser({
        ...selectedUser,
        permissions: selectedUser.permissions.filter((p) => p !== permissionId),
      });
    } else {
      setSelectedUser({
        ...selectedUser,
        permissions: [...selectedUser.permissions, permissionId],
      });
    }
  };

  // ==========================
  // TOGGLE BLOCK PERMISSION
  // ==========================
  const toggleBlockedPermission = (permissionId) => {
    const exists = selectedUser.blockedPermissions.includes(permissionId);

    if (exists) {
      setSelectedUser({
        ...selectedUser,
        blockedPermissions: selectedUser.blockedPermissions.filter(
          (p) => p !== permissionId,
        ),
      });
    } else {
      setSelectedUser({
        ...selectedUser,
        blockedPermissions: [...selectedUser.blockedPermissions, permissionId],
      });
    }
  };

  // ==========================
  // SAVE ACCESS
  // ==========================
  const saveAccess = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${selectedUser._id}/access`,
        {
          roles: selectedUser.roles,
          permissions: selectedUser.permissions,
          blockedPermissions: selectedUser.blockedPermissions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Access updated");

      fetchUsers();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  // ==========================
  // FILTER
  // ==========================
  const filteredPermissions = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={styles.container}>
      <h1>🔐 User Access Manager</h1>

      <div style={styles.layout}>
        {/* USER LIST */}
        <div style={styles.left}>
          {users.map((user) => (
            <div
              key={user._id}
              style={styles.userCard}
              onClick={() =>
                setSelectedUser({
                  ...user,
                  roles: user.roles.map((r) => r._id),
                  permissions: user.permissions.map((p) => p._id),
                  blockedPermissions: user.blockedPermissions.map((p) => p._id),
                })
              }
            >
              <h3>{user.name}</h3>

              <p>{user.email}</p>
            </div>
          ))}
        </div>

        {/* ACCESS PANEL */}
        <div style={styles.right}>
          {selectedUser ? (
            <>
              <h2>{selectedUser.name}</h2>

              {/* SEARCH */}
              <input
                placeholder="Search permission..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.search}
              />

              {/* ROLES */}
              <div style={styles.section}>
                <h3>👑 Roles</h3>

                {roles.map((role) => (
                  <label key={role._id} style={styles.item}>
                    <input
                      type="checkbox"
                      checked={selectedUser.roles.includes(role._id)}
                      onChange={() => toggleRole(role._id)}
                    />

                    {role.label}
                  </label>
                ))}
              </div>

              {/* EXTRA */}
              <div style={styles.section}>
                <h3>➕ Extra Permissions</h3>

                {filteredPermissions.map((permission) => (
                  <label key={permission._id} style={styles.item}>
                    <input
                      type="checkbox"
                      checked={selectedUser.permissions.includes(
                        permission._id,
                      )}
                      onChange={() => togglePermission(permission._id)}
                    />

                    {permission.label}
                  </label>
                ))}
              </div>

              {/* BLOCKED */}
              <div style={styles.section}>
                <h3>⛔ Block Permissions</h3>

                {filteredPermissions.map((permission) => (
                  <label key={permission._id} style={styles.item}>
                    <input
                      type="checkbox"
                      checked={selectedUser.blockedPermissions.includes(
                        permission._id,
                      )}
                      onChange={() => toggleBlockedPermission(permission._id)}
                    />

                    {permission.label}
                  </label>
                ))}
              </div>

              <button onClick={saveAccess} style={styles.button}>
                Save Access
              </button>
            </>
          ) : (
            <h3>Select User</h3>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
  },

  layout: {
    display: "flex",
    gap: 20,
  },

  left: {
    width: 300,
  },

  right: {
    flex: 1,
    background: "#fff",
    padding: 20,
    borderRadius: 20,
  },

  userCard: {
    background: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    cursor: "pointer",
  },

  search: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
    marginBottom: 20,
  },

  section: {
    marginBottom: 30,
  },

  item: {
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
};
