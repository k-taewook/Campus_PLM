package com.plm.api.user.entity;

public enum UserRole {
    ADMIN("관리자"),
    LEADER("리더"),
    MEMBER("멤버");
    
    private final String description;
    
    UserRole(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
