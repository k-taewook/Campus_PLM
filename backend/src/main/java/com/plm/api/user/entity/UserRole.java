package com.plm.api.user.entity;

public enum UserRole {
    ADMIN("관리자"),
    MANAGER("매니저"),
    DEVELOPER("개발자"),
    DESIGNER("디자이너"),
    TESTER("테스터"),
    VIEWER("뷰어");
    
    private final String description;
    
    UserRole(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
