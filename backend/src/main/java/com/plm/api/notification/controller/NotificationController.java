package com.plm.api.notification.controller;

import com.plm.api.notification.dto.NotificationDto;
import com.plm.api.notification.entity.NotificationType;
import com.plm.api.notification.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Notification REST Controller
 * 알림 관련 REST API 엔드포인트
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 알림 조회 API
 *    - GET /api/notifications - 사용자의 모든 알림 조회
 *    - GET /api/notifications/unread - 읽지 않은 알림 조회
 *    - GET /api/notifications/unread/count - 읽지 않은 알림 개수
 *    - GET /api/notifications/type/{type} - 타입별 알림 조회
 * 
 * 2. 알림 관리 API
 *    - PUT /api/notifications/{id}/read - 알림 읽음 처리
 *    - PUT /api/notifications/read-all - 모든 알림 읽음 처리
 *    - DELETE /api/notifications/{id} - 알림 삭제
 * 
 * 3. 실시간 알림 API
 *    - WebSocket /ws/notifications - 실시간 알림 스트림
 *    - SSE /api/notifications/stream - Server-Sent Events
 * 
 * 4. 권한 검증
 *    - 본인의 알림만 조회/관리 가능
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    private final NotificationService notificationService;
    
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    // 사용자의 모든 알림 조회
    // TODO: @AuthenticationPrincipal로 현재 로그인한 사용자 ID 가져오기
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDto>> getUserNotifications(@PathVariable Long userId) {
        List<NotificationDto> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
    
    // 읽지 않은 알림 조회
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(@PathVariable Long userId) {
        List<NotificationDto> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
    
    // 읽은 알림 조회
    @GetMapping("/user/{userId}/read")
    public ResponseEntity<List<NotificationDto>> getReadNotifications(@PathVariable Long userId) {
        List<NotificationDto> notifications = notificationService.getReadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }
    
    // 읽지 않은 알림 개수
    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }
    
    // 타입별 알림 조회
    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<NotificationDto>> getNotificationsByType(
            @PathVariable Long userId,
            @PathVariable NotificationType type) {
        List<NotificationDto> notifications = notificationService.getNotificationsByType(userId, type);
        return ResponseEntity.ok(notifications);
    }
    
    // 최근 알림 조회 (예: 최근 7일)
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<NotificationDto>> getRecentNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "7") int days) {
        List<NotificationDto> notifications = notificationService.getRecentNotifications(userId, days);
        return ResponseEntity.ok(notifications);
    }
    
    // 알림 생성 (시스템용 또는 테스트용)
    @PostMapping
    public ResponseEntity<NotificationDto> createNotification(
            @RequestParam Long userId,
            @RequestParam NotificationType type,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam(required = false) String linkUrl) {
        NotificationDto notification = notificationService.createNotification(userId, type, title, message, linkUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }
    
    // 알림 읽음 처리
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
    
    // 모든 알림 읽음 처리
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
    
    // 알림 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
