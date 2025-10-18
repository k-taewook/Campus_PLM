package com.plm.api.dashboard.controller;

import com.plm.api.dashboard.dto.DashboardStatsDto;
import com.plm.api.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Dashboard REST Controller
 * 대시보드 관련 REST API 엔드포인트
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 전체 통계 API
 *    - GET /api/dashboard/stats - 전체 시스템 통계
 *    - GET /api/dashboard/stats/user/{userId} - 사용자별 통계
 *    - GET /api/dashboard/stats/team/{teamId} - 팀별 통계
 * 
 * 2. 프로젝트 진행률 API
 *    - GET /api/dashboard/projects/progress - 모든 프로젝트 진행률
 *    - GET /api/dashboard/projects/{id}/progress - 특정 프로젝트 진행률
 * 
 * 3. 활동 현황 API
 *    - GET /api/dashboard/activities/recent - 최근 활동
 *    - GET /api/dashboard/activities/user/{userId} - 사용자 활동
 * 
 * 4. 시계열 데이터 API
 *    - GET /api/dashboard/trends/projects - 프로젝트 생성 추이
 *    - GET /api/dashboard/trends/tasks - 태스크 완료 추이
 *    - GET /api/dashboard/trends/users - 사용자 활동 추이
 * 
 * 5. 상위 목록 API
 *    - GET /api/dashboard/top/projects - 가장 활발한 프로젝트
 *    - GET /api/dashboard/top/users - 가장 활발한 사용자
 *    - GET /api/dashboard/top/teams - 가장 활발한 팀
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }
    
    // 전체 시스템 통계
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getOverallStats() {
        DashboardStatsDto stats = dashboardService.getOverallStats();
        return ResponseEntity.ok(stats);
    }
    
    // 사용자별 통계
    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<DashboardStatsDto> getUserStats(@PathVariable Long userId) {
        DashboardStatsDto stats = dashboardService.getUserStats(userId);
        return ResponseEntity.ok(stats);
    }
    
    // 프로젝트 진행률
    @GetMapping("/projects/{projectId}/progress")
    public ResponseEntity<Integer> getProjectProgress(@PathVariable Long projectId) {
        Integer progress = dashboardService.calculateProjectProgress(projectId);
        return ResponseEntity.ok(progress);
    }
}
