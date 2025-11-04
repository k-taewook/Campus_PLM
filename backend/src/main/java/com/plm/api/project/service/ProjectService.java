package com.plm.api.project.service;

import com.plm.api.project.dto.ProjectDto;
import com.plm.api.project.dto.ProjectMemberDto;
import com.plm.api.project.entity.Project;
import com.plm.api.project.entity.ProjectMember;
import com.plm.api.project.entity.ProjectStatus;
import com.plm.api.project.repository.ProjectRepository;
import com.plm.api.project.repository.ProjectMemberRepository;
import com.plm.api.task.repository.TaskRepository;
import com.plm.api.user.entity.User;
import com.plm.api.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectService {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // 모든 프로젝트 조회
    public List<ProjectDto> getAllProjects() {
        List<Project> projects = projectRepository.findAll();
        return projects.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 프로젝트 ID로 조회
    public Optional<ProjectDto> getProjectById(Long id) {
        Optional<Project> project = projectRepository.findById(id);
        return project.map(this::convertToDto);
    }
    
    // 프로젝트 생성
    public ProjectDto createProject(ProjectDto projectDto) {
        Project project = convertToEntity(projectDto);
        if (project.getStatus() == null) {
            project.setStatus(ProjectStatus.PLANNING);
        }
        Project savedProject = projectRepository.save(project);
        return convertToDto(savedProject);
    }
    
    // 프로젝트 수정
    public Optional<ProjectDto> updateProject(Long id, ProjectDto projectDto) {
        return projectRepository.findById(id)
                .map(existingProject -> {
                    updateProjectFields(existingProject, projectDto);
                    Project savedProject = projectRepository.save(existingProject);
                    return convertToDto(savedProject);
                });
    }
    
    // 프로젝트 삭제
    public boolean deleteProject(Long id) {
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // 상태별 프로젝트 조회
    public List<ProjectDto> getProjectsByStatus(ProjectStatus status) {
        List<Project> projects = projectRepository.findByStatus(status);
        return projects.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 매니저별 프로젝트 조회
    public List<ProjectDto> getProjectsByManager(String managerId) {
        List<Project> projects = projectRepository.findByManagerId(managerId);
        return projects.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 활성 프로젝트 조회
    public List<ProjectDto> getActiveProjects() {
        List<Project> projects = projectRepository.findActiveProjects();
        return projects.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 프로젝트 검색
    public List<ProjectDto> searchProjects(String keyword) {
        List<Project> projects = projectRepository.findByNameContainingIgnoreCase(keyword);
        return projects.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // Entity를 DTO로 변환
    private ProjectDto convertToDto(Project project) {
        ProjectDto dto = new ProjectDto(project);
        
        // 프로젝트의 태스크 통계 계산
        Long totalTasks = taskRepository.countTasksByProjectId(project.getId());
        Long completedTasks = taskRepository.countCompletedTasksByProjectId(project.getId());
        
        dto.setTotalTasks(totalTasks);
        dto.setCompletedTasks(completedTasks);
        
        // 진행률 계산
        if (totalTasks > 0) {
            double progressPercentage = (completedTasks.doubleValue() / totalTasks.doubleValue()) * 100;
            dto.setProgressPercentage(Math.round(progressPercentage * 100.0) / 100.0); // 소수점 둘째자리 반올림
        } else {
            dto.setProgressPercentage(0.0);
        }
        
        return dto;
    }
    
    // DTO를 Entity로 변환
    private Project convertToEntity(ProjectDto dto) {
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStatus(dto.getStatus());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        project.setManagerId(dto.getManagerId());
        return project;
    }
    
    // 프로젝트 필드 업데이트
    private void updateProjectFields(Project existingProject, ProjectDto projectDto) {
        if (projectDto.getName() != null) {
            existingProject.setName(projectDto.getName());
        }
        if (projectDto.getDescription() != null) {
            existingProject.setDescription(projectDto.getDescription());
        }
        if (projectDto.getStatus() != null) {
            existingProject.setStatus(projectDto.getStatus());
        }
        if (projectDto.getStartDate() != null) {
            existingProject.setStartDate(projectDto.getStartDate());
        }
        if (projectDto.getEndDate() != null) {
            existingProject.setEndDate(projectDto.getEndDate());
        }
        if (projectDto.getManagerId() != null) {
            existingProject.setManagerId(projectDto.getManagerId());
        }
    }
    
    // ===== 프로젝트 멤버 관리 메서드 =====
    
    // 프로젝트 멤버 목록 조회
    public List<ProjectMemberDto> getProjectMembers(Long projectId) {
        return projectMemberRepository.findByProjectId(projectId).stream()
                .map(this::convertToMemberDto)
                .collect(Collectors.toList());
    }
    
    // 프로젝트에 멤버 추가
    public ProjectMemberDto addProjectMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // 중복 체크
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new RuntimeException("User is already a member of this project");
        }
        
        ProjectMember projectMember = new ProjectMember();
        projectMember.setProject(project);
        projectMember.setUser(user);
        
        ProjectMember savedMember = projectMemberRepository.save(projectMember);
        return convertToMemberDto(savedMember);
    }
    
    // 프로젝트에서 멤버 제거
    public void removeProjectMember(Long projectId, Long userId) {
        ProjectMember member = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Project member not found"));
        projectMemberRepository.delete(member);
    }
    
    // 프로젝트 멤버 일괄 추가
    public List<ProjectMemberDto> addProjectMembersBulk(Long projectId, List<Long> userIds) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        
        List<ProjectMember> members = userIds.stream()
                .filter(userId -> !projectMemberRepository.existsByProjectIdAndUserId(projectId, userId))
                .map(userId -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
                    
                    ProjectMember member = new ProjectMember();
                    member.setProject(project);
                    member.setUser(user);
                    return member;
                })
                .collect(Collectors.toList());
        
        List<ProjectMember> savedMembers = projectMemberRepository.saveAll(members);
        return savedMembers.stream()
                .map(this::convertToMemberDto)
                .collect(Collectors.toList());
    }
    
    // 사용자가 속한 프로젝트 목록 조회
    public List<ProjectDto> getUserProjects(Long userId) {
        return projectMemberRepository.findByUserId(userId).stream()
                .map(pm -> convertToDto(pm.getProject()))
                .collect(Collectors.toList());
    }
    
    // ProjectMember를 DTO로 변환
    private ProjectMemberDto convertToMemberDto(ProjectMember projectMember) {
        ProjectMemberDto dto = new ProjectMemberDto();
        dto.setId(projectMember.getId());
        dto.setProjectId(projectMember.getProject().getId());
        dto.setProjectName(projectMember.getProject().getName());
        dto.setUserId(projectMember.getUser().getId());
        dto.setUsername(projectMember.getUser().getUsername());
        dto.setUserFullName(projectMember.getUser().getFullName());
        dto.setUserEmail(projectMember.getUser().getEmail());
        dto.setJoinedAt(projectMember.getJoinedAt());
        return dto;
    }
}
