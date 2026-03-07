import { useState, useEffect } from 'react';
import { OfflineScreen } from '../OfflineScreen/index.js';
import { API_URL } from '../../config/api.js';

export function HealthCheckWrapper({ children }: { children: React.ReactNode }) {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const checkHealth = async () => {
    setHealthStatus('checking');
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

  useEffect(() => {
    checkHealth();
    // Check every 30 seconds when online, every 5 seconds when offline
    const interval = setInterval(checkHealth, healthStatus === 'online' ? 30000 : 5000);
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
    return <OfflineScreen apiUrl={API_URL} onRetry={checkHealth} />;
  }

  return <>{children}</>;
}
