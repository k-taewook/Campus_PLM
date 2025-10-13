package com.plm.api.entity;

public enum Priority {
    LOW("낮음"),
    MEDIUM("보통"),
    HIGH("높음"),
    URGENT("긴급");
    
    private final String description;
    
    Priority(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}