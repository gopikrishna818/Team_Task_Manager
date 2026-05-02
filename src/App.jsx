import React, { useState, useEffect, useCallback } from "react";
import { api, parseToken, genToken, getUser } from "./data.js";
import { Avatar, Modal, Field, Badge, ProgressBar, ErrorBox } from "./ui.jsx";
import { LayoutDashboard, Briefcase, CheckCircle2, Layers, Inbox, ClipboardList } from "lucide-react";

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
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">
          <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,var(--accent),var(--accent2))", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#fff", boxShadow: "0 8px 24px var(--accent-glow)" }}><Layers size={28} color="#fff" /></div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.5px" }}>TaskFlow</div>
          <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 4 }}>Collaborative task management</div>
        </div>
        <div className="auth-card">
          <div className="tab-group">
            {["login", "signup"].map((m) => (
              <button key={m} className={`tab${mode === m ? " active" : ""}`} onClick={() => setMode(m)}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
          <ErrorBox msg={err} />
          {mode === "signup" && (
            <Field label="Full Name">
              <input className="input" placeholder="Jane Smith" value={form.name} onChange={set("name")} />
            </Field>
          )}
          <Field label="Email">
            <input className="input" type="email" value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Password">
            <input className="input" type="password" value={form.password} onChange={set("password")} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </Field>
          <button className="btn btn-primary btn-full" onClick={submit} disabled={busy} style={{ padding: ".65rem", marginTop: 4 }}>
            {busy ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
          {mode === "login" && (
            <div className="demo-hint">
              <strong>Demo accounts · password: demo123</strong>
              alice@demo.com · bob@demo.com · carol@demo.com · david@demo.com
            </div>
          )}
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

  if (loading || !d) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  const statusColors = { "To Do": "#a0a0b5", "In Progress": "#2563eb", Done: "#16a34a" };
  const metrics = [
    { label: "My Projects", value: d.projects, icon: <Briefcase size={80} strokeWidth={1} />, cls: "metric-accent", bar: 100, barColor: "var(--accent)" },
    { label: "Total Tasks", value: d.totalTasks, icon: <Layers size={80} strokeWidth={1} />, cls: "", bar: 100, barColor: "#6b6b80" },
    { label: "My Tasks", value: d.myTasks, icon: <CheckCircle2 size={80} strokeWidth={1} />, cls: "metric-blue", bar: d.totalTasks ? Math.round((d.myTasks / d.totalTasks) * 100) : 0, barColor: "var(--blue)" },
    { label: "Overdue", value: d.overdue, icon: <LayoutDashboard size={80} strokeWidth={1} />, cls: "metric-red", bar: d.totalTasks ? Math.round((d.overdue / d.totalTasks) * 100) : 0, barColor: "var(--red)" },
    { label: "Completed", value: d.byStatus["Done"], icon: <CheckCircle2 size={80} strokeWidth={1} />, cls: "metric-green", bar: d.totalTasks ? Math.round((d.byStatus["Done"] / d.totalTasks) * 100) : 0, barColor: "var(--green)" },
  ];

  return (
    <div className="fade-up">
      <div className="section-head">
        <div>
          <div className="section-title">Dashboard</div>
          <div className="section-sub">Welcome back, {user.name.split(" ")[0]} 👋</div>
        </div>
      </div>
      <div className="bento bento-5col mb-20">
        {metrics.map((m) => (
          <div key={m.label} className={`metric ${m.cls}`}>
            <div className="metric-icon">{m.icon}</div>
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-bar">
              <div className="metric-bar-fill" style={{ width: `${m.bar}%`, background: m.barColor }} />
            </div>
          </div>
        ))}
      </div>
      <div className="bento bento-3col">
        <div className="card">
          <div className="fw6 mb-12" style={{ fontSize: 14 }}>Tasks by Status</div>
          <div className="bar-row">
            {Object.entries(d.byStatus).map(([k, v]) => (
              <div key={k} className="bar-item">
                <div className="bar-meta">
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${d.totalTasks ? (v / d.totalTasks) * 100 : 0}%`, background: statusColors[k] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="fw6 mb-12" style={{ fontSize: 14 }}>Workload by Member</div>
          {d.byUser.length === 0 ? (
            <div className="tc-2 fs13">No assignments yet</div>
          ) : (
            d.byUser.map(({ user: u, count }) => (
              <div key={u.id} className="flex gap8 mb-12">
                <Avatar user={u} size={26} />
                <div style={{ flex: 1 }}>
                  <div className="flex gap6 mb-6">
                    <span className="fs13 fw6">{u.name.split(" ")[0]}</span>
                    <span className="fs12 tc-2 ml-auto">{count} tasks</span>
                  </div>
                  <ProgressBar value={d.totalTasks ? Math.round((count / d.totalTasks) * 100) : 0} />
                </div>
              </div>
            ))
          )}
        </div>
        <div className="card">
          <div className="fw6 mb-12" style={{ fontSize: 14 }}>Recent Activity</div>
          {d.recentTasks.map((t) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div className="fs13 fw6" style={{ marginBottom: 3 }}>{t.title}</div>
                <Badge type={t.status} />
              </div>
              <Badge type={t.priority} />
            </div>
          ))}
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
    <Modal title={task ? "Edit Task" : "New Task"} onClose={onClose}>
      <ErrorBox msg={err} />
      <Field label="Title">
        <input className="input" value={form.title} onChange={set("title")} disabled={!isAdmin} placeholder="Task title" />
      </Field>
      <Field label="Description">
        <textarea className="input" style={{ minHeight: 72, resize: "vertical" }} value={form.description} onChange={set("description")} disabled={!isAdmin} placeholder="Optional description" />
      </Field>
      <div className="grid-2">
        <Field label="Status">
          <select className="input" value={form.status} onChange={set("status")}>
            {["To Do", "In Progress", "Done"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select className="input" value={form.priority} onChange={set("priority")} disabled={!isAdmin}>
            {["Low", "Medium", "High"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid-2">
        <Field label="Assignee">
          <select className="input" value={form.assignedTo} onChange={set("assignedTo")} disabled={!isAdmin}>
            {members?.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.userName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Due Date">
          <input className="input" type="date" value={form.dueDate} onChange={set("dueDate")} disabled={!isAdmin} />
        </Field>
      </div>
      <div className="flex gap8 ml-auto" style={{ justifyContent: "flex-end", marginTop: 8 }}>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? "Saving..." : "Save Task"}</button>
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
  const colDot = { "To Do": "#a0a0b5", "In Progress": "#2563eb", Done: "#16a34a" };
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

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  return (
    <div className="fade-up">
      <div className="flex gap8 mb-20">
        <button className="btn btn-sm" onClick={onBack}>← Back</button>
        <div>
          <div className="section-title" style={{ fontSize: 17 }}>{project.name}</div>
          <div className="fs12 tc-2">{project.description}</div>
        </div>
        <div className="flex gap8 ml-auto">
          <Badge type={project.members?.find((m) => m.userId === (user.id || user._id) || m.userId?._id === (user.id || user._id))?.role} />
          {isAdmin && <button className="btn btn-sm" onClick={() => setShowMembers(true)}>👥 Members ({project.members?.length || 0})</button>}
          {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setShowNew(true); }}>+ New Task</button>}
        </div>
      </div>
      <div className="flex gap8 mb-16">
        {["All", ...cols].map((f) => (
          <button key={f} className={`btn btn-sm${filter === f ? " btn-primary" : ""}`} onClick={() => setFilter(f)}>
            {f}
            {f !== "All" && ` (${tasks.filter((t) => t.status === f).length})`}
          </button>
        ))}
      </div>
      <div className="bento bento-3col">
        {cols.map((col) => {
          const ct = filtered.filter((t) => t.status === col);
          return (
            <div key={col} className="col-wrap">
              <div className="col-head">
                <div className="col-dot" style={{ background: colDot[col] }} />
                <span className="col-title">{col}</span>
                <span className="col-count">{ct.length}</span>
              </div>
              {ct.map((task) => {
                const assigneeUser = { id: task.assignedTo, name: task.assignedToName, email: task.assignedToEmail };
                const late = task.dueDate < td && task.status !== "Done";
                return (
                  <div key={task.id} className={`task-card${late ? " overdue" : ""}`} onClick={() => { setEditing(task); setShowNew(true); }}>
                    <div className="flex gap6 mb-6">
                      <Badge type={task.priority} />
                      {late && <span className="fs12 tc-red ml-auto pulse">⚠ Overdue</span>}
                    </div>
                    <div className="task-title">{task.title}</div>
                    {task.description && <div className="task-desc">{task.description.slice(0, 80)}{task.description.length > 80 ? "…" : ""}</div>}
                    <div className="task-footer">
                      <div className="flex gap6">
                        {assigneeUser && <Avatar user={assigneeUser} size={20} />}
                        <span className="fs12 tc-2">{assigneeUser?.name?.split(" ")[0]}</span>
                      </div>
                      <span className={`task-due${late ? " late" : ""}`}>Due {task.dueDate}</span>
                    </div>
                    {isAdmin && (
                      <button className="btn btn-danger btn-xs" style={{ marginTop: 8 }} onClick={(e) => { e.stopPropagation(); if (confirm("Delete this task?")) deleteTask(task.id); }}>Delete</button>
                    )}
                  </div>
                );
              })}
              {ct.length === 0 && <div className="empty" style={{ padding: "1.5rem 0" }}><div className="empty-icon"><Inbox size={48} strokeWidth={1} /></div><p className="fs12">No tasks here</p></div>}
            </div>
          );
        })}
      </div>
      {showNew && <TaskModal task={editing} projectId={project.id} user={user} members={project.members} onSave={() => { refresh(); setShowNew(false); setEditing(null); }} onClose={() => { setShowNew(false); setEditing(null); }} />}
      {showMembers && isAdmin && (
        <Modal title="Manage Members" onClose={() => { setShowMembers(false); setMemErr(""); }}>
          <div style={{ marginBottom: "1rem" }}>
            {project.members?.map((m) => {
              const u = { id: m.userId, name: m.userName, email: m.userEmail };
              return (
                <div key={m.userId} className="member-row">
                  <Avatar user={u} size={30} />
                  <div style={{ flex: 1 }}>
                    <div className="fs13 fw6">{u?.name}</div>
                    <div className="fs12 tc-2">{u?.email}</div>
                  </div>
                  <Badge type={m.role} />
                  {m.userId !== user.id && <button className="btn btn-danger btn-xs" onClick={() => api.removeMember(user.id, project.id, m.userId)}>Remove</button>}
                </div>
              );
            })}
          </div>
          <Field label="Add member by email">
            <div className="flex gap8">
              <input className="input" placeholder="user@example.com" value={memEmail} onChange={(e) => setMemEmail(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={addMem}>Add</button>
            </div>
          </Field>
          <ErrorBox msg={memErr} />
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
    if (!confirm("Delete this project and all its tasks?")) return;
    try {
      await api.deleteProject(user.id, id);
      refresh();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  return (
    <div className="fade-up">
      <div className="section-head">
        <div>
          <div className="section-title">Projects</div>
          <div className="section-sub">Your active workspaces</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
      </div>
      <div className="bento" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))" }}>
        {projects.map((proj) => {
          const uId = user.id || user._id;
          const role = proj.members?.find((m) => m.userId === uId || m.userId?._id === uId)?.role;
          return (
            <div key={proj.id} className="card card-clickable" onClick={() => onSelect(proj)}>
              <div className="flex gap8 mb-12">
                <Badge type={role} />
                <span className="fs12 tc-2 ml-auto">{proj.createdAt?.split("T")[0] || "Today"}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, letterSpacing: "-.2px" }}>{proj.name}</div>
              <div className="fs13 tc-2" style={{ marginBottom: 14, lineHeight: 1.5 }}>{proj.description}</div>
              <div className="flex gap6 mb-6">
                <span className="fs12 tc-2">Members</span>
                <span className="fs12 fw6 ml-auto">{proj.members?.length || 0}</span>
              </div>
              <ProgressBar value={50} />
              <div className="flex gap8" style={{ marginTop: 12 }}>
                <div className="flex gap6">{proj.members?.slice(0, 4).map((m) => <Avatar key={m.userId} user={{ id: m.userId, name: m.userName, email: m.userEmail }} size={22} />)}</div>
                {role === "Admin" && <button className="btn btn-danger btn-xs" onClick={(e) => del(e, proj.id)}>Delete</button>}
              </div>
            </div>
          );
        })}
        {projects.length === 0 && <div className="card empty" style={{ gridColumn: "1/-1" }}><div className="empty-icon"><ClipboardList size={48} strokeWidth={1} /></div><p>No projects yet — create your first one!</p></div>}
      </div>
      {showCreate && (
        <Modal title="New Project" onClose={() => { setShowCreate(false); setErr(""); }}>
          <ErrorBox msg={err} />
          <Field label="Project Name"><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Website Redesign" /></Field>
          <Field label="Description"><textarea className="input" style={{ minHeight: 80, resize: "vertical" }} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" /></Field>
          <div className="flex gap8" style={{ justifyContent: "flex-end" }}>
            <button className="btn" onClick={() => { setShowCreate(false); setErr(""); }}>Cancel</button>
            <button className="btn btn-primary" onClick={create}>Create Project</button>
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

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;

  return (
    <div className="fade-up">
      <div className="section-head">
        <div>
          <div className="section-title">My Tasks</div>
          <div className="section-sub">{all.length} task{all.length !== 1 ? "s" : ""} assigned to you</div>
        </div>
      </div>
      <div className="flex gap8 mb-16">
        {["All", "To Do", "In Progress", "Done", "Overdue"].map((f) => (
          <button key={f} className={`btn btn-sm${filter === f ? " btn-primary" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div className="empty"><div className="empty-icon"><CheckCircle2 size={48} strokeWidth={1} /></div><p>No tasks found for this filter</p></div>
        ) : (
          <table className="tbl">
            <thead><tr><th>Task</th><th>Project</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Update</th></tr></thead>
            <tbody>
              {filtered.map((task) => {
                const late = task.dueDate < td && task.status !== "Done";
                return (
                  <tr key={task.id}>
                    <td><div className="fw6">{task.title}</div>{task.description && <div className="fs12 tc-2">{task.description.slice(0, 55)}…</div>}</td>
                    <td className="tc-2">{task.projectName}</td>
                    <td><Badge type={task.priority} /></td>
                    <td><Badge type={task.status} /></td>
                    <td className={late ? "tc-red fw6" : "tc-2"}>{task.dueDate}{late && " ⚠"}</td>
                    <td>
                      <select className="input" style={{ width: "auto", fontSize: 12, padding: "4px 8px" }} value={task.status} onChange={(e) => updateStatus(task, e.target.value)}>
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

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
  if (!auth) return <AuthScreen onAuth={handleAuth} />;

  const { user } = auth;
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "projects", label: "Projects", icon: <Briefcase size={18} /> },
    { id: "mytasks", label: "My Tasks", icon: <CheckCircle2 size={18} /> },
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="logo-icon"><Layers size={22} color="#fff" /></div>
          <span className="logo-text">TaskFlow</span>
        </div>
        <nav className="sb-nav">
          {nav.map((n) => (
            <button key={n.id} className={`nav-btn${view === n.id && !proj ? " active" : ""}`} onClick={() => { setView(n.id); setProj(null); }}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="sb-user">
          <div className="flex gap8 mb-12">
            <Avatar user={user} size={32} />
            <div>
              <div className="fs13 fw6">{user.name}</div>
              <div className="fs12 tc-2">{user.email}</div>
            </div>
          </div>
          <button className="btn btn-full" style={{ fontSize: 12 }} onClick={logout}>Sign Out</button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="fw6" style={{ fontSize: 15 }}>{proj ? proj.name : nav.find((n) => n.id === view)?.label}</div>
          <div className="flex gap8">
            <span className="fs12 tc-2">Signed in as {user.name}</span>
            <Avatar user={user} size={28} />
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
