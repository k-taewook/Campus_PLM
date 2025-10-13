package com.plm.api.controller;

import com.plm.api.dto.TaskDto;
import com.plm.api.entity.TaskStatus;
import com.plm.api.service.TaskService;
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
    
    // 모든 태스크 조회
    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        List<TaskDto> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }
    
    // 태스크 상세 조회
    @GetMapping("/tasks/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        Optional<TaskDto> task = taskService.getTaskById(id);
        return task.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // 프로젝트별 태스크 조회
    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<TaskDto>> getTasksByProjectId(@PathVariable Long projectId) {
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
    
    // 태스크 생성
    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskDto> createTask(@PathVariable Long projectId, @RequestBody TaskDto taskDto) {
        try {
            TaskDto createdTask = taskService.createTask(projectId, taskDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // 태스크 수정
    @PutMapping("/tasks/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @RequestBody TaskDto taskDto) {
        Optional<TaskDto> updatedTask = taskService.updateTask(id, taskDto);
        return updatedTask.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    // 태스크 상태 변경
    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(@PathVariable Long id, @RequestBody TaskStatusUpdateRequest request) {
        Optional<TaskDto> updatedTask = taskService.updateTaskStatus(id, request.getStatus());
        return updatedTask.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    // 태스크 담당자 변경
    @PutMapping("/tasks/{id}/assign")
    public ResponseEntity<TaskDto> assignTask(@PathVariable Long id, @RequestBody TaskAssignRequest request) {
        Optional<TaskDto> updatedTask = taskService.assignTask(id, request.getAssigneeId());
        return updatedTask.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    // 태스크 삭제
    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
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