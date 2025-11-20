import Markdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import useAutoScroll from '@/hooks/useAutoScroll';
import Spinner from '@/components/Spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarDisplay, getUserInitials } from '@/lib/avatars';
import userIcon from '@/assets/images/user.svg';
import errorIcon from '@/assets/images/error.svg';
import bot from '@/assets/images/bot.svg';
import { Button } from "@/components/ui/button"
import ReportIssueDialog from "@/components/ReportIssueDialog";
import { toast } from "sonner";

function ChatMessages({ messages, isLoading, highlightedMessageIndex }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const scrollContentRef = useAutoScroll(isLoading);

  const getModelBadge = (modelUsed) => {
    if (!modelUsed || modelUsed === 'unknown') return null;

    const badges = {
      groq: {
        label: t('models.groq'),
        icon: '⚡',
        className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      },
      pytorch: {
        label: t('models.pytorch'),
        icon: '🏫',
        className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      }
    };

    const badge = badges[modelUsed] || {
      label: modelUsed,
      icon: '🤖',
      className: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  return (
    <div ref={scrollContentRef} className="space-y-4">
      {messages.map(({ role, content, loading, error, modelUsed }, idx) => {
        const userMessage =
          role === "assistant"
            ? messages.slice(0, idx).reverse().find((m) => m.role === "user")?.content
            : null;

        return (
          <div
            key={idx}
            data-message-index={idx}
            className={`flex items-start gap-4 py-4 px-3 rounded-xl transition-all duration-500 ${
              role === "user" ? "bg-muted/50" : ""
            } ${
              highlightedMessageIndex === idx
                ? "ring-2 ring-primary ring-offset-2 bg-primary/10"
                : ""
            }`}
          >
            {role === "user" && (
              <Avatar className="h-[26px] w-[26px] shrink-0">
                {getAvatarDisplay(user).type === 'url' && (
                  <AvatarImage src={getAvatarDisplay(user).value} />
                )}
                {getAvatarDisplay(user).type === 'gradient' && (
                  <div className={`w-full h-full bg-gradient-to-br ${getAvatarDisplay(user).value} flex items-center justify-center text-white font-semibold text-xs`}>
                    {getUserInitials(user?.name)}
                  </div>
                )}
                {getAvatarDisplay(user).type === 'initials' && (
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getAvatarDisplay(user).value}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            {role === "assistant" && (
              <img className="h-[26px] w-[26px] shrink-0" src={bot} alt="assistant" />
            )}
            <div>
              <div className="markdown-container text-foreground">
                {loading && !content ? (
                  <Spinner />
                ) : role === "assistant" ? (
                  <div>
                    <Markdown>{content}</Markdown>
                    {modelUsed && (
                      <div className="mt-2">
                        {getModelBadge(modelUsed)}
                      </div>
                    )}
                    <ReportIssueDialog message={content} userMessage={userMessage} />
                  </div>
                ) : (
                  <div className="whitespace-pre-line">{content}</div>
                )}
              </div>
              {error && (
                <div
                  className={`flex items-center gap-1 text-sm text-destructive ${
                    content && "mt-2"
                  }`}
                >
                  <img className="h-5 w-5" src={errorIcon} alt="error" />
                  <span>{t('chat.error')}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatMessages;