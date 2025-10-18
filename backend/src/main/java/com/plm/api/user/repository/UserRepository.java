package com.plm.api.user.repository;

import com.plm.api.user.entity.User;
import com.plm.api.user.entity.UserRole;
import com.plm.api.user.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * User Repository
 * 사용자 데이터 접근을 위한 Repository
 * 
 * TODO: 팀원이 구현할 내용
 * - 사용자명 또는 이메일로 검색
 * - 활성 사용자 목록 조회
 * - 부서별 사용자 조회
 * - 역할별 사용자 조회
 * - 사용자 통계 쿼리 (부서별, 역할별 집계)
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 사용자명으로 조회
    Optional<User> findByUsername(String username);
    
    // 이메일로 조회
    Optional<User> findByEmail(String email);
    
    // 사용자명 또는 이메일로 조회
    @Query("SELECT u FROM User u WHERE u.username = :identifier OR u.email = :identifier")
    Optional<User> findByUsernameOrEmail(String identifier);
    
    // 상태별 사용자 조회
    List<User> findByStatus(UserStatus status);
    
    // 역할별 사용자 조회
    List<User> findByRole(UserRole role);
    
    // 부서별 사용자 조회
    List<User> findByDepartment(String department);
    
    // 활성 사용자만 조회
    @Query("SELECT u FROM User u WHERE u.status = 'ACTIVE'")
    List<User> findActiveUsers();
    
    // 사용자명 중복 체크
    boolean existsByUsername(String username);
    
    // 이메일 중복 체크
    boolean existsByEmail(String email);
}
