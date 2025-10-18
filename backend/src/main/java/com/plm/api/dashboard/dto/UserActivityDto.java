package com.plm.api.dashboard.dto;

/**
 * User Activity DTO
 * 사용자 활동 데이터
 */
public class UserActivityDto {
    
    private Long userId;
    private String username;
    private String fullName;
    private Integer assignedTasks;
    private Integer completedTasks;
    private Integer uploadsCount;
    private Integer commentsCount;
    
    public UserActivityDto() {}
    
    // Getters and Setters
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
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public Integer getAssignedTasks() {
        return assignedTasks;
    }
    
    public void setAssignedTasks(Integer assignedTasks) {
        this.assignedTasks = assignedTasks;
    }
    
    public Integer getCompletedTasks() {
        return completedTasks;
    }
    
    public void setCompletedTasks(Integer completedTasks) {
        this.completedTasks = completedTasks;
    }
    
    public Integer getUploadsCount() {
        return uploadsCount;
    }
    
    public void setUploadsCount(Integer uploadsCount) {
        this.uploadsCount = uploadsCount;
    }
    
    public Integer getCommentsCount() {
        return commentsCount;
    }
    
    public void setCommentsCount(Integer commentsCount) {
        this.commentsCount = commentsCount;
    }
}
