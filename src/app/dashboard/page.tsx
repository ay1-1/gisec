'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCourses } from '@/lib/api';
import { Course } from '@/types/course';
import { 
  BookOpen, 
  FileText, 
  CheckCircle, 
  Lock, 
  ArrowLeft, 
  Video, 
  UploadCloud, 
  CheckSquare, 
  ExternalLink,
  MessageSquare,
  Award,
  Calendar,
  AlertCircle,
  User,
  X
} from 'lucide-react';
import { 
  validateSession, 
  getLiveClasses, 
  getSubmissions, 
  submitProject, 
  getAllSubmissions, 
  gradeSubmission,
  updateUserProfile,
  enrollInCourse,
  SubmissionData 
} from '@/lib/supabase';

interface CurrentUserSession {
  id?: string;
  name: string;
  email: string;
  course: string;
  role?: 'student' | 'tutor' | 'admin';
}

interface StudentProgress {
  completedWeeks: number[];
  currentWeek: number;
}

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<CurrentUserSession | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress>({ completedWeeks: [], currentWeek: 1 });
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'live' | 'submissions' | 'tutor' | 'profile'>('curriculum');

  // LMS Data States
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  
  // Profile Form States
  const [profileName, setProfileName] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Submission form states
  const [submitWeek, setSubmitWeek] = useState<number>(1);
  const [gitLink, setGitLink] = useState<string>('');
  const [liveLink, setLiveLink] = useState<string>('');
  const [submittingProject, setSubmittingProject] = useState<boolean>(false);
  const [submissionMsg, setSubmissionMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Tutor panel states
  const [allSubmissions, setAllSubmissions] = useState<SubmissionData[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(100);
  const [tutorFeedback, setTutorFeedback] = useState<string>('');
  const [gradingProgress, setGradingProgress] = useState<boolean>(false);

  // Course Catalog & In-Dashboard Checkout States
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'bank' | 'online'>('bank');
  const [checkoutReceiptName, setCheckoutReceiptName] = useState<string>('pending');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState<boolean>(false);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('session_uuid');
      document.cookie = 'gisec_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userSession = localStorage.getItem('currentUser');
      if (!userSession) {
        alert('Please sign up or login first');
        window.location.href = '/signup';
        return;
      }
      const user = JSON.parse(userSession) as CurrentUserSession;
      setCurrentUser(user);
      setProfileName(user.name || '');

      // Verify session ID to prevent account sharing
      validateSession(user.email, user.id || '').then((isValid) => {
        if (!isValid) {
          alert('Session expired or logged in from another device.');
          logout();
        }
      });

      // If Tutor/Admin, open tutor tab by default
      if (user.role === 'tutor' || user.role === 'admin') {
        setActiveTab('tutor');
        // Fetch all student submissions
        getAllSubmissions().then(data => {
          setAllSubmissions(data);
        });
      }

      // Load progress
      const progressSession = localStorage.getItem(`progress_${user.email}`);
      const progress = progressSession 
        ? (JSON.parse(progressSession) as StudentProgress)
        : { completedWeeks: [], currentWeek: 1 };
      setStudentProgress(progress);

      // Find matching course dynamically via API client
      getCourses().then((data) => {
        setCoursesList(data);
        if (user.course) {
          const matchedCourse = data.find(c => 
            c.name.toLowerCase().includes(user.course?.toLowerCase() || '')
          );
          if (matchedCourse) {
            setCourse(matchedCourse);
            
            // Fetch student submissions
            getSubmissions(user.id || 'mock-id', matchedCourse.id).then(subs => {
              setSubmissions(subs);
            });
          }
        }
        
        // Fetch Live classes
        getLiveClasses(user.email).then(classes => {
          setLiveClasses(classes);
        });

        setLoading(false);
      });
    }
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSavingProfile(true);
    setProfileMsg(null);

    const res = await updateUserProfile(
      currentUser.id || 'mock-id',
      currentUser.email,
      profileName
    );

    if (res.success) {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      
      const updatedUser = { ...currentUser, name: profileName };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } else {
      setProfileMsg({ type: 'error', text: res.error || 'Failed to update profile.' });
    }
    setIsSavingProfile(false);
  };

  const markWeekComplete = (weekNum: number) => {
    if (!currentUser || !course) return;

    const newCompletedWeeks = [...studentProgress.completedWeeks];
    if (!newCompletedWeeks.includes(weekNum)) {
      newCompletedWeeks.push(weekNum);
      const newProgress: StudentProgress = {
        completedWeeks: newCompletedWeeks,
        currentWeek: weekNum + 1
      };
      setStudentProgress(newProgress);
      localStorage.setItem(`progress_${currentUser.email}`, JSON.stringify(newProgress));
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !course) return;
    
    setSubmittingProject(true);
    setSubmissionMsg(null);

    const res = await submitProject(
      currentUser.id || 'mock-id',
      course.id,
      submitWeek,
      gitLink,
      liveLink
    );

    if (res.success) {
      setSubmissionMsg({ type: 'success', text: `Project for Week ${submitWeek} submitted successfully!` });
      setGitLink('');
      setLiveLink('');
      
      // Reload submissions
      const subs = await getSubmissions(currentUser.id || 'mock-id', course.id);
      setSubmissions(subs);
    } else {
      setSubmissionMsg({ type: 'error', text: res.error || 'Failed to submit project.' });
    }
    setSubmittingProject(false);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !currentUser) return;

    setGradingProgress(true);
    const res = await gradeSubmission(
      selectedSubmission.id || '',
      selectedSubmission.userId,
      selectedSubmission.courseId,
      selectedSubmission.weekNumber,
      gradeScore,
      tutorFeedback,
      currentUser.id || 'mock-tutor-id'
    );

    if (res.success) {
      alert('Grade submitted successfully!');
      setSelectedSubmission(null);
      setTutorFeedback('');
      // Reload submissions
      const data = await getAllSubmissions();
      setAllSubmissions(data);
    } else {
      alert(`Grading failed: ${res.error}`);
    }
    setGradingProgress(false);
  };

  const handleInDashboardEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !enrollingCourse) return;

    setCheckoutSubmitting(true);

    const res = await enrollInCourse(
      currentUser.id || 'mock-id',
      enrollingCourse.id,
      enrollingCourse.name,
      checkoutPaymentMethod,
      checkoutPaymentMethod === 'online' ? 'online_payment' : checkoutReceiptName
    );

    if (res.success) {
      if (checkoutPaymentMethod === 'online') {
        try {
          const amount = parseInt(enrollingCourse.price.replace(/[^\d]/g, ''));
          const payRes = await fetch('/api/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              amount,
              courseId: enrollingCourse.id
            })
          });

          const payData = await payRes.json();
          if (payData.success && payData.authorization_url) {
            window.location.href = payData.authorization_url;
            return;
          } else {
            throw new Error(payData.error || 'Failed to initialize payment gateway');
          }
        } catch (err: any) {
          alert(`Enrolled, but online gateway failed: ${err.message}. You can pay via bank transfer inside your dashboard.`);
          window.location.reload();
        }
      } else {
        alert('✅ Enrollment request submitted successfully! Your course pathway will activate once payment is verified.');
        window.location.reload();
      }
    } else {
      alert(res.error || 'Failed to complete enrollment. Please try again.');
    }
    setCheckoutSubmitting(false);
  };

  const handleCheckoutFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCheckoutReceiptName(file.name);
    }
  };

  if (loading) {
    return <div style={{ padding: '80px', textAlign: 'center', fontSize: '1.2rem', color: '#6366f1', fontWeight: 600 }}>Loading GISEC Dashboard...</div>;
  }

  const completedCount = studentProgress.completedWeeks?.length || 0;
  const totalWeeks = course && course.weeks ? course.weeks.length : 4;
  const percent = Math.round((completedCount / totalWeeks) * 100);

  const isTutorOrAdmin = currentUser?.role === 'tutor' || currentUser?.role === 'admin';

  return (
    <>
      <style>{`
        body {
          background: #f8fafc;
        }
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .progress-section {
          background: linear-gradient(135deg, #1d3ede 0%, #0a7ec0 100%);
          color: white;
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 30px;
          box-shadow: 0 10px 25px rgba(29, 62, 222, 0.15);
        }
        .progress-bar-container {
          background: rgba(255,255,255,0.25);
          border-radius: 20px;
          height: 14px;
          overflow: hidden;
          margin: 15px 0;
        }
        .progress-fill {
          background: #10b981;
          height: 100%;
          border-radius: 20px;
          transition: width 0.3s ease;
        }
        .tabs-header {
          display: flex;
          gap: 10px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 25px;
          overflow-x: auto;
          padding-bottom: 2px;
        }
        .tab-btn {
          background: transparent;
          border: none;
          padding: 12px 20px;
          font-size: 1rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        .tab-btn.active {
          color: #1d3ede;
          border-bottom-color: #1d3ede;
        }
        .tab-btn:hover {
          color: #0f172a;
        }
        .weeks-grid {
          display: grid;
          gap: 15px;
        }
        .week-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 4px solid transparent;
          border: 1px solid #e2e8f0;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .week-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .week-card.completed {
          background: #f0fdf4;
          border-left: 4px solid #10b981;
        }
        .week-card.locked {
          opacity: 0.6;
        }
        .week-status {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .status-completed {
          background: #10b981;
          color: white;
        }
        .status-locked {
          background: #cbd5e1;
          color: white;
        }
        .mark-complete-btn {
          background: #1d3ede;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }
        .mark-complete-btn:hover {
          background: #0d2bb3;
        }
        .nav-links {
          margin-bottom: 20px;
        }
        .nav-links a {
          margin-right: 20px;
          color: #1d3ede;
          text-decoration: none;
          font-weight: 600;
        }
        .logout {
          color: #ef4444 !important;
          cursor: pointer;
          font-weight: 600;
        }
        .form-control {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          margin-top: 6px;
          margin-bottom: 15px;
          font-size: 0.95rem;
        }
        .btn-primary {
          background: #1d3ede;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: #0d2bb3;
        }
        .live-class-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .badge-live {
          background: #fee2e2;
          color: #ef4444;
          padding: 4px 10px;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .badge-recorded {
          background: #f1f5f9;
          color: #475569;
          padding: 4px 10px;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .tutor-grading-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
        }

        /* Course Catalog CSS */
        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .catalog-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          transition: transform 0.25s, box-shadow 0.25s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .catalog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(29, 62, 222, 0.06);
        }
        .catalog-card-image {
          height: 150px;
          background: #e2e8f0;
          position: relative;
        }
        .catalog-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .catalog-card-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #0ea5e9;
          color: white;
          padding: 3px 8px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .catalog-card-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .catalog-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px 0;
        }
        .catalog-card-desc {
          font-size: 0.88rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 15px;
          flex: 1;
        }
        .catalog-card-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #475569;
          border-top: 1px dashed #e2e8f0;
          padding-top: 12px;
          margin-bottom: 15px;
        }
        .catalog-card-price {
          font-size: 1.2rem;
          font-weight: 800;
          color: #1d3ede;
        }
        .btn-catalog-enroll {
          width: 100%;
          background: linear-gradient(135deg, #1d3ede 0%, #0a7ec0 100%);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s;
          text-align: center;
        }
        .btn-catalog-enroll:hover {
          opacity: 0.95;
        }
        
        /* Modal Overlay CSS */
        .checkout-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .checkout-modal {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          padding: 30px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          max-height: 90vh;
          overflow-y: auto;
        }
      `}</style>

      <div className="dashboard-container">
        <div className="nav-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><ArrowLeft size={16} /> Browse Courses</Link>
          <Link href="/">Home</Link>
          {currentUser?.role === 'admin' && (
            <Link href="/admin" style={{ color: '#01e6f8', fontWeight: 600 }}>Admin Panel</Link>
          )}
          <span onClick={logout} className="logout">Logout</span>
        </div>
        
        {/* Banner Header */}
        <div className="progress-section">
          <h1>Welcome, {currentUser?.name?.split(' ')[0] || 'User'}!</h1>
          <p>
            {isTutorOrAdmin 
              ? `Staff Account - Access Level: ${currentUser?.role?.toUpperCase()}`
              : `Course Path: ${course ? course.name : 'General Member (Unenrolled)'}`
            }
          </p>
          {!isTutorOrAdmin && course && (
            <>
              <div className="progress-bar-container">
                <div className="progress-fill" style={{ width: `${percent}%` }}></div>
              </div>
              <p>Overall Track Progress: {percent}%</p>
            </>
          )}
        </div>

        {/* Tab Selection */}
        <div className="tabs-header">
          {!isTutorOrAdmin ? (
            course ? (
              <>
                <button onClick={() => setActiveTab('curriculum')} className={`tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}>
                  <BookOpen size={18} /> Curriculum
                </button>
                <button onClick={() => setActiveTab('live')} className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}>
                  <Video size={18} /> Live Classes ({liveClasses.length})
                </button>
                <button onClick={() => setActiveTab('submissions')} className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}>
                  <UploadCloud size={18} /> Projects Submission
                </button>
              </>
            ) : (
              <button className="tab-btn active">
                <BookOpen size={18} /> Course Catalog
              </button>
            )
          ) : (
            <button onClick={() => setActiveTab('tutor')} className={`tab-btn ${activeTab === 'tutor' ? 'active' : ''}`}>
              <CheckSquare size={18} /> Tutor Grading Panel ({allSubmissions.filter(s => s.gradeScore === undefined).length} pending)
            </button>
          )}
          <button onClick={() => setActiveTab('profile')} className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}>
            <User size={18} /> Profile Settings
          </button>
        </div>

        {/* Active Tab View */}
        
        {/* Tab 1: Curriculum */}
        {activeTab === 'curriculum' && (
          <div>
            {!course ? (
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  GISEC Program Tracks
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.98rem', marginBottom: '25px' }}>
                  Select one of our six learning tracks to start your path. Complete enrollment to unlock weekly curriculum modules, live sessions, project submissions, and tutoring support.
                </p>
                
                <div className="catalog-grid">
                  {coursesList.map((c) => (
                    <div key={c.id} className="catalog-card">
                      <div className="catalog-card-image">
                        <img src={c.image || `/statics/logo.jpg`} alt={c.name} onError={(e) => {
                          (e.target as HTMLImageElement).src = '/statics/logo.jpg';
                        }} />
                        <span className="catalog-card-badge">{c.level}</span>
                      </div>
                      <div className="catalog-card-content">
                        <h3 className="catalog-card-title">{c.name}</h3>
                        <p className="catalog-card-desc">{c.description}</p>
                        
                        <div style={{ marginBottom: '15px' }}>
                          <strong style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Tools you will learn:</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {c.tools.map((t, idx) => (
                              <span key={idx} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="catalog-card-meta">
                          <span>⏱ {c.duration}</span>
                          <span>⭐ {c.rating || 4.8} / 5</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <span className="catalog-card-price">{c.price}</span>
                          <button 
                            onClick={() => {
                              setEnrollingCourse(c);
                              setCheckoutPaymentMethod('bank');
                              setCheckoutReceiptName('pending');
                            }} 
                            className="btn-catalog-enroll" 
                            style={{ width: 'auto', padding: '8px 16px' }}
                          >
                            Enroll & Pay
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', color: '#1a1a2e', marginBottom: '20px' }}>
                  <BookOpen size={24} style={{ color: '#1d3ede' }} /> Weekly Curriculum
                </h2>
                <div className="weeks-grid">
                  {course.weeks ? (
                    course.weeks.map((week, index) => {
                      const weekNum = index + 1;
                      const isCompleted = studentProgress.completedWeeks?.includes(weekNum);
                      const isLocked = weekNum > (studentProgress.currentWeek || 1) + 1;

                      return (
                        <div key={index} className={`week-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.15rem', color: '#1a1a2e', fontWeight: 600 }}>Week {weekNum}: {week.topic}</h3>
                            <p style={{ margin: '8px 0', color: '#4b5563', fontSize: '0.92rem' }}>{week.content}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.85rem' }}>
                              <FileText size={14} />
                              <span>Assignment: {week.assignment}</span>
                            </div>
                          </div>
                          <div>
                            {!isCompleted && !isLocked ? (
                              <button onClick={() => markWeekComplete(weekNum)} className="mark-complete-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                Mark Complete <CheckCircle size={14} />
                              </button>
                            ) : isCompleted ? (
                              <div className="week-status status-completed"><CheckCircle size={18} fill="#10b981" color="#fff" /></div>
                            ) : (
                              <div className="week-status status-locked"><Lock size={16} /></div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>Curriculum details not loaded. Please select a course path.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Classes */}
        {activeTab === 'live' && (
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', color: '#1a1a2e', marginBottom: '20px' }}>
              <Video size={24} style={{ color: '#1d3ede' }} /> Class Schedules & Recordings
            </h2>
            {liveClasses.length === 0 ? (
              <p>No classes scheduled for this cohort yet.</p>
            ) : (
              liveClasses.map((lc) => {
                const isUpcoming = new Date(lc.schedule_time).getTime() > Date.now();
                return (
                  <div key={lc.id} className="live-class-card">
                    <div>
                      <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 600, margin: '0 0 5px 0' }}>{lc.topic}</h3>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={14} />
                        {new Date(lc.schedule_time).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      {isUpcoming ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <span className="badge-live">Upcoming Live</span>
                          <a href={lc.meeting_link} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Join Zoom <ExternalLink size={12} />
                          </a>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <span className="badge-recorded">Completed Lecture</span>
                          {lc.recording_link ? (
                            <a href={lc.recording_link} target="_blank" rel="noreferrer" className="btn-primary" style={{ background: '#475569', padding: '6px 12px', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              Watch Recording <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Recording processing...</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Submissions */}
        {activeTab === 'submissions' && (
          <div className="row">
            {/* Submit Project Form */}
            <div className="col-md-5">
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UploadCloud size={20} style={{ color: '#1d3ede' }} /> Project Submission
                </h3>
                <form onSubmit={handleProjectSubmit}>
                  <label style={{ fontWeight: 600, color: '#475569' }}>Select Week Module</label>
                  <select value={submitWeek} onChange={(e) => setSubmitWeek(parseInt(e.target.value))} className="form-control">
                    {[1, 2, 3, 4].map(w => (
                      <option key={w} value={w}>Week Module {w}</option>
                    ))}
                  </select>

                  <label style={{ fontWeight: 600, color: '#475569' }}>GitHub Repository Link</label>
                  <input 
                    type="url" 
                    value={gitLink} 
                    onChange={(e) => setGitLink(e.target.value)} 
                    placeholder="https://github.com/username/project" 
                    required 
                    className="form-control"
                  />

                  <label style={{ fontWeight: 600, color: '#475569' }}>Live Deployment Link</label>
                  <input 
                    type="url" 
                    value={liveLink} 
                    onChange={(e) => setLiveLink(e.target.value)} 
                    placeholder="https://your-project.vercel.app" 
                    required 
                    className="form-control"
                  />

                  {submissionMsg && (
                    <div style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      marginBottom: '15px',
                      fontSize: '0.9rem',
                      background: submissionMsg.type === 'success' ? '#fee2e2' : '#fecaca', // corrected colors mapping below
                      backgroundColor: submissionMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                      color: submissionMsg.type === 'success' ? '#065f46' : '#991b1b',
                      border: `1px solid ${submissionMsg.type === 'success' ? '#10b981' : '#f87171'}`
                    }}>
                      {submissionMsg.text}
                    </div>
                  )}

                  <button type="submit" disabled={submittingProject} className="btn-primary" style={{ width: '100%' }}>
                    {submittingProject ? 'Submitting...' : 'Upload Submission'}
                  </button>
                </form>
              </div>
            </div>

            {/* List Submitted Projects */}
            <div className="col-md-7">
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={20} style={{ color: '#1d3ede' }} /> Grading Portfolio & Submissions
                </h3>
                
                {submissions.length === 0 ? (
                  <p style={{ color: '#64748b' }}>You have not submitted any projects yet.</p>
                ) : (
                  submissions.map((sub, idx) => (
                    <div key={idx} style={{ padding: '15px 0', borderBottom: idx < submissions.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#1e293b' }}>Week {sub.weekNumber} Submission</h4>
                        <div>
                          {sub.gradeScore !== undefined ? (
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                              Score: {sub.gradeScore}/100
                            </span>
                          ) : (
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                              Pending Grade
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', marginBottom: '8px' }}>
                        <a href={sub.gitLink} target="_blank" rel="noreferrer" style={{ color: '#1d3ede', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          GitHub Repo <ExternalLink size={12} />
                        </a>
                        <a href={sub.liveLink} target="_blank" rel="noreferrer" style={{ color: '#1d3ede', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          Live Preview <ExternalLink size={12} />
                        </a>
                      </div>

                      {sub.tutorFeedback && (
                        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #64748b', fontSize: '0.88rem', color: '#475569', display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <MessageSquare size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <strong>Tutor Feedback:</strong> {sub.tutorFeedback}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tutor Grading Panel */}
        {activeTab === 'tutor' && isTutorOrAdmin && (
          <div className="row">
            {/* Submissions List */}
            <div className="col-md-7">
              <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 700, marginBottom: '20px' }}>
                Student Submission Queue
              </h2>
              {allSubmissions.length === 0 ? (
                <p>No student project submissions found.</p>
              ) : (
                allSubmissions.map((sub, idx) => (
                  <div key={idx} className="tutor-grading-card" style={{ border: selectedSubmission?.id === sub.id ? '2px solid #1d3ede' : '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{sub.studentName}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Course ID: {sub.courseId} • Week Module {sub.weekNumber}</span>
                      </div>
                      <div>
                        {sub.gradeScore !== undefined ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                            Graded: {sub.gradeScore}/100
                          </span>
                        ) : (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                            Ungraded
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', marginBottom: '12px' }}>
                      <a href={sub.gitLink} target="_blank" rel="noreferrer" style={{ color: '#1d3ede', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}>
                        GitHub Link <ExternalLink size={12} />
                      </a>
                      <a href={sub.liveLink} target="_blank" rel="noreferrer" style={{ color: '#1d3ede', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}>
                        Live Link <ExternalLink size={12} />
                      </a>
                    </div>

                    <button onClick={() => {
                      setSelectedSubmission(sub);
                      setGradeScore(sub.gradeScore || 100);
                      setTutorFeedback(sub.tutorFeedback || '');
                    }} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                      {sub.gradeScore !== undefined ? 'Re-grade Project' : 'Evaluate & Grade'}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Grading Evaluator Pane */}
            <div className="col-md-5">
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '25px', borderRadius: '16px', position: 'sticky', top: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={20} style={{ color: '#1d3ede' }} /> Evaluation Center
                </h3>

                {selectedSubmission ? (
                  <form onSubmit={handleGradeSubmit}>
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px', fontSize: '0.9rem' }}>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Student Name:</strong> {selectedSubmission.studentName}</p>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Module Assignment:</strong> Week {selectedSubmission.weekNumber}</p>
                      <p style={{ margin: '0 0 5px 0' }}><strong>GitHub Repository:</strong> <a href={selectedSubmission.gitLink} target="_blank" rel="noreferrer" style={{ color: '#1d3ede' }}>View Code</a></p>
                      <p style={{ margin: 0 }}><strong>Deployment Link:</strong> <a href={selectedSubmission.liveLink} target="_blank" rel="noreferrer" style={{ color: '#1d3ede' }}>View Project</a></p>
                    </div>

                    <label style={{ fontWeight: 600, color: '#475569' }}>Evaluation Grade Score (1 - 100)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100" 
                      value={gradeScore} 
                      onChange={(e) => setGradeScore(parseInt(e.target.value))} 
                      required 
                      className="form-control"
                    />

                    <label style={{ fontWeight: 600, color: '#475569' }}>Tutor Grading Feedback</label>
                    <textarea 
                      rows={4} 
                      value={tutorFeedback} 
                      onChange={(e) => setTutorFeedback(e.target.value)} 
                      placeholder="Write evaluation review, code issues or improvement ideas..." 
                      required 
                      className="form-control"
                      style={{ height: '100px', resize: 'vertical' }}
                    ></textarea>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" disabled={gradingProgress} className="btn-primary" style={{ flex: 1 }}>
                        {gradingProgress ? 'Saving...' : 'Submit Evaluation'}
                      </button>
                      <button type="button" onClick={() => setSelectedSubmission(null)} className="btn-primary" style={{ background: '#64748b', flex: 0.5 }}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
                    <AlertCircle size={36} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                    <p>Select a student submission from the queue list to evaluate and submit scores.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Profile Settings */}
        {activeTab === 'profile' && currentUser && (
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#ffffff', border: '1px solid #e2e8f0', padding: '30px', borderRadius: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', color: '#1a1a2e', marginBottom: '20px' }}>
              <User size={24} style={{ color: '#1d3ede' }} /> Profile Settings
            </h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label style={{ fontWeight: 600, color: '#475569' }}>Full Name</label>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                  required 
                  className="form-control" 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, color: '#475569' }}>Email Address (Read-only)</label>
                <input 
                  type="email" 
                  value={currentUser.email} 
                  disabled 
                  className="form-control" 
                  style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, color: '#475569' }}>Account Role (Read-only)</label>
                <input 
                  type="text" 
                  value={currentUser.role?.toUpperCase() || 'STUDENT'} 
                  disabled 
                  className="form-control" 
                  style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>

              {!isTutorOrAdmin && (
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontWeight: 600, color: '#475569' }}>Course Pathway (Read-only)</label>
                  <input 
                    type="text" 
                    value={currentUser.course || 'None'} 
                    disabled 
                    className="form-control" 
                    style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                  />
                </div>
              )}

              {profileMsg && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '0.9rem',
                  backgroundColor: profileMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: profileMsg.type === 'success' ? '#065f46' : '#991b1b',
                  border: `1px solid ${profileMsg.type === 'success' ? '#10b981' : '#f87171'}`
                }}>
                  {profileMsg.text}
                </div>
              )}

              <button type="submit" disabled={isSavingProfile} className="btn-primary" style={{ width: '100%' }}>
                {isSavingProfile ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        )}

        {/* Checkout Modal */}
        {enrollingCourse && (
          <div className="checkout-overlay">
            <div className="checkout-modal">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Enroll in {enrollingCourse.name}
                </h3>
                <button 
                  type="button"
                  onClick={() => setEnrollingCourse(null)} 
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0', fontSize: '0.92rem', color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Program Fee:</span>
                  <strong style={{ color: '#1d3ede', fontSize: '1.05rem' }}>{enrollingCourse.price}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Duration:</span>
                  <strong>{enrollingCourse.duration}</strong>
                </div>
              </div>

              <form onSubmit={handleInDashboardEnrollment}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>Payment Method</label>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                      type="button" 
                      onClick={() => setCheckoutPaymentMethod('bank')} 
                      className="payment-method-btn"
                      style={{
                        border: checkoutPaymentMethod === 'bank' ? '2.5px solid #1d3ede' : '1.5px solid #cbd5e1',
                        background: checkoutPaymentMethod === 'bank' ? 'rgba(29, 62, 222, 0.05)' : '#ffffff',
                        color: checkoutPaymentMethod === 'bank' ? '#1d3ede' : '#475569',
                        padding: '10px',
                        borderRadius: '8px',
                        flex: 1,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Bank Transfer
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setCheckoutPaymentMethod('online')} 
                      className="payment-method-btn"
                      style={{
                        border: checkoutPaymentMethod === 'online' ? '2.5px solid #1d3ede' : '1.5px solid #cbd5e1',
                        background: checkoutPaymentMethod === 'online' ? 'rgba(29, 62, 222, 0.05)' : '#ffffff',
                        color: checkoutPaymentMethod === 'online' ? '#1d3ede' : '#475569',
                        padding: '10px',
                        borderRadius: '8px',
                        flex: 1,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Online Paystack
                    </button>
                  </div>
                </div>

                {checkoutPaymentMethod === 'bank' ? (
                  <>
                    <div className="payment-details-pane" style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '15px', borderRadius: '12px', color: '#92400e', marginBottom: '20px', fontSize: '0.88rem' }}>
                      <p style={{ margin: '0 0 8px 0', fontWeight: 700 }}>Transfer the fee to:</p>
                      <p style={{ margin: '3px 0' }}><strong>Bank:</strong> GTBank</p>
                      <p style={{ margin: '3px 0' }}><strong>Account Name:</strong> GISEK Technologies</p>
                      <p style={{ margin: '3px 0' }}><strong>Account Number:</strong> 0123456789</p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', opacity: 0.9 }}><small>Upload your receipt proof below. Enrollment is verified in 24 hours.</small></p>
                    </div>

                    <div className="form-group" style={{ marginBottom: '25px' }}>
                      <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>Upload Payment Receipt</label>
                      <input 
                        type="file" 
                        onChange={handleCheckoutFileChange}
                        accept="image/*,.pdf" 
                        required={checkoutPaymentMethod === 'bank'}
                        style={{ padding: '8px', border: '1.5px solid #cbd5e1', borderRadius: '8px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '15px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #10b981', color: '#065f46', marginBottom: '25px', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    You will be redirected securely to the online payment gateway (Paystack) to process payment of <strong>{enrollingCourse.price}</strong>. Your track will be activated immediately!
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={checkoutSubmitting} 
                  className="btn-submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #1d3ede 0%, #0a7ec0 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  {checkoutSubmitting ? 'Processing...' : checkoutPaymentMethod === 'online' ? 'Pay & Enroll' : 'Submit Enrollment'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
