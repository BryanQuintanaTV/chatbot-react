import { useState, useMemo } from 'react';
import { Search, Filter, X, Calendar, Bot, Archive, Pin } from 'lucide-react';
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

export function AdvancedSearch({ messages = [] }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

    let filtered = [...messages];

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
          Buscar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Búsqueda avanzada</DialogTitle>
          <DialogDescription>
            Busca en los mensajes de la conversación y aplica filtros
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en mensajes..."
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

          {/* Filters */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Message Type Filters */}
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground">Tipo de mensaje</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mensajes de usuario</span>
                  <Switch
                    checked={filters.userMessages}
                    onCheckedChange={(checked) => handleFilterChange('userMessages', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Respuestas del asistente</span>
                  <Switch
                    checked={filters.assistantMessages}
                    onCheckedChange={(checked) => handleFilterChange('assistantMessages', checked)}
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground">Rango de fecha</Label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'Todo' },
                    { value: 'today', label: 'Hoy' },
                    { value: 'week', label: 'Última semana' },
                    { value: 'month', label: 'Último mes' }
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

          {/* Statistics */}
          {(searchQuery || filters.dateRange !== 'all') && (
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary">
                {stats.total} resultado{stats.total !== 1 ? 's' : ''}
              </Badge>
              <span className="text-muted-foreground">
                {stats.userCount} usuario • {stats.assistantCount} asistente
              </span>
            </div>
          )}

          <Separator />

          {/* Results */}
          <ScrollArea className="h-[300px] pr-4">
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? 'No se encontraron mensajes'
                    : 'Escribe algo para buscar'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((msg, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={msg.role === 'user' ? 'default' : 'secondary'}>
                        {msg.role === 'user' ? '👤 Usuario' : '🤖 Asistente'}
                      </Badge>
                      {msg.timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleString('es-MX', {
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
      </DialogContent>
    </Dialog>
  );
}
