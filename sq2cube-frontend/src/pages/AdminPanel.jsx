import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const s = {
  page:    { display:"block", minHeight:"100vh", padding:"80px 32px 60px", color:"white" },
  header:  { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"32px" },
  title:   { fontSize:"24px", fontWeight:700, margin:0 },
  tabs:    { display:"flex", gap:"8px", marginBottom:"28px", flexWrap:"wrap" },
  tab:     { padding:"8px 18px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"rgba(255,255,255,0.6)", fontSize:"14px", cursor:"pointer", transition:"0.2s" },
  tabActive:{ padding:"8px 18px", borderRadius:"8px", border:"1px solid #ff7a00", background:"rgba(255,122,0,0.15)", color:"#ff7a00", fontSize:"14px", cursor:"pointer", fontWeight:600 },
  grid:    { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:"16px", marginBottom:"32px" },
  card:    { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", padding:"20px" },
  cardNum: { fontSize:"28px", fontWeight:700, color:"#ff7a00", margin:"0 0 6px" },
  cardLbl: { fontSize:"13px", color:"rgba(255,255,255,0.5)", margin:0 },
  table:   { width:"100%", borderCollapse:"collapse" },
  th:      { textAlign:"left", fontSize:"12px", color:"rgba(255,255,255,0.4)", padding:"10px 12px", borderBottom:"1px solid rgba(255,255,255,0.08)", fontWeight:500 },
  td:      { fontSize:"13px", color:"rgba(255,255,255,0.85)", padding:"12px", borderBottom:"1px solid rgba(255,255,255,0.06)", verticalAlign:"middle" },
  badge:   (color) => ({ display:"inline-block", padding:"2px 8px", borderRadius:"4px", fontSize:"11px", fontWeight:600, background:`${color}22`, color }),
  btn:     (color) => ({ padding:"5px 12px", borderRadius:"6px", border:`1px solid ${color}`, background:"transparent", color, fontSize:"12px", cursor:"pointer", transition:"0.2s" }),
  section: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", overflow:"hidden", marginBottom:"24px" },
  sectionTitle: { fontSize:"15px", fontWeight:600, padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)", margin:0 },
  empty:   { textAlign:"center", padding:"40px", color:"rgba(255,255,255,0.3)", fontSize:"14px" },
};

const TABS = ["Dashboard", "Users", "Generations", "Feedback"];

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]           = useState("Dashboard");
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [generations, setGens]  = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading]   = useState(false);

  // Wait for auth to finish loading before checking is_admin
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
    try {
      if (t === "Dashboard") {
        const data = await api("/admin/stats");
        setStats(data);
      } else if (t === "Users") {
        const data = await api("/admin/users");
        setUsers(data);
      } else if (t === "Generations") {
        const data = await api("/admin/generations");
        setGens(data);
      } else if (t === "Feedback") {
        const data = await api("/admin/feedback");
        setFeedback(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user and all their data?")) return;
    await api(`/admin/users/${id}`, { method: "DELETE" });
    setUsers(users.filter(u => u.id !== id));
  };

  const banUser = async (id) => {
    const res = await api(`/admin/users/${id}/ban`, { method: "PATCH" });
    setUsers(users.map(u => u.id === id ? { ...u, is_banned: res.is_banned } : u));
  };

  const deleteGen = async (id) => {
    if (!confirm("Delete this generation?")) return;
    await api(`/admin/generations/${id}`, { method: "DELETE" });
    setGens(generations.filter(g => g.id !== id));
  };

  const flagGen = async (id) => {
    const res = await api(`/admin/generations/${id}/flag`, { method: "PATCH" });
    setGens(generations.map(g => g.id === id ? { ...g, flagged: res.flagged } : g));
  };

  const markRead = async (id) => {
    await api(`/admin/feedback/${id}/read`, { method: "PATCH" });
    setFeedback(feedback.map(f => f.id === id ? { ...f, is_read: true } : f));
  };

  const deleteFeedback = async (id) => {
    if (!confirm("Delete this feedback?")) return;
    await api(`/admin/feedback/${id}`, { method: "DELETE" });
    setFeedback(feedback.filter(f => f.id !== id));
  };

  return (
    <div style={s.page}>
      {(authLoading || !user) && (
        <p style={{ opacity:0.5, textAlign:"center", paddingTop:"100px" }}>Loading...</p>
      )}
      {!authLoading && user?.is_admin && (<>
      <div style={s.header}>
        <h1 style={s.title}>⚙️ Admin Panel</h1>
        <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)" }}>
          Logged in as <strong style={{ color:"#ff7a00" }}>{user?.email}</strong>
        </span>
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

          {/* Signups chart */}
          <div style={s.section}>
            <p style={s.sectionTitle}>📈 Signups — Last 7 Days</p>
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
            <p style={s.sectionTitle}>🧊 Generations — Last 7 Days</p>
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
          <p style={s.sectionTitle}>👥 All Users ({users.length})</p>
          {users.length === 0 ? <p style={s.empty}>No users found.</p> : (
            <div style={{ overflowX:"auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["ID","Username","Email","Verified","Provider","Generations","Joined","Actions"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={s.td}>{u.id}</td>
                      <td style={s.td}>{u.username}</td>
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
                          <button style={s.btn(u.is_banned ? "#22c55e" : "#f59e0b")} onClick={() => banUser(u.id)}>
                            {u.is_banned ? "Unban" : "Ban"}
                          </button>
                          <button style={s.btn("#ef4444")} onClick={() => deleteUser(u.id)}>
                            Delete
                          </button>
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
          <p style={s.sectionTitle}>🧊 All Generations ({generations.length})</p>
          {generations.length === 0 ? <p style={s.empty}>No generations found.</p> : (
            <div style={{ overflowX:"auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["ID","User","Prompt","Status","Flagged","Date","Actions"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generations.map(g => (
                    <tr key={g.id}>
                      <td style={s.td}>{g.id}</td>
                      <td style={s.td}>
                        <div style={{ fontSize:"13px" }}>{g.username}</div>
                        <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)" }}>{g.email}</div>
                      </td>
                      <td style={{ ...s.td, maxWidth:"200px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {g.prompt || "—"}
                      </td>
                      <td style={s.td}>
                        <span style={s.badge(g.status === "success" ? "#22c55e" : "#ef4444")}>
                          {g.status}
                        </span>
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
                          <button style={s.btn("#ef4444")} onClick={() => deleteGen(g.id)}>
                            Delete
                          </button>
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
          <p style={s.sectionTitle}>📬 Feedback & Reports ({feedback.length})</p>
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
                <div style={{ display:"flex", gap:"8px" }}>
                  {!f.is_read && (
                    <button style={s.btn("#22c55e")} onClick={() => markRead(f.id)}>Mark as Read</button>
                  )}
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