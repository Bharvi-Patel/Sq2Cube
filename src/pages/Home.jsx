import { Link } from "react-router-dom";
import "./Home.css";
import Robot from "../components/upload/Robot";

const Home = () => {
return ( <div className="home">


  {/* BACKGROUND EFFECT */}
  <img className="image-gradient" src="/gradient.png" alt="gradient" />
  <div className="layer-blur"></div>

  <div className="container">

    {/* HERO */}
    <main className="hero">

      {/* LEFT SIDE */}
      <div className="content">

        <div className="tag-box">
          <div className="tag">INTRODUCING SQ2CUBE</div>
        </div>

        <h1>
          Transform 2D Images <br/> into 3D Models
        </h1>

        <p className="description">
          Sq2Cube uses AI to convert your Images into detailed 3D models.
        </p>

        <div className="hero-buttons">

  <Link to="/docs" className="btn-docs">
    Documentation 
  </Link>

  <Link to="/Login" className="btn-start">
    Get Started 
  </Link>

</div>

      </div>

      {/* RIGHT SIDE ROBOT */}
      <div className="robot-area">
        <Robot />
      </div>

    </main>


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
</div>


);
};

export default Home;
