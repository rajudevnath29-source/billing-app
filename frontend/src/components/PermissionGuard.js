import { hasPermission } from "../utils/permissions";

export default function PermissionGuard({ permission, children }) {
  if (!hasPermission(permission)) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>🔒</div>

          <h1 style={styles.title}>Access Denied</h1>

          <p style={styles.text}>
            You don't have permission to access this page.
          </p>

          <button style={styles.button} onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
  },

  card: {
    background: "#fff",
    padding: 40,
    borderRadius: 24,
    width: 400,
    textAlign: "center",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  },

  icon: {
    fontSize: 60,
    marginBottom: 10,
  },

  title: {
    marginBottom: 10,
    color: "#0f172a",
  },

  text: {
    color: "#64748b",
    lineHeight: 1.6,
  },

  button: {
    marginTop: 20,
    padding: "12px 20px",
    border: "none",
    borderRadius: 12,
    background: "#7c93e6",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
  },
};
