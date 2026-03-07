import { useState, useEffect } from 'react';
import { OfflineScreen } from '../OfflineScreen/index.js';
import { API_URL } from '../../config/api.js';

export function HealthCheckWrapper({ children }: { children: React.ReactNode }) {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let cancelled = false;
    
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        
        if (!cancelled) {
          setHealthStatus(response.ok ? 'online' : 'offline');
        }
      } catch (error) {
        if (!cancelled) {
          setHealthStatus('offline');
        }
      }
    };

    checkHealth();
    
    return () => { cancelled = true; };
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
        onRetry={() => setHealthStatus('checking')} 
      />
    );
  }

  return <>{children}</>;
}
