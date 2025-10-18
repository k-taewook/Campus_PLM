package com.plm.api.comment.repository;

import com.plm.api.comment.entity.Comment;
import com.plm.api.comment.entity.CommentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Comment Repository
 * 
 * TODO: 팀원이 구현할 내용
 * - 프로젝트별 댓글 조회
 * - 태스크별 댓글 조회
 * - 대댓글 조회
 * - 사용자별 댓글 조회
 * - 댓글 검색
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // 프로젝트의 모든 댓글 조회
    @Query("SELECT c FROM Comment c WHERE c.project.id = :projectId ORDER BY c.createdAt DESC")
    List<Comment> findByProjectId(Long projectId);
    
    // 태스크의 모든 댓글 조회
    @Query("SELECT c FROM Comment c WHERE c.task.id = :taskId ORDER BY c.createdAt DESC")
    List<Comment> findByTaskId(Long taskId);
    
    // 프로젝트의 최상위 댓글만 조회 (대댓글 제외)
    @Query("SELECT c FROM Comment c WHERE c.project.id = :projectId AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findTopLevelCommentsByProjectId(Long projectId);
    
    // 태스크의 최상위 댓글만 조회 (대댓글 제외)
    @Query("SELECT c FROM Comment c WHERE c.task.id = :taskId AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findTopLevelCommentsByTaskId(Long taskId);
    
    // 대댓글 조회
    @Query("SELECT c FROM Comment c WHERE c.parentComment.id = :parentId ORDER BY c.createdAt ASC")
    List<Comment> findByParentCommentId(Long parentId);
    
    // 사용자가 작성한 모든 댓글 조회
    @Query("SELECT c FROM Comment c WHERE c.author.id = :authorId ORDER BY c.createdAt DESC")
    List<Comment> findByAuthorId(Long authorId);
    
    // 타입별 댓글 조회
    List<Comment> findByType(CommentType type);
    
    // 댓글 수 조회 (프로젝트별)
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.project.id = :projectId")
    Long countByProjectId(Long projectId);
    
    // 댓글 수 조회 (태스크별)
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.task.id = :taskId")
    Long countByTaskId(Long taskId);
}
