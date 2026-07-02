import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("🚨 [ErrorBoundary caught unhandled component crash]:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Try to clear key flags in localStorage that could be corrupted
      window.localStorage.removeItem('active_tab');
    } catch (e) {}
    window.location.reload();
  };

  private handleCopy = () => {
    if (!this.state.error) return;
    const report = `Error: ${this.state.error.message}\n\nStack:\n${this.state.error.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(report);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary-root" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          {/* Ambient glow backgrounds */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl w-full bg-slate-900/80 border-2 border-rose-500/20 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-display font-black tracking-tight text-white">
                  COSMIC SHIELD: SYSTEM RECOVERY ENGINE
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  STATUS CODE: [RENDER_CRASH_RECOVERED]
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                An unexpected interface render crash occurred in the client application runtime. Our <strong>Antigravity Shield</strong> has intercepted this fault to prevent a blank screen and guarantee runtime integrity.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4.5 space-y-3.5">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
                  🚨 Exception Details:
                </span>
                <p className="text-xs font-mono text-slate-300 bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg overflow-x-auto select-all">
                  {this.state.error?.toString() || "Unknown rendering exception intercepted."}
                </p>

                {this.state.errorInfo?.componentStack && (
                  <details className="group">
                    <summary className="text-[10px] font-mono font-bold text-slate-400 hover:text-slate-200 cursor-pointer select-none list-none flex items-center gap-1">
                      <span className="transition-transform group-open:rotate-90">▶</span>
                      SHOW COMPONENT STACK TRACE
                    </summary>
                    <pre className="mt-2 text-[9px] font-mono text-slate-500 bg-slate-900/60 p-3 rounded-lg overflow-auto max-h-40 leading-relaxed select-all">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/10 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>Reload & Reset View</span>
              </button>

              <button
                onClick={this.handleCopy}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{this.state.copied ? "Copied!" : "Copy Error Logs"}</span>
              </button>

              <div className="sm:ml-auto flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Aetherius Guard Active</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
