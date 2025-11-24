// import React, { useState, useEffect } from 'react';
// import { Search, Sparkles, Zap, Shield } from 'lucide-react';

// const LandingPage = ({ onSignIn, darkMode }) => {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [hoveredFeature, setHoveredFeature] = useState(null);
//   const [searchText, setSearchText] = useState('');
//   const [isTyping, setIsTyping] = useState(true);

//   const searchExamples = [
//     'Find email from John...',
//     'Search presentation slides...',
//     'Locate budget spreadsheet...',
//     'Find vacation photos...'
//   ];

//   useEffect(() => {
//     let currentIndex = 0;
//     let currentChar = 0;
//     let isDeleting = false;
//     let timeout;

//     const type = () => {
//       const currentExample = searchExamples[currentIndex];
      
//       if (!isDeleting && currentChar <= currentExample.length) {
//         setSearchText(currentExample.slice(0, currentChar));
//         currentChar++;
//         timeout = setTimeout(type, 100);
//       } else if (!isDeleting && currentChar > currentExample.length) {
//         timeout = setTimeout(() => {
//           isDeleting = true;
//           type();
//         }, 2000);
//       } else if (isDeleting && currentChar >= 0) {
//         setSearchText(currentExample.slice(0, currentChar));
//         currentChar--;
//         timeout = setTimeout(type, 50);
//       } else if (isDeleting && currentChar < 0) {
//         isDeleting = false;
//         currentIndex = (currentIndex + 1) % searchExamples.length;
//         currentChar = 0;
//         timeout = setTimeout(type, 500);
//       }
//     };

//     if (isTyping) {
//       type();
//     }

//     return () => clearTimeout(timeout);
//   }, [isTyping]);

//   useEffect(() => {
//     const handleMouseMove = (e) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   const features = [
//     {
//       icon: '✉️',
//       title: 'Gmail',
//       description: 'Search through your emails and find messages instantly',
//       color: '#EA4335',
//       stat: '10K+ emails'
//     },
//     {
//       icon: '📄',
//       title: 'Google Drive',
//       description: 'Find documents, spreadsheets, and presentations',
//       color: '#4285F4',
//       stat: '5K+ files'
//     },
//     {
//       icon: '📁',
//       title: 'Local Files',
//       description: 'Search your computer files and documents',
//       color: '#6B7280',
//       stat: 'Unlimited'
//     },
//     {
//       icon: '🔖',
//       title: 'Bookmarks',
//       description: 'Find your saved bookmarks across all browsers',
//       color: '#F59E0B',
//       stat: '500+ links'
//     }
//   ];

//   const stats = [
//     { value: '10M+', label: 'Searches' },
//     { value: '50K+', label: 'Users' },
//     { value: '99.9%', label: 'Uptime' },
//     { value: '<0.5s', label: 'Speed' }
//   ];

//   return (
//     <div
//       style={{
//         minHeight: '100vh',
//         backgroundColor: darkMode ? '#0a0a0a' : '#fafafa',
//         fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//         position: 'relative',
//         overflow: 'hidden',
//       }}
//     >
//       {/* Animated Background Gradient */}
//       <div
//         style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           background: darkMode 
//             ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(102, 126, 234, 0.15) 0%, transparent 50%)`
//             : `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(102, 126, 234, 0.08) 0%, transparent 50%)`,
//           pointerEvents: 'none',
//           transition: 'background 0.3s ease',
//         }}
//       />

//       {/* Floating Particles */}
//       {[...Array(20)].map((_, i) => (
//         <div
//           key={i}
//           style={{
//             position: 'absolute',
//             width: Math.random() * 4 + 2 + 'px',
//             height: Math.random() * 4 + 2 + 'px',
//             borderRadius: '50%',
//             backgroundColor: darkMode ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)',
//             top: Math.random() * 100 + '%',
//             left: Math.random() * 100 + '%',
//             animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
//             pointerEvents: 'none',
//           }}
//         />
//       ))}

