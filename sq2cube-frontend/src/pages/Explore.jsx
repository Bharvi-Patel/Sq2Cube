import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LIMIT = 20;

const s = {
  page: {
    minHeight: "100vh",
    padding: "100px 40px 60px",
    color: "white",
  },
  hero: {
    textAlign: "center",
    marginBottom: "48px",
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
    marginBottom: "16px",
  },
  h1: {
    fontSize: "38px",
    fontWeight: 700,
    margin: "0 0 12px",
  },
  subtitle: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.7,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "12px",
  },
  count: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.4)",
  },
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    fontSize: "14px",
    opacity: 0.4,
    pointerEvents: "none",
  },
  search: {
    padding: "9px 14px 9px 34px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: "14px",
    outline: "none",
    width: "220px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "default",
  },
  imgWrap: {
    width: "100%",
    aspectRatio: "1",
    overflow: "hidden",
    background: "#0d1117",
    position: "relative",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s",
  },
  cardBody: {
    padding: "14px",
  },
  prompt: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.75)",
    marginBottom: "10px",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  noPrompt: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.25)",
    marginBottom: "10px",
    fontStyle: "italic",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  userLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  avatar: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid rgba(255,122,0,0.4)",
    flexShrink: 0,
  },
  avatarPlaceholder: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "#ff7a00",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 600,
    color: "white",
    flexShrink: 0,
  },
  username: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
  },
  date: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
  },
  empty: {
    textAlign: "center",
    padding: "80px 20px",
    color: "rgba(255,255,255,0.3)",
  },
  emptyIcon: { fontSize: "48px", marginBottom: "16px" },
  emptyTitle: { fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "rgba(255,255,255,0.5)" },
  emptyText: { fontSize: "14px", lineHeight: 1.6 },
  loader: {
    textAlign: "center",
    padding: "40px",
    color: "rgba(255,255,255,0.3)",
    fontSize: "14px",
  },
  loadMore: {
    display: "block",
    margin: "40px auto 0",
    padding: "12px 32px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "rgba(255,255,255,0.7)",
    fontSize: "14px",
    cursor: "pointer",
    transition: "0.2s",
  },
  ctaBanner: {
    marginTop: "60px",
    padding: "36px",
    background: "rgba(255,122,0,0.07)",
    border: "1px solid rgba(255,122,0,0.2)",
    borderRadius: "16px",
    textAlign: "center",
  },
  ctaTitle: { fontSize: "20px", fontWeight: 700, marginBottom: "10px" },
  ctaText: { fontSize: "14px", color: "rgba(255,255,255,0.55)", marginBottom: "20px" },
  ctaBtn: {
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

const Explore = () => {
  const { isLoggedIn } = useAuth();

  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [skip, setSkip]         = useState(0);
  const [hasMore, setHasMore]   = useState(true);
  const [search, setSearch]     = useState("");
  const [hoveredId, setHoveredId] = useState(null);

  const fetchItems = async (newSkip = 0, replace = false) => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/explore?skip=${newSkip}&limit=${LIMIT}`);
      const data = await res.json();
      setTotal(data.total);
      setItems(prev => replace ? data.results : [...prev, ...data.results]);
      setHasMore(newSkip + LIMIT < data.total);
      setSkip(newSkip + LIMIT);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(0, true);
  }, []);

  const filtered = search.trim()
    ? items.filter(item =>
        item.prompt?.toLowerCase().includes(search.toLowerCase()) ||
        item.username?.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <div style={s.page}>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.tag}>EXPLORE</div>
        <h1 style={s.h1}>Community Creations</h1>
        <p style={s.subtitle}>
          Discover 3D models generated by the Sq2Cube community.<br />
          Get inspired and create your own.
        </p>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <span style={s.count}>
          {total > 0 ? `${total} generation${total !== 1 ? "s" : ""} shared` : ""}
        </span>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.search}
            placeholder="Search prompts or users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading && items.length === 0 ? (
        <div style={s.loader}>Loading creations...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🧊</div>
          <p style={s.emptyTitle}>
            {search ? "No results found" : "No creations yet"}
          </p>
          <p style={s.emptyText}>
            {search
              ? "Try a different search term."
              : "Be the first to generate and share a 3D model!"}
          </p>
        </div>
      ) : (
        <>
          <div style={s.grid}>
            {filtered.map(item => (
              <div
                key={item.id}
                style={{
                  ...s.card,
                  transform: hoveredId === item.id ? "translateY(-4px)" : "none",
                  boxShadow: hoveredId === item.id
                    ? "0 12px 32px rgba(0,0,0,0.4)"
                    : "none",
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Image */}
                <div style={s.imgWrap}>
                  <img
                    src={item.image}
                    alt={item.prompt || "3D generation"}
                    style={{
                      ...s.img,
                      transform: hoveredId === item.id ? "scale(1.05)" : "scale(1)",
                    }}
                  />
                </div>

                {/* Card body */}
                <div style={s.cardBody}>
                  <p style={item.prompt ? s.prompt : s.noPrompt}>
                    {item.prompt || "No prompt"}
                  </p>

                  <div style={s.userRow}>
                    <div style={s.userLeft}>
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.username} style={s.avatar} />
                      ) : (
                        <div style={s.avatarPlaceholder}>
                          {item.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <span style={s.username}>{item.username}</span>
                    </div>
                    <span style={s.date}>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load more */}
          {hasMore && !search && (
            <button
              style={s.loadMore}
              onClick={() => fetchItems(skip)}
              disabled={loading}
              onMouseEnter={e => e.target.style.color = "white"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.7)"}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          )}
        </>
      )}

      {/* CTA for non-logged in users */}
      {!isLoggedIn && (
        <div style={s.ctaBanner}>
          <p style={s.ctaTitle}>Want to see your creation here?</p>
          <p style={s.ctaText}>
            Sign up for free and start generating your own 3D models today.
          </p>
          <Link to="/signup" style={s.ctaBtn}>Get Started Free</Link>
        </div>
      )}

    </div>
  );
};

export default Explore;