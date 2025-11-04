package com.plm.api.project.controller;

import com.plm.api.project.dto.ProjectDto;
import com.plm.api.project.dto.ProjectMemberDto;
import com.plm.api.project.entity.ProjectStatus;
import com.plm.api.project.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ProjectController {
    
    @Autowired
    private ProjectService projectService;
    
    // 모든 프로젝트 조회
    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        List<ProjectDto> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }
    
    // 프로젝트 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        Optional<ProjectDto> project = projectService.getProjectById(id);
        return project.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    // 프로젝트 생성
    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@RequestBody ProjectDto projectDto) {
        try {
            ProjectDto createdProject = projectService.createProject(projectDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // 프로젝트 수정
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @RequestBody ProjectDto projectDto) {
        Optional<ProjectDto> updatedProject = projectService.updateProject(id, projectDto);
        return updatedProject.map(ResponseEntity::ok)
                            .orElse(ResponseEntity.notFound().build());
    }
    
    // 프로젝트 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        boolean deleted = projectService.deleteProject(id);
        return deleted ? ResponseEntity.noContent().build() 
                      : ResponseEntity.notFound().build();
    }
    
    // 상태별 프로젝트 조회
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ProjectDto>> getProjectsByStatus(@PathVariable ProjectStatus status) {
        List<ProjectDto> projects = projectService.getProjectsByStatus(status);
        return ResponseEntity.ok(projects);
    }
    
    // 매니저별 프로젝트 조회
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<ProjectDto>> getProjectsByManager(@PathVariable String managerId) {
        List<ProjectDto> projects = projectService.getProjectsByManager(managerId);
        return ResponseEntity.ok(projects);
    }
    
    // 활성 프로젝트 조회
    @GetMapping("/active")
    public ResponseEntity<List<ProjectDto>> getActiveProjects() {
        List<ProjectDto> projects = projectService.getActiveProjects();
        return ResponseEntity.ok(projects);
    }
    
    // 프로젝트 검색
    @GetMapping("/search")
    public ResponseEntity<List<ProjectDto>> searchProjects(@RequestParam String keyword) {
        List<ProjectDto> projects = projectService.searchProjects(keyword);
        return ResponseEntity.ok(projects);
    }
    
    // ===== 프로젝트 멤버 관리 API =====
    
    // 프로젝트 멤버 목록 조회
    @GetMapping("/{id}/members")
    public ResponseEntity<List<ProjectMemberDto>> getProjectMembers(@PathVariable Long id) {
        List<ProjectMemberDto> members = projectService.getProjectMembers(id);
        return ResponseEntity.ok(members);
    }
    
    // 프로젝트에 멤버 추가
    @PostMapping("/{projectId}/members/{userId}")
    public ResponseEntity<ProjectMemberDto> addProjectMember(
            @PathVariable Long projectId, 
            @PathVariable Long userId) {
        try {
            ProjectMemberDto member = projectService.addProjectMember(projectId, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(member);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // 프로젝트에서 멤버 제거
    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<Void> removeProjectMember(@PathVariable Long projectId, @PathVariable Long userId) {
        try {
            projectService.removeProjectMember(projectId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 프로젝트 멤버 일괄 추가
    @PostMapping("/{projectId}/members/bulk")
    public ResponseEntity<List<ProjectMemberDto>> addProjectMembersBulk(
            @PathVariable Long projectId,
            @RequestBody List<Long> userIds
    ) {
        try {
            List<ProjectMemberDto> members = projectService.addProjectMembersBulk(projectId, userIds);
            return ResponseEntity.status(HttpStatus.CREATED).body(members);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // 사용자가 속한 프로젝트 목록 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectDto>> getUserProjects(@PathVariable Long userId) {
        List<ProjectDto> projects = projectService.getUserProjects(userId);
        return ResponseEntity.ok(projects);
    }
}
