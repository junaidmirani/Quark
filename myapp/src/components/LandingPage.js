// src/components/LandingPage.js
import React from 'react';
import { Search } from 'lucide-react';
import Logo from "./logo";

const LandingPage = ({ onSignIn, darkMode }) => {
  const features = [
    {
      icon: '✉️',
      title: 'Gmail',
      description: 'Search through your emails and find messages instantly',
      color: '#EA4335'
    },
    {
      icon: '📄',
      title: 'Google Drive',
      description: 'Find documents, spreadsheets, and presentations',
      color: '#4285F4'
    },
    {
      icon: '📁',
      title: 'Local Files',
      description: 'Search your computer files and documents',
      color: '#6B7280'
    },
    {
      icon: '🔖',
      title: 'Bookmarks',
      description: 'Find your saved bookmarks across all browsers',
      color: '#F59E0B'
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: darkMode ? '#1a1a1a' : '#fafafa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
            //   background: 'linear-gradient(135deg, #383a45ff 0%, #3f1568ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
             {/* <Logo size={118} /> */}
          
          </div>
          <span
            style={{
              fontSize: '34px',
              fontWeight: '700',
              color: darkMode ? '#fff' : '#1a1a1a',
            }}
          >
            Quark
          </span>
        </div>
        

        <button
          onClick={onSignIn}
          style={{
            padding: '10px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '800px',
          margin: '80px auto 60px',
          textAlign: 'center',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 40px',
            borderRadius: '30px',
            // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            // background: 'linear-gradient(135deg, #383a45ff 0%, #3f1568ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
          }}
        >
          {/* <Search size={60} color="white" /> */}
           <Logo size={168} />
        </div>

        <h1
          style={{
            fontSize: '56px',
            fontWeight: '800',
            color: darkMode ? '#fff' : '#1a1a1a',
            margin: '0 0 20px',
            lineHeight: '1.1',
          }}
        >
          Search Everything,
          <br />
          Find Anything
        </h1>

        <p
          style={{
            fontSize: '20px',
            color: darkMode ? '#a0a0a0' : '#666',
            margin: '0 0 40px',
            lineHeight: '1.6',
          }}
        >
          One search box for all your apps and files
        </p>

        <button
          onClick={onSignIn}
          style={{
            padding: '16px 48px',
            borderRadius: '16px',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
          }}
        >
          🚀 Get Started
        </button>
      </section>

      {/* Features Section */}
      <section
        style={{
          maxWidth: '1000px',
          margin: '100px auto 80px',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                backgroundColor: darkMode ? '#2a2a2a' : 'white',
                padding: '32px 24px',
                borderRadius: '20px',
                textAlign: 'center',
                border: `2px solid ${darkMode ? '#3a3a3a' : '#f0f0f0'}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = `0 20px 40px ${feature.color}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: darkMode ? '#fff' : '#1a1a1a',
                  margin: '0 0 12px',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: darkMode ? '#a0a0a0' : '#666',
                  margin: 0,
                  lineHeight: '1.5',
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section
        style={{
          textAlign: 'center',
          padding: '60px 20px 80px',
        }}
      >
        <h2
          style={{
            fontSize: '36px',
            fontWeight: '700',
            color: darkMode ? '#fff' : '#1a1a1a',
            margin: '0 0 16px',
          }}
        >
          Ready to search smarter?
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: darkMode ? '#a0a0a0' : '#666',
            margin: '0 0 32px',
          }}
        >
          Sign in with Google to get started
        </p>
        <button
          onClick={onSignIn}
          style={{
            padding: '14px 40px',
            borderRadius: '14px',
            border: `2px solid ${darkMode ? '#fff' : '#1a1a1a'}`,
            background: 'transparent',
            color: darkMode ? '#fff' : '#1a1a1a',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = darkMode ? '#fff' : '#1a1a1a';
            e.target.style.color = darkMode ? '#1a1a1a' : '#fff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = darkMode ? '#fff' : '#1a1a1a';
          }}
        >
          Sign In Now →
        </button>
      </section>
    </div>
  );
};

export default LandingPage;