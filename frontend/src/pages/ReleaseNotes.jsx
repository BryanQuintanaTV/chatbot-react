import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Sparkles,
  Bug,
  Palette,
  Zap,
  Shield,
  Globe,
  MessageSquare,
  Keyboard,
  Archive,
  Pin,
  FolderOpen,
  Settings,
  User,
  Moon,
  CheckCircle2,
} from 'lucide-react';

export function ReleaseNotes() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const releases = [
    {
      version: '1.0.0',
      date: t('releases.v1.date'),
      type: 'major',
      highlights: t('releases.v1.highlights'),
      sections: [
        {
          title: t('releases.v1.auth.title'),
          icon: Shield,
          items: [
            t('releases.v1.auth.item1'),
            t('releases.v1.auth.item2'),
            t('releases.v1.auth.item3'),
            t('releases.v1.auth.item4'),
            t('releases.v1.auth.item5'),
            t('releases.v1.auth.item6'),
          ],
        },
        {
          title: t('releases.v1.chatManagement.title'),
          icon: MessageSquare,
          items: [
            t('releases.v1.chatManagement.item1'),
            t('releases.v1.chatManagement.item2'),
            t('releases.v1.chatManagement.item3'),
            t('releases.v1.chatManagement.item4'),
            t('releases.v1.chatManagement.item5'),
            t('releases.v1.chatManagement.item6'),
          ],
        },
        {
          title: t('releases.v1.ui.title'),
          icon: Palette,
          items: [
            t('releases.v1.ui.item1'),
            t('releases.v1.ui.item2'),
            t('releases.v1.ui.item3'),
            t('releases.v1.ui.item4'),
            t('releases.v1.ui.item5'),
          ],
        },
        {
          title: t('releases.v1.shortcuts.title'),
          icon: Keyboard,
          items: [
            t('releases.v1.shortcuts.item1'),
            t('releases.v1.shortcuts.item2'),
            t('releases.v1.shortcuts.item3'),
          ],
        },
        {
          title: t('releases.v1.i18n.title'),
          icon: Globe,
          items: [
            t('releases.v1.i18n.item1'),
            t('releases.v1.i18n.item2'),
            t('releases.v1.i18n.item3'),
          ],
        },
        {
          title: t('releases.v1.settings.title'),
          icon: Settings,
          items: [
            t('releases.v1.settings.item1'),
            t('releases.v1.settings.item2'),
            t('releases.v1.settings.item3'),
            t('releases.v1.settings.item4'),
          ],
        },
        {
          title: t('releases.v1.mobile.title'),
          icon: Zap,
          items: [
            t('releases.v1.mobile.item1'),
            t('releases.v1.mobile.item2'),
            t('releases.v1.mobile.item3'),
            t('releases.v1.mobile.item4'),
          ],
        },
      ],
    },
    {
      version: '0.3.4',
      date: t('releases.v0_3_4.date'),
      type: 'minor',
      highlights: t('releases.v0_3_4.highlights'),
      sections: [
        {
          title: t('releases.v0_3_4.features.title'),
          icon: Sparkles,
          items: [
            t('releases.v0_3_4.features.item1'),
            t('releases.v0_3_4.features.item2'),
            t('releases.v0_3_4.features.item3'),
            t('releases.v0_3_4.features.item4'),
          ],
        },
        {
          title: t('releases.v0_3_4.improvements.title'),
          icon: Zap,
          items: [
            t('releases.v0_3_4.improvements.item1'),
            t('releases.v0_3_4.improvements.item2'),
            t('releases.v0_3_4.improvements.item3'),
          ],
        },
        {
          title: t('releases.v0_3_4.fixes.title'),
          icon: Bug,
          items: [
            t('releases.v0_3_4.fixes.item1'),
            t('releases.v0_3_4.fixes.item2'),
            t('releases.v0_3_4.fixes.item3'),
          ],
        },
      ],
    },
  ];

  const getVersionColor = (type) => {
    switch (type) {
      case 'major':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'minor':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'patch':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('releases.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('releases.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {releases.map((release, index) => (
          <Card key={release.version} className="overflow-hidden">
            {/* Version Header */}
            <div className={`${getVersionColor(release.type)} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold">v{release.version}</h2>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                      {release.type === 'major'
                        ? t('releases.major')
                        : release.type === 'minor'
                          ? t('releases.minor')
                          : t('releases.patch')}
                    </span>
                  </div>
                  <p className="text-white/90">{release.date}</p>
                </div>
                {index === 0 && (
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-semibold">{t('releases.latest')}</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-white/95 text-lg">{release.highlights}</p>
            </div>

            {/* Sections */}
            <CardContent className="pt-6 space-y-6">
              {release.sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.title}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                    </div>
                    <ul className="space-y-2 ml-7">
                      {section.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {release.sections.indexOf(section) <
                      release.sections.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        {/* Footer */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="font-semibold">{t('releases.stayUpdated')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('releases.stayUpdatedDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
