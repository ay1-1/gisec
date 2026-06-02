'use client';

import React from 'react';
import Link from 'next/link';
import coursesData from '@/public/data/courses.json';

export default function Courses() {
  const enrollInCourse = (courseId, courseName) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCourse', JSON.stringify({ id: courseId, name: courseName }));
      window.location.href = '/signup';
    }
  };

  return (
    <>
      <link rel="stylesheet" href="/new-css/courses.css" />

      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="logo">GISEK</Link>
          <div className="nav-links">
            <Link href="/courses">Courses</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/signup" className="btn-signup">Sign Up</Link>
            <Link href="/login" className="btn-login">Login</Link>
          </div>
        </div>
      </nav>

      <section className="courses-hero">
        <h1>Choose Your Learning Path</h1>
        <p>Join the next cohort and master in-demand tech skills</p>
      </section>

      <section className="courses-grid" id="coursesGrid">
        {coursesData.courses.map((course) => (
          <div className="course-card" key={course.id}>
            <div className="course-header">
              <h2>{course.name}</h2>
              <span className="price">{course.price}</span>
            </div>
            <p className="duration">⏱️ {course.duration}</p>
            <div className="tools">
              <strong>Tools:</strong>
              {course.tools.map((tool, index) => (
                <span className="tool-tag" key={index}>{tool}</span>
              ))}
            </div>
            <div className="weeks-preview">
              <strong>What you&apos;ll learn (first 4 weeks):</strong>
              <ul>
                {course.weeks.slice(0, 4).map((week, index) => (
                  <li key={index}>Week {week.week}: {week.topic}</li>
                ))}
              </ul>
            </div>
            <button onClick={() => enrollInCourse(course.id, course.name)} className="btn-enroll">
              Enroll Now →
            </button>
          </div>
        ))}
      </section>
    </>
  );
}
