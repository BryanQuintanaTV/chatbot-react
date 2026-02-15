/**
 * Message compound component — inspired by prompt-kit (https://prompt-kit.com)
 *
 * Components used from prompt-kit pattern:
 *   - Message (container)
 *   - MessageContent (bubble/text area)
 *   - MessageActions (action buttons container)
 *   - MessageAction (individual action with tooltip)
 *
 * These components are unstyled containers — visual differentiation between
 * user/assistant messages is achieved through className props at the usage level,
 * following prompt-kit's philosophy of maximum flexibility.
 */
import React from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Message — outer flex container for a single message.
 */
const Message = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex gap-3", className)} {...props}>
      {children}
    </div>
  )
})
Message.displayName = "Message"

/**
 * MessageContent — the bubble / text content area.
 * By default has subtle styling; override with className for user vs assistant.
 */
const MessageContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg text-foreground break-words whitespace-normal",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MessageContent.displayName = "MessageContent"

/**
 * MessageActions — container for action buttons below a message.
 * Typically shown on hover via group/group-hover pattern.
 */
function MessageActions({ className, children }) {
  return (
    <div
      className={cn("text-muted-foreground flex items-center gap-1", className)}
    >
      {children}
    </div>
  )
}

/**
 * MessageAction — individual action button wrapped in a tooltip.
 */
function MessageAction({
  tooltip,
  children,
  side = "bottom",
  className,
  delayDuration = 200,
}) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex", className)}>{children}</span>
        </TooltipTrigger>
        <TooltipContent side={side}>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { Message, MessageContent, MessageActions, MessageAction }
