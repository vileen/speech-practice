import { useState, useMemo, useEffect, useCallback } from 'react';
import { API_URL } from '../config/api.js';
import { runForceLayout } from '../lib/forceLayout.js';
import {
  PatternNode,
  PatternConnection,
  ApiRelationship,
} from '../components/GrammarMode/PatternGraphTypes.js';
import { GrammarPattern } from '../components/GrammarMode/GrammarMode.js';

export type PatternFilter = 'all' | 'confused' | 'mastered';

export interface PatternGraphDataInput {
  patterns: GrammarPattern[];
  confusionStats: { patternId: number; count: number }[];
}

// Stable dimensions - never changes between renders
const DIMENSIONS = { width: 1200, height: 800 };

export const usePatternGraph = ({
  patterns,
  confusionStats,
}: PatternGraphDataInput) => {
  const [filter, setFilter] = useState<PatternFilter>('all');
  const [nodePositions, setNodePositions] = useState<Map<number, { x: number; y: number }>>(new Map());

  // Connections from database
  const [connections, setConnections] = useState<PatternConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);

  // Filter out counters - they have their own module (CountersMode)
  const grammarPatterns = useMemo(() => {
    return patterns.filter(p => p.category !== 'Counters');
  }, [patterns]);

  // Fetch relationships from API
  useEffect(() => {
    const fetchRelationships = async () => {
      try {
        setLoadingConnections(true);
        const response = await fetch(`${API_URL}/api/grammar/relationships`);

        if (!response.ok) {
          throw new Error('Failed to fetch relationships');
        }

        const data = await response.json();
        const apiConnections: PatternConnection[] = data.relationships.map((rel: ApiRelationship) => ({
          from: rel.from_pattern_id,
          to: rel.to_pattern_id,
          type: rel.relationship_type,
          strength: rel.strength,
        }));

        setConnections(apiConnections);
      } catch (error) {
        console.error('Error fetching pattern relationships:', error);
        setConnections([]);
      } finally {
        setLoadingConnections(false);
      }
    };

    fetchRelationships();
  }, []);

  // Calculate node positions using force-directed layout
  const nodes = useMemo((): PatternNode[] => {
    const centerX = DIMENSIONS.width / 2;
    const centerY = DIMENSIONS.height / 2;

    // Group patterns by category for initial placement
    const categories = [...new Set(grammarPatterns.map(p => p.category))];
    const categoryRadius = Math.min(DIMENSIONS.width, DIMENSIONS.height) * 0.25;

    const initialNodes: PatternNode[] = grammarPatterns.map((pattern) => {
      const confusionCount = confusionStats.find(c => c.patternId === pattern.id)?.count || 0;
      const totalAttempts = pattern.total_attempts || 0;
      const correctAttempts = pattern.correct_attempts || 0;
      const accuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

      let masteryStatus: PatternNode['masteryStatus'] = 'unknown';
      if (totalAttempts > 0) {
        if (confusionCount > 2 || accuracy < 0.5) {
          masteryStatus = 'confused';
        } else if (accuracy >= 0.8) {
          masteryStatus = 'mastered';
        } else {
          masteryStatus = 'learning';
        }
      }

      // Initial position in a circle grouped by category
      const catIndex = categories.indexOf(pattern.category);
      const patternsInCategory = grammarPatterns.filter(p => p.category === pattern.category);
      const indexInCategory = patternsInCategory.findIndex(p => p.id === pattern.id);
      const totalInCategory = patternsInCategory.length;

      const baseAngle = (catIndex / categories.length) * 2 * Math.PI - Math.PI / 2;
      const angleOffset = totalInCategory > 1
        ? ((indexInCategory - (totalInCategory - 1) / 2) / Math.max(1, totalInCategory - 1)) * 0.4
        : 0;
      const angle = baseAngle + angleOffset;

      const x = centerX + categoryRadius * Math.cos(angle);
      const y = centerY + categoryRadius * Math.sin(angle);

      return {
        id: pattern.id,
        pattern: pattern.pattern,
        category: pattern.category,
        x,
        y,
        masteryStatus,
        accuracy,
        vx: 0,
        vy: 0,
      };
    });

    const visibleConns = connections.filter(
      conn => grammarPatterns.some(p => p.id === conn.from) && grammarPatterns.some(p => p.id === conn.to)
    );

    return runForceLayout({
      initialNodes,
      connections: visibleConns,
      width: DIMENSIONS.width,
      height: DIMENSIONS.height,
      iterations: 150,
    });
  }, [grammarPatterns, confusionStats, connections]);

  // Get connections for visible patterns
  const visibleConnections = useMemo((): PatternConnection[] => {
    const patternIds = new Set(grammarPatterns.map(p => p.id));
    return connections.filter(
      conn => patternIds.has(conn.from) && patternIds.has(conn.to)
    );
  }, [grammarPatterns, connections]);

  // Filter nodes and apply manual positions
  const filteredNodes = useMemo(() => {
    const baseNodes = filter === 'all' ? nodes : nodes.filter(n => n.masteryStatus === filter);
    return baseNodes.map(node => {
      const manualPos = nodePositions.get(node.id);
      if (manualPos) {
        return { ...node, x: manualPos.x, y: manualPos.y };
      }
      return node;
    });
  }, [nodes, filter, nodePositions]);

  // Get categories for background labels
  const categories = useMemo(() => {
    const cats = [...new Set(grammarPatterns.map(p => p.category))];
    return cats.map(cat => {
      const catNodes = nodes.filter(n => n.category === cat);
      if (catNodes.length === 0) return null;
      const avgX = catNodes.reduce((sum, n) => sum + n.x, 0) / catNodes.length;
      const avgY = catNodes.reduce((sum, n) => sum + n.y, 0) / catNodes.length;
      return { name: cat, x: avgX, y: avgY };
    }).filter(Boolean) as { name: string; x: number; y: number }[];
  }, [grammarPatterns, nodes]);

  // Update a manually dragged node position
  const updateNodePosition = useCallback((nodeId: number, x: number, y: number) => {
    setNodePositions(prev => {
      const next = new Map(prev);
      next.set(nodeId, { x, y });
      return next;
    });
  }, []);

  return {
    dimensions: DIMENSIONS,
    filter,
    setFilter,
    grammarPatterns,
    connections,
    loadingConnections,
    filteredNodes,
    visibleConnections,
    categories,
    updateNodePosition,
  };
};
