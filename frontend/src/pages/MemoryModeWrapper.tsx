import { useState, useEffect } from 'react';
import { AuthenticatedRoute } from '../App.js';
import { MemoryMode } from '../components/MemoryMode/index.js';
import { API_URL, getPassword } from '../config/api.js';
import type { Lesson } from '../types/index.js';

export function MemoryModeWrapper() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Use dedicated endpoint for Memory Mode (includes vocabulary/grammar)
        const response = await fetch(`${API_URL}/api/lessons/memory`, {
          headers: {
            'X-Password': getPassword(),
          },
        });
        if (response.ok) {
          const data = await response.json();
          const lessonsArray = data.lessons || data;
          console.log('MemoryMode: Fetched', lessonsArray.length, 'lessons with vocab/grammar');
          setLessons(Array.isArray(lessonsArray) ? lessonsArray : []);
        } else {
          console.error('MemoryMode: Failed to fetch lessons:', response.status);
          setLessons([]);
        }
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading) {
    return (
      <AuthenticatedRoute>
        <div className="flex justify-content-center align-items-center min-h-screen">
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
        </div>
      </AuthenticatedRoute>
    );
  }

  return (
    <AuthenticatedRoute>
      <MemoryMode lessons={lessons} />
    </AuthenticatedRoute>
  );
}
