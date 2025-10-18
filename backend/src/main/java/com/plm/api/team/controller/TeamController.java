package com.plm.api.team.controller;

import com.plm.api.team.dto.TeamDto;
import com.plm.api.team.dto.TeamMemberDto;
import com.plm.api.team.entity.TeamMemberRole;
import com.plm.api.team.service.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Team REST Controller
 * 팀 관련 REST API 엔드포인트
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 팀 관리 API
 *    - GET /api/teams - 모든 팀 조회
 *    - GET /api/teams/{id} - 특정 팀 조회
 *    - POST /api/teams - 팀 생성
 *    - PUT /api/teams/{id} - 팀 업데이트
 *    - DELETE /api/teams/{id} - 팀 삭제
 * 
 * 2. 팀 멤버 관리 API
 *    - GET /api/teams/{id}/members - 팀 멤버 목록
 *    - POST /api/teams/{id}/members - 멤버 추가
 *    - DELETE /api/teams/{id}/members/{userId} - 멤버 제거
 *    - PUT /api/teams/{id}/members/{userId}/role - 멤버 역할 변경
 * 
 * 3. 사용자 팀 조회 API
 *    - GET /api/users/{userId}/teams - 사용자가 속한 팀 목록
 * 
 * 4. 권한 검증
 *    - 팀 생성: 로그인한 사용자
 *    - 팀 수정/삭제: OWNER만 가능
 *    - 멤버 추가: OWNER/ADMIN만 가능
 *    - 멤버 제거: OWNER/ADMIN만 가능
 *    - 역할 변경: OWNER만 가능
 */
@RestController
@RequestMapping("/api/teams")
public class TeamController {
    
    private final TeamService teamService;
    
    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }
    
    // 모든 팀 조회
    @GetMapping
    public ResponseEntity<List<TeamDto>> getAllTeams() {
        List<TeamDto> teams = teamService.getAllTeams();
        return ResponseEntity.ok(teams);
    }
    
    // ID로 팀 조회
    @GetMapping("/{id}")
    public ResponseEntity<TeamDto> getTeamById(@PathVariable Long id) {
        TeamDto team = teamService.getTeamById(id);
        return ResponseEntity.ok(team);
    }
    
    // 팀 생성
    @PostMapping
    public ResponseEntity<TeamDto> createTeam(@RequestBody TeamDto teamDto) {
        TeamDto createdTeam = teamService.createTeam(teamDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTeam);
    }
    
    // 팀 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<TeamDto> updateTeam(@PathVariable Long id, @RequestBody TeamDto teamDto) {
        TeamDto updatedTeam = teamService.updateTeam(id, teamDto);
        return ResponseEntity.ok(updatedTeam);
    }
    
    // 팀 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }
    
    // 팀 멤버 목록 조회
    @GetMapping("/{id}/members")
    public ResponseEntity<List<TeamMemberDto>> getTeamMembers(@PathVariable Long id) {
        List<TeamMemberDto> members = teamService.getTeamMembers(id);
        return ResponseEntity.ok(members);
    }
    
    // 팀에 멤버 추가
    @PostMapping("/{teamId}/members/{userId}")
    public ResponseEntity<TeamMemberDto> addTeamMember(
            @PathVariable Long teamId, 
            @PathVariable Long userId,
            @RequestParam(defaultValue = "MEMBER") TeamMemberRole role) {
        TeamMemberDto member = teamService.addTeamMember(teamId, userId, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }
    
    // 팀 멤버 제거
    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> removeTeamMember(@PathVariable Long teamId, @PathVariable Long userId) {
        teamService.removeTeamMember(teamId, userId);
        return ResponseEntity.noContent().build();
    }
    
    // 팀 멤버 역할 변경
    @PutMapping("/{teamId}/members/{userId}/role")
    public ResponseEntity<TeamMemberDto> updateMemberRole(
            @PathVariable Long teamId, 
            @PathVariable Long userId,
            @RequestParam TeamMemberRole role) {
        TeamMemberDto updatedMember = teamService.updateMemberRole(teamId, userId, role);
        return ResponseEntity.ok(updatedMember);
    }
    
    // 사용자가 속한 팀 목록 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TeamDto>> getUserTeams(@PathVariable Long userId) {
        List<TeamDto> teams = teamService.getUserTeams(userId);
        return ResponseEntity.ok(teams);
    }
}