//       <style>{`
//         @keyframes float {
//           0%, 100% { transform: translateY(0px) translateX(0px); }
//           25% { transform: translateY(-20px) translateX(10px); }
//           50% { transform: translateY(-10px) translateX(-10px); }
//           75% { transform: translateY(-30px) translateX(5px); }
//         }
//         @keyframes pulse {
//           0%, 100% { transform: scale(1); }
//           50% { transform: scale(1.05); }
//         }
//         @keyframes slideUp {
//           from { opacity: 0; transform: translateY(30px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .slide-up { animation: slideUp 0.6s ease-out forwards; }
//       `}</style>

//       <div style={{ position: 'relative', zIndex: 1 }}>
//         {/* Header */}
//         <header
//           style={{
//             padding: '24px 40px',
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             maxWidth: '1200px',
//             margin: '0 auto',
//             backdropFilter: 'blur(10px)',
//             background: darkMode ? 'rgba(26, 26, 26, 0.5)' : 'rgba(255, 255, 255, 0.5)',
//             borderRadius: '20px',
//             marginTop: '20px',
//             border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
//           }}
//         >
//           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//             <div
//               style={{
//                 width: '40px',
//                 height: '40px',
//                 borderRadius: '12px',
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
//               }}
//             >
//               <Sparkles size={20} color="white" />
//             </div>
//             <span
//               style={{
//                 fontSize: '28px',
//                 fontWeight: '700',
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 WebkitBackgroundClip: 'text',
//                 WebkitTextFillColor: 'transparent',
//                 backgroundClip: 'text',
//               }}
//             >
//               Quark
//             </span>
//           </div>

//           <button
//             onClick={onSignIn}
//             style={{
//               padding: '12px 28px',
//               borderRadius: '12px',
//               border: 'none',
//               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//               color: 'white',
//               fontSize: '15px',
//               fontWeight: '600',
//               cursor: 'pointer',
//               transition: 'all 0.3s ease',
//               boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
//             }}
//             onMouseEnter={(e) => {
//               e.target.style.transform = 'translateY(-2px)';
//               e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
//             }}
//             onMouseLeave={(e) => {
//               e.target.style.transform = 'translateY(0)';
//               e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
//             }}
//           >
//             Sign In
//           </button>
//         </header>

//         {/* Hero Section */}
//         <section
//           style={{
//             maxWidth: '900px',
//             margin: '100px auto 60px',
//             textAlign: 'center',
//             padding: '0 20px',
//           }}
//         >
//           <div
//             style={{
//               width: '140px',
//               height: '140px',
//               margin: '0 auto 40px',
//               borderRadius: '35px',
//               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               boxShadow: '0 25px 70px rgba(102, 126, 234, 0.4)',
//               animation: 'pulse 3s infinite',
//               position: 'relative',
//             }}
//           >
//             <Search size={70} color="white" strokeWidth={2.5} />
//             <div
//               style={{
//                 position: 'absolute',
//                 width: '100%',
//                 height: '100%',
//                 borderRadius: '35px',
//                 border: '3px solid rgba(102, 126, 234, 0.3)',
//                 animation: 'pulse 3s infinite',
//               }}
//             />
//           </div>

//           <h1
//             style={{
//               fontSize: '64px',
//               fontWeight: '800',
//               color: darkMode ? '#fff' : '#1a1a1a',
//               margin: '0 0 20px',
//               lineHeight: '1.1',
//               letterSpacing: '-0.02em',
//             }}
//           >
//             Search Everything,
//             <br />
//             <span
//               style={{
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 WebkitBackgroundClip: 'text',
//                 WebkitTextFillColor: 'transparent',
//                 backgroundClip: 'text',
//               }}
//             >
//               Find Anything
//             </span>
//           </h1>

//           <p
//             style={{
//               fontSize: '22px',
//               color: darkMode ? '#b0b0b0' : '#666',
//               margin: '0 0 50px',
//               lineHeight: '1.6',
//               maxWidth: '600px',
//               marginLeft: 'auto',
//               marginRight: 'auto',
//             }}
//           >
//             One powerful search box for all your apps, files, and memories
//           </p>

