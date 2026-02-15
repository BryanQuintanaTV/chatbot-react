import { useState } from 'react';
import Markdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
} from '@/components/prompt-kit/message';
import ReportIssueDialog from '@/components/ReportIssueDialog';
import { getAvatarDisplay, getUserInitials } from '@/lib/avatars';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  Copy,
  Check,
  Flag,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import bot from '@/assets/images/bot.svg';

/* ── Helpers ────────────────────────────────────────────────── */

function formatTimestamp(ts, t) {
  if (!ts) return null;
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return t('chat.justNow');
  if (diffMins < 60) return t('chat.minutesAgo', { count: diffMins });
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return t('chat.hoursAgo', { count: diffHours });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isSameDay(ts1, ts2) {
  if (!ts1 || !ts2) return true;
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function formatDaySeparator(ts) {
  if (!ts) return null;
  const date = new Date(ts);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return null; // today — no separator needed
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

/* ── Typing indicator (3 bouncing dots) ─────────────────────── */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

/* ── Timestamp badge (shown on hover) ───────────────────────── */

function MessageTimestamp({ timestamp, t: translate }) {
  const label = formatTimestamp(timestamp, translate);
  if (!label) return null;
  return (
    <span className="text-[11px] text-muted-foreground select-none">
      {label}
    </span>
  );
}

/* ── UserMessage ────────────────────────────────────────────── */

function UserMessage({ content, user, isHighlighted, idx, timestamp }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('export.errorCopy'));
    }
  };

  return (
    <Message
      data-message-index={idx}
      className="mx-auto flex w-full max-w-3xl flex-col items-end px-2 md:px-10 animate-message-enter"
    >
      <div className="group flex w-full flex-col items-end gap-1">
        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
          <MessageContent className={cn(
            "bg-muted text-foreground rounded-3xl px-5 py-2.5 whitespace-pre-line transition-shadow duration-300",
            isHighlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          )}>
            {content}
          </MessageContent>
          <Avatar className="h-7 w-7 shrink-0">
            {getAvatarDisplay(user).type === 'url' && (
              <AvatarImage src={getAvatarDisplay(user).value} />
            )}
            {getAvatarDisplay(user).type === 'gradient' && (
              <div
                className={`w-full h-full bg-gradient-to-br ${getAvatarDisplay(user).value} flex items-center justify-center text-white font-semibold text-xs`}
              >
                {getUserInitials(user?.name)}
              </div>
            )}
            {getAvatarDisplay(user).type === 'initials' && (
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getAvatarDisplay(user).value}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <MessageActions className="mr-9 flex items-center gap-1">
          <MessageTimestamp timestamp={timestamp} t={t} />
          <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <MessageAction tooltip={copied ? t('export.copied') : t('export.copyClipboard')}>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </MessageAction>
          </span>
        </MessageActions>
      </div>
    </Message>
  );
}

/* ── AssistantMessage ───────────────────────────────────────── */

function AssistantMessage({
  content,
  loading,
  error,
  modelUsed,
  userMessage,
  isLastMessage,
  isHighlighted,
  idx,
  timestamp,
  onRetry,
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('export.errorCopy'));
    }
  };

  const getModelBadge = (model) => {
    if (!model || model === 'unknown') return null;

    const badges = {
      groq: {
        label: t('models.groq'),
        icon: '⚡',
        className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      },
      pytorch: {
        label: t('models.pytorch'),
        icon: '🏫',
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      },
    };

    const badge = badges[model] || {
      label: model,
      icon: '🤖',
      className: 'bg-secondary text-muted-foreground',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  return (
    <>
      <Message
        data-message-index={idx}
        className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-2 md:px-10 items-start animate-message-enter"
      >
        <div className="flex items-start gap-3 w-full">
          <img className="h-8 w-8 shrink-0 rounded-full mt-0.5" src={bot} alt="assistant" />
          <div className="group flex w-full flex-col gap-0 min-w-0">
            {loading && !content ? (
              <TypingIndicator />
            ) : (
              <>
                <MessageContent className={cn(
                  "text-foreground bg-transparent p-0 markdown-container w-full min-w-0 flex-1 transition-shadow duration-300 rounded-xl",
                  isHighlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}>
                  <Markdown>{content}</Markdown>
                </MessageContent>

                {modelUsed && <div className="mt-2">{getModelBadge(modelUsed)}</div>}

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{t('chat.error')}</span>
                    {onRetry && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={onRetry}>
                        <RotateCcw className="h-3 w-3" />
                        {t('chat.retry')}
                      </Button>
                    )}
                  </div>
                )}

                <MessageActions className="-ml-2 mt-1 flex items-center gap-0">
                  <MessageTimestamp timestamp={timestamp} t={t} />

                  <span className={cn(
                    'flex items-center gap-0 transition-opacity duration-150',
                    isLastMessage ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}>
                    <MessageAction tooltip={copied ? t('export.copied') : t('export.copyClipboard')}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleCopy}>
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </MessageAction>

                    <DropdownMenu>
                      <MessageAction tooltip={t('chat.moreActions')}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                      </MessageAction>
                      <DropdownMenuContent align="start" sideOffset={4}>
                        <DropdownMenuItem disabled={isReported} onSelect={() => setReportOpen(true)}>
                          <Flag className="h-4 w-4 mr-2" />
                          {isReported ? t('report.submitted') : t('report.button')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </span>
                </MessageActions>
              </>
            )}
          </div>
        </div>
      </Message>

      <ReportIssueDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        message={content}
        userMessage={userMessage}
        onSubmitted={() => setIsReported(true)}
      />
    </>
  );
}

/* ── Day separator ──────────────────────────────────────────── */

function DaySeparator({ label }) {
  return (
    <div className="flex items-center gap-3 mx-auto max-w-3xl px-2 md:px-10">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/* ── ChatMessages ───────────────────────────────────────────── */

function ChatMessages({ messages, isLoading, highlightedMessageIndex, scrollContentRef, onRetry }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div ref={scrollContentRef} className="space-y-4 py-4">
      {/* #13 — aria-live region for screen readers */}
      <div aria-live="polite" aria-atomic="false" className="sr-only">
        {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <span>{messages[messages.length - 1].content}</span>
        )}
      </div>

      {messages.map(({ role, content, loading, error, modelUsed, timestamp }, idx) => {
        const isLastMessage = idx === messages.length - 1;
        const userMessage =
          role === 'assistant'
            ? messages.slice(0, idx).reverse().find((m) => m.role === 'user')?.content
            : null;

        const prevTimestamp = idx > 0 ? messages[idx - 1].timestamp : null;
        const showDaySeparator = timestamp && !isSameDay(prevTimestamp, timestamp);
        const dayLabel = showDaySeparator ? formatDaySeparator(timestamp) : null;

        return (
          <div key={idx}>
            {dayLabel && <DaySeparator label={dayLabel} />}

            {role === 'user' ? (
              <UserMessage
                content={content}
                user={user}
                isHighlighted={highlightedMessageIndex === idx}
                idx={idx}
                timestamp={timestamp}
              />
            ) : (
              <AssistantMessage
                content={content}
                loading={loading}
                error={error}
                modelUsed={modelUsed}
                userMessage={userMessage}
                isLastMessage={isLastMessage}
                isHighlighted={highlightedMessageIndex === idx}
                idx={idx}
                timestamp={timestamp}
                onRetry={isLastMessage && error ? onRetry : undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ChatMessages;
