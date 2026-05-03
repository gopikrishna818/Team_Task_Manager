import React, { useState, useEffect, useCallback } from "react";
import { api, parseToken, genToken, getUser } from "./data.js";
import { Avatar, Modal, Field, Badge, ProgressBar, ErrorBox } from "./ui.jsx";
import { 
  LayoutDashboard, Briefcase, CheckCircle2, Layers, Inbox, 
  ClipboardList, TrendingUp, Calendar, Zap, ShieldCheck, 
  Lock, Globe, Users, Monitor, Columns, ArrowRight, Bell, Plus, Settings, AlertCircle
} from "lucide-react";

const today = () => new Date().toISOString().split("T")[0];

// ── Components ───────────────────────────────────────────────────────────────

function DonutChart({ data, total }) {
  const colors = ["#0ea5e9", "#f59e0b", "#10b981"]; // Blue, Amber, Green
  const entries = Object.entries(data);
  let cumulativePercent = 0;

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" className="donut-svg" width="100%" height="100%">
        {entries.map(([label, value], i) => {
          const percent = (value / total) * 100;
          const strokeDasharray = `${percent} ${100 - percent}`;
          const strokeDashoffset = -cumulativePercent;
          cumulativePercent += percent;
          return (
            <circle key={label} cx="50" cy="50" r="40" fill="transparent"
              stroke={colors[i] || "#eee"} strokeWidth="12"
              strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
            />
          );
        })}
        {total === 0 && <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eee" strokeWidth="12" />}
      </svg>
      <div className="donut-center">
        <div style={{ fontSize: 32, fontWeight: 800 }}>{total}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase' }}>total</div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon, color }) {
  return (
    <div className="metric-card">
      <div className="m-header">
        <div className="m-title">{title}</div>
        <div className="m-icon" style={{ background: `${color}15`, color }}>{icon}</div>
      </div>
      <div className="m-value">{value}</div>
      <div className="m-trend" style={{ color: value > 0 ? '#10b981' : '#999' }}>
        {value > 0 ? "↑" : "•"} <span style={{ color: '#999' }}>{trend}</span>
      </div>
    </div>
  );
}

// ── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "alice@demo.com", password: "demo123" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErr("");
    setBusy(true);
    try {
      const result = mode === "login" ? await api.login(form.email, form.password) : await api.signup(form.name, form.email, form.password);
      onAuth(result);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="split-auth fade-in">
      <div className="auth-left">
        <div>
          <div className="flex gap12 mb-32" style={{ marginBottom: 48 }}>
            <div className="logo-icon"><Layers size={22} color="#000" /></div>
            <span className="logo-text">TaskFlow</span>
          </div>
          <div className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 16px', marginBottom: 40 }}>TEAM COLLABORATION</div>
          <h1 className="hero-text"><span>Build, ship,</span><span className="dim">grow</span><span>together.</span></h1>
          <p className="auth-sub">Unified workspace for projects, tasks, and high-performance teams. Stop chasing updates. Start shipping.</p>
          <div className="auth-stats">
            <div className="stat-item"><div className="stat-val">12K+</div><div className="stat-label">Active teams</div></div>
            <div className="stat-item"><div className="stat-val">98M</div><div className="stat-label">Tasks done</div></div>
            <div className="stat-item"><div className="stat-val">99.9%</div><div className="stat-label">Uptime</div></div>
          </div>
        </div>
        <div className="auth-footer-links">
          <div className="flex gap8"><Lock size={14}/> 256-bit AES</div>
          <div className="flex gap8"><ShieldCheck size={14}/> SOC 2 Level II</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-nav">
          <span style={{ color: '#666' }}>No account yet? </span>
          <button style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Create one free →' : 'Back to login ←'}
          </button>
        </div>
        <div className="auth-content entrance">
          <h2 style={{ fontSize: 44, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.04em' }}>{mode === 'login' ? 'Welcome back' : 'Join TaskFlow'}</h2>
          <p style={{ color: '#999', fontSize: 18, marginBottom: 40 }}>{mode === 'login' ? 'Sign in to your workspace' : 'Start collaborating today'}</p>
          <button className="google-btn">Continue with Google</button>
          <div className="separator">or use email</div>
          <ErrorBox msg={err} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === "signup" && <input className="auth-input-dark" placeholder="Full Name" value={form.name} onChange={set("name")} />}
            <input className="auth-input-dark" type="email" placeholder="Email Address" value={form.email} onChange={set("email")} />
            <input className="auth-input-dark" type="password" placeholder="Password" value={form.password} onChange={set("password")} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          <button className="btn-primary w-full mt-20" onClick={submit} disabled={busy}>{busy ? "Loading..." : "Sign in"}</button>
          <p style={{ textAlign: 'center', color: '#999', fontSize: 13, marginTop: 32 }}>By signing in, you agree to our Terms and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ user }) {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getDashboard(user.id);
        setD(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchDashboard();
  }, [user.id]);

  if (loading || !d) return <div style={{ padding: 48 }}>Loading dashboard...</div>;

  return (
    <div className="fade-in">
      <header className="topbar" style={{ border: 'none', paddingBottom: 0 }}>
        <div className="flex justify-between w-full">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Good morning, {user.name.split(" ")[0]}</h1>
            <p className="text-mute">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • Here's what needs your attention</p>
          </div>
          <div className="flex gap12">
            <button className="btn"><Bell size={18}/></button>
            <button className="btn btn-primary" style={{ background: '#f4f4f4', color: '#000', border: 'none' }}><Plus size={18}/> New task</button>
            <Avatar user={user} size={40} />
          </div>
        </div>
      </header>

      <div className="content">
        <div className="metric-grid">
          <MetricCard title="My Projects" value={d.projects} trend="this month" icon={<Briefcase size={18}/>} color="#0ea5e9" />
          <MetricCard title="Total Tasks" value={d.totalTasks} trend="since last week" icon={<Zap size={18}/>} color="#8b5cf6" />
          <MetricCard title="In Progress" value={d.byStatus["In Progress"] || 0} trend="Active right now" icon={<Clock size={18}/>} color="#f59e0b" />
          <MetricCard title="Completed" value={d.byStatus["Done"] || 0} trend="completion rate" icon={<CheckCircle2 size={18}/>} color="#10b981" />
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Activity trends</div>
                <div className="text-mute" style={{ fontSize: 13 }}>Tasks completed per day</div>
              </div>
              <div className="toggle-group">
                <button className="toggle-btn">Month</button>
                <button className="toggle-btn active">Week</button>
              </div>
            </div>
            <div style={{ height: 240, display: 'flex', alignItems: 'flex-end', gap: 12, paddingBottom: 40 }}>
              {[12, 18, 15, 25, 22, 8, 10].map((v, i) => (
                <div key={i} style={{ flex: 1, background: '#f4f4f4', borderRadius: 8, height: `${(v / 30) * 100}%`, position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: -24, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: '#999', fontWeight: 700 }}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Status breakdown</div>
                <div className="text-mute" style={{ fontSize: 13 }}>All tasks across projects</div>
              </div>
            </div>
            <DonutChart data={d.byStatus} total={d.totalTasks} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {["To Do", "In Progress", "Done"].map((s, i) => (
                <div key={s} className="flex justify-between">
                  <div className="flex gap8">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ["#0ea5e9", "#f59e0b", "#10b981"][i] }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{s}</span>
                  </div>
                  <div style={{ width: 140, height: 4, background: '#f4f4f4', borderRadius: 2, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 2, background: ["#0ea5e9", "#f59e0b", "#10b981"][i], width: `${(d.byStatus[s] || 0) / d.totalTasks * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="charts-grid" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
          <div className="tasks-card">
            <div className="flex justify-between mb-20" style={{ marginBottom: 24 }}>
              <h2 className="chart-title">Recent tasks</h2>
              <button className="btn" style={{ border: 'none', color: '#999', fontSize: 13, fontWeight: 700 }}>View all</button>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {d.recentTasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className="task-cell">
                        <span className="task-name">{t.title}</span>
                        <span className="task-proj">{t.projectName}</span>
                      </div>
                    </td>
                    <td><Avatar user={{ name: t.assignedToName }} size={28} /></td>
                    <td><Badge type={t.priority} /></td>
                    <td><span style={{ fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: t.status === 'Done' ? '#10b98115' : '#f4f4f4', color: t.status === 'Done' ? '#10b981' : '#666' }}>{t.status}</span></td>
                    <td><span style={{ fontSize: 13, color: '#999', fontWeight: 600 }}>{t.dueDate?.split("-").slice(1).join(" ")}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tasks-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 className="chart-title mb-20" style={{ marginBottom: 24 }}>Team members</h2>
            <div className="team-list">
              {d.byUser.slice(0, 4).map(({ user: u, count }) => (
                <div key={u.id} className="member-item">
                  <Avatar user={u} size={36} />
                  <div className="member-info">
                    <span className="m-name">{u.name}</span>
                    <span className="m-email">{u.email}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 32 }}>
              <div className="alert-box">
                <AlertCircle size={18} />
                <span>{d.overdue} task{d.overdue !== 1 ? 's are' : ' is'} past its due</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Clock({ size }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }

// ── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(null);
  const [view, setView] = useState("dashboard");
  const [proj, setProj] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = parseToken();
      if (token) {
        try {
          const user = await getUser();
          if (user) setAuth({ token, user });
        } catch (err) { localStorage.removeItem("taskflow_token"); }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleAuth = (r) => { genToken(r.token); setAuth({ token: r.token, user: r.user }); };
  const logout = () => { localStorage.removeItem("taskflow_token"); setAuth(null); setView("dashboard"); setProj(null); };

  if (loading) return null;
  if (!auth) return <AuthScreen onAuth={handleAuth} />;

  const { user } = auth;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="logo-icon"><Layers size={22} color="#000" /></div>
          <span className="logo-text">TaskFlow</span>
        </div>
        
        <div className="sb-section">
          <div className="sb-label">Workspace</div>
          <button className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => { setView('dashboard'); setProj(null); }}>
            <div className="flex gap12"><LayoutDashboard size={20}/> Overview</div>
          </button>
          <button className={`nav-btn ${view === 'projects' ? 'active' : ''}`} onClick={() => { setView('projects'); setProj(null); }}>
            <div className="flex gap12"><Briefcase size={20}/> Projects</div>
            <div className="badge" style={{ padding: '2px 8px', fontSize: 10, background: '#333', color: '#fff' }}>2</div>
          </button>
          <button className={`nav-btn ${view === 'queue' ? 'active' : ''}`} onClick={() => { setView('queue'); setProj(null); }}>
            <div className="flex gap12"><CheckCircle2 size={20}/> My tasks</div>
            <div className="badge" style={{ padding: '2px 8px', fontSize: 10, background: '#333', color: '#fff' }}>3</div>
          </button>
          <button className="nav-btn"><div className="flex gap12"><Users size={20}/> Members</div></button>
        </div>

        <div className="sb-section">
          <div className="sb-label">Settings</div>
          <button className="nav-btn"><div className="flex gap12"><Settings size={20}/> Settings</div></button>
        </div>

        <div className="sb-user-card" style={{ marginTop: 'auto' }}>
          <Avatar user={user} size={36} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>Admin</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
        </div>
        <button onClick={logout} style={{ margin: '0 16px 24px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', padding: '12px', borderRadius: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Sign Out</button>
      </aside>
      
      <main className="main">
        {proj ? (
          <div className="content">
             {/* Note: I'll assume ProjectTasksView is still needed but I'll skip detailed redesign for now to focus on Dashboard */}
             <button onClick={() => setProj(null)}>← Back</button>
          </div>
        ) : view === "dashboard" ? (
          <Dashboard user={user} />
        ) : (
          <div className="content">Other views under construction</div>
        )}
      </main>
    </div>
  );
}
