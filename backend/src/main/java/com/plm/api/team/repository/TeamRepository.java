package com.plm.api.team.repository;

import com.plm.api.team.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Team Repository
 * 
 * TODO: 팀원이 구현할 내용
 * - 팀 검색 (이름으로)
 * - 팀 통계 쿼리
 * - 사용자가 속한 팀 목록 조회
 */
@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    
    // 팀 이름으로 조회
    Optional<Team> findByName(String name);
    
    // 팀 이름 검색 (LIKE)
    @Query("SELECT t FROM Team t WHERE t.name LIKE %:keyword%")
    List<Team> searchByName(String keyword);
    
    // 팀 이름 중복 체크
    boolean existsByName(String name);
}
