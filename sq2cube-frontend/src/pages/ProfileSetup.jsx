import React, { useState, useEffect } from "react";
import "./ProfileSetup.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [image, setImage]       = useState(null);
  const [username, setUsername] = useState("");
  const [gender, setGender]     = useState("");
  const [phone, setPhone]       = useState("");
  const [dob, setDob]           = useState("");
  const [about, setAbout]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);

  // Pre-fill all fields from the database
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

  const toBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await toBase64(file);
    setImage(base64);
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
    <section className="profile-page">
      <div className="profile-card">

        {/* Profile Image */}
        <div className="profile-image-wrapper">
          <label htmlFor="profileUpload">
            <div className="profile-circle"
              style={{
                backgroundImage: image ? `url(${image})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}>
              {!image && <span>+</span>}
            </div>
          </label>
          <input id="profileUpload" type="file" accept="image/*"
            onChange={handleImageChange} hidden />
        </div>

        <h2>Edit your profile</h2>
        <p className="profile-subtitle">Update your details below</p>

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
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
            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>About Me</label>
            <textarea
              placeholder="Write something about yourself"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>

          <button className="save-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </button>

        </form>
      </div>
    </section>
  );
};

export default ProfileSetup;