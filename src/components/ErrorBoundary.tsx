import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado:', error, errorInfo)
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-4 font-sans">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4 font-bold text-neon-pink">ERROR</div>
            <h1 className="text-3xl font-bold mb-4 font-pixel text-white">Algo salió mal</h1>
            <p className="text-text-secondary mb-6">
              Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>
            {this.state.error && (
              <p className="text-text-muted text-xs mb-4 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-neon-blue text-black rounded-lg font-bold hover:scale-105 transition-transform font-pixel text-xs"
              >
                Recargar Página
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-bg-secondary border border-white/10 text-white rounded-lg font-bold hover:border-neon-blue transition-all font-pixel text-xs"
              >
                Ir al Inicio
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

