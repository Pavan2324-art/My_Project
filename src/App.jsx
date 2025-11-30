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

  // Scholarships (Odisha-style: dept + level)
  const [scholarships, setScholarships] = useState([
    {
      id: 1,
      name: "Merit Scholarship",
      amount: 2000,
      deadline: "2025-12-31",
      department: "Higher Education",
      level: "UG",
    },
    {
      id: 2,
      name: "Need-Based Scholarship",
      amount: 1500,
      deadline: "2025-11-30",
      department: "ST & SC Dev.",
      level: "UG",
    },
  ]);

  const [applications, setApplications] = useState([]);

  const [newScholarship, setNewScholarship] = useState({
    name: "",
    amount: "",
    deadline: "",
    department: "",
    level: "",
  });

  // Announcements
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Scholarship portal open for AY 2025-26",
      date: "2025-11-15",
      content: "Students can apply for listed scholarships till 31 December 2025.",
    },
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    date: "",
    content: "",
  });

  // Student application form (extra details)
  const [applicationForm, setApplicationForm] = useState({
    scholarshipId: "",
    course: "",
    institute: "",
    bankAccount: "",
    ifsc: "",
  });
  const [showApplyForm, setShowApplyForm] = useState(false);

  // Filters for scholarship list
  const [filterDept, setFilterDept] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [search, setSearch] = useState("");

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

  // -------- STUDENT APPLY FLOW --------
  const calculateDaysLeft = (deadline) => {
    const d = new Date(deadline);
    const today = new Date();
    const diff = d - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const startApplication = (scholarshipId) => {
    if (!currentUser) return;
    if (
      applications.some(
        (a) => a.studentId === currentUser.email && a.scholarshipId === scholarshipId
      )
    ) {
      alert("Already applied for this scholarship.");
      return;
    }
    setApplicationForm({
      scholarshipId,
      course: "",
      institute: "",
      bankAccount: "",
      ifsc: "",
    });
    setShowApplyForm(true);
  };

  const submitApplication = (e) => {
    e.preventDefault();
    if (!applicationForm.course || !applicationForm.institute) {
      alert("Please fill course and institute.");
      return;
    }
    setApplications([
      ...applications,
      {
        id: Date.now(),
        studentId: currentUser.email,
        scholarshipId: applicationForm.scholarshipId,
        status: "Pending",
        course: applicationForm.course,
        institute: applicationForm.institute,
        bankAccount: applicationForm.bankAccount,
        ifsc: applicationForm.ifsc,
      },
    ]);
    setShowApplyForm(false);
    alert("Application submitted!");
  };

  // -------- ADMIN: ADD SCHOLARSHIP --------
  const addScholarship = (e) => {
    e.preventDefault();
    if (
      !newScholarship.name ||
      !newScholarship.amount ||
      !newScholarship.deadline ||
      !newScholarship.department ||
      !newScholarship.level
    ) {
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
        department: newScholarship.department,
        level: newScholarship.level,
      },
    ]);
    setNewScholarship({
      name: "",
      amount: "",
      deadline: "",
      department: "",
      level: "",
    });
  };

  // -------- ADMIN: UPDATE APPLICATION STATUS --------
  const updateStatus = (appId, status) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );
  };

  // -------- ADMIN: PUBLISH ANNOUNCEMENT --------
  const publishAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.date) {
      alert("Please add title and date.");
      return;
    }
    setAnnouncements([
      ...announcements,
      { id: Date.now(), ...newAnnouncement },
    ]);
    setNewAnnouncement({ title: "", date: "", content: "" });
  };

  // -------- FILTERED SCHOLARSHIPS --------
  const filteredScholarships = scholarships.filter((s) => {
    const matchDept = filterDept ? s.department === filterDept : true;
    const matchLevel = filterLevel ? s.level === filterLevel : true;
    const matchSearch = search
      ? s.name.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchDept && matchLevel && matchSearch;
  });

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
                Scholarship List
              </li>
              <li
                className={page === "profile" ? "active" : ""}
                onClick={() => setPage("profile")}
              >
                My Profile
              </li>
            </>
          )}

          <li
            className={page === "announcements" ? "active" : ""}
            onClick={() => setPage("announcements")}
          >
            Announcements
          </li>
          <li
            className={page === "howto" ? "active" : ""}
            onClick={() => setPage("howto")}
          >
            How to Apply
          </li>
          <li
            className={page === "faqs" ? "active" : ""}
            onClick={() => setPage("faqs")}
          >
            FAQs
          </li>
          <li
            className={page === "about" ? "active" : ""}
            onClick={() => setPage("about")}
          >
            About Portal
          </li>

          {currentUser && currentUser.role === "admin" && (
            <li
              className={page === "admin" ? "active" : ""}
              onClick={() => setPage("admin")}
            >
              Admin Panel
            </li>
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
                <button onClick={() => setPage("student")}>Scholarships</button>
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
              <p>
                View available scholarships, apply online, and track your
                application status through this unified portal.
              </p>
            </div>
          )}

          {/* STUDENT SCHOLARSHIP LIST + MY APPLICATIONS */}
          {page === "student" && currentUser && (
            <>
              <div className="student-layout">
                {/* Left filter panel */}
                <aside className="student-filters">
                  <h3>Filter Scholarships</h3>
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    <option value="Higher Education">Higher Education</option>
                    <option value="ST & SC Dev.">ST & SC Dev.</option>
                  </select>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                  >
                    <option value="">All Levels</option>
                    <option value="UG">UG</option>
                    <option value="PG">PG</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search scheme name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </aside>

                {/* Right scholarship table */}
                <section className="student-scholarships">
                  <h2 className="section-title">Scholarship List</h2>
                  <div className="table-container">
                    <table className="styled-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Scheme Name</th>
                          <th>Department</th>
                          <th>Level</th>
                          <th>Amount</th>
                          <th>Last Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredScholarships.map((s, index) => {
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
                              <td>{s.department}</td>
                              <td>{s.level}</td>
                              <td>₹{s.amount}</td>
                              <td>
                                {s.deadline} {!isExpired && `(${daysLeft}d left)`}
                              </td>
                              <td>
                                <button
                                  className="apply-btn"
                                  disabled={isExpired || alreadyApplied}
                                  onClick={() => startApplication(s.id)}
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
                        {filteredScholarships.length === 0 && (
                          <tr>
                            <td colSpan="7">No scholarships match your filters.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* Apply form card */}
              {showApplyForm && (
                <div className="apply-form-card">
                  <h3>Application Details</h3>
                  <form onSubmit={submitApplication}>
                    <input
                      type="text"
                      placeholder="Course / Program"
                      value={applicationForm.course}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          course: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Institute Name"
                      value={applicationForm.institute}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          institute: e.target.value,
                        })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Bank Account Number (optional)"
                      value={applicationForm.bankAccount}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          bankAccount: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="IFSC Code (optional)"
                      value={applicationForm.ifsc}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          ifsc: e.target.value,
                        })
                      }
                    />
                    <div className="apply-form-actions">
                      <button
                        type="button"
                        onClick={() => setShowApplyForm(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit">Submit Application</button>
                    </div>
                  </form>
                </div>
              )}

              {/* My Applications list */}
              <h2 className="section-title">My Applications</h2>
              <div className="table-container">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Scholarship</th>
                      <th>Course</th>
                      <th>Institute</th>
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
                            <td>{a.course || "-"}</td>
                            <td>{a.institute || "-"}</td>
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
                    {applications.filter((a) => a.studentId === currentUser.email)
                      .length === 0 && (
                      <tr>
                        <td colSpan="5">
                          You have not applied for any scholarships yet.
                        </td>
                      </tr>
                    )}
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

          {/* ANNOUNCEMENTS PAGE */}
          {page === "announcements" && (
            <div>
              <h2 className="section-title">Announcements</h2>
              <div className="table-container">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((a, index) => (
                      <tr key={a.id}>
                        <td>{index + 1}</td>
                        <td>{a.date}</td>
                        <td>{a.title}</td>
                        <td>{a.content || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HOW TO APPLY PAGE */}
          {page === "howto" && (
            <div className="info-card">
              <h2 className="section-title">How to Apply</h2>
              <ol className="steps-list">
                <li>Register on the portal and create your applicant account.</li>
                <li>Login and open the “Scholarship List” page.</li>
                <li>Filter and select a suitable scholarship scheme.</li>
                <li>
                  Click “Apply” and fill course, institute, and bank details carefully.
                </li>
                <li>Review your information and submit the application.</li>
                <li>Track the status under “My Applications”.</li>
              </ol>
              <p className="info-note">
                Keep scanned copies of Aadhaar, income certificate, caste
                certificate, and previous marksheets ready before applying.
              </p>
            </div>
          )}

          {/* FAQ PAGE */}
          {page === "faqs" && (
            <div className="info-card">
              <h2 className="section-title">Frequently Asked Questions</h2>
              <div className="faq-item">
                <h3>Who can apply for scholarships?</h3>
                <p>
                  Eligible students enrolled in approved institutions who satisfy
                  the scheme’s academic, income, and category conditions can apply.
                </p>
              </div>
              <div className="faq-item">
                <h3>Can I apply for multiple scholarships?</h3>
                <p>
                  You may see multiple schemes, but some allow only one active
                  scholarship at a time. Always read the scheme guidelines before
                  applying.
                </p>
              </div>
              <div className="faq-item">
                <h3>How do I know if my application is approved?</h3>
                <p>
                  Check the “My Applications” page. Once verified by the institute
                  and admin, the status will change from Pending to Approved or
                  Rejected.
                </p>
              </div>
              <div className="faq-item">
                <h3>Can I edit my application after submitting?</h3>
                <p>
                  Edits are usually not allowed after final submission. If you
                  submitted incorrect data, contact your institute or portal
                  helpdesk.
                </p>
              </div>
            </div>
          )}

          {/* ABOUT PAGE */}
          {page === "about" && (
            <div className="welcome-card">
              <h2>About Scholarship Portal</h2>
              <p>
                This portal serves as a single-window system for students to
                browse government and institutional scholarship schemes, apply
                online, and track approvals.
              </p>
              <p>
                Departments can publish schemes, verify student details, and
                issue approvals digitally to ensure transparent and timely
                disbursement of benefits.
              </p>
            </div>
          )}

          {/* ADMIN PAGE */}
          {page === "admin" && currentUser && currentUser.role === "admin" && (
            <>
              <h2 className="section-title">Admin Panel</h2>

              {/* Add scholarship */}
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
                  <input
                    type="text"
                    placeholder="Department"
                    value={newScholarship.department}
                    onChange={(e) =>
                      setNewScholarship({
                        ...newScholarship,
                        department: e.target.value,
                      })
                    }
                  />
                  <select
                    value={newScholarship.level}
                    onChange={(e) =>
                      setNewScholarship({
                        ...newScholarship,
                        level: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Level</option>
                    <option value="UG">UG</option>
                    <option value="PG">PG</option>
                  </select>
                  <button type="submit">Add Scholarship</button>
                </div>
              </form>

              {/* Applications list */}
              <h2 className="section-title">Requested Applications</h2>
              <div className="table-container">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Scholarship</th>
                      <th>Course</th>
                      <th>Institute</th>
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
                          <td>{a.course || "-"}</td>
                          <td>{a.institute || "-"}</td>
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
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan="7">No applications submitted yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Admin announcements */}
              <h2 className="section-title">Announcements</h2>
              <form className="admin-form" onSubmit={publishAnnouncement}>
                <h3>Publish Announcement</h3>
                <div className="admin-form-row">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                  />
                  <input
                    type="date"
                    value={newAnnouncement.date}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
                <textarea
                  className="admin-textarea"
                  placeholder="Details"
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                />
                <button type="submit">Publish</button>
              </form>
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
