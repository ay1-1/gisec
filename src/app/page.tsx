'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getCourses } from '@/lib/api';
import { Course } from '@/types/course';
import { 
  Clock, 
  Star, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Globe, 
  Instagram, 
  Mail, 
  Linkedin,
  ArrowRight,
  Rocket,
  BookOpen
} from 'lucide-react';

const mediaVideos: string[] = [
  "eNOLvfLhzeY",
  "wv9Up_fVafc",
  "72HbChSzhho",
  "EiBdwJNznEM",
  "8gok1_q04eU"
];

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);

  useEffect(() => {
    getCourses().then((data) => {
      setFeaturedCourses(data.filter(c => c.featured));
    });
  }, []);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (container) {
        const childWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).clientWidth : 0;
        if (childWidth > 0) {
          const totalItems = mediaVideos.length;
          let nextIndex = activeMediaIndex + 1;
          if (nextIndex >= totalItems) {
            nextIndex = 0;
          }
          container.scrollTo({
            left: nextIndex * (childWidth + 20),
            behavior: 'smooth'
          });
          setActiveMediaIndex(nextIndex);
        }
      }
    }, 4000); // Autoplay auto-scrolls every 4 seconds

    return () => clearInterval(interval);
  }, [activeMediaIndex, isHovered]);

  const handleMediaScroll = () => {
    const container = scrollRef.current;
    if (container) {
      const scrollLeft = container.scrollLeft;
      const childWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).clientWidth : 0;
      if (childWidth > 0) {
        const index = Math.round(scrollLeft / (childWidth + 20)); // account for gap
        setActiveMediaIndex(index);
      }
    }
  };

  const scrollToMediaIndex = (index: number) => {
    const container = scrollRef.current;
    if (container) {
      const childWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).clientWidth : 0;
      container.scrollTo({
        left: index * (childWidth + 20),
        behavior: 'smooth'
      });
      setActiveMediaIndex(index);
    }
  };

  const scrollMedia = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (container) {
      const childWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).clientWidth : 0;
      const scrollAmount = direction === 'left' ? -(childWidth + 20) : (childWidth + 20);
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const enrollInCourse = (courseId: number, courseName: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCourse', JSON.stringify({ id: courseId, name: courseName }));
      window.location.href = '/signup';
    }
  };

  return (
    <>
      <div className="hero-bg-blobs"></div>

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
              <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
            </ul>
            <div className="form-inline my-2 my-lg-0">
              <a href="https://bit.ly/gisectechenroll" className="btn btn-outline-dark my-2 my-sm-0 mr-3 text-uppercase" style={{ color: '#000', border: '3px solid rgb(128, 5, 5)' }}>Enroll</a> 
              <a href="https://bit.ly/gisecinterestform" className="btn btn-info my-2 my-sm-0 text-uppercase">Partnership</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid gisec-banner-area">
        <div className="container">
          <div className="row">
            <div className="col-md-6" data-aos="fade-right">
              <h1 style={{ fontWeight: 600 }}> We are not just teaching tech—we&apos;re <span>REWRITING </span> futures. </h1>
              <p>GISEC combines tech skills with mentorship, leadership development, and real-world problem-solving to produce industry-ready female tech leaders.</p>
              <a href="#contact" style={{ display: 'inline-flex', alignItems: 'center' }}>Contact Us <ChevronRight size={16} style={{ marginLeft: '4px' }} /></a>
            </div>
            <div className="col-md-6 shortVid" data-aos="fade-left">
              <iframe style={{ borderRadius: '1rem' }} className="iframeVid" src="https://www.youtube.com/embed/72HbChSzhho" title="Gisec Start 2025" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* What we do */}
      <div className="container-fluid gisec-feature" id="what-we-do">
        <div className="container">
          <div className="row">
            <div className="col-md-7" data-aos="fade-right">
              <div className="cover">
                <div className="card">
                  <svg className="back-bg" width="100%" viewBox="0 0 900 700" style={{ position: 'absolute', zIndex: -1 }}>
                    <defs>
                      <linearGradient id="PSgrad_01" x1="64.279%" x2="0%" y1="76.604%" y2="0%">
                        <stop offset="0%" stopColor="rgb(1,230,248)" stopOpacity="1"/>
                        <stop offset="100%" stopColor="rgb(29,62,222)" stopOpacity="1"/>
                      </linearGradient>
                    </defs>
                    <path fillRule="evenodd" opacity="0.102" fill="url(#PSgrad_01)" d="M616.656,2.494 L89.351,98.948 C19.867,111.658 -16.508,176.639 7.408,240.130 L122.755,546.348 C141.761,596.806 203.597,623.407 259.843,609.597 L697.535,502.126 C748.221,489.680 783.967,441.432 777.751,392.742 L739.837,95.775 C732.096,35.145 677.715,-8.675 616.656,2.494 Z"/>
                  </svg>
                  <svg width="100%" viewBox="0 0 700 500">
                    <clipPath id="clip-path">
                      <path d="M89.479,0.180 L512.635,25.932 C568.395,29.326 603.115,76.927 590.357,129.078 L528.827,380.603 C518.688,422.048 472.661,448.814 427.190,443.300 L73.350,400.391 C32.374,395.422 -0.267,360.907 -0.002,322.064 L1.609,85.154 C1.938,36.786 40.481,-2.801 89.479,0.180 Z"></path>
                    </clipPath>
                    <image clipPath="url(#clip-path)" xlinkHref="/statics/ladies.png" width="100%" height="435" className="svg__image"></image>
                  </svg>
                </div>
              </div>
            </div>
            <div className="col-md-5" data-aos="fade-left">
              <h2> We build a movement of creative problem-solvers, innovative thinkers, and future tech leaders</h2>
              <p> We offer a comprehensive, hands-on tech training program that blends theoretical foundations with real-world applications in Software Engineering and Cybersecurity.</p>
              <p><small> Through mentorship, projects, and exposure, GISEC transforms curious minds into capable developers and security professionals.</small></p>
              <a href="https://bit.ly/gisecvolunteers" style={{ display: 'inline-flex', alignItems: 'center' }}>Volunteer <ChevronRight size={16} style={{ marginLeft: '4px' }} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses Section */}
      <div className="container-fluid" style={{ padding: '80px 0', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '50px' }} data-aos="fade-up">
            <span style={{
              background: 'rgba(29, 62, 222, 0.1)',
              color: '#1d3ede',
              padding: '6px 16px',
              borderRadius: '30px',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '15px'
            }}><Sparkles size={14} fill="#1d3ede" /> Popular Programs</span>
            <h2 style={{ fontFamily: 'Lato-Bold', color: '#1a1a2e', fontSize: '2.5rem', fontWeight: 700 }}>Featured Courses</h2>
            <p style={{ color: '#6b7280', fontSize: '1.05rem', maxWidth: '550px', margin: '10px auto 0' }}>
              Explore our most popular learning paths — designed to launch your global tech career.
            </p>
          </div>

          <div className="row" style={{ gap: '0' }}>
            {featuredCourses.map((course, idx) => (
              <div className="col-lg-4 col-md-6" key={course.id} data-aos="fade-up" data-aos-delay={idx * 100} style={{ marginBottom: '30px' }}>
                <Link href={`/courses/${course.id}`} style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(29, 62, 222, 0.06)',
                    border: '1px solid rgba(29, 62, 222, 0.06)',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                  }} className="cp-card">
                    
                    {/* Card Cover Image */}
                    <div style={{ height: '160px', background: '#e2e8f0', overflow: 'hidden', position: 'relative' }}>
                      <img 
                        src={course.image || '/images/courses/pm.png'} 
                        alt={course.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                      />
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: 'white', padding: '3px 10px', borderRadius: '20px',
                        fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px'
                      }}>
                        <Star size={11} fill="#ffffff" color="#ffffff" />
                        <span>Featured</span>
                      </div>
                    </div>

                    <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <span style={{
                          background: '#ecfdf5', color: '#047857',
                          padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600
                        }}>{course.price}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#6b7280' }}>
                          <Clock size={13} style={{ color: '#1d3ede' }} />
                          <span>{course.duration}</span>
                        </div>
                      </div>

                      <h3 style={{ fontFamily: 'Lato-Bold', fontSize: '1.35rem', color: '#1a1a2e', marginBottom: '12px', fontWeight: 700 }}>
                        {course.name}
                      </h3>

                      {/* Ratings */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>{course.rating || '4.5'}</span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({course.students || 40}+ enrolled)</span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                        {course.tools.slice(0, 3).map((tool, toolIdx) => (
                          <span key={toolIdx} style={{
                            background: '#f1f5f9', color: '#475569',
                            padding: '4px 10px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 500,
                            border: '1px solid rgba(0,0,0,0.03)'
                          }}>{tool}</span>
                        ))}
                        {course.tools.length > 3 && (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center' }}>+{course.tools.length - 3} more</span>
                        )}
                      </div>

                      {/* CTA button */}
                      <div style={{ marginTop: 'auto' }}>
                        <span style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #1d3ede 0%, #0a7ec0 100%)',
                          border: 'none', borderRadius: '10px', padding: '11px',
                          fontWeight: 700, color: '#fff',
                          boxShadow: '0 4px 12px rgba(29, 62, 222, 0.12)',
                          fontSize: '0.9rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}>
                          View Course Details <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: '30px' }} data-aos="fade-up">
            <Link href="/courses" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#1d3ede', fontWeight: 600, fontSize: '1rem',
              textDecoration: 'none', padding: '12px 30px',
              border: '2px solid #1d3ede', borderRadius: '30px',
              transition: 'all 0.3s ease'
            }}>
              View All 6 Courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Objective */}
      <div className="container-fluid gisec-features" id="objective">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <svg id="bg-services" width="100%" viewBox="0 0 1000 800">
                <defs>
                  <linearGradient id="PSgrad_02" x1="64.279%" x2="0%" y1="76.604%" y2="0%">
                    <stop offset="0%" stopColor="rgb(1,230,248)" stopOpacity="1"/>
                    <stop offset="100%" stopColor="rgb(29,62,222)" stopOpacity="1"/>
                  </linearGradient>
                </defs>
                <path fillRule="evenodd" opacity="0.102" fill="url(#PSgrad_02)" d="M801.878,3.146 L116.381,128.537 C26.052,145.060 -21.235,229.535 9.856,312.073 L159.806,710.157 C184.515,775.753 264.901,810.334 338.020,792.380 L907.021,652.668 C972.912,636.489 1019.383,573.766 1011.301,510.470 L962.013,124.412 C951.950,45.594 881.254,-11.373 801.878,3.146 Z"/>
              </svg>
              <div className="row">
                <div className="col">
                  <div className="coreValues" data-aos="fade-down">Core Values</div>
                  <div className="card text-center" data-aos="fade-up" data-aos-delay="100">
                    <div className="card-body">
                      <h3 className="card-title">Empowerment</h3>
                      <p className="card-text">We equip every girl to lead with knowledge and confidence.</p>
                    </div>
                  </div>
                  <div className="card text-center" data-aos="fade-up" data-aos-delay="200">
                    <div className="card-body">
                      <h3 className="card-title">Excellence</h3>
                      <p className="card-text">We pursue top-tier training and innovation.</p>
                    </div>
                  </div>
                </div>
                <div className="col">
                  <div className="card text-center" data-aos="fade-up" data-aos-delay="300">
                    <div className="card-body">
                      <h3 className="card-title">Integrity</h3>
                      <p className="card-text">We build trust through transparency and accountability.</p>
                    </div>
                  </div>
                  <div className="card text-center" data-aos="fade-up" data-aos-delay="400">
                    <div className="card-body">
                      <h3 className="card-title">Inclusivity</h3>
                      <p className="card-text">We create opportunities for all, regardless of background.</p>
                    </div>
                  </div>
                  <div className="card text-center" data-aos="fade-up" data-aos-delay="500">
                    <div className="card-body">
                      <h3 className="card-title">Impact</h3>
                      <p className="card-text">We measure success by lives transformed and futures shaped.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4" data-aos="fade-left">
              <h2>Our Objective</h2>
              <p>To empower girls and young women in Africa by providing access to high-demand tech skills, mentoring, and career pathways that enable them to thrive and compete in the global digital economy.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid gisec-banner-area">
        <div className="container">
          <div className="row" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="col-md-6" data-aos="fade-right">
              <h2>Mission</h2>
              <p>To bridge the gender gap in tech by cultivating a safe, inclusive, and transformative learning space that prepares African girls for impactful careers in Software Engineering and Cybersecurity</p>
              <h2>Vision</h2>
              <p>A world where girls are not just participants but leaders in the global tech revolution—writing the future, securely and confidently.</p>
              <h2>Enroll Now!</h2>
              <p>Terms and Condition Apply</p>
              <a href="https://bit.ly/gisectechenroll" style={{ display: 'inline-flex', alignItems: 'center' }}>Join the List <ChevronRight size={16} style={{ marginLeft: '4px' }} /></a>
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <div className="card"><img className="card-img-top img-fluid" style={{ borderRadius: '1rem' }} src="/statics/anu.jpg" alt="" /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Status */}
      <div className="container-fluid gisec-numbers-block">
        <div className="container">
          <svg width="100%" viewBox="0 0 1600 400">
            <defs>
              <linearGradient id="PSgrad_03" x1="80.279%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgb(1,230,248)" stopOpacity="1" />
                <stop offset="100%" stopColor="rgb(29,62,222)" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path fillRule="evenodd" fill="url(#PSgrad_03)" d="M98.891,386.002 L1527.942,380.805 C1581.806,380.610 1599.093,335.367 1570.005,284.353 L1480.254,126.948 C1458.704,89.153 1408.314,59.820 1366.025,57.550 L298.504,0.261 C238.784,-2.944 166.619,25.419 138.312,70.265 L16.944,262.546 C-24.214,327.750 12.103,386.317 98.891,386.002 Z"></path>
            <clipPath id="ctm" fill="none">
              <path d="M98.891,386.002 L1527.942,380.805 C1581.806,380.610 1599.093,335.367 1570.005,284.353 L1480.254,126.948 C1458.704,89.153 1408.314,59.820 1366.025,57.550 L298.504,0.261 C238.784,-2.944 166.619,25.419 138.312,70.265 L16.944,262.546 C-24.214,327.750 12.103,386.317 98.891,386.002 Z"></path>
            </clipPath>
            <image clipPath="url(#ctm)" xlinkHref="/images/word-map.png" height="800px" width="100%" className="svg__image"></image>
          </svg>
          <div className="row">
            <div className="col-3" data-aos="zoom-in" data-aos-delay="100">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">5</h5>
                  <p className="card-text">Completed Projects</p>
                </div>
              </div>
            </div>
            <div className="col-3" data-aos="zoom-in" data-aos-delay="200">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">1</h5>
                  <p className="card-text">Ongoing Projects</p>
                </div>
              </div>
            </div>
            <div className="col-3" data-aos="zoom-in" data-aos-delay="300">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">187</h5>
                  <p className="card-text">Total Participants</p>
                </div>
              </div>
            </div>
            <div className="col-3" data-aos="zoom-in" data-aos-delay="400">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">102</h5>
                  <p className="card-text">Certificates Issued</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="container-fluid gisec-testimonials" id="media" data-aos="fade-up">
        <div className="container">
          <h2>Media</h2>
          <style>{`
            .media-carousel-wrapper {
              position: relative !important;
              width: 100% !important;
              margin: 30px auto !important;
              padding: 0 40px !important;
            }
            .media-carousel-track {
              display: flex !important;
              flex-direction: row !important;
              overflow-x: auto !important;
              scroll-snap-type: x mandatory !important;
              scroll-behavior: smooth !important;
              -webkit-overflow-scrolling: touch !important;
              gap: 20px !important;
              padding: 20px 0 !important;
            }
            .media-carousel-track::-webkit-scrollbar {
              display: none !important;
            }
            .media-carousel-track {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }
            .media-carousel-item {
              flex: 0 0 100% !important;
              scroll-snap-align: start !important;
              transition: transform 0.3s ease !important;
            }
            @media (min-width: 768px) {
              .media-carousel-item {
                flex: 0 0 calc(50% - 10px) !important;
              }
            }
            @media (min-width: 992px) {
              .media-carousel-item {
                flex: 0 0 calc(33.333% - 13.33px) !important;
              }
            }
            .media-carousel-item .card {
              background: #fff !important;
              box-shadow: 0 10px 30px rgba(29, 62, 222, 0.06) !important;
              padding: 15px !important;
              border-radius: 24px !important;
              border: 1px solid rgba(29, 62, 222, 0.04) !important;
              height: auto !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: center !important;
            }
            .media-carousel-item .shortVid {
              width: 100% !important;
              height: 250px !important;
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              margin: 0 !important;
            }
            .media-carousel-item .iframeVid {
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              border-radius: 1rem !important;
              border: none !important;
              box-shadow: none !important;
            }
            .media-carousel-btn {
              position: absolute !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              background: #fff !important;
              border: 2px solid #1d3ede !important;
              color: #1d3ede !important;
              width: 45px !important;
              height: 45px !important;
              border-radius: 50% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              cursor: pointer !important;
              z-index: 10 !important;
              transition: all 0.3s ease !important;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
              padding: 0 !important;
            }
            .media-carousel-btn:hover {
              background: #1d3ede !important;
              color: #fff !important;
              box-shadow: 0 6px 20px rgba(29, 62, 222, 0.3) !important;
            }
            .media-carousel-btn.prev {
              left: -10px !important;
            }
            .media-carousel-btn.next {
              right: -10px !important;
            }
            @media (max-width: 576px) {
              .media-carousel-wrapper {
                padding: 0 10px !important;
              }
              .media-carousel-btn {
                display: none !important;
              }
            }
            .media-carousel-dots {
              display: flex !important;
              justify-content: center !important;
              gap: 8px !important;
              margin-top: 20px !important;
            }
            .media-carousel-dot {
              width: 10px !important;
              height: 10px !important;
              border-radius: 50% !important;
              border: 2px solid #01e6f8 !important;
              background: transparent !important;
              cursor: pointer !important;
              padding: 0 !important;
              transition: all 0.3s ease !important;
            }
            .media-carousel-dot.active {
              background: #01e6f8 !important;
              width: 12px !important;
              height: 12px !important;
            }
          `}</style>
          <div 
            className="media-carousel-wrapper"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
          >
            <button className="media-carousel-btn prev" onClick={() => scrollMedia('left')} aria-label="Previous Video">
              <ChevronLeft size={20} />
            </button>
            
            <div 
              className="media-carousel-track" 
              ref={scrollRef} 
              onScroll={handleMediaScroll}
            >
              {mediaVideos.map((vidId, index) => (
                <div key={vidId} className="media-carousel-item">
                  <div className="card text-center">
                    <div className="card-body shortVid">
                      <iframe 
                        className="iframeVid" 
                        src={`https://www.youtube.com/embed/${vidId}`} 
                        title={`Gisec Media Video ${index + 1}`} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="media-carousel-btn next" onClick={() => scrollMedia('right')} aria-label="Next Video">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="media-carousel-dots">
            {mediaVideos.map((_, index) => (
              <button
                key={index}
                className={`media-carousel-dot ${activeMediaIndex === index ? 'active' : ''}`}
                onClick={() => scrollToMediaIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-fluid gisec-features-list">
        <div className="container">
          <h2>What you can do with us</h2>
          <div className="row" style={{ justifyContent: 'center' }}>
            <div className="media col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="100">
              <div className="oval mr-4"><img className="align-self-start" src="/images/mentorship.png" alt="" /></div>
              <div className="media-body">
                <h5 className="mb-0">Sponsorship</h5>
                We welcome sponsorships with organizations and institutions that share our vision of empowering young girls in tech.
              </div>
            </div>
            <div className="media col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="oval mr-4"><img className="align-self-start" src="/images/sponsorship.png" alt="" /></div>
              <div className="media-body">
                <h5 className="mb-0">Partnership</h5>
                Your partnership helps us provide free, high-quality tech training to underserved girls.
              </div>
            </div>
            <div className="media col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="300">
              <div className="oval mr-4"><img className="align-self-start" src="/images/mentorship.png" alt="" /></div>
              <div className="media-body">
                <h5 className="mb-0">Collaboration</h5>
                GISEC thrives on meaningful collaborations with tech hubs, NGOs, and change-makers.
              </div>
            </div>
            <div className="media col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="400">
              <div className="oval mr-4"><img className="align-self-start" src="/images/mentorship.png" alt="" /></div>
              <div className="media-body">
                <h5 className="mb-0">Mentorship</h5>
                Mentors are the backbone of GISEC. Share your expertise and shape a girl&apos;s journey.
              </div>
            </div>
            <div className="media col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="500">
              <div className="oval mr-4"><img className="align-self-start" src="/images/opportunities.png" alt="" /></div>
              <div className="media-body">
                <h5 className="mb-0">Funding Opportunities</h5>
                We seek local and international funding to support our mission.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses CTA Section */}
      <div className="container-fluid" style={{ padding: '80px 0', background: '#f8fafc' }} id="courses" data-aos="fade-up">
        <div className="container text-center">
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ color: '#1a1a2e', fontWeight: 700, fontSize: '2.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><Rocket size={28} className="text-primary" /> Start Your Tech Journey</h2>
            <p style={{ color: '#6c757d', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '35px' }}>
              Empower yourself with high-demand professional training in Software Engineering, Cybersecurity, UI/UX Product Design, Data Analytics, and Project Management. Join our next cohort and learn from industry experts.
            </p>
            <Link href="/courses" className="btn btn-outline-dark text-uppercase" style={{ color: '#1d3ede', border: '3px solid #1d3ede', padding: '12px 35px', borderRadius: '30px', fontWeight: 600, fontSize: '1rem', transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              Explore Our Courses <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className="container-fluid gisec-logo-area">
        <div className="container">
          <div className="row" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="col-md-5" data-aos="fade-right">
              <h2>Sponsors and Partners</h2>
              <p>We collaborate with global tech companies, educational institutions, NGOs, and private sponsors committed to digital equity.</p> 
            </div>
            <a href="https://oviebrumefoundation.org/en/" className="col" data-aos="fade-up" data-aos-delay="100"><img src="/statics/ovie.jpg" rel="noreferrer" className="img-fluid" alt="" /></a>
            <a href="https://www.qnet.net/" className="col" data-aos="fade-up" data-aos-delay="200"><img src="/statics/spns.jpg" rel="noreferrer" className="img-fluid" alt="" /></a>
            <a href="https://transblueng.com/" target="_blank" rel="noreferrer" className="col" data-aos="fade-up" data-aos-delay="300"><img src="/statics/transblue.jpg" className="img-fluid" alt="" /></a>
            <a href="https://portal.uniabuja.edu.ng/" className="col" data-aos="fade-up" data-aos-delay="400"><img src="/statics/unab.jpg" rel="noreferrer" className="img-fluid" alt="" /></a>
            <a href="https://divineheritagehome.org/" className="col" data-aos="fade-up" data-aos-delay="500"><img src="/statics/devine.jpg" rel="noreferrer" className="img-fluid" alt="" /></a>
            <a href="https://reb360.co/" className="col" data-aos="fade-up" data-aos-delay="600"><img src="/statics/reb360.png" rel="noreferrer" className="img-fluid" alt="" /></a>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container-fluid gisec-news" id="faq" data-aos="fade-up">
        <div className="container">
          <h2>Do you have questions ?</h2>
          <div className="owl-carousel owl-carousel2 owl-theme">
            <div>
              <div className="card text-center"><img className="card-img-top" src="/statics/application.jpg" alt="" />
                <div className="card-body text-left pr-0 pl-0">
                  <h5>Who can apply?</h5>
                  <p className="card-text">Girls and young women aged 15–24 in Africa.</p>
                </div>
              </div>
            </div>
            <div>
              <div className="card text-center"><img className="card-img-top" src="/statics/apply.png" alt="" />
                <div className="card-body text-left pr-0 pl-0">
                  <h5>Is application free ?</h5>
                  <p className="card-text">Yes! Thanks to our sponsors and partners, training is tuition-free.</p>
                </div>
              </div>
            </div>
            <div>
              <div className="card text-center"><img className="card-img-top" src="/images/news3.jpg" alt="" />
                <div className="card-body text-left pr-0 pl-0">
                  <h5>How can i support ?</h5>
                  <p className="card-text">You can volunteer, sponsor, or become a partner.</p>
                  <a href="https://bit.ly/gisecinterestform" style={{ display: 'inline-flex', alignItems: 'center' }}>Click to partner <ChevronRight size={16} style={{ marginLeft: '4px' }} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="container-fluid gisec-feature" id="about-ceo">
        <div className="container">
          <div className="row">
            <div className="col-md-7" data-aos="fade-right">
              <div className="cover">
                <div className="card">
                  <svg className="back-bg" width="100%" viewBox="0 0 900 700" style={{ position: 'absolute', zIndex: -1 }}>
                    <defs>
                      <linearGradient id="PSgrad_01" x1="64.279%" x2="0%" y1="76.604%" y2="0%">
                        <stop offset="0%" stopColor="rgb(1,230,248)" stopOpacity="1"/>
                        <stop offset="100%" stopColor="rgb(29,62,222)" stopOpacity="1"/>
                      </linearGradient>
                    </defs>
                    <path fillRule="evenodd" opacity="0.102" fill="url(#PSgrad_01)" d="M616.656,2.494 L89.351,98.948 C19.867,111.658 -16.508,176.639 7.408,240.130 L122.755,546.348 C141.761,596.806 203.597,623.407 259.843,609.597 L697.535,502.126 C748.221,489.680 783.967,441.432 777.751,392.742 L739.837,95.775 C732.096,35.145 677.715,-8.675 616.656,2.494 Z"/>
                  </svg>
                  <svg width="100%" viewBox="0 0 700 500">
                    <clipPath id="clip-path-ceo">
                      <path d="M89.479,0.180 L512.635,25.932 C568.395,29.326 603.115,76.927 590.357,129.078 L528.827,380.603 C518.688,422.048 472.661,448.814 427.190,443.300 L73.350,400.391 C32.374,395.422 -0.267,360.907 -0.002,322.064 L1.609,85.154 C1.938,36.786 40.481,-2.801 89.479,0.180 Z"></path>
                    </clipPath>
                    <image clipPath="url(#clip-path-ceo)" xlinkHref="/statics/ceo.png" width="100%" height="425" className="svg__image"></image>
                  </svg>
                </div>
              </div>
            </div>
            <div className="col-md-5" data-aos="fade-left">
              <h2>Leadership, Global exposure, Certifications and scholarship opportunities</h2>
              <p>GISEC trainings empower students with in-demand tech skills through hands-on, real-world projects and expert mentorship.</p>
              <p><small>Participants gain leadership abilities, global exposure, and certifications that boost career and scholarship opportunities.</small></p>
              <a href="https://bit.ly/gisecinterestform" style={{ display: 'inline-flex', alignItems: 'center' }}>Partner <ChevronRight size={16} style={{ marginLeft: '4px' }} /></a>
            </div>
          </div>
        </div>
      </div>

      <footer className="container-fluid" id="gisec-footer" style={{ backgroundImage: '-webkit-linear-gradient(0deg, #0a7ec0 0%, #1d3ede 100%)' }}>
        <div className="container">
          <div className="row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="col-lg-4" id="contact">
              <h4 style={{ color: '#fff' }}>Contact Us</h4>
              <ul className="nav flex-column company-nav" style={{ color: '#e3e3e3' }}>
                <li className="nav-item">Address: Lagos, Nigeria</li>
                <li className="nav-item">Phone: <a href="tel:+2349077222871" style={{ color: '#e3e3e3' }}>Phone Line 1</a>, <a href="tel:+2348106412859" style={{ color: '#e3e3e3' }}>Phone Line 2</a></li>
                <li className="nav-item">Email: <a href="mailto:gisectechglobal@gmail.com" style={{ color: '#e3e3e3' }}>gisectechglobal@gmail.com</a></li>
              </ul>
              <h4 className="mt-5" style={{ color: '#fff' }}>Follow Us</h4>
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
                <div className="col-6">
                  <h4 style={{ color: '#fff' }}>Navigation</h4>
                  <ul className="nav flex-column company-nav" style={{ color: '#fff' }}>
                    <li className="nav-item"><Link style={{ color: '#fff' }} className="nav-link" href="/">Home</Link></li>
                    <li className="nav-item"><a style={{ color: '#fff' }} className="nav-link" href="#what-we-do">What we do</a></li>
                    <li className="nav-item"><a style={{ color: '#fff' }} className="nav-link" href="#objective">Objective</a></li>
                    <li className="nav-item"><a style={{ color: '#fff' }} className="nav-link" href="#media">Media</a></li>
                    <li className="nav-item"><a style={{ color: '#fff' }} className="nav-link" href="#courses">Courses</a></li>
                    <li className="nav-item"><a style={{ color: '#fff' }} className="nav-link" href="#faq">FAQ&apos;s</a></li>
                    <li className="nav-item"><a style={{ color: '#fff' }} className="nav-link" href="#contact">Contact</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
