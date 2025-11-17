package com.plm.api.auth.controller;

import com.plm.api.auth.dto.LoginRequest;
import com.plm.api.auth.dto.LoginResponse;
import com.plm.api.auth.service.AuthService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 관련 REST API
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    /**
     * 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request, HttpSession session) {
        try {
            LoginResponse response = authService.login(request, session);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new LoginResponse(null, null, null, null, null, e.getMessage()));
        }
    }
    
    /**
     * 로그아웃
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        authService.logout(session);
        return ResponseEntity.ok("로그아웃 성공");
    }
    
    /**
     * 현재 사용자 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser(HttpSession session) {
        try {
            LoginResponse response = authService.getCurrentUser(session);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(new LoginResponse(null, null, null, null, null, e.getMessage()));
        }
    }
    
    /**
     * 세션 체크 (프론트엔드용)
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkSession(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        return ResponseEntity.ok(userId != null);
    }
}
