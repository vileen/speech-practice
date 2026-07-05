import { PatternNode, PatternConnection } from '../components/GrammarMode/PatternGraphTypes.js';

interface ForceLayoutParams {
  initialNodes: PatternNode[];
  connections: PatternConnection[];
  width: number;
  height: number;
  iterations?: number;
}

/**
 * Runs a force-directed layout simulation on pattern nodes.
 * Uses repulsion between all nodes, attraction along connections,
 * centering force, and boundary constraints.
 */
export const runForceLayout = ({
  initialNodes,
  connections,
  width,
  height,
  iterations = 150,
}: ForceLayoutParams): PatternNode[] => {
  const nodes = initialNodes.map(n => ({
    ...n,
    vx: 0,
    vy: 0,
    // Add small random jitter to prevent perfect stacking
    x: n.x + (Math.random() - 0.5) * 20,
    y: n.y + (Math.random() - 0.5) * 20,
  }));

  const centerX = width / 2;
  const centerY = height / 2;

  // Constants for forces
  const REPULSION_FORCE = 15000;
  const ATTRACTION_FORCE = 0.008;
  const CENTER_FORCE = 0.003;
  const DAMPING = 0.85;
  const PADDING = 150;

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between ALL nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = REPULSION_FORCE / (dist * dist + 1000);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    // Attraction along connections
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (!fromNode || !toNode) return;

      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 200;

      const force = (dist - targetDist) * ATTRACTION_FORCE * conn.strength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      fromNode.vx += fx;
      fromNode.vy += fy;
      toNode.vx -= fx;
      toNode.vy -= fy;
    });

    // Centering force
    nodes.forEach(node => {
      const dx = centerX - node.x;
      const dy = centerY - node.y;
      node.vx += dx * CENTER_FORCE;
      node.vy += dy * CENTER_FORCE;
    });

    // Soft boundary force
    nodes.forEach(node => {
      if (node.x < PADDING) node.vx += (PADDING - node.x) * 0.05;
      if (node.x > width - PADDING) node.vx -= (node.x - (width - PADDING)) * 0.05;
      if (node.y < PADDING) node.vy += (PADDING - node.y) * 0.05;
      if (node.y > height - PADDING) node.vy -= (node.y - (height - PADDING)) * 0.05;
    });

    // Apply velocities with damping
    nodes.forEach(node => {
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x += node.vx;
      node.y += node.vy;

      // Hard boundary as last resort
      const hardMargin = 60;
      node.x = Math.max(hardMargin, Math.min(width - hardMargin, node.x));
      node.y = Math.max(hardMargin, Math.min(height - hardMargin, node.y));
    });
  }

  return nodes;
};
