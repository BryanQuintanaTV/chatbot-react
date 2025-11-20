import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
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

export function AdvancedSearch({ messages = [], onMessageClick }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
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
        <Button variant="outline" size="sm">
          <Search className="mr-2 h-4 w-4" />
          {t('search.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('search.title')}</DialogTitle>
          <DialogDescription>
            {t('search.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Search Input */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
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

          {/* Toggle Filters Button */}
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('search.filters')}
              </span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Filters - Collapsible */}
          {showFilters && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-4 flex-shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Message Type Filters */}
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">{t('search.messageType')}</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('search.userMessages')}</span>
                    <Switch
                      checked={filters.userMessages}
                      onCheckedChange={(checked) => handleFilterChange('userMessages', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t('search.assistantMessages')}</span>
                    <Switch
                      checked={filters.assistantMessages}
                      onCheckedChange={(checked) => handleFilterChange('assistantMessages', checked)}
                    />
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">{t('search.dateRange')}</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: t('search.dateAll') },
                      { value: 'today', label: t('search.dateToday') },
                      { value: 'week', label: t('search.dateWeek') },
                      { value: 'month', label: t('search.dateMonth') }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange('dateRange', option.value)}
                        className={`
                          w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                          ${filters.dateRange === option.value
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          {(searchQuery || filters.dateRange !== 'all') && (
            <div className="flex items-center gap-4 text-sm flex-shrink-0">
              <Badge variant="secondary">
                {stats.total} {t('search.results', { count: stats.total })}
              </Badge>
              <span className="text-muted-foreground">
                {stats.userCount} {t('search.user')} • {stats.assistantCount} {t('search.assistant')}
              </span>
            </div>
          )}

          <Separator className="flex-shrink-0" />

          {/* Results - Takes remaining space */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full pr-4">
              {searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? t('search.noResults')
                      : t('search.emptyState')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  {searchResults.map((msg, index) => (
                    <div
                      key={index}
                      onClick={() => handleResultClick(msg.originalIndex)}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={msg.role === 'user' ? 'default' : 'secondary'}>
                          {msg.role === 'user' ? `👤 ${t('search.userBadge')}` : `🤖 ${t('search.assistantBadge')}`}
                        </Badge>
                        {msg.timestamp && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleString(t('common.locale'), {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-3">
                        {highlightText(msg.content, searchQuery)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
