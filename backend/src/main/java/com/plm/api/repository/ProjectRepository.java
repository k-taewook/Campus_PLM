package com.plm.api.repository;

import com.plm.api.entity.Project;
import com.plm.api.entity.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    // 상태별 프로젝트 조회
    List<Project> findByStatus(ProjectStatus status);
    
    // 매니저별 프로젝트 조회
    List<Project> findByManagerId(String managerId);
    
    // 이름으로 프로젝트 검색 (부분 검색)
    List<Project> findByNameContainingIgnoreCase(String name);
    
    // 프로젝트와 연관된 태스크 수 조회
    @Query("SELECT p FROM Project p LEFT JOIN FETCH p.tasks WHERE p.id = :projectId")
    Project findByIdWithTasks(@Param("projectId") Long projectId);
    
    // 활성화된 프로젝트만 조회
    @Query("SELECT p FROM Project p WHERE p.status IN ('PLANNING', 'ACTIVE')")
    List<Project> findActiveProjects();
}