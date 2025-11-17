package com.plm.api.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security Configuration
 * 세션 기반 인증 설정
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // CSRF 비활성화 (개발 환경)
            .cors(cors -> cors.disable()) // CORS 설정
            .authorizeHttpRequests(auth -> auth
                // 현재는 개발 단계이므로 모든 요청 허용
                // TODO: 프로덕션 배포 시 아래 주석 해제하여 권한 체크 활성화
                .anyRequest().permitAll()
                
                /* 프로덕션용 권한 설정 (나중에 활성화)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "LEADER")
                .requestMatchers("/api/teams/**").hasAnyRole("ADMIN", "LEADER")
                .anyRequest().authenticated()
                */
            )
            .sessionManagement(session -> session
                .maximumSessions(1) // 동시 세션 1개로 제한
                .maxSessionsPreventsLogin(false) // 새 로그인 시 기존 세션 만료
            )
            .formLogin(form -> form.disable()) // 기본 폼 로그인 비활성화
            .httpBasic(basic -> basic.disable()); // HTTP Basic 인증 비활성화
        
        return http.build();
    }
}