//           {/* Interactive Search Demo */}
//           <div
//             style={{
//               maxWidth: '600px',
//               margin: '0 auto 40px',
//               position: 'relative',
//             }}
//           >
//             <div
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '12px',
//                 padding: '20px 24px',
//                 borderRadius: '16px',
//                 background: darkMode ? 'rgba(42, 42, 42, 0.8)' : 'white',
//                 border: `2px solid ${darkMode ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`,
//                 boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
//                 backdropFilter: 'blur(10px)',
//               }}
//             >
//               <Search size={24} color={darkMode ? '#667eea' : '#764ba2'} />
//               <input
//                 type="text"
//                 value={searchText}
//                 readOnly
//                 placeholder="Try searching..."
//                 style={{
//                   flex: 1,
//                   border: 'none',
//                   outline: 'none',
//                   fontSize: '18px',
//                   background: 'transparent',
//                   color: darkMode ? '#fff' : '#1a1a1a',
//                   fontFamily: 'inherit',
//                 }}
//               />
//               <div
//                 style={{
//                   width: '2px',
//                   height: '24px',
//                   background: '#667eea',
//                   animation: 'blink 1s infinite',
//                 }}
//               />
//             </div>
//             <style>{`
//               @keyframes blink {
//                 0%, 50% { opacity: 1; }
//                 51%, 100% { opacity: 0; }
//               }
//             `}</style>
//           </div>

//           <button
//             onClick={onSignIn}
//             style={{
//               padding: '18px 56px',
//               borderRadius: '16px',
//               border: 'none',
//               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//               color: 'white',
//               fontSize: '18px',
//               fontWeight: '600',
//               cursor: 'pointer',
//               transition: 'all 0.3s ease',
//               boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
//               display: 'inline-flex',
//               alignItems: 'center',
//               gap: '10px',
//             }}
//             onMouseEnter={(e) => {
//               e.target.style.transform = 'translateY(-4px)';
//               e.target.style.boxShadow = '0 15px 45px rgba(102, 126, 234, 0.5)';
//             }}
//             onMouseLeave={(e) => {
//               e.target.style.transform = 'translateY(0)';
//               e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
//             }}
//           >
//             <Zap size={20} />
//             Get Started Free
//           </button>

//           {/* Trust Badges */}
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               gap: '30px',
//               marginTop: '40px',
//               flexWrap: 'wrap',
//             }}
//           >
//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//               <Shield size={20} color={darkMode ? '#667eea' : '#764ba2'} />
//               <span style={{ fontSize: '14px', color: darkMode ? '#b0b0b0' : '#666' }}>
//                 Bank-level encryption
//               </span>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//               <Sparkles size={20} color={darkMode ? '#667eea' : '#764ba2'} />
//               <span style={{ fontSize: '14px', color: darkMode ? '#b0b0b0' : '#666' }}>
//                 AI-powered search
//               </span>
//             </div>
//           </div>
//         </section>

//         {/* Stats Section */}
//         <section
//           style={{
//             maxWidth: '1000px',
//             margin: '80px auto',
//             padding: '0 20px',
//           }}
//         >
//           <div
//             style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//               gap: '30px',
//               background: darkMode ? 'rgba(42, 42, 42, 0.5)' : 'rgba(255, 255, 255, 0.8)',
//               padding: '50px 40px',
//               borderRadius: '24px',
//               border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
//               backdropFilter: 'blur(10px)',
//             }}
//           >
//             {stats.map((stat, index) => (
//               <div
//                 key={index}
//                 style={{
//                   textAlign: 'center',
//                 }}
//               >
//                 <div
//                   style={{
//                     fontSize: '48px',
//                     fontWeight: '800',
//                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                     WebkitBackgroundClip: 'text',
//                     WebkitTextFillColor: 'transparent',
//                     backgroundClip: 'text',
//                     marginBottom: '8px',
//                   }}
//                 >
//                   {stat.value}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: '16px',
//                     color: darkMode ? '#a0a0a0' : '#666',
//                     fontWeight: '500',
//                   }}
//                 >
//                   {stat.label}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Features Section */}
//         <section
//           style={{
//             maxWidth: '1100px',
//             margin: '120px auto 80px',
//             padding: '0 20px',
//           }}
//         >
//           <h2
//             style={{
//               fontSize: '42px',
//               fontWeight: '800',
//               textAlign: 'center',
//               color: darkMode ? '#fff' : '#1a1a1a',
//               marginBottom: '60px',
//             }}
//           >
//             Search Across All Your
//             <span
//               style={{
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 WebkitBackgroundClip: 'text',
//                 WebkitTextFillColor: 'transparent',
//                 backgroundClip: 'text',
//               }}
//             >
//               {' '}Favorite Apps
//             </span>
//           </h2>

