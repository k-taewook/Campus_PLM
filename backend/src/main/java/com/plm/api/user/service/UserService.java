package com.plm.api.user.service;

import com.plm.api.user.dto.UserDto;
import com.plm.api.user.entity.User;
import com.plm.api.user.entity.UserRole;
import com.plm.api.user.entity.UserStatus;
import com.plm.api.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * User Service
 * 사용자 비즈니스 로직을 처리하는 서비스
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 회원가입 (register)
 *    - 사용자명/이메일 중복 체크
 *    - 비밀번호 암호화 (BCryptPasswordEncoder)
 *    - 기본 역할 설정 (VIEWER)
 * 
 * 2. 로그인 (login)
 *    - 사용자 인증 (username/email + password)
 *    - JWT 토큰 생성 및 반환
 *    - 마지막 로그인 시간 업데이트
 * 
 * 3. 프로필 관리
 *    - 프로필 조회
 *    - 프로필 업데이트 (이름, 전화번호, 부서, 직책)
 *    - 프로필 이미지 업데이트
 * 
 * 4. 비밀번호 관리
 *    - 비밀번호 변경
 *    - 비밀번호 재설정 (이메일 인증)
 * 
 * 5. 사용자 관리 (관리자 기능)
 *    - 사용자 목록 조회
 *    - 사용자 역할 변경
 *    - 사용자 상태 변경 (활성/비활성/정지)
 *    - 사용자 삭제
 * 
 * 6. 검색 및 필터링
 *    - 부서별 사용자 조회
 *    - 역할별 사용자 조회
 *    - 사용자명/이메일로 검색
 */
@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    // Entity -> DTO 변환
    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setDepartment(user.getDepartment());
        dto.setPosition(user.getPosition());
        dto.setLastLoginAt(user.getLastLoginAt());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
    
    // DTO -> Entity 변환
    private User convertToEntity(UserDto dto) {
        User user = new User();
        user.setId(dto.getId());
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setFullName(dto.getFullName());
        user.setProfileImageUrl(dto.getProfileImageUrl());
        user.setRole(dto.getRole());
        user.setStatus(dto.getStatus());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setDepartment(dto.getDepartment());
        user.setPosition(dto.getPosition());
        return user;
    }
    
    // 모든 사용자 조회
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // ID로 사용자 조회
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToDto(user);
    }
    
    // 사용자명으로 조회
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return convertToDto(user);
    }
    
    // 이메일로 조회
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return convertToDto(user);
    }
    
    // 사용자 생성
    // TODO: 비밀번호 암호화, 중복 체크 구현
    public UserDto createUser(UserDto userDto) {
        User user = convertToEntity(userDto);
        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }
    
    // 사용자 업데이트
    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        // 업데이트 가능한 필드만 수정
        if (userDto.getFullName() != null) user.setFullName(userDto.getFullName());
        if (userDto.getEmail() != null) user.setEmail(userDto.getEmail());
        if (userDto.getPhoneNumber() != null) user.setPhoneNumber(userDto.getPhoneNumber());
        if (userDto.getDepartment() != null) user.setDepartment(userDto.getDepartment());
        if (userDto.getPosition() != null) user.setPosition(userDto.getPosition());
        if (userDto.getProfileImageUrl() != null) user.setProfileImageUrl(userDto.getProfileImageUrl());
        if (userDto.getRole() != null) user.setRole(userDto.getRole());
        if (userDto.getStatus() != null) user.setStatus(userDto.getStatus());
        
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }
    
    // 사용자 삭제
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
    
    // 활성 사용자 목록 조회
    public List<UserDto> getActiveUsers() {
        return userRepository.findActiveUsers().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 부서별 사용자 조회
    public List<UserDto> getUsersByDepartment(String department) {
        return userRepository.findByDepartment(department).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 역할별 사용자 조회
    public List<UserDto> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}
