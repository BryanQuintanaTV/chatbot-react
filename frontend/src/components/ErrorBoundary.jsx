import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">¡Oops! Algo salió mal</CardTitle>
              <CardDescription className="text-base">
                La aplicación encontró un error inesperado. No te preocupes, tus datos están seguros.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    Error: {this.state.error.toString()}
                  </p>
                  {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">
                        Stack trace (desarrollo)
                      </summary>
                      <pre className="mt-2 overflow-auto max-h-60 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Sugerencias:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                  <li>Intenta recargar la página</li>
                  <li>Verifica tu conexión a internet</li>
                  <li>Limpia el caché del navegador si el problema persiste</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                variant="default"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Intentar de nuevo
              </Button>
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar página
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Home className="mr-2 h-4 w-4" />
                Ir al inicio
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
