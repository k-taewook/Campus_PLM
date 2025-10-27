package com.plm.api.dashboard.service;

import com.plm.api.comment.repository.CommentRepository;
import com.plm.api.dashboard.dto.DashboardStatsDto;
import com.plm.api.file.repository.FileRepository;
import com.plm.api.notification.repository.NotificationRepository;
import com.plm.api.project.entity.ProjectStatus;
import com.plm.api.project.repository.ProjectRepository;
import com.plm.api.task.entity.Task;
import com.plm.api.task.entity.TaskStatus;
import com.plm.api.task.repository.TaskRepository;
import com.plm.api.team.repository.TeamRepository;
import com.plm.api.user.entity.UserStatus;
import com.plm.api.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Dashboard Service
 * 대시보드 통계 및 분석 비즈니스 로직
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 전체 시스템 통계
 *    - 프로젝트/태스크/사용자/팀 개수
 *    - 상태별 집계
 *    - 파일 용량 통계
 * 
 * 2. 프로젝트별 통계
 *    - 프로젝트 진행률
 *    - 태스크 완료율
 *    - 마감일 임박 프로젝트
 * 
 * 3. 사용자별 통계
 *    - 할당된 태스크 수
 *    - 완료한 태스크 수
 *    - 활동 지표
 * 
 * 4. 팀별 통계
 *    - 팀 멤버 수
 *    - 팀 프로젝트 수
 *    - 팀 생산성 지표
 * 
 * 5. 시계열 데이터
 *    - 일별/주별/월별 생성된 프로젝트
 *    - 일별/주별/월별 완료된 태스크
 *    - 사용자 활동 추이
 * 
 * 6. 최근 활동
 *    - 최근 생성된 프로젝트
 *    - 최근 완료된 태스크
 *    - 최근 댓글
 */
@Service
@Transactional(readOnly = true)
public class DashboardService {
    
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final FileRepository fileRepository;
    private final CommentRepository commentRepository;
    private final NotificationRepository notificationRepository;
    
    public DashboardService(ProjectRepository projectRepository,
                           TaskRepository taskRepository,
                           UserRepository userRepository,
                           TeamRepository teamRepository,
                           FileRepository fileRepository,
                           CommentRepository commentRepository,
                           NotificationRepository notificationRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.fileRepository = fileRepository;
        this.commentRepository = commentRepository;
        this.notificationRepository = notificationRepository;
    }
    
    // 전체 시스템 통계
    public DashboardStatsDto getOverallStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        // 프로젝트 통계
        stats.setTotalProjects(projectRepository.count());
        //stats.setActiveProjects(projectRepository.countByStatus(ProjectStatus.ACTIVE));
        //stats.setCompletedProjects(projectRepository.countByStatus(ProjectStatus.COMPLETED));
        //stats.setCancelledProjects(projectRepository.countByStatus(ProjectStatus.CANCELLED));
        
        // 태스크 통계
        stats.setTotalTasks(taskRepository.count());
        //stats.setTodoTasks(taskRepository.countByStatus(TaskStatus.TODO));
        //stats.setInProgressTasks(taskRepository.countByStatus(TaskStatus.IN_PROGRESS));
        //stats.setReviewTasks(taskRepository.countByStatus(TaskStatus.REVIEW));
        //stats.setDoneTasks(taskRepository.countByStatus(TaskStatus.DONE));
        
        // 사용자 통계
        stats.setTotalUsers(userRepository.count());
        stats.setActiveUsers(userRepository.count()); // 임시로 전체 사용자 수
        
        // 팀 통계
        stats.setTotalTeams(teamRepository.count());
        
        // 파일 통계
        stats.setTotalFiles(fileRepository.count());
        
        // 댓글 통계
        stats.setTotalComments(commentRepository.count());
        
        return stats;
    }
    
    // 사용자별 통계
    public DashboardStatsDto getUserStats(Long userId) {
        DashboardStatsDto stats = new DashboardStatsDto();
        
        // 사용자의 읽지 않은 알림 수
        //stats.setUnreadNotifications(notificationRepository.countUnreadByUserId(userId));
        
        // TODO: 사용자가 속한 프로젝트의 통계
        // TODO: 사용자에게 할당된 태스크 통계
        
        return stats;
    }
    
    // 프로젝트 진행률 계산
    public Integer calculateProjectProgress(Long projectId) {
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        if (tasks.isEmpty()) return 0;
        
        long completedTasks = tasks.stream()
            .filter(task -> task.getStatus() == TaskStatus.DONE)
            .count();
        return (int) ((completedTasks * 100) / tasks.size());
    }
}
