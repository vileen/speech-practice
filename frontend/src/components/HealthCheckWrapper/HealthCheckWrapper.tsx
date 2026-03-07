import { useState, useEffect, useRef } from 'react';
import { OfflineScreen } from '../OfflineScreen/index.js';
import { API_URL } from '../../config/api.js';

export function HealthCheckWrapper({ children }: { children: React.ReactNode }) {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const mounted = useRef(true);
  const renderCount = useRef(0);

  // Debug
  renderCount.current++;
  console.log('[HealthCheck] Render #', renderCount.current, 'status:', healthStatus);

  useEffect(() => {
    console.log('[HealthCheck] Effect running, mounted:', mounted.current);
    mounted.current = true;
    
    const checkHealth = async () => {
      console.log('[HealthCheck] Checking health...');
      try {
        const response = await fetch(`${API_URL}/api/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        
        console.log('[HealthCheck] Response:', response.status, 'mounted:', mounted.current);
        
        if (mounted.current) {
          console.log('[HealthCheck] Setting status to:', response.ok ? 'online' : 'offline');
          setHealthStatus(response.ok ? 'online' : 'offline');
        }
      } catch (error) {
        console.log('[HealthCheck] Error:', error, 'mounted:', mounted.current);
        if (mounted.current) {
          setHealthStatus('offline');
        }
      }
    };

    checkHealth();
    
    return () => { 
      console.log('[HealthCheck] Cleanup, setting mounted to false');
      mounted.current = false; 
    };
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
        .then(r => {
          if (mounted.current) {
            setHealthStatus(r.ok ? 'online' : 'offline');
          }
        })
        .catch(() => {
          if (mounted.current) {
            setHealthStatus('offline');
          }
        });
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
