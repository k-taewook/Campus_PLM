package com.plm.api.team.service;

import com.plm.api.team.dto.TeamDto;
import com.plm.api.team.dto.TeamMemberDto;
import com.plm.api.team.entity.Team;
import com.plm.api.team.entity.TeamMember;
import com.plm.api.team.entity.TeamMemberRole;
import com.plm.api.team.repository.TeamMemberRepository;
import com.plm.api.team.repository.TeamRepository;
import com.plm.api.user.entity.User;
import com.plm.api.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Team Service
 * 팀 관리 비즈니스 로직
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 팀 CRUD
 *    - 팀 생성 (생성자를 OWNER로 자동 추가)
 *    - 팀 조회 (목록, 상세)
 *    - 팀 업데이트 (이름, 설명, 로고)
 *    - 팀 삭제 (OWNER만 가능)
 * 
 * 2. 멤버 관리
 *    - 멤버 초대 (이메일 또는 사용자명으로)
 *    - 멤버 제거 (OWNER/ADMIN만 가능)
 *    - 멤버 역할 변경 (OWNER만 가능)
 *    - 팀 멤버 목록 조회
 * 
 * 3. 권한 검증
 *    - 팀 접근 권한 체크
 *    - 역할별 권한 체크 (OWNER, ADMIN, MEMBER, VIEWER)
 * 
 * 4. 통계
 *    - 팀별 멤버 수
 *    - 팀별 프로젝트 수
 *    - 사용자가 속한 팀 목록
 */
@Service
@Transactional
public class TeamService {
    
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    
    public TeamService(TeamRepository teamRepository, 
                      TeamMemberRepository teamMemberRepository,
                      UserRepository userRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }
    
    // Entity -> DTO 변환
    private TeamDto convertToDto(Team team) {
        TeamDto dto = new TeamDto();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setLogoUrl(team.getLogoUrl());
        dto.setMemberCount(teamMemberRepository.countByTeamId(team.getId()).intValue());
        dto.setCreatedAt(team.getCreatedAt());
        dto.setUpdatedAt(team.getUpdatedAt());
        return dto;
    }
    
    private TeamMemberDto convertToMemberDto(TeamMember teamMember) {
        TeamMemberDto dto = new TeamMemberDto();
        dto.setId(teamMember.getId());
        dto.setTeamId(teamMember.getTeam().getId());
        dto.setTeamName(teamMember.getTeam().getName());
        dto.setUserId(teamMember.getUser().getId());
        dto.setUsername(teamMember.getUser().getUsername());
        dto.setUserFullName(teamMember.getUser().getFullName());
        dto.setUserEmail(teamMember.getUser().getEmail());
        dto.setRole(teamMember.getRole());
        dto.setJoinedAt(teamMember.getJoinedAt());
        return dto;
    }
    
    // 모든 팀 조회
    public List<TeamDto> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // ID로 팀 조회
    public TeamDto getTeamById(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + id));
        return convertToDto(team);
    }
    
    // 팀 생성
    public TeamDto createTeam(TeamDto teamDto) {
        Team team = new Team();
        team.setName(teamDto.getName());
        team.setDescription(teamDto.getDescription());
        team.setLogoUrl(teamDto.getLogoUrl());
        
        Team savedTeam = teamRepository.save(team);
        return convertToDto(savedTeam);
    }
    
    // 팀 업데이트
    public TeamDto updateTeam(Long id, TeamDto teamDto) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + id));
        
        if (teamDto.getName() != null) team.setName(teamDto.getName());
        if (teamDto.getDescription() != null) team.setDescription(teamDto.getDescription());
        if (teamDto.getLogoUrl() != null) team.setLogoUrl(teamDto.getLogoUrl());
        
        Team updatedTeam = teamRepository.save(team);
        return convertToDto(updatedTeam);
    }
    
    // 팀 삭제
    public void deleteTeam(Long id) {
        if (!teamRepository.existsById(id)) {
            throw new RuntimeException("Team not found with id: " + id);
        }
        
        // 팀 삭제 전에 모든 팀 멤버 먼저 삭제 (외래 키 제약 조건 해결)
        teamMemberRepository.deleteByTeamId(id);
        
        // 팀 삭제
        teamRepository.deleteById(id);
    }
    
    // 팀 멤버 목록 조회
    public List<TeamMemberDto> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId).stream()
                .map(this::convertToMemberDto)
                .collect(Collectors.toList());
    }
    
    // 사용자가 속한 팀 목록 조회
    public List<TeamDto> getUserTeams(Long userId) {
        return teamMemberRepository.findByUserId(userId).stream()
                .map(tm -> convertToDto(tm.getTeam()))
                .collect(Collectors.toList());
    }
    
    // 팀에 멤버 추가
    public TeamMemberDto addTeamMember(Long teamId, Long userId, TeamMemberRole role) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // 중복 체크
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("User is already a member of this team");
        }
        
        TeamMember teamMember = new TeamMember();
        teamMember.setTeam(team);
        teamMember.setUser(user);
        teamMember.setRole(role);
        
        TeamMember savedMember = teamMemberRepository.save(teamMember);
        return convertToMemberDto(savedMember);
    }
    
    // 팀 멤버 제거
    public void removeTeamMember(Long teamId, Long userId) {
        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException("Team member not found"));
        teamMemberRepository.delete(teamMember);
    }
    
    // 팀 멤버 역할 변경
    public TeamMemberDto updateMemberRole(Long teamId, Long userId, TeamMemberRole newRole) {
        TeamMember teamMember = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException("Team member not found"));
        
        teamMember.setRole(newRole);
        TeamMember updatedMember = teamMemberRepository.save(teamMember);
        return convertToMemberDto(updatedMember);
    }

    // 팀 멤버 일괄 추가 (중복 자동 스킵)
    public List<TeamMemberDto> addTeamMembersBulk(Long teamId, List<Long> userIds, TeamMemberRole role) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + teamId));
        if (userIds == null || userIds.isEmpty()) return List.of();

        List<TeamMemberDto> result = new java.util.ArrayList<>();
        for (Long userId : userIds) {
            if (userId == null) continue;
            if (teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
                // 이미 존재하면 스킵
                continue;
            }
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
            TeamMember tm = new TeamMember();
            tm.setTeam(team);
            tm.setUser(user);
            tm.setRole(role);
            TeamMember saved = teamMemberRepository.save(tm);
            result.add(convertToMemberDto(saved));
        }
        return result;
    }
}
