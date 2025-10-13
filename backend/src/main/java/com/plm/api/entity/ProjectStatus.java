package com.plm.api.entity;

public enum ProjectStatus {
    PLANNING("기획"),
    ACTIVE("진행중"),
    COMPLETED("완료"),
    CANCELLED("취소"),
    ON_HOLD("보류");
    
    private final String description;
    
    ProjectStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}