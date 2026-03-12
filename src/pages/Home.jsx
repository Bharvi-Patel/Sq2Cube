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


    <section className="steps-section">

      <h1 className="steps-title">How to Convert 2D Image to 3D</h1>

      <div className="steps-container">

        {/* STEP 1 */}
        <div className="step-card">
          <img src="/public/upload.png" alt="Upload Image" />

          <h3>Step 1. Upload Your Photo</h3>

          <p>
            Let's begin with uploading an image. It can be portraits,
            characters, animals or logos. A clear and concise image
            will generate better results.
          </p>
        </div>

        {/* STEP 2 */}
        <div className="step-card">
          <img src="/public/choose3d.png" alt="Choose Effect" />

          <h3>Step 2. Choose a Desired 3D Effect</h3>

          <p>
            After uploading your photo, select from multiple 3D
            transformation styles to generate a realistic model.
          </p>
        </div>

        {/* STEP 3 */}
        <div className="step-card">
          <img src="/public/image.png" alt="Download 3D" />

          <h3>Step 3. Download Your First 3D Creation</h3>

          <p>
            Your 2D image will be converted into a detailed 3D
            model ready for preview and download.
          </p>
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

      <Link to="/Login">
        <button className="cta-btn">Upload Image</button>
      </Link>
    </section>

  </div>
</div>


);
};

export default Home;
