import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password
        }
      );

      // ✅ SAVE AUTH DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // 🎯 ROLE BASED REDIRECT
      const role = res.data.user.role;

      if (role === "SUPER_ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/invoice");
      }

    } catch (error) {
      alert(
        error?.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>

      <div style={box}>
        <h2>🔐 Login</h2>

        <input
          style={input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>

    </div>
  );
}

// 🎨 STYLES
const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f5f5f5"
};

const box = {
  padding: 30,
  background: "#fff",
  borderRadius: 10,
  width: 300,
  boxShadow: "0 0 10px rgba(0,0,0,0.1)"
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  marginBottom: 10,
  borderRadius: 5,
  border: "1px solid #ccc"
};

const button = {
  width: "100%",
  padding: 10,
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 5,
  cursor: "pointer"
};