package com.plm.api.task.controller;

import com.plm.api.common.security.AuthorizationService;
import com.plm.api.task.dto.TaskDto;
import com.plm.api.task.entity.TaskStatus;
import com.plm.api.task.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TaskController {
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private AuthorizationService authorizationService;
    
    // 모든 태스크 조회
    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        List<TaskDto> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }
    
    // 태스크 상세 조회 (ADMIN 또는 해당 프로젝트 멤버만 접근 가능)
    @GetMapping("/tasks/{id}")
    public ResponseEntity<TaskDto> getTaskById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        // ADMIN이 아니고, 해당 태스크가 속한 프로젝트 멤버도 아니라면 접근 불가
        if (!authorizationService.isAdmin(userId) && !authorizationService.canAccessTask(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Optional<TaskDto> task = taskService.getTaskById(id);
        return task.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // 프로젝트별 태스크 조회 (ADMIN 또는 해당 프로젝트 멤버만 접근 가능)
    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<TaskDto>> getTasksByProjectId(
            @PathVariable Long projectId,
            @RequestParam Long userId) {
        // ADMIN이 아니고, 프로젝트 멤버도 아니라면 접근 불가
        if (!authorizationService.isAdmin(userId) && !authorizationService.isProjectMember(userId, projectId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<TaskDto> tasks = taskService.getTasksByProjectId(projectId);
        return ResponseEntity.ok(tasks);
    }
    
    // 담당자별 태스크 조회
    @GetMapping("/tasks/assignee/{assigneeId}")
    public ResponseEntity<List<TaskDto>> getTasksByAssignee(@PathVariable String assigneeId) {
        List<TaskDto> tasks = taskService.getTasksByAssignee(assigneeId);
        return ResponseEntity.ok(tasks);
    }
    
    // 상태별 태스크 조회
    @GetMapping("/tasks/status/{status}")
    public ResponseEntity<List<TaskDto>> getTasksByStatus(@PathVariable TaskStatus status) {
        List<TaskDto> tasks = taskService.getTasksByStatus(status);
        return ResponseEntity.ok(tasks);
    }
    
    // 태스크 생성 (ADMIN 또는 프로젝트 리더만 가능)
    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<?> createTask(
            @PathVariable Long projectId, 
            @RequestBody TaskDto taskDto,
            @RequestParam Long userId) {
        try {
            // 권한 체크: ADMIN 또는 프로젝트 리더
            if (!authorizationService.canManageProject(userId, projectId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("태스크를 생성할 권한이 없습니다.");
            }
            
            TaskDto createdTask = taskService.createTask(projectId, taskDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // 태스크 수정 (ADMIN 또는 프로젝트 리더만 가능)
    @PutMapping("/tasks/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id, 
            @RequestBody TaskDto taskDto,
            @RequestParam Long userId) {
        // 권한 체크: ADMIN 또는 프로젝트 리더
        if (!authorizationService.canModifyTask(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("태스크를 수정할 권한이 없습니다.");
        }
        
        Optional<TaskDto> updatedTask = taskService.updateTask(id, taskDto);
        return updatedTask.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    // 태스크 부분 수정 (PATCH) (ADMIN 또는 프로젝트 리더만 가능)
    @PatchMapping("/tasks/{id}")
    public ResponseEntity<?> partialUpdateTask(
            @PathVariable Long id, 
            @RequestBody TaskDto taskDto,
            @RequestParam Long userId) {
        // 권한 체크: ADMIN 또는 프로젝트 리더
        if (!authorizationService.canModifyTask(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("태스크를 수정할 권한이 없습니다.");
        }
        
        Optional<TaskDto> updatedTask = taskService.updateTask(id, taskDto);
        return updatedTask.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    // 태스크 상태 변경 (ADMIN 또는 프로젝트 리더만 가능)
    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<?> updateTaskStatus(
            @PathVariable Long id, 
            @RequestBody TaskStatusUpdateRequest request,
            @RequestParam Long userId) {
        // 권한 체크: ADMIN 또는 프로젝트 리더
        if (!authorizationService.canModifyTask(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("태스크 상태를 변경할 권한이 없습니다.");
        }
        
        Optional<TaskDto> updatedTask = taskService.updateTaskStatus(id, request.getStatus());
        return updatedTask.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    // 태스크 담당자 변경 (ADMIN 또는 프로젝트 리더만 가능)
    @PutMapping("/tasks/{id}/assign")
    public ResponseEntity<?> assignTask(
            @PathVariable Long id, 
            @RequestBody TaskAssignRequest request,
            @RequestParam Long userId) {
        // 권한 체크: ADMIN 또는 프로젝트 리더
        if (!authorizationService.canModifyTask(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("담당자를 변경할 권한이 없습니다.");
        }
        
        Optional<TaskDto> updatedTask = taskService.assignTask(id, request.getAssigneeId());
        return updatedTask.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    // 태스크 삭제 (ADMIN 또는 프로젝트 리더만 가능)
    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id, @RequestParam Long userId) {
        // 권한 체크: ADMIN 또는 프로젝트 리더
        if (!authorizationService.canModifyTask(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("태스크를 삭제할 권한이 없습니다.");
        }
        
        boolean deleted = taskService.deleteTask(id);
        return deleted ? ResponseEntity.noContent().build() 
                      : ResponseEntity.notFound().build();
    }
    
    // 마감일 임박 태스크 조회
    @GetMapping("/tasks/due-soon")
    public ResponseEntity<List<TaskDto>> getTasksDueSoon(@RequestParam(defaultValue = "7") int days) {
        List<TaskDto> tasks = taskService.getTasksDueSoon(days);
        return ResponseEntity.ok(tasks);
    }
    
    // 태스크 검색
    @GetMapping("/tasks/search")
    public ResponseEntity<List<TaskDto>> searchTasks(@RequestParam String keyword) {
        List<TaskDto> tasks = taskService.searchTasks(keyword);
        return ResponseEntity.ok(tasks);
    }
    
    // 태스크 상태 변경 요청 DTO
    public static class TaskStatusUpdateRequest {
        private TaskStatus status;
        
        public TaskStatus getStatus() {
            return status;
        }
        
        public void setStatus(TaskStatus status) {
            this.status = status;
        }
    }
    
    // 태스크 할당 요청 DTO
    public static class TaskAssignRequest {
        private String assigneeId;
        
        public String getAssigneeId() {
            return assigneeId;
        }
        
        public void setAssigneeId(String assigneeId) {
            this.assigneeId = assigneeId;
        }
    }
}
