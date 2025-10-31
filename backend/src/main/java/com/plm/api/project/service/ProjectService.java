package com.plm.api.project.service;

import com.plm.api.project.dto.ProjectDto;
import com.plm.api.project.entity.Project;
import com.plm.api.project.entity.ProjectStatus;
import com.plm.api.project.repository.ProjectRepository;
import com.plm.api.task.repository.TaskRepository;
import com.plm.api.project.repository.ProjectMemberRepository;
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
            // FK 제약 해소를 위해 자식(ProjectMember) 먼저 삭제
            projectMemberRepository.deleteByProjectId(id);
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
}
