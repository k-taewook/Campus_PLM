package com.plm.api.notification.service;

import com.plm.api.notification.dto.NotificationDto;
import com.plm.api.notification.entity.Notification;
import com.plm.api.notification.entity.NotificationType;
import com.plm.api.notification.repository.NotificationRepository;
import com.plm.api.user.entity.User;
import com.plm.api.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Notification Service
 * 알림 비즈니스 로직
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 알림 생성
 *    - 태스크 할당 시 알림
 *    - 댓글 작성 시 알림
 *    - 멘션 시 알림
 *    - 마감일 임박 알림
 * 
 * 2. 알림 조회
 *    - 읽지 않은 알림 조회
 *    - 알림 목록 조회 (페이징)
 *    - 타입별 알림 필터링
 * 
 * 3. 알림 관리
 *    - 읽음 처리 (개별/일괄)
 *    - 알림 삭제
 *    - 오래된 알림 자동 정리
 * 
 * 4. 실시간 알림
 *    - WebSocket/SSE를 통한 실시간 전송
 *    - 알림 배지 카운트 업데이트
 * 
 * 5. 알림 설정
 *    - 사용자별 알림 선호도 관리
 *    - 이메일 알림 설정
 *    - 푸시 알림 설정
 */
@Service
@Transactional
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    
    public NotificationService(NotificationRepository notificationRepository,
                              UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }
    
    // Entity -> DTO 변환
    private NotificationDto convertToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUser().getId());
        dto.setUsername(notification.getUser().getUsername());
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setLinkUrl(notification.getLinkUrl());
        dto.setIsRead(notification.getIsRead());
        dto.setReadAt(notification.getReadAt());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
    
    // 사용자의 모든 알림 조회
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 읽지 않은 알림 조회
    public List<NotificationDto> getUnreadNotifications(Long userId) {
        return notificationRepository.findUnreadByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 읽은 알림 조회
    public List<NotificationDto> getReadNotifications(Long userId) {
        return notificationRepository.findReadByUserId(userId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 읽지 않은 알림 개수
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }
    
    // 알림 생성
    public NotificationDto createNotification(Long userId, NotificationType type, String title, String message, String linkUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLinkUrl(linkUrl);
        
        Notification savedNotification = notificationRepository.save(notification);
        return convertToDto(savedNotification);
    }
    
    // 알림 읽음 처리
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId, LocalDateTime.now());
    }
    
    // 모든 알림 읽음 처리
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId, LocalDateTime.now());
    }
    
    // 알림 삭제
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
    }
    
    // 오래된 알림 정리 (예: 30일 이상된 읽은 알림)
    public void cleanupOldNotifications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        notificationRepository.deleteOldNotifications(cutoffDate);
    }
    
    // 타입별 알림 조회
    public List<NotificationDto> getNotificationsByType(Long userId, NotificationType type) {
        return notificationRepository.findByUserIdAndType(userId, type).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 최근 알림 조회 (특정 날짜 이후)
    public List<NotificationDto> getRecentNotifications(Long userId, int daysBack) {
        LocalDateTime since = LocalDateTime.now().minusDays(daysBack);
        return notificationRepository.findByUserIdAndCreatedAtAfter(userId, since).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}
