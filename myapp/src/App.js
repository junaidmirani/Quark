import React, { useState, useEffect, createContext, useContext } from "react";
import {
  User,
  LogOut,
  Moon,
  Sun,
  Search,
  Home,
  Settings,
  RefreshCw,
  ExternalLink,
  Clock,
  Database,
} from "lucide-react";

import SearchBar from "./components/SearchBar";
import SettingsModal from "./components/SettingsModal";
import SidebarToggle from "./components/SidebarToggle";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';
import ProtectedRoute from './components/ProtectedRoute';

const API_BASE_URL = "http://localhost:8000";
const GOOGLE_CLIENT_ID =
  "396804387135-sak8ueujt310gs9if8cv6374cakaoh0k.apps.googleusercontent.com";

// ===============================
// CONTEXTS
// ===============================
const ThemeContext = createContext();
const AuthContext = createContext(null);

// Theme Provider
const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem("darkMode", newTheme);
  };

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? "#202123" : "#F9FAFB";
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user_data");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (authToken, userData) => {
    localStorage.setItem("auth_token", authToken);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ===============================
// UTILITIES
// ===============================
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("auth_token");

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Handle auth error - redirect to login
        window.location.href = "/";
        return;
      }
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// ===============================
// LOGIN COMPONENT
// ===============================
const LoginComponent = () => {
  const { login } = useAuth();
  const { darkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInButton"),
        {
          theme: darkMode ? "filled_black" : "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 300,
        }
      );
    };

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, [darkMode]);

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
      login(data.access_token, data.user);
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Sign in failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: darkMode ? "#202123" : "#f9fafb",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: darkMode ? "#2D2F31" : "white",
          padding: "48px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "24px" }}>🔍</div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: darkMode ? "#E4E4E7" : "#111827",
            marginBottom: "8px",
          }}
        >
          Quark
        </h1>
        <p
          style={{
            color: darkMode ? "#A1A1AA" : "#6b7280",
            marginBottom: "32px",
            fontSize: "16px",
          }}
        >
          Search across all your apps and files in one place
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {isLoading && (
          <div
            style={{
              marginBottom: "16px",
              color: darkMode ? "#A1A1AA" : "#6b7280",
            }}
          >
            Signing you in...
          </div>
        )}

        <div
          id="googleSignInButton"
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        ></div>
      </div>
    </div>
  );
};
// Add this to your App.js - Replace the SourcesPage component and add backend support

// ===============================
// SOURCES PAGE - COMPLETE VERSION
// ===============================
const SourcesPage = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);

