'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCourseById } from '@/lib/api';
import { Course } from '@/types/course';
import { 
  Clock, 
  Star, 
  Award, 
  BookOpen, 
  Users, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  ArrowLeft,
  Briefcase,
  Play,
  FileText,
  UserCheck,
  Shield,
  Layers,
  Globe,
  Mail
} from 'lucide-react';
import { Instagram, Linkedin } from '@/components/icons';

interface PageProps {
  params: {
    id: string;
  };
}

export default function CourseDetail({ params }: PageProps) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 0: true }); // first week open by default
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const courseId = parseInt(params.id);
    getCourseById(courseId).then((matched) => {
      if (matched) {
        setCourse(matched);
      }
      setLoading(false);
    });
  }, [params.id]);

  const toggleWeek = (index: number) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const enrollInCourse = () => {
    if (!course) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCourse', JSON.stringify({ id: course.id, name: course.name }));
      router.push('/signup');
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />;
          } else if (i === fullStars && hasHalf) {
            return (
              <div key={i} style={{ position: 'relative', display: 'inline-block', width: '15px', height: '15px' }}>
                <Star size={15} color="#d1d5db" />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden' }}>
                  <Star size={15} fill="#f59e0b" color="#f59e0b" />
                </div>
              </div>
            );
          } else {
            return <Star key={i} size={15} color="#d1d5db" />;
          }
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ fontSize: '1.2rem', color: '#1d3ede', fontWeight: 600 }}>Loading course details...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
        <BookOpen size={64} style={{ color: '#ef4444', marginBottom: '20px' }} />
        <h2 style={{ color: '#0f172a', fontWeight: 700 }}>Course Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '5px', marginBottom: '25px', textAlign: 'center' }}>The course you are looking for does not exist or has been moved.</p>
        <Link href="/courses" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#1d3ede',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 4px 15px rgba(29, 62, 222, 0.15)'
        }}>
          <ArrowLeft size={16} /> Back to Courses
        </Link>
      </div>
    );
  }

  const getCategory = (courseName: string): string => {
    const name = courseName.toLowerCase();
    if (name.includes('software') || name.includes('cyber') || name.includes('data')) return 'Engineering & Data';
    if (name.includes('design')) return 'Design';
    if (name.includes('product management')) return 'Product';
    if (name.includes('project management')) return 'Management';
    return 'Engineering & Data';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        /* Udemy Style Layout Styles */
        .syllabus-item {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          border-radius: 12px;
          margin-bottom: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
          transition: border-color 0.2s;
        }
        .syllabus-item:hover {
          border-color: #cbd5e1;
        }
        .syllabus-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          background: #ffffff;
          cursor: pointer;
          font-weight: 600;
          color: #0f172a;
          user-select: none;
        }
        .syllabus-body {
          padding: 20px 24px;
          background: #fafafa;
          border-top: 1px solid #f1f5f9;
        }
        .syllabus-num-badge {
          background: linear-gradient(135deg, #1d3ede, #01e6f8);
          color: #ffffff;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.78rem;
        }
        .spec-sidebar-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(29, 62, 222, 0.08);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          position: sticky;
          top: 90px;
        }
        .sidebar-video-placeholder {
          position: relative;
          height: 200px;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .sidebar-video-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.6;
        }
        .sidebar-video-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.3);
          color: #fff;
        }
        .play-circle {
          background: #ffffff;
          color: #1d3ede;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          margin-bottom: 10px;
          transition: transform 0.2s;
        }
        .spec-sidebar-card:hover .play-circle {
          transform: scale(1.1);
        }
        
        .learn-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.95rem;
          color: #334155;
          line-height: 1.5;
        }
        .learn-icon-circle {
          background: #ecfdf5;
          color: #059669;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .enroll-action-btn {
          width: 100%;
          background: linear-gradient(135deg, #1d3ede 0%, #0a7ec0 100%);
          border: none;
          color: white;
          padding: 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.98rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(29, 62, 222, 0.2);
        }
        .enroll-action-btn:hover {
          box-shadow: 0 8px 25px rgba(29, 62, 222, 0.3);
          transform: translateY(-1px);
          opacity: 0.95;
        }
        .apply-action-btn {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .apply-action-btn:hover {
          border-color: #1d3ede;
          color: #1d3ede;
          background: rgba(29, 62, 222, 0.01);
        }
        
        .tool-badge-item {
          background: #f1f5f9;
          color: #334155;
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 0.82rem;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        .tool-badge-item:hover {
          background: #1d3ede;
          color: #ffffff;
          border-color: #1d3ede;
          transform: translateY(-2px);
        }
        
        .meta-feature-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.88rem;
          color: #475569;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .meta-feature-row:last-child {
          border-bottom: none;
        }
        
        @media (max-width: 991px) {
          .spec-sidebar-card {
            position: relative;
            top: 0;
            margin-bottom: 40px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.03);
          }
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
              <Link href="/courses" className="btn btn-outline-dark my-2 my-sm-0 mr-3 text-uppercase" style={{ color: '#000', border: '3px solid rgb(128, 5, 5)' }}>Enroll</Link>
              <a href="https://bit.ly/gisecinterestform" className="btn btn-info my-2 my-sm-0 text-uppercase">Partnership</a>
            </form>
          </div>
        </div>
      </nav>

      {/* Course Detail Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '50px 20px 40px',
        color: '#fff',
        position: 'relative'
      }}>
        <div className="container">
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#38bdf8', marginBottom: '20px', fontWeight: 600 }}>
            <Link href="/courses" style={{ color: '#38bdf8', textDecoration: 'none' }}>Courses</Link>
            <ChevronRight size={12} />
            <span style={{ color: '#94a3b8' }}>{getCategory(course.name)}</span>
          </div>

          <div className="row">
            <div className="col-lg-8 col-md-12">
              <h1 style={{ fontFamily: 'Lato-Bold', fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '15px', lineHeight: 1.25 }}>
                {course.name}
              </h1>
              
              <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '750px', marginBottom: '20px' }}>
                {course.description ? course.description.substring(0, 160) : ''}...
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', fontSize: '0.88rem', color: '#cbd5e1' }}>
                <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {course.level}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {renderStars(course.rating || 4.5)}
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>{course.rating || '4.5'}</span>
                </div>

                <span style={{ color: '#94a3b8' }}>({course.students || 45}+ enrolled students)</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                  <Clock size={14} />
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Udemy style layout panes */}
      <section className="container" style={{ padding: '40px 15px 80px', flex: 1 }}>
        <div className="row">
          
          {/* Left Column: Full syllabus descriptions */}
          <div className="col-lg-8 col-md-12">
            
            {/* Description */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '30px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
              <h3 style={{ fontFamily: 'Lato-Bold', fontSize: '1.35rem', color: '#0f172a', fontWeight: 700, marginBottom: '15px' }}>
                Course Description
              </h3>
              <p style={{ color: '#334155', fontSize: '0.98rem', lineHeight: 1.7, margin: 0 }}>
                {course.description}
              </p>
            </div>

            {/* What you'll learn */}
            {course.whatYouLearn && (
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '30px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <h3 style={{ fontFamily: 'Lato-Bold', fontSize: '1.35rem', color: '#0f172a', fontWeight: 700, marginBottom: '20px' }}>
                  What you&apos;ll learn
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                  {course.whatYouLearn.map((item, index) => (
                    <div key={index} className="learn-item">
                      <div className="learn-icon-circle">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools and tech */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '30px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
              <h3 style={{ fontFamily: 'Lato-Bold', fontSize: '1.35rem', color: '#0f172a', fontWeight: 700, marginBottom: '15px' }}>
                Tools & Technologies
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {course.tools.map((tool, index) => (
                  <span key={index} className="tool-badge-item">{tool}</span>
                ))}
              </div>
            </div>

            {/* Course Content / Curriculum Accordion */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '30px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'Lato-Bold', fontSize: '1.35rem', color: '#0f172a', fontWeight: 700, margin: 0 }}>
                  Course Content
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  {course.weeks?.length || 4} Modules • 12 Weeks total
                </span>
              </div>

              <div className="syllabus-timeline">
                {course.weeks?.map((w, index) => {
                  const isOpen = !!expandedWeeks[index];
                  return (
                    <div key={index} className="syllabus-item">
                      <div className="syllabus-header" onClick={() => toggleWeek(index)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div className="syllabus-num-badge">W{w.week}</div>
                          <span style={{ fontSize: '0.98rem', fontWeight: 600 }}>{w.topic}</span>
                        </div>
                        <ChevronDown 
                          size={18} 
                          style={{ 
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                            transition: 'transform 0.3s ease',
                            color: '#64748b' 
                          }} 
                        />
                      </div>
                      
                      {isOpen && (
                        <div className="syllabus-body">
                          <div style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6 }}>
                            <strong style={{ color: '#0f172a', display: 'block', marginBottom: '6px' }}>Core Topics covered:</strong>
                            <p style={{ margin: '0 0 15px 0' }}>{w.content}</p>
                            
                            {w.assignment && (
                              <div style={{ 
                                background: 'rgba(29, 62, 222, 0.04)', 
                                borderLeft: '3px solid #1d3ede',
                                padding: '10px 14px', 
                                borderRadius: '0 8px 8px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <FileText size={14} style={{ color: '#1d3ede' }} />
                                <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#1e293b' }}>
                                  <strong>Assignment:</strong> {w.assignment}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky specs checkout card */}
          <div className="col-lg-4 col-md-12">
            <div className="spec-sidebar-card">
              
              {/* Media Preview cover */}
              <div className="sidebar-video-placeholder">
                <img 
                  src={course.image || '/images/courses/pm.png'} 
                  alt={course.name} 
                  className="sidebar-video-img"
                />
                <div className="sidebar-video-overlay">
                  <div className="play-circle">
                    <Play size={20} fill="#1d3ede" />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Path Preview
                  </span>
                </div>
              </div>

              {/* Price Details */}
              <div style={{ padding: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Lato-Black', lineHeight: 1 }}>
                    {course.price}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>one-time payment</span>
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
                  <button onClick={enrollInCourse} className="enroll-action-btn">
                    Enroll Now
                  </button>
                  <button onClick={enrollInCourse} className="apply-action-btn">
                    Apply Online
                  </button>
                </div>

                {/* Features Checklist */}
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                    This course includes:
                  </h4>
                  
                  <div className="meta-feature-row">
                    <Clock size={16} style={{ color: '#64748b' }} />
                    <span>{course.duration} full course timeline</span>
                  </div>
                  <div className="meta-feature-row">
                    <Layers size={16} style={{ color: '#64748b' }} />
                    <span>{course.weeks?.length || 4} Structured Modules</span>
                  </div>
                  <div className="meta-feature-row">
                    <Award size={16} style={{ color: '#64748b' }} />
                    <span>Professional Certificate of Completion</span>
                  </div>
                  <div className="meta-feature-row">
                    <UserCheck size={16} style={{ color: '#64748b' }} />
                    <span>1-on-1 Mentor-Led Review sessions</span>
                  </div>
                  <div className="meta-feature-row">
                    <Briefcase size={16} style={{ color: '#64748b' }} />
                    <span>Hands-on Capstone Project & Portfolio</span>
                  </div>
                  <div className="meta-feature-row">
                    <Shield size={16} style={{ color: '#64748b' }} />
                    <span>Access to GISEC Graduate Network</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="container-fluid" id="gisec-footer" style={{ backgroundImage: '-webkit-linear-gradient(0deg, #0a7ec0 0%, #1d3ede 100%)', marginTop: 'auto' }}>
        <div className="container">
          <div className="row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem 1rem 1rem' }}>
            <div className="col-lg-4" id="contact">
              <h4 style={{ color: '#fff' }}>Contact Us</h4>
              <ul className="nav flex-column company-nav" style={{ color: '#e3e3e3' }}>
                <li className="nav-item">Address: Lagos, Nigeria</li>
                <li className="nav-item">Phone: <a href="tel:+2349077222871" style={{ color: '#e3e3e3' }}>Phone Line 1</a>, <a href="tel:+2348106412859" style={{ color: '#e3e3e3' }}>Phone Line 2</a></li>
                <li className="nav-item">Email: <a href="mailto:info@gisectechnologies.com" style={{ color: '#e3e3e3' }}>info@gisectechnologies.com</a></li>
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
                  <a style={{ color: '#e3e3e3' }} className="nav-link pl-0 pr-0" href="mailto:info@gisectechnologies.com">
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
