'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';

interface StudentData {
  email: string;
  fullName: string;
  courseName: string;
}

import { signInUser } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      if (typeof window !== 'undefined') {
        window.location.href = '/signup';
      }
    }
  };

  return (
    <>
      <style>{`
        body {
          background: #f5f5f5;
        }
        .login-container {
          max-width: 400px;
          margin: 100px auto;
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
        }
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }
        .btn-login {
          width: 100%;
          padding: 14px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
        }
        .signup-link {
          text-align: center;
          margin-top: 20px;
        }
        .signup-link a {
          color: #6366f1;
          text-decoration: none;
        }
      `}</style>

      <div className="login-container">
        <h1>Login to Your Account</h1>
        <form onSubmit={handleSubmit}>
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
            <label>Password (use any password for demo)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-login">Login</button>
        </form>
        <div className="signup-link">
          <p>Don&apos;t have an account? <Link href="/signup">Sign up here</Link></p>
        </div>
      </div>
    </>
  );
}
