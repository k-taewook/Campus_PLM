package com.plm.api.service;

import com.plm.api.dto.TaskDto;
import com.plm.api.entity.Task;
import com.plm.api.entity.TaskStatus;
import com.plm.api.entity.Priority;
import com.plm.api.entity.Project;
import com.plm.api.repository.TaskRepository;
import com.plm.api.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    // 모든 태스크 조회
    public List<TaskDto> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 태스크 ID로 조회
    public Optional<TaskDto> getTaskById(Long id) {
        Optional<Task> task = taskRepository.findById(id);
        return task.map(this::convertToDto);
    }
    
    // 프로젝트별 태스크 조회
    public List<TaskDto> getTasksByProjectId(Long projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 담당자별 태스크 조회
    public List<TaskDto> getTasksByAssignee(String assigneeId) {
        List<Task> tasks = taskRepository.findByAssigneeId(assigneeId);
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 상태별 태스크 조회
    public List<TaskDto> getTasksByStatus(TaskStatus status) {
        List<Task> tasks = taskRepository.findByStatus(status);
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 태스크 생성
    public TaskDto createTask(Long projectId, TaskDto taskDto) {
        Optional<Project> project = projectRepository.findById(projectId);
        if (project.isPresent()) {
            Task task = convertToEntity(taskDto);
            task.setProject(project.get());
            if (task.getStatus() == null) {
                task.setStatus(TaskStatus.TODO);
            }
            if (task.getPriority() == null) {
                task.setPriority(Priority.MEDIUM);
            }
            Task savedTask = taskRepository.save(task);
            return convertToDto(savedTask);
        } else {
            throw new RuntimeException("Project not found with id: " + projectId);
        }
    }
    
    // 태스크 수정
    public Optional<TaskDto> updateTask(Long id, TaskDto taskDto) {
        return taskRepository.findById(id)
                .map(existingTask -> {
                    updateTaskFields(existingTask, taskDto);
                    Task savedTask = taskRepository.save(existingTask);
                    return convertToDto(savedTask);
                });
    }
    
    // 태스크 상태 변경
    public Optional<TaskDto> updateTaskStatus(Long id, TaskStatus status) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setStatus(status);
                    Task savedTask = taskRepository.save(task);
                    return convertToDto(savedTask);
                });
    }
    
    // 태스크 담당자 변경
    public Optional<TaskDto> assignTask(Long id, String assigneeId) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setAssigneeId(assigneeId);
                    Task savedTask = taskRepository.save(task);
                    return convertToDto(savedTask);
                });
    }
    
    // 태스크 삭제
    public boolean deleteTask(Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // 마감일 임박 태스크 조회
    public List<TaskDto> getTasksDueSoon(int days) {
        LocalDateTime dueDate = LocalDateTime.now().plusDays(days);
        List<Task> tasks = taskRepository.findTasksDueBefore(dueDate);
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 태스크 검색
    public List<TaskDto> searchTasks(String keyword) {
        List<Task> tasks = taskRepository.findByTitleContainingIgnoreCase(keyword);
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // Entity를 DTO로 변환
    private TaskDto convertToDto(Task task) {
        return new TaskDto(task);
    }
    
    // DTO를 Entity로 변환
    private Task convertToEntity(TaskDto dto) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setPriority(dto.getPriority());
        task.setAssigneeId(dto.getAssigneeId());
        task.setDueDate(dto.getDueDate());
        return task;
    }
    
    // 태스크 필드 업데이트
    private void updateTaskFields(Task existingTask, TaskDto taskDto) {
        if (taskDto.getTitle() != null) {
            existingTask.setTitle(taskDto.getTitle());
        }
        if (taskDto.getDescription() != null) {
            existingTask.setDescription(taskDto.getDescription());
        }
        if (taskDto.getStatus() != null) {
            existingTask.setStatus(taskDto.getStatus());
        }
        if (taskDto.getPriority() != null) {
            existingTask.setPriority(taskDto.getPriority());
        }
        if (taskDto.getAssigneeId() != null) {
            existingTask.setAssigneeId(taskDto.getAssigneeId());
        }
        if (taskDto.getDueDate() != null) {
            existingTask.setDueDate(taskDto.getDueDate());
        }
    }
}