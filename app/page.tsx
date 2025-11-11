"use client"

import dynamic from "next/dynamic"

const ConvAI = dynamic(() => import("@/components/ConvAI"), {
 ssr: false,
 loading: () => <div className="w-full h-screen flex items-center justify-center">Loading...</div>,
})

export default function Home() {
  return (
    <main className="w-full">
      <ConvAI />
    </main>
  )
}