import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { GeneralReportDialog } from '@/components/GeneralReportDialog';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Settings,
  Shield,
  Zap,
  BookOpen,
  HelpCircle,
} from 'lucide-react';

export function HelpCenter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (id) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const faqCategories = [
    {
      id: 'general',
      title: t('help.general.title'),
      icon: HelpCircle,
      questions: [
        {
          id: 'what-is',
          question: t('help.general.whatIs'),
          answer: t('help.general.whatIsAnswer'),
        },
        {
          id: 'how-works',
          question: t('help.general.howWorks'),
          answer: t('help.general.howWorksAnswer'),
        },
        {
          id: 'dataset',
          question: t('help.general.dataset'),
          answer: t('help.general.datasetAnswer'),
        },
      ],
    },
    {
      id: 'features',
      title: t('help.features.title'),
      icon: Zap,
      questions: [
        {
          id: 'multiple-chats',
          question: t('help.features.multipleChats'),
          answer: t('help.features.multipleChatsAnswer'),
        },
        {
          id: 'categories',
          question: t('help.features.categories'),
          answer: t('help.features.categoriesAnswer'),
        },
        {
          id: 'shortcuts',
          question: t('help.features.shortcuts'),
          answer: t('help.features.shortcutsAnswer'),
        },
        {
          id: 'themes',
          question: t('help.features.themes'),
          answer: t('help.features.themesAnswer'),
        },
      ],
    },
    {
      id: 'account',
      title: t('help.account.title'),
      icon: Settings,
      questions: [
        {
          id: 'need-account',
          question: t('help.account.needAccount'),
          answer: t('help.account.needAccountAnswer'),
        },
        {
          id: 'institutional-email',
          question: t('help.account.institutionalEmail'),
          answer: t('help.account.institutionalEmailAnswer'),
        },
        {
          id: 'profile',
          question: t('help.account.profile'),
          answer: t('help.account.profileAnswer'),
        },
        {
          id: 'forgot-password',
          question: t('help.account.forgotPassword'),
          answer: t('help.account.forgotPasswordAnswer'),
        },
      ],
    },
    {
      id: 'chats',
      title: t('help.chats.title'),
      icon: MessageSquare,
      questions: [
        {
          id: 'create-chat',
          question: t('help.chats.createChat'),
          answer: t('help.chats.createChatAnswer'),
        },
        {
          id: 'edit-chat',
          question: t('help.chats.editChat'),
          answer: t('help.chats.editChatAnswer'),
        },
        {
          id: 'pin-archive',
          question: t('help.chats.pinArchive'),
          answer: t('help.chats.pinArchiveAnswer'),
        },
        {
          id: 'delete-chat',
          question: t('help.chats.deleteChat'),
          answer: t('help.chats.deleteChatAnswer'),
        },
      ],
    },
    {
      id: 'privacy',
      title: t('help.privacy.title'),
      icon: Shield,
      questions: [
        {
          id: 'data-storage',
          question: t('help.privacy.dataStorage'),
          answer: t('help.privacy.dataStorageAnswer'),
        },
        {
          id: 'conversations',
          question: t('help.privacy.conversations'),
          answer: t('help.privacy.conversationsAnswer'),
        },
        {
          id: 'security',
          question: t('help.privacy.security'),
          answer: t('help.privacy.securityAnswer'),
        },
      ],
    },
    {
      id: 'troubleshooting',
      title: t('help.troubleshooting.title'),
      icon: BookOpen,
      questions: [
        {
          id: 'slow-responses',
          question: t('help.troubleshooting.slowResponses'),
          answer: t('help.troubleshooting.slowResponsesAnswer'),
        },
        {
          id: 'error-message',
          question: t('help.troubleshooting.errorMessage'),
          answer: t('help.troubleshooting.errorMessageAnswer'),
        },
        {
          id: 'report-bug',
          question: t('help.troubleshooting.reportBug'),
          answer: t('help.troubleshooting.reportBugAnswer'),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('help.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('help.description')}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {faqCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {category.questions.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Separator className="my-2" />}
                    <Collapsible
                      open={openItems[`${category.id}-${item.id}`]}
                      onOpenChange={() => toggleItem(`${category.id}-${item.id}`)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-3 py-4 h-auto font-medium text-left hover:bg-muted/50"
                        >
                          <span className="text-sm">{item.question}</span>
                          {openItems[`${category.id}-${item.id}`] ? (
                            <ChevronDown className="h-4 w-4 shrink-0 ml-2" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 ml-2" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 pt-1">
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {item.answer}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {/* Additional Help */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="font-semibold">{t('help.stillNeedHelp')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('help.stillNeedHelpDescription')}
              </p>
              <GeneralReportDialog>
                <Button variant="outline">
                  {t('help.contactSupport')}
                </Button>
              </GeneralReportDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