//           <div
//             style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
//               gap: '30px',
//             }}
//           >
//             {features.map((feature, index) => (
//               <div
//                 key={index}
//                 onMouseEnter={() => setHoveredFeature(index)}
//                 onMouseLeave={() => setHoveredFeature(null)}
//                 style={{
//                   backgroundColor: darkMode ? 'rgba(42, 42, 42, 0.6)' : 'white',
//                   padding: '40px 28px',
//                   borderRadius: '24px',
//                   textAlign: 'center',
//                   border: hoveredFeature === index
//                     ? `2px solid ${feature.color}`
//                     : `2px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f0f0f0'}`,
//                   transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//                   cursor: 'pointer',
//                   transform: hoveredFeature === index ? 'translateY(-12px) scale(1.02)' : 'translateY(0)',
//                   boxShadow: hoveredFeature === index
//                     ? `0 25px 50px ${feature.color}30`
//                     : 'none',
//                   backdropFilter: 'blur(10px)',
//                   position: 'relative',
//                   overflow: 'hidden',
//                 }}
//               >
//                 <div
//                   style={{
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     height: '4px',
//                     background: `linear-gradient(90deg, ${feature.color}, transparent)`,
//                     opacity: hoveredFeature === index ? 1 : 0,
//                     transition: 'opacity 0.3s ease',
//                   }}
//                 />
//                 <div
//                   style={{
//                     fontSize: '56px',
//                     marginBottom: '20px',
//                     transform: hoveredFeature === index ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
//                     transition: 'transform 0.3s ease',
//                   }}
//                 >
//                   {feature.icon}
//                 </div>
//                 <h3
//                   style={{
//                     fontSize: '22px',
//                     fontWeight: '700',
//                     color: darkMode ? '#fff' : '#1a1a1a',
//                     margin: '0 0 12px',
//                   }}
//                 >
//                   {feature.title}
//                 </h3>
//                 <p
//                   style={{
//                     fontSize: '15px',
//                     color: darkMode ? '#a0a0a0' : '#666',
//                     margin: '0 0 16px',
//                     lineHeight: '1.6',
//                   }}
//                 >
//                   {feature.description}
//                 </p>
//                 <div
//                   style={{
//                     display: 'inline-block',
//                     padding: '6px 14px',
//                     borderRadius: '20px',
//                     background: `${feature.color}15`,
//                     color: feature.color,
//                     fontSize: '13px',
//                     fontWeight: '600',
//                   }}
//                 >
//                   {feature.stat}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Footer CTA */}
//         <section
//           style={{
//             textAlign: 'center',
//             padding: '100px 20px 100px',
//             maxWidth: '800px',
//             margin: '0 auto',
//           }}
//         >
//           <div
//             style={{
//               background: darkMode 
//                 ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
//                 : 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
//               padding: '60px 40px',
//               borderRadius: '32px',
//               border: `2px solid ${darkMode ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.15)'}`,
//               backdropFilter: 'blur(10px)',
//             }}
//           >
//             <h2
//               style={{
//                 fontSize: '42px',
//                 fontWeight: '800',
//                 color: darkMode ? '#fff' : '#1a1a1a',
//                 margin: '0 0 16px',
//                 lineHeight: '1.2',
//               }}
//             >
//               Ready to search smarter?
//             </h2>
//             <p
//               style={{
//                 fontSize: '20px',
//                 color: darkMode ? '#b0b0b0' : '#666',
//                 margin: '0 0 40px',
//                 lineHeight: '1.6',
//               }}
//             >
//               Join thousands of users finding what they need, instantly
//             </p>
//             <button
//               onClick={onSignIn}
//               style={{
//                 padding: '16px 48px',
//                 borderRadius: '14px',
//                 border: `2px solid ${darkMode ? '#fff' : '#1a1a1a'}`,
//                 background: 'transparent',
//                 color: darkMode ? '#fff' : '#1a1a1a',
//                 fontSize: '17px',
//                 fontWeight: '600',
//                 cursor: 'pointer',
//                 transition: 'all 0.3s ease',
//               }}
//               onMouseEnter={(e) => {
//                 e.target.style.background = darkMode ? '#fff' : '#1a1a1a';
//                 e.target.style.color = darkMode ? '#1a1a1a' : '#fff';
//                 e.target.style.transform = 'translateY(-3px)';
//                 e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.background = 'transparent';
//                 e.target.style.color = darkMode ? '#fff' : '#1a1a1a';
//                 e.target.style.transform = 'translateY(0)';
//                 e.target.style.boxShadow = 'none';
//               }}
//             >
//               Sign In Now →
//             </button>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default LandingPage;

