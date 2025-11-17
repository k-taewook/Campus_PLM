package com.plm.api.auth.service;

import com.plm.api.auth.dto.LoginRequest;
import com.plm.api.auth.dto.LoginResponse;
import com.plm.api.user.entity.User;
import com.plm.api.user.entity.UserStatus;
import com.plm.api.user.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * 로그인 처리
     */
    public LoginResponse login(LoginRequest request, HttpSession session) {
        // 이메일로 사용자 조회
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("이메일 또는 비밀번호가 일치하지 않습니다."));
        
        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
        
        // 사용자 상태 확인
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("비활성화된 계정입니다. 관리자에게 문의하세요.");
        }
        
        // 마지막 로그인 시간 업데이트
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        // 세션에 사용자 정보 저장
        session.setAttribute("userId", user.getId());
        session.setAttribute("userEmail", user.getEmail());
        session.setAttribute("userRole", user.getRole().name());
        
        return new LoginResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            "로그인 성공"
        );
    }
    
    /**
     * 로그아웃 처리
     */
    public void logout(HttpSession session) {
        session.invalidate();
    }
    
    /**
     * 현재 로그인한 사용자 정보 조회
     */
    public LoginResponse getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        return new LoginResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            "세션 유효"
        );
    }
}
