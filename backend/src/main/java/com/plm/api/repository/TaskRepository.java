package com.plm.api.repository;

import com.plm.api.entity.Task;
import com.plm.api.entity.TaskStatus;
import com.plm.api.entity.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // 프로젝트별 태스크 조회
    List<Task> findByProjectId(Long projectId);
    
    // 담당자별 태스크 조회
    List<Task> findByAssigneeId(String assigneeId);
    
    // 상태별 태스크 조회
    List<Task> findByStatus(TaskStatus status);
    
    // 우선순위별 태스크 조회
    List<Task> findByPriority(Priority priority);
    
    // 프로젝트와 상태로 태스크 조회
    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);
    
    // 담당자와 상태로 태스크 조회
    List<Task> findByAssigneeIdAndStatus(String assigneeId, TaskStatus status);
    
    // 마감일이 임박한 태스크 조회
    @Query("SELECT t FROM Task t WHERE t.dueDate <= :date AND t.status != 'DONE' AND t.status != 'CANCELLED'")
    List<Task> findTasksDueBefore(@Param("date") LocalDateTime date);
    
    // 제목으로 태스크 검색 (부분 검색)
    List<Task> findByTitleContainingIgnoreCase(String title);
    
    // 프로젝트의 완료된 태스크 수 조회
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = 'DONE'")
    Long countCompletedTasksByProjectId(@Param("projectId") Long projectId);
    
    // 프로젝트의 전체 태스크 수 조회
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    Long countTasksByProjectId(@Param("projectId") Long projectId);
}