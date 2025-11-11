"use client"

import * as React from "react"
import { Button } from "./button"
import { ArrowDownIcon } from "lucide-react"

const Conversation = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    initial?: "smooth" | "auto"
    resize?: "smooth" | "auto"
  }
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col gap-4 overflow-y-auto flex-1 ${className || ""}`} {...props} />
))
Conversation.displayName = "Conversation"

const ConversationContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={`flex flex-col gap-4 ${className || ""}`} {...props} />,
)
ConversationContent.displayName = "ConversationContent"

const ConversationEmptyState = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string
    description?: string
    icon?: React.ReactNode
  }
>(({ className, title, description, icon, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-full flex-col items-center justify-center gap-2 text-center py-8 ${className || ""}`}
    {...props}
  >
    {icon && <div className="text-4xl">{icon}</div>}
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground">{description}</p>
    {children}
  </div>
))
ConversationEmptyState.displayName = "ConversationEmptyState"

const ConversationScrollButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    size="icon"
    variant="outline"
    className={`absolute bottom-2 right-2 rounded-full h-10 w-10 ${className || ""}`}
    {...props}
  >
    <ArrowDownIcon className="h-4 w-4" />
  </Button>
))
ConversationScrollButton.displayName = "ConversationScrollButton"

export { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton }
