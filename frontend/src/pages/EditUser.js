import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function EditUser() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  // FETCH USER
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFormData({
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // UPDATE USER
  const updateUser = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.put(`http://localhost:5000/api/users/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("User updated");

      navigate("/users");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div style={styles.container}>
      <h2>Edit User</h2>

      <form onSubmit={updateUser} style={styles.form}>
        <input
          type="text"
          placeholder="Name"
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
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
          style={styles.input}
        />

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
          <option value="SUPER_ADMIN">SUPER_ADMIN</option>

          <option value="ITEM_MANAGER">ITEM_MANAGER</option>

          <option value="INVOICE_USER">INVOICE_USER</option>
        </select>

        <button type="submit" style={styles.button}>
          Update User
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
    maxWidth: 400,
  },

  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  button: {
    padding: 12,
    border: "none",
    borderRadius: 8,
    background: "#3b82f6",
    color: "#fff",
    cursor: "pointer",
  },
};
