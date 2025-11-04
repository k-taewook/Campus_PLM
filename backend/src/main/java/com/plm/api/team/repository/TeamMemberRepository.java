package com.plm.api.team.repository;

import com.plm.api.team.entity.TeamMember;
import com.plm.api.team.entity.TeamMemberRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TeamMember Repository
 * 
 * TODO: 팀원이 구현할 내용
 * - 팀의 멤버 목록 조회
 * - 사용자가 속한 팀 목록 조회
 * - 팀 내 역할별 멤버 조회
 * - 중복 멤버 체크
 */
@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    
    // 팀의 모든 멤버 조회
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.id = :teamId")
    List<TeamMember> findByTeamId(Long teamId);
    
    // 사용자가 속한 모든 팀 조회
    @Query("SELECT tm FROM TeamMember tm WHERE tm.user.id = :userId")
    List<TeamMember> findByUserId(Long userId);
    
    // 특정 팀의 특정 사용자 조회
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.id = :teamId AND tm.user.id = :userId")
    Optional<TeamMember> findByTeamIdAndUserId(Long teamId, Long userId);
    
    // 팀 내 역할별 멤버 조회
    @Query("SELECT tm FROM TeamMember tm WHERE tm.team.id = :teamId AND tm.role = :role")
    List<TeamMember> findByTeamIdAndRole(Long teamId, TeamMemberRole role);
    
    // 팀 멤버 수 조회
    @Query("SELECT COUNT(tm) FROM TeamMember tm WHERE tm.team.id = :teamId")
    Long countByTeamId(Long teamId);
    
    // 중복 멤버 체크
    @Query("SELECT CASE WHEN COUNT(tm) > 0 THEN true ELSE false END FROM TeamMember tm WHERE tm.team.id = :teamId AND tm.user.id = :userId")
    boolean existsByTeamIdAndUserId(Long teamId, Long userId);
    
    // 팀의 모든 멤버 삭제
    void deleteByTeamId(Long teamId);
}
