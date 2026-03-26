import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const s = {
  page: {
    display:"block", width:"100%", maxWidth:"680px",
    margin:"0 auto", padding:"100px 24px 60px", color:"white"
  },
  top: {
    display:"flex", flexDirection:"column", alignItems:"center",
    textAlign:"center", marginBottom:"36px", gap:"10px"
  },
  avatarImg: {
    width:"100px", height:"100px", borderRadius:"50%",
    objectFit:"cover", border:"3px solid #ff7a00"
  },
  avatarPlaceholder: {
    width:"100px", height:"100px", borderRadius:"50%",
    background:"#ff7a00", display:"flex", alignItems:"center",
    justifyContent:"center", fontSize:"40px", fontWeight:600, color:"white"
  },
  username: { fontSize:"24px", fontWeight:600, margin:0 },
  email:    { fontSize:"14px", color:"rgba(255,255,255,0.5)", margin:0 },
  bio:      { fontSize:"14px", color:"rgba(255,255,255,0.7)", lineHeight:1.6, margin:0 },
  editBtn:  {
    display:"inline-block", padding:"8px 22px", borderRadius:"8px",
    border:"1px solid rgba(255,122,0,0.6)", color:"#ff7a00",
    fontSize:"14px", textDecoration:"none"
  },
  stats: {
    display:"grid", gridTemplateColumns:"repeat(3,1fr)",
    gap:"12px", marginBottom:"28px"
  },
  statCard: {
    display:"flex", flexDirection:"column", alignItems:"center", gap:"6px",
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:"12px", padding:"16px 8px"
  },
  statNum:   { fontSize:"20px", fontWeight:600, color:"#ff7a00" },
  statLabel: { fontSize:"12px", color:"rgba(255,255,255,0.5)", textAlign:"center" },
  sectionTitle: {
    display:"flex", alignItems:"center", gap:"12px",
    fontSize:"15px", fontWeight:600, color:"rgba(255,255,255,0.9)",
    margin:"0 0 12px"
  },
  seeAll: { fontSize:"13px", fontWeight:400, color:"#ff7a00", textDecoration:"none" },
  detailsCard: {
    display:"block", width:"100%",
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:"12px", padding:"0 20px", marginBottom:"28px"
  },
  detailRow: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.07)"
  },
  detailRowLast: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"14px 0"
  },
  detailLabel: { fontSize:"13px", color:"rgba(255,255,255,0.45)", flexShrink:0 },
  detailValue: { fontSize:"14px", color:"white", textAlign:"right" },
  recentGrid: {
    display:"grid", gridTemplateColumns:"repeat(2,1fr)",
    gap:"14px", marginBottom:"32px"
  },
  recentCard: {
    display:"block", borderRadius:"10px", overflow:"hidden",
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)"
  },
  recentImg:  { display:"block", width:"100%", aspectRatio:"1", objectFit:"cover" },
  recentPrompt: {
    fontSize:"11px", color:"rgba(255,255,255,0.5)",
    padding:"8px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
  },
  dangerZone: {
    display:"block", width:"100%",
    border:"1px solid rgba(239,68,68,0.3)", borderRadius:"12px",
    padding:"20px", marginTop:"8px"
  },
  dangerTitle: { fontSize:"15px", fontWeight:600, color:"#ef4444", marginBottom:"8px" },
  dangerDesc:  { fontSize:"14px", color:"rgba(255,255,255,0.5)", marginBottom:"14px", lineHeight:1.5 },
  deleteBtn: {
    padding:"9px 20px", borderRadius:"8px",
    border:"1px solid #ef4444", background:"transparent",
    color:"#ef4444", fontSize:"14px", cursor:"pointer"
  },
  confirmBox: {
    background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.3)",
    borderRadius:"8px", padding:"16px"
  },
  confirmText: { fontSize:"14px", color:"rgba(255,255,255,0.8)", marginBottom:"14px", lineHeight:1.5 },
  confirmActions: { display:"flex", gap:"12px" },
  confirmYes: {
    padding:"9px 18px", borderRadius:"8px", border:"none",
    background:"#ef4444", color:"white", fontSize:"14px", cursor:"pointer"
  },
  confirmNo: {
    padding:"9px 18px", borderRadius:"8px",
    border:"1px solid rgba(255,255,255,0.2)", background:"transparent",
    color:"white", fontSize:"14px", cursor:"pointer"
  },
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile]         = useState(user || null);
  const [loading, setLoading]         = useState(true);
  const [deleting, setDeleting]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    api("/profile/me")
      .then(setProfile)
      .catch((err) => {
        if (err?.status === 401 || err?.status === 403) {
          logout();
          navigate("/login");
          return;
        }
        // Keep existing profile state if available for transient failures.
        if (!profile) {
          alert("Could not load profile right now. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api("/account", { method: "DELETE" });
      logout();
      navigate("/");
    } catch (err) {
      alert(err.message || "Failed to delete account.");
      setDeleting(false);
    }
  };

  if (loading) return <div style={s.page}><p style={{textAlign:"center",opacity:0.6}}>Loading...</p></div>;
  if (!profile) return null;

  const details = [
    ["Username",     profile.username],
    ["Email",        profile.email],
    ["Member since", profile.member_since],
    ["Bio",          profile.bio || "—"],
  ];

  return (
    <div style={s.page}>

      {/* TOP */}
      <div style={s.top}>
        {profile.profile_image
          ? <img src={profile.profile_image} alt="avatar" style={s.avatarImg} />
          : <div style={s.avatarPlaceholder}>{profile.username?.[0]?.toUpperCase() || "U"}</div>
        }
        <h1 style={s.username}>{profile.username}</h1>
        <p  style={s.email}>{profile.email}</p>
        {profile.bio && <p style={s.bio}>{profile.bio}</p>}
        <Link to="/profileSetup" style={s.editBtn}>Edit Profile</Link>
      </div>

      {/* STATS */}
      <div style={s.stats}>
        {[
          [profile.total_generations, "Models Generated"],
          [profile.recent?.length || 0, "Recent"],
          [profile.member_since, "Member Since"],
        ].map(([num, label]) => (
          <div key={label} style={s.statCard}>
            <span style={s.statNum}>{num}</span>
            <span style={s.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* ACCOUNT DETAILS */}
      <p style={s.sectionTitle}>Account Details</p>
      <div style={s.detailsCard}>
        {details.map(([label, value], i) => (
          <div key={label} style={i === details.length - 1 ? s.detailRowLast : s.detailRow}>
            <span style={s.detailLabel}>{label}</span>
            <span style={s.detailValue}>{value}</span>
          </div>
        ))}
      </div>

      {/* HEATMAP */}
      <p style={s.sectionTitle}>Activity — last 12 months</p>
      <Heatmap activity={profile.activity || {}} />

      {/* RECENT */}
      <p style={{...s.sectionTitle, marginTop:"28px"}}>
        Recent Generations
        <Link to="/history" style={s.seeAll}>See all →</Link>
      </p>
      <div style={s.recentGrid}>
        {profile.recent && profile.recent.length > 0 ? (
          profile.recent.map((item) => (
            <div key={item.id} style={s.recentCard}>
              <img src={item.image} alt="generation" style={s.recentImg} />
              {item.prompt && <p style={s.recentPrompt}>{item.prompt}</p>}
            </div>
          ))
        ) : (
          <p style={{color:"rgba(255,255,255,0.4)", fontSize:"14px", gridColumn:"1/-1"}}>
            No generations yet. <Link to="/upload" style={{color:"#ff7a00"}}>Start creating!</Link>
          </p>
        )}
      </div>

      {/* DANGER ZONE */}
      <div style={s.dangerZone}>
        <p style={s.dangerTitle}>Danger Zone</p>
        <p style={s.dangerDesc}>Permanently delete your account and all your data. This cannot be undone.</p>

        {!showConfirm ? (
          <button style={s.deleteBtn} onClick={() => setShowConfirm(true)}>
            Delete Account
          </button>
        ) : (
          <div style={s.confirmBox}>
            <p style={s.confirmText}>
              Are you sure? This will delete all your models, history, and account data forever.
            </p>
            <div style={s.confirmActions}>
              <button style={s.confirmYes} onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? "Deleting..." : "Yes, delete everything"}
              </button>
              <button style={s.confirmNo} onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};


/* ── Heatmap ── */
const Heatmap = ({ activity }) => {
  const today = new Date();
  const WEEKS = 52;

  const cells = [];
  for (let i = WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    cells.push({ key, count: activity[key] || 0, date: d });
  }

  const weeks = [];
  for (let w = 0; w < WEEKS; w++) weeks.push(cells.slice(w * 7, w * 7 + 7));

  const getColor = (n) => {
    if (n === 0) return "rgba(255,255,255,0.05)";
    if (n === 1) return "rgba(255,122,0,0.25)";
    if (n === 2) return "rgba(255,122,0,0.5)";
    if (n === 3) return "rgba(255,122,0,0.75)";
    return "#ff7a00";
  };

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthLabels = weeks.map((week, wi) => {
    const d = week[0]?.date;
    if (!d) return "";
    if (wi === 0 || d.getDate() <= 7) return months[d.getMonth()];
    return "";
  });

  const wrap = {
    display:"block", width:"100%",
    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:"12px", padding:"16px 20px", marginBottom:"28px", overflowX:"auto"
  };

  return (
    <div style={wrap}>
      <div style={{display:"flex", gap:"3px", marginBottom:"4px"}}>
        {weeks.map((_, wi) => (
          <div key={wi} style={{width:"13px", fontSize:"10px", color:"rgba(255,255,255,0.4)", whiteSpace:"nowrap"}}>
            {monthLabels[wi]}
          </div>
        ))}
      </div>

      <div style={{display:"flex", gap:"3px"}}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{display:"flex", flexDirection:"column", gap:"3px"}}>
            {week.map((cell) => (
              <div key={cell.key}
                style={{width:"13px", height:"13px", borderRadius:"2px", flexShrink:0, background:getColor(cell.count)}}
                title={`${cell.key}: ${cell.count} generation${cell.count !== 1 ? "s" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{display:"flex", alignItems:"center", gap:"4px", marginTop:"10px", fontSize:"11px", color:"rgba(255,255,255,0.4)"}}>
        <span>Less</span>
        {[0,1,2,3,4].map(n => (
          <div key={n} style={{width:"13px", height:"13px", borderRadius:"2px", background:getColor(n)}} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default Profile;