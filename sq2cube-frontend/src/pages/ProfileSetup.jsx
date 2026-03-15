import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import "./ProfileSetup.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

/* ── Image Cropper Component ── */
const ImageCropper = ({ src, onDone, onCancel }) => {
  const [scale, setScale]   = useState(1);
  const [pos, setPos]       = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const circleRef = useRef(null);
  const SIZE = 280;

  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };

  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragStart.current) return;
    setPos({
      x: dragStart.current.px + (e.clientX - dragStart.current.mx),
      y: dragStart.current.py + (e.clientY - dragStart.current.my),
    });
  }, [dragging]);

  const onMouseUp = () => setDragging(false);

  // Scroll to zoom
  const onWheel = (e) => {
    e.preventDefault();
    setScale(prev => Math.min(3, Math.max(0.5, prev - e.deltaY * 0.001)));
  };

  // Touch support
  const onTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { mx: t.clientX, my: t.clientY, px: pos.x, py: pos.y };
  };

  const onTouchMove = (e) => {
    if (!dragging || !dragStart.current) return;
    const t = e.touches[0];
    setPos({
      x: dragStart.current.px + (t.clientX - dragStart.current.mx),
      y: dragStart.current.py + (t.clientY - dragStart.current.my),
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove]);

  // Attach wheel with passive:false so preventDefault works
  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleCrop = () => {
    const canvas = document.createElement("canvas");
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");

    // Circular clip
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    const img = new Image();
    img.src = src;
    img.onload = () => {
      const scaledW = img.naturalWidth  * scale;
      const scaledH = img.naturalHeight * scale;
      const offsetX = (SIZE - scaledW) / 2 + pos.x;
      const offsetY = (SIZE - scaledH) / 2 + pos.y;
      ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
      onDone(canvas.toDataURL("image/jpeg", 0.9));
    };
  };

  return createPortal(
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.92)",
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", zIndex:99999, gap:"20px",
      top:0, left:0, width:"100vw", height:"100vh"
    }}>
      <p style={{ color:"white", fontSize:"15px", margin:0 }}>
        Drag to reposition ·  slide to zoom
      </p>

      {/* Circular preview frame */}
      <div style={{
        width:`${SIZE}px`, height:`${SIZE}px`,
        borderRadius:"50%", overflow:"hidden",
        border:"3px solid #ff7a00", cursor: dragging ? "grabbing" : "grab",
        position:"relative", background:"#111", flexShrink:0
      }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
      >
        <img
          src={src}
          draggable={false}
          style={{
            position:"absolute",
            left:`calc(50% + ${pos.x}px)`,
            top:`calc(50% + ${pos.y}px)`,
            transform:`translate(-50%, -50%) scale(${scale})`,
            transformOrigin:"center",
            maxWidth:"none",
            userSelect:"none",
            pointerEvents:"none",
          }}
        />
      </div>

      {/* Zoom slider */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
        <span style={{ color:"rgba(255,255,255,0.5)", fontSize:"13px" }}>🔍</span>
        <input
          type="range" min="0.5" max="3" step="0.01"
          value={scale}
          onChange={e => setScale(parseFloat(e.target.value))}
          style={{ width:"200px", accentColor:"#ff7a00" }}
        />
        <span style={{ color:"rgba(255,255,255,0.5)", fontSize:"13px" }}>{Math.round(scale * 100)}%</span>
      </div>

      {/* Buttons */}
      <div style={{ display:"flex", gap:"12px" }}>
        <button onClick={handleCrop} style={{
          padding:"10px 28px", borderRadius:"8px", border:"none",
          background:"#ff7a00", color:"white", fontSize:"14px",
          fontWeight:600, cursor:"pointer"
        }}>
          Apply
        </button>
        <button onClick={onCancel} style={{
          padding:"10px 28px", borderRadius:"8px",
          border:"1px solid rgba(255,255,255,0.2)", background:"transparent",
          color:"white", fontSize:"14px", cursor:"pointer"
        }}>
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
};


/* ── ProfileSetup Page ── */
const ProfileSetup = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [image, setImage]         = useState(null);
  const [rawImage, setRawImage]   = useState(null); // before crop
  const [cropping, setCropping]   = useState(false);
  const [username, setUsername]   = useState("");
  const [gender, setGender]       = useState("");
  const [phone, setPhone]         = useState("");
  const [dob, setDob]             = useState("");
  const [about, setAbout]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);

  useEffect(() => {
    api("/profile/me")
      .then((data) => {
        setUsername(data.username || "");
        setAbout(data.bio || "");
        setGender(data.gender || "");
        setPhone(data.phone || "");
        setDob(data.dob || "");
        if (data.profile_image) setImage(data.profile_image);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result);
      setCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropDone = (croppedBase64) => {
    setImage(croppedBase64);
    setCropping(false);
    setRawImage(null);
  };

  const handleCropCancel = () => {
    setCropping(false);
    setRawImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/profile/setup", {
        method: "POST",
        body: { username, bio: about, profile_image: image, gender, phone, dob }
      });
      await refreshUser();
      navigate("/profile");
    } catch (err) {
      alert(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <section className="profile-page">
      <div className="profile-card">
        <p style={{ textAlign:"center", color:"white", opacity:0.6 }}>Loading...</p>
      </div>
    </section>
  );

  return (
    <>
      {/* Cropper overlay */}
      {cropping && rawImage && (
        <ImageCropper
          src={rawImage}
          onDone={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}

      <section className="profile-page">
        <div className="profile-card">

          {/* Profile Image */}
          <div className="profile-image-wrapper">
            <label htmlFor="profileUpload" style={{ cursor:"pointer" }}>
              <div className="profile-circle" style={{
                backgroundImage: image ? `url(${image})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}>
                {!image && <span>+</span>}
                {/* Edit overlay */}
                <div style={{
                  position:"absolute", inset:0, borderRadius:"50%",
                  background:"rgba(0,0,0,0.4)", display:"flex",
                  alignItems:"center", justifyContent:"center",
                  opacity:0, transition:"opacity 0.2s",
                  fontSize:"13px", color:"white", fontWeight:600,
                }} className="profile-circle-overlay">
                  ✏️ Edit
                </div>
              </div>
            </label>
            <input id="profileUpload" type="file" accept="image/*"
              onChange={handleImageChange} hidden />

          </div>

          <p
            onClick={() => document.getElementById("profileUpload").click()}
            style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)", textAlign:"center", cursor:"pointer", margin:"8px 0 16px" }}
          >
            Edit Picture
          </p>
          <h2>Edit your profile</h2>
          <p className="profile-subtitle">Update your details below</p>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>Username</label>
              <input type="text" placeholder="Enter username"
                value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="Enter phone number"
                value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Date of Birth</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>

            <div className="input-group">
              <label>About Me</label>
              <textarea placeholder="Write something about yourself"
                value={about} onChange={(e) => setAbout(e.target.value)} />
            </div>

            <button className="save-btn" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </button>

          </form>
        </div>
      </section>
    </>
  );
};

export default ProfileSetup;