useEffect(() => {
  loadSources();

  const params = new URLSearchParams(window.location.search);
  const gmailConnected = params.get("gmail_connected");
  const driveConnected = params.get("drive_connected");
  const error = params.get("error");

  // 🔥 FIX: Show success message
  if (gmailConnected === "true") {
    alert("✅ Gmail connected successfully!");
    loadSources(); // Reload to show updated status
    window.history.replaceState({}, "", "/sources");
  }

  if (driveConnected === "true") {
    alert("✅ Google Drive connected successfully!");
    loadSources();
    window.history.replaceState({}, "", "/sources");
  }

  if (error) {
    alert(`❌ Connection failed: ${error}`);
    window.history.replaceState({}, "", "/sources");
  }
}, []);

  const loadSources = async () => {
    try {
      const response = await apiCall("/sources");
      setSources(response.sources);
    } catch (error) {
      console.error("Failed to load sources:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceConfig = (sourceName) => {
    const configs = {
      gmail: {
        icon: "✉️",
        color: "#EA4335",
        description: "Search your emails, find messages and attachments",
        needsOAuth: true,
        oauthUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      },
      drive: {
        icon: "📄",
        color: "#4285F4",
        description: "Search documents, spreadsheets, and presentations",
        needsOAuth: true,
        oauthUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      },
      notion: {
        icon: "📝",
        color: "#000000",
        description: "Search your notes, databases, and pages",
        needsOAuth: false,
        apiKeyNeeded: true,
      },
      slack: {
        icon: "💬",
        color: "#4A154B",
        description: "Search messages, channels, and files",
        needsOAuth: false,
        tokenNeeded: true,
      },
      files: {
        icon: "📁",
        color: "#6B7280",
        description: "Search your local files and documents",
        needsOAuth: false,
      },
      bookmarks: {
        icon: "🔖",
        color: "#F59E0B",
        description: "Search your browser bookmarks",
        needsOAuth: false,
      },
    };
    return configs[sourceName] || {};
  };

  // const handleConnectGmail = async () => {
  //   setConnecting("gmail");

  //   // Google OAuth popup
  //   const clientId =
  //     "396804387135-sak8ueujt310gs9if8cv6374cakaoh0k.apps.googleusercontent.com";
  //   const redirectUri = "http://localhost:3000/oauth/callback";
  //   const scope = "https://www.googleapis.com/auth/gmail.readonly";

  //   const authUrl =
  //     `https://accounts.google.com/o/oauth2/v2/auth?` +
  //     `client_id=${clientId}&` +
  //     `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  //     `response_type=token&` +
  //     `scope=${encodeURIComponent(scope)}&` +
  //     `access_type=offline`;

  //   const popup = window.open(authUrl, "Gmail Auth", "width=500,height=600");

  //   // Listen for OAuth callback
  //   const checkPopup = setInterval(() => {
  //     try {
  //       if (popup.closed) {
  //         clearInterval(checkPopup);
  //         setConnecting(null);
  //         return;
  //       }

  //       if (popup.location.href.includes("access_token")) {
  //         const hash = popup.location.hash.substring(1);
  //         const params = new URLSearchParams(hash);
  //         const accessToken = params.get("access_token");

  //         if (accessToken) {
  //           clearInterval(checkPopup);
  //           popup.close();
  //           saveGmailConnection(accessToken);
  //         }
  //       }
  //     } catch (e) {
  //       // Cross-origin error while popup is on Google domain
  //     }
  //   }, 500);
  // };
  const handleConnectGmail = async () => {
    setConnecting("gmail");
    const clientId =
      "396804387135-sak8ueujt310gs9if8cv6374cakaoh0k.apps.googleusercontent.com";
    const redirectUri = "http://localhost:8000/oauth/gmail/callback";
    const scope = "https://www.googleapis.com/auth/gmail.readonly";

    // Include auth token in state parameter
    const state = localStorage.getItem("auth_token");

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `state=${encodeURIComponent(state)}&` +
      `prompt=consent`;

    // Open in same window
    window.location.href = authUrl;
  };

  const saveGmailConnection = async (accessToken) => {
    try {
      await apiCall("/connect/gmail", {
        method: "POST",
        body: JSON.stringify({ access_token: accessToken }),
      });

      alert("✅ Gmail connected successfully!");
      loadSources();
    } catch (error) {
      console.error("Failed to save Gmail connection:", error);
      alert("❌ Failed to connect Gmail");
    } finally {
      setConnecting(null);
    }
  };

  // const handleConnectDrive = async () => {
  //   setConnecting("drive");

  //   const clientId =
  //     "396804387135-sak8ueujt310gs9if8cv6374cakaoh0k.apps.googleusercontent.com";
  //   const redirectUri = "http://localhost:3000/oauth/callback";
  //   const scope = "https://www.googleapis.com/auth/drive.readonly";

  //   const authUrl =
  //     `https://accounts.google.com/o/oauth2/v2/auth?` +
  //     `client_id=${clientId}&` +
  //     `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  //     `response_type=token&` +
  //     `scope=${encodeURIComponent(scope)}&` +
  //     `access_type=offline`;

  //   const popup = window.open(authUrl, "Drive Auth", "width=500,height=600");

  //   const checkPopup = setInterval(() => {
  //     try {
  //       if (popup.closed) {
  //         clearInterval(checkPopup);
  //         setConnecting(null);
  //         return;
  //       }

  //       if (popup.location.href.includes("access_token")) {
  //         const hash = popup.location.hash.substring(1);
  //         const params = new URLSearchParams(hash);
  //         const accessToken = params.get("access_token");

  //         if (accessToken) {
  //           clearInterval(checkPopup);
  //           popup.close();
  //           saveDriveConnection(accessToken);
  //         }
  //       }
  //     } catch (e) {
  //       // Cross-origin error
  //     }
  //   }, 500);
  // };
  const handleConnectDrive = async () => {
  setConnecting("drive");
  
  const clientId = "396804387135-sak8ueujt310gs9if8cv6374cakaoh0k.apps.googleusercontent.com";
  const redirectUri = "http://localhost:8000/oauth/drive/callback";
  const scope = "https://www.googleapis.com/auth/drive.readonly";
  
  // 🔥 FIX: Include auth token in state parameter (was missing!)
  const state = localStorage.getItem("auth_token");

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `state=${encodeURIComponent(state)}&` +  // 🔥 ADDED THIS LINE
    `prompt=consent`;

  window.location.href = authUrl;
};
  const saveDriveConnection = async (accessToken) => {
    try {
      await apiCall("/connect/drive", {
        method: "POST",
        body: JSON.stringify({ access_token: accessToken }),
      });

      alert("✅ Google Drive connected successfully!");
      loadSources();
    } catch (error) {
      console.error("Failed to save Drive connection:", error);
      alert("❌ Failed to connect Drive");
    } finally {
      setConnecting(null);
    }
  };

  const handleConnectNotion = () => {
    setConnecting("notion");
    const apiKey = prompt(
      "Enter your Notion Integration Token:\n\nGet it from: https://www.notion.so/my-integrations"
    );

    if (apiKey) {
      saveNotionConnection(apiKey);
    } else {
      setConnecting(null);
    }
  };

  const saveNotionConnection = async (apiKey) => {
    try {
      await apiCall("/connect/notion", {
        method: "POST",
        body: JSON.stringify({ api_key: apiKey }),
      });

      alert("✅ Notion connected successfully!");
      loadSources();
    } catch (error) {
      console.error("Failed to save Notion connection:", error);
      alert("❌ Failed to connect Notion. Make sure your API key is correct.");
    } finally {
      setConnecting(null);
    }
  };

  const handleConnectSlack = () => {
    setConnecting("slack");
    const token = prompt(
      "Enter your Slack Bot Token:\n\nGet it from: https://api.slack.com/apps\n(starts with xoxb-)"
    );

    if (token) {
      saveSlackConnection(token);
    } else {
      setConnecting(null);
    }
  };

  const saveSlackConnection = async (token) => {
    try {
      await apiCall("/connect/slack", {
        method: "POST",
        body: JSON.stringify({ bot_token: token }),
      });

      alert("✅ Slack connected successfully!");
      loadSources();
    } catch (error) {
      console.error("Failed to save Slack connection:", error);
      alert("❌ Failed to connect Slack. Make sure your bot token is correct.");
    } finally {
      setConnecting(null);
    }
  };

  const handleConnect = (sourceName) => {
    switch (sourceName) {
      case "gmail":
        handleConnectGmail();
        break;
      case "drive":
        handleConnectDrive();
        break;
      case "notion":
        handleConnectNotion();
        break;
      case "slack":
        handleConnectSlack();
        break;
      default:
        alert(`${sourceName} is already connected!`);
    }
  };

  const SourceCard = ({ source }) => {
    const config = getSourceConfig(source.name);
    const isConnecting = connecting === source.name;
    const canConnect = ["gmail", "drive", "notion", "slack"].includes(
      source.name
    );
    const isPublic = ["files", "bookmarks"].includes(source.name);

    return (
      <div
        style={{
          backgroundColor: darkMode ? "#27272A" : "white",
          border: `1px solid ${darkMode ? "#3F3F46" : "#E5E7EB"}`,
          borderRadius: "12px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: config.color || "#6B7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            {config.icon}
          </div>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: darkMode ? "#E4E4E7" : "#111827",
                margin: 0,
              }}
            >
              {source.display_name}
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "4px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: source.connected ? "#10B981" : "#EF4444",
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  color: source.connected
                    ? "#10B981"
                    : darkMode
                    ? "#A1A1AA"
                    : "#6B7280",
                  fontWeight: "500",
                }}
              >
                {source.connected ? "Connected" : "Not Connected"}
              </span>
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: "14px",
            color: darkMode ? "#A1A1AA" : "#6B7280",
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          {config.description}
        </p>

        {source.connected && (
          <div
            style={{
              padding: "12px",
              backgroundColor: darkMode ? "#202123" : "#F9FAFB",
              borderRadius: "8px",
              fontSize: "14px",
              color: darkMode ? "#A1A1AA" : "#6B7280",
            }}
          >
            📊 {source.total_items} items indexed
          </div>
        )}

        {!isPublic && (
          <button
            onClick={() => handleConnect(source.name)}
            disabled={isConnecting || source.connected}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              fontSize: "14px",
              fontWeight: "500",
              cursor: source.connected
                ? "not-allowed"
                : isConnecting
                ? "wait"
                : "pointer",
              transition: "all 0.2s",
              backgroundColor: source.connected
                ? darkMode
                  ? "#202123"
                  : "#F3F4F6"
                : isConnecting
                ? "#9CA3AF"
                : "#3B82F6",
              color: source.connected
                ? darkMode
                  ? "#71717A"
                  : "#9CA3AF"
                : "white",
            }}
          >
            {isConnecting
              ? "⏳ Connecting..."
              : source.connected
              ? "✓ Connected"
              : "🔗 Connect"}
          </button>
        )}

        {isPublic && (
          <div
            style={{
              padding: "12px",
              backgroundColor: darkMode ? "#10B981" + "20" : "#ECFDF5",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#10B981",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            ✅ Always Available
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
          color: darkMode ? "#A1A1AA" : "#6B7280",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: `3px solid ${darkMode ? "#3F3F46" : "#F3F4F6"}`,
            borderTop: "3px solid #3B82F6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  // return (
  //   <div
  //     style={{
  //       flex: 1,
  //       overflow: "auto",
  //       backgroundColor: darkMode ? "#202123" : "#F9FAFB",
  //       padding: "32px",
  //     }}
  //   >
  //     <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
  //       <div style={{ marginBottom: "32px" }}>
  //         <h1
  //           style={{
  //             fontSize: "32px",
  //             fontWeight: "700",
  //             color: darkMode ? "#E4E4E7" : "#111827",
  //             marginBottom: "8px",
  //           }}
  //         >
  //           Connect Sources
  //         </h1>
  //         <p
  //           style={{
  //             color: darkMode ? "#A1A1AA" : "#6B7280",
  //             fontSize: "16px",
  //             marginBottom: "24px",
  //           }}
  //         >
  //           Connect your apps to search across all your content in one place
  //         </p>


  //       </div>

  //       <div
  //         style={{
  //           display: "grid",
  //           gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  //           gap: "24px",
  //         }}
  //       >
  //         {sources.map((source) => (
  //           <SourceCard key={source.name} source={source} />
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );
    if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "400px",
          color: darkMode ? "#A1A1AA" : "#6B7280",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: `3px solid ${darkMode ? "#3F3F46" : "#F3F4F6"}`,
            borderTop: "3px solid #3B82F6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    // 🔥 NEW: Main container with flex column
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden", // Prevent this container from scrolling
        backgroundColor: darkMode ? "#202123" : "#F9FAFB",
      }}
    >
      {/* 🔥 FIXED HEADER: Title + description - Won't scroll */}
      <div
        style={{
          flexShrink: 0, // Won't shrink
          padding: "32px 32px 24px",
          borderBottom: `1px solid ${darkMode ? "#3F3F46" : "#E5E7EB"}`,
          backgroundColor: darkMode ? "#202123" : "#F9FAFB",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: darkMode ? "#E4E4E7" : "#111827",
              marginBottom: "8px",
            }}
          >
            Connected Sources
          </h1>
          <p
            style={{
              color: darkMode ? "#A1A1AA" : "#6B7280",
              fontSize: "16px",
              marginBottom: "16px",
            }}
          >
            Connect your apps to search across all your content in one place
          </p>

          {/* Info banner */}
          <div
            style={{
              padding: "16px",
              backgroundColor: darkMode ? "#3F3F46" : "#FEF3C7",
              borderRadius: "8px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "20px" }}>💡</span>
            <div>
              <p
                style={{
                  fontSize: "14px",
                  color: darkMode ? "#E4E4E7" : "#92400E",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                <strong>Files</strong> and <strong>Bookmarks</strong> work
                automatically. For Gmail, Drive, Notion, and Slack, you'll need
                to connect your accounts to enable searching.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 SCROLLABLE SOURCES GRID - Only this part scrolls */}
      <div
        style={{
          flex: 1, // Takes remaining space
          overflow: "auto", // 🔥 THIS IS THE MAGIC - Only this scrolls!
          padding: "32px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {sources.map((source) => (
              <SourceCard key={source.name} source={source} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
// ===============================
// SEARCH COMPONENTS
// ===============================
const SearchResultItem = ({ result }) => {
  const { darkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getSourceIcon = (source) =>
    ({
      gmail: "✉️",
      drive: "📄",
      notion: "📝",
      files: "📁",
      bookmarks: "🔖",
      slack: "💬",
    }[source] || "📄");
  const getSourceColor = (source) =>
    ({
      gmail: "#EA4335",
      drive: "#4285F4",
      notion: "#000000",
      files: "#6B7280",
      bookmarks: "#F59E0B",
      slack: "#4A154B",
    }[source] || "#6B7280");

  const handleClick = () => {
    if (result.source_url) window.open(result.source_url, "_blank");
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "16px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s",
        border: `1px solid ${darkMode ? "#3F3F46" : "#E5E7EB"}`,
        marginBottom: "12px",
        backgroundColor: darkMode
          ? isHovered
            ? "#2D2F31"
            : "#27272A"
          : isHovered
          ? "#F9FAFB"
          : "white",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          backgroundColor: getSourceColor(result.source),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          flexShrink: 0,
        }}
      >
        {getSourceIcon(result.source)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: darkMode ? "#E4E4E7" : "#111827",
                margin: "0 0 4px 0",
              }}
            >
              {result.title}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: darkMode ? "#A1A1AA" : "#6B7280",
                margin: "0 0 8px 0",
              }}
            >
              {result.snippet}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "12px",
                color: darkMode ? "#71717A" : "#9CA3AF",
              }}
            >
              <span
                style={{
                  textTransform: "capitalize",
                  fontWeight: "500",
                  color: getSourceColor(result.source),
                }}
              >
                {result.source}
              </span>
              {result.timestamp && (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Clock size={12} />
                  {new Date(result.timestamp).toLocaleDateString()}
                </span>
              )}
              <span
                style={{
                  backgroundColor: darkMode ? "#3F3F46" : "#F3F4F6",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "11px",
                }}
              >
                {Math.round(result.relevance_score)}% match
              </span>
            </div>
          </div>
          <ExternalLink
            size={16}
            color={darkMode ? "#71717A" : "#9CA3AF"}
            style={{ flexShrink: 0 }}
          />
        </div>
      </div>
    </div>
  );
};

