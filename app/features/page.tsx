
export default function Features() {
  return (
    <main className="w-full">
      <section className="w-full max-w-3xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-semibold">Key features</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2 text-muted-foreground">
          <div>
            <h3 className="font-medium">Real-time voice conversation</h3>
            <p className="mt-2">Start a voice session and talk naturally — the demo streams microphone input and renders conversational responses in real time.</p>
          </div>
          <div>
            <h3 className="font-medium">Reactive visual orb</h3>
            <p className="mt-2">The orb visual reacts to input and output energy, providing an ambient cue for when the assistant is listening, thinking, or speaking.</p>
          </div>
          <div>
            <h3 className="font-medium">Accessibility-focused</h3>
            <p className="mt-2">Keyboard activation, ARIA labels, and reduced-motion support are included to make the demo usable by more people.</p>
          </div>
          <div>
            <h3 className="font-medium">Extensible and open</h3>
            <p className="mt-2">The code is modular: you can swap the agent, adapt the audio pipeline, or plug the UI into an existing app.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
