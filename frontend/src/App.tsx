import React, { useState } from 'react';
import { ProjectProvider, useProjects } from './contexts/ProjectContext';
import { useAuth } from './contexts/AuthContext';
import ProjectSidebar from './components/ProjectSidebar';
import ProjectBoard from './components/ProjectBoard';
import ProjectDashboard from './components/ProjectDashboard';
import UserProfile from './components/UserProfile';
import AdminUserManagement from './components/AdminUserManagement';
import Settings from './components/Settings';
import CreateProjectDialog from './components/CreateProjectDialog';
import TeamManagement from './components/TeamManagement';

function ProjectApp() {
  const { user } = useAuth(); // AuthContext 사용
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showAdminUserManagement, setShowAdminUserManagement] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showTeamManagement, setShowTeamManagement] = useState(false);

  const handleProjectSelect = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    setShowDashboard(false);
    setShowUserProfile(false);
    setShowTeamManagement(false);
    setShowAdminUserManagement(false);
    setShowSettings(false);
  };

  const handleCreateProject = () => {
    setShowCreateProject(true);
  };

  const handleShowDashboard = () => {
    setSelectedProjectId(null);
    setShowDashboard(true);
    setShowUserProfile(false);
    setShowTeamManagement(false);
    setShowAdminUserManagement(false);
    setShowSettings(false);
  };

  const handleShowUserProfile = () => {
    setSelectedProjectId(null);
    setShowDashboard(false);
    setShowUserProfile(true);
    setShowTeamManagement(false);
    setShowAdminUserManagement(false);
    setShowSettings(false);
  };

  const handleShowAdminUserManagement = () => {
    setSelectedProjectId(null);
    setShowDashboard(false);
    setShowUserProfile(false);
    setShowAdminUserManagement(true);
    setShowTeamManagement(false);
    setShowSettings(false);
  };

  const handleShowSettings = () => {
    setSelectedProjectId(null);
    setShowDashboard(false);
    setShowUserProfile(false);
    setShowAdminUserManagement(false);
    setShowTeamManagement(false);
    setShowSettings(true);
  };

  const handleShowTeamManagement = () => {
    setSelectedProjectId(null);
    setShowDashboard(false);
    setShowUserProfile(false);
    setShowAdminUserManagement(false);
    setShowSettings(false);
    setShowTeamManagement(true);
  };



  return (
    <div className="h-screen flex bg-white" lang="ko">
      {/* Sidebar */}
      <ProjectSidebar 
        selectedProjectId={selectedProjectId}
        onProjectSelect={handleProjectSelect}
        onCreateProject={handleCreateProject}
        showDashboard={showDashboard}
        onShowDashboard={handleShowDashboard}
        showUserProfile={showUserProfile}
        onShowUserProfile={handleShowUserProfile}
        showTeamManagement={showTeamManagement}
        onShowTeamManagement={handleShowTeamManagement}
        showAdminUserManagement={showAdminUserManagement}
        onShowAdminUserManagement={handleShowAdminUserManagement}
        showSettings={showSettings}
        onShowSettings={handleShowSettings}
      />
      
      {/* Main Content */}
      {showDashboard ? (
        <ProjectDashboard 
          onProjectSelect={handleProjectSelect}
          onCreateProject={handleCreateProject}
        />
      ) : showUserProfile ? (
        <UserProfile />
      ) : showTeamManagement ? (
        <TeamManagement isCompact={false} />
      ) : showAdminUserManagement ? (
        <AdminUserManagement />
      ) : showSettings ? (
        <Settings />
      ) : selectedProjectId ? (
        <ProjectBoard 
          projectId={selectedProjectId} 
          onBack={() => {
            setSelectedProjectId(null);
            setShowDashboard(true);
            setShowUserProfile(false);
            setShowTeamManagement(false);
            setShowAdminUserManagement(false);
            setShowSettings(false);
          }}
        />
      ) : null}

      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
        onProjectCreated={() => {
          // 프로젝트 생성 후 대시보드로 이동
          setSelectedProjectId(null);
          setShowDashboard(true);
          setShowUserProfile(false);
          setShowAdminUserManagement(false);
          setShowSettings(false);
          // 페이지 새로고침으로 데이터 다시 로드
          window.location.reload();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider children={<ProjectApp />} />
  );
}