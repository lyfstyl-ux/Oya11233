import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
// BackgroundWave removed to disable background orb/video
import { Navigation } from "@/components/navigation"

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })

export const metadata: Metadata = {
  title: "OyaTalk - AI Voice Conversation",
  description: "Experience natural conversations with OyaTalk, an advanced AI voice assistant.",
  icons: {
    icon: "/favicon.ico",
  },
  generator: "v0.app",
}

export const viewport = {
  themeColor: "#0f0e08",
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full w-full ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`antialiased w-full h-full flex flex-col font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navigation />
          <div className="flex flex-col flex-grow w-full items-center justify-center sm:px-4 sm:pt-20 pt-16">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
