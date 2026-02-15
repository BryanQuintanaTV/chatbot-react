import { useState } from 'react';
import Markdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import useAutoScroll from '@/hooks/useAutoScroll';
import Spinner from '@/components/Spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from 'lucide-react';
import bot from '@/assets/images/bot.svg';

/**
 * UserMessage — pill-shaped bubble aligned right (prompt-kit style).
 */
function UserMessage({ content, user, isHighlighted, idx }) {
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
      className={cn(
        'mx-auto flex w-full max-w-3xl flex-col items-end px-2 md:px-10 transition-all duration-500',
        isHighlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl'
      )}
    >
      <div className="group flex w-full flex-col items-end gap-1">
        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
          <MessageContent className="bg-muted text-foreground rounded-3xl px-5 py-2.5 whitespace-pre-line">
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
        <MessageActions className="mr-9 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <MessageAction tooltip={copied ? t('export.copied') : t('export.copyClipboard')}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </MessageAction>
        </MessageActions>
      </div>
    </Message>
  );
}

/**
 * AssistantMessage — full-width with avatar, markdown, model badge, and actions.
 * 3-dot menu with "Report Problem" appears on hover (always on last message).
 */
function AssistantMessage({
  content,
  loading,
  error,
  modelUsed,
  userMessage,
  isLastMessage,
  isHighlighted,
  idx,
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
        className:
          'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      },
      pytorch: {
        label: t('models.pytorch'),
        icon: '🏫',
        className:
          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      },
    };

    const badge = badges[model] || {
      label: model,
      icon: '🤖',
      className: 'bg-secondary text-muted-foreground',
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
      >
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  return (
    <>
      <Message
        data-message-index={idx}
        className={cn(
          'mx-auto flex w-full max-w-3xl flex-col gap-2 px-2 md:px-10 items-start transition-all duration-500',
          isHighlighted && 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl'
        )}
      >
        <div className="flex items-start gap-3 w-full">
          <img
            className="h-8 w-8 shrink-0 rounded-full mt-0.5"
            src={bot}
            alt="assistant"
          />
          <div className="group flex w-full flex-col gap-0 min-w-0">
            {loading && !content ? (
              <Spinner />
            ) : (
              <>
                <MessageContent className="text-foreground bg-transparent p-0 markdown-container w-full min-w-0 flex-1">
                  <Markdown>{content}</Markdown>
                </MessageContent>

                {modelUsed && (
                  <div className="mt-2">{getModelBadge(modelUsed)}</div>
                )}

                {error && (
                  <div className="flex items-center gap-1.5 text-sm text-destructive mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{t('chat.error')}</span>
                  </div>
                )}

                <MessageActions
                  className={cn(
                    '-ml-2 mt-1 flex gap-0 transition-opacity duration-150',
                    isLastMessage
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  )}
                >
                  <MessageAction
                    tooltip={
                      copied ? t('export.copied') : t('export.copyClipboard')
                    }
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </MessageAction>

                  <DropdownMenu>
                    <MessageAction tooltip={t('chat.moreActions')}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                    </MessageAction>
                    <DropdownMenuContent align="start" sideOffset={4}>
                      <DropdownMenuItem
                        disabled={isReported}
                        onSelect={() => setReportOpen(true)}
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        {isReported
                          ? t('report.submitted')
                          : t('report.button')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

/**
 * ChatMessages — renders the conversation using prompt-kit style components.
 */
function ChatMessages({ messages, isLoading, highlightedMessageIndex }) {
  const { user } = useAuth();
  const scrollContentRef = useAutoScroll(isLoading);

  return (
    <div ref={scrollContentRef} className="space-y-8 py-4">
      {messages.map(({ role, content, loading, error, modelUsed }, idx) => {
        const isLastMessage = idx === messages.length - 1;
        const userMessage =
          role === 'assistant'
            ? messages
                .slice(0, idx)
                .reverse()
                .find((m) => m.role === 'user')?.content
            : null;

        if (role === 'user') {
          return (
            <UserMessage
              key={idx}
              content={content}
              user={user}
              isHighlighted={highlightedMessageIndex === idx}
              idx={idx}
            />
          );
        }

        return (
          <AssistantMessage
            key={idx}
            content={content}
            loading={loading}
            error={error}
            modelUsed={modelUsed}
            userMessage={userMessage}
            isLastMessage={isLastMessage}
            isHighlighted={highlightedMessageIndex === idx}
            idx={idx}
          />
        );
      })}
    </div>
  );
}

export default ChatMessages;
