import React from 'react';
import { Heart, Calendar, BarChart3, Settings } from 'lucide-react';

export type NavTab = 'home' | 'calendar' | 'analytics' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const items: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Главная',
      icon: <Heart className="w-5 h-5" />
    },
    {
      id: 'calendar',
      label: 'Календарь',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 'analytics',
      label: 'История',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-blush-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-safe transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center transition-all duration-200 relative ${
                isActive
                  ? 'text-blush-600 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-2xl transition-all ${
                  isActive ? 'bg-blush-50 shadow-xs' : 'bg-transparent'
                }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-5 h-1 rounded-full bg-blush-500 animate-fade-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
