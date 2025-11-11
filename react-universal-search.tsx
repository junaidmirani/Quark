import React, { useState, useEffect, useCallback } from 'react';
import { Search, Home, Settings, RefreshCw, ExternalLink, Clock, Database } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// Utility function for API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Search Result Component
const SearchResultItem = ({ result }) => {
  const getSourceIcon = (source) => {
    const icons = {
      gmail: '✉️',
      drive: '📄',
      notion: '📝', 
      files: '📁',
      bookmarks: '🔖',
      slack: '💬'
    };
    return icons[source] || '📄';
  };

  const getSourceColor = (source) => {
    const colors = {
      gmail: '#EA4335',
      drive: '#4285F4',
      notion: '#000000',
      files: '#6B7280',
      bookmarks: '#F59E0B',
      slack: '#4A154B'
    };
    return colors[source] || '#6B7280';
  };

  const handleClick = () => {
    if (result.source_url) {
      window.open(result.source_url, '_blank');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleDateString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div 
      className="search-result-item"
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid #E5E7EB',
        marginBottom: '12px',
        backgroundColor: 'white'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#F9FAFB';
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'white';
        e.target.style.transform = 'translateY(0px)';
        e.target.style.boxShadow = 'none';
      }}
    >
      <div 
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: getSourceColor(result.source),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          flexShrink: 0
        }}
      >
        {getSourceIcon(result.source)}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 4px 0',
              lineHeight: '1.4'
            }}>
              {result.title}
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: '0 0 8px 0',
              lineHeight: '1.5'
            }}>
              {result.snippet}
            </p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              color: '#9CA3AF'
            }}>
              <span style={{
                textTransform: 'capitalize',
                fontWeight: '500',
                color: getSourceColor(result.source)
              }}>
                {result.source}
              </span>
              
              {result.timestamp && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {formatTimestamp(result.timestamp)}
                </span>
              )}
              
              <span style={{
                backgroundColor: '#F3F4F6',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px'
              }}>
                {Math.round(result.relevance_score)}% match
              </span>
            </div>
          </div>
          
          <ExternalLink size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
};

// Source Status Component
const SourceCard = ({ source, onReindex }) => {
  const [isReindexing, setIsReindexing] = useState(false);

  const handleReindex = async () => {
    setIsReindexing(true);
    try {
      await apiCall(`/sources/${source.name}/reindex`, { method: 'POST' });
      // Optionally refresh source status
    } catch (error) {
      console.error('Reindex failed:', error);
    } finally {
      setIsReindexing(false);
    }
  };

  const getSourceIcon = (name) => {
    const icons = {
      gmail: '✉️',
      drive: '📄',
      notion: '📝',
      files: '📁',
      bookmarks: '🔖',
      slack: '💬'
    };
    return icons[name] || '📄';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '32px',
        marginBottom: '12px'
      }}>
        {getSourceIcon(source.name)}
      </div>
      
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#111827',
        margin: '0 0 8px 0'
      }}>
        {source.display_name}
      </h3>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        marginBottom: '12px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: source.connected ? '#10B981' : '#EF4444'
        }} />
        <span style={{
          fontSize: '14px',
          color: source.connected ? '#10B981' : '#EF4444',
          fontWeight: '500'
        }}>
          {source.connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <div style={{
        fontSize: '12px',
        color: '#6