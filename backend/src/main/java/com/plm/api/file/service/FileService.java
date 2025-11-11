package com.plm.api.file.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.plm.api.file.dto.FileDto;
import com.plm.api.file.entity.FileAttachment;
import com.plm.api.file.entity.FileType;
import com.plm.api.file.repository.FileRepository;
import com.plm.api.project.entity.Project;
import com.plm.api.project.repository.ProjectRepository;
import com.plm.api.task.entity.Task;
import com.plm.api.task.repository.TaskRepository;
import com.plm.api.user.entity.User;
import com.plm.api.user.repository.UserRepository;

/**
 * File Service
 * 파일 관리 비즈니스 로직
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 파일 업로드
 *    - MultipartFile 처리
 *    - 파일 이름 중복 방지 (UUID 사용)
 *    - 파일 크기 제한 검증
 *    - 파일 타입 검증 (허용된 확장자만)
 *    - 이미지 리사이징/썸네일 생성
 * 
 * 2. 파일 다운로드
 *    - 다운로드 횟수 추적
 *    - 권한 검증 (프로젝트/태스크 접근 권한)
 *    - 스트리밍 다운로드
 * 
 * 3. 파일 삭제
 *    - 물리적 파일 삭제
 *    - DB 레코드 삭제
 *    - 권한 검증
 * 
 * 4. 스토리지 관리
 *    - 로컬 스토리지
 *    - AWS S3 연동
 *    - 파일 압축
 *    - 중복 파일 감지
 * 
 * 5. 파일 통계
 *    - 사용자별 업로드 용량
 *    - 프로젝트별 파일 통계
 *    - 파일 타입별 통계
 */
@Service
@Transactional
public class FileService {
    
    @Value("${file.upload.dir:uploads}")
    private String uploadDir;
    
    private final FileRepository fileRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    
    public FileService(FileRepository fileRepository,
                      ProjectRepository projectRepository,
                      TaskRepository taskRepository,
                      UserRepository userRepository) {
        this.fileRepository = fileRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }
    
    // Entity -> DTO 변환
    private FileDto convertToDto(FileAttachment file) {
        FileDto dto = new FileDto();
        dto.setId(file.getId());
        dto.setOriginalName(file.getOriginalName());
        dto.setStoredName(file.getStoredName());
        dto.setFilePath(file.getFilePath());
        dto.setFileSize(file.getFileSize());
        dto.setMimeType(file.getMimeType());
        dto.setFileType(file.getFileType());
        
        if (file.getProject() != null) {
            dto.setProjectId(file.getProject().getId());
            dto.setProjectName(file.getProject().getName());
        }
        
        if (file.getTask() != null) {
            dto.setTaskId(file.getTask().getId());
            dto.setTaskTitle(file.getTask().getTitle());
        }
        
        dto.setUploaderId(file.getUploader().getId());
        dto.setUploaderUsername(file.getUploader().getUsername());
        dto.setUploaderFullName(file.getUploader().getFullName());
        dto.setDownloadCount(file.getDownloadCount());
        dto.setCreatedAt(file.getCreatedAt());
        return dto;
    }
    
    // 파일 타입 결정
    private FileType determineFileType(String mimeType) {
        if (mimeType == null) return FileType.OTHER;
        
        if (mimeType.startsWith("image/")) return FileType.IMAGE;
        if (mimeType.startsWith("video/")) return FileType.VIDEO;
        if (mimeType.startsWith("audio/")) return FileType.AUDIO;
        if (mimeType.contains("zip") || mimeType.contains("rar") || mimeType.contains("7z")) return FileType.ARCHIVE;
        if (mimeType.contains("text") || mimeType.contains("application/json") || mimeType.contains("application/xml")) return FileType.CODE;
        if (mimeType.contains("document") || mimeType.contains("pdf") || mimeType.contains("word") || mimeType.contains("excel")) return FileType.DOCUMENT;
        
        return FileType.OTHER;
    }
    
    // 파일 업로드 (구현 예시)
    public FileDto uploadFile(MultipartFile file, Long uploaderId, Long projectId, Long taskId) throws IOException {
        // 업로더 조회
        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 저장 디렉토리 생성
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // 고유한 파일명 생성 (UUID + 타임스탬프)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String storedName = timestamp + "_" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(storedName);
        
        // 파일 저장
        Files.copy(file.getInputStream(), filePath);
        
        // 파일 엔티티 생성
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setOriginalName(file.getOriginalFilename());
        fileAttachment.setStoredName(storedName);
        fileAttachment.setFilePath(filePath.toString());
        fileAttachment.setFileSize(file.getSize());
        fileAttachment.setMimeType(file.getContentType());
        fileAttachment.setFileType(determineFileType(file.getContentType()));
        fileAttachment.setUploader(uploader);
        
        // 프로젝트 연결
        if (projectId != null) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            fileAttachment.setProject(project);
        }
        
        // 태스크 연결
        if (taskId != null) {
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            fileAttachment.setTask(task);
        }
        
        FileAttachment savedFile = fileRepository.save(fileAttachment);
        return convertToDto(savedFile);
    }
    
    // 파일 조회
    public FileDto getFileById(Long id) {
        FileAttachment file = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));
        return convertToDto(file);
    }
    
    // 프로젝트 파일 목록
    public List<FileDto> getProjectFiles(Long projectId) {
        return fileRepository.findByProjectId(projectId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 태스크 파일 목록
    public List<FileDto> getTaskFiles(Long taskId) {
        return fileRepository.findByTaskId(taskId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 사용자 업로드 파일 목록
    public List<FileDto> getUserFiles(Long uploaderId) {
        return fileRepository.findByUploaderId(uploaderId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 다운로드 횟수 증가
    public void incrementDownloadCount(Long fileId) {
        fileRepository.incrementDownloadCount(fileId);
    }
    
    // 파일 삭제
    public void deleteFile(Long id) throws IOException {
        FileAttachment file = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));
        
        // 물리적 파일 삭제
        Path filePath = Paths.get(file.getFilePath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
        
        // DB 레코드 삭제
        fileRepository.delete(file);
    }

    // 파일명 수정
    public FileDto updateOriginalName(Long id, String originalName) {
        FileAttachment file = fileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id: " + id));
        file.setOriginalName(originalName);
        FileAttachment saved = fileRepository.save(file);
        return convertToDto(saved);
    }
}
