import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("welcome");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "applicant",
  });

  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [scholarships, setScholarships] = useState([
    { id: 1, name: "Merit Scholarship", amount: 2000, deadline: "2025-12-31" },
    { id: 2, name: "Need-Based Scholarship", amount: 1500, deadline: "2025-11-30" },
  ]);

  const [applications, setApplications] = useState([]);
  const [newScholarship, setNewScholarship] = useState({
    name: "",
    amount: "",
    deadline: "",
  });

  // Restore user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // -------- REGISTER --------
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!form.name || !form.email || !form.password) {
      setAuthError("Please fill in all fields.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Registration failed.");
      } else {
        setAuthSuccess("Registration successful! Please login.");
        setPage("login");
      }
    } catch (err) {
      console.error(err);
      setAuthError("Server error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // -------- LOGIN --------
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!form.email || !form.password) {
      setAuthError("Email and password are required.");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Login failed.");
        return;
      }

      setCurrentUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuthSuccess("Login successful.");
      setPage("welcome");
    } catch (err) {
      console.error(err);
      setAuthError("Server error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPage("welcome");
  };

  // -------- APPLY FOR SCHOLARSHIP (STUDENT) --------
  const applyForScholarship = (id) => {
    if (!currentUser) return;

    if (
      applications.some(
        (a) => a.studentId === currentUser.email && a.scholarshipId === id
      )
    ) {
      alert("Already applied");
      return;
    }

    setApplications([
      ...applications,
      {
        id: Date.now(),
        studentId: currentUser.email,
        scholarshipId: id,
        status: "Pending",
      },
    ]);
    alert("Application submitted!");
  };

  const calculateDaysLeft = (deadline) => {
    const d = new Date(deadline);
    const today = new Date();
    const diff = d - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // -------- ADD SCHOLARSHIP (ADMIN) --------
  const addScholarship = (e) => {
    e.preventDefault();
    if (!newScholarship.name || !newScholarship.amount || !newScholarship.deadline) {
      alert("Fill all fields");
      return;
    }
    setScholarships([
      ...scholarships,
      {
        id: Date.now(),
        name: newScholarship.name,
        amount: Number(newScholarship.amount),
        deadline: newScholarship.deadline,
      },
    ]);
    setNewScholarship({ name: "", amount: "", deadline: "" });
  };

  // -------- UPDATE APPLICATION STATUS (ADMIN) --------
  const updateStatus = (appId, status) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">SP</div>
        <ul className="sidebar-menu">
          <li
            className={page === "welcome" ? "active" : ""}
            onClick={() => setPage("welcome")}
          >
            Home
          </li>

          {currentUser && (
            <>
              <li
                className={page === "student" ? "active" : ""}
                onClick={() => setPage("student")}
              >
                My Dashboard
              </li>
              <li
                className={page === "profile" ? "active" : ""}
                onClick={() => setPage("profile")}
              >
                My Profile
              </li>
              {currentUser.role === "admin" && (
                <li
                  className={page === "admin" ? "active" : ""}
                  onClick={() => setPage("admin")}
                >
                  Admin Panel
                </li>
              )}
            </>
          )}
        </ul>
      </aside>

      {/* MAIN AREA */}
      <div className="app-container">
        {/* NAVBAR */}
        <nav className="navbar">
          <h1 className="nav-title">Scholarship Portal</h1>
          <div className="menu-bar">
            {!currentUser && (
              <>
                <button onClick={() => setPage("welcome")}>Home</button>
                <button onClick={() => setPage("register")}>Register</button>
                <button onClick={() => setPage("login")}>Login</button>
              </>
            )}
            {currentUser && (
              <>
                <span className="user-chip">{currentUser.email}</span>
                <button onClick={() => setPage("student")}>Dashboard</button>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>

        {/* CONTENT */}
        <main className="content">
          {/* HOME DASHBOARD (LOGGED IN) */}
          {page === "welcome" && currentUser && (
            <>
              <h2>Welcome {currentUser.name || currentUser.email}</h2>

              <div className="dashboard-grid">
                <div className="dash-card blue">
                  <div className="dash-icon">📘</div>
                  <div className="dash-title">Available Scholarships</div>
                  <span className="dash-count">{scholarships.length}</span>
                </div>

                <div className="dash-card cyan">
                  <div className="dash-icon">✅</div>
                  <div className="dash-title">Approved Applications</div>
                  <span className="dash-count">
                    {
                      applications.filter(
                        (a) =>
                          a.studentId === currentUser.email &&
                          a.status === "Approved"
                      ).length
                    }
                  </span>
                </div>

                <div className="dash-card green">
                  <div className="dash-icon">🕒</div>
                  <div className="dash-title">Pending Applications</div>
                  <span className="dash-count">
                    {
                      applications.filter(
                        (a) =>
                          a.studentId === currentUser.email &&
                          a.status === "Pending"
                      ).length
                    }
                  </span>
                </div>

                <div className="dash-card blue">
                  <div className="dash-icon">📄</div>
                  <div className="dash-title">Total Applications</div>
                  <span className="dash-count">
                    {applications.filter((a) => a.studentId === currentUser.email).length}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* HOME (GUEST) */}
          {page === "welcome" && !currentUser && (
            <div className="welcome-card">
              <h2>Welcome to the Scholarship Portal</h2>
              <p>Please register or login to continue.</p>
            </div>
          )}

          {/* STUDENT PAGE */}
          {page === "student" && currentUser && (
            <>
              <h2 className="section-title">Available Scholarships</h2>
              <div className="table-container">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Amount</th>
                      <th>Deadline</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scholarships.map((s, index) => {
                      const daysLeft = calculateDaysLeft(s.deadline);
                      const isExpired = daysLeft < 0;
                      const alreadyApplied = applications.some(
                        (a) =>
                          a.studentId === currentUser.email &&
                          a.scholarshipId === s.id
                      );
                      return (
                        <tr key={s.id} className={isExpired ? "expired" : ""}>
                          <td>{index + 1}</td>
                          <td>{s.name}</td>
                          <td>${s.amount}</td>
                          <td>
                            {s.deadline} {!isExpired && `(${daysLeft}d left)`}
                          </td>
                          <td>
                            <button
                              className="apply-btn"
                              disabled={isExpired || alreadyApplied}
                              onClick={() => applyForScholarship(s.id)}
                            >
                              {alreadyApplied
                                ? "Applied"
                                : isExpired
                                ? "Closed"
                                : "Apply"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* My Applications list */}
              <h2 className="section-title">My Applications</h2>
              <div className="table-container">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Scholarship</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications
                      .filter((a) => a.studentId === currentUser.email)
                      .map((a, index) => {
                        const s = scholarships.find(
                          (sch) => sch.id === a.scholarshipId
                        );
                        return (
                          <tr key={a.id}>
                            <td>{index + 1}</td>
                            <td>{s?.name || "Unknown"}</td>
                            <td>
                              <span
                                className={
                                  a.status === "Pending"
                                    ? "status-badge status-pending"
                                    : a.status === "Approved"
                                    ? "status-badge status-approved"
                                    : "status-badge status-rejected"
                                }
                              >
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* PROFILE PAGE */}
          {page === "profile" && currentUser && (
            <div className="profile-page">
              <h2 className="section-title">My Profile</h2>
              <div className="profile-card">
                <div className="profile-row">
                  <strong>Name:</strong> {currentUser.name || "N/A"}
                </div>
                <div className="profile-row">
                  <strong>Email:</strong> {currentUser.email}
                </div>
                <div className="profile-row">
                  <strong>Role:</strong> {currentUser.role}
                </div>
              </div>
            </div>
          )}

          {/* ADMIN PAGE */}
          {page === "admin" && currentUser && currentUser.role === "admin" && (
            <>
              <h2 className="section-title">Admin Panel</h2>

              <form className="admin-form" onSubmit={addScholarship}>
                <h3>Add New Scholarship</h3>
                <div className="admin-form-row">
                  <input
                    type="text"
                    placeholder="Scholarship Name"
                    value={newScholarship.name}
                    onChange={(e) =>
                      setNewScholarship({ ...newScholarship, name: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newScholarship.amount}
                    onChange={(e) =>
                      setNewScholarship({
                        ...newScholarship,
                        amount: e.target.value,
                      })
                    }
                  />
                  <input
                    type="date"
                    value={newScholarship.deadline}
                    onChange={(e) =>
                      setNewScholarship({
                        ...newScholarship,
                        deadline: e.target.value,
                      })
                    }
                  />
                  <button type="submit">Add Scholarship</button>
                </div>
              </form>

              <h2 className="section-title">Requested Applications</h2>
              <div className="table-container">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Scholarship</th>
                      <th>Status</th>
                      <th>Change Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((a, index) => {
                      const s = scholarships.find(
                        (sch) => sch.id === a.scholarshipId
                      );
                      return (
                        <tr key={a.id}>
                          <td>{index + 1}</td>
                          <td>{a.studentId}</td>
                          <td>{s?.name || "Unknown"}</td>
                          <td>
                            <span
                              className={
                                a.status === "Pending"
                                  ? "status-badge status-pending"
                                  : a.status === "Approved"
                                  ? "status-badge status-approved"
                                  : "status-badge status-rejected"
                              }
                            >
                              {a.status}
                            </span>
                          </td>
                          <td>
                            <select
                              value={a.status}
                              onChange={(e) => updateStatus(a.id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* REGISTER */}
          {page === "register" && !currentUser && (
            <div className="auth-card">
              <h2>Create Account</h2>

              {authError && <div className="alert alert-error">{authError}</div>}
              {authSuccess && (
                <div className="alert alert-success">{authSuccess}</div>
              )}

              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                >
                  <option value="applicant">Applicant</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit" disabled={authLoading}>
                  {authLoading ? "Creating..." : "Register"}
                </button>
              </form>
            </div>
          )}

          {/* LOGIN */}
          {page === "login" && !currentUser && (
            <div className="auth-card">
              <h2>Login</h2>

              {authError && <div className="alert alert-error">{authError}</div>}
              {authSuccess && (
                <div className="alert alert-success">{authSuccess}</div>
              )}

              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button type="submit" disabled={authLoading}>
                  {authLoading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="footer">
          <p>© Since 2025 @ Scholarship Portal</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
