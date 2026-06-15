'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Calendar, 
  UserPlus, 
  ShieldAlert, 
  DollarSign, 
  ArrowLeft, 
  Check, 
  X, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Activity
} from 'lucide-react';
import { 
  getAdminStats, 
  getAdminStudents, 
  getAdminCohorts, 
  createNewCohort, 
  toggleCohortStatus, 
  onboardNewTutor, 
  updateStudentEnrollment,
  AdminStats,
  AdminStudentData,
  AdminCohortData
} from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  
  // UI & Loading States
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'cohorts' | 'tutors'>('overview');
  
  // Data States
  const [stats, setStats] = useState<AdminStats>({ totalStudents: 0, totalTutors: 0, activeCohorts: 0, totalRevenue: '₦0' });
  const [students, setStudents] = useState<AdminStudentData[]>([]);
  const [cohorts, setCohorts] = useState<AdminCohortData[]>([]);
  
  // Form States
  const [newCohortName, setNewCohortName] = useState<string>('');
  const [newCohortCourseId, setNewCohortCourseId] = useState<number>(1);
  const [newCohortStart, setNewCohortStart] = useState<string>('');
  const [newCohortEnd, setNewCohortEnd] = useState<string>('');
  const [creatingCohort, setCreatingCohort] = useState<boolean>(false);
  
  const [staffName, setStaffName] = useState<string>('');
  const [staffEmail, setStaffEmail] = useState<string>('');
  const [staffRole, setStaffRole] = useState<'tutor' | 'admin'>('tutor');
  const [onboardingStaff, setOnboardingStaff] = useState<boolean>(false);
  
  // Status message states
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userSession = localStorage.getItem('currentUser');
      if (!userSession) {
        router.push('/login');
        return;
      }
      
      const user = JSON.parse(userSession);
      if (user.role !== 'admin') {
        alert('Access Denied. Only administrators are allowed to enter the Admin Operations page.');
        router.push('/dashboard');
        return;
      }
      
      setIsAdmin(true);
      loadDashboardData();
    }
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sData, stData, cData] = await Promise.all([
        getAdminStats(),
        getAdminStudents(),
        getAdminCohorts()
      ]);
      setStats(sData);
      setStudents(stData);
      setCohorts(cData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
    setLoading(false);
  };

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCohortName || !newCohortStart || !newCohortEnd) {
      setMsg({ type: 'error', text: 'Please fill in all cohort parameters.' });
      return;
    }

    setCreatingCohort(true);
    setMsg(null);
    
    const res = await createNewCohort(newCohortCourseId, newCohortName, newCohortStart, newCohortEnd);
    if (res.success) {
      setMsg({ type: 'success', text: `Cohort "${newCohortName}" created successfully!` });
      setNewCohortName('');
      setNewCohortStart('');
      setNewCohortEnd('');
      // Refresh list
      const updatedCohorts = await getAdminCohorts();
      setCohorts(updatedCohorts);
      
      // Update statistics
      const updatedStats = await getAdminStats();
      setStats(updatedStats);
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to create cohort.' });
    }
    setCreatingCohort(false);
  };

  const handleOnboardStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail) {
      setMsg({ type: 'error', text: 'Tutor name and email address are required.' });
      return;
    }

    setOnboardingStaff(true);
    setMsg(null);

    const res = await onboardNewTutor(staffEmail, staffName, staffRole);
    if (res.success) {
      setMsg({ type: 'success', text: `Successfully onboarded ${staffName} as a ${staffRole}!` });
      setStaffName('');
      setStaffEmail('');
      
      // Update statistics
      const updatedStats = await getAdminStats();
      setStats(updatedStats);
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to onboard staff member.' });
    }
    setOnboardingStaff(false);
  };

  const handleToggleCohort = async (id: number, currentStatus: boolean) => {
    const res = await toggleCohortStatus(id, !currentStatus);
    if (res.success) {
      setCohorts(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
      
      // Update statistics
      const updatedStats = await getAdminStats();
      setStats(updatedStats);
    } else {
      alert(res.error || 'Failed to change cohort status.');
    }
  };

  const handleUpdateStudent = async (studentId: string, currentCohortId: number | undefined, currentPaid: boolean, newCohortId: number, isPaidToggle = false) => {
    const targetCohort = newCohortId || currentCohortId || 1;
    const targetPaid = isPaidToggle ? !currentPaid : currentPaid;

    const res = await updateStudentEnrollment(studentId, targetCohort, targetPaid);
    if (res.success) {
      // Refresh students list
      const updatedStudents = await getAdminStudents();
      setStudents(updatedStudents);
      
      // Update statistics
      const updatedStats = await getAdminStats();
      setStats(updatedStats);
    } else {
      alert(res.error || 'Failed to update student profile.');
    }
  };

  if (loading && !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={40} style={{ color: '#01e6f8', margin: '0 auto 10px' }} />
          <div>Checking administrator privileges...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '20px' }}>
        <div style={{ background: '#1e293b', padding: '40px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <ShieldAlert size={64} style={{ color: '#ef4444', margin: '0 auto 20px' }} />
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px' }}>Access Prohibited</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '25px', lineHeight: 1.6 }}>
            This resource is restricted to platform administrators. If you believe this is an error, please log in with verified administrator credentials.
          </p>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#1d3ede', color: '#fff', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const coursesList = [
    { id: 1, name: 'Software Engineering' },
    { id: 2, name: 'Data Analytics' },
    { id: 3, name: 'Cybersecurity' },
    { id: 4, name: 'UI/UX Design' },
    { id: 5, name: 'Product Management' },
    { id: 6, name: 'Digital Marketing' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .admin-nav-bar {
          background: #0f172a;
          border-bottom: 1px solid rgba(29, 62, 222, 0.15);
          padding: 15px 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stats-card {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid rgba(29, 62, 222, 0.1);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 25px rgba(0,0,0,0.15);
        }
        .stats-icon-wrap {
          background: rgba(29, 62, 222, 0.15);
          color: #01e6f8;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admin-tabs {
          display: flex;
          gap: 10px;
          border-bottom: 1.5px solid rgba(255,255,255,0.06);
          margin-bottom: 30px;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .admin-tab-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.25s;
          border-bottom: 3px solid transparent;
          white-space: nowrap;
        }
        .admin-tab-btn:hover {
          color: #fff;
        }
        .admin-tab-btn.active {
          color: #01e6f8;
          border-bottom-color: #01e6f8;
        }
        .data-table-wrap {
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 5px 25px rgba(0,0,0,0.2);
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .data-table th {
          background: rgba(29, 62, 222, 0.08);
          color: #94a3b8;
          font-weight: 700;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 16px 20px;
          border-bottom: 1.5px solid rgba(255,255,255,0.06);
        }
        .data-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 0.92rem;
          color: #cbd5e1;
        }
        .data-table tr:hover td {
          background: rgba(255, 255, 255, 0.01);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 30px;
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge-success {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .badge-warning {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .form-pane {
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .form-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #94a3b8;
        }
        .input-group input, .input-group select {
          background: #1e293b;
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 10px 14px;
          color: #fff;
          outline: none;
          font-size: 0.92rem;
          transition: all 0.25s;
        }
        .input-group input:focus, .input-group select:focus {
          border-color: #01e6f8;
          box-shadow: 0 0 0 2px rgba(1, 230, 248, 0.1);
        }
        .btn-submit {
          background: linear-gradient(135deg, #1d3ede 0%, #01e6f8 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-submit:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .action-select {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.85rem;
          outline: none;
        }
        .btn-toggle-paid {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 6px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .btn-toggle-paid:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
      `}</style>

      {/* Navbar header */}
      <nav className="admin-nav-bar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link href="/dashboard" style={{ color: '#01e6f8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Return to LMS
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'sans-serif', letterSpacing: '0.5px', color: '#fff' }}>
              GISEC <span style={{ color: '#01e6f8' }}>Admin Panel</span>
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Elevated Role: <strong style={{ color: '#10b981' }}>Super Administrator</strong>
          </div>
        </div>
      </nav>

      {/* Main panel content wrapper */}
      <main className="container" style={{ flex: 1, padding: '40px 15px' }}>
        
        {/* Status notification messages */}
        {msg && (
          <div style={{
            background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: msg.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
            color: msg.type === 'success' ? '#10b981' : '#f87171',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {msg.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span style={{ fontWeight: 500, fontSize: '0.92rem' }}>{msg.text}</span>
            </div>
            <button onClick={() => setMsg(null)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Dynamic Metric cards */}
        <section className="stats-grid">
          <div className="stats-card">
            <div className="stats-icon-wrap">
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Students</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{stats.totalStudents}</div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon-wrap">
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Active Cohorts</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{stats.activeCohorts}</div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon-wrap">
              <Activity size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Instructors / Admins</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{stats.totalTutors}</div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Estimated Sales</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{stats.totalRevenue}</div>
            </div>
          </div>
        </section>

        {/* Action tabs selectors */}
        <section className="admin-tabs">
          <button 
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setMsg(null); }}
          >
            Overview & Metrics
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => { setActiveTab('students'); setMsg(null); }}
          >
            Student Directory ({students.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'cohorts' ? 'active' : ''}`}
            onClick={() => { setActiveTab('cohorts'); setMsg(null); }}
          >
            Cohort Settings ({cohorts.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'tutors' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tutors'); setMsg(null); }}
          >
            Staff Onboarding
          </button>
        </section>

        {/* Tab 1: Overview and details guide */}
        {activeTab === 'overview' && (
          <section>
            <div className="form-pane">
              <h3 className="form-title" style={{ color: '#01e6f8' }}><Activity size={18} /> Admin Dashboard Operations Guide</h3>
              <p style={{ fontSize: '0.98rem', lineHeight: 1.6, color: '#cbd5e1', marginBottom: '15px' }}>
                Welcome to the elevated GISEC Administrative Dashboard. Here, you have master controls to oversee school operations, assign cohorts, audit student profiles, toggle payment states, and onboarding staff.
              </p>
              <h4 style={{ color: '#fff', fontSize: '1.02rem', marginTop: '20px', marginBottom: '10px' }}>What you can do:</h4>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem', color: '#94a3b8' }}>
                <li><strong>Manage Student Directory</strong>: Toggle payment confirmations instantly, override checkout validation flags, or re-route a student to another cohort track.</li>
                <li><strong>Define Cohorts</strong>: Set up future cohorts, declare launch and completion dates, and toggle availability.</li>
                <li><strong>Staff Onboarding</strong>: Add emails to the staff roster with immediate Tutor or administrator role flags.</li>
              </ul>
            </div>
          </section>
        )}

        {/* Tab 2: Students directory layout */}
        {activeTab === 'students' && (
          <section className="data-table-wrap">
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <h4>No students found in registry</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>Register students through the courses checkout flow to view profiles.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email / Phone</th>
                      <th>Track / Specialization</th>
                      <th>Assigned Cohort</th>
                      <th>Payment Status</th>
                      <th>Cohort Assignment</th>
                      <th>Onboard Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{s.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>ID: {s.id.substring(0, 8)}...</div>
                        </td>
                        <td>
                          <div>{s.email}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{s.phone}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{s.courseName}</td>
                        <td style={{ color: '#01e6f8', fontWeight: 600 }}>{s.cohortName || 'Unassigned'}</td>
                        <td>
                          <span className={`badge ${s.paidStatus ? 'badge-success' : 'badge-warning'}`}>
                            {s.paidStatus ? 'Verified / Paid' : 'Pending Override'}
                          </span>
                          <button 
                            onClick={() => handleUpdateStudent(s.id, s.cohortId, s.paidStatus, s.cohortId || 1, true)}
                            className="btn-toggle-paid" 
                            style={{ marginLeft: '6px' }}
                            title="Toggle payment confirmation override"
                          >
                            {s.paidStatus ? <X size={13} style={{ color: '#f87171' }} /> : <Check size={13} style={{ color: '#34d399' }} />}
                          </button>
                        </td>
                        <td>
                          <select 
                            className="action-select"
                            value={s.cohortId || ''}
                            onChange={(e) => handleUpdateStudent(s.id, s.cohortId, s.paidStatus, parseInt(e.target.value))}
                          >
                            <option value="" disabled>Choose Cohort...</option>
                            {cohorts.map(c => (
                              <option key={c.id} value={c.id}>{c.name} ({c.courseName})</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                          {new Date(s.enrolledAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Tab 3: Cohort creation and active toggle */}
        {activeTab === 'cohorts' && (
          <section>
            <div className="row">
              {/* Form creation side */}
              <div className="col-lg-5 col-md-12">
                <div className="form-pane">
                  <h3 className="form-title"><Plus size={18} style={{ color: '#01e6f8' }} /> Create New Cohort</h3>
                  <form onSubmit={handleCreateCohort}>
                    <div className="input-group">
                      <label>Course Track</label>
                      <select 
                        value={newCohortCourseId} 
                        onChange={(e) => setNewCohortCourseId(parseInt(e.target.value))}
                      >
                        {coursesList.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Cohort Display Name</label>
                      <input 
                        type="text" 
                        value={newCohortName}
                        onChange={(e) => setNewCohortName(e.target.value)}
                        placeholder="e.g. Software Engineering Cohort B"
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label>Start Date</label>
                      <input 
                        type="date" 
                        value={newCohortStart}
                        onChange={(e) => setNewCohortStart(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label>End Date</label>
                      <input 
                        type="date" 
                        value={newCohortEnd}
                        onChange={(e) => setNewCohortEnd(e.target.value)}
                        required 
                      />
                    </div>
                    <button type="submit" disabled={creatingCohort} className="btn-submit" style={{ width: '100%', marginTop: '10px' }}>
                      {creatingCohort ? <Loader2 className="animate-spin" size={16} /> : 'Launch Cohort'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Roster list side */}
              <div className="col-lg-7 col-md-12">
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Cohort Name</th>
                        <th>Associated Course</th>
                        <th>Dates</th>
                        <th>Visibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohorts.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{c.name}</div>
                          </td>
                          <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{c.courseName}</td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}>Start: <strong>{c.startDate}</strong></div>
                            <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>End: <strong>{c.endDate}</strong></div>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleToggleCohort(c.id, c.isActive)}
                              style={{
                                background: c.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: c.isActive ? '#10b981' : '#ef4444',
                                border: c.isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '30px',
                                padding: '4px 12px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {c.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 4: Tutor Onboarding layout */}
        {activeTab === 'tutors' && (
          <section>
            <div className="row">
              <div className="col-lg-6 col-md-12">
                <div className="form-pane">
                  <h3 className="form-title"><UserPlus size={18} style={{ color: '#01e6f8' }} /> Onboard Staff Member</h3>
                  <form onSubmit={handleOnboardStaff}>
                    <div className="input-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        placeholder="Dr. Sarah Jenkins"
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        placeholder="sarah@gisec.africa"
                        required 
                      />
                    </div>
                    <div className="input-group">
                      <label>Staff Access Level</label>
                      <select 
                        value={staffRole} 
                        onChange={(e) => setStaffRole(e.target.value as 'tutor' | 'admin')}
                      >
                        <option value="tutor">Lead Tutor (Course Grading & Submissions)</option>
                        <option value="admin">Administrator (Full Systems & Cohort Controls)</option>
                      </select>
                    </div>
                    <button type="submit" disabled={onboardingStaff} className="btn-submit" style={{ width: '100%', marginTop: '10px' }}>
                      {onboardingStaff ? <Loader2 className="animate-spin" size={16} /> : 'Onboard Staff'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-6 col-md-12">
                <div className="form-pane">
                  <h4 style={{ color: '#fff', fontSize: '1.02rem', marginBottom: '15px', fontWeight: 700 }}>Security Information</h4>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '10px' }}>
                    Staff accounts created through this onboarding flow are assigned immediate access roles. Onboarding creates a default account in the authorization system.
                  </p>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '15px' }}>
                    A temporary login password is automatically configured for the onboarded staff member in the following format:
                  </p>
                  <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#01e6f8', marginBottom: '15px' }}>
                    GisecStaff@[prefix_before_@]!
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                    * Example: For <code>sarah@gisec.africa</code>, the default password is: <code>GisecStaff@sarah!</code>
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
