package com.plm.api.project.repository;

import com.plm.api.project.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ProjectMember Repository
 */
@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    
    // 프로젝트의 모든 멤버 조회
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.project.id = :projectId")
    List<ProjectMember> findByProjectId(Long projectId);
    
    // 사용자가 속한 모든 프로젝트 조회
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.user.id = :userId")
    List<ProjectMember> findByUserId(Long userId);
    
    // 특정 프로젝트의 특정 사용자 조회
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :userId")
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    
    // 프로젝트 멤버 수 조회
    @Query("SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.project.id = :projectId")
    Long countByProjectId(Long projectId);
    
    // 중복 멤버 체크
    @Query("SELECT CASE WHEN COUNT(pm) > 0 THEN true ELSE false END FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :userId")
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
    
    // 프로젝트의 모든 멤버 삭제
    void deleteByProjectId(Long projectId);
    
    // 사용자의 모든 프로젝트 멤버십 삭제
    void deleteByUserId(Long userId);
    
    // 사용자의 프로젝트 멤버십 수 조회
    @Query("SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.user.id = :userId")
    Long countByUserId(Long userId);
}
