import { VisualizerScene } from './components/three/VisualizerScene'

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
        <header className="mb-8">
          <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
            Spring Boot + React
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Software Visualizer
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Frontenden är redo för Tailwind CSS och återanvändbara Three.js-komponenter.
            Dra i scenen för att rotera och scrolla för att zooma.
          </p>
        </header>

        <div className="min-h-[480px] flex-1 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-cyan-950/30">
          <VisualizerScene />
        </div>
      </section>
    </main>
  )
}

export default App
