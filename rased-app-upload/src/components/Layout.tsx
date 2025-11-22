import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  headerContent?: React.ReactNode;
  accentColor?: string;
}

export function Layout({ children, sidebar, headerContent, accentColor = "#000091" }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Header decorative stripe */}
      <div className="h-1.5 w-full flex-shrink-0" style={{ backgroundColor: accentColor }}></div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm z-30 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
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

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <div className="hidden md:block flex-shrink-0 h-full overflow-hidden">
            {sidebar}
          </div>
        )}

        {/* Content Area */}
        <main className="flex-grow h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>

          <footer className="mt-12 text-center text-slate-400 text-xs pb-4">
            Données stockées localement. Aucune donnée n'est envoyée vers un serveur.
          </footer>
        </main>
      </div>
    </div>
  );
}
