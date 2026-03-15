import React from "react";
import { Link } from "react-router-dom";

const s = {
  page: {
    minHeight: "100vh",
    padding: "100px 40px 60px",
    color: "white",
    maxWidth: "900px",
    margin: "0 auto",
    display: "block",
  },
  hero: {
    textAlign: "center",
    marginBottom: "64px",
  },
  tag: {
    display: "inline-block",
    padding: "6px 16px",
    borderRadius: "20px",
    background: "rgba(255,122,0,0.15)",
    border: "1px solid rgba(255,122,0,0.4)",
    color: "#ff7a00",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "20px",
    letterSpacing: "0.05em",
  },
  h1: {
    fontSize: "42px",
    fontWeight: 700,
    margin: "0 0 16px",
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.7,
    maxWidth: "600px",
    margin: "0 auto",
  },
  section: {
    marginBottom: "48px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#ff7a00",
    marginBottom: "16px",
  },
  text: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.8,
    marginBottom: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginTop: "24px",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "28px 24px",
    textAlign: "center",
  },
  cardIcon: { fontSize: "36px", marginBottom: "14px" },
  cardTitle: { fontSize: "16px", fontWeight: 600, marginBottom: "8px" },
  cardText: { fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 },
  divider: {
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    margin: "48px 0",
  },
  cta: {
    textAlign: "center",
    padding: "40px",
    background: "rgba(255,122,0,0.07)",
    border: "1px solid rgba(255,122,0,0.2)",
    borderRadius: "20px",
  },
  ctaTitle: { fontSize: "24px", fontWeight: 700, marginBottom: "12px" },
  ctaText: { fontSize: "15px", color: "rgba(255,255,255,0.6)", marginBottom: "24px" },
  ctaBtn: {
    display: "inline-block",
    padding: "12px 32px",
    borderRadius: "10px",
    background: "#ff7a00",
    color: "white",
    fontWeight: 600,
    fontSize: "15px",
    textDecoration: "none",
    transition: "0.2s",
  },
};

const features = [
  { icon: "🧠", title: "AI-Powered", text: "State-of-the-art machine learning models convert your 2D images into detailed 3D meshes." },
  { icon: "⚡", title: "Fast Processing", text: "Get your 3D model in seconds, not hours. Our pipeline is optimized for speed." },
  { icon: "🎨", title: "Texture Generation", text: "Automatic texture mapping ensures your 3D model looks realistic and detailed." },
  { icon: "📦", title: "Export Ready", text: "Download your models in standard formats, ready for use in any 3D application." },
];

const AboutUs = () => {
  return (
    <div style={s.page}>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.tag}>ABOUT SQ2CUBE</div>
        <h1 style={s.h1}>Turning Flat Images into<br />Living 3D Worlds</h1>
        <p style={s.subtitle}>
          Sq2Cube is an AI-powered platform that transforms ordinary 2D images into
          detailed, ready-to-use 3D models — in seconds.
        </p>
      </div>

      {/* Mission */}
      <div style={s.section}>
        <p style={s.sectionTitle}>Our Mission</p>
        <p style={s.text}>
          We believe 3D creation should be accessible to everyone — not just studios with
          expensive software and years of training. Sq2Cube was built to democratize 3D
          modeling by putting the power of AI in the hands of designers, developers,
          game creators, and everyday users.
        </p>
        <p style={s.text}>
          Whether you're building a game, designing a product, or just curious what your
          photo looks like in 3D — Sq2Cube makes it effortless.
        </p>
      </div>

      <hr style={s.divider} />

      {/* What we do */}
      <div style={s.section}>
        <p style={s.sectionTitle}>What We Do</p>
        <div style={s.grid}>
          {features.map(f => (
            <div key={f.title} style={s.card}>
              <div style={s.cardIcon}>{f.icon}</div>
              <div style={s.cardTitle}>{f.title}</div>
              <div style={s.cardText}>{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      <hr style={s.divider} />

      {/* Story */}
      <div style={s.section}>
        <p style={s.sectionTitle}>Our Story</p>
        <p style={s.text}>
          Sq2Cube started as a passion project — a simple question: "What if converting
          a photo to 3D was as easy as uploading a file?" That question turned into months
          of research, experimentation, and late-night builds.
        </p>
        <p style={s.text}>
          Today, Sq2Cube is a growing platform used by creators around the world. We're
          constantly improving our AI models, adding new features, and listening to our
          community to make the best 2D-to-3D tool on the planet.
        </p>
      </div>

      <hr style={s.divider} />

      {/* CTA */}
      <div style={s.cta}>
        <p style={s.ctaTitle}>Ready to Create?</p>
        <p style={s.ctaText}>
          Join thousands of creators already using Sq2Cube to bring their ideas to life.
        </p>
        <Link to="/signup" style={s.ctaBtn}>Get Started Free</Link>
      </div>

    </div>
  );
};

export default AboutUs;