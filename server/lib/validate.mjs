import { randomUUID } from 'node:crypto';

export class RequestError extends Error {
  constructor(status, message, code = 'request_error', data) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

const text = (value, fallback = '', max = 200000) => String(value ?? fallback).slice(0, max);

export function validateProject(input, limits = {}) {
  const maxNodes = limits.maxNodes || 50000;
  const maxEdges = limits.maxEdges || 150000;
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new RequestError(400, 'project must be an object', 'invalid_project');
  const project = structuredClone(input);
  if (!Array.isArray(project.nodes) || !Array.isArray(project.edges)) throw new RequestError(400, 'project requires nodes and edges arrays', 'invalid_project');
  if (project.nodes.length > maxNodes || project.edges.length > maxEdges) throw new RequestError(413, 'project exceeds configured limits', 'project_too_large');

  const ids = new Set();
  project.nodes = project.nodes.map((node, index) => {
    if (!node || typeof node !== 'object') throw new RequestError(400, `invalid node at index ${index}`, 'invalid_node');
    const id = text(node.id || `node-${randomUUID()}`, '', 256);
    if (ids.has(id)) throw new RequestError(400, `duplicate node id: ${id}`, 'duplicate_node');
    ids.add(id);
    return {
      ...node,
      id,
      title: text(node.title, 'Untitled node', 500),
      text: text(node.text ?? node.summary, '', 1000000),
      summary: text(node.summary ?? node.text, '', 2000),
      type: text(node.type, 'note', 120),
      parent: node.parent == null ? null : text(node.parent, '', 256),
      keywords: Array.isArray(node.keywords) ? node.keywords.slice(0, 200).map(item => text(item, '', 120)).filter(Boolean) : [],
    };
  });

  project.edges = project.edges.map((edge, index) => {
    if (!edge || typeof edge !== 'object') throw new RequestError(400, `invalid edge at index ${index}`, 'invalid_edge');
    const a = text(edge.a, '', 256);
    const b = text(edge.b, '', 256);
    if (!ids.has(a) || !ids.has(b)) throw new RequestError(400, `edge ${index} references missing nodes`, 'broken_edge');
    const weight = Number(edge.weight);
    return { ...edge, a, b, type: text(edge.type, 'semantic', 120), weight: Number.isFinite(weight) ? weight : 1 };
  });

  project.title = text(project.title, 'Untitled NeuroCanvas project', 500);
  project.kind = text(project.kind, 'memory', 120);
  project.format = text(project.format, 'neurocanvas-v3', 120);
  project.audit = Array.isArray(project.audit) ? project.audit.slice(-5000) : [];
  project.events = Array.isArray(project.events) ? project.events.slice(-10000) : [];
  project.updatedAt = new Date().toISOString();
  project.revision = Number.isInteger(project.revision) ? project.revision : 0;
  return project;
}

export function validateNode(input = {}) {
  return {
    ...input,
    id: text(input.id || `node-${randomUUID()}`, '', 256),
    title: text(input.title, 'Untitled node', 500),
    text: text(input.text ?? input.summary, '', 1000000),
    summary: text(input.summary ?? input.text, '', 2000),
    type: text(input.type, 'note', 120),
    keywords: Array.isArray(input.keywords) ? input.keywords.slice(0, 200).map(item => text(item, '', 120)).filter(Boolean) : [],
  };
}
