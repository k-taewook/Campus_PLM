package com.plm.api.comment.service;

import com.plm.api.comment.dto.CommentDto;
import com.plm.api.comment.entity.Comment;
import com.plm.api.comment.repository.CommentRepository;
import com.plm.api.project.entity.Project;
import com.plm.api.project.repository.ProjectRepository;
import com.plm.api.task.entity.Task;
import com.plm.api.task.repository.TaskRepository;
import com.plm.api.user.entity.User;
import com.plm.api.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Comment Service
 * 댓글 비즈니스 로직
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 댓글 CRUD
 *    - 댓글 생성 (프로젝트/태스크)
 *    - 댓글 조회 (목록, 상세)
 *    - 댓글 수정 (작성자만 가능)
 *    - 댓글 삭제 (작성자 또는 관리자만 가능)
 * 
 * 2. 대댓글 기능
 *    - 대댓글 작성
 *    - 대댓글 조회
 *    - 계층 구조 표현
 * 
 * 3. 권한 검증
 *    - 댓글 작성 권한 (프로젝트/태스크 접근 권한 필요)
 *    - 댓글 수정/삭제 권한 (작성자 본인 또는 관리자)
 * 
 * 4. 멘션 기능
 *    - @username 파싱
 *    - 멘션된 사용자에게 알림
 */
@Service
@Transactional
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    
    public CommentService(CommentRepository commentRepository,
                         ProjectRepository projectRepository,
                         TaskRepository taskRepository,
                         UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }
    
    // Entity -> DTO 변환
    private CommentDto convertToDto(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setType(comment.getType());
        
        if (comment.getProject() != null) {
            dto.setProjectId(comment.getProject().getId());
            dto.setProjectName(comment.getProject().getName());
        }
        
        if (comment.getTask() != null) {
            dto.setTaskId(comment.getTask().getId());
            dto.setTaskTitle(comment.getTask().getTitle());
        }
        
        dto.setAuthorId(comment.getAuthor().getId());
        dto.setAuthorUsername(comment.getAuthor().getUsername());
        dto.setAuthorFullName(comment.getAuthor().getFullName());
        
        if (comment.getParentComment() != null) {
            dto.setParentCommentId(comment.getParentComment().getId());
        }
        
        dto.setIsEdited(comment.getIsEdited());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
    
    // 모든 댓글 조회
    public List<CommentDto> getAllComments() {
        return commentRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // ID로 댓글 조회
    public CommentDto getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
        return convertToDto(comment);
    }
    
    // 프로젝트 댓글 조회
    public List<CommentDto> getProjectComments(Long projectId) {
        return commentRepository.findByProjectId(projectId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 태스크 댓글 조회
    public List<CommentDto> getTaskComments(Long taskId) {
        return commentRepository.findByTaskId(taskId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 대댓글 조회
    public List<CommentDto> getReplies(Long parentCommentId) {
        return commentRepository.findByParentCommentId(parentCommentId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 댓글 생성
    public CommentDto createComment(CommentDto commentDto, Long authorId) {
        Comment comment = new Comment();
        comment.setContent(commentDto.getContent());
        comment.setType(commentDto.getType());
        
        // 작성자 설정
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + authorId));
        comment.setAuthor(author);
        
        // 프로젝트 댓글인 경우
        if (commentDto.getProjectId() != null) {
            Project project = projectRepository.findById(commentDto.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            comment.setProject(project);
        }
        
        // 태스크 댓글인 경우
        if (commentDto.getTaskId() != null) {
            Task task = taskRepository.findById(commentDto.getTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            comment.setTask(task);
        }
        
        // 대댓글인 경우
        if (commentDto.getParentCommentId() != null) {
            Comment parentComment = commentRepository.findById(commentDto.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParentComment(parentComment);
        }
        
        Comment savedComment = commentRepository.save(comment);
        
        // 멘션 처리 (@username)
        List<String> mentions = extractMentions(commentDto.getContent());
        if (!mentions.isEmpty()) {
            processMentions(mentions, savedComment);
        }
        
        return convertToDto(savedComment);
    }
    
    // 멘션 추출 (@username 형식)
    private List<String> extractMentions(String content) {
        List<String> mentions = new ArrayList<>();
        Pattern pattern = Pattern.compile("@([a-zA-Z0-9_]+)");
        Matcher matcher = pattern.matcher(content);
        
        while (matcher.find()) {
            mentions.add(matcher.group(1)); // @ 제외하고 username만 추출
        }
        
        return mentions;
    }
    
    // 멘션 처리 (알림 생성 등)
    private void processMentions(List<String> mentions, Comment comment) {
        for (String username : mentions) {
            try {
                User mentionedUser = userRepository.findByUsername(username)
                        .orElse(null);
                
                if (mentionedUser != null) {
                    // TODO: 알림 생성 (Notification 모듈 구현 후)
                    // notificationService.createMentionNotification(mentionedUser, comment);
                    System.out.println("멘션 처리: @" + username + " (User ID: " + mentionedUser.getId() + ")");
                }
            } catch (Exception e) {
                // 멘션 처리 실패해도 댓글은 저장됨
                System.err.println("멘션 처리 실패: @" + username);
            }
        }
    }
    
    // 댓글 수정
    public CommentDto updateComment(Long id, CommentDto commentDto) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
        
        if (commentDto.getContent() != null) {
            comment.setContent(commentDto.getContent());
        }
        
        Comment updatedComment = commentRepository.save(comment);
        return convertToDto(updatedComment);
    }
    
    // 댓글 삭제
    public void deleteComment(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new RuntimeException("Comment not found with id: " + id);
        }
        commentRepository.deleteById(id);
    }
    
    // 사용자의 모든 댓글 조회
    public List<CommentDto> getUserComments(Long authorId) {
        return commentRepository.findByAuthorId(authorId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 최상위 댓글만 조회 (대댓글 제외) - 프로젝트
    public List<CommentDto> getTopLevelProjectComments(Long projectId) {
        return commentRepository.findTopLevelCommentsByProjectId(projectId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 최상위 댓글만 조회 (대댓글 제외) - 태스크
    public List<CommentDto> getTopLevelTaskComments(Long taskId) {
        return commentRepository.findTopLevelCommentsByTaskId(taskId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 댓글 수 조회 - 프로젝트
    public Long getProjectCommentCount(Long projectId) {
        return commentRepository.countByProjectId(projectId);
    }
    
    // 댓글 수 조회 - 태스크
    public Long getTaskCommentCount(Long taskId) {
        return commentRepository.countByTaskId(taskId);
    }
}
