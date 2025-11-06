import Markdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import useAutoScroll from '@/hooks/useAutoScroll';
import Spinner from '@/components/Spinner';
import userIcon from '@/assets/images/user.svg';
import errorIcon from '@/assets/images/error.svg';
import bot from '@/assets/images/bot.svg';
import { Button } from "@/components/ui/button"
import ReportIssueDialog from "@/components/ReportIssueDialog";
import { toast } from "sonner";

function ChatMessages({ messages, isLoading }) {
  const { t } = useTranslation();
  const scrollContentRef = useAutoScroll(isLoading);

  return (
    <div ref={scrollContentRef} className="grow space-y-4">
      {messages.map(({ role, content, loading, error }, idx) => {
        const userMessage =
          role === "assistant"
            ? messages.slice(0, idx).reverse().find((m) => m.role === "user")?.content
            : null;

        return (
          <div
            key={idx}
            className={`flex items-start gap-4 py-4 px-3 rounded-xl ${
              role === "user" ? "bg-muted/50" : ""
            }`}
          >
            {role === "user" && (
              <img className="h-[26px] w-[26px] shrink-0" src={userIcon} alt="user" />
            )}
            {role === "assistant" && (
              <img className="h-[26px] w-[26px] shrink-0" src={bot} alt="assistant" />
            )}
            <div>
              <div className="markdown-container">
                {loading && !content ? (
                  <Spinner />
                ) : role === "assistant" ? (
                  <div>
                    <Markdown>{content}</Markdown>
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