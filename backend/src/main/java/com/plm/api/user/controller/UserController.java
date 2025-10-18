package com.plm.api.user.controller;

import com.plm.api.user.dto.UserDto;
import com.plm.api.user.entity.UserRole;
import com.plm.api.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * User REST Controller
 * 사용자 관련 REST API 엔드포인트
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 인증 API
 *    - POST /api/auth/register - 회원가입
 *    - POST /api/auth/login - 로그인 (JWT 토큰 반환)
 *    - POST /api/auth/logout - 로그아웃
 *    - POST /api/auth/refresh - 토큰 갱신
 * 
 * 2. 프로필 API
 *    - GET /api/users/me - 현재 로그인한 사용자 정보
 *    - PUT /api/users/me - 프로필 업데이트
 *    - PUT /api/users/me/password - 비밀번호 변경
 *    - POST /api/users/me/avatar - 프로필 이미지 업로드
 * 
 * 3. 사용자 관리 API (관리자 전용)
 *    - GET /api/users - 모든 사용자 조회
 *    - GET /api/users/{id} - 특정 사용자 조회
 *    - PUT /api/users/{id} - 사용자 정보 수정
 *    - DELETE /api/users/{id} - 사용자 삭제
 *    - PUT /api/users/{id}/role - 사용자 역할 변경
 *    - PUT /api/users/{id}/status - 사용자 상태 변경
 * 
 * 4. 검색 API
 *    - GET /api/users/search?q={keyword} - 사용자 검색
 *    - GET /api/users/department/{dept} - 부서별 사용자 조회
 *    - GET /api/users/role/{role} - 역할별 사용자 조회
 * 
 * 5. JWT 인증 적용
 *    - Spring Security + JWT 설정
 *    - @PreAuthorize 어노테이션으로 권한 제어
 */
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    // 모든 사용자 조회
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    // ID로 사용자 조회
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    // 사용자명으로 조회
    @GetMapping("/username/{username}")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        UserDto user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }
    
    // 이메일로 조회
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        UserDto user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
    
    // 사용자 생성
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        UserDto createdUser = userService.createUser(userDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }
    
    // 사용자 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        UserDto updatedUser = userService.updateUser(id, userDto);
        return ResponseEntity.ok(updatedUser);
    }
    
    // 사용자 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    // 활성 사용자 조회
    @GetMapping("/active")
    public ResponseEntity<List<UserDto>> getActiveUsers() {
        List<UserDto> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }
    
    // 부서별 사용자 조회
    @GetMapping("/department/{department}")
    public ResponseEntity<List<UserDto>> getUsersByDepartment(@PathVariable String department) {
        List<UserDto> users = userService.getUsersByDepartment(department);
        return ResponseEntity.ok(users);
    }
    
    // 역할별 사용자 조회
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserDto>> getUsersByRole(@PathVariable UserRole role) {
        List<UserDto> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
}
