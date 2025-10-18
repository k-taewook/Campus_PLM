package com.plm.api.notification.repository;

import com.plm.api.notification.entity.Notification;
import com.plm.api.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Notification Repository
 * 
 * TODO: 팀원이 구현할 내용
 * - 사용자별 알림 조회
 * - 읽지 않은 알림 조회
 * - 타입별 알림 조회
 * - 알림 일괄 읽음 처리
 * - 오래된 알림 자동 삭제
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // 사용자의 모든 알림 조회 (최신순)
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByUserId(Long userId);
    
    // 사용자의 읽지 않은 알림 조회
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserId(Long userId);
    
    // 사용자의 읽은 알림 조회
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = true ORDER BY n.createdAt DESC")
    List<Notification> findReadByUserId(Long userId);
    
    // 타입별 알림 조회
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndType(Long userId, NotificationType type);
    
    // 읽지 않은 알림 개수
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    Long countUnreadByUserId(Long userId);
    
    // 특정 날짜 이후의 알림 조회
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndCreatedAtAfter(Long userId, LocalDateTime since);
    
    // 사용자의 모든 알림 읽음 처리
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsReadByUserId(Long userId, LocalDateTime readAt);
    
    // 특정 알림 읽음 처리
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id")
    void markAsRead(Long id, LocalDateTime readAt);
    
    // 오래된 알림 삭제 (자동 정리용)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :date")
    void deleteOldNotifications(LocalDateTime date);
}
