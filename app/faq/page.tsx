
export default function FAQ() {
  return (
    <main className="w-full">
      <section className="w-full max-w-3xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-4 text-muted-foreground space-y-4">
          <div>
            <h4 className="font-medium">Does this store my audio?</h4>
            <p className="mt-1">No audio is persisted by the demo itself — microphone data is streamed to the configured agent service during an active session. Treat any demo deployment as potentially logged by third-party services unless you control the back end.</p>
          </div>
          <div>
            <h4 className="font-medium">What browsers are supported?</h4>
            <p className="mt-1">Modern Chromium-based browsers and Firefox are supported. Mobile support depends on device capabilities and permissions for microphone access.</p>
          </div>
          <div>
            <h4 className="font-medium">How can I adapt this for production?</h4>
            <p className="mt-1">For production use, implement server-side authentication, secure media routing, explicit user consent, and proper data retention policies. Replace any demo API keys with your own and review third-party service terms.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
