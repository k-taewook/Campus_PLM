package com.plm.api.notification.entity;

public enum NotificationType {
    TASK_ASSIGNED("태스크 할당"),
    TASK_STATUS_CHANGED("태스크 상태 변경"),
    COMMENT_ADDED("댓글 추가"),
    COMMENT_MENTIONED("댓글 멘션"),
    PROJECT_UPDATED("프로젝트 업데이트"),
    TEAM_INVITATION("팀 초대"),
    DEADLINE_APPROACHING("마감일 임박"),
    SYSTEM("시스템 알림");
    
    private final String description;
    
    NotificationType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
