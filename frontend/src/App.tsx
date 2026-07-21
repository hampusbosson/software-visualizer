import { lazy, Suspense, useState } from 'react'

import { FileUploadCard } from './features/file-upload/components/FileUploadCard'
import type { AnalysisResponse } from './types/graph'

const GraphVisualizerScene = lazy(
  () => import('./features/graph-visualizer/components/GraphVisualizerScene'),
)

function App() {
  const [analysisResponse, setAnalysisResponse] = useState<AnalysisResponse | null>(null)

  if (analysisResponse) {
    return (
      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center bg-[#080b12] text-sm text-slate-400">
            Building scene…
          </main>
        }
      >
        <GraphVisualizerScene analysisResponse={analysisResponse} />
      </Suspense>
    )
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080b12] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.055),transparent_36%)]" />

      <section className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <FileUploadCard setAnalysisResponse={setAnalysisResponse} />
      </section>
    </main>
  )
}

export default App
