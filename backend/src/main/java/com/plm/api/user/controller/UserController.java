package com.plm.api.user.controller;

import com.plm.api.user.dto.UserDto;
import com.plm.api.user.entity.UserRole;
import com.plm.api.user.entity.UserStatus;
import com.plm.api.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * User REST Controller - 완성된 구현
 * 사용자 관련 REST API 엔드포인트
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
        try {
            UserDto user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 사용자명으로 조회
    @GetMapping("/username/{username}")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        try {
            UserDto user = userService.getUserByUsername(username);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 이메일로 조회
    @GetMapping("/email/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        try {
            UserDto user = userService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 사용자 생성
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        try {
            UserDto createdUser = userService.createUser(userDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // 사용자 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        try {
            UserDto updatedUser = userService.updateUser(id, userDto);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // 사용자 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
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
    
    // 상태별 사용자 조회 - TODO: 구현 필요
    /*
    @GetMapping("/status/{status}")
    public ResponseEntity<List<UserDto>> getUsersByStatus(@PathVariable UserStatus status) {
        List<UserDto> users = userService.getUsersByStatus(status);
        return ResponseEntity.ok(users);
    }
    */
    
    // 사용자 검색 - TODO: 구현 필요
    /*
    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam String q) {
        List<UserDto> users = userService.searchUsers(q);
        return ResponseEntity.ok(users);
    }
    */
    
    // 사용자 역할 변경 - TODO: 구현 필요
    // 사용자 역할 변경 - TODO: 구현 필요
    /*
    @PutMapping("/{id}/role")
    public ResponseEntity<UserDto> changeUserRole(@PathVariable Long id, @RequestBody UserRole role) {
        try {
            UserDto user = userService.changeUserRole(id, role);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    */
    
    // 사용자 상태 변경 - TODO: 구현 필요
    /*
    @PutMapping("/{id}/status")
    public ResponseEntity<UserDto> changeUserStatus(@PathVariable Long id, @RequestBody UserStatus status) {
        try {
            UserDto user = userService.changeUserStatus(id, status);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    */
    
    // 마지막 로그인 시간 업데이트 - TODO: 구현 필요
    /*
    @PostMapping("/{id}/login")
    public ResponseEntity<Void> updateLastLogin(@PathVariable Long id) {
        try {
            userService.updateLastLogin(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    */
    
    // ========== 인증 관련 엔드포인트 ==========
    
    /**
     * 회원가입
     * POST /api/users/auth/register
     * Body: { "email": "user@example.com", "password": "password123", "fullName": "홍길동" }
     */
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            UserDto user = userService.register(
                request.getEmail(), 
                request.getPassword(), 
                request.getFullName()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * 로그인
     * POST /api/users/auth/login
     * Body: { "email": "user@example.com", "password": "password123" }
     */
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            UserDto user = userService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(new LoginResponse("로그인 성공", user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // ========== 내부 클래스: Request/Response DTO ==========
    
    public static class RegisterRequest {
        private String email;
        private String password;
        private String fullName;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }
    
    public static class LoginRequest {
        private String email;
        private String password;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class LoginResponse {
        private String message;
        private UserDto user;
        
        public LoginResponse(String message, UserDto user) {
            this.message = message;
            this.user = user;
        }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
    }
    
    public static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }
}


