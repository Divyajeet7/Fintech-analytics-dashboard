import React from 'react';
import { LayoutGrid, Briefcase, FileText, Link as LinkIcon, Upload, Projector, BarChart3, CheckSquare, Gavel, Settings, ChevronDown, Scale, ChevronRight } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', active: true },
    { icon: Briefcase, label: 'Portfolio' },
    { icon: FileText, label: 'Collection Entries' },
    { icon: LinkIcon, label: 'PG Link' },
    { icon: Upload, label: 'Bulk Upload' },
    { icon: Projector, label: 'Presentations' },
    { icon: BarChart3, label: 'Reports' },
    { icon: CheckSquare, label: 'PTP' },
    { icon: Gavel, label: 'Litigation Management' },
  ];

  return (
    <div className="w-64 bg-white h-full border-r border-slate-200 flex flex-col flex-shrink-0 z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex flex-col">
            <div className="flex items-center gap-1">
                <div className="w-7 h-7 rounded-full border-[3px] border-blue-700 flex items-center justify-center relative">
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white translate-x-1 -translate-y-1"></div>
                    <span className="text-blue-700 font-black text-sm leading-none">C</span>
                </div>
                <span className="text-2xl font-bold tracking-tighter leading-none flex items-baseline">
                    <span className="text-blue-700">CRE</span>
                    <span className="text-red-500">DIN</span>
                    <sup className="text-slate-400 text-[0.5rem] ml-0.5">®</sup>
                </span>
                <ChevronRight size={14} className="ml-auto text-slate-400" />
            </div>
            <span className="text-[0.55rem] text-slate-400 font-medium tracking-widest pl-9 -mt-1 uppercase">Enabling People</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar">
        {menuItems.map((item, idx) => (
          <div 
            key={idx}
            className={`flex items-center px-6 py-3 cursor-pointer transition-colors group relative ${
              item.active 
                ? 'text-slate-800' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {item.active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800 rounded-r"></div>}
            <item.icon size={18} className={`mr-4 ${item.active ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className={`text-sm ${item.active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
          </div>
        ))}
        
        {/* Dropdowns */}
        <div className="flex items-center justify-between px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 cursor-pointer group">
            <div className="flex items-center">
                <Settings size={18} className="mr-4 text-slate-400 group-hover:text-slate-600" />
                <span className="text-sm font-medium">Account Setting</span>
            </div>
            <ChevronDown size={14} />
        </div>

        <div className="flex items-center justify-between px-6 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 cursor-pointer group">
            <div className="flex items-center">
                <Scale size={18} className="mr-4 text-slate-400 group-hover:text-slate-600" />
                <span className="text-sm font-medium">Litigation</span>
            </div>
            <ChevronDown size={14} />
        </div>
      </nav>
    </div>
  );
};
export default Sidebar;
