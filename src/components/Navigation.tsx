import React from 'react';
import { BarChart3, Calendar, HelpCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobile: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView, isMobile }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'visualize', label: 'Visualize', icon: BarChart3 },
    { id: 'history', label: 'History', icon: Calendar },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/40 p-2 z-30">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView(item.id)}
              className="flex flex-col items-center p-2 h-auto min-w-[60px]"
            >
              <item.icon className="h-4 w-4 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mb-6">
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant={currentView === item.id ? "default" : "outline"}
          onClick={() => setCurrentView(item.id)}
          className="flex items-center gap-2"
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </div>
  );
};