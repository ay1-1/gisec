'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCourses } from '@/lib/api';
import { Course } from '@/types/course';
import { 
  Search, 
  BookOpen, 
  Clock, 
  Star, 
  ChevronRight, 
  Globe, 
  Instagram, 
  Mail, 
  Linkedin,
  Sparkles,
  ArrowRight,
  Users
} from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  const getCategory = (courseName: string): string => {
    const name = courseName.toLowerCase();
    if (name.includes('software') || name.includes('cyber') || name.includes('data')) return 'Engineering & Data';
    if (name.includes('design')) return 'Design';
    if (name.includes('product management')) return 'Product';
    if (name.includes('project management')) return 'Management';
    return 'Engineering & Data';
  };

  const categories = ['All', 'Engineering & Data', 'Design', 'Product', 'Management'];

  // Filter based on active category AND search query
  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === 'All' || getCategory(course.name) === activeCategory;
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />;
          } else if (i === fullStars && hasHalf) {
            return (
              <div key={i} style={{ position: 'relative', display: 'inline-block', width: '14px', height: '14px' }}>
                <Star size={14} color="#d1d5db" />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden' }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                </div>
              </div>
            );
          } else {
            return <Star key={i} size={14} color="#d1d5db" />;
          }
        })}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        /* Custom styles for courses page */
        .sidebar-pane {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(29, 62, 222, 0.06);
          box-shadow: 0 4px 20px rgba(29, 62, 222, 0.02);
          position: sticky;
          top: 90px;
        }
        .search-box {
          position: relative;
          margin-bottom: 25px;
        }
        .search-box input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.92rem;
          outline: none;
          transition: all 0.3s ease;
        }
        .search-box input:focus {
          border-color: #1d3ede;
          box-shadow: 0 0 0 3px rgba(29, 62, 222, 0.1);
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .category-tab {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .category-tab:hover {
          background: #f1f5f9;
          color: #1d3ede;
        }
        .category-tab.active {
          background: linear-gradient(135deg, rgba(29, 62, 222, 0.08) 0%, rgba(1, 230, 248, 0.08) 100%);
          color: #1d3ede;
          border-left: 4px solid #1d3ede;
          padding-left: 12px;
        }
        
        /* Course Grid Cards */
        .course-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 25px;
        }
        .course-c-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(29, 62, 222, 0.06);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          transition: all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .course-c-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 35px rgba(29, 62, 222, 0.08);
        }
        .course-c-image-wrap {
          position: relative;
          height: 160px;
          background: #e2e8f0;
          overflow: hidden;
        }
        .course-c-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .course-c-card:hover .course-c-img {
          transform: scale(1.05);
        }
        .course-c-featured {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 3px;
          box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
        }
        .course-c-category {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #1d3ede;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .course-c-title {
          font-family: 'Lato-Bold', sans-serif;
          font-size: 1.15rem;
          color: #0f172a;
          margin: 0 0 10px 0;
          line-height: 1.4;
          font-weight: 700;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 3.2rem;
        }
        .course-c-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 12px;
          border-bottom: 1.5px dashed #f1f5f9;
          padding-bottom: 12px;
        }
        .course-c-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .course-c-spec {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 10px;
        }
        .course-c-price {
          font-family: 'Lato-Black', sans-serif;
          font-size: 1.25rem;
          color: #1d3ede;
          font-weight: 800;
        }
        .course-c-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #0f172a;
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .course-c-btn:hover {
          background: #1d3ede;
          color: #ffffff;
        }
        .course-c-level-badge {
          background: #f1f5f9;
          color: #475569;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 600;
        }
        @media (max-width: 991px) {
          .sidebar-pane {
            position: relative;
            top: 0;
            margin-bottom: 30px;
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
              <li className="nav-item"><Link className="nav-link active" href="/courses">Courses</Link></li>
              <li className="nav-item"><Link className="nav-link" href="/#contact">Contact</Link></li>
            </ul>
            <div className="form-inline my-2 my-lg-0">
              <a href="https://bit.ly/gisectechenroll" className="btn btn-outline-dark my-2 my-sm-0 mr-3 text-uppercase" style={{ color: '#000', border: '3px solid rgb(128, 5, 5)' }}>Enroll</a>
              <a href="https://bit.ly/gisecinterestform" className="btn btn-info my-2 my-sm-0 text-uppercase">Partnership</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1d3ede 0%, #01e6f8 100%)',
        padding: '60px 20px',
        color: '#fff',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'url(/images/word-map.png) center/cover no-repeat',
          opacity: 0.05, pointerEvents: 'none'
        }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 data-aos="fade-down" style={{ fontFamily: 'Lato-Black', fontSize: '2.8rem', fontWeight: 700, marginBottom: '10px' }}>
            Explored Paths & Programs
          </h1>
          <p data-aos="fade-up" style={{ fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', opacity: 0.9, lineHeight: 1.6 }}>
            Gain industry-ready expertise, work on real projects, and build a competitive tech profile.
          </p>
        </div>
      </section>

      {/* Main split-pane content */}
      <section className="container" style={{ flex: 1, padding: '40px 15px 80px' }}>
        <div className="row">
          {/* Left Sidebar Pane */}
          <div className="col-lg-3 col-md-12" data-aos="fade-right">
            <div className="sidebar-pane">
              <h4 style={{ fontFamily: 'Lato-Bold', fontSize: '1.15rem', color: '#0f172a', marginBottom: '15px', fontWeight: 700 }}>
                Search & Filter
              </h4>
              
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search courses..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <h5 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.5px' }}>
                Categories
              </h5>

              <div className="category-list">
                {categories.map((cat) => (
                  <button 
                    key={cat} 
                    className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    <span>{cat}</span>
                    <ChevronRight size={14} style={{ opacity: activeCategory === cat ? 1 : 0.4 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Courses Grid Pane */}
          <div className="col-lg-9 col-md-12" data-aos="fade-left">
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                Showing <strong>{filteredCourses.length}</strong> courses
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <h3>Loading programs...</h3>
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="course-grid">
                {filteredCourses.map((course) => (
                  <Link 
                    key={course.id} 
                    href={`/courses/${course.id}`} 
                    className="course-c-card"
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
                  >
                    <div className="course-c-image-wrap">
                      <img 
                        src={course.image || '/images/courses/pm.png'} 
                        alt={course.name} 
                        className="course-c-img"
                      />
                      {course.featured && (
                        <div className="course-c-featured">
                          <Sparkles size={11} fill="#ffffff" />
                          <span>Featured</span>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div className="course-c-category">{getCategory(course.name)}</div>
                      <h3 className="course-c-title" style={{ textDecoration: 'none' }}>{course.name}</h3>

                      <div className="course-c-meta">
                        <div className="course-c-meta-item">
                          <Clock size={13} style={{ color: '#1d3ede' }} />
                          <span>{course.duration}</span>
                        </div>
                        <div className="course-c-meta-item">
                          <Users size={13} style={{ color: '#0ea5e9' }} />
                          <span>{course.students || 30}+ students</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                        {renderStars(course.rating || 4.5)}
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>
                          {course.rating || '4.5'}
                        </span>
                      </div>

                      <div className="course-c-spec">
                        <span className="course-c-level-badge">{course.level || 'Beginner'}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span className="course-c-price">{course.price}</span>
                          <span className="course-c-btn" style={{ marginTop: '10px' }}>
                            View Course <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ 
                background: '#ffffff', 
                borderRadius: '16px', 
                padding: '80px 20px', 
                textAlign: 'center', 
                border: '1px solid rgba(29, 62, 222, 0.06)',
                color: '#64748b' 
              }}>
                <BookOpen size={48} style={{ color: '#94a3b8', marginBottom: '15px' }} />
                <h3>No courses found</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>Try adjusting your search query or switching categories.</p>
                <button 
                  onClick={() => { setActiveCategory('All'); setSearchQuery(''); }} 
                  style={{ 
                    marginTop: '20px', 
                    background: '#1d3ede', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '10px 24px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    fontSize: '0.88rem'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
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
