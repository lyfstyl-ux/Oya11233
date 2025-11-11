"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { OyaTalkLogo, GithubLogo } from "@/components/logos"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Features", href: "/features" },
    { label: "Contact", href: "/contact" },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden sm:grid w-full grid-cols-2 py-4 px-8 fixed top-0 left-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center">
          <Link href="/" prefetch={true} className="hover:opacity-75 transition-opacity">
            <OyaTalkLogo className="h-[28px] w-auto" />
          </Link>
        </div>

        <div className="flex gap-6 justify-end items-center">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="https://github.com/jonatanvm/convai-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="p-0.5"
            aria-label="View source on GitHub"
          >
            <GithubLogo className="w-5 h-5 hover:text-gray-500 text-[#24292f] dark:text-white" />
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between py-4 px-4 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <Link href="/" prefetch={true}>
          <OyaTalkLogo className="h-[24px] w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 top-14 z-30 bg-background/95 backdrop-blur border-r border-border/40">
          <div className="flex flex-col gap-4 p-6">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-base font-medium text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border/40">
              <Link
                href="https://github.com/jonatanvm/convai-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"
              >
                <GithubLogo className="w-4 h-4" />
                GitHub
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
