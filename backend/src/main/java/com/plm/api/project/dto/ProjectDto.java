package com.plm.api.project.dto;

import com.plm.api.project.entity.Project;
import com.plm.api.project.entity.ProjectStatus;

import java.time.LocalDateTime;

public class ProjectDto {
    private Long id;
    private String name;
    private String description;
    private ProjectStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String managerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long totalTasks;
    private Long completedTasks;
    private Double progressPercentage;
    
    // 기본 생성자
    public ProjectDto() {}
    
    // Entity에서 DTO로 변환하는 생성자
    public ProjectDto(Project project) {
        this.id = project.getId();
        this.name = project.getName();
        this.description = project.getDescription();
        this.status = project.getStatus();
        this.startDate = project.getStartDate();
        this.endDate = project.getEndDate();
        this.managerId = project.getManagerId();
        this.createdAt = project.getCreatedAt();
        this.updatedAt = project.getUpdatedAt();
    }
    
    // 전체 생성자
    public ProjectDto(Long id, String name, String description, ProjectStatus status, 
                     LocalDateTime startDate, LocalDateTime endDate, String managerId,
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.managerId = managerId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public ProjectStatus getStatus() {
        return status;
    }
    
    public void setStatus(ProjectStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }
    
    public LocalDateTime getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
    
    public String getManagerId() {
        return managerId;
    }
    
    public void setManagerId(String managerId) {
        this.managerId = managerId;
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
    
    public Long getTotalTasks() {
        return totalTasks;
    }
    
    public void setTotalTasks(Long totalTasks) {
        this.totalTasks = totalTasks;
    }
    
    public Long getCompletedTasks() {
        return completedTasks;
    }
    
    public void setCompletedTasks(Long completedTasks) {
        this.completedTasks = completedTasks;
    }
    
    public Double getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}
