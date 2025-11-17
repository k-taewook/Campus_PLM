package com.plm.api.user.service;

import com.plm.api.user.dto.UserDto;
import com.plm.api.user.entity.User;
import com.plm.api.user.entity.UserRole;
import com.plm.api.user.entity.UserStatus;
import com.plm.api.user.repository.UserRepository;
import com.plm.api.team.repository.TeamMemberRepository;
import com.plm.api.project.repository.ProjectMemberRepository;
import com.plm.api.team.entity.TeamMember;
import com.plm.api.project.entity.ProjectMember;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

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
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    
    public UserService(UserRepository userRepository,
                      TeamMemberRepository teamMemberRepository,
                      ProjectMemberRepository projectMemberRepository) {
        this.userRepository = userRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    // ========== 인증 관련 메서드 ==========
    
    /**
     * 회원가입 - 새로운 사용자 등록
     * @param email 이메일
     * @param password 비밀번호 (평문)
     * @param fullName 전체 이름
     * @return 생성된 사용자 정보 (비밀번호 제외)
     */
    public UserDto register(String email, String password, String fullName) {
        // 이메일 유효성 검사
        if (!isValidEmail(email)) {
            throw new RuntimeException("유효하지 않은 이메일 형식입니다.");
        }
        
        // 이메일 중복 체크
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }
        
        // 비밀번호 검증 (최소 8자)
        if (password == null || password.length() < 8) {
            throw new RuntimeException("비밀번호는 최소 8자 이상이어야 합니다.");
        }
        
        // 새 사용자 생성
        User user = new User();
        user.setEmail(email);
        user.setUsername(email.split("@")[0]); // 이메일의 @ 앞부분을 username으로 사용
        user.setPassword(passwordEncoder.encode(password)); // BCrypt 암호화
        user.setFullName(fullName);
        user.setRole(UserRole.MEMBER); // 기본 역할: MEMBER
        user.setStatus(UserStatus.ACTIVE); // 기본 상태: ACTIVE
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }
    
    /**
     * 로그인 - 이메일과 비밀번호로 사용자 인증
     * @param email 이메일
     * @param password 비밀번호 (평문)
     * @return 인증된 사용자 정보 (비밀번호 제외)
     */
    public UserDto login(String email, String password) {
        // 이메일로 사용자 조회
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        
        User user = userOptional.get();
        
        // 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        
        // 계정 상태 확인
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException("비활성화된 계정입니다. 관리자에게 문의하세요.");
        }
        
        // 마지막 로그인 시간 업데이트
        user.setLastLoginAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        return convertToDto(user);
    }
    
    /**
     * 이메일 유효성 검사
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
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
        // 소프트 삭제된(DELETED) 사용자는 기본 목록에서 제외
        return userRepository.findAllNotDeleted().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // ID로 사용자 조회
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // 소프트 삭제된 사용자는 조회 불가 처리
        if (user.getStatus() == UserStatus.DELETED) {
            throw new RuntimeException("User not found with id: " + id);
        }

        return convertToDto(user);
    }
    
    // 사용자명으로 조회
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new RuntimeException("User not found with username: " + username);
        }

        return convertToDto(user);
    }
    
    // 이메일로 조회
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (user.getStatus() == UserStatus.DELETED) {
            throw new RuntimeException("User not found with email: " + email);
        }

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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // 이미 삭제된 사용자는 다시 삭제할 수 없음
        if (user.getStatus() == UserStatus.DELETED) {
            throw new RuntimeException("User already deleted with id: " + id);
        }

        // 소프트 삭제: 상태를 DELETED로 변경
        user.setStatus(UserStatus.DELETED);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }
    
    // 사용자 삭제 전 정보 조회 (팀/프로젝트 소속 정보)
    public Map<String, Object> getUserDeletionInfo(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        Map<String, Object> info = new HashMap<>();
        
        // 소속된 팀 목록
        List<TeamMember> teamMemberships = teamMemberRepository.findByUserId(id);
        List<String> teamNames = teamMemberships.stream()
                .map(tm -> tm.getTeam().getName())
                .collect(Collectors.toList());
        
        // 소속된 프로젝트 목록
        List<ProjectMember> projectMemberships = projectMemberRepository.findByUserId(id);
        List<String> projectNames = projectMemberships.stream()
                .map(pm -> pm.getProject().getName())
                .collect(Collectors.toList());
        
        info.put("userId", id);
        info.put("userName", user.getFullName());
        info.put("teams", teamNames);
        info.put("projects", projectNames);
        info.put("teamCount", teamNames.size());
        info.put("projectCount", projectNames.size());
        
        return info;
    }
    
    // 사용자 강제 삭제 (팀/프로젝트에서 자동 제거)
    public void forceDeleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // 이미 삭제된 사용자는 다시 삭제할 수 없음
        if (user.getStatus() == UserStatus.DELETED) {
            throw new RuntimeException("User already deleted with id: " + id);
        }

        // 1. 모든 팀 멤버십 제거
        teamMemberRepository.deleteByUserId(id);
        
        // 2. 모든 프로젝트 멤버십 제거
        projectMemberRepository.deleteByUserId(id);
        
        // 3. 사용자 소프트 삭제
        user.setStatus(UserStatus.DELETED);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
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

    // 사용자 상태 변경 (ACTIVE / INACTIVE / SUSPENDED / DELETED)
    public UserDto changeUserStatus(Long id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setStatus(status);
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }
}
