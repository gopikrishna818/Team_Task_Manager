import React, { useState, useEffect, useCallback } from "react";
import { api, parseToken, genToken, getUser } from "./data.js";
import { Avatar, Modal, Field, Badge, ProgressBar, ErrorBox } from "./ui.jsx";
import { 
  LayoutDashboard, Briefcase, CheckCircle2, Layers, Inbox, 
  ClipboardList, TrendingUp, Calendar, Zap, ShieldCheck, 
  Lock, Globe, Users, Monitor, Columns, ArrowRight, Bell, Plus, Settings, AlertCircle, Clock, Trash2, UserPlus, ChevronRight,
  User, Shield, CreditCard, Puzzle, LogOut, Moon, Sun, Search
} from "lucide-react";

const today = () => new Date().toISOString().split("T")[0];

// ── Components ───────────────────────────────────────────────────────────────

function DonutChart({ data, total }) {
  const colors = ["#0ea5e9", "#f59e0b", "#10b981"]; // Blue, Amber, Green
  const entries = [["To Do", data["To Do"] || 0], ["In Progress", data["In Progress"] || 0], ["Done", data["Done"] || 0]];
  let cumulativePercent = 0;

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" className="donut-svg" width="100%" height="100%">
        {entries.map(([label, value], i) => {
          const percent = total > 0 ? (value / total) * 100 : 0;
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
          <button className="btn btn-primary w-full mt-20" onClick={submit} disabled={busy}>{busy ? "Loading..." : "Sign in"}</button>
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
            <button className="btn btn-primary"><Plus size={18}/> New task</button>
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
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 2, background: ["#0ea5e9", "#f59e0b", "#10b981"][i], width: `${(d.byStatus[s] || 0) / (d.totalTasks || 1) * 100}%` }} />
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
                    <td><Badge type={t.status} /></td>
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
          <textarea className="input" style={{ minHeight: 120, resize: "vertical" }} value={form.description} onChange={set("description")} disabled={!isAdmin} placeholder="Add more context here..." />
        </Field>
        <div className="grid-2">
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
        <div className="grid-2">
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
        <div className="flex gap12 mt-20" style={{ justifyContent: "flex-end" }}>
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

  useEffect(() => { refresh(); }, [refresh]);

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

  if (loading) return <div style={{ padding: 48 }}>Syncing tasks...</div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between mb-32">
        <div className="flex gap12">
          <button className="btn" onClick={onBack} style={{ width: 44, height: 44, padding: 0 }}><ArrowRight style={{ transform: 'rotate(180deg)' }} size={18} /></button>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>{project.name}</h2>
            <p className="text-mute">{project.description}</p>
          </div>
        </div>
        <div className="flex gap12">
          {isAdmin && <button className="btn" onClick={() => setShowMembers(true)}><Users size={18}/> Members</button>}
          {isAdmin && <button className="btn btn-primary" onClick={() => { setEditing(null); setShowNew(true); }}><Plus size={18}/> Add Task</button>}
        </div>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {cols.map((col, idx) => (
          <div key={col} className="tasks-card" style={{ background: '#fcfcfc', border: '1px solid #eee' }}>
            <div className="flex justify-between mb-20" style={{ borderBottom: `2px solid ${colColors[col]}`, paddingBottom: 12 }}>
              <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 12, letterSpacing: '0.05em' }}>{col}</span>
              <span className="badge" style={{ background: '#eee', color: '#666' }}>{filtered.filter(t => t.status === col).length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.filter(t => t.status === col).map(t => (
                <div key={t.id} className="metric-card" style={{ padding: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} onClick={() => { setEditing(t); setShowNew(true); }}>
                  <div className="flex justify-between mb-12">
                    <Badge type={t.priority} />
                    {t.dueDate < today() && t.status !== "Done" && <span style={{ color: 'var(--red)', fontSize: 10, fontWeight: 800 }}>⚠ OVERDUE</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{t.title}</div>
                  <div className="flex justify-between">
                    <Avatar user={{ name: t.assignedToName }} size={24} />
                    <span style={{ fontSize: 11, color: '#999', fontWeight: 800 }}>{t.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showNew && <TaskModal task={editing} projectId={project.id} user={user} members={project.members} onSave={() => { refresh(); setShowNew(false); setEditing(null); }} onClose={() => { setShowNew(false); setEditing(null); }} />}
      
      {showMembers && isAdmin && (
        <Modal title="Project Access" onClose={() => setShowMembers(false)}>
           <div style={{ marginBottom: 32 }}>
             {project.members?.map(m => (
               <div key={m.userId} className="flex justify-between p-16 mb-8" style={{ background: '#f8f9fa', borderRadius: 16 }}>
                 <div className="flex gap12">
                   <Avatar user={{ name: m.userName, email: m.userEmail }} size={32} />
                   <div>
                     <div style={{ fontWeight: 700, fontSize: 14 }}>{m.userName}</div>
                     <div style={{ fontSize: 12, color: '#999' }}>{m.role}</div>
                   </div>
                 </div>
                 {m.userId !== user.id && <button className="btn" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => api.removeMember(user.id, project.id, m.userId)}>Remove</button>}
               </div>
             ))}
           </div>
           <div className="tasks-card" style={{ background: '#f4f4f4', padding: 24, borderRadius: 16 }}>
             <Field label="Invite teammate">
               <div className="flex gap8">
                 <input className="input" style={{ flex: 1 }} placeholder="email@company.com" value={memEmail} onChange={(e) => setMemEmail(e.target.value)} />
                 <button className="btn btn-primary" style={{ padding: '12px 24px' }} onClick={addMem}>Invite</button>
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [user.id]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async () => {
    try {
      await api.createProject(user.id, form);
      setShowCreate(false);
      setForm({ name: "", description: "" });
      refresh();
    } catch (e) { setErr(e.message); }
  };

  const del = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this workspace?")) return;
    try {
      await api.deleteProject(user.id, id);
      refresh();
    } catch (e) { alert(e.message); }
  };

  if (loading) return <div style={{ padding: 48 }}>Loading workspaces...</div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between mb-32">
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>Workspaces</h2>
          <p className="text-mute">Manage and collaborate on your team projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={18}/> New Workspace</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
        {projects.map((p, i) => (
          <div key={p.id} className="metric-card" style={{ cursor: 'pointer' }} onClick={() => onSelect(p)}>
            <div className="flex justify-between mb-16">
              <Badge type={p.members?.find(m => m.userId === (user.id || user._id))?.role || "Member"} />
              <button className="btn" style={{ border: 'none', background: 'none', padding: 0 }} onClick={(e) => del(e, p.id)}><Trash2 size={16} color="#ef4444" /></button>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{p.name}</h3>
            <p className="text-mute" style={{ fontSize: 14, marginBottom: 20, minHeight: 40 }}>{p.description}</p>
            <div className="flex justify-between" style={{ borderTop: '1px solid #f4f4f4', paddingTop: 16 }}>
              <div className="flex -space-x-2">
                {p.members?.slice(0, 3).map((m, idx) => (
                  <div key={idx} style={{ marginLeft: idx > 0 ? -8 : 0, border: '2px solid #fff', borderRadius: '50%' }}>
                    <Avatar user={{ name: m.userName }} size={28} />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#999' }}>{p.members?.length} Members</span>
            </div>
          </div>
        ))}
        {projects.length === 0 && <div className="tasks-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60 }}>No workspaces yet. Create your first one to get started!</div>}
      </div>

      {showCreate && (
        <Modal title="Create Workspace" onClose={() => setShowCreate(false)}>
           <div className="entrance">
             <ErrorBox msg={err} />
             <Field label="Workspace Name"><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Product Launch" /></Field>
             <Field label="Description"><textarea className="input" style={{ minHeight: 120 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" /></Field>
             <button className="btn btn-primary w-full mt-20" onClick={create}>Initialize Workspace</button>
           </div>
        </Modal>
      )}
    </div>
  );
}

// ── My Tasks ─────────────────────────────────────────────────────────────────
function MyTasksView({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await api.getTasks(user.id);
        const uId = user.id || user._id;
        setTasks(data.filter(t => t.assignedTo === uId));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchTasks();
  }, [user.id]);

  if (loading) return <div style={{ padding: 48 }}>Loading your tasks...</div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between mb-32">
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800 }}>My Tasks</h2>
          <p className="text-mute">You have {tasks.length} active assignments</p>
        </div>
      </div>

      <div className="tasks-card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td><div className="task-name">{t.title}</div></td>
                <td className="text-mute" style={{ fontSize: 14 }}>{t.projectName}</td>
                <td><Badge type={t.priority} /></td>
                <td><Badge type={t.status} /></td>
                <td><span style={{ fontSize: 13, color: '#999', fontWeight: 600 }}>{t.dueDate}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>No tasks assigned to you yet.</div>}
      </div>
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────────────────────
function SettingsView({ user, activeTab }) {
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18}/> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18}/> },
    { id: 'security', label: 'Security', icon: <Shield size={18}/> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18}/> },
    { id: 'integrations', label: 'Integrations', icon: <Puzzle size={18}/> },
  ];
  
  const [currentTab, setCurrentTab] = useState(activeTab || 'profile');

  return (
    <div className="fade-in">
      <div className="mb-32">
        <h2 style={{ fontSize: 28, fontWeight: 800 }}>Settings</h2>
        <p className="text-mute">Manage your personal and workspace configurations</p>
      </div>

      <div className="flex gap12 mb-32" style={{ overflowX: 'auto', paddingBottom: 8 }}>
        {tabs.map(t => (
          <button key={t.id} className={`btn ${currentTab === t.id ? 'btn-primary' : ''}`} onClick={() => setCurrentTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="tasks-card">
        {currentTab === 'profile' && (
          <div className="entrance" style={{ maxWidth: 500 }}>
            <h3 className="mb-20" style={{ fontWeight: 800 }}>Public Profile</h3>
            <div className="flex gap20 mb-32" style={{ gap: 24 }}>
              <Avatar user={user} size={80} />
              <button className="btn">Change Photo</button>
            </div>
            <Field label="Full Name"><input className="input" defaultValue={user.name} /></Field>
            <Field label="Email Address"><input className="input" defaultValue={user.email} disabled /></Field>
            <Field label="Job Title"><input className="input" placeholder="e.g. Senior Designer" /></Field>
            <button className="btn btn-primary mt-20">Save Changes</button>
          </div>
        )}
        {currentTab === 'notifications' && (
          <div className="entrance">
            <h3 className="mb-20" style={{ fontWeight: 800 }}>Email Notifications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {["New task assigned", "Deadline approaching", "Project comments", "Member mentions"].map(item => (
                <div key={item} className="flex justify-between p-16" style={{ background: '#f8f9fa', borderRadius: 16 }}>
                  <span style={{ fontWeight: 600 }}>{item}</span>
                  <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: '#000' }} />
                </div>
              ))}
            </div>
          </div>
        )}
        {currentTab === 'billing' && (
          <div className="entrance">
             <div className="flex justify-between mb-32" style={{ background: '#000', color: '#fff', padding: 32, borderRadius: 24 }}>
               <div>
                 <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>Current Plan</div>
                 <div style={{ fontSize: 32, fontWeight: 800 }}>Pro Team</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: 32, fontWeight: 800 }}>$24/mo</div>
                 <div style={{ fontSize: 13, opacity: 0.6 }}>Next bill: Jun 12, 2026</div>
               </div>
             </div>
             <h3 className="mb-20" style={{ fontWeight: 800 }}>Payment Methods</h3>
             <div className="flex justify-between p-16" style={{ border: '1px solid #eee', borderRadius: 16 }}>
               <div className="flex gap12">
                 <div style={{ background: '#f4f4f4', padding: 8, borderRadius: 8 }}><CreditCard size={20}/></div>
                 <div>
                   <div style={{ fontWeight: 700 }}>Visa ending in 4242</div>
                   <div style={{ fontSize: 12, color: '#999' }}>Expiry 12/28</div>
                 </div>
               </div>
               <button className="btn">Edit</button>
             </div>
          </div>
        )}
        {currentTab !== 'profile' && currentTab !== 'notifications' && currentTab !== 'billing' && (
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>This section is currently being updated. Check back soon!</div>
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
  const [searchOpen, setSearchOpen] = useState(false);

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
          <button className={`nav-btn ${view === 'dashboard' && !proj ? 'active' : ''}`} onClick={() => { setView('dashboard'); setProj(null); }}>
            <div className="flex gap12"><LayoutDashboard size={20}/> Overview</div>
          </button>
          <button className={`nav-btn ${view === 'projects' || proj ? 'active' : ''}`} onClick={() => { setView('projects'); setProj(null); }}>
            <div className="flex gap12"><Briefcase size={20}/> Projects</div>
            <div className="badge" style={{ padding: '2px 8px', fontSize: 10, background: '#333', color: '#fff' }}>2</div>
          </button>
          <button className={`nav-btn ${view === 'queue' ? 'active' : ''}`} onClick={() => { setView('queue'); setProj(null); }}>
            <div className="flex gap12"><CheckCircle2 size={20}/> My tasks</div>
            <div className="badge" style={{ padding: '2px 8px', fontSize: 10, background: '#333', color: '#fff' }}>3</div>
          </button>
          <button className={`nav-btn ${view === 'members' ? 'active' : ''}`} onClick={() => { setView('members'); setProj(null); }}>
            <div className="flex gap12"><Users size={20}/> Members</div>
          </button>
        </div>

        <div className="sb-section">
          <div className="sb-label">Account</div>
          <button className={`nav-btn ${view === 'profile' ? 'active' : ''}`} onClick={() => { setView('profile'); setProj(null); }}>
            <div className="flex gap12"><User size={20}/> Profile</div>
          </button>
          <button className={`nav-btn ${view === 'notifications' ? 'active' : ''}`} onClick={() => { setView('notifications'); setProj(null); }}>
            <div className="flex gap12"><Bell size={20}/> Notifications</div>
          </button>
          <button className={`nav-btn ${view === 'billing' ? 'active' : ''}`} onClick={() => { setView('billing'); setProj(null); }}>
            <div className="flex gap12"><CreditCard size={20}/> Billing</div>
          </button>
          <button className={`nav-btn ${view === 'integrations' ? 'active' : ''}`} onClick={() => { setView('integrations'); setProj(null); }}>
            <div className="flex gap12"><Puzzle size={20}/> Integrations</div>
          </button>
        </div>

        <div className="sb-user-card" style={{ marginTop: 'auto' }}>
          <Avatar user={user} size={36} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>Admin</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
        </div>
        <button onClick={logout} style={{ margin: '0 16px 24px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', padding: '12px', borderRadius: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <LogOut size={16}/> Sign Out
        </button>
      </aside>
      
      <main className="main">
        <div className="content">
          {proj ? (
            <ProjectTasksView project={proj} user={user} onBack={() => setProj(null)} />
          ) : view === "dashboard" ? (
            <Dashboard user={user} />
          ) : view === "projects" ? (
            <ProjectsView user={user} onSelect={p => setProj(p)} />
          ) : view === "queue" ? (
            <MyTasksView user={user} />
          ) : view === "members" ? (
            <div className="fade-in">
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Members</h2>
              <p className="text-mute mb-32">Manage your team and their permissions</p>
              <div className="tasks-card">Team management coming soon...</div>
            </div>
          ) : ['profile', 'notifications', 'security', 'billing', 'integrations'].includes(view) ? (
            <SettingsView user={user} activeTab={view} />
          ) : (
            <div className="fade-in">
              <h2 style={{ fontSize: 28, fontWeight: 800 }}>Not Found</h2>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
