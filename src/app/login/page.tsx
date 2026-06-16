'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, Lock, Globe, ArrowRight, User, ChevronDown } from 'lucide-react';
import { signInUser } from '@/lib/supabase';
import { Instagram, Linkedin } from '@/components/icons';

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userSession = localStorage.getItem('currentUser');
      if (userSession) {
        try {
          setCurrentUser(JSON.parse(userSession));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await signInUser(email);

    if (result.success && result.session) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify({
          id: result.session.id,
          email: result.session.email,
          name: result.session.fullName,
          role: result.session.role,
          course: result.session.courseName
        }));
        document.cookie = `gisec_session_token=${result.session.id}; path=/; max-age=86400; SameSite=Lax`;
        window.location.href = '/dashboard';
      }
    } else {
      alert(result.error || 'Login failed. Please verify your credentials or register.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        body {
          background: #f8fafc;
        }
        .login-card {
          max-width: 450px;
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
        .btn-login {
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
        .btn-login:hover {
          box-shadow: 0 6px 20px rgba(29, 62, 222, 0.3);
          transform: translateY(-1px);
        }
        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .signup-link {
          text-align: center;
          margin-top: 25px;
          font-size: 0.92rem;
          color: #64748b;
        }
        .signup-link a {
          color: #1d3ede;
          text-decoration: none;
          font-weight: 600;
        }
        .signup-link a:hover {
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
            <form className="form-inline my-2 my-lg-0" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {currentUser ? (
                <Link 
                  href="/dashboard" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: '#1d3ede', 
                    color: '#ffffff', 
                    textDecoration: 'none', 
                    fontWeight: 700, 
                    fontSize: '0.9rem', 
                    border: '2px solid #ffffff', 
                    boxShadow: '0 2px 8px rgba(29,62,222,0.25)' 
                  }} 
                  title="Go to Dashboard"
                >
                  {currentUser.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                </Link>
              ) : (
                <div style={{ position: 'relative' }}>
                  <button 
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="btn btn-outline-primary dropdown-toggle my-2 my-sm-0 mr-3 text-uppercase"
                    style={{ 
                      color: '#1d3ede', 
                      border: '3px solid #1d3ede', 
                      background: 'transparent', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      fontWeight: 700, 
                      padding: '8px 16px', 
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <User size={16} /> Account <ChevronDown size={14} />
                  </button>
                  {dropdownOpen && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      right: 15, 
                      background: '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                      padding: '8px 0', 
                      zIndex: 1000, 
                      minWidth: '130px', 
                      marginTop: '8px' 
                    }}>
                      <Link 
                        href="/login" 
                        onClick={() => setDropdownOpen(false)} 
                        style={{ 
                          display: 'block', 
                          padding: '8px 16px', 
                          color: '#334155', 
                          textDecoration: 'none', 
                          fontSize: '0.9rem', 
                          fontWeight: 600 
                        }}
                      >
                        Login
                      </Link>
                      <Link 
                        href="/signup" 
                        onClick={() => setDropdownOpen(false)} 
                        style={{ 
                          display: 'block', 
                          padding: '8px 16px', 
                          color: '#334155', 
                          textDecoration: 'none', 
                          fontSize: '0.9rem', 
                          fontWeight: 600 
                        }}
                      >
                        Signup
                      </Link>
                    </div>
                  )}
                </div>
              )}
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
            Welcome Back
          </h1>
          <p style={{ fontSize: '1.02rem', opacity: 0.9 }}>
            Sign in to access your dashboard, track syllabus modules, and view scheduled live lectures.
          </p>
        </div>
      </section>

      {/* Main Form content wrapper */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', alignItems: 'center' }}>
        <div className="login-card">
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '25px', textAlign: 'center' }}>
            Sign In
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required 
                />
              </div>
            </div>
            
            <button type="submit" disabled={isSubmitting} className="btn-login">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="signup-link">
            <p>Don&apos;t have an account? <Link href="/courses">Explore our courses</Link> to enroll and sign up!</p>
          </div>
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
