import { Plus, FolderPlus, UserPlus, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const dashboardCards: DashboardCard[] = [
  {
    id: 'add-project',
    title: '프로젝트 추가',
    description: '새로운 프로젝트를 생성하고 관리를 시작하세요',
    icon: FolderPlus,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  {
    id: 'add-team',
    title: '팀 추가',
    description: '새로운 팀을 구성하고 멤버를 초대하세요',
    icon: Users,
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  {
    id: 'add-user',
    title: '사용자 추가',
    description: '새로운 사용자를 시스템에 등록하세요',
    icon: UserPlus,
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
  }
];

import type { PageType } from '../App';

interface MainDashboardProps {
  isCompact: boolean;
  onNavigate: (page: PageType) => void;
}

export default function MainDashboard({ isCompact, onNavigate }: MainDashboardProps) {
  const handleCardClick = (cardId: string) => {
    switch (cardId) {
      case 'add-project':
        onNavigate('projects');
        break;
      case 'add-team':
        onNavigate('teams');
        break;
      case 'add-user':
        onNavigate('users');
        break;
      default:
        console.log(`${cardId} 클릭됨`);
    }
  };

  return (
    <div className="flex-1 p-8 bg-background">
      <header className="mb-8">
        <h1 className="mb-2">PLM 관리 시스템</h1>
        <p className="text-muted-foreground">
          프로젝트, 팀, 사용자를 효율적으로 관리하세요
        </p>
      </header>

      <div className={`
        grid gap-6 transition-all duration-300 ease-in-out
        ${isCompact 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }
      `}>
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          
          return (
            <Card 
              key={card.id}
              className={`
                cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 
                ${card.color}
                ${isCompact ? 'scale-95' : 'scale-100'}
              `}
              onClick={() => handleCardClick(card.id)}
            >
              <CardHeader className={`text-center ${isCompact ? 'pb-2' : 'pb-4'}`}>
                <div className={`mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${
                  isCompact ? 'w-12 h-12' : 'w-16 h-16'
                }`}>
                  <Icon className={`text-gray-600 transition-all duration-300 ${
                    isCompact ? 'w-6 h-6' : 'w-8 h-8'
                  }`} />
                </div>
                <CardTitle className={`transition-all duration-300 ${
                  isCompact ? 'text-lg' : 'text-xl'
                }`}>{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className={`transition-all duration-300 ${
                  isCompact ? 'text-xs' : 'text-sm'
                }`}>
                  {card.description}
                </CardDescription>
                <div className={`mt-4 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 ${
                  isCompact ? 'text-xs' : 'text-sm'
                }`}>
                  <Plus className={`transition-all duration-300 ${
                    isCompact ? 'w-3 h-3' : 'w-4 h-4'
                  }`} />
                  시작하기
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 추가 섹션 - 최근 활동이나 통계 등을 위한 공간 */}
      <section className="mt-12">
        <h2 className="mb-4">빠른 시작</h2>
        <div className="bg-muted/50 rounded-lg p-6 border border-dashed border-border">
          <p className="text-muted-foreground text-center">
            위의 카드를 클릭하여 프로젝트, 팀, 또는 사용자를 추가해보세요.
          </p>
        </div>
      </section>
    </div>
  );
}