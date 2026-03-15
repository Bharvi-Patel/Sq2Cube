import React, { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    q: "How do I convert a 2D image to 3D?",
    a: "Simply go to the Upload page, drop your image or use the text prompt, then click 'Gen Shape'. Our AI will process your image and generate a 3D mesh automatically."
  },
  {
    q: "What image formats are supported?",
    a: "We support all common image formats including JPG, PNG, WEBP, and GIF. For best results, use a clear image with a single subject on a plain background."
  },
  {
    q: "How long does generation take?",
    a: "Most generations complete within a few seconds. Complex images with lots of detail may take slightly longer."
  },
  {
    q: "Can I download my 3D model?",
    a: "Yes! Once your model is generated, use the Export button in the preview panel to download it."
  },
  {
    q: "Where can I find my previous generations?",
    a: "All your past generations are saved in the History page, accessible from the navbar when you're logged in."
  },
  {
    q: "How do I reset my password?",
    a: "Go to the Login page and click 'Forgot Password?'. Enter your email and we'll send you a reset link valid for 1 hour."
  },
  {
    q: "Can I change my profile picture?",
    a: "Yes! Go to your Profile page and click 'Edit Profile'. You can upload a new photo and use the crop tool to adjust it perfectly."
  },
  {
    q: "How do I delete my account?",
    a: "Go to your Profile page and scroll to the 'Danger Zone' section at the bottom. Click 'Delete Account' and confirm. This permanently deletes all your data."
  },
];

const s = {
  page: {
    minHeight: "100vh",
    padding: "100px 40px 60px",
    color: "white",
    maxWidth: "860px",
    margin: "0 auto",
  },
  hero: { textAlign: "center", marginBottom: "52px" },
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
  },
  h1: { fontSize: "38px", fontWeight: 700, margin: "0 0 14px" },
  subtitle: { fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "52px",
  },
  quickCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    padding: "22px",
    textDecoration: "none",
    color: "white",
    transition: "0.2s",
    display: "block",
  },
  quickIcon: { fontSize: "28px", marginBottom: "10px" },
  quickTitle: { fontSize: "15px", fontWeight: 600, marginBottom: "6px" },
  quickText: { fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 },
  sectionTitle: { fontSize: "22px", fontWeight: 600, marginBottom: "20px" },
  faqItem: {
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  faqQ: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 4px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 500,
    userSelect: "none",
  },
  faqA: {
    padding: "0 4px 18px",
    fontSize: "14px",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.7,
  },
  divider: {
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    margin: "48px 0",
  },
  stillNeed: {
    background: "rgba(255,122,0,0.07)",
    border: "1px solid rgba(255,122,0,0.2)",
    borderRadius: "16px",
    padding: "32px",
    textAlign: "center",
  },
  stillTitle: { fontSize: "20px", fontWeight: 700, marginBottom: "10px" },
  stillText: { fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "20px" },
  stillBtn: {
    display: "inline-block",
    padding: "11px 28px",
    borderRadius: "10px",
    background: "#ff7a00",
    color: "white",
    fontWeight: 600,
    fontSize: "14px",
    textDecoration: "none",
  },
};

const quickLinks = [
  { icon: "🚀", title: "Getting Started", text: "New to Sq2Cube? Learn how to make your first 3D model.", to: "/upload" },
  { icon: "👤", title: "Account Settings", text: "Update your profile, photo, and personal details.", to: "/profileSetup" },
  { icon: "🕐", title: "View History", text: "Access all your previously generated 3D models.", to: "/history" },
  { icon: "📬", title: "Contact Support", text: "Can't find your answer? Send us a message directly.", to: "/contact" },
];

const Help = () => {
  const [open, setOpen] = useState(null);

  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <div style={s.page}>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.tag}>HELP CENTER</div>
        <h1 style={s.h1}>How Can We Help?</h1>
        <p style={s.subtitle}>
          Find answers to common questions, or reach out to our support team.
        </p>
      </div>

      {/* Quick Links */}
      <div style={s.grid}>
        {quickLinks.map(l => (
          <Link key={l.title} to={l.to} style={s.quickCard}>
            <div style={s.quickIcon}>{l.icon}</div>
            <div style={s.quickTitle}>{l.title}</div>
            <div style={s.quickText}>{l.text}</div>
          </Link>
        ))}
      </div>

      {/* FAQ */}
      <p style={s.sectionTitle}>Frequently Asked Questions</p>
      <div>
        {faqs.map((faq, i) => (
          <div key={i} style={s.faqItem}>
            <div style={s.faqQ} onClick={() => toggle(i)}>
              <span>{faq.q}</span>
              <span style={{ color: "#ff7a00", fontSize: "20px", fontWeight: 300 }}>
                {open === i ? "−" : "+"}
              </span>
            </div>
            {open === i && (
              <div style={s.faqA}>{faq.a}</div>
            )}
          </div>
        ))}
      </div>

      <hr style={s.divider} />

      {/* Still need help */}
      <div style={s.stillNeed}>
        <p style={s.stillTitle}>Still Need Help?</p>
        <p style={s.stillText}>
          Can't find what you're looking for? Our support team is ready to help you out.
        </p>
        <Link to="/contact" style={s.stillBtn}>Contact Support</Link>
      </div>

    </div>
  );
};

export default Help;