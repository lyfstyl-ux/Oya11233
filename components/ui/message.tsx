"use client"

import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"
import { cn } from "@/lib/utils"

const Message = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    from: "user" | "assistant"
  }
>(({ className, from, ...props }, ref) => {
  const fromValue = typeof from === "string" ? from : "assistant"

  return (
    <div
      ref={ref}
      className={cn(
        "group flex w-full gap-3",
        fromValue === "user" ? "flex-row-reverse justify-end" : "flex-row justify-start",
        className,
      )}
      data-from={fromValue}
      {...props}
    />
  )
})
Message.displayName = "Message"

const MessageContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "contained" | "flat"
  }
>(({ className, variant = "contained", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "max-w-xs px-4 py-2.5 rounded-lg text-sm break-words",
        variant === "contained" &&
          "bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700",
        variant === "contained" &&
          "group-has-[data-from=user]:bg-blue-500 group-has-[data-from=user]:text-white group-has-[data-from=user]:rounded-br-none group-has-[data-from=user]:border-0 dark:group-has-[data-from=user]:bg-blue-600",
        variant === "flat" && "bg-transparent",
        className,
      )}
      {...props}
    />
  )
})
MessageContent.displayName = "MessageContent"

const MessageAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  React.ComponentPropsWithoutRef<typeof Avatar> & {
    src?: string
    name?: string
  }
>(({ className, src, name, ...props }, ref) => (
  <Avatar ref={ref} className={cn("h-8 w-8 ring-1 ring-slate-200 dark:ring-slate-700", className)} {...props}>
    {src && <AvatarImage src={src || "/placeholder.svg"} alt={name} />}
    <AvatarFallback>{name?.slice(0, 2).toUpperCase()}</AvatarFallback>
  </Avatar>
))
MessageAvatar.displayName = "MessageAvatar"

export { Message, MessageContent, MessageAvatar }
