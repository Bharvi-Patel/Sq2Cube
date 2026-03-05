import { Link } from "react-router-dom";
import Button from "../components/Button";
import RotatingRobot from "../components/RotatingRobot";
import "./Home.css";
// import HeroScene from "./HeroScene";

const Home = () => {
  return (
    <div>

      {/* HERO */}
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
          <RotatingRobot />
          {/* <HeroScene /> */}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <h2>How Sq2Cube Works</h2>

        <div className="steps-grid">
          <div className="step-card">
            <h3>1️⃣ Upload Image</h3>
            <p>Select a photo or sketch you want to convert.</p>
          </div>

          <div className="step-card">
            <h3>2️⃣ AI Processing</h3>
            <p>Our AI analyzes the structure and depth.</p>
          </div>

          <div className="step-card">
            <h3>3️⃣ Generate 3D</h3>
            <p>The system builds a complete 3D model.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <h2>Powerful Features</h2>

        <div className="features-grid">
          <div className="feature-card">⚡ AI Reconstruction</div>
          <div className="feature-card">📷 Multi Image Support</div>
          <div className="feature-card">🎨 Texture Generation</div>
          <div className="feature-card">🚀 Fast Processing</div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Convert Your Image?</h2>

        <Link to="/upload">
          <button className="cta-btn">Upload Image</button>
        </Link>
      </section>

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
    gap: "40px",
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default Home;