package com.plm.api.comment.entity;

public enum CommentType {
    PROJECT("프로젝트 댓글"),
    TASK("태스크 댓글");
    
    private final String description;
    
    CommentType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