const SearchInterface = ({ openSettings }) => {
  const { darkMode } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStats, setSearchStats] = useState(null);
  const [selectedSources, setSelectedSources] = useState([]);
  const [availableSources, setAvailableSources] = useState([]);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const loadSources = async () => {
      try {
        const response = await apiCall("/sources");
        setAvailableSources(response.sources);
      } catch (error) {
        console.error("Failed to load sources:", error);
      }
    };
    loadSources();
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setSearchStats(null);
    }
  }, [debouncedQuery, selectedSources]);

  const performSearch = async (searchQuery) => {
    setIsSearching(true);
    try {
      const response = await apiCall("/search", {
        method: "POST",
        body: JSON.stringify({
          query: searchQuery,
          sources: selectedSources.length > 0 ? selectedSources : null,
          limit: 20,
        }),
      });

      setResults(response.results);
      setSearchStats({
        totalResults: response.total_results,
        searchTimeMs: response.search_time_ms,
        sourcesSearched: response.sources_searched,
      });
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setSearchStats(null);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSource = (sourceName) => {
    setSelectedSources((prev) =>
      prev.includes(sourceName)
        ? prev.filter((s) => s !== sourceName)
        : [...prev, sourceName]
    );
  };

  // return (
  //   <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%",overflow: "hidden" }}>
  //     {/* --- START: Replace previous search header with SearchBar --- */}
  //     <div
  //       style={{
  //         flexShrink: 0,
  //         padding: "0 20px 6px 20px",
  //         borderBottom: `1px solid ${darkMode ? "#3F3F46" : "#E5E7EB"}`,
  //         backgroundColor: darkMode ? "#27272A" : "white",
  //       }}
  //     >
  //       <SearchBar
  //         value={query}
  //         onChange={setQuery}
  //         onOpenSettings={openSettings} // you will lift state into parent; see step D
  //         placeholder="Search across all your apps and files..."
  //       />

  //       <div
  //         style={{
  //           display: "flex",
  //           gap: "8px",
  //           flexWrap: "wrap",
  //           alignItems: "center",
  //           padding: "0 6px 12px 6px",
  //         }}
  //       >
  //         {/* Keep the existing "Search in:" source toggles here */}
  //         <span
  //           style={{
  //             fontSize: 14,
  //             color: darkMode ? "#A1A1AA" : "#6B7280",
  //             fontWeight: 500,
  //           }}
  //         >
  //           Search in:
  //         </span>
  //         {availableSources.map((source) => (
  //           <button
  //             key={source.name}
  //             onClick={() => toggleSource(source.name)}
  //             style={{
  //               padding: "6px 12px",
  //               border: `1px solid ${darkMode ? "#3F3F46" : "#E5E7EB"}`,
  //               borderRadius: "20px",
  //               fontSize: "12px",
  //               fontWeight: "500",
  //               cursor: "pointer",
  //               transition: "all 0.2s",
  //               backgroundColor: selectedSources.includes(source.name)
  //                 ? "#3B82F6"
  //                 : darkMode
  //                 ? "#27272A"
  //                 : "white",
  //               color: selectedSources.includes(source.name)
  //                 ? "white"
  //                 : darkMode
  //                 ? "#E4E4E7"
  //                 : "#374151",
  //             }}
  //           >
  //             {source.display_name}
  //             {source.connected && (
  //               <span style={{ marginLeft: 4, opacity: 0.75 }}>
  //                 ({source.total_items})
  //               </span>
  //             )}
  //           </button>
  //         ))}
  //       </div>
  //     </div>
  //     {/* --- END: SearchBar replacement --- */}

  //     <div
  //       style={{
  //         flex: 1,
  //         overflow: "auto",
  //         backgroundColor: darkMode ? "#202123" : "#F9FAFB",
  //         padding: "24px",
  //       }}
  //     >
  //       <div style={{ maxWidth: "900px", margin: "0 auto" }}>
  //         {searchStats && (
  //           <div
  //             style={{
  //               marginBottom: "20px",
  //               fontSize: "14px",
  //               color: darkMode ? "#A1A1AA" : "#6B7280",
  //             }}
  //           >
  //             <span>
  //               {searchStats.totalResults} results found in{" "}
  //               {searchStats.searchTimeMs}ms
  //             </span>
  //             <span style={{ marginLeft: "16px" }}>
  //               Searched: {searchStats.sourcesSearched.join(", ")}
  //             </span>
  //           </div>
  //         )}

  //         {isSearching && (
  //           <div
  //             style={{
  //               display: "flex",
  //               alignItems: "center",
  //               justifyContent: "center",
  //               padding: "40px",
  //             }}
  //           >
  //             <div
  //               style={{
  //                 width: "32px",
  //                 height: "32px",
  //                 border: "3px solid #3F3F46",
  //                 borderTop: "3px solid #3B82F6",
  //                 borderRadius: "50%",
  //                 animation: "spin 1s linear infinite",
  //               }}
  //             />
  //           </div>
  //         )}

  //         {!isSearching &&
  //           results.length > 0 &&
  //           results.map((result) => (
  //             <SearchResultItem key={result.id} result={result} />
  //           ))}

  //         {!isSearching && query && results.length === 0 && (
  //           <div
  //             style={{
  //               textAlign: "center",
  //               padding: "60px 20px",
  //               color: darkMode ? "#A1A1AA" : "#6B7280",
  //             }}
  //           >
  //             <Search
  //               size={48}
  //               style={{ marginBottom: "16px", opacity: 0.5 }}
  //             />
  //             <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>
  //               No results found for "{query}"
  //             </h3>
  //           </div>
  //         )}

  //         {!query && (
  //           <div
  //             style={{
  //               textAlign: "center",
  //               padding: "60px 20px",
  //               color: darkMode ? "#A1A1AA" : "#6B7280",
  //             }}
  //           >
  //             <Search
  //               size={64}
  //               style={{ marginBottom: "24px", opacity: 0.3 }}
  //             />
  //             <h2
  //               style={{
  //                 fontSize: "24px",
  //                 fontWeight: "600",
  //                 marginBottom: "12px",
  //                 color: darkMode ? "#E4E4E7" : "#111827",
  //               }}
  //             >
  //               Quark Search
  //             </h2>
  //             <p style={{ fontSize: "16px" }}>
  //               Search across all your connected apps and files in one place.
  //             </p>
  //             <p style={{ fontSize: "14px", marginTop: "8px" }}>
  //               Try searching for: "project", "analytics", "meeting notes"
  //             </p>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );
    return (
    // 🔥 NEW: Main container with flex column
    <div style={{ 
      flex: 1, 
      display: "flex", 
      flexDirection: "column",
      height: "100%",
      overflow: "hidden" // Prevent this container from scrolling
    }}>
      
      {/* 🔥 FIXED HEADER: Search bar + filters - Won't scroll */}
      <div
        style={{
          flexShrink: 0, // Won't shrink
          borderBottom: `1px solid ${darkMode ? "#3F3F46" : "#E5E7EB"}`,
          backgroundColor: darkMode ? "#27272A" : "white",
        }}
      >
        {/* Search Bar */}
        <div style={{ padding: "0 20px 6px 20px" }}>
          <SearchBar
            value={query}
            onChange={setQuery}
            onOpenSettings={openSettings}
            placeholder="Search across all your apps and files..."
          />

          {/* Source filters */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              alignItems: "center",
              padding: "0 6px 12px 6px",
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: darkMode ? "#A1A1AA" : "#6B7280",
                fontWeight: 500,
              }}
            >
              Search in:
            </span>
            {availableSources.map((source) => (
              <button
                key={source.name}
                onClick={() => toggleSource(source.name)}
                style={{
                  padding: "6px 12px",
                  border: `1px solid ${darkMode ? "#3F3F46" : "#E5E7EB"}`,
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor: selectedSources.includes(source.name)
                    ? "#3B82F6"
                    : darkMode
                    ? "#27272A"
                    : "white",
                  color: selectedSources.includes(source.name)
                    ? "white"
                    : darkMode
                    ? "#E4E4E7"
                    : "#374151",
                }}
              >
                {source.display_name}
                {source.connected && (
                  <span style={{ marginLeft: 4, opacity: 0.75 }}>
                    ({source.total_items})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🔥 SCROLLABLE RESULTS AREA - Only this part scrolls */}
      <div
        style={{
          flex: 1, // Takes remaining space
          overflow: "auto", // 🔥 THIS IS THE MAGIC - Only this scrolls!
          backgroundColor: darkMode ? "#202123" : "#F9FAFB",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Search stats */}
          {searchStats && (
            <div
              style={{
                marginBottom: "20px",
                fontSize: "14px",
                color: darkMode ? "#A1A1AA" : "#6B7280",
              }}
            >
              <span>
                {searchStats.totalResults} results found in{" "}
                {searchStats.searchTimeMs}ms
              </span>
              <span style={{ marginLeft: "16px" }}>
                Searched: {searchStats.sourcesSearched.join(", ")}
              </span>
            </div>
          )}

          {/* Loading state */}
          {isSearching && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: "3px solid #3F3F46",
                  borderTop: "3px solid #3B82F6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          )}

          {/* Results */}
          {!isSearching &&
            results.length > 0 &&
            results.map((result) => (
              <SearchResultItem key={result.id} result={result} />
            ))}

          {/* No results */}
          {!isSearching && query && results.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: darkMode ? "#A1A1AA" : "#6B7280",
              }}
            >
              <Search
                size={48}
                style={{ marginBottom: "16px", opacity: 0.5 }}
              />
              <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>
                No results found for "{query}"
              </h3>
            </div>
          )}

          {/* Empty state */}
          {!query && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: darkMode ? "#A1A1AA" : "#6B7280",
              }}
            >
              <Search
                size={64}
                style={{ marginBottom: "24px", opacity: 0.3 }}
              />
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "12px",
                  color: darkMode ? "#E4E4E7" : "#111827",
                }}
              >
                Quark Search
              </h2>
              <p style={{ fontSize: "16px" }}>
                Search across all your connected apps and files in one place.
              </p>
              <p style={{ fontSize: "14px", marginTop: "8px" }}>
                Try searching for: "project", "analytics", "meeting notes"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===============================
// USER PROFILE & DARK MODE
// ===============================
const UserProfile = ({ user, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { darkMode } = useTheme();

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "8px",
          backgroundColor: darkMode ? "#2D2F31" : "white",
          color: darkMode ? "#E4E4E7" : "#111827",
          border: `1px solid ${darkMode ? "#3F3F46" : "#E5E7EB"}`,
          cursor: "pointer",
        }}
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            style={{ width: "24px", height: "24px", borderRadius: "50%" }}
          />
        ) : (
          <User size={20} />
        )}
        <span>{user.name}</span>
      </button>

      {showMenu && (
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: "110%",
            backgroundColor: darkMode ? "#2D2F31" : "white",
            border: `1px solid ${darkMode ? "#3F3F46" : "#E5E7EB"}`,
            borderRadius: "8px",
            minWidth: "200px",
            zIndex: 50,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              padding: "12px",
              borderBottom: `1px solid ${darkMode ? "#3F3F46" : "#E5E7EB"}`,
            }}
          >
            <div
              style={{
                fontWeight: "500",
                color: darkMode ? "#E4E4E7" : "#111827",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: darkMode ? "#A1A1AA" : "#6B7280",
              }}
            >
              {user.email}
            </div>
          </div>
          <button
            onClick={() => {
              setShowMenu(false);
              onLogout();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "12px",
              border: "none",
              background: "transparent",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

const DarkModeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        width: "44px",
        height: "24px",
        backgroundColor: darkMode ? "#3F3F46" : "#E5E7EB",
        borderRadius: "20px",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: darkMode ? "flex-end" : "flex-start",
        padding: "3px",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: darkMode ? "#E4E4E7" : "#111827",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
        }}
      >
        {darkMode ? (
          <Moon size={12} color="#111827" />
        ) : (
          <Sun size={12} color="white" />
        )}
      </div>
    </button>
  );
};

