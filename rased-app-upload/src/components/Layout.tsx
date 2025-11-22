import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  accentColor?: string;
}

export function Layout({ children, headerContent, footerContent, accentColor = "#000091" }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Header decorative stripe */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }}></div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {/* Use a simple text logo or icon if no image is provided */}
             <div className="flex flex-col">
               <span className="font-bold text-lg tracking-tight text-slate-900">RASED</span>
               <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 leading-none">Formulaire de demande</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             {headerContent}
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          {footerContent || (
            <p>
              Données stockées localement dans votre navigateur. Aucune donnée n'est envoyée vers un serveur.
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
