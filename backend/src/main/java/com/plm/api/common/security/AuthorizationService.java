package com.plm.api.common.security;

import com.plm.api.file.entity.FileAttachment;
import com.plm.api.file.repository.FileRepository;
import com.plm.api.project.entity.Project;
import com.plm.api.project.entity.ProjectMember;
import com.plm.api.project.repository.ProjectMemberRepository;
import com.plm.api.project.repository.ProjectRepository;
import com.plm.api.task.entity.Task;
import com.plm.api.task.repository.TaskRepository;
import com.plm.api.user.entity.User;
import com.plm.api.user.entity.UserRole;
import com.plm.api.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthorizationService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private FileRepository fileRepository;
    
    /**
     * 사용자가 프로젝트의 리더인지 확인
     */
    public boolean isProjectLeader(Long userId, Long projectId) {
        Optional<Project> project = projectRepository.findById(projectId);
        if (project.isEmpty()) {
            return false;
        }
        
        return project.get().getManagerId().equals(userId);
    }
    
    /**
     * 사용자가 프로젝트 멤버인지 확인
     */
    public boolean isProjectMember(Long userId, Long projectId) {
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }
    
    /**
     * 사용자가 태스크에 접근할 수 있는지 확인
     */
    public boolean canAccessTask(Long userId, Long taskId) {
        Optional<Task> task = taskRepository.findById(taskId);
        if (task.isEmpty()) {
            return false;
        }
        
        Long projectId = task.get().getProject().getId();
        return isProjectMember(userId, projectId);
    }
    
    /**
     * 사용자가 태스크를 수정할 수 있는지 확인 (ADMIN 또는 프로젝트 리더)
     */
    public boolean canModifyTask(Long userId, Long taskId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return false;
        }
        
        // ADMIN은 모든 권한
        if (user.get().getRole() == UserRole.ADMIN) {
            return true;
        }
        
        // 프로젝트 리더 확인
        Optional<Task> task = taskRepository.findById(taskId);
        if (task.isEmpty()) {
            return false;
        }
        
        Long projectId = task.get().getProject().getId();
        return isProjectLeader(userId, projectId);
    }
    
    /**
     * 사용자가 프로젝트를 관리할 수 있는지 확인 (ADMIN 또는 프로젝트 리더)
     */
    public boolean canManageProject(Long userId, Long projectId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return false;
        }
        
        // ADMIN은 모든 권한
        if (user.get().getRole() == UserRole.ADMIN) {
            return true;
        }
        
        // 프로젝트 리더 확인
        return isProjectLeader(userId, projectId);
    }
    
    /**
     * 사용자가 댓글을 수정/삭제할 수 있는지 확인
     * - ADMIN: 모든 댓글
     * - LEADER: 자신이 리더인 프로젝트의 모든 댓글
     * - MEMBER: 본인이 작성한 댓글만
     */
    public boolean canModifyComment(Long userId, Long commentAuthorId, Long projectId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            return false;
        }
        
        // ADMIN은 모든 권한
        if (user.get().getRole() == UserRole.ADMIN) {
            return true;
        }
        
        // 본인이 작성한 댓글
        if (userId.equals(commentAuthorId)) {
            return true;
        }
        
        // 프로젝트 리더는 프로젝트 내 모든 댓글 관리 가능
        if (projectId != null && isProjectLeader(userId, projectId)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 사용자의 역할 확인
     */
    public boolean isAdmin(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.isPresent() && user.get().getRole() == UserRole.ADMIN;
    }
    
    public boolean isLeader(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.isPresent() && user.get().getRole() == UserRole.LEADER;
    }
    
    public boolean isMember(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.isPresent() && user.get().getRole() == UserRole.MEMBER;
    }
    
    /**
     * 파일 삭제 권한 확인
     * - ADMIN: 모든 파일 삭제 가능
     * - LEADER: 자신이 관리하는 프로젝트의 모든 파일 삭제 가능
     * - MEMBER: 본인이 업로드한 파일만 삭제 가능
     */
    public boolean canDeleteFile(Long userId, Long fileId) {
        // ADMIN은 모든 파일 삭제 가능
        if (isAdmin(userId)) {
            return true;
        }
        
        Optional<FileAttachment> fileOpt = fileRepository.findById(fileId);
        if (fileOpt.isEmpty()) {
            return false;
        }
        
        FileAttachment file = fileOpt.get();
        
        // 본인이 업로드한 파일이면 삭제 가능
        if (file.getUploader() != null && file.getUploader().getId().equals(userId)) {
            return true;
        }
        
        // LEADER이고 프로젝트 파일인 경우, 프로젝트 관리자면 삭제 가능
        if (isLeader(userId) && file.getProject() != null) {
            return isProjectLeader(userId, file.getProject().getId());
        }
        
        // LEADER이고 태스크 파일인 경우, 태스크의 프로젝트 관리자면 삭제 가능
        if (isLeader(userId) && file.getTask() != null) {
            Task task = file.getTask();
            if (task.getProject() != null) {
                return isProjectLeader(userId, task.getProject().getId());
            }
        }
        
        return false;
    }
}
