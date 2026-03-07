import { useState, useEffect, useRef } from 'react';
import { OfflineScreen } from '../OfflineScreen/index.js';
import { API_URL } from '../../config/api.js';

export function HealthCheckWrapper({ children }: { children: React.ReactNode }) {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const hasChecked = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          setHealthStatus('online');
        } else {
          setHealthStatus('offline');
        }
      } catch (error) {
        setHealthStatus('offline');
      }
    };

    checkHealth();
  }, []);

  // When offline, retry every 5 seconds
  useEffect(() => {
    if (healthStatus !== 'offline') return;
    
    const interval = setInterval(() => {
      fetch(`${API_URL}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      })
        .then(r => setHealthStatus(r.ok ? 'online' : 'offline'))
        .catch(() => setHealthStatus('offline'));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [healthStatus]);

  if (healthStatus === 'checking') {
    return (
      <div className="login-container">
        <h1>🎤 Speech Practice</h1>
        <p>Checking connection...</p>
      </div>
    );
  }

  if (healthStatus === 'offline') {
    return (
      <OfflineScreen 
        apiUrl={API_URL} 
        onRetry={() => {
          setHealthStatus('checking');
          hasChecked.current = false;
        }} 
      />
    );
  }

  return <>{children}</>;
}
