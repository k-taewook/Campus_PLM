package com.plm.api.team.entity;

import com.plm.api.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * TeamMember Entity
 * 팀 멤버 정보를 저장하는 엔티티 (User와 Team의 다대다 관계)
 * 
 * TODO: 팀원이 구현할 내용
 * - User와 ManyToOne 관계 설정
 * - Team과 ManyToOne 관계 설정
 * - 멤버 초대 승인 상태 추가
 * - 멤버 활동 통계 (참여 프로젝트 수, 완료 태스크 수 등)
 */
@Entity
@Table(name = "team_members")
public class TeamMember {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamMemberRole role = TeamMemberRole.MEMBER;
    
    @Column(name = "joined_at")
    private LocalDateTime joinedAt;
    
    // 기본 생성자
    public TeamMember() {
        this.joinedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Team getTeam() {
        return team;
    }
    
    public void setTeam(Team team) {
        this.team = team;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
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
