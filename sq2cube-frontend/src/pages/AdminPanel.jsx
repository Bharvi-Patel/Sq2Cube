import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const s = {
  page:         { display:"block", minHeight:"100vh", padding:"80px 32px 60px", color:"white" },
  header:       { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px", flexWrap:"wrap", gap:"12px" },
  title:        { fontSize:"24px", fontWeight:700, margin:0 },
  tabs:         { display:"flex", gap:"8px", marginBottom:"28px", flexWrap:"wrap" },
  tab:          { padding:"8px 18px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"rgba(255,255,255,0.6)", fontSize:"14px", cursor:"pointer", transition:"0.2s" },
  tabActive:    { padding:"8px 18px", borderRadius:"8px", border:"1px solid #ff7a00", background:"rgba(255,122,0,0.15)", color:"#ff7a00", fontSize:"14px", cursor:"pointer", fontWeight:600 },
  grid:         { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(170px, 1fr))", gap:"14px", marginBottom:"28px" },
  card:         { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", padding:"18px" },
  cardNum:      { fontSize:"26px", fontWeight:700, color:"#ff7a00", margin:"0 0 4px" },
  cardLbl:      { fontSize:"12px", color:"rgba(255,255,255,0.5)", margin:0 },
  table:        { width:"100%", borderCollapse:"collapse" },
  th:           { textAlign:"left", fontSize:"12px", color:"rgba(255,255,255,0.4)", padding:"10px 12px", borderBottom:"1px solid rgba(255,255,255,0.08)", fontWeight:500 },
  td:           { fontSize:"13px", color:"rgba(255,255,255,0.85)", padding:"11px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)", verticalAlign:"middle" },
  badge:        (c) => ({ display:"inline-block", padding:"2px 8px", borderRadius:"4px", fontSize:"11px", fontWeight:600, background:`${c}22`, color:c }),
  btn:          (c) => ({ padding:"5px 12px", borderRadius:"6px", border:`1px solid ${c}`, background:"transparent", color:c, fontSize:"12px", cursor:"pointer", transition:"0.2s" }),
  section:      { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", overflow:"hidden", marginBottom:"24px" },
  sectionTitle: { fontSize:"15px", fontWeight:600, padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)", margin:0, display:"flex", alignItems:"center", justifyContent:"space-between" },
  empty:        { textAlign:"center", padding:"40px", color:"rgba(255,255,255,0.3)", fontSize:"14px" },
  searchBar:    { width:"100%", padding:"10px 16px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", color:"white", fontSize:"14px", outline:"none", marginBottom:"16px", boxSizing:"border-box" },
};

const TABS = ["Dashboard", "Users", "Generations", "Feedback"];

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]               = useState("Dashboard");
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [generations, setGens]      = useState([]);
  const [feedback, setFeedback]     = useState([]);
  const [loading, setLoading]       = useState(false);

  // Search
  const [userSearch, setUserSearch] = useState("");
  const [genSearch, setGenSearch]   = useState("");

  // Selected generations for bulk delete
  const [selected, setSelected]     = useState(new Set());

  // User profile modal
  const [viewUser, setViewUser]     = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Feedback reply
  const [replyId, setReplyId]       = useState(null);
  const [replyText, setReplyText]   = useState("");
  const [replySending, setReplySending] = useState(false);

  // Maintenance mode
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    if (!user.is_admin) { navigate("/"); return; }
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.is_admin) fetchTab(tab);
  }, [tab, user]);

  const fetchTab = async (t) => {
    setLoading(true);
    setSelected(new Set());
    try {
      if (t === "Dashboard") {
        const data = await api("/admin/stats");
        setStats(data);
        setMaintenance(data.maintenance_mode);
      } else if (t === "Users") {
        setUsers(await api("/admin/users"));
      } else if (t === "Generations") {
        setGens(await api("/admin/generations"));
      } else if (t === "Feedback") {
        setFeedback(await api("/admin/feedback"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── User actions ──────────────────────────────────────────────────────────
  const deleteUser = async (id) => {
    if (!confirm("Delete this user and all their data?")) return;
    await api(`/admin/users/${id}`, { method:"DELETE" });
    setUsers(users.filter(u => u.id !== id));
  };

  const banUser = async (id) => {
    const res = await api(`/admin/users/${id}/ban`, { method:"PATCH" });
    setUsers(users.map(u => u.id === id ? { ...u, is_banned: res.is_banned } : u));
  };

  const openUserProfile = async (id) => {
    setViewUser(id);
    setProfileLoading(true);
    try {
      const data = await api(`/admin/users/${id}`);
      setUserProfile(data);
    } catch (err) { console.error(err); }
    finally { setProfileLoading(false); }
  };

  // ── Generation actions ────────────────────────────────────────────────────
  const deleteGen = async (id) => {
    if (!confirm("Delete this generation?")) return;
    await api(`/admin/generations/${id}`, { method:"DELETE" });
    setGens(generations.filter(g => g.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const flagGen = async (id) => {
    const res = await api(`/admin/generations/${id}/flag`, { method:"PATCH" });
    setGens(generations.map(g => g.id === id ? { ...g, flagged: res.flagged } : g));
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredGens.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredGens.map(g => g.id)));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} selected generations?`)) return;
    await api("/admin/generations/bulk/delete", { method:"DELETE", body:{ ids: [...selected] } });
    setGens(generations.filter(g => !selected.has(g.id)));
    setSelected(new Set());
  };

  // ── Feedback actions ──────────────────────────────────────────────────────
  const markRead = async (id) => {
    await api(`/admin/feedback/${id}/read`, { method:"PATCH" });
    setFeedback(feedback.map(f => f.id === id ? { ...f, is_read:true } : f));
  };

  const deleteFeedback = async (id) => {
    if (!confirm("Delete this feedback?")) return;
    await api(`/admin/feedback/${id}`, { method:"DELETE" });
    setFeedback(feedback.filter(f => f.id !== id));
  };

  const sendReply = async (id) => {
    if (!replyText.trim()) return;
    setReplySending(true);
    try {
      await api(`/admin/feedback/${id}/reply`, { method:"POST", body:{ reply: replyText } });
      setFeedback(feedback.map(f => f.id === id ? { ...f, is_read:true } : f));
      setReplyId(null);
      setReplyText("");
      alert("Reply sent!");
    } catch (err) {
      alert(err.message || "Failed to send reply.");
    } finally {
      setReplySending(false);
    }
  };

  // ── Maintenance ───────────────────────────────────────────────────────────
  const toggleMaintenance = async () => {
    setMaintenanceLoading(true);
    try {
      const res = await api("/admin/maintenance", { method:"PATCH" });
      setMaintenance(res.maintenance_mode);
    } catch (err) { console.error(err); }
    finally { setMaintenanceLoading(false); }
  };

  // ── Filtered lists ────────────────────────────────────────────────────────
  const filteredUsers = userSearch
    ? users.filter(u =>
        u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : users;

  const filteredGens = genSearch
    ? generations.filter(g =>
        g.prompt?.toLowerCase().includes(genSearch.toLowerCase()) ||
        g.username?.toLowerCase().includes(genSearch.toLowerCase()) ||
        g.email?.toLowerCase().includes(genSearch.toLowerCase())
      )
    : generations;

  return (
    <div style={s.page}>
      {(authLoading || !user) && (
        <p style={{ opacity:0.5, textAlign:"center", paddingTop:"100px" }}>Loading...</p>
      )}

      {/* ── User Profile Modal ── */}
      {viewUser && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.8)",
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:9999, padding:"20px"
        }} onClick={() => setViewUser(null)}>
          <div style={{
            background:"#1a1a2e", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:"16px", padding:"32px", maxWidth:"560px", width:"100%",
            maxHeight:"80vh", overflowY:"auto"
          }} onClick={e => e.stopPropagation()}>
            {profileLoading ? (
              <p style={{ textAlign:"center", opacity:0.5 }}>Loading...</p>
            ) : userProfile && (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"24px" }}>
                  {userProfile.profile_image ? (
                    <img src={userProfile.profile_image} style={{ width:"64px", height:"64px", borderRadius:"50%", objectFit:"cover", border:"2px solid #ff7a00" }} />
                  ) : (
                    <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"#ff7a00", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px", fontWeight:700 }}>
                      {userProfile.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize:"18px", fontWeight:700, margin:"0 0 4px" }}>{userProfile.username}</p>
                    <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)", margin:0 }}>{userProfile.email}</p>
                  </div>
                  <button style={{ marginLeft:"auto", ...s.btn("#ef4444") }} onClick={() => setViewUser(null)}>✕ Close</button>
                </div>

                {/* Details */}
                <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:"10px", padding:"16px", marginBottom:"20px" }}>
                  {[
                    ["Joined",      userProfile.joined],
                    ["Gender",      userProfile.gender || "—"],
                    ["Phone",       userProfile.phone || "—"],
                    ["DOB",         userProfile.dob || "—"],
                    ["Provider",    userProfile.oauth_provider || "email"],
                    ["Verified",    userProfile.is_verified ? "✅ Yes" : "❌ No"],
                    ["Banned",      userProfile.is_banned ? "🚫 Yes" : "No"],
                    ["Generations", userProfile.total_generations],
                    ["Bio",         userProfile.bio || "—"],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.06)", fontSize:"13px" }}>
                      <span style={{ color:"rgba(255,255,255,0.45)" }}>{label}</span>
                      <span>{val}</span>
                    </div>
                  ))}
                </div>

                {/* Recent generations */}
                {userProfile.recent?.length > 0 && (
                  <>
                    <p style={{ fontSize:"13px", fontWeight:600, marginBottom:"12px", color:"rgba(255,255,255,0.6)" }}>Recent Generations</p>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" }}>
                      {userProfile.recent.map(r => (
                        <img key={r.id} src={r.image} style={{ width:"100%", aspectRatio:"1", objectFit:"cover", borderRadius:"8px" }} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {!authLoading && user?.is_admin && (<>
        <div style={s.header}>
          <h1 style={s.title}> Admin Panel</h1>
          <div style={{ display:"flex", alignItems:"center", gap:"16px", flexWrap:"wrap" }}>
            {/* Maintenance toggle */}
            <div style={{ display:"flex", alignItems:"center", gap:"10px", background:"rgba(255,255,255,0.05)", border:`1px solid ${maintenance ? "#ef4444" : "rgba(255,255,255,0.1)"}`, borderRadius:"10px", padding:"8px 14px" }}>
              <span style={{ fontSize:"13px", color: maintenance ? "#ef4444" : "rgba(255,255,255,0.5)" }}>
                {maintenance ? "🚧 Maintenance ON" : " Site is Live"}
              </span>
              <div
                onClick={!maintenanceLoading ? toggleMaintenance : undefined}
                style={{
                  width:"40px", height:"22px", borderRadius:"11px",
                  background: maintenance ? "#ef4444" : "rgba(255,255,255,0.15)",
                  position:"relative", cursor:"pointer", transition:"0.3s"
                }}
              >
                <div style={{
                  position:"absolute", top:"3px",
                  left: maintenance ? "21px" : "3px",
                  width:"16px", height:"16px", borderRadius:"50%",
                  background:"white", transition:"0.3s"
                }} />
              </div>
            </div>
            <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)" }}>
              Logged in as <strong style={{ color:"#ff7a00" }}>{user?.email}</strong>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {TABS.map(t => (
            <button key={t} style={tab === t ? s.tabActive : s.tab} onClick={() => setTab(t)}>
              {t}
              {t === "Feedback" && stats?.unread_feedback > 0 &&
                <span style={{ marginLeft:"6px", background:"#ef4444", color:"white", borderRadius:"10px", padding:"1px 6px", fontSize:"11px" }}>
                  {stats.unread_feedback}
                </span>
              }
            </button>
          ))}
        </div>

        {loading && <p style={{ opacity:0.5 }}>Loading...</p>}

        {/* ── DASHBOARD ── */}
        {tab === "Dashboard" && stats && (
          <>
            <div style={s.grid}>
              {[
                [stats.total_users,        "Total Users"],
                [stats.total_generations,  "Total Generations"],
                [stats.failed_generations, "Failed Generations"],
                [stats.flagged_count,      "Flagged Content"],
                [stats.banned_users,       "Banned Users"],
                [stats.unread_feedback,    "Unread Feedback"],
              ].map(([num, label]) => (
                <div key={label} style={s.card}>
                  <p style={s.cardNum}>{num}</p>
                  <p style={s.cardLbl}>{label}</p>
                </div>
              ))}
            </div>

            {/* Retention */}
            <div style={s.section}>
              <p style={s.sectionTitle}> User Retention (Last 7 Days)</p>
              <div style={{ padding:"20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"20px", flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:"200px" }}>
                    <div style={{ height:"10px", borderRadius:"5px", background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${stats.retention_rate}%`, background:"#ff7a00", borderRadius:"5px", transition:"width 0.5s" }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:"8px" }}>
                      <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>0%</span>
                      <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>100%</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:"32px", fontWeight:700, color:"#ff7a00", margin:"0 0 4px" }}>{stats.retention_rate}%</p>
                    <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", margin:0 }}>
                      {stats.retained_users} of {stats.total_older_users} users returned
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signups chart */}
            <div style={s.section}>
              <p style={s.sectionTitle}> Signups — Last 7 Days</p>
              <div style={{ padding:"20px", display:"flex", alignItems:"flex-end", gap:"8px", height:"120px" }}>
                {stats.signups_per_day.length === 0
                  ? <p style={s.empty}>No signups yet.</p>
                  : stats.signups_per_day.map(d => (
                    <div key={d.date} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", flex:1 }}>
                      <span style={{ fontSize:"11px", color:"#ff7a00" }}>{d.count}</span>
                      <div style={{ width:"100%", background:"#ff7a00", borderRadius:"4px 4px 0 0", height:`${Math.max(d.count * 20, 4)}px` }} />
                      <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)" }}>{d.date.slice(5)}</span>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Generations chart */}
            <div style={s.section}>
              <p style={s.sectionTitle}>Model Generations — Last 7 Days</p>
              <div style={{ padding:"20px", display:"flex", alignItems:"flex-end", gap:"8px", height:"120px" }}>
                {stats.generations_per_day.length === 0
                  ? <p style={s.empty}>No generations yet.</p>
                  : stats.generations_per_day.map(d => (
                    <div key={d.date} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", flex:1 }}>
                      <span style={{ fontSize:"11px", color:"#8b5cf6" }}>{d.count}</span>
                      <div style={{ width:"100%", background:"#8b5cf6", borderRadius:"4px 4px 0 0", height:`${Math.max(d.count * 20, 4)}px` }} />
                      <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)" }}>{d.date.slice(5)}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        )}

        {/* ── USERS ── */}
        {tab === "Users" && (
          <div style={s.section}>
            <p style={s.sectionTitle}>👥 All Users ({filteredUsers.length})</p>
            <div style={{ padding:"16px 20px 0" }}>
              <input
                style={s.searchBar}
                placeholder="🔍  Search by username or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>
            {filteredUsers.length === 0 ? <p style={s.empty}>No users found.</p> : (
              <div style={{ overflowX:"auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["ID","Username","Email","Verified","Provider","Gens","Joined","Actions"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td style={s.td}>{u.id}</td>
                        <td style={s.td}>
                          <span
                            style={{ cursor:"pointer", color:"#ff7a00", textDecoration:"underline" }}
                            onClick={() => openUserProfile(u.id)}
                          >
                            {u.username}
                          </span>
                        </td>
                        <td style={s.td}>{u.email}</td>
                        <td style={s.td}>
                          <span style={s.badge(u.is_verified ? "#22c55e" : "#ef4444")}>
                            {u.is_verified ? "Yes" : "No"}
                          </span>
                        </td>
                        <td style={s.td}>
                          <span style={s.badge("#8b5cf6")}>{u.oauth_provider || "email"}</span>
                        </td>
                        <td style={s.td}>{u.total_generations}</td>
                        <td style={s.td}>{u.joined}</td>
                        <td style={s.td}>
                          <div style={{ display:"flex", gap:"6px" }}>
                            <button style={s.btn("#6b7280")} onClick={() => openUserProfile(u.id)}>View</button>
                            <button style={s.btn(u.is_banned ? "#22c55e" : "#f59e0b")} onClick={() => banUser(u.id)}>
                              {u.is_banned ? "Unban" : "Ban"}
                            </button>
                            <button style={s.btn("#ef4444")} onClick={() => deleteUser(u.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── GENERATIONS ── */}
        {tab === "Generations" && (
          <div style={s.section}>
            <p style={s.sectionTitle}>
              <span> All Generations ({filteredGens.length})</span>
              {selected.size > 0 && (
                <button style={{ ...s.btn("#ef4444"), padding:"6px 14px" }} onClick={bulkDelete}>
                  🗑 Delete Selected ({selected.size})
                </button>
              )}
            </p>
            <div style={{ padding:"16px 20px 0" }}>
              <input
                style={s.searchBar}
                placeholder="🔍  Search by prompt, username or email..."
                value={genSearch}
                onChange={e => setGenSearch(e.target.value)}
              />
            </div>
            {filteredGens.length === 0 ? <p style={s.empty}>No generations found.</p> : (
              <div style={{ overflowX:"auto" }}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>
                        <input type="checkbox"
                          checked={selected.size === filteredGens.length && filteredGens.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      {["ID","User","Prompt","Status","Flagged","Date","Actions"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGens.map(g => (
                      <tr key={g.id} style={{ background: selected.has(g.id) ? "rgba(255,122,0,0.06)" : "transparent" }}>
                        <td style={s.td}>
                          <input type="checkbox"
                            checked={selected.has(g.id)}
                            onChange={() => toggleSelect(g.id)}
                          />
                        </td>
                        <td style={s.td}>{g.id}</td>
                        <td style={s.td}>
                          <div>{g.username}</div>
                          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)" }}>{g.email}</div>
                        </td>
                        <td style={{ ...s.td, maxWidth:"180px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {g.prompt || "—"}
                        </td>
                        <td style={s.td}>
                          <span style={s.badge(g.status === "success" ? "#22c55e" : "#ef4444")}>{g.status}</span>
                        </td>
                        <td style={s.td}>
                          <span style={s.badge(g.flagged ? "#ef4444" : "#6b7280")}>
                            {g.flagged ? "Flagged" : "Clean"}
                          </span>
                        </td>
                        <td style={s.td}>{g.date}</td>
                        <td style={s.td}>
                          <div style={{ display:"flex", gap:"6px" }}>
                            <button style={s.btn(g.flagged ? "#22c55e" : "#f59e0b")} onClick={() => flagGen(g.id)}>
                              {g.flagged ? "Unflag" : "Flag"}
                            </button>
                            <button style={s.btn("#ef4444")} onClick={() => deleteGen(g.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── FEEDBACK ── */}
        {tab === "Feedback" && (
          <div style={s.section}>
            <p style={s.sectionTitle}> Feedback & Reports ({feedback.length})</p>
            {feedback.length === 0 ? <p style={s.empty}>No feedback yet.</p> : (
              feedback.map(f => (
                <div key={f.id} style={{
                  padding:"18px 20px",
                  borderBottom:"1px solid rgba(255,255,255,0.06)",
                  background: f.is_read ? "transparent" : "rgba(255,122,0,0.04)"
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                    <div>
                      <span style={{ fontWeight:600, fontSize:"14px" }}>{f.name || "Anonymous"}</span>
                      <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"13px", marginLeft:"10px" }}>{f.email}</span>
                      {!f.is_read && <span style={{ ...s.badge("#ff7a00"), marginLeft:"10px" }}>New</span>}
                    </div>
                    <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>{f.date}</span>
                  </div>
                  {f.subject && <p style={{ fontSize:"13px", fontWeight:600, color:"#ff7a00", margin:"0 0 6px" }}>{f.subject}</p>}
                  <p style={{ fontSize:"14px", color:"rgba(255,255,255,0.75)", margin:"0 0 12px", lineHeight:1.6 }}>{f.message}</p>

                  {/* Reply box */}
                  {replyId === f.id && (
                    <div style={{ marginBottom:"12px" }}>
                      <textarea
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        style={{
                          width:"100%", minHeight:"80px", padding:"10px",
                          borderRadius:"8px", border:"1px solid rgba(255,255,255,0.15)",
                          background:"rgba(255,255,255,0.05)", color:"white",
                          fontSize:"13px", resize:"vertical", outline:"none",
                          boxSizing:"border-box", fontFamily:"inherit", marginBottom:"8px"
                        }}
                      />
                      <div style={{ display:"flex", gap:"8px" }}>
                        <button style={{ ...s.btn("#22c55e"), padding:"6px 14px" }}
                          onClick={() => sendReply(f.id)} disabled={replySending}>
                          {replySending ? "Sending..." : "✉️ Send Reply"}
                        </button>
                        <button style={{ ...s.btn("#6b7280"), padding:"6px 14px" }}
                          onClick={() => { setReplyId(null); setReplyText(""); }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {!f.is_read && (
                      <button style={s.btn("#22c55e")} onClick={() => markRead(f.id)}>Mark as Read</button>
                    )}
                    <button style={s.btn("#3b82f6")} onClick={() => {
                      setReplyId(replyId === f.id ? null : f.id);
                      setReplyText("");
                    }}>
                      {replyId === f.id ? "Cancel Reply" : "✉️ Reply"}
                    </button>
                    <button style={s.btn("#ef4444")} onClick={() => deleteFeedback(f.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </>)}
    </div>
  );
};

export default AdminPanel;