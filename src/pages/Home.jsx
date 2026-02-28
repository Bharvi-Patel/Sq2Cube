import { Link } from "react-router-dom";
import Button from "../components/Button";
import heroImage from "../assets/hero.png"; // add image

const Home = () => {
  return (
    <div style={styles.hero}>
      <div style={styles.content}>
        <h1 style={styles.title}>
          Transform 2D Images <br /> Into Stunning 3D Models
        </h1>

        <p style={styles.subtitle}>
          Sq2Cube uses AI to convert your sketches and images into
          detailed 3D models.
        </p>

        <Link to="/upload">
          <Button text="Start Converting" />
        </Link>
      </div>

      <div style={styles.imageContainer}>
        <img src={heroImage} alt="3D Preview" style={styles.image} />
      </div>
    </div>
  );
};

const styles = {
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "80px 60px",
    minHeight: "80vh",
    color: "white",
  },
  content: {
    maxWidth: "600px",
  },
  title: {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#cbd5e1",
    marginBottom: "30px",
  },
  imageContainer: {
    flex: 1,
    textAlign: "right",
  },
  image: {
    width: "400px",
    filter: "drop-shadow(0px 0px 30px #4f46e5)",
  },
};

export default Home;