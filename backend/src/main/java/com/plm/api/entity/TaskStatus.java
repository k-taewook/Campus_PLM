package com.plm.api.entity;

public enum TaskStatus {
    TODO("할 일"),
    IN_PROGRESS("진행중"),
    REVIEW("검토중"),
    DONE("완료"),
    CANCELLED("취소");
    
    private final String description;
    
    TaskStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}