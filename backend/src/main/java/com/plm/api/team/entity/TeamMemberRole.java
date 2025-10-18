package com.plm.api.team.entity;

public enum TeamMemberRole {
    OWNER("소유자"),
    ADMIN("관리자"),
    MEMBER("멤버"),
    VIEWER("뷰어");
    
    private final String description;
    
    TeamMemberRole(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
