import './globals.css';
import Script from 'next/script';
import AosInit from './AosInit';

export const metadata = {
  title: 'GISEC - Girls in Software Engineering and Cybersecurity',
  description: 'GISEC combines tech skills with mentorship, leadership development, and real-world problem-solving to produce industry-ready female tech leaders.',
  keywords: 'Tech, Girls, Software, Computer, Science, Cybersecurity',
  authors: [{ name: 'Williams Godwin' }],
};

export const viewport = {
  themeColor: '#1d3ede',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Favicons */}
        <link rel="apple-touch-icon" href="/statics/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/statics/favicon.ico" />
        <link href="/statics/favicon.ico" rel="icon" />

        {/* Global Stylesheets */}
        <link href="/css/font-awesome.css" rel="stylesheet" type="text/css" />
        <link rel="stylesheet" href="/owl-carousel/assets/owl.carousel.min.css" type="text/css" />
        <link rel="stylesheet" href="/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/style.css" />
        <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
      </head>
      <body>
        <AosInit />
        {children}

        {/* Client Scripts */}
        <Script src="/js/jquery-3.3.1.slim.min.js" strategy="beforeInteractive" />
        <Script src="/js/popper.min.js" strategy="beforeInteractive" />
        <Script src="/js/bootstrap.min.js" strategy="beforeInteractive" />
        <Script src="/owl-carousel/owl.carousel.min.js" strategy="afterInteractive" />
        <Script src="/js/main.js" strategy="afterInteractive" />
        <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
