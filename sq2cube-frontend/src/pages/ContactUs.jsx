import React, { useState } from "react";

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
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 1.6fr",
    gap: "40px",
    alignItems: "flex-start",
  },
  infoCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "28px",
  },
  infoTitle: { fontSize: "16px", fontWeight: 600, marginBottom: "20px", color: "#ff7a00" },
  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "20px",
  },
  infoIcon: { fontSize: "22px", flexShrink: 0, marginTop: "2px" },
  infoLabel: { fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" },
  infoValue: { fontSize: "14px", color: "white" },
  formCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "32px",
  },
  formTitle: { fontSize: "18px", fontWeight: 600, marginBottom: "24px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  group: { marginBottom: "18px" },
  label: { display: "block", fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "6px" },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  textarea: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    minHeight: "120px",
    fontFamily: "inherit",
  },
  btn: {
    width: "100%",
    padding: "13px",
    borderRadius: "10px",
    border: "none",
    background: "#ff7a00",
    color: "white",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "0.2s",
    marginTop: "4px",
  },
  success: {
    textAlign: "center",
    padding: "40px 20px",
  },
  successIcon: { fontSize: "52px", marginBottom: "16px" },
  successTitle: { fontSize: "22px", fontWeight: 700, marginBottom: "10px" },
  successText: { fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 },
};

const ContactUs = () => {
  const [form, setForm]     = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSent(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>

      <div style={s.hero}>
        <div style={s.tag}>CONTACT US</div>
        <h1 style={s.h1}>We'd Love to Hear From You</h1>
        <p style={s.subtitle}>
          Have a question, feedback, or just want to say hi?<br />
          Send us a message and we'll get back to you shortly.
        </p>
      </div>

      <div style={s.layout}>

        {/* Left — contact info */}
        <div style={s.infoCard}>
          <p style={s.infoTitle}>Get in Touch</p>

          {[
            { icon: "📧", label: "Email", value: "sq2cube03@gmail.com" },
            { icon: "🕐", label: "Response Time", value: "Within 24 hours" },
            { icon: "🌍", label: "Support", value: "Available worldwide" },
          ].map(item => (
            <div key={item.label} style={s.infoItem}>
              <span style={s.infoIcon}>{item.icon}</span>
              <div>
                <p style={s.infoLabel}>{item.label}</p>
                <p style={s.infoValue}>{item.value}</p>
              </div>
            </div>
          ))}

          <div style={{
            marginTop: "28px",
            padding: "16px",
            background: "rgba(255,122,0,0.08)",
            border: "1px solid rgba(255,122,0,0.2)",
            borderRadius: "10px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.6,
          }}>
            💡 For bug reports or feature requests, please include as much detail as possible so we can help you faster.
          </div>
        </div>

        {/* Right — form */}
        <div style={s.formCard}>
          {sent ? (
            <div style={s.success}>
              <div style={s.successIcon}>📬</div>
              <p style={s.successTitle}>Message Sent!</p>
              <p style={s.successText}>
                Thanks for reaching out! We've received your message and will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <>
              <p style={s.formTitle}>Send a Message</p>
              <form onSubmit={handleSubmit}>

                <div style={s.row}>
                  <div style={s.group}>
                    <label style={s.label}>Name</label>
                    <input style={s.input} name="name" placeholder="Your name"
                      value={form.name} onChange={handle} required />
                  </div>
                  <div style={s.group}>
                    <label style={s.label}>Email</label>
                    <input style={s.input} name="email" type="email" placeholder="your@email.com"
                      value={form.email} onChange={handle} required />
                  </div>
                </div>

                <div style={s.group}>
                  <label style={s.label}>Subject</label>
                  <input style={s.input} name="subject" placeholder="What's this about?"
                    value={form.subject} onChange={handle} />
                </div>

                <div style={s.group}>
                  <label style={s.label}>Message</label>
                  <textarea style={s.textarea} name="message" placeholder="Write your message here..."
                    value={form.message} onChange={handle} required />
                </div>

                {error && (
                  <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
                )}

                <button style={s.btn} type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </button>

              </form>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default ContactUs;