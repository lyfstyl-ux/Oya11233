"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { ComponentProps } from "react"
import { useConversation } from "@elevenlabs/react"
import { CheckIcon, CopyIcon, PhoneOffIcon, SendIcon, Mic } from "lucide-react"
import { Orb } from "./ui/orb"
import { Conversation, ConversationContent, ConversationEmptyState } from "./ui/conversation"
import { Message, MessageAvatar, MessageContent } from "./ui/message"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type AgentState = "disconnected" | "connecting" | "connected" | "disconnecting" | "speaking" | null

const DEFAULT_AGENT = {
  agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
  name: "OyaTalk Agent",
  description: "AI Voice Assistant",
}

type ChatActionsProps = ComponentProps<"div">

const ChatActions = ({ className, children, ...props }: ChatActionsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    {children}
  </div>
)

type ChatActionProps = ComponentProps<typeof Button> & {
  tooltip?: string
  label?: string
}

const ChatAction = ({
  tooltip,
  children,
  label,
  className,
  variant = "ghost",
  size = "sm",
  ...props
}: ChatActionProps) => {
  const button = (
    <Button
      className={cn("text-muted-foreground hover:text-foreground relative size-9 p-1.5", className)}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children}
      <span className="sr-only">{label || tooltip}</span>
    </Button>
  )

  return button
}

