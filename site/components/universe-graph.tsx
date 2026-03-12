"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  NodeProps,
  EdgeProps,
  BaseEdge,
  getBezierPath,
  Node,
  Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { CheckCircle2, CircleDashed, Loader2, AlertTriangle } from "lucide-react";

// Tipos base para o Componente
export type NodeStatus = "waiting" | "running" | "done" | "error";

export interface UniverseNodeData extends Record<string, unknown> {
  label: string;
  status: NodeStatus;
  duration?: string;
}

// -------------------------------------------------------------
// 1. CUSTOM NODE: UniverseNode
// UI premium, glassmorphism e cores condizentes com status
// -------------------------------------------------------------
const UniverseNodeComponent = ({ data }: NodeProps<Node<UniverseNodeData>>) => {
  const { label, status, duration } = data;

  let cardClass = "sketch-card transition-all duration-300";
  let textClass = "text-sketch-charcoal font-medium";
  let icon = <CircleDashed className="h-5 w-5 opacity-40" />;

  switch (status) {
    case "running":
      cardClass = "sketch-card-yellow animate-pulse scale-[1.02] border-sketch-charcoal";
      textClass = "text-sketch-charcoal font-bold";
      icon = <Loader2 className="h-5 w-5 text-sketch-charcoal animate-spin" />;
      break;
    case "done":
      cardClass = "sketch-card-teal bg-[#26C2B9]/15 border-sketch-charcoal";
      textClass = "text-sketch-teal font-extrabold";
      icon = <CheckCircle2 className="h-5 w-5 text-sketch-teal" />;
      break;
    case "error":
      cardClass = "sketch-card bg-red-50 border-red-500 border-dashed";
      textClass = "text-red-600 font-bold";
      icon = <AlertTriangle className="h-5 w-5 text-red-500" />;
      break;
  }

  return (
    <div className={`relative flex min-w-[200px] flex-col ${cardClass}`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-sketch-charcoal !w-3 !h-3 !border-none !rounded-none" 
        style={{ borderRadius: '50% 40% 60% 30%' }}
      />
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex flex-col min-w-0">
          <span className={`text-sm truncate ${textClass}`}>{label}</span>
          {duration && <span className="text-[10px] font-bold text-sketch-charcoal-soft uppercase tracking-tight">{duration}</span>}
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-sketch-charcoal !w-3 !h-3 !border-none !rounded-none"
        style={{ borderRadius: '40% 60% 30% 50%' }}
      />
    </div>
  );
};

// -------------------------------------------------------------
// 2. CUSTOM EDGE: HandoffEdge
// Animação forte "Flowing" quando ativos. 
// -------------------------------------------------------------
export interface HandoffEdgeData extends Record<string, unknown> {
  active?: boolean;
}

const HandoffEdgeComponent = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps<Edge<HandoffEdgeData>>) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActive = data?.active;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isActive ? 4 : 2,
          stroke: isActive ? "#26C2B9" : "#222B31",
          strokeDasharray: isActive ? "8 6" : "none",
          opacity: isActive ? 1 : 0.4,
          animation: isActive ? "dashdraw 0.8s linear infinite" : "none",
        }}
      />
    </>
  );
};

// Precisamos registrar os tipos
const nodeTypes = {
  universe: UniverseNodeComponent,
};

const edgeTypes = {
  handoff: HandoffEdgeComponent,
};

// -------------------------------------------------------------
// 3. LAYOUT ALGORITHM (Dagre)
// Posições X e Y automáticas
// -------------------------------------------------------------
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "LR") => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
    };
  });

  return { nodes: layoutedNodes, edges };
};

// -------------------------------------------------------------
// PROPS DO COMPONENTE PRINCIPAL
// -------------------------------------------------------------
export interface UniverseGraphProps {
  nodes: Node<UniverseNodeData>[];
  edges: Edge<HandoffEdgeData>[];
}

export function UniverseGraph({ nodes: initialNodes, edges: initialEdges }: UniverseGraphProps) {
  // Aplicamos Dagre Layout nas mudancas das props principais
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Sync props -> state (se `initialNodes` mudarem, refletimos, permitindo animacoes/status sync)
  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getLayoutedElements(initialNodes, initialEdges);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="h-full w-full rounded-2xl border-[2.5px] border-sketch-charcoal bg-[#F5FAF9] overflow-hidden relative group sketch-filter">
      <style>
        {`
          @keyframes dashdraw {
            from {
              stroke-dashoffset: 20;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        className="fade-in-content"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <MiniMap 
          className="!bg-background !border-border rounded-lg shadow-sm"
          maskColor="hsl(var(--background) / 0.8)"
          nodeColor="hsl(var(--muted-foreground) / 0.4)"
        />
        <Controls className="!bg-background !border-border !fill-foreground rounded-lg shadow-sm" />
      </ReactFlow>
    </div>
  );
}
