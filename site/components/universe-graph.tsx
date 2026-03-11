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

  let bgClass = "bg-background/80";
  let borderClass = "border-border";
  let textClass = "text-foreground";
  let icon = <CircleDashed className="h-5 w-5 text-muted-foreground" />;

  switch (status) {
    case "running":
      bgClass = "bg-primary/20 animate-pulse";
      borderClass = "border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]";
      textClass = "text-primary font-semibold";
      icon = <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      break;
    case "done":
      bgClass = "bg-green-500/10";
      borderClass = "border-green-500/50";
      textClass = "text-green-500 font-semibold";
      icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
      break;
    case "error":
      bgClass = "bg-destructive/10";
      borderClass = "border-destructive/50";
      textClass = "text-destructive font-semibold";
      icon = <AlertTriangle className="h-5 w-5 text-destructive" />;
      break;
  }

  return (
    <div
      className={`relative flex min-w-[180px] flex-col rounded-xl border p-4 backdrop-blur-md transition-all duration-300 ${bgClass} ${borderClass}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground" />
      <div className="flex items-center gap-3">
        {icon}
        <div className="flex flex-col">
          <span className={`text-sm ${textClass}`}>{label}</span>
          {duration && <span className="text-xs text-muted-foreground">{duration}</span>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground" />
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
          strokeWidth: isActive ? 3 : 2,
          stroke: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
          strokeDasharray: isActive ? "5 5" : "none",
          animation: isActive ? "dashdraw 1s linear infinite" : "none",
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
    <div className="h-full w-full rounded-xl border bg-card/30 overflow-hidden relative group">
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