/////////////////////////////


import React, { useState, useEffect, useMemo } from 'react';
import { Search, Sparkles, Zap, Shield, Sun, Moon, Rocket, ArrowRight, Star, Lock, Gauge } from 'lucide-react';

export default function LandingPage({ onSignIn }) {
  const [darkMode, setDarkMode] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    }
  };

  const searchExamples = [
    'Find email from John about Q4...',
    'That presentation with the purple slides...',
    'Budget spreadsheet 2025...',
    'Vacation photos from Iceland...',
    'Meeting notes with Sarah last week...'
  ];

  const particles = useMemo(() => [...Array(30)].map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: i * 0.15,
    duration: Math.random() * 20 + 15
  })), []);

  useEffect(() => {
    let currentIndex = 0;
    let currentChar = 0;
    let isDeleting = false;
    let timeoutId;

    const typeText = () => {
      const currentText = searchExamples[currentIndex];

      if (!isDeleting) {
        if (currentChar <= currentText.length) {
          setSearchText(currentText.slice(0, currentChar));
          currentChar++;
          timeoutId = setTimeout(typeText, 100);
        } else {
          timeoutId = setTimeout(() => {
            isDeleting = true;
            typeText();
          }, 2000);
        }
      } else {
        if (currentChar >= 0) {
          setSearchText(currentText.slice(0, currentChar));
          currentChar--;
          timeoutId = setTimeout(typeText, 50);
        } else {
          isDeleting = false;
          currentIndex = (currentIndex + 1) % searchExamples.length;
          currentChar = 0;
          timeoutId = setTimeout(typeText, 500);
        }
      }
    };

    timeoutId = setTimeout(typeText, 1000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    const handleMouse = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const features = [
    { icon: '✉️', title: 'Gmail', desc: 'Emails, threads, attachments — gone in 0.2s', color: '#EA4335', stat: '10K+' },
    { icon: '📄', title: 'Google Drive', desc: 'Docs, sheets, slides, even that meme folder', color: '#4285F4', stat: '5K+' },
    { icon: '🖥️', title: 'Local Files', desc: 'Your entire computer, no indexing delays', color: '#10B981', stat: 'Unlimited' },
    { icon: '🔖', title: 'Bookmarks', desc: 'Chrome, Safari, Arc — all in one place', color: '#F59E0B', stat: '1.2K+' },
  ];

  const stats = [
    { value: '10M+', label: 'Searches Performed', icon: Search },
    { value: '50K+', label: 'Happy Users', icon: Star },
    { value: '99.99%', label: 'Uptime', icon: Shield },
    { value: '<0.4s', label: 'Avg Response', icon: Gauge },
  ];

  const benefits = [
    { icon: Shield, text: 'End-to-end encrypted', color: '#8b5cf6' },
    { icon: Zap, text: 'Lightning fast', color: '#f59e0b' },
    { icon: Lock, text: 'Privacy first', color: '#10b981' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: darkMode ? '#000000' : '#ffffff',
        color: darkMode ? '#ffffff' : '#0f172a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1), color 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.15;
          }
          33% { 
            transform: translate(30px, -30px) scale(1.1); 
            opacity: 0.25;
          }
          66% { 
            transform: translate(-20px, 20px) scale(0.9); 
            opacity: 0.2;
          }
        }
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.03);
            opacity: 0.95;
          }
        }
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes cursorBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .gradient-border {
          position: relative;
          background: ${darkMode ? 'rgba(15, 15, 15, 0.6)' : 'rgba(255, 255, 255, 0.9)'};
          border: 1px solid ${darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'};
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3), rgba(139, 92, 246, 0.3));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .gradient-border:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Ambient Background Gradient */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: darkMode 
            ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
            : `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.08) 0%, transparent 50%)`,
          pointerEvents: 'none',
          transition: 'opacity 0.8s ease',
          zIndex: 0,
        }}
      />

      {/* Elegant Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: darkMode 
              ? `radial-gradient(circle, rgba(139, 92, 246, 0.8), rgba(139, 92, 246, 0.2))`
              : `radial-gradient(circle, rgba(139, 92, 246, 0.6), rgba(139, 92, 246, 0.1))`,
            top: p.top,
            left: p.left,
            animation: `float ${p.duration}s infinite ease-in-out`,
            animationDelay: `${p.delay}s`,
            pointerEvents: 'none',
            zIndex: 0,
            filter: 'blur(1px)',
          }}
        />
      ))}

      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 50,
          padding: '12px',
          borderRadius: '12px',
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
        }}
      >
        {darkMode ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#6366f1" />}
      </button>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 32px',
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
              }}
            >
             <Sparkles size={22} color="white" strokeWidth={2.5} /> 
            </div> */}
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Quark
            </h1>
          </div>
          <button
            onClick={handleSignIn}
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '600',
              fontSize: '15px',
              color: 'white',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
          >
            Sign In
          </button>
        </header>

        {/* Hero Section */}
        <section
          style={{
            maxWidth: '1100px',
            margin: '80px auto 0',
            textAlign: 'center',
            padding: '0 32px',
          }}
        >
          {/* Logo with refined animation */}
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              marginBottom: '48px',
            }}
          >
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '28px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: darkMode 
                  ? '0 20px 60px rgba(139, 92, 246, 0.4), 0 0 80px rgba(139, 92, 246, 0.2)'
                  : '0 20px 60px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.15)',
                animation: 'pulse 4s ease-in-out infinite',
              }}
            >
              <Search size={60} color="white" strokeWidth={2.5} />
            </div>
            {/* Orbiting rings */}
            <div
              style={{
                position: 'absolute',
                inset: '-12px',
                borderRadius: '32px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                animation: 'pulse 4s ease-in-out infinite',
                animationDelay: '0.5s',
              }}
            />
          </div>

          <h1
            style={{
              fontSize: '72px',
              fontWeight: '700',
              lineHeight: '1.1',
              letterSpacing: '-0.03em',
              marginBottom: '24px',
            }}
          >
            Search Everything,<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Find Anything
            </span>
          </h1>

          <p
            style={{
              fontSize: '20px',
              color: darkMode ? '#94a3b8' : '#64748b',
              maxWidth: '600px',
              margin: '0 auto 56px',
              lineHeight: '1.6',
              fontWeight: '400',
            }}
          >
            One search bar for your emails, files, bookmarks, and memories — powered by AI magic.
          </p>

          {/* Enhanced Search Bar */}
          <div style={{ maxWidth: '680px', margin: '0 auto 48px' }}>
            <div
              className="gradient-border"
              onMouseEnter={() => setIsSearchFocused(true)}
              onMouseLeave={() => setIsSearchFocused(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px 28px',
                borderRadius: '16px',
                backdropFilter: 'blur(20px)',
                boxShadow: isSearchFocused
                  ? darkMode
                    ? '0 20px 60px rgba(139, 92, 246, 0.25), 0 0 80px rgba(139, 92, 246, 0.15)'
                    : '0 20px 60px rgba(139, 92, 246, 0.2), 0 0 60px rgba(139, 92, 246, 0.1)'
                  : darkMode
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                    : '0 8px 32px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSearchFocused ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
              }}
            >
              <Search 
                size={24} 
                color="#8b5cf6" 
                style={{
                  transition: 'transform 0.3s ease',
                  transform: isSearchFocused ? 'rotate(15deg) scale(1.1)' : 'rotate(0) scale(1)',
                }}
              />
              <input
                type="text"
                readOnly
                value={searchText}
                placeholder="Start typing to search..."
                style={{
                  flex: 1,
                  fontSize: '18px',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  border: 'none',
                  color: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: '400',
                }}
              />
              <div
                style={{
                  width: '2px',
                  height: '24px',
                  backgroundColor: '#8b5cf6',
                  animation: 'cursorBlink 1.2s infinite',
                  borderRadius: '2px',
                }}
              />
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSignIn}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '18px 40px',
              borderRadius: '12px',
              fontSize: '17px',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
              marginBottom: '40px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(139, 92, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.4)';
            }}
          >
            Get Started Free
            <ArrowRight size={20} />
          </button>

          {/* Benefits badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                >
                  <Icon size={16} color={benefit.color} />
                  <span>{benefit.text}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ maxWidth: '1200px', margin: '120px auto 0', padding: '0 32px' }}>
          <div
            className="gradient-border"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '40px',
              padding: '56px 48px',
              borderRadius: '24px',
              backdropFilter: 'blur(20px)',
            }}
          >
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <Icon 
                    size={32} 
                    color="#8b5cf6" 
                    style={{ marginBottom: '16px', opacity: 0.8 }}
                  />
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      marginBottom: '8px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      color: darkMode ? '#94a3b8' : '#64748b',
                      fontSize: '15px',
                      fontWeight: '500',
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section style={{ maxWidth: '1300px', margin: '140px auto 0', padding: '0 32px' }}>
          <h2
            style={{
              fontSize: '48px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '72px',
              letterSpacing: '-0.02em',
            }}
          >
            One Search to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Rule Them All
            </span>
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                className="gradient-border"
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  padding: '32px',
                  borderRadius: '20px',
                  backdropFilter: 'blur(20px)',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: hoveredFeature === i ? 'translateY(-8px)' : 'translateY(0)',
                  boxShadow: hoveredFeature === i 
                    ? `0 20px 60px ${f.color}40`
                    : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: '56px',
                    marginBottom: '20px',
                    transition: 'transform 0.3s ease',
                    transform: hoveredFeature === i ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    color: darkMode ? '#94a3b8' : '#64748b',
                    lineHeight: '1.6',
                    fontSize: '15px',
                    marginBottom: '20px',
                  }}
                >
                  {f.desc}
                </p>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    background: `${f.color}15`,
                    color: f.color,
                  }}
                >
                  {f.stat} items
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ margin: '160px auto 80px', textAlign: 'center', padding: '0 32px' }}>
          <div
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '64px 48px',
              borderRadius: '28px',
              background: darkMode
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
              border: `1px solid ${darkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <Rocket 
              size={48} 
              color="#8b5cf6" 
              style={{ marginBottom: '24px' }}
            />
            <h2
              style={{
                fontSize: '42px',
                fontWeight: '700',
                marginBottom: '20px',
                lineHeight: '1.2',
                letterSpacing: '-0.02em',
              }}
            >
              Stop searching.<br />
              Start{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                finding
              </span>
              .
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: darkMode ? '#94a3b8' : '#64748b',
                marginBottom: '36px',
                lineHeight: '1.6',
              }}
            >
              Join 50,000+ people who never lose anything again.
            </p>
            <button
              onClick={handleSignIn}
              style={{
                padding: '16px 48px',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: '600',
                backgroundColor: darkMode ? '#ffffff' : '#0f172a',
                color: darkMode ? '#0f172a' : '#ffffff',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
              }}
            >
              Get Started — It's Free →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}