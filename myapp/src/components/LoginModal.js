// src/components/LoginModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const GOOGLE_CLIENT_ID = "396804387135-sak8ueujt310gs9if8cv6374cakaoh0k.apps.googleusercontent.com";
const API_BASE_URL = "http://localhost:8000";

const LoginModal = ({ isOpen, onClose, onSuccess, darkMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    // Load Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      // Clear any existing button content
      const buttonDiv = document.getElementById("googleSignInButton");
      if (buttonDiv) {
        buttonDiv.innerHTML = '';
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: darkMode ? "filled_black" : "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 280,
        });
      }
    };

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, [isOpen, darkMode]);

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    setError("");

    try {
      const backendResponse = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(errorData.detail || "Authentication failed");
      }

      const data = await backendResponse.json();
      
      // Store auth data
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      
      // Call success callback
      onSuccess(data.access_token, data.user);
      
      // Close modal
      onClose();
      
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Sign in failed. Please try again.");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: darkMode ? '#2a2a2a' : 'white',
          padding: '48px',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          maxWidth: '440px',
          width: '90%',
          animation: 'slideUp 0.3s ease-out',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = darkMode ? '#3a3a3a' : '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <X size={20} color={darkMode ? '#a0a0a0' : '#666'} />
        </button>

        {/* Content */}
        <div style={{ textAlign: 'center' }}>
          {/* Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
            }}
          >
            🔍
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: darkMode ? '#fff' : '#1a1a1a',
              margin: '0 0 8px',
            }}
          >
            Welcome to Quark
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '16px',
              color: darkMode ? '#a0a0a0' : '#666',
              margin: '0 0 32px',
              lineHeight: '1.5',
            }}
          >
            Sign in to search across all your apps and files
          </p>

          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '14px',
                textAlign: 'left',
              }}
            >
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div
              style={{
                marginBottom: '20px',
                color: darkMode ? '#a0a0a0' : '#666',
                fontSize: '14px',
              }}
            >
              Signing you in...
            </div>
          )}

          {/* Google Sign-In Button */}
          <div
            id="googleSignInButton"
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          />

          {/* Privacy Note */}
          <p
            style={{
              fontSize: '12px',
              color: darkMode ? '#666' : '#999',
              margin: 0,
              lineHeight: '1.4',
            }}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Add animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -45%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `}
      </style>
    </>
  );
};

export default LoginModal;