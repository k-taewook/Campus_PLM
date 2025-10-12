import { useState } from 'react';
import { FolderKanban, Users, UserPlus, Settings, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface SidebarItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'projects',
    icon: FolderKanban,
    label: '프로젝트 관리'
  },
  {
    id: 'teams',
    icon: Users,
    label: '팀 관리'
  },
  {
    id: 'users',
    icon: UserPlus,
    label: '사용자 관리'
  }
];

const settingsItem: SidebarItem = {
  id: 'settings',
  icon: Settings,
  label: '설정'
};

import type { PageType } from '../App';

interface CollapsibleSidebarProps {
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export default function CollapsibleSidebar({ isExpanded, onExpandChange, currentPage, onPageChange }: CollapsibleSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handlePageNavigation = (page: string) => {
    console.log(`${page} 페이지로 이동`);
    if (page === 'dashboard') onPageChange('dashboard');
    // 여기에 추가 페이지 이동 로직 추가
  };

  return (
    <div 
      className="h-full bg-sidebar border-r border-sidebar-border flex flex-col py-4"
      onMouseLeave={() => onExpandChange(false)}
    >
      <div className="px-4 mb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full">
              <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center hover:bg-sidebar-primary/90 transition-colors group">
                <span className="text-sidebar-primary-foreground font-bold">PLM</span>
                {isExpanded && (
                  <ChevronDown className="w-3 h-3 text-sidebar-primary-foreground ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-48 ml-2"
            sideOffset={8}
          >
            <DropdownMenuItem onClick={() => handlePageNavigation('dashboard')}>
              대시보드 페이지
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePageNavigation('current')}>
              현재 포함된 페이지
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePageNavigation('new')}>
              새로 추가할 페이지
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {isExpanded && (
          <div className="mt-3 opacity-0 animate-[fadeIn_0.3s_ease-in-out_0.1s_forwards]">
            <h3 className="text-sidebar-foreground">관리 시스템</h3>
          </div>
        )}
      </div>
      
      <nav className="flex-1 flex flex-col">
        <ul className="space-y-2 px-2 flex-1">
          {sidebarItems.map((item) => {
            const isHovered = hoveredItem === item.id;
            const isSelected = currentPage === item.id;
            const Icon = item.icon;
            
            return (
              <li key={item.id}>
                <button
                  className={`
                    relative w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-in-out group
                    ${isSelected 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }
                  `}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => onPageChange(item.id as PageType)}
                >
                  <div 
                    className="flex items-center justify-center w-5 h-5 flex-shrink-0"
                    onMouseEnter={() => onExpandChange(true)}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* 텍스트 라벨 - 사이드바 확장시 표시 */}
                  <span 
                    className={`
                      whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden
                      ${isExpanded 
                        ? 'opacity-100 max-w-xs' 
                        : 'opacity-0 max-w-0'
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        
        {/* 하단 설정 메뉴 */}
        <div className="px-2 mt-4">
          <button
            className={`
              relative w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-in-out group
              ${currentPage === 'settings'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }
            `}
            onMouseEnter={() => setHoveredItem(settingsItem.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => onPageChange('settings')}
          >
            <div 
              className="flex items-center justify-center w-5 h-5 flex-shrink-0"
              onMouseEnter={() => onExpandChange(true)}
            >
              <Settings className="w-5 h-5" />
            </div>
            
            {/* 텍스트 라벨 - 사이드바 확장시 표시 */}
            <span 
              className={`
                whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden
                ${isExpanded 
                  ? 'opacity-100 max-w-xs' 
                  : 'opacity-0 max-w-0'
                }
              `}
            >
              {settingsItem.label}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}