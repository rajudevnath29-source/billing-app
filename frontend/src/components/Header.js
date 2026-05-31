import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../utils/role";

export default function Header({ collapsed, setCollapsed }) {
  const user = getUser();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={styles.header}>
      {/* LEFT TOGGLE */}
      <button onClick={() => setCollapsed(!collapsed)} style={styles.menuBtn}>
        ☰
      </button>

      {/* <img
        src="/Logo-Light.png"
        alt="Raaj Computer Service"
        style={styles.logo}
      /> */}
      <h3>ERP Dashboard</h3>

      {/* RIGHT SIDE ACTIONS */}
      <div style={styles.right}>
        {/* PROFILE */}
        <div style={styles.profileWrapper}>
          <img
            src={
              user?.profile_image
                ? `http://localhost:5000/uploads/${user.profile_image}`
                : "https://i.pravatar.cc/80"
            }
            alt="User Profile"
            style={styles.avatar}
            onClick={() => setProfileOpen(!profileOpen)}
          />

          {/* DROPDOWN */}
          {profileOpen && (
            <div style={styles.dropdown}>
              <p onClick={() => navigate("/profile")}>👤 My Profile</p>

              <p onClick={() => navigate("/profile/edit")}>✏️ Edit Profile</p>
            </div>
          )}
        </div>

        {/* POWER / LOGOUT */}
        <div style={styles.powerBtn} onClick={logout} title="Logout">
          <i className="fa fa-power-off" style={{ fontSize: "24px", color: "#f35959" }}></i>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    height: 60,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  menuBtn: {
    fontSize: 20,
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },

  logo: {
    height: 42,
    width: 170,
    objectFit: "contain",
    objectPosition: "left center",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 15,
  },

  profileWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    cursor: "pointer",
    border: "2px solid #e2e8f0",
  },

  dropdown: {
    position: "absolute",
    top: 55,
    left: "50%",
    transform: "translateX(-50%)", // 👈 CENTER ALIGN
    background: "#fff",
    width: 160,
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    borderRadius: 10,
    padding: 10,
    zIndex: 100,
  },

  powerBtn: {
    fontSize: 20,
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: 8,
    transition: "0.2s",
  },
};
