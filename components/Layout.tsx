
import React from 'react';
import { LayoutDashboard, Ticket, Settings, Bell, Search, Building2, FileText } from 'lucide-react';

export type ViewMode = 'tickets' | 'dealerships' | 'resources';

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${active ? 'bg-gray-700 text-white border-r-4 border-primary' : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

interface LayoutProps {
  children?: React.ReactNode;
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

export default function Layout({ children, currentView, onNavigate }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex-shrink-0 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-700">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <span>Dub Hub</span>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem 
            icon={Ticket} 
            label="Tickets" 
            active={currentView === 'tickets'} 
            onClick={() => onNavigate('tickets')}
          />
          <SidebarItem 
            icon={Building2} 
            label="Dealerships" 
            active={currentView === 'dealerships'} 
            onClick={() => onNavigate('dealerships')}
          />
          <SidebarItem 
            icon={FileText} 
            label="Resources" 
            active={currentView === 'resources'} 
            onClick={() => onNavigate('resources')}
          />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
           <h1 className="text-xl font-semibold text-slate-800">
             {currentView === 'tickets' ? 'Tickets' : currentView === 'dealerships' ? 'Dealerships' : 'Resources'}
           </h1>
           
           <div className="flex items-center gap-4">
             <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Global Search..." 
                    className="pl-9 pr-4 py-2 rounded-md border border-slate-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
             </div>
             <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
