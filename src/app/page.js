'use client';

import React from 'react';
import Link from 'next/link';

const courses = [
  { id: 1, name: "Project Management", duration: "12 weeks", price: "₦15,000", tools: ["Trello", "Jira", "Slack", "Asana"], weeks: ["Intro to Project Management", "Scrum Framework", "Tools & Documentation", "Risk Management"] },
  { id: 2, name: "Product Management", duration: "12 weeks", price: "₦15,000", tools: ["Miro", "Notion", "Amplitude"], weeks: ["Product Lifecycle", "Market Research", "Product Strategy", "Metrics & KPIs"] },
  { id: 3, name: "Product Design (UI/UX)", duration: "12 weeks", price: "₦15,000", tools: ["Figma", "Miro", "Adobe XD"], weeks: ["Design Principles", "User Research", "Wireframing", "Prototyping"] },
  { id: 4, name: "Data Analytics", duration: "12 weeks", price: "₦20,000", tools: ["Python", "Pandas", "SQL", "PowerBI"], weeks: ["Excel/Sheets", "SQL", "Python Basics", "Pandas"] },
  { id: 5, name: "Software Engineering", duration: "12 weeks", price: "₦25,000", tools: ["JavaScript", "Python", "React", "Django", "Git"], weeks: ["Git/GitHub", "HTML/CSS", "JavaScript", "Python"] },
  { id: 6, name: "Cybersecurity", duration: "12 weeks", price: "₦20,000", tools: ["Wireshark", "Kali Linux", "Nmap"], weeks: ["Networking", "Threat Landscape", "Cryptography", "Security Tools"] }
];

export default function Home() {
  const enrollInCourse = (courseId, courseName) => {
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
              <li className="nav-item"><a className="nav-link" href="#what-we-do">What We Do</a></li>
              <li className="nav-item"><a className="nav-link" href="#objective">Objective</a></li>
              <li className="nav-item"><a className="nav-link" href="#media">Media</a></li>
              <li className="nav-item"><a className="nav-link" href="#courses">Courses</a></li>
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
              <a href="#contact">Contact Us <i className="fa fa-angle-right" aria-hidden="true"></i></a>
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
                <div class="card">
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
              <a href="https://bit.ly/gisecvolunteers">Volunteer <i className="fa fa-angle-right" aria-hidden="true"></i></a>
            </div>
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
                      <h3 class="card-title">Excellence</h3>
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
              <a href="https://bit.ly/gisectechenroll">Join the List <i className="fa fa-angle-right" aria-hidden="true"></i></a>
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
          <div className="owl-carousel owl-carousel1 owl-theme">
            <div><div className="card text-center"><div className="card-body shortVid"><iframe style={{ borderRadius: '1rem' }} className="iframeVid" src="https://www.youtube.com/embed/eNOLvfLhzeY" title="Gisec Start 2025" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe></div></div></div>
            <div><div className="card text-center"><div className="card-body shortVid"><iframe style={{ borderRadius: '1rem' }} className="iframeVid" src="https://www.youtube.com/embed/wv9Up_fVafc" title="Gisec Start 2025" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe></div></div></div>
            <div><div className="card text-center"><div className="card-body shortVid"><iframe style={{ borderRadius: '1rem' }} className="iframeVid" src="https://www.youtube.com/embed/72HbChSzhho" title="Gisec Start 2025" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe></div></div></div>
            <div><div className="card text-center"><div className="card-body shortVid"><iframe style={{ borderRadius: '1rem' }} className="iframeVid" src="https://www.youtube.com/embed/EiBdwJNznEM" title="Gisec Start 2025" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe></div></div></div>
            <div><div className="card text-center"><div className="card-body shortVid"><iframe style={{ borderRadius: '1rem' }} className="iframeVid" src="https://www.youtube.com/embed/8gok1_q04eU" title="Gisec Start 2025" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe></div></div></div>
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

      {/* Courses */}
      <div className="container-fluid" style={{ padding: '70px 0', background: '#f8fafc' }} id="courses" data-aos="fade-up">
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ color: '#1a1a2e', fontWeight: 700, fontSize: '2.2rem' }}>📚 Our Courses</h2>
            <p style={{ color: '#6c757d', fontSize: '1rem', maxWidth: '600px', margin: '15px auto 0' }}>Choose your path and start your journey in tech today</p>
          </div>
          <div className="row" id="coursesRow">
            {courses.map((course, i) => (
              <div key={course.id} className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={(i % 3) * 150}>
                <div className="course-card">
                  <div className="course-header">
                    <h3>{course.name}</h3>
                    <div className="course-price">{course.price}</div>
                  </div>
                  <div className="course-body">
                    <div className="course-duration">⏱️ {course.duration}</div>
                    <div className="course-tools">
                      <strong>🛠️ Tools You&apos;ll Learn</strong>
                      <div>
                        {course.tools.map((tool, idx) => (
                          <span key={idx} className="tool-badge">{tool}</span>
                        ))}
                      </div>
                    </div>
                    <div className="course-weeks">
                      <strong>📖 First 4 Weeks</strong>
                      <ul>
                        {course.weeks.map((week, idx) => (
                          <li key={idx}>{week}</li>
                        ))}
                      </ul>
                    </div>
                    <button className="btn-gisek-enroll" onClick={() => enrollInCourse(course.id, course.name)}>Enroll Now →</button>
                  </div>
                </div>
              </div>
            ))}
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
                  <p class="card-text">Yes! Thanks to our sponsors and partners, training is tuition-free.</p>
                </div>
              </div>
            </div>
            <div>
              <div className="card text-center"><img className="card-img-top" src="/images/news3.jpg" alt="" />
                <div className="card-body text-left pr-0 pl-0">
                  <h5>How can i support ?</h5>
                  <p className="card-text">You can volunteer, sponsor, or become a partner.</p>
                  <a href="https://bit.ly/gisecinterestform">Click to partner <i className="fa fa-angle-right" aria-hidden="true"></i></a>
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
              <a href="https://bit.ly/gisecinterestform">Partner <i className="fa fa-angle-right" aria-hidden="true"></i></a>
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
              <ul className="nav follow-us-nav" style={{ color: '#fff' }}>
                <li className="nav-item"><a style={{ color: '#e3e3e3' }} className="nav-link pl-0" href="https://linktr.ee/gisectechg"><i className="fa fa-globe" aria-hidden="true"></i></a></li>
                <li className="nav-item"><a style={{ color: '#e3e3e3' }} className="nav-link" href="https://www.instagram.com/gisectechnologies"><i className="fa fa-instagram" aria-hidden="true"></i></a></li>
                <li className="nav-item"><a style={{ color: '#e3e3e3' }} className="nav-link" href="mailto:gisectechglobal@gmail.com"><i className="fa fa-envelope" aria-hidden="true"></i></a></li>
                <li className="nav-item"><a style={{ color: '#e3e3e3' }} className="nav-link" href="https://www.linkedin.com/company/gisec-technologies-limited"><i className="fa fa-linkedin" aria-hidden="true"></i></a></li>
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
