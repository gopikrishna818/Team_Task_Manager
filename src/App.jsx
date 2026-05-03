import React, { useState, useEffect, useCallback } from "react";
import { api, parseToken, genToken, getUser } from "./data.js";
import { Avatar, Modal, Field, Badge, ProgressBar, ErrorBox } from "./ui.jsx";
import { 
  LayoutDashboard, Briefcase, CheckCircle2, Layers, Inbox, 
  ClipboardList, TrendingUp, Calendar, Zap, ShieldCheck, 
  Lock, Globe, Users, Monitor, Columns, ArrowRight
} from "lucide-react";

const today = () => new Date().toISOString().split("T")[0];

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Error caught by boundary:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: 20, color: "red", wordBreak: "break-all"}}><h3>App Crashed!</h3><pre>{this.state.error.toString()}</pre><pre>{this.state.error.stack}</pre></div>;
    }
    return this.props.children; 
  }
}

// ── Components ───────────────────────────────────────────────────────────────

function SimpleChart({ data, height = 120, color = "var(--blue)" }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="chart-container" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="chart-bar" style={{ 
          height: `${(d.value / max) * 100}%`, 
          backgroundColor: color,
          opacity: 0.3 + (i / data.length) * 0.7
        }}>
          <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--t3)' }}>{d.label}</div>
        </div>
      ))}
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
      {/* Left Panel: Brand & Stats */}
      <div className="auth-left">
        <div>
          <div className="flex gap12 mb-32" style={{ marginBottom: 48 }}>
            <div className="logo-icon" style={{ borderRadius: 12, width: 44, height: 44, background: '#fff' }}>
              <Layers size={26} color="#000" />
            </div>
            <span className="logo-text" style={{ color: '#fff', fontSize: 24 }}>TaskFlow</span>
          </div>

          <div style={{ marginBottom: 40 }}>
            <div className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 16px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginRight: 10, display: 'inline-block' }} />
              TEAM COLLABORATION PLATFORM
            </div>
          </div>

          <h1 className="hero-text">
            <span>Build, ship,</span>
            <span className="dim">grow</span>
            <span>together.</span>
          </h1>

          <p className="auth-sub">
            TaskFlow brings your team's work into one place — projects, tasks, deadlines, and people. Stop chasing updates. Start shipping.
          </p>

          <div className="auth-stats">
            <div className="stat-item">
              <div className="stat-val">12K+</div>
              <div className="stat-label">Active teams</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">98M</div>
              <div className="stat-label">Tasks completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>

          <div className="feature-cards">
            <div className="f-card">
              <div className="f-icon"><Columns size={20} color="#fff"/></div>
              <div className="f-info">
                <div className="f-title">Project boards</div>
                <div className="f-desc">Kanban-style task tracking for every project</div>
              </div>
            </div>
            <div className="f-card">
              <div className="f-icon"><Users size={20} color="#fff"/></div>
              <div className="f-info">
                <div className="f-title">Role-based access</div>
                <div className="f-desc">Admins manage, members focus and execute</div>
              </div>
            </div>
            <div className="f-card">
              <div className="f-icon"><TrendingUp size={20} color="#fff"/></div>
              <div className="f-info">
                <div className="f-title">Real-time dashboard</div>
                <div className="f-desc">Live stats on tasks, progress and overdue items</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-footer-links">
          <div className="flex gap8"><Lock size={14}/> 256-bit encryption</div>
          <div className="flex gap8"><ShieldCheck size={14}/> SOC 2 compliant</div>
          <div className="flex gap8"><Globe size={14}/> 99.9% uptime SLA</div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="auth-right">
        <div className="auth-nav">
          <span style={{ color: '#666' }}>No account yet? </span>
          <button style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', padding: 0 }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Create one free →' : 'Back to login ←'}
          </button>
        </div>

        <div className="auth-content entrance">
          <h2 style={{ fontSize: 44, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.04em' }}>
            {mode === 'login' ? 'Welcome back' : 'Join TaskFlow'}
          </h2>
          <p style={{ color: '#999', fontSize: 18, marginBottom: 40 }}>
            {mode === 'login' ? 'Sign in to your TaskFlow workspace' : 'Start collaborating with your team today'}
          </p>

          <button className="google-btn">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="separator">or sign in with email</div>

          <ErrorBox msg={err} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {mode === "signup" && (
              <div className="field">
                <label style={{ fontSize: 13, fontWeight: 700, color: '#444', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>FULL NAME</label>
                <input className="input auth-input-dark" placeholder="Jane Smith" value={form.name} onChange={set("name")} />
              </div>
            )}
            <div className="field">
              <label style={{ fontSize: 13, fontWeight: 700, color: '#444', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>EMAIL</label>
              <input className="input auth-input-dark" type="email" placeholder="alice@demo.com" value={form.email} onChange={set("email")} />
            </div>
            <div className="field">
              <label style={{ fontSize: 13, fontWeight: 700, color: '#444', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>PASSWORD</label>
              <input className="input auth-input-dark" type="password" placeholder="••••••••••••" value={form.password} onChange={set("password")} onKeyDown={(e) => e.key === "Enter" && submit()} />
            </div>
          </div>

          <div className="auth-actions">
            <label className="checkbox-wrap">
              <input type="checkbox" defaultChecked />
              <span>Keep me signed in</span>
            </label>
            <button style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>Forgot password?</button>
          </div>

          <button className="btn btn-primary btn-full w-full" onClick={submit} disabled={busy} style={{ width: '100%', padding: 18, borderRadius: 12, background: mode === 'login' ? '#fff' : '#000', color: mode === 'login' ? '#000' : '#fff', border: '1px solid #eee', fontSize: 16, fontWeight: 800 }}>
            {busy ? "Please wait..." : mode === 'login' ? "Sign in" : "Create Account"}
          </button>

          <p style={{ textAlign: 'center', color: '#999', fontSize: 13, marginTop: 32, lineHeight: 1.6 }}>
            By signing in you agree to our <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
          </p>
        </div>

        <div className="auth-right-footer">
          <span>Help</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Status</span>
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
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user.id]);

  if (loading || !d) return <div style={{ padding: "2rem", textAlign: "center" }} className="fade-in">Preparing your workspace...</div>;

  const statusColors = { "To Do": "var(--t3)", "In Progress": "var(--blue)", Done: "var(--green)" };
  
  const metrics = [
    { label: "My Projects", value: d.projects, icon: <Briefcase size={80} />, cls: "metric-1" },
    { label: "Total Tasks", value: d.totalTasks, icon: <Zap size={80} />, cls: "metric-2" },
    { label: "Active Now", value: d.myTasks, icon: <TrendingUp size={80} />, cls: "metric-3" },
    { label: "Urgent", value: d.overdue, icon: <Calendar size={80} />, cls: "metric-4" },
    { label: "Completed", value: d.byStatus["Done"], icon: <CheckCircle2 size={80} />, cls: "metric-5" },
  ];

  const chartData = [
    { label: "Mon", value: 12 }, { label: "Tue", value: 18 }, { label: "Wed", value: 15 },
    { label: "Thu", value: 25 }, { label: "Fri", value: 22 }, { label: "Sat", value: 8 }, { label: "Sun", value: 10 }
  ];

  return (
    <div className="slide-up">
      <div className="section-head mb-20">
        <div>
          <h1 className="section-title" style={{ fontSize: 34, fontWeight: 800 }}>Overview</h1>
          <p className="section-sub">Welcome back, {user.name.split(" ")[0]}! Here's what's happening.</p>
        </div>
        <div className="flex gap12">
          <button className="btn"><Calendar size={16}/> Schedule</button>
          <button className="btn btn-primary"><Zap size={16}/> Quick Action</button>
        </div>
      </div>

      <div className="bento bento-5col mb-20">
        {metrics.map((m, i) => (
          <div key={m.label} className={`metric entrance ${m.cls}`} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="metric-icon">{m.icon}</div>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-bar" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="metric-bar-fill" style={{ width: '70%', background: '#fff' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="bento bento-3col">
        <div className="card glass entrance" style={{ animationDelay: '0.5s', gridColumn: 'span 2' }}>
          <div className="flex justify-between mb-20" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="fw-bold" style={{ fontSize: 18 }}>Activity Trends</div>
              <div className="text-mute fs13">Tasks completed this week</div>
            </div>
            <Badge type="Weekly" />
          </div>
          <SimpleChart data={chartData} height={180} />
        </div>

        <div className="card entrance" style={{ animationDelay: '0.6s' }}>
          <div className="fw-bold mb-12" style={{ fontSize: 16 }}>Status Allocation</div>
          <div className="bar-row" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(d.byStatus).map(([k, v]) => (
              <div key={k} className="bar-item">
                <div className="bar-meta flex justify-between mb-6" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="fs13 fw-bold">{k}</span>
                  <span className="fs13 text-mute">{v} tasks</span>
                </div>
                <div className="bar-track" style={{ height: 6, background: 'var(--accent-bg)', borderRadius: 3 }}>
                  <div className="bar-fill" style={{ 
                    width: `${d.totalTasks ? (v / d.totalTasks) * 100 : 0}%`, 
                    background: statusColors[k] || 'var(--accent)',
                    height: '100%',
                    borderRadius: 3
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bento bento-2col mt-20" style={{ marginTop: 24 }}>
        <div className="card entrance" style={{ animationDelay: '0.7s' }}>
          <div className="fw-bold mb-20" style={{ fontSize: 16 }}>Team Workload</div>
          {d.byUser.length === 0 ? (
            <div className="empty text-mute">No assignments yet</div>
          ) : (
            d.byUser.map(({ user: u, count }) => (
              <div key={u.id} className="flex gap12 mb-12 p-12" style={{ background: 'var(--bg-sidebar)', borderRadius: 'var(--r-md)' }}>
                <Avatar user={u} size={36} />
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between mb-6" style={{ justifyContent: 'space-between' }}>
                    <span className="fs14 fw-bold">{u.name}</span>
                    <span className="fs12 text-mute">{count} Active</span>
                  </div>
                  <ProgressBar value={d.totalTasks ? Math.round((count / d.totalTasks) * 100) : 0} />
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="card entrance" style={{ animationDelay: '0.8s' }}>
          <div className="fw-bold mb-20" style={{ fontSize: 16 }}>Live Feed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {d.recentTasks.map((t) => (
              <div key={t.id} className="flex gap12 p-12" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.priority === 'High' ? 'var(--red)' : 'var(--blue)' }} />
                <div style={{ flex: 1 }}>
                  <div className="fs14 fw-bold">{t.title}</div>
                  <div className="fs12 text-mute">In {t.projectName}</div>
                </div>
                <Badge type={t.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Task Modal ───────────────────────────────────────────────────────────────
function TaskModal({ task, projectId, user, members, onSave, onClose }) {
  const uId = user.id || user._id;
  const isAdmin = members?.find((m) => m.userId === uId || m.userId?._id === uId)?.role === "Admin";
  const [form, setForm] = useState(
    task
      ? { ...task }
      : { title: "", description: "", assignedTo: user.id || user._id, priority: "Medium", status: "To Do", dueDate: "" }
  );
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    try {
      setBusy(true);
      if (task) {
        await api.updateTask(user.id, projectId, task.id, form);
      } else {
        await api.createTask(user.id, projectId, form);
      }
      onSave();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={task ? "Update Assignment" : "New Assignment"} onClose={onClose}>
      <div className="entrance">
        <ErrorBox msg={err} />
        <Field label="Task Heading">
          <input className="input" value={form.title} onChange={set("title")} disabled={!isAdmin} placeholder="What needs to be done?" />
        </Field>
        <Field label="Detailed Brief">
          <textarea className="input" style={{ minHeight: 100, resize: "vertical" }} value={form.description} onChange={set("description")} disabled={!isAdmin} placeholder="Add more context here..." />
        </Field>
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Status">
            <select className="input" value={form.status} onChange={set("status")}>
              {["To Do", "In Progress", "Done"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority Level">
            <select className="input" value={form.priority} onChange={set("priority")} disabled={!isAdmin}>
              {["Low", "Medium", "High"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Assign To Member">
            <select className="input" value={form.assignedTo} onChange={set("assignedTo")} disabled={!isAdmin}>
              {members?.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.userName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <input className="input" type="date" value={form.dueDate} onChange={set("dueDate")} disabled={!isAdmin} />
          </Field>
        </div>
        <div className="flex gap12 mt-20" style={{ justifyContent: "flex-end", marginTop: 24 }}>
          <button className="btn" onClick={onClose}>Discard</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? "Processing..." : "Commit Changes"}</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Project Tasks ────────────────────────────────────────────────────────────
function ProjectTasksView({ project, user, onBack }) {
  const uId = user.id || user._id;
  const isAdmin = project.members?.find((m) => m.userId === uId || m.userId?._id === uId)?.role === "Admin";
  const [tasks, setTasks] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("All");
  const [showMembers, setShowMembers] = useState(false);
  const [memEmail, setMemEmail] = useState("");
  const [memErr, setMemErr] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getTasks(user.id, project.id);
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id, project.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const cols = ["To Do", "In Progress", "Done"];
  const colColors = { "To Do": "var(--t3)", "In Progress": "var(--blue)", Done: "var(--green)" };
  const filtered = filter === "All" ? tasks : tasks.filter((t) => t.status === filter);

  const addMem = async () => {
    try {
      await api.addMember(user.id, project.id, memEmail, "Member");
      setMemEmail("");
      setMemErr("");
    } catch (e) {
      setMemErr(e.message);
    }
  };

  const td = today();

  const deleteTask = async (taskId) => {
    try {
      await api.deleteTask(user.id, project.id, taskId);
      refresh();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }} className="fade-in">Syncing tasks...</div>;

  return (
    <div className="slide-up">
      <div className="flex gap12 mb-20" style={{ alignItems: 'flex-start' }}>
        <button className="btn" onClick={onBack} style={{ padding: '8px 12px' }}>←</button>
        <div style={{ flex: 1 }}>
          <h2 className="section-title" style={{ fontSize: 24 }}>{project.name}</h2>
          <p className="text-mute">{project.description}</p>
        </div>
        <div className="flex gap12">
          {isAdmin && <button className="btn" onClick={() => setShowMembers(true)}>👥 Members ({project.members?.length || 0})</button>}
          {isAdmin && <button className="btn btn-primary" onClick={() => { setEditing(null); setShowNew(true); }}>+ Add Task</button>}
        </div>
      </div>

      <div className="flex gap12 mb-20">
        {["All", ...cols].map((f) => (
          <button key={f} className={`btn ${filter === f ? "btn-primary" : ""}`} onClick={() => setFilter(f)}>
            {f} {f !== "All" && <span style={{ opacity: 0.6, marginLeft: 4 }}>{tasks.filter((t) => t.status === f).length}</span>}
          </button>
        ))}
      </div>

      <div className="bento bento-3col">
        {cols.map((col, idx) => {
          const ct = filtered.filter((t) => t.status === col);
          return (
            <div key={col} className="card glass entrance" style={{ animationDelay: `${idx * 0.15}s`, background: 'rgba(255,255,255,0.3)', minHeight: 500 }}>
              <div className="flex justify-between mb-20" style={{ justifyContent: 'space-between', borderBottom: `2px solid ${colColors[col]}`, paddingBottom: 12 }}>
                <span className="fw-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col}</span>
                <Badge type={ct.length.toString()} />
              </div>
              
              <div className="flex flex-col gap12" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {ct.map((task) => {
                  const assigneeUser = { id: task.assignedTo, name: task.assignedToName, email: task.assignedToEmail };
                  const late = task.dueDate < td && task.status !== "Done";
                  return (
                    <div key={task.id} className="card glass card-clickable slide-up" style={{ padding: 16, background: '#fff' }} onClick={() => { setEditing(task); setShowNew(true); }}>
                      <div className="flex justify-between mb-8" style={{ justifyContent: 'space-between' }}>
                        <Badge type={task.priority} />
                        {late && <span className="fs12 text-mute pulse-animation" style={{ color: 'var(--red)' }}>⚠ Overdue</span>}
                      </div>
                      <div className="fw-bold fs15 mb-8" style={{ fontSize: 15 }}>{task.title}</div>
                      <div className="flex justify-between mt-12" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="flex gap8">
                          <Avatar user={assigneeUser} size={24} />
                          <span className="fs12 text-mute">{assigneeUser?.name?.split(" ")[0]}</span>
                        </div>
                        <div className="fs12 text-mute"><Calendar size={12}/> {task.dueDate}</div>
                      </div>
                    </div>
                  );
                })}
                {ct.length === 0 && (
                  <div className="empty text-center" style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Inbox size={40} className="text-mute mb-12" style={{ margin: '0 auto 12px' }}/>
                    <p className="text-mute fs13">Empty column</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showNew && <TaskModal task={editing} projectId={project.id} user={user} members={project.members} onSave={() => { refresh(); setShowNew(false); setEditing(null); }} onClose={() => { setShowNew(false); setEditing(null); }} />}
      
      {showMembers && isAdmin && (
        <Modal title="Project Access" onClose={() => { setShowMembers(false); setMemErr(""); }}>
          <div style={{ marginBottom: "1.5rem" }}>
            {project.members?.map((m) => {
              const u = { id: m.userId, name: m.userName, email: m.userEmail };
              return (
                <div key={m.userId} className="flex gap12 p-12 mb-8" style={{ background: 'var(--bg-sidebar)', borderRadius: 'var(--r-md)' }}>
                  <Avatar user={u} size={36} />
                  <div style={{ flex: 1 }}>
                    <div className="fs14 fw-bold">{u?.name}</div>
                    <div className="fs12 text-mute">{u?.email}</div>
                  </div>
                  <Badge type={m.role} />
                  {m.userId !== user.id && <button className="btn" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => api.removeMember(user.id, project.id, m.userId)}>Remove</button>}
                </div>
              );
            })}
          </div>
          <div className="card glass p-16">
            <Field label="Invite via Email">
              <div className="flex gap8">
                <input className="input" placeholder="teammate@company.com" value={memEmail} onChange={(e) => setMemEmail(e.target.value)} style={{ flex: 1 }} />
                <button className="btn btn-primary" onClick={addMem}>Invite</button>
              </div>
            </Field>
            <ErrorBox msg={memErr} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Projects ─────────────────────────────────────────────────────────────────
function ProjectsView({ user, onSelect }) {
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getProjects(user.id);
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async () => {
    try {
      await api.createProject(user.id, form);
      setShowCreate(false);
      setForm({ name: "", description: "" });
      refresh();
    } catch (e) {
      setErr(e.message);
    }
  };

  const del = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this workspace? This cannot be undone.")) return;
    try {
      await api.deleteProject(user.id, id);
      refresh();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }} className="fade-in">Loading workspaces...</div>;

  return (
    <div className="slide-up">
      <div className="section-head mb-20">
        <div>
          <h2 className="section-title">Workspaces</h2>
          <p className="text-mute">Manage your collaborative projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Workspace</button>
      </div>

      <div className="bento" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))" }}>
        {projects.map((proj, i) => {
          const uId = user.id || user._id;
          const role = proj.members?.find((m) => m.userId === uId || m.userId?._id === uId)?.role;
          return (
            <div key={proj.id} className="card glass card-clickable entrance" style={{ animationDelay: `${i * 0.1}s` }} onClick={() => onSelect(proj)}>
              <div className="flex justify-between mb-16" style={{ justifyContent: 'space-between' }}>
                <Badge type={role} />
                <span className="fs12 text-mute">{proj.createdAt?.split("T")[0] || "Active"}</span>
              </div>
              <h3 className="fw-bold mb-8" style={{ fontSize: 18 }}>{proj.name}</h3>
              <p className="text-mute fs14 mb-20" style={{ lineHeight: 1.6, minHeight: 44 }}>{proj.description}</p>
              
              <div className="flex justify-between mb-12" style={{ justifyContent: 'space-between' }}>
                <div className="flex -space-x-2">
                  {proj.members?.slice(0, 3).map((m, idx) => (
                    <div key={idx} style={{ marginLeft: idx > 0 ? -8 : 0, border: '2px solid #fff', borderRadius: '50%' }}>
                      <Avatar user={{ id: m.userId, name: m.userName, email: m.userEmail }} size={28} />
                    </div>
                  ))}
                  {proj.members?.length > 3 && (
                    <div className="flex items-center justify-center fs11 fw-bold" style={{ marginLeft: -8, width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-bg)', border: '2px solid #fff' }}>
                      +{proj.members.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex gap6">
                  <span className="fs12 fw-bold">{proj.members?.length || 0} Members</span>
                </div>
              </div>
              
              <div className="mt-12 pt-12" style={{ borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="fs12 fw-bold text-mute">Workspace Active</span>
                {role === "Admin" && <button className="btn" style={{ padding: '4px 8px', fontSize: 11 }} onClick={(e) => del(e, proj.id)}>Delete</button>}
              </div>
            </div>
          );
        })}
        {projects.length === 0 && (
          <div className="card glass empty entrance" style={{ gridColumn: "1/-1", padding: 60 }}>
            <ClipboardList size={64} className="text-mute mb-20" style={{ margin: '0 auto 20px' }}/>
            <h3 className="fw-bold mb-8">No Workspaces Found</h3>
            <p className="text-mute mb-20">Get started by creating your first project workspace.</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create First Workspace</button>
          </div>
        )}
      </div>

      {showCreate && (
        <Modal title="Establish Workspace" onClose={() => { setShowCreate(false); setErr(""); }}>
          <div className="entrance">
            <ErrorBox msg={err} />
            <Field label="Workspace Title"><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Design Systems" /></Field>
            <Field label="Vision & Description"><textarea className="input" style={{ minHeight: 120, resize: "vertical" }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What will this workspace achieve?" /></Field>
            <div className="flex gap12 mt-20" style={{ justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => { setShowCreate(false); setErr(""); }}>Cancel</button>
              <button className="btn btn-primary" onClick={create}>Initialize Workspace</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── My Tasks ─────────────────────────────────────────────────────────────────
function MyTasksView({ user }) {
  const td = today();
  const [filter, setFilter] = useState("All");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await api.getTasks(user.id);
        const uId = user.id || user._id;
        setTasks(data.filter((t) => t.assignedTo === uId));
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user.id]);

  const all = tasks;
  const filtered =
    filter === "All"
      ? all
      : filter === "Overdue"
      ? all.filter((t) => t.dueDate < td && t.status !== "Done")
      : all.filter((t) => t.status === filter);

  const updateStatus = async (task, status) => {
    try {
      await api.updateTask(user.id, task.projectId, task.id, { status });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }} className="fade-in">Loading your tasks...</div>;

  return (
    <div className="slide-up">
      <div className="section-head mb-20">
        <div>
          <h2 className="section-title">My Assignment Log</h2>
          <p className="text-mute">{all.length} active items in your queue</p>
        </div>
      </div>

      <div className="flex gap12 mb-20">
        {["All", "To Do", "In Progress", "Done", "Overdue"].map((f) => (
          <button key={f} className={`btn ${filter === f ? "btn-primary" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="card glass entrance" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div className="empty" style={{ padding: 80 }}>
            <CheckCircle2 size={64} className="text-mute mb-20" style={{ margin: '0 auto 20px' }}/>
            <p className="fw-bold">No tasks matching your selection</p>
          </div>
        ) : (
          <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Details</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => {
                const late = task.dueDate < td && task.status !== "Done";
                return (
                  <tr key={task.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div className="fw-bold fs15">{task.title}</div>
                      {task.description && <div className="fs12 text-mute mt-4">{task.description.slice(0, 60)}…</div>}
                    </td>
                    <td style={{ padding: '20px 24px' }} className="text-mute fs14">{task.projectName}</td>
                    <td style={{ padding: '20px 24px' }}><Badge type={task.priority} /></td>
                    <td style={{ padding: '20px 24px' }}>
                      <div className={late ? "fw-bold" : "text-mute"} style={{ color: late ? 'var(--red)' : 'inherit', fontSize: 13 }}>
                        {task.dueDate} {late && "⚠"}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <select className="input" style={{ width: "auto", fontSize: 12, padding: "6px 12px" }} value={task.status} onChange={(e) => updateStatus(task, e.target.value)}>
                        {["To Do", "In Progress", "Done"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

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
          const user = await getUser() || { id: "unknown", name: "User", email: "user@example.com" };
          setAuth({ token, user });
        } catch (err) {
          localStorage.removeItem("taskflow_token");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleAuth = (r) => {
    genToken(r.token);
    setAuth({ token: r.token, user: r.user });
  };

  const logout = () => {
    localStorage.removeItem("taskflow_token");
    setAuth(null);
    setView("dashboard");
    setProj(null);
  };

  if (loading) return (
    <div className="app flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap12">
        <div className="logo-icon pulse-animation" style={{ width: 60, height: 60 }}>
          <Layers size={32} color="#fff" />
        </div>
        <p className="fw-bold mt-12">TaskFlow Cloud</p>
      </div>
    </div>
  );
  
  if (!auth) return <AuthScreen onAuth={handleAuth} />;

  const { user } = auth;
  const nav = [
    { id: "dashboard", label: "Overview", icon: <LayoutDashboard size={20} /> },
    { id: "projects", label: "Workspaces", icon: <Briefcase size={20} /> },
    { id: "mytasks", label: "Queue", icon: <CheckCircle2 size={20} /> },
  ];

  return (
    <div className="app fade-in">
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="logo-icon"><Layers size={24} color="#fff" /></div>
          <span className="logo-text">TaskFlow</span>
        </div>
        
        <nav className="sb-nav">
          <div className="text-mute mb-12" style={{ padding: '0 16px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</div>
          {nav.map((n) => (
            <button key={n.id} className={`nav-btn${view === n.id && !proj ? " active" : ""}`} onClick={() => { setView(n.id); setProj(null); }}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        
        <div className="sb-user slide-up">
          <div className="flex gap12 mb-20">
            <Avatar user={user} size={40} />
            <div style={{ overflow: 'hidden' }}>
              <div className="fw-bold fs14" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div className="text-mute fs12" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.email}</div>
            </div>
          </div>
          <button className="btn btn-full w-full" style={{ width: '100%', fontSize: 13, background: 'var(--accent-bg)', border: 'none' }} onClick={logout}>Sign Out</button>
        </div>
      </aside>
      
      <main className="main">
        <header className="topbar">
          <div className="flex gap12">
            <div className="fw-bold" style={{ fontSize: 18 }}>{proj ? proj.name : nav.find((n) => n.id === view)?.label}</div>
            {proj && <Badge type="Workspace" />}
          </div>
          <div className="flex gap12">
            <div className="flex gap8 p-8" style={{ background: 'var(--accent-bg)', borderRadius: 'var(--r-md)', padding: '6px 12px' }}>
              <TrendingUp size={14} className="text-mute"/>
              <span className="fs12 fw-bold">Active Stream</span>
            </div>
            <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />
            <Avatar user={user} size={36} />
          </div>
        </header>
        
        <div className="content">
          <ErrorBoundary>
            {proj ? (
              <ProjectTasksView key={proj.id} project={proj} user={user} onBack={() => { setProj(null); setView("projects"); }} />
            ) : view === "dashboard" ? (
              <Dashboard user={user} />
            ) : view === "projects" ? (
              <ProjectsView user={user} onSelect={(p) => setProj(p)} />
            ) : (
              <MyTasksView user={user} />
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
