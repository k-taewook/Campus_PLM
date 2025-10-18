package com.plm.api.comment.controller;

import com.plm.api.comment.dto.CommentDto;
import com.plm.api.comment.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Comment REST Controller
 * 댓글 관련 REST API 엔드포인트
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 댓글 API
 *    - GET /api/comments - 모든 댓글 조회 (관리자용)
 *    - GET /api/comments/{id} - 특정 댓글 조회
 *    - POST /api/comments - 댓글 생성
 *    - PUT /api/comments/{id} - 댓글 수정 (작성자만)
 *    - DELETE /api/comments/{id} - 댓글 삭제 (작성자/관리자만)
 * 
 * 2. 프로젝트 댓글 API
 *    - GET /api/projects/{projectId}/comments - 프로젝트 댓글 조회
 *    - POST /api/projects/{projectId}/comments - 프로젝트 댓글 작성
 * 
 * 3. 태스크 댓글 API
 *    - GET /api/tasks/{taskId}/comments - 태스크 댓글 조회
 *    - POST /api/tasks/{taskId}/comments - 태스크 댓글 작성
 * 
 * 4. 대댓글 API
 *    - GET /api/comments/{id}/replies - 대댓글 조회
 *    - POST /api/comments/{id}/replies - 대댓글 작성
 * 
 * 5. 권한 검증
 *    - 댓글 작성: 로그인 사용자
 *    - 댓글 수정: 작성자 본인
 *    - 댓글 삭제: 작성자 또는 관리자
 */
@RestController
@RequestMapping("/api/comments")
public class CommentController {
    
    private final CommentService commentService;
    
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }
    
    // 모든 댓글 조회
    @GetMapping
    public ResponseEntity<List<CommentDto>> getAllComments() {
        List<CommentDto> comments = commentService.getAllComments();
        return ResponseEntity.ok(comments);
    }
    
    // ID로 댓글 조회
    @GetMapping("/{id}")
    public ResponseEntity<CommentDto> getCommentById(@PathVariable Long id) {
        CommentDto comment = commentService.getCommentById(id);
        return ResponseEntity.ok(comment);
    }
    
    // 프로젝트 댓글 조회
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<CommentDto>> getProjectComments(@PathVariable Long projectId) {
        List<CommentDto> comments = commentService.getProjectComments(projectId);
        return ResponseEntity.ok(comments);
    }
    
    // 태스크 댓글 조회
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<CommentDto>> getTaskComments(@PathVariable Long taskId) {
        List<CommentDto> comments = commentService.getTaskComments(taskId);
        return ResponseEntity.ok(comments);
    }
    
    // 대댓글 조회
    @GetMapping("/{id}/replies")
    public ResponseEntity<List<CommentDto>> getReplies(@PathVariable Long id) {
        List<CommentDto> replies = commentService.getReplies(id);
        return ResponseEntity.ok(replies);
    }
    
    // 댓글 생성
    // TODO: @AuthenticationPrincipal로 현재 로그인한 사용자 ID 가져오기
    @PostMapping
    public ResponseEntity<CommentDto> createComment(
            @RequestBody CommentDto commentDto,
            @RequestParam Long authorId) {
        CommentDto createdComment = commentService.createComment(commentDto, authorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }
    
    // 댓글 수정
    @PutMapping("/{id}")
    public ResponseEntity<CommentDto> updateComment(@PathVariable Long id, @RequestBody CommentDto commentDto) {
        CommentDto updatedComment = commentService.updateComment(id, commentDto);
        return ResponseEntity.ok(updatedComment);
    }
    
    // 댓글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
    
    // 사용자의 모든 댓글 조회
    @GetMapping("/user/{authorId}")
    public ResponseEntity<List<CommentDto>> getUserComments(@PathVariable Long authorId) {
        List<CommentDto> comments = commentService.getUserComments(authorId);
        return ResponseEntity.ok(comments);
    }
}
