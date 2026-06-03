import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";
import "../styles/auth.css";
import { API_URL } from "../config/api";

export default function Login() {
  const [isActive, setIsActive] = useState(false);

  // LOGIN STATE
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // REGISTER STATE
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "INVOICE_USER",
  });
  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        loginData,
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Login Successful");
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  // =========================
  // REGISTER
  // =========================
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/auth/register`, registerData);
      toast.success("Registration Successful");
      setIsActive(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="auth-page">
      <div className={`container ${isActive ? "active" : ""}`}>
        {/* LOGIN */}
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>

            <div className="input-box">
              <input
                type="text"
                placeholder="email"
                required
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    email: e.target.value,
                  })
                }
              />
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value,
                  })
                }
              />
              <i className="bx bxs-lock-alt"></i>
            </div>

            <div className="forgot-link">
              <button type="button" className="forgot-btn">
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="btn">
              Login
            </button>
            <p>or login with social platforms</p>

            <div className="social-icons">
              <button type="button">
                <i className="bx bxl-google"></i>
              </button>

              <button type="button">
                <i className="bx bxl-facebook"></i>
              </button>

              <button type="button">
                <i className="bx bxl-github"></i>
              </button>

              <button type="button">
                <i className="bx bxl-linkedin"></i>
              </button>
            </div>
          </form>
        </div>

        {/* REGISTER */}
        <div className="form-box register">
          <form onSubmit={handleRegister}>
            <h1>Registration</h1>

            <div className="input-box">
              <input
                type="text"
                placeholder="Full Name"
                required
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    name: e.target.value,
                  })
                }
              />
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                required
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    email: e.target.value,
                  })
                }
              />
              <i className="bx bxs-envelope"></i>
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    password: e.target.value,
                  })
                }
              />
              <i className="bx bxs-lock-alt"></i>
            </div>

            <div className="input-box">
              <select
                value={registerData.role}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    role: e.target.value,
                  })
                }
              >
                <option value="INVOICE_USER">Invoice User</option>
                <option value="ITEM_MANAGER">Item Manager</option>
              </select>

              <i className="bx bx-user-pin"></i>
            </div>

            <button type="submit" className="btn">
              Register
            </button>
            <p>or login with social platforms</p>

            <div className="social-icons">
              <button type="button">
                <i className="bx bxl-google"></i>
              </button>

              <button type="button">
                <i className="bx bxl-facebook"></i>
              </button>

              <button type="button">
                <i className="bx bxl-github"></i>
              </button>

              <button type="button">
                <i className="bx bxl-linkedin"></i>
              </button>
            </div>
          </form>
        </div>

        {/* TOGGLE */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>

            <p>Don't have an account?</p>

            <button
              type="button"
              className="btn"
              onClick={() => setIsActive(true)}
            >
              Register
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>

            <p>Already have an account?</p>

            <button
              type="button"
              className="btn"
              onClick={() => setIsActive(false)}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
