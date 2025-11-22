import { useClientIP } from '@/hooks/useClientIP';
import { isIPWhitelisted, isMaintenanceBypassEnabled } from '@/lib/ipWhitelist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

/**
 * IP Debugger Component
 * Shows current client IP and whitelist status
 * Useful for development and testing maintenance mode
 *
 * Usage: Add <IPDebugger /> to any page temporarily to check IP
 */
export function IPDebugger() {
  const { ip, loading, error } = useClientIP();
  const [copied, setCopied] = useState(false);
  const isWhitelisted = isIPWhitelisted(ip);
  const isBypassEnabled = isMaintenanceBypassEnabled();

  const copyToClipboard = async () => {
    if (ip) {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          IP Debugger
          {(isWhitelisted || isBypassEnabled) && (
            <Badge variant="success" className="ml-2">
              Whitelisted
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Current client IP information and whitelist status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Your IP Address:</p>
          {loading && <p className="text-sm">Loading...</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {ip && (
            <div className="flex items-center gap-2">
              <code className="relative rounded bg-muted px-3 py-1.5 font-mono text-sm">
                {ip}
              </code>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title="Copy IP"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Whitelist Status:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">IP Whitelisted:</span>
              <Badge variant={isWhitelisted ? 'success' : 'secondary'}>
                {isWhitelisted ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">LocalStorage Bypass:</span>
              <Badge variant={isBypassEnabled ? 'success' : 'secondary'}>
                {isBypassEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Add this IP to <code className="text-xs">VITE_MAINTENANCE_WHITELIST_IPS</code> in your .env file to bypass maintenance mode.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
