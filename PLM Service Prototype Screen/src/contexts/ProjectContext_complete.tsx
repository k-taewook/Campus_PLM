  const getUserRole = (pageId: string): ProjectMember['role'] | null => {
    const member = getProjectMember(pageId, userId);
    return member?.role || null;
  };

  // Helper functions
  const addActivity = (targetType: ActivityLog['targetType'], targetId: string, action: string, details?: string) => {
    if (!currentUser) return;
    
    let projectId = '';
    if (targetType === 'project') {
      projectId = targetId;
    } else if (targetType === 'task') {
      const task = projects.flatMap(p => p.tasks).find(t => t.id === targetId);
      projectId = task?.projectId || '';
    }
    
    const newActivity: ActivityLog = {
      id: `activity-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      targetType,
      targetId,
      projectId,
      details,
      timestamp: new Date().toISOString()
    };
    
    setActivities(prev => [newActivity, ...prev]);
  };

  return (
    <ProjectContext.Provider value={{
      currentUser,
      users,
      projects,
      activities,
      isAuthenticated,
      login,
      register,
      logout,
      createProject,
      updateProject,
      deleteProject,
      addProjectMember,
      removeProjectMember,
      updateMemberRole,
      updateMemberPermissions,
      createTask,
      updateTask,
      deleteTask,
      moveTask,
      assignTask,
      logTime,
      addComment,
      updateComment,
      deleteComment,
      addAttachment,
      removeAttachment,
      getMyProjects,
      getAssignedTasks,
      getTasksForProject,
      getUpcomingDeadlines,
      getProjectProgress,
      getProjectMember,
      getUserProjectRole,
      canEditProject,
      canManageMembers,
      canCreateTasks,
      canEditTask,
      canDeleteTasks,
      canManageSettings
    }}>
      {children}
    </ProjectContext.Provider>
  );
}