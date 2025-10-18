package com.plm.api.dashboard.dto;

/**
 * Dashboard Statistics DTO
 * 대시보드 전체 통계 데이터
 * 
 * TODO: 팀원이 구현할 내용
 * - 사용자별 맞춤 통계
 * - 팀별 통계
 * - 기간별 통계 (일간, 주간, 월간)
 * - 차트 데이터 (시계열, 파이 차트 등)
 */
public class DashboardStatsDto {
    
    // 프로젝트 통계
    private Long totalProjects;
    private Long activeProjects;
    private Long completedProjects;
    private Long cancelledProjects;
    
    // 태스크 통계
    private Long totalTasks;
    private Long todoTasks;
    private Long inProgressTasks;
    private Long reviewTasks;
    private Long doneTasks;
    
    // 사용자 통계
    private Long totalUsers;
    private Long activeUsers;
    
    // 팀 통계
    private Long totalTeams;
    
    // 파일 통계
    private Long totalFiles;
    private Long totalFileSize; // bytes
    
    // 댓글 통계
    private Long totalComments;
    
    // 알림 통계
    private Long unreadNotifications;
    
    // 기본 생성자
    public DashboardStatsDto() {}
    
    // Getters and Setters
    public Long getTotalProjects() {
        return totalProjects;
    }
    
    public void setTotalProjects(Long totalProjects) {
        this.totalProjects = totalProjects;
    }
    
    public Long getActiveProjects() {
        return activeProjects;
    }
    
    public void setActiveProjects(Long activeProjects) {
        this.activeProjects = activeProjects;
    }
    
    public Long getCompletedProjects() {
        return completedProjects;
    }
    
    public void setCompletedProjects(Long completedProjects) {
        this.completedProjects = completedProjects;
    }
    
    public Long getCancelledProjects() {
        return cancelledProjects;
    }
    
    public void setCancelledProjects(Long cancelledProjects) {
        this.cancelledProjects = cancelledProjects;
    }
    
    public Long getTotalTasks() {
        return totalTasks;
    }
    
    public void setTotalTasks(Long totalTasks) {
        this.totalTasks = totalTasks;
    }
    
    public Long getTodoTasks() {
        return todoTasks;
    }
    
    public void setTodoTasks(Long todoTasks) {
        this.todoTasks = todoTasks;
    }
    
    public Long getInProgressTasks() {
        return inProgressTasks;
    }
    
    public void setInProgressTasks(Long inProgressTasks) {
        this.inProgressTasks = inProgressTasks;
    }
    
    public Long getReviewTasks() {
        return reviewTasks;
    }
    
    public void setReviewTasks(Long reviewTasks) {
        this.reviewTasks = reviewTasks;
    }
    
    public Long getDoneTasks() {
        return doneTasks;
    }
    
    public void setDoneTasks(Long doneTasks) {
        this.doneTasks = doneTasks;
    }
    
    public Long getTotalUsers() {
        return totalUsers;
    }
    
    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }
    
    public Long getActiveUsers() {
        return activeUsers;
    }
    
    public void setActiveUsers(Long activeUsers) {
        this.activeUsers = activeUsers;
    }
    
    public Long getTotalTeams() {
        return totalTeams;
    }
    
    public void setTotalTeams(Long totalTeams) {
        this.totalTeams = totalTeams;
    }
    
    public Long getTotalFiles() {
        return totalFiles;
    }
    
    public void setTotalFiles(Long totalFiles) {
        this.totalFiles = totalFiles;
    }
    
    public Long getTotalFileSize() {
        return totalFileSize;
    }
    
    public void setTotalFileSize(Long totalFileSize) {
        this.totalFileSize = totalFileSize;
    }
    
    public Long getTotalComments() {
        return totalComments;
    }
    
    public void setTotalComments(Long totalComments) {
        this.totalComments = totalComments;
    }
    
    public Long getUnreadNotifications() {
        return unreadNotifications;
    }
    
    public void setUnreadNotifications(Long unreadNotifications) {
        this.unreadNotifications = unreadNotifications;
    }
}
