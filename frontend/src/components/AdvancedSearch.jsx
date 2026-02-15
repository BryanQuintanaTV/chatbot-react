import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, ChevronDown, ChevronUp, User, Bot, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function AdvancedSearch({ messages = [], onMessageClick, trigger }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [showFilters, setShowFilters] = useState(isDesktop);
  const [filters, setFilters] = useState({
    userMessages: true,
    assistantMessages: true,
    dateRange: 'all', // all, today, week, month
  });

  // Search and filter logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && filters.dateRange === 'all') {
      return [];
    }

    // Add original index to each message
    let filtered = messages.map((msg, index) => ({ ...msg, originalIndex: index }));

    // Filter by role
    if (!filters.userMessages || !filters.assistantMessages) {
      filtered = filtered.filter(msg => {
        if (filters.userMessages && msg.role === 'user') return true;
        if (filters.assistantMessages && msg.role === 'assistant') return true;
        return false;
      });
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const ranges = {
        today: 1,
        week: 7,
        month: 30
      };
      const daysAgo = ranges[filters.dateRange];
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(msg => {
        const msgDate = msg.timestamp ? new Date(msg.timestamp) : new Date();
        return msgDate >= cutoffDate;
      });
    }

    // Search in content
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(msg =>
        msg.content.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [messages, searchQuery, filters]);

  // Statistics
  const stats = useMemo(() => {
    const total = searchResults.length;
    const userCount = searchResults.filter(m => m.role === 'user').length;
    const assistantCount = searchResults.filter(m => m.role === 'assistant').length;

    return {
      total,
      userCount,
      assistantCount
    };
  }, [searchResults]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset filter visibility when dialog opens based on screen size
  useEffect(() => {
    if (open) {
      setShowFilters(isDesktop);
    }
  }, [open, isDesktop]);

  const clearSearch = () => {
    setSearchQuery('');
    setFilters({
      userMessages: true,
      assistantMessages: true,
      dateRange: 'all'
    });
  };

  const handleResultClick = (messageIndex) => {
    if (onMessageClick) {
      onMessageClick(messageIndex);
      setOpen(false); // Close dialog
    }
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            {t('search.button')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[90vh] md:h-[80vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-4 pt-4 md:px-6 md:pt-6 pb-0">
          <DialogTitle>{t('search.title')}</DialogTitle>
          <DialogDescription>
            {t('search.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden px-4 md:px-6 pb-4 md:pb-6 gap-3">
          {/* Search Input */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters toggle + inline stats */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" />
              {t('search.filters')}
              {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>

            {(searchQuery || filters.dateRange !== 'all') && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="h-6 text-xs">
                  {stats.total} {t('search.results', { count: stats.total })}
                </Badge>
                <span className="hidden sm:inline">
                  {stats.userCount} {t('search.user')} · {stats.assistantCount} {t('search.assistant')}
                </span>
              </div>
            )}
          </div>

          {/* Filters - Collapsible */}
          {showFilters && (
            <div className="bg-muted/30 rounded-lg p-3 flex-shrink-0 border">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Message Type Filters — compact chips */}
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {t('search.messageType')}
                  </Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFilterChange('userMessages', !filters.userMessages)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                        filters.userMessages
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                      }`}
                    >
                      <User className="h-3 w-3" />
                      {t('search.userMessages')}
                    </button>
                    <button
                      onClick={() => handleFilterChange('assistantMessages', !filters.assistantMessages)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                        filters.assistantMessages
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                      }`}
                    >
                      <Bot className="h-3 w-3" />
                      {t('search.assistantMessages')}
                    </button>
                  </div>
                </div>

                {/* Date Range Filter — compact chips */}
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {t('search.dateRange')}
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: 'all', label: t('search.dateAll') },
                      { value: 'today', label: t('search.dateToday') },
                      { value: 'week', label: t('search.dateWeek') },
                      { value: 'month', label: t('search.dateMonth') }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange('dateRange', option.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                          filters.dateRange === option.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator className="flex-shrink-0" />

          {/* Results — scrollable */}
          <ScrollArea className="flex-1 min-h-0">
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? t('search.noResults')
                    : t('search.emptyState')}
                </p>
              </div>
            ) : (
              <div className="space-y-2 pr-4 pb-2">
                {searchResults.map((msg, index) => (
                  <div
                    key={index}
                    onClick={() => handleResultClick(msg.originalIndex)}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group/result"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant={msg.role === 'user' ? 'default' : 'secondary'} className="text-xs h-5">
                        {msg.role === 'user' ? t('search.userBadge') : t('search.assistantBadge')}
                      </Badge>
                      {msg.timestamp && (
                        <span className="text-[11px] text-muted-foreground ml-auto">
                          {new Date(msg.timestamp).toLocaleString(t('common.locale'), {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm line-clamp-3 text-foreground/80">
                      {highlightText(msg.content, searchQuery)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
