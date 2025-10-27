package com.plm.api.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security Configuration
 * 
 * 현재는 모든 엔드포인트를 허용하도록 설정
 * TODO: 추후 JWT 토큰 기반 인증 구현 시 수정 필요
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // CSRF 비활성화 (REST API용)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // 모든 요청 허용
            );
        
        return http.build();
    }
}
