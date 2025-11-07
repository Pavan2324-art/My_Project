import React, { useState } from "react";
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

  // ---- REGISTER ----
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Registration failed");
      alert("Registration successful! Please login.");
      setPage("login");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // ---- LOGIN ----
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Login failed");

      setCurrentUser(data.user);
      setPage(data.user.role === "admin" ? "admin" : "student");
      localStorage.setItem("token", data.token);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    setPage("welcome");
  };

  // ---- ADD SCHOLARSHIP (ADMIN) ----
  const addScholarship = (e) => {
    e.preventDefault();
    if (!newScholarship.name || !newScholarship.amount || !newScholarship.deadline)
      return alert("Fill all fields");
    setScholarships([...scholarships, { id: Date.now(), ...newScholarship }]);
    setNewScholarship({ name: "", amount: "", deadline: "" });
  };

  // ---- APPLY FOR SCHOLARSHIP (STUDENT) ----
  const applyForScholarship = (id) => {
    if (applications.some((a) => a.studentId === currentUser.email && a.scholarshipId === id))
      return alert("Already applied");
    setApplications([
      ...applications,
      { id: Date.now(), studentId: currentUser.email, scholarshipId: id, status: "Pending" },
    ]);
    alert("Application submitted!");
  };

  const updateStatus = (appId, status) => {
    setApplications(applications.map((a) => (a.id === appId ? { ...a, status } : a)));
  };

  return (
    <div className="app-container">
      {/* MENU BAR */}
      <nav className="navbar">
        <h1 className="nav-title">🎓 Scholarship Portal</h1>
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
              {currentUser.role === "admin" && (
                <button onClick={() => setPage("admin")}>Dashboard</button>
              )}
              {currentUser.role === "applicant" && (
                <button onClick={() => setPage("student")}>My Page</button>
              )}
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="content">
        {/* WELCOME PAGE */}
        {page === "welcome" && (
          <div className="welcome-card">
            <h2>Welcome to the Scholarship Portal</h2>
            <p>Register as a student or admin to continue</p>
          </div>
        )}

        {/* REGISTER PAGE */}
        {page === "register" && (
          <div className="auth-card">
            <h2>Create Account</h2>
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
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="applicant">Applicant</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit">Register</button>
            </form>
          </div>
        )}

        {/* LOGIN PAGE */}
        {page === "login" && (
          <div className="auth-card">
            <h2>Login</h2>
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
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="submit">Login</button>
            </form>
          </div>
        )}

        {/* STUDENT PAGE */}
        {page === "student" && (
          <>
            <h2 className="section-title">Available Scholarships</h2>
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Scholarship Name</th>
                    <th>Amount</th>
                    <th>Deadline</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scholarships.map((s, index) => (
                    <tr key={s.id}>
                      <td>{index + 1}</td>
                      <td>{s.name}</td>
                      <td>${s.amount}</td>
                      <td>{s.deadline}</td>
                      <td>
                        <button
                          className="apply-btn"
                          onClick={() => applyForScholarship(s.id)}
                        >
                          Apply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                      const s = scholarships.find((sch) => sch.id === a.scholarshipId);
                      return (
                        <tr key={a.id}>
                          <td>{index + 1}</td>
                          <td>{s?.name}</td>
                          <td>{a.status}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ADMIN PAGE */}
        {page === "admin" && (
          <>
            <h2 className="section-title">Admin Dashboard</h2>
            <form className="admin-form" onSubmit={addScholarship}>
              <h3>Add New Scholarship</h3>
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
                  setNewScholarship({ ...newScholarship, amount: e.target.value })
                }
              />
              <input
                type="date"
                value={newScholarship.deadline}
                onChange={(e) =>
                  setNewScholarship({ ...newScholarship, deadline: e.target.value })
                }
              />
              <button type="submit">Add Scholarship</button>
            </form>

            <h3 className="section-title">Applications</h3>
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
                    const s = scholarships.find((sch) => sch.id === a.scholarshipId);
                    return (
                      <tr key={a.id}>
                        <td>{index + 1}</td>
                        <td>{a.studentId}</td>
                        <td>{s?.name}</td>
                        <td>{a.status}</td>
                        <td>
                          <select
                            value={a.status}
                            onChange={(e) => updateStatus(a.id, e.target.value)}
                          >
                            <option>Pending</option>
                            <option>Approved</option>
                            <option>Rejected</option>
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
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>© Since 2025 @ Scholarship Portal</p>
      </footer>
    </div>
  );
}

export default App;
