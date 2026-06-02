'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import coursesData from '@/public/data/courses.json';

export default function Signup() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [receiptName, setReceiptName] = useState('pending');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const course = JSON.parse(localStorage.getItem('selectedCourse'));
      if (course) {
        setSelectedCourse(course);
        const fullDetails = coursesData.courses.find(c => c.id === course.id);
        if (fullDetails) {
          setCourseDetails(fullDetails);
        }
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCourse) {
      alert('Please select a course first!');
      window.location.href = '/courses';
      return;
    }

    if (typeof window !== 'undefined') {
      const formData = {
        fullName,
        email,
        phone,
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        paymentReceipt: receiptName,
        status: 'pending_verification',
        enrolledAt: new Date().toISOString()
      };

      // Store student data in localStorage
      const existingStudents = JSON.parse(localStorage.getItem('gisek_students') || '[]');
      existingStudents.push(formData);
      localStorage.setItem('gisek_students', JSON.stringify(existingStudents));

      // Store current user session
      localStorage.setItem('currentUser', JSON.stringify({
        email: formData.email,
        name: formData.fullName,
        course: formData.courseName
      }));

      alert('✅ Registration submitted! Your account will be activated once payment is verified.');
      window.location.href = '/dashboard';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptName(file.name);
    }
  };

  return (
    <>
      <style>{`
        body {
          background: #f5f5f5;
        }
        .signup-container {
          max-width: 500px;
          margin: 50px auto;
          padding: 30px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        h1 {
          margin-bottom: 24px;
          color: #1a1a2e;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
        }
        input, select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }
        .btn-submit {
          width: 100%;
          padding: 14px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }
        .btn-submit:hover {
          background: #4f46e5;
        }
        .selected-course {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .payment-details {
          background: #fef3c7;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        .back-link {
          display: inline-block;
          margin-top: 20px;
          color: #6366f1;
          text-decoration: none;
        }
      `}</style>

      <div className="signup-container">
        <h1>Register for Your Course</h1>
        
        <div className="selected-course">
          {courseDetails ? (
            <div>
              <strong>✅ Selected Course:</strong> {courseDetails.name}<br />
              <strong>💰 Price:</strong> {courseDetails.price}<br />
              <strong>⏱️ Duration:</strong> {courseDetails.duration}
            </div>
          ) : (
            <p style={{ color: 'red' }}>
              No course selected. <Link href="/courses">Go back to courses</Link>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required 
            />
          </div>
          
          <div className="payment-details">
            <h3>💰 Payment Instructions</h3>
            <p style={{ margin: '8px 0' }}>Bank Transfer to:</p>
            <p><strong>Bank:</strong> GTBank<br />
            <strong>Account Name:</strong> GISEK Technologies<br />
            <strong>Account Number:</strong> 0123456789</p>
            <p style={{ marginTop: '10px' }}>Amount: <strong>{courseDetails ? courseDetails.price : '₦0'}</strong></p>
            <p style={{ marginTop: '10px' }}><small>After payment, upload your receipt below. Your account will be activated within 24 hours.</small></p>
          </div>

          <div className="form-group">
            <label>Upload Payment Receipt</label>
            <input 
              type="file" 
              onChange={handleFileChange}
              accept="image/*,.pdf" 
            />
          </div>

          <button type="submit" className="btn-submit">Complete Registration</button>
        </form>
        
        <Link href="/courses" className="back-link">← Back to Courses</Link>
      </div>
    </>
  );
}
