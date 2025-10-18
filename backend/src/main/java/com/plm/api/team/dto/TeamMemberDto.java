package com.plm.api.team.dto;

import com.plm.api.team.entity.TeamMemberRole;
import java.time.LocalDateTime;

/**
 * TeamMember Data Transfer Object
 * 
 * TODO: 팀원이 구현할 내용
 * - 멤버 초대 요청 DTO (InviteMemberRequest)
 * - 멤버 역할 변경 요청 DTO (UpdateMemberRoleRequest)
 */
public class TeamMemberDto {
    
    private Long id;
    private Long teamId;
    private String teamName;
    private Long userId;
    private String username;
    private String userFullName;
    private String userEmail;
    private TeamMemberRole role;
    private LocalDateTime joinedAt;
    
    // 기본 생성자
    public TeamMemberDto() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getTeamId() {
        return teamId;
    }
    
    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }
    
    public String getTeamName() {
        return teamName;
    }
    
    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getUserFullName() {
        return userFullName;
    }
    
    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }
    
    public String getUserEmail() {
        return userEmail;
    }
    
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
    
    public TeamMemberRole getRole() {
        return role;
    }
    
    public void setRole(TeamMemberRole role) {
        this.role = role;
    }
    
    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
    
    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
