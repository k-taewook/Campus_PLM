package com.plm.api.comment.dto;

import com.plm.api.comment.entity.CommentType;
import java.time.LocalDateTime;

/**
 * Comment Data Transfer Object
 * 
 * TODO: 팀원이 구현할 내용
 * - 댓글 생성 요청 DTO (CreateCommentRequest)
 * - 댓글 업데이트 요청 DTO (UpdateCommentRequest)
 * - 대댓글 목록 포함 DTO
 */
public class CommentDto {
    
    private Long id;
    private String content;
    private CommentType type;
    private Long projectId;
    private String projectName;
    private Long taskId;
    private String taskTitle;
    private Long authorId;
    private String authorUsername;
    private String authorFullName;
    private Long parentCommentId;
    private Boolean isEdited;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 기본 생성자
    public CommentDto() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public CommentType getType() {
        return type;
    }
    
    public void setType(CommentType type) {
        this.type = type;
    }
    
    public Long getProjectId() {
        return projectId;
    }
    
    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
    
    public String getProjectName() {
        return projectName;
    }
    
    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }
    
    public Long getTaskId() {
        return taskId;
    }
    
    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }
    
    public String getTaskTitle() {
        return taskTitle;
    }
    
    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }
    
    public Long getAuthorId() {
        return authorId;
    }
    
    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }
    
    public String getAuthorUsername() {
        return authorUsername;
    }
    
    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }
    
    public String getAuthorFullName() {
        return authorFullName;
    }
    
    public void setAuthorFullName(String authorFullName) {
        this.authorFullName = authorFullName;
    }
    
    public Long getParentCommentId() {
        return parentCommentId;
    }
    
    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }
    
    public Boolean getIsEdited() {
        return isEdited;
    }
    
    public void setIsEdited(Boolean isEdited) {
        this.isEdited = isEdited;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
