import { useState } from 'react';
import { ProjectProvider, useProjects } from './contexts/ProjectContext';
import AuthScreen from './components/AuthScreen';
import ProjectSidebar from './components/ProjectSidebar';
import ProjectBoard from './components/ProjectBoard';
import ProjectDashboard from './components/ProjectDashboard';
import UserProfile from './components/UserProfile';
import AdminUserManagement from './components/AdminUserManagement';
import Settings from './components/Settings';
import CreateProjectDialog from './components/CreateProjectDialog';

function ProjectApp() {
  const { isAuthenticated } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showAdminUserManagement, setShowAdminUserManagement] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleProjectSelect = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    setShowDashboard(false);
    setShowUserProfile(false);
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
    setShowAdminUserManagement(false);
    setShowSettings(false);
  };

  const handleShowUserProfile = () => {
    setSelectedProjectId(null);
    setShowDashboard(false);
    setShowUserProfile(true);
    setShowAdminUserManagement(false);
    setShowSettings(false);
  };

  const handleShowAdminUserManagement = () => {
    setSelectedProjectId(null);
    setShowDashboard(false);
    setShowUserProfile(false);
    setShowAdminUserManagement(true);
    setShowSettings(false);
  };

  const handleShowSettings = () => {
    setSelectedProjectId(null);
    setShowDashboard(false);
    setShowUserProfile(false);
    setShowAdminUserManagement(false);
    setShowSettings(true);
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
            setShowAdminUserManagement(false);
            setShowSettings(false);
          }}
        />
      ) : null}

      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProjectProvider>
      <ProjectApp />
    </ProjectProvider>
  );
}