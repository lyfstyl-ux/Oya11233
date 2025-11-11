
export default function Contact() {
  return (
    <main className="w-full">
      <section className="w-full max-w-3xl mx-auto py-16 px-4 pb-40">
        <h2 className="text-2xl font-semibold">Contact & resources</h2>
        <p className="mt-4 text-muted-foreground">Questions or suggestions? Open an issue on the project's repository or submit a pull request. For configuration details and implementation notes, see the README in the repo.</p>

        <div className="mt-4 text-muted-foreground">
          <p>
            Project: <a className="text-primary underline" href="https://github.com/jonatanvm/convai-demo" target="_blank" rel="noopener noreferrer">convai-demo (upstream)</a>
          </p>
          <p className="mt-2">Contact: <a className="text-primary underline" href="mailto:maintainer@example.com">maintainer@example.com</a> (replace with your contact)</p>
        </div>
      </section>
    </main>
  )
}
