import ReactFlow, { Background, Controls, ReactFlowProvider } from 'reactflow'
import type { Node, Edge } from 'reactflow'
import 'reactflow/dist/style.css'
import type { Architecture } from '../types'

function buildGraph(arch: Architecture): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = arch.services.map((s, i) => ({
    id: s.name,
    data: { label: `${s.name}${s.tech_stack ? '\n' + s.tech_stack : ''}` },
    position: { x: 200 * (i % 4), y: 150 * Math.floor(i / 4) },
    style: { background: '#1e1b4b', color: '#a5b4fc', border: '1px solid #4f46e5', borderRadius: 8, fontSize: 12, padding: 8 },
  }))

  const edges: Edge[] = arch.dependencies.map((d, i) => ({
    id: `e${i}`,
    source: d.from,
    target: d.to,
    label: d.type,
    style: { stroke: '#6366f1' },
    labelStyle: { fill: '#94a3b8', fontSize: 10 },
  }))

  return { nodes, edges }
}

export default function ArchDiagram({ architecture }: { architecture: Architecture }) {
  const { nodes, edges } = buildGraph(architecture)
  return (
    <div className="h-96 bg-gray-900 rounded-xl border border-gray-800">
      <ReactFlowProvider>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#374151" gap={20} />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}
