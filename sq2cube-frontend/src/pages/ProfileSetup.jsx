import React, { useState } from "react";
import "./ProfileSetup.css";
import { useNavigate } from "react-router-dom";

const ProfileSetup = () => {

  const navigate = useNavigate();

  const [image, setImage] = useState(() => {
    return localStorage.getItem("profilePic") || null;
  });

  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [about, setAbout] = useState("");

  // Upload profile image
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageURL = URL.createObjectURL(file);

      setImage(imageURL);
      localStorage.setItem("profilePic", imageURL);
    }
  };

  // Save profile
  const handleSubmit = (e) => {
    e.preventDefault();

    const profileData = {
      username,
      gender,
      phone,
      dob,
      about,
      profilePic: image
    };

    localStorage.setItem("userProfile", JSON.stringify(profileData));

    alert("Profile saved successfully!");

    navigate("/upload");
    window.location.reload(); // refresh navbar
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("profilePic");
    localStorage.removeItem("userProfile");

    navigate("/login");
    window.location.reload();
  };

  return (
    <section className="profile-page">
      <div className="profile-card">

        {/* Profile Image */}
        <div className="profile-image-wrapper">

          <label htmlFor="profileUpload">
            <div
              className="profile-circle"
              style={{
                backgroundImage: image ? `url(${image})` : "none"
              }}
            >
              {!image && <span>+</span>}
            </div>
          </label>

          <input
            id="profileUpload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />

        </div>

        <h2>Complete your profile</h2>
        <p className="profile-subtitle">
          One last step to join the community
        </p>

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
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
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

          <button className="save-btn" type="submit">
            Save Profile
          </button>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </form>

      </div>
    </section>
  );
};

export default ProfileSetup;