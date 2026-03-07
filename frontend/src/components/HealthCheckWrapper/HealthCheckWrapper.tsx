import { useState, useEffect, useRef, useCallback } from 'react';
import { OfflineScreen } from '../OfflineScreen/index.js';
import { API_URL } from '../../config/api.js';

export function HealthCheckWrapper({ children }: { children: React.ReactNode }) {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkHealth = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    // Initial check
    checkHealth();
    
    // Set up interval - recreate when status changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(checkHealth, healthStatus === 'online' ? 30000 : 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
