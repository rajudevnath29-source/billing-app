import { useEffect, useState } from "react";
import axios from "axios";

export default function UserList() {
  const [users, setUsers] = useState([]);

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

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

  // DELETE USER
  const deleteUser = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={styles.container}>
      <h2>User Management</h2>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                <img
                  src={
                    user.profile_image
                      ? `http://localhost:5000/uploads/${user.profile_image}`
                      : "https://i.pravatar.cc/50"
                  }
                  alt="profile"
                  style={styles.image}
                />
              </td>

              <td>{user.name}</td>

              <td>{user.email}</td>

              <td>{user.role}</td>

              <td>
                <button
                  style={styles.editBtn}
                  onClick={() =>
                    (window.location.href = `/users/edit/${user._id}`)
                  }
                >
                  Edit
                </button>

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteUser(user._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 20,
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    objectFit: "cover",
  },

  editBtn: {
    padding: "6px 12px",
    marginRight: 10,
    border: "none",
    borderRadius: 6,
    background: "#3b82f6",
    color: "#fff",
    cursor: "pointer",
  },

  deleteBtn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: 6,
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
  },
};
