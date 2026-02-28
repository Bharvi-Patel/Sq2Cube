const Footer = () => {
  return (
    <footer style={styles.footer}>
      © {new Date().getFullYear()} Sq2Cube
    </footer>
  );
};

const styles = {
  footer: {
    background: "#111",
    color: "white",
    textAlign: "center",
    padding: "15px",
  },
};

export default Footer;