export function ConvAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [agentState, setAgentState] = useState<AgentState>("disconnected")
  const [textInput, setTextInput] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [inputLevel, setInputLevel] = useState<number>(0)
  const [outputLevel, setOutputLevel] = useState<number>(0)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const isTextOnlyModeRef = useRef<boolean>(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  // Use any here to avoid lib.dom typing mismatch between ArrayBuffer and SharedArrayBuffer
  const dataArrayRef = useRef<any>(null)
  const rafRef = useRef<number | null>(null)
  const outputAnimRef = useRef<number | null>(null)

  const conversation = useConversation({
    onConnect: () => {
      if (!isTextOnlyModeRef.current) {
        setMessages([])
      }
    },
    onDisconnect: () => {
      if (!isTextOnlyModeRef.current) {
        setMessages([])
      }
    },
    onMessage: (message) => {
      if (message.message) {
        const newMessage: ChatMessage = {
          role: message.source === "user" ? "user" : "assistant",
          content: message.message,
        }
        setMessages((prev) => [...prev, newMessage])
      }
    },
    onError: (error) => {
      console.error("Error:", error)
      setAgentState("disconnected")
    },
  })

  const getMicStream = useCallback(async () => {
    if (mediaStreamRef.current) return mediaStreamRef.current

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      setErrorMessage(null)
      try {
        // Create AudioContext/analyser to measure input level
        if (!audioContextRef.current) {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
          const audioCtx = new AudioCtx()
          audioContextRef.current = audioCtx
          const source = audioCtx.createMediaStreamSource(stream)
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 2048
          source.connect(analyser)
          analyserRef.current = analyser
          const bufferLength = analyser.fftSize
          dataArrayRef.current = new Uint8Array(bufferLength)

          const update = () => {
            const analyserNode = analyserRef.current
            const dataArray = dataArrayRef.current
            if (!analyserNode || !dataArray) return
            // TS lib typings can be strict about ArrayBuffer types from SharedArrayBuffer vs ArrayBuffer.
            // Cast here to satisfy the analyser API which expects a Uint8Array backed by an ArrayBuffer.
            // Pass the buffer (typed as any) to the analyser - runtime expects a Uint8Array-compatible view
            analyserNode.getByteTimeDomainData(dataArray)
            let sum = 0
            for (let i = 0; i < dataArray.length; i++) {
              const v = (dataArray[i] - 128) / 128
              sum += v * v
            }
            const rms = Math.sqrt(sum / dataArray.length)
            // smooth and clamp
            const level = Math.min(1, rms * 1.8)
            setInputLevel((prev) => Math.max(level, prev * 0.85))
            rafRef.current = requestAnimationFrame(update)
          }
          rafRef.current = requestAnimationFrame(update)
        }
      } catch (err) {
        console.warn("Audio analyser setup failed", err)
      }

      return stream
    } catch (error) {
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          setErrorMessage("Microphone permission denied. Please enable it in browser settings.")
        } else if (error.name === "NotFoundError") {
          setErrorMessage("No microphone found on this device.")
        } else {
          setErrorMessage("Unable to access microphone. Please check your settings.")
        }
      }
      console.error("Microphone error:", error)
      throw error
    }
  }, [])

  // Broadcast audio levels and agent state globally so other UI (like background orb) can react.
  useEffect(() => {
    try {
      const detail = { inputLevel, outputLevel, agentState }
      window.dispatchEvent(new CustomEvent("agent-audio", { detail }))
    } catch (err) {
      // ignore in non-browser environments
    }
  }, [inputLevel, outputLevel, agentState])

  const startConversation = useCallback(
    async (textOnly = true, skipConnectingMessage = false) => {
      try {
        isTextOnlyModeRef.current = textOnly

        if (!skipConnectingMessage) {
          setMessages([])
        }

        try {
          if (!textOnly) {
            await getMicStream()
          }
        } catch {
          // If mic access fails, fall back to text-only mode
          setErrorMessage("Falling back to text-only mode. Voice will be disabled.")
          isTextOnlyModeRef.current = true
        }

        await conversation.startSession({
          agentId: DEFAULT_AGENT.agentId,
          connectionType: isTextOnlyModeRef.current ? "websocket" : "webrtc",
          overrides: {
            conversation: {
              textOnly: isTextOnlyModeRef.current,
            },
            agent: {
              firstMessage: isTextOnlyModeRef.current ? "" : undefined,
            },
          },
          onStatusChange: (status) => setAgentState(status.status),
        })
      } catch (error) {
        console.error(error)
        setAgentState("disconnected")
        setMessages([])
      }
    },
    [conversation, getMicStream],
  )

  const handleCall = useCallback(async () => {
    if (agentState === "disconnected" || agentState === null) {
      setAgentState("connecting")
      try {
        await startConversation(false)
      } catch {
        setAgentState("disconnected")
      }
    } else if (agentState === "connected") {
      conversation.endSession()
      setAgentState("disconnected")

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
        mediaStreamRef.current = null
      }
    }
  }, [agentState, conversation, startConversation])

  const handleTextInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value)
  }, [])

  const handleSendText = useCallback(async () => {
    if (!textInput.trim()) return

    const messageToSend = textInput

    if (agentState === "disconnected" || agentState === null) {
      const userMessage: ChatMessage = {
        role: "user",
        content: messageToSend,
      }
      setTextInput("")
      setAgentState("connecting")

      try {
        await startConversation(true, true)
        setMessages([userMessage])
        conversation.sendUserMessage(messageToSend)
      } catch (error) {
        console.error("Failed to start conversation:", error)
      }
    } else if (agentState === "connected") {
      const newMessage: ChatMessage = {
        role: "user",
        content: messageToSend,
      }
      setMessages((prev) => [...prev, newMessage])
      setTextInput("")

      conversation.sendUserMessage(messageToSend)
    }
  }, [textInput, agentState, conversation, startConversation])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendText()
      }
    },
    [handleSendText],
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close()
        } catch {}
        audioContextRef.current = null
      }
    }
  }, [])

  // Pulse a synthetic output level while the agent is speaking. If you have access to
  // the actual audio output stream, you could connect it to an analyser similarly.
  useEffect(() => {
    let outAnim: number | null = null
    const tick = () => {
      // create a pulsating output while speaking
      if (agentState === "speaking") {
        const value = 0.3 + Math.random() * 0.7
        setOutputLevel((prev) => Math.max(value, prev * 0.7))
      } else {
        setOutputLevel((prev) => prev * 0.85)
      }
      outAnim = requestAnimationFrame(tick)
    }

    outAnim = requestAnimationFrame(tick)

    return () => {
      if (outAnim) cancelAnimationFrame(outAnim)
    }
  }, [agentState])

  const isCallActive = agentState === "connected"
  const isTransitioning = agentState === "connecting" || agentState === "disconnecting"

  // Map the conversation agent status to the Orb's visual states
  const orbState =
    agentState === "speaking"
      ? "talking"
      : agentState === "connecting"
      ? "thinking"
      : agentState === "connected"
      ? "listening"
      : null

  return (
    <div className="mx-auto w-full max-w-2xl flex flex-col gap-0 h-screen md:h-auto md:rounded-2xl md:border md:border-border/50 md:shadow-lg overflow-hidden bg-background">
      <div className="flex-shrink-0 border-b border-border/40 p-6 md:p-8 flex flex-col items-center gap-4">
        <div className="w-24 h-24 flex items-center justify-center">
          <Orb
            agentState={orbState}
            inputLevel={inputLevel}
            outputLevel={outputLevel}
          />
        </div>
        {errorMessage && <div className="text-center text-xs text-destructive font-medium">{errorMessage}</div>}
      </div>

      <Conversation className="flex-1 p-4 md:p-6">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title={
                agentState === "connecting"
                  ? "Starting conversation..."
                  : agentState === "connected"
                    ? "Start talking or type"
                    : "Start a conversation"
              }
              description={
                agentState === "connecting"
                  ? "Connecting to agent"
                  : agentState === "connected"
                    ? "Ready to chat"
                    : "Type a message or use voice"
              }
            />
          ) : (
            <>
              {messages.map((message, index) => (
                <Message key={index} from={message.role}>
                  <MessageAvatar name={message.role === "user" ? "You" : "OyaTalk"} />
                  <div className="flex flex-col gap-1">
                    <MessageContent variant="contained">{message.content}</MessageContent>
                    {message.role === "assistant" && (
                      <ChatActions className="ml-0">
                        <ChatAction
                          size="sm"
                          label={copiedIndex === index ? "Copied!" : "Copy"}
                          onClick={() => {
                            navigator.clipboard.writeText(message.content)
                            setCopiedIndex(index)
                            setTimeout(() => setCopiedIndex(null), 2000)
                          }}
                        >
                          {copiedIndex === index ? (
                            <CheckIcon className="size-3.5" />
                          ) : (
                            <CopyIcon className="size-3.5" />
                          )}
                        </ChatAction>
                      </ChatActions>
                    )}
                  </div>
                </Message>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </ConversationContent>
      </Conversation>

      {/* Input Area with Conversation Controls */}
      <div className="flex-shrink-0 border-t border-border/40 gap-2 p-4 md:p-6 flex items-center">
        <Input
          value={textInput}
          onChange={handleTextInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="h-10 focus-visible:ring-1 focus-visible:ring-primary"
          disabled={isTransitioning}
        />
        <Button
          onClick={handleSendText}
          size="icon"
          variant="ghost"
          className={cn("h-10 w-10 rounded-lg", !textInput.trim() && "opacity-50")}
          disabled={!textInput.trim() || isTransitioning}
          aria-label="Send message"
        >
          <SendIcon className="size-4" />
        </Button>
        {!isCallActive && (
          <Button
            onClick={handleCall}
            size="icon"
            variant="outline"
            className="h-10 w-10 rounded-lg bg-transparent"
            disabled={isTransitioning}
            aria-label="Start voice call"
          >
            <Mic className="size-4" />
          </Button>
        )}
        {isCallActive && (
          <Button
            onClick={handleCall}
            size="icon"
            variant="destructive"
            className="h-10 w-10 rounded-lg"
            disabled={isTransitioning}
            aria-label="End call"
          >
            <PhoneOffIcon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default ConvAI