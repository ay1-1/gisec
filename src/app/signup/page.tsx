'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { getCourses } from '@/lib/api';
import { Course } from '@/types/course';
import { Clock, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { signUpUser } from '@/lib/supabase';

interface SelectedCourseSession {
  id: number;
  name: string;
}

interface StudentFormData {
  fullName: string;
  email: string;
  phone: string;
  courseId: number;
  courseName: string;
  paymentReceipt: string;
  status: string;
  enrolledAt: string;
}

export default function Signup() {
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourseSession | null>(null);
  const [courseDetails, setCourseDetails] = useState<Course | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [receiptName, setReceiptName] = useState<string>('pending');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'online'>('bank');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const courseSession = localStorage.getItem('selectedCourse');
      if (courseSession) {
        const course = JSON.parse(courseSession) as SelectedCourseSession;
        setSelectedCourse(course);
        
        getCourses().then((data) => {
          const fullDetails = data.find(c => c.id === course.id);
          if (fullDetails) {
            setCourseDetails(fullDetails);
          }
        });
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedCourse) {
      alert('Please select a course first!');
      if (typeof window !== 'undefined') {
        window.location.href = '/courses';
      }
      return;
    }

    setIsSubmitting(true);

    const result = await signUpUser(
      email,
      fullName,
      phone,
      selectedCourse.id,
      selectedCourse.name,
      paymentMethod === 'online' ? 'online_payment' : receiptName
    );

    if (result.success && result.session) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify({
          id: result.session.id,
          email: result.session.email,
          name: result.session.fullName,
          role: result.session.role,
          course: result.session.courseName,
          enrolled: result.session.enrolled
        }));
        document.cookie = `gisec_session_token=${result.session.id}; path=/; max-age=86400; SameSite=Lax`;
        
        if (paymentMethod === 'online') {
          try {
            const amount = courseDetails ? parseInt(courseDetails.price.replace(/[^\d]/g, '')) : 0;
            const payRes = await fetch('/api/pay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                amount,
                courseId: selectedCourse.id
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
            alert(`Account registered, but online gateway failed: ${err.message}. You can pay via bank transfer inside your dashboard.`);
            window.location.href = '/dashboard';
          }
        } else {
          alert('✅ Registration submitted! Your account will be activated once payment is verified.');
          window.location.href = '/dashboard';
        }
      }
    } else {
      alert(result.error || 'Failed to complete registration. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} style={{ color: '#10b981' }} />
                <span><strong>Selected Course:</strong> {courseDetails.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={16} style={{ color: '#6366f1' }} />
                <span><strong>Price:</strong> {courseDetails.price}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} style={{ color: '#f59e0b' }} />
                <span><strong>Duration:</strong> {courseDetails.duration}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'red', display: 'flex', alignItems: 'center', gap: '6px' }}>
              No course selected. <Link href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ArrowLeft size={14} /> Go back to courses</Link>
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
          
          <div className="form-group">
            <label>Select Payment Method</label>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <button 
                type="button" 
                onClick={() => setPaymentMethod('bank')} 
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: paymentMethod === 'bank' ? '2px solid #6366f1' : '1px solid #ddd',
                  background: paymentMethod === 'bank' ? 'rgba(99, 102, 241, 0.05)' : '#fff',
                  color: paymentMethod === 'bank' ? '#6366f1' : '#374151',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Bank Transfer
              </button>
              <button 
                type="button" 
                onClick={() => setPaymentMethod('online')} 
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: paymentMethod === 'online' ? '2px solid #6366f1' : '1px solid #ddd',
                  background: paymentMethod === 'online' ? 'rgba(99, 102, 241, 0.05)' : '#fff',
                  color: paymentMethod === 'online' ? '#6366f1' : '#374151',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Pay Online (Instantly)
              </button>
            </div>
          </div>

          {paymentMethod === 'bank' ? (
            <>
              <div className="payment-details">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.15rem', color: '#b45309' }}><CreditCard size={20} /> Payment Instructions</h3>
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
                  required={paymentMethod === 'bank'}
                />
              </div>
            </>
          ) : (
            <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #10b981', color: '#065f46', marginBottom: '20px' }}>
              <p>You will be redirected securely to Paystack to complete your payment of <strong>{courseDetails ? courseDetails.price : '₦0'}</strong>. Your course access will be activated immediately!</p>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-submit">
            {isSubmitting ? 'Processing...' : paymentMethod === 'online' ? 'Pay & Complete Registration' : 'Complete Registration'}
          </button>
        </form>
        
        <Link href="/courses" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><ArrowLeft size={16} /> Back to Courses</Link>
      </div>
    </>
  );
}
