'use client';

import React from 'react';
import Link from 'next/link';
import coursesData from '@/public/data/courses.json';
import '@/new-css/courses.css';

export default function Courses() {
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [expandedCourses, setExpandedCourses] = React.useState({});

  const toggleCurriculum = (id) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getCategory = (courseName) => {
    const name = courseName.toLowerCase();
    if (name.includes('software') || name.includes('cyber') || name.includes('data')) {
      return 'Technical & Data';
    }
    if (name.includes('design') || name.includes('product management')) {
      return 'Design & Product';
    }
    if (name.includes('project management')) {
      return 'Management';
    }
    return 'Technical & Data';
  };

  const categories = ['All', 'Technical & Data', 'Design & Product', 'Management'];

  const filteredCourses = activeCategory === 'All'
    ? coursesData.courses
    : coursesData.courses.filter(course => getCategory(course.name) === activeCategory);

  const enrollInCourse = (courseId, courseName) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCourse', JSON.stringify({ id: courseId, name: courseName }));
      window.location.href = '/signup';
    }
  };

  return (
    <div className="courses-page-body">
      {/* Brand Navbar matching homepage */}
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

      {/* Hero Header */}
      <section className="courses-hero-section">
        <div className="container">
          <h1 data-aos="fade-down">Choose Your Learning Path</h1>
          <p data-aos="fade-up">Empower yourself with high-demand professional training. Master cutting-edge tools and earn certifications to advance your career.</p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="courses-filter-container" data-aos="fade-up">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`courses-filter-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <section className="container courses-grid-section" id="coursesGrid" data-aos="fade-up">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => {
            const catLabel = getCategory(course.name);
            const isExpanded = !!expandedCourses[course.id];
            return (
              <div className="premium-course-card" key={course.id}>
                <div>
                  <span className="course-card-badge">{catLabel}</span>
                  <div className="premium-course-header">
                    <h2 className="premium-course-title">{course.name}</h2>
                    <span className="premium-course-duration">⏱️ Duration: {course.duration}</span>
                  </div>
                  
                  <div className="premium-course-price-row">
                    <span className="premium-course-price-label">Tuition Fee:</span>
                    <span className="premium-course-price-val">{course.price}</span>
                  </div>

                  <div className="premium-course-tools">
                    <span className="premium-course-tools-title">Professional Tools:</span>
                    <div className="premium-course-tools-list">
                      {course.tools.map((tool, index) => (
                        <span className="premium-course-tool-badge" key={index}>{tool}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  {/* Collapsible Syllabus Outline */}
                  <button 
                    className="premium-course-accordion-trigger" 
                    onClick={() => toggleCurriculum(course.id)}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? 'Hide Curriculum Outline 🔼' : 'View Curriculum Outline 🔽'}
                  </button>

                  <div className={`premium-course-curriculum-drawer ${isExpanded ? 'expanded' : ''}`}>
                    <div className="curriculum-timeline">
                      {course.weeks.map((weekItem, index) => (
                        <div className="curriculum-week-card" key={index}>
                          <div className="curriculum-week-title">Week {weekItem.week}: {weekItem.topic}</div>
                          <div className="curriculum-week-content">{weekItem.content}</div>
                          {weekItem.assignment && (
                            <div className="curriculum-week-assignment">
                              📝 Project: {weekItem.assignment}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => enrollInCourse(course.id, course.name)} className="premium-course-enroll-btn">
                    Enroll Now →
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="courses-empty-state">
            <h3>No courses found in this category.</h3>
          </div>
        )}
      </section>

      {/* Brand Footer matching homepage */}
      <footer className="container-fluid mt-5" id="gisec-footer" style={{ backgroundImage: '-webkit-linear-gradient(0deg, #0a7ec0 0%, #1d3ede 100%)' }}>
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
              <ul className="nav follow-us-nav" style={{ color: '#fff' }}>
                <li className="nav-item"><a style={{ color: '#e3e3e3' }} className="nav-link pl-0" href="https://linktr.ee/gisectechg"><i className="fa fa-globe" aria-hidden="true"></i></a></li>
                <li className="nav-item"><a style={{ color: '#e3e3e3' }} className="nav-link" href="https://www.instagram.com/gisectechnologies"><i className="fa fa-instagram" aria-hidden="true"></i></a></li>
                <li className="nav-item"><a style={{ color: '#e3e3e3' }} className="nav-link" href="mailto:gisectechglobal@gmail.com"><i className="fa fa-envelope" aria-hidden="true"></i></a></li>
                <li className="nav-item"><a style={{ color: '#e3e3e3' }} className="nav-link" href="https://www.linkedin.com/company/gisec-technologies-limited"><i className="fa fa-linkedin" aria-hidden="true"></i></a></li>
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
