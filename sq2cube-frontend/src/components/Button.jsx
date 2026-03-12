const Button = ({ text, onClick }) => {
  return (
    <button onClick={onClick} style={styles.btn}>
      {text}
    </button>
  );
};

const styles = {
  btn: {
    padding: "10px 20px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Button;