// ===============================
// MAIN APP
// ===============================
const App = () => {
  const { loading, isAuthenticated, user, logout } = useAuth();
  const { darkMode } = useTheme();
  const [currentPage, setCurrentPage] = useState("search");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate(); // Only if inside Router

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: darkMode ? "#202123" : "#F9FAFB",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid #d1d5db",
            borderTop: "3px solid #3B82F6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) return <LoginComponent />;

  const renderPage = () => {
    switch (currentPage) {
      case "search":
        return <SearchInterface openSettings={() => setIsSettingsOpen(true)} />;
      case "sources":
        return <SourcesPage />;
      case "settings":
        return (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: darkMode ? "#A1A1AA" : "#6B7280",
            }}
          >
            <Settings size={48} />
            <h2>Settings</h2>
            <p>Settings page coming soon...</p>
          </div>
        );
      default:
        return <SearchInterface openSettings={() => setIsSettingsOpen(true)} />;
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: darkMode ? "#202123" : "#F9FAFB",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "240px",
          backgroundColor: darkMode ? "#27272A" : "white",
          borderRight: `1px solid ${darkMode ? "#3F3F46" : "#E5E7EB"}`,
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          flexShrink: 0, 
        }}
      >
        <div style={{ padding: "0 24px", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: darkMode ? "#E4E4E7" : "#111827",
              margin: 0,
            }}
          >
            🔍 Quark
          </h1>
        </div>

        <nav style={{ flex: 1 }}>
          {[
            { id: "search", icon: Search, label: "Search" },
            { id: "sources", icon: Database, label: "Sources" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "12px 24px",
                  border: "none",
                  backgroundColor: isActive
                    ? darkMode
                      ? "#3F3F46"
                      : "#F3F4F6"
                    : "transparent",
                  color: isActive
                    ? darkMode
                      ? "#E4E4E7"
                      : "#111827"
                    : darkMode
                    ? "#A1A1AA"
                    : "#6B7280",
                  fontSize: "15px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left",
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            padding: "0 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <DarkModeToggle />
          <UserProfile user={user} onLogout={logout} />
        </div>
      </div>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", }}>
        {renderPage()}
      </main>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => {
          console.log("Settings saved");
        }}
      />
    </div>
  );
};
const AppRoutes = () => {
  const { user, loading, isAuthenticated, login } = useAuth();
  const { darkMode } = useTheme();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginSuccess = (token, userData) => {
    login(token, userData);
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <Routes>
        {/* Landing Page - Public Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/app" replace />
            ) : (
              <LandingPage
                onSignIn={() => setIsLoginModalOpen(true)}
                darkMode={darkMode}
              />
            )
          }
        />

        {/* Main App - Protected Route */}
        <Route
          path="/app"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
              <App />
            </ProtectedRoute>
          }
        />

        {/* Redirect any unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        darkMode={darkMode}
      />
    </>
  );
};
const RootApp = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  </ThemeProvider>
);

export { useTheme };
export default RootApp;
