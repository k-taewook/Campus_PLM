// This is the final part of ProjectContext.tsx, starting from line 893

    const user = users.find(u => u.id === userId);
    addActivity('project', projectId, 'member-removed', `${user?.name}님을 프로젝트에서 제거했습니다`);
  };

  const updateMemberRole = (projectId: string, userId: string, role: ProjectMember['role']) => {
    if (!currentUser) return;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Can't change lead role
    if (project.leadId === userId && role !== 'lead') return;
    
    const getDefaultPermissions = (role: ProjectMember['role']): ProjectMember['permissions'] => {
      switch (role) {
        case 'lead':
          return {
            canEditProject: true,
            canManageMembers: true,
            canCreateTasks: true,
            canEditAllTasks: true,
            canDeleteTasks: true,
            canManageSettings: true,
            canViewReports: true
          };
        case 'admin':
          return {
            canEditProject: true,
            canManageMembers: true,
            canCreateTasks: true,
            canEditAllTasks: true,
            canDeleteTasks: true,
            canManageSettings: true,
            canViewReports: true
          };
        case 'developer':
          return {
            canEditProject: false,
            canManageMembers: false,
            canCreateTasks: true,
            canEditAllTasks: false,
            canDeleteTasks: false,
            canManageSettings: false,
            canViewReports: true
          };
        case 'designer':
          return {
            canEditProject: false,
            canManageMembers: false,
            canCreateTasks: true,
            canEditAllTasks: false,
            canDeleteTasks: false,
            canManageSettings: false,
            canViewReports: true
          };
        case 'tester':
          return {
            canEditProject: false,
            canManageMembers: false,
            canCreateTasks: true,
            canEditAllTasks: false,
            canDeleteTasks: false,
            canManageSettings: false,
            canViewReports: true
          };
        case 'viewer':
          return {
            canEditProject: false,
            canManageMembers: false,
            canCreateTasks: false,
            canEditAllTasks: false,
            canDeleteTasks: false,
            canManageSettings: false,
            canViewReports: true
          };
        default:
          return {
            canEditProject: false,
            canManageMembers: false,
            canCreateTasks: false,
            canEditAllTasks: false,
            canDeleteTasks: false,
            canManageSettings: false,
            canViewReports: false
          };
      }
    };

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            members: project.members.map(member => 
              member.userId === userId 
                ? { 
                    ...member, 
                    role,
                    permissions: getDefaultPermissions(role)
                  }
                : member
            ),
            updatedAt: new Date().toISOString()
          }
        : project
    ));

    const user = users.find(u => u.id === userId);
    addActivity('project', projectId, 'role-updated', `${user?.name}님의 역할을 ${role}로 변경했습니다`);
  };

  const updateMemberPermissions = (projectId: string, userId: string, permissions: Partial<ProjectMember['permissions']>) => {
    if (!currentUser) return;

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            members: project.members.map(member => 
              member.userId === userId 
                ? { 
                    ...member, 
                    permissions: { ...member.permissions, ...permissions }
                  }
                : member
            ),
            updatedAt: new Date().toISOString()
          }
        : project
    ));

    const user = users.find(u => u.id === userId);
    addActivity('project', projectId, 'permissions-updated', `${user?.name}님의 권한을 수정했습니다`);
  };

  // Task functions (continuing from the original file)
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments' | 'loggedHours' | 'progress'>): string => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: [],
      loggedHours: 0,
      progress: 0
    };
    
    setProjects(prev => prev.map(project => 
      project.id === taskData.projectId 
        ? { ...project, tasks: [...project.tasks, newTask] }
        : project
    ));
    
    addActivity('task', newTask.id, 'created', `태스크를 생성했습니다: ${newTask.title}`);
    return newTask.id;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    })));
    
    addActivity('task', taskId, 'updated', '태스크를 수정했습니다');
  };

  const deleteTask = (taskId: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.filter(task => task.id !== taskId)
    })));
    
    addActivity('task', taskId, 'deleted', '태스크를 삭제했습니다');
  };

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
    addActivity('task', taskId, 'moved', `태스크 상태를 ${newStatus}로 변경했습니다`);
  };

  const assignTask = (taskId: string, assigneeId: string) => {
    updateTask(taskId, { assigneeId });
    const assignee = users.find(u => u.id === assigneeId);
    addActivity('task', taskId, 'assigned', `태스크를 ${assignee?.name}에게 할당했습니다`);
  };

  const logTime = (taskId: string, hours: number, description?: string) => {
    const task = projects.flatMap(p => p.tasks).find(t => t.id === taskId);
    if (task) {
      const newLoggedHours = task.loggedHours + hours;
      const progress = task.estimatedHours ? Math.min(100, (newLoggedHours / task.estimatedHours) * 100) : task.progress;
      updateTask(taskId, { 
        loggedHours: newLoggedHours,
        progress: Math.round(progress)
      });
      addActivity('task', taskId, 'logged-time', `${hours}시간을 기록했습니다`);
    }
  };

  // Comment functions
  const addComment = (targetType: 'project' | 'task', targetId: string, content: string, attachments: Attachment[] = []) => {
    if (!currentUser) return;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      content,
      createdAt: new Date().toISOString(),
      attachments
    };

    if (targetType === 'task') {
      setProjects(prev => prev.map(project => ({
        ...project,
        tasks: project.tasks.map(task => 
          task.id === targetId 
            ? { ...task, comments: [...task.comments, newComment] }
            : task
        )
      })));
    }
    
    addActivity('comment', newComment.id, 'commented', '댓글을 남겼습니다');
  };

  const updateComment = (commentId: string, content: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.map(task => ({
        ...task,
        comments: task.comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, content, updatedAt: new Date().toISOString() }
            : comment
        )
      }))
    })));
  };

  const deleteComment = (commentId: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      tasks: project.tasks.map(task => ({
        ...task,
        comments: task.comments.filter(comment => comment.id !== commentId)
      }))
    })));
  };

  // Attachment functions
  const addAttachment = (targetType: 'project' | 'task' | 'comment', targetId: string, attachmentData: Omit<Attachment, 'id' | 'uploadedAt'>) => {
    const newAttachment: Attachment = {
      ...attachmentData,
      id: `att-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };

    if (targetType === 'task') {
      setProjects(prev => prev.map(project => ({
        ...project,
        tasks: project.tasks.map(task => 
          task.id === targetId 
            ? { ...task, attachments: [...task.attachments, newAttachment] }
            : task
        )
      })));
    } else if (targetType === 'project') {
      setProjects(prev => prev.map(project => 
        project.id === targetId 
          ? { ...project, attachments: [...project.attachments, newAttachment] }
          : project
      ));
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      attachments: project.attachments.filter(att => att.id !== attachmentId),
      tasks: project.tasks.map(task => ({
        ...task,
        attachments: task.attachments.filter(att => att.id !== attachmentId)
      }))
    })));
  };

  // Utility functions
  const getMyProjects = (): Project[] => {
    if (!currentUser) return [];
    return projects.filter(project => 
      project.leadId === currentUser.id || 
      project.members.some(member => member.userId === currentUser.id)
    );
  };

  const getAssignedTasks = (): Task[] => {
    if (!currentUser) return [];
    return projects.flatMap(project => 
      project.tasks.filter(task => task.assigneeId === currentUser.id)
    );
  };

  const getTasksForProject = (projectId: string): Task[] => {
    const project = projects.find(p => p.id === projectId);
    return project?.tasks || [];
  };

  const getUpcomingDeadlines = (): Task[] => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return projects.flatMap(project => 
      project.tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= now && dueDate <= sevenDaysFromNow && task.status !== 'done';
      })
    ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  };

  const getProjectProgress = (projectId: string): number => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.tasks.length === 0) return 0;
    
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const getProjectMember = (projectId: string, userId?: string): ProjectMember | null => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return null;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    return project.members.find(member => member.userId === targetUserId) || null;
  };

  const getUserProjectRole = (projectId: string, userId?: string): ProjectMember['role'] | null => {
    const member = getProjectMember(projectId, userId);
    return member?.role || null;
  };

  // Permission checks
  const canEditProject = (projectId: string): boolean => {
    if (!currentUser) return false;
    const member = getProjectMember(projectId);
    return member?.permissions.canEditProject || false;
  };

  const canManageMembers = (projectId: string): boolean => {
    if (!currentUser) return false;
    const member = getProjectMember(projectId);
    return member?.permissions.canManageMembers || false;
  };

  const canCreateTasks = (projectId: string): boolean => {
    if (!currentUser) return false;
    const member = getProjectMember(projectId);
    return member?.permissions.canCreateTasks || false;
  };

  const canEditTask = (taskId: string): boolean => {
    if (!currentUser) return false;
    const task = projects.flatMap(p => p.tasks).find(t => t.id === taskId);
    if (!task) return false;
    
    const member = getProjectMember(task.projectId);
    if (!member) return false;
    
    // Can edit if assigned to task, reported the task, or has permission to edit all tasks
    return task.assigneeId === currentUser.id || 
           task.reporterId === currentUser.id || 
           member.permissions.canEditAllTasks;
  };

  const canDeleteTasks = (projectId: string): boolean => {
    if (!currentUser) return false;
    const member = getProjectMember(projectId);
    return member?.permissions.canDeleteTasks || false;
  };

  const canManageSettings = (projectId: string): boolean => {
    if (!currentUser) return false;
    const member = getProjectMember(projectId);
    return member?.permissions.canManageSettings || false;
  };

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