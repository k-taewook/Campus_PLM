import { useState } from 'react';
import { ProjectApiProvider } from './common/contexts/ProjectApiContext';
import ProjectApiDashboard from './features/project/components/ProjectApiDashboard';

function ProjectApiApp() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const handleProjectSelect = (projectId: number) => {
    setSelectedProjectId(projectId);
    setShowDashboard(false);
    // TODO: 프로젝트 상세 페이지로 이동
    console.log('Selected project:', projectId);
  };

  const handleCreateProject = () => {
    setShowCreateProject(true);
    // TODO: 프로젝트 생성 다이얼로그 표시
    console.log('Create new project');
  };

  const handleShowDashboard = () => {
    setSelectedProjectId(null);
    setShowDashboard(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 cursor-pointer" onClick={handleShowDashboard}>
                PLM System
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <button 
                onClick={handleShowDashboard}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  showDashboard 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                대시보드
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showDashboard && (
          <ProjectApiDashboard 
            onProjectSelect={handleProjectSelect}
            onCreateProject={handleCreateProject}
          />
        )}
        {selectedProjectId && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">프로젝트 상세 페이지</h2>
            <p className="text-gray-600 mb-4">프로젝트 ID: {selectedProjectId}</p>
            <button 
              onClick={handleShowDashboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              대시보드로 돌아가기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AppApi() {
  return (
    <ProjectApiProvider>
      <ProjectApiApp />
    </ProjectApiProvider>
  );
}