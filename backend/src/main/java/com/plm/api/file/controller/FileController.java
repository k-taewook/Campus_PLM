package com.plm.api.file.controller;

import com.plm.api.common.security.AuthorizationService;
import com.plm.api.file.dto.FileDto;
import com.plm.api.file.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

/**
 * File REST Controller
 * 파일 관련 REST API 엔드포인트
 * 
 * TODO: 팀원이 구현할 내용
 * 1. 파일 업로드 API
 *    - POST /api/files/upload - 파일 업로드
 *    - POST /api/projects/{projectId}/files - 프로젝트에 파일 업로드
 *    - POST /api/tasks/{taskId}/files - 태스크에 파일 업로드
 *    - 멀티파트 파일 처리
 *    - 진행률 표시 (WebSocket)
 * 
 * 2. 파일 다운로드 API
 *    - GET /api/files/{id}/download - 파일 다운로드
 *    - GET /api/files/{id}/preview - 파일 미리보기 (이미지, PDF)
 *    - 스트리밍 다운로드
 * 
 * 3. 파일 조회 API
 *    - GET /api/files/{id} - 파일 정보 조회
 *    - GET /api/projects/{projectId}/files - 프로젝트 파일 목록
 *    - GET /api/tasks/{taskId}/files - 태스크 파일 목록
 *    - GET /api/users/{userId}/files - 사용자 업로드 파일 목록
 * 
 * 4. 파일 삭제 API
 *    - DELETE /api/files/{id} - 파일 삭제
 * 
 * 5. 권한 검증
 *    - 업로드: 로그인 사용자
 *    - 다운로드: 프로젝트/태스크 접근 권한
 *    - 삭제: 업로더 본인 또는 관리자
 */
@RestController
@RequestMapping("/api/files")
public class FileController {
    
    private final FileService fileService;
    
    @Autowired
    private AuthorizationService authorizationService;
    
    public FileController(FileService fileService) {
        this.fileService = fileService;
    }
    
    // 파일 업로드
    @PostMapping("/upload")
    public ResponseEntity<FileDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long uploaderId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long taskId) {
        try {
            FileDto uploadedFile = fileService.uploadFile(file, uploaderId, projectId, taskId);
            return ResponseEntity.status(HttpStatus.CREATED).body(uploadedFile);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }
    
    // 파일 정보 조회
    @GetMapping("/{id}")
    public ResponseEntity<FileDto> getFile(@PathVariable Long id) {
        FileDto file = fileService.getFileById(id);
        return ResponseEntity.ok(file);
    }
    
    // 프로젝트 파일 목록
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<FileDto>> getProjectFiles(@PathVariable Long projectId) {
        List<FileDto> files = fileService.getProjectFiles(projectId);
        return ResponseEntity.ok(files);
    }
    
    // 태스크 파일 목록
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<FileDto>> getTaskFiles(@PathVariable Long taskId) {
        List<FileDto> files = fileService.getTaskFiles(taskId);
        return ResponseEntity.ok(files);
    }
    
    // 사용자 업로드 파일 목록
    @GetMapping("/user/{uploaderId}")
    public ResponseEntity<List<FileDto>> getUserFiles(@PathVariable Long uploaderId) {
        List<FileDto> files = fileService.getUserFiles(uploaderId);
        return ResponseEntity.ok(files);
    }
    
    // 파일 다운로드
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        try {
            FileDto fileDto = fileService.getFileById(id);
            Path filePath = Paths.get(fileDto.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists()) {
                throw new RuntimeException("File not found");
            }
            
            // 다운로드 횟수 증가
            fileService.incrementDownloadCount(id);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fileDto.getMimeType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + fileDto.getOriginalName() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            throw new RuntimeException("File download failed: " + e.getMessage());
        }
    }
    
    // 파일 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id, @RequestParam Long userId) {
        // 권한 확인
        if (!authorizationService.canDeleteFile(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("파일을 삭제할 권한이 없습니다.");
        }
        
        try {
            fileService.deleteFile(id);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }

   // 파일 일괄 삭제
    @DeleteMapping("/bulk")
    public ResponseEntity<Map<String, Object>> deleteFiles(@RequestBody Map<String, Object> request) {
        try {
            // fileIds 추출 및 변환
            Object fileIdsObj = request.get("fileIds");
            if (fileIdsObj == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "fileIds는 필수입니다."));
            }
            
            List<Long> fileIds;
            try {
                @SuppressWarnings("unchecked")
                List<Object> fileIdList = (List<Object>) fileIdsObj;
                fileIds = fileIdList.stream()
                    .map(obj -> {
                        if (obj instanceof Number) {
                            return ((Number) obj).longValue();
                        } else {
                            return Long.parseLong(obj.toString());
                        }
                    })
                    .collect(java.util.stream.Collectors.toList());
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "fileIds 형식이 올바르지 않습니다: " + e.getMessage()));
            }
            
            if (fileIds.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "fileIds가 비어있습니다."));
            }
            
            // userId 추출
            Object userIdObj = request.get("userId");
            if (userIdObj == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "userId는 필수입니다."));
            }
            
            Long userId;
            try {
                if (userIdObj instanceof Number) {
                    userId = ((Number) userIdObj).longValue();
                } else {
                    userId = Long.parseLong(userIdObj.toString());
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "userId 형식이 올바르지 않습니다: " + e.getMessage()));
            }
            
            int successCount = 0;
            int failureCount = 0;
            int noPermissionCount = 0;
            
            for (Long fileId : fileIds) {
                try {
                    // 권한 확인
                    if (!authorizationService.canDeleteFile(userId, fileId)) {
                        noPermissionCount++;
                        continue;
                    }
                    
                    fileService.deleteFile(fileId);
                    successCount++;
                } catch (Exception e) {
                    failureCount++;
                    System.err.println("Failed to delete file with id " + fileId + ": " + e.getMessage());
                }
            }
            
            Map<String, Object> response = Map.of(
                "totalRequested", fileIds.size(),
                "successCount", successCount,
                "failureCount", failureCount,
                "noPermissionCount", noPermissionCount
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Bulk delete operation failed: " + e.getMessage()));
        }
    }

    // 파일 정보 수정 (현재: 파일명만 수정)
    @PutMapping("/{id}")
    public ResponseEntity<FileDto> updateFile(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String originalName = body.get("originalName") != null ? body.get("originalName").toString() : null;
        if (originalName == null || originalName.trim().isEmpty()) {
            throw new RuntimeException("originalName is required");
        }
        FileDto updated = fileService.updateOriginalName(id, originalName.trim());
        return ResponseEntity.ok(updated);
    }
}
