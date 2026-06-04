'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCourses } from '@/lib/api';
import { Course } from '@/types/course';
import { BookOpen, FileText, CheckCircle, Lock, ArrowLeft } from 'lucide-react';

interface CurrentUserSession {
  name: string;
  email: string;
  course: string;
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

      // Load progress
      const progressSession = localStorage.getItem(`progress_${user.email}`);
      const progress = progressSession 
        ? (JSON.parse(progressSession) as StudentProgress)
        : { completedWeeks: [], currentWeek: 1 };
      setStudentProgress(progress);

      // Find matching course dynamically via API client
      getCourses().then((data) => {
        const matchedCourse = data.find(c => 
          c.name.toLowerCase().includes(user.course?.toLowerCase() || '')
        );
        if (matchedCourse) {
          setCourse(matchedCourse);
        }
        setLoading(false);
      });
    }
  }, []);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      window.location.href = '/courses';
    }
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

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  const completedCount = studentProgress.completedWeeks?.length || 0;
  const totalWeeks = course && course.weeks ? course.weeks.length : 12;
  const percent = Math.round((completedCount / totalWeeks) * 100);

  return (
    <>
      <style>{`
        body {
          background: #f5f5f5;
        }
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .progress-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 30px;
        }
        .progress-bar-container {
          background: rgba(255,255,255,0.3);
          border-radius: 20px;
          height: 20px;
          overflow: hidden;
          margin: 15px 0;
        }
        .progress-fill {
          background: #4ade80;
          height: 100%;
          border-radius: 20px;
          transition: width 0.3s;
        }
        .weeks-grid {
          display: grid;
          gap: 15px;
        }
        .week-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 4px solid transparent;
        }
        .week-card.completed {
          background: #f0fdf4;
          border-left-color: #22c55e;
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
          background: #22c55e;
          color: white;
        }
        .status-locked {
          background: #9ca3af;
          color: white;
        }
        .mark-complete-btn {
          background: #6366f1;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }
        .mark-complete-btn:hover {
          background: #4f46e5;
        }
        .nav-links {
          margin-bottom: 20px;
        }
        .nav-links a {
          margin-right: 20px;
          color: #6366f1;
          text-decoration: none;
          font-weight: 500;
        }
        .logout {
          color: #ef4444 !important;
          cursor: pointer;
        }
      `}</style>

      <div className="dashboard-container">
        <div className="nav-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><ArrowLeft size={16} /> Browse Courses</Link>
          <Link href="/">Home</Link>
          <span onClick={logout} className="logout">Logout</span>
        </div>
        
        <div className="progress-section">
          <h1>Welcome, {currentUser?.name?.split(' ')[0] || 'Student'}!</h1>
          <p>Course: <strong>{course ? course.name : 'Loading...'}</strong></p>
          <div className="progress-bar-container">
            <div className="progress-fill" style={{ width: `${percent}%` }}></div>
          </div>
          <p>Overall Progress: {percent}%</p>
        </div>

        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', color: '#1a1a2e', marginTop: '30px', marginBottom: '20px' }}>
          <BookOpen size={24} style={{ color: '#6366f1' }} /> Weekly Curriculum
        </h2>
        <div className="weeks-grid">
          {course && course.weeks ? (
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
                      <div className="week-status status-completed"><CheckCircle size={18} fill="#22c55e" color="#fff" /></div>
                    ) : (
                      <div className="week-status status-locked"><Lock size={16} /></div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>Course content not found. Please contact support.</p>
          )}
        </div>
      </div>
    </>
  );
}
