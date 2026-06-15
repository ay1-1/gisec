'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { getCourses } from '@/lib/api';
import { Course } from '@/types/course';
import { Clock, CreditCard, CheckCircle, ArrowLeft, Mail, Phone, User, Globe } from 'lucide-react';
import { signUpUser } from '@/lib/supabase';
import { Instagram, Linkedin } from '@/components/icons';

interface SelectedCourseSession {
  id: number;
  name: string;
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        body {
          background: #f8fafc;
        }
        .signup-card {
          max-width: 550px;
          width: 100%;
          margin: 60px auto;
          padding: 40px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(29, 62, 222, 0.08);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .form-group {
          margin-bottom: 22px;
          position: relative;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #334155;
          font-size: 0.9rem;
        }
        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
        }
        .form-group input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s;
        }
        .form-group input:focus {
          border-color: #1d3ede;
          box-shadow: 0 0 0 3px rgba(29, 62, 222, 0.1);
        }
        .payment-method-btn {
          flex: 1;
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .selected-course-info {
          background: #f1f5f9;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 25px;
          border: 1px solid #e2e8f0;
        }
        .payment-details-pane {
          background: #fffbeb;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #fef3c7;
          margin-bottom: 25px;
          color: #92400e;
        }
        .btn-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #1d3ede 0%, #0a7ec0 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.98rem;
          cursor: pointer;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(29, 62, 222, 0.2);
          transition: all 0.2s;
        }
        .btn-submit:hover {
          box-shadow: 0 6px 20px rgba(29, 62, 222, 0.3);
          transform: translateY(-1px);
        }
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .back-link {
          display: block;
          text-align: center;
          margin-top: 20px;
          color: #1d3ede;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.92rem;
        }
        .back-link:hover {
          text-decoration: underline;
        }
      `}</style>

      {/* Brand Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light bg-transparent" id="gisec-main-nav">
        <div className="container">
          <Link href="/" className="navbar-brand">
            <img src="/statics/logo.jpg" width="100" height="50px" style={{ borderRadius: '.5rem' }} alt="GISEC Logo" />
          </Link>
          <button className="navbar-toggler" data-target="#my-nav" onClick={(e) => e.currentTarget.classList.toggle("change")} data-toggle="collapse">
            <span className="bar1"></span> <span className="bar2"></span> <span className="bar3"></span>
          </button>
          <div id="my-nav" className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item"><Link className="nav-link" href="/">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" href="/courses">Courses</Link></li>
              <li className="nav-item"><Link className="nav-link" href="/#contact">Contact</Link></li>
            </ul>
            <form className="form-inline my-2 my-lg-0">
              <Link href="/courses" className="btn btn-outline-dark my-2 my-sm-0 mr-3 text-uppercase" style={{ color: '#000', border: '3px solid rgb(128, 5, 5)', borderRadius: '30px', fontWeight: 600, padding: '6px 20px' }}>Enroll</Link>
              <a href="https://bit.ly/gisecinterestform" className="btn btn-info my-2 my-sm-0 text-uppercase">Partnership</a>
            </form>
          </div>
        </div>
      </nav>

      {/* Page Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #1d3ede 0%, #01e6f8 100%)',
        padding: '50px 20px',
        color: '#fff',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div className="container">
          <h1 style={{ fontFamily: 'Lato-Black', fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>
            Register Course Pathway
          </h1>
          <p style={{ fontSize: '1.02rem', opacity: 0.9 }}>
            Join the cohort today to launch your tech career with direct mentorship and global portfolios.
          </p>
        </div>
      </section>

      {/* Main Form Content wrapper */}
      <div style={{ flex: 1, padding: '20px 10px', display: 'flex', alignItems: 'center' }}>
        <div className="signup-card">
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px', textAlign: 'center' }}>
            Enrollment Details
          </h3>

          <div className="selected-course-info">
            {courseDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem', color: '#334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} style={{ color: '#10b981' }} />
                  <span><strong>Selected Course:</strong> {courseDetails.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={16} style={{ color: '#1d3ede' }} />
                  <span><strong>Enrollment Price:</strong> {courseDetails.price}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} style={{ color: '#f59e0b' }} />
                  <span><strong>Duration:</strong> {courseDetails.duration}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                No course selected. <Link href="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#1d3ede' }}><ArrowLeft size={14} /> View Course paths</Link>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@domain.com"
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-icon-wrapper">
                <Phone size={16} className="input-icon" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234..."
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Payment Mode</label>
              <div style={{ display: 'flex', gap: '15px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('bank')} 
                  className="payment-method-btn"
                  style={{
                    border: paymentMethod === 'bank' ? '2.5px solid #1d3ede' : '1.5px solid #cbd5e1',
                    background: paymentMethod === 'bank' ? 'rgba(29, 62, 222, 0.05)' : '#ffffff',
                    color: paymentMethod === 'bank' ? '#1d3ede' : '#475569'
                  }}
                >
                  Bank Transfer
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('online')} 
                  className="payment-method-btn"
                  style={{
                    border: paymentMethod === 'online' ? '2.5px solid #1d3ede' : '1.5px solid #cbd5e1',
                    background: paymentMethod === 'online' ? 'rgba(29, 62, 222, 0.05)' : '#ffffff',
                    color: paymentMethod === 'online' ? '#1d3ede' : '#475569'
                  }}
                >
                  Online checkout (Instant)
                </button>
              </div>
            </div>

            {paymentMethod === 'bank' ? (
              <>
                <div className="payment-details-pane">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.05rem', margin: '0 0 10px 0', color: '#b45309', fontWeight: 700 }}>
                    <CreditCard size={18} /> Bank Details
                  </h4>
                  <p style={{ margin: '5px 0' }}>Transfer the amount to:</p>
                  <p style={{ margin: '3px 0' }}><strong>Bank:</strong> GTBank</p>
                  <p style={{ margin: '3px 0' }}><strong>Account Name:</strong> GISEK Technologies</p>
                  <p style={{ margin: '3px 0' }}><strong>Account Number:</strong> 0123456789</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem' }}><small>Upload your receipt proof below. Enrollment is verified in 24 hours.</small></p>
                </div>

                <div className="form-group">
                  <label>Upload Payment Receipt</label>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*,.pdf" 
                    required={paymentMethod === 'bank'}
                    style={{ padding: '8px' }}
                  />
                </div>
              </>
            ) : (
              <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #10b981', color: '#065f46', marginBottom: '25px', fontSize: '0.92rem', lineHeight: 1.5 }}>
                You will be redirected securely to the online payment gateway (Paystack) to process payment of <strong>{courseDetails ? courseDetails.price : '₦0'}</strong>. Your pathway access will be activated immediately!
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-submit">
              {isSubmitting ? 'Processing...' : paymentMethod === 'online' ? 'Pay & Complete Enrollment' : 'Submit Registration'}
            </button>
          </form>
          
          <Link href="/courses" className="back-link">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ArrowLeft size={16} /> Back to Courses</span>
          </Link>
        </div>
      </div>

      {/* Branded Footer */}
      <footer className="container-fluid" id="gisec-footer" style={{ backgroundImage: '-webkit-linear-gradient(0deg, #0a7ec0 0%, #1d3ede 100%)', marginTop: 'auto' }}>
        <div className="container">
          <div className="row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem 1rem 1rem' }}>
            <div className="col-lg-4" id="contact">
              <h4 style={{ color: '#fff' }}>Contact Us</h4>
              <ul className="nav flex-column company-nav" style={{ color: '#e3e3e3' }}>
                <li className="nav-item">Address: Lagos, Nigeria</li>
                <li className="nav-item">Phone: <a href="tel:+2349077222871" style={{ color: '#e3e3e3' }}>Phone Line 1</a>, <a href="tel:+2348106412859" style={{ color: '#e3e3e3' }}>Phone Line 2</a></li>
                <li className="nav-item">Email: <a href="mailto:gisectechglobal@gmail.com" style={{ color: '#e3e3e3' }}>gisectechglobal@gmail.com</a></li>
              </ul>
              <h4 className="mt-4" style={{ color: '#fff' }}>Follow Us</h4>
              <ul className="nav follow-us-nav" style={{ color: '#fff', display: 'flex', gap: '15px' }}>
                <li className="nav-item">
                  <a style={{ color: '#e3e3e3' }} className="nav-link pl-0 pr-0" href="https://linktr.ee/gisectechg">
                    <Globe size={18} />
                  </a>
                </li>
                <li className="nav-item">
                  <a style={{ color: '#e3e3e3' }} className="nav-link pl-0 pr-0" href="https://www.instagram.com/gisectechnologies">
                    <Instagram size={18} />
                  </a>
                </li>
                <li className="nav-item">
                  <a style={{ color: '#e3e3e3' }} className="nav-link pl-0 pr-0" href="mailto:gisectechglobal@gmail.com">
                    <Mail size={18} />
                  </a>
                </li>
                <li className="nav-item">
                  <a style={{ color: '#e3e3e3' }} className="nav-link pl-0 pr-0" href="https://www.linkedin.com/company/gisec-technologies-limited">
                    <Linkedin size={18} />
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-lg-3">
              <div className="row">
                <div className="col-12">
                  <h4 style={{ color: '#fff' }}>Navigation</h4>
                  <ul className="nav flex-column company-nav" style={{ color: '#fff' }}>
                    <li className="nav-item"><Link style={{ color: '#fff' }} className="nav-link" href="/">Home</Link></li>
                    <li className="nav-item"><Link style={{ color: '#fff' }} className="nav-link" href="/courses">Courses</Link></li>
                    <li className="nav-item"><Link style={{ color: '#fff' }} className="nav-link" href="/#faq">FAQ&apos;s</Link></li>
                    <li className="nav-item"><Link style={{ color: '#fff' }} className="nav-link" href="/#contact">Contact</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
