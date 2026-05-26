import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={styles.wrapper}>

      <Sidebar />

      <div style={styles.main}>
        {children}
      </div>

    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#f4f6f9",
    fontFamily: "Arial"
  },

  main: {
    flex: 1,
    padding: 20
  }
};