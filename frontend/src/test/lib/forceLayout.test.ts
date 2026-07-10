import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runForceLayout } from '../../lib/forceLayout';
import { PatternNode, PatternConnection } from '../../components/GrammarMode/PatternGraphTypes';

describe('runForceLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createNode = (id: number, x: number, y: number): PatternNode => ({
    id,
    pattern: `pattern-${id}`,
    category: 'test',
    x,
    y,
    masteryStatus: 'unknown',
    accuracy: 0,
    vx: 0,
    vy: 0,
  });

  const createConnection = (from: number, to: number, strength = 1): PatternConnection => ({
    from,
    to,
    type: 'related',
    strength,
  });

  it('should return nodes with updated positions', () => {
    const nodes = [createNode(1, 400, 300)];
    const result = runForceLayout({
      initialNodes: nodes,
      connections: [],
      width: 800,
      height: 600,
      iterations: 1,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    // Jitter plus centering force should move it slightly
    expect(result[0].x).not.toBe(400);
    expect(result[0].y).not.toBe(300);
  });

  it('should keep all nodes within bounds', () => {
    const nodes = [
      createNode(1, 0, 0),
      createNode(2, 800, 600),
      createNode(3, -100, -100),
      createNode(4, 900, 700),
    ];

    const result = runForceLayout({
      initialNodes: nodes,
      connections: [],
      width: 800,
      height: 600,
      iterations: 100,
    });

    const hardMargin = 60;
    result.forEach(node => {
      expect(node.x).toBeGreaterThanOrEqual(hardMargin);
      expect(node.x).toBeLessThanOrEqual(800 - hardMargin);
      expect(node.y).toBeGreaterThanOrEqual(hardMargin);
      expect(node.y).toBeLessThanOrEqual(600 - hardMargin);
    });
  });

  it('should separate nodes that start at the same position (repulsion)', () => {
    // Mock random to give different jitter for each node so they separate
    const randomValues = [0.1, 0.5, 0.9, 0.5];
    let callCount = 0;
    const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => {
      const val = randomValues[callCount % randomValues.length];
      callCount++;
      return val;
    });

    const nodes = [
      createNode(1, 400, 300),
      createNode(2, 400, 300),
    ];

    const result = runForceLayout({
      initialNodes: nodes,
      connections: [],
      width: 800,
      height: 600,
      iterations: 50,
    });

    const dist = Math.sqrt(
      (result[1].x - result[0].x) ** 2 + (result[1].y - result[0].y) ** 2
    );

    expect(dist).toBeGreaterThan(50);
    randomSpy.mockRestore();
  });

  it('should pull connected nodes closer than unconnected ones', () => {
    const nodes = [
      createNode(1, 200, 200),
      createNode(2, 600, 400), // connected to 1
      createNode(3, 600, 400), // NOT connected to 1
    ];

    const connections = [createConnection(1, 2)];

    const result = runForceLayout({
      initialNodes: nodes,
      connections,
      width: 800,
      height: 600,
      iterations: 100,
    });

    const connectedDist = Math.sqrt(
      (result[1].x - result[0].x) ** 2 + (result[1].y - result[0].y) ** 2
    );
    const unconnectedDist = Math.sqrt(
      (result[2].x - result[0].x) ** 2 + (result[2].y - result[0].y) ** 2
    );

    // Connected pair should be closer than unconnected pair
    expect(connectedDist).toBeLessThan(unconnectedDist);
  });

  it('should center nodes toward middle of canvas', () => {
    const nodes = [createNode(1, 100, 100)];

    const result = runForceLayout({
      initialNodes: nodes,
      connections: [],
      width: 800,
      height: 600,
      iterations: 100,
    });

    // After centering force, should be closer to center (400, 300)
    expect(result[0].x).toBeGreaterThan(100);
    expect(result[0].y).toBeGreaterThan(100);
    expect(result[0].x).toBeLessThan(400);
    expect(result[0].y).toBeLessThan(300);
  });

  it('should handle empty nodes gracefully', () => {
    const result = runForceLayout({
      initialNodes: [],
      connections: [],
      width: 800,
      height: 600,
      iterations: 50,
    });

    expect(result).toEqual([]);
  });

  it('should handle connections with missing nodes gracefully', () => {
    const nodes = [createNode(1, 400, 300)];
    const connections = [
      createConnection(1, 99), // node 99 doesn't exist
    ];

    const result = runForceLayout({
      initialNodes: nodes,
      connections,
      width: 800,
      height: 600,
      iterations: 10,
    });

    // Should not throw and still return the single node
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('should produce more stable results with more iterations', () => {
    const nodes = [
      createNode(1, 200, 200),
      createNode(2, 600, 400),
      createNode(3, 400, 100),
    ];
    const connections = [
      createConnection(1, 2),
      createConnection(2, 3),
    ];

    const result50 = runForceLayout({
      initialNodes: nodes,
      connections,
      width: 800,
      height: 600,
      iterations: 50,
    });

    const result150 = runForceLayout({
      initialNodes: nodes,
      connections,
      width: 800,
      height: 600,
      iterations: 150,
    });

    // With more iterations, velocities should be smaller (more damped/stable)
    const totalV50 = result50.reduce((sum, n) => sum + Math.abs(n.vx) + Math.abs(n.vy), 0);
    const totalV150 = result150.reduce((sum, n) => sum + Math.abs(n.vx) + Math.abs(n.vy), 0);

    expect(totalV150).toBeLessThanOrEqual(totalV50 * 1.5); // allow some variance from random
  });

  it('should apply stronger connection force with higher strength', () => {
    const nodesA = [createNode(1, 200, 200), createNode(2, 600, 400)];
    const nodesB = [createNode(1, 200, 200), createNode(2, 600, 400)];

    const weakResult = runForceLayout({
      initialNodes: nodesA,
      connections: [createConnection(1, 2, 0.1)],
      width: 800,
      height: 600,
      iterations: 100,
    });

    const strongResult = runForceLayout({
      initialNodes: nodesB,
      connections: [createConnection(1, 2, 5)],
      width: 800,
      height: 600,
      iterations: 100,
    });

    const weakDist = Math.sqrt(
      (weakResult[1].x - weakResult[0].x) ** 2 +
      (weakResult[1].y - weakResult[0].y) ** 2
    );
    const strongDist = Math.sqrt(
      (strongResult[1].x - strongResult[0].x) ** 2 +
      (strongResult[1].y - strongResult[0].y) ** 2
    );

    // Stronger connection should pull nodes closer together
    expect(strongDist).toBeLessThan(weakDist);
  });
});
