
export default function About() {
  return (
    <main className="w-full">
      <section className="w-full max-w-3xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-semibold">About OyaTalk</h2>
        <p className="mt-4 text-muted-foreground">OyaTalk is an experimental demo that showcases natural, real-time voice conversations with an AI assistant. Built on ConvAI and ElevenLabs, it combines live audio streaming, a lightweight visualizer, and keyboard-first controls to make voice-powered interactions approachable and accessible.</p>

        <p className="mt-4 text-muted-foreground">This project is intended as a developer-facing demo: it illustrates how to wire microphone input, audio analysis, and an agent back-end into a responsive UI. It is not a production voice assistant — but it demonstrates the core building blocks you can reuse.</p>
      </section>
    </main>
  )
}
