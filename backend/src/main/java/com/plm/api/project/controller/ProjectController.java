package com.plm.api.project.controller;

import com.plm.api.common.security.AuthorizationService;
import com.plm.api.project.dto.ProjectDto;
import com.plm.api.project.dto.ProjectMemberDto;
import com.plm.api.project.entity.ProjectStatus;
import com.plm.api.project.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ProjectController {
    
    @Autowired
    private ProjectService projectService;
    
    @Autowired
    private AuthorizationService authorizationService;
    
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
    public ResponseEntity<?> createProject(@RequestBody ProjectDto projectDto, HttpSession session) {
        try {
            // 세션 인증 확인
            Long currentUserId = (Long) session.getAttribute("userId");
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("로그인이 필요합니다.");
            }
            
            // 현재 사용자가 LEADER 또는 ADMIN인지 확인
            if (!authorizationService.isLeader(currentUserId) && !authorizationService.isAdmin(currentUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("프로젝트는 리더 또는 관리자만 생성할 수 있습니다.");
            }
            
            System.out.println("=== 프로젝트 생성 요청 받음 ===");
            System.out.println("프로젝트 이름: " + projectDto.getName());
            System.out.println("요청한 사용자 ID: " + currentUserId);
            
            // 현재 로그인한 사용자를 자동으로 프로젝트 리더로 설정 (보안 강화)
            projectDto.setManagerId(currentUserId);
            
            ProjectDto createdProject = projectService.createProject(projectDto);
            System.out.println("생성된 프로젝트 ID: " + createdProject.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
        } catch (Exception e) {
            System.err.println("프로젝트 생성 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("프로젝트 생성에 실패했습니다: " + e.getMessage());
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
        try {
            System.out.println("=== 프로젝트 삭제 요청 ===");
            System.out.println("프로젝트 ID: " + id);
            
            boolean deleted = projectService.deleteProject(id);
            if (deleted) {
                System.out.println("프로젝트 삭제 완료: " + id);
                return ResponseEntity.noContent().build();
            } else {
                System.out.println("프로젝트를 찾을 수 없음: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("프로젝트 삭제 실패: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // 상태별 프로젝트 조회
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ProjectDto>> getProjectsByStatus(@PathVariable ProjectStatus status) {
        List<ProjectDto> projects = projectService.getProjectsByStatus(status);
        return ResponseEntity.ok(projects);
    }
    
    // 매니저별 프로젝트 조회
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<ProjectDto>> getProjectsByManager(@PathVariable Long managerId) {
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
            @PathVariable Long userId,
            HttpSession session) {
        try {
            // 권한 확인: ADMIN 또는 프로젝트 리더만 멤버 추가 가능
            Long currentUserId = (Long) session.getAttribute("userId");
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            if (!authorizationService.canManageProject(currentUserId, projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            ProjectMemberDto member = projectService.addProjectMember(projectId, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(member);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // 프로젝트에서 멤버 제거
    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<Void> removeProjectMember(
            @PathVariable Long projectId, 
            @PathVariable Long userId,
            HttpSession session) {
        try {
            // 권한 확인: ADMIN 또는 프로젝트 리더만 멤버 제거 가능
            Long currentUserId = (Long) session.getAttribute("userId");
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            if (!authorizationService.canManageProject(currentUserId, projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
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
            @RequestBody List<Long> userIds,
            HttpSession session
    ) {
        try {
            // 권한 확인: ADMIN 또는 프로젝트 리더만 멤버 일괄 추가 가능
            Long currentUserId = (Long) session.getAttribute("userId");
            if (currentUserId == null) {
                System.err.println("인증되지 않은 사용자");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            if (!authorizationService.canManageProject(currentUserId, projectId)) {
                System.err.println("권한 없음: userId=" + currentUserId + ", projectId=" + projectId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            System.out.println("=== 프로젝트 멤버 일괄 추가 요청 ===");
            System.out.println("프로젝트 ID: " + projectId);
            System.out.println("추가할 사용자 ID 목록: " + userIds);
            System.out.println("사용자 수: " + userIds.size());
            
            List<ProjectMemberDto> members = projectService.addProjectMembersBulk(projectId, userIds);
            System.out.println("멤버 추가 성공, 추가된 멤버 수: " + members.size());
            return ResponseEntity.status(HttpStatus.CREATED).body(members);
        } catch (RuntimeException e) {
            System.err.println("멤버 추가 실패: " + e.getMessage());
            e.printStackTrace();
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
