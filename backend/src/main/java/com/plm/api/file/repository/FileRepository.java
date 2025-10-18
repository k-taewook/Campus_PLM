package com.plm.api.file.repository;

import com.plm.api.file.entity.FileAttachment;
import com.plm.api.file.entity.FileType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * File Repository
 * 
 * TODO: 팀원이 구현할 내용
 * - 프로젝트별 파일 조회
 * - 태스크별 파일 조회
 * - 사용자별 업로드 파일 조회
 * - 파일 타입별 조회
 * - 파일 검색
 * - 파일 통계 쿼리
 */
@Repository
public interface FileRepository extends JpaRepository<FileAttachment, Long> {
    
    // 저장된 파일명으로 조회
    Optional<FileAttachment> findByStoredName(String storedName);
    
    // 프로젝트의 모든 파일 조회
    @Query("SELECT f FROM FileAttachment f WHERE f.project.id = :projectId ORDER BY f.createdAt DESC")
    List<FileAttachment> findByProjectId(Long projectId);
    
    // 태스크의 모든 파일 조회
    @Query("SELECT f FROM FileAttachment f WHERE f.task.id = :taskId ORDER BY f.createdAt DESC")
    List<FileAttachment> findByTaskId(Long taskId);
    
    // 사용자가 업로드한 모든 파일 조회
    @Query("SELECT f FROM FileAttachment f WHERE f.uploader.id = :uploaderId ORDER BY f.createdAt DESC")
    List<FileAttachment> findByUploaderId(Long uploaderId);
    
    // 파일 타입별 조회
    @Query("SELECT f FROM FileAttachment f WHERE f.fileType = :fileType ORDER BY f.createdAt DESC")
    List<FileAttachment> findByFileType(FileType fileType);
    
    // 프로젝트의 특정 타입 파일 조회
    @Query("SELECT f FROM FileAttachment f WHERE f.project.id = :projectId AND f.fileType = :fileType")
    List<FileAttachment> findByProjectIdAndFileType(Long projectId, FileType fileType);
    
    // 태스크의 특정 타입 파일 조회
    @Query("SELECT f FROM FileAttachment f WHERE f.task.id = :taskId AND f.fileType = :fileType")
    List<FileAttachment> findByTaskIdAndFileType(Long taskId, FileType fileType);
    
    // 프로젝트 파일 개수
    @Query("SELECT COUNT(f) FROM FileAttachment f WHERE f.project.id = :projectId")
    Long countByProjectId(Long projectId);
    
    // 태스크 파일 개수
    @Query("SELECT COUNT(f) FROM FileAttachment f WHERE f.task.id = :taskId")
    Long countByTaskId(Long taskId);
    
    // 프로젝트 총 파일 크기
    @Query("SELECT COALESCE(SUM(f.fileSize), 0) FROM FileAttachment f WHERE f.project.id = :projectId")
    Long sumFileSizeByProjectId(Long projectId);
    
    // 다운로드 횟수 증가
    @Modifying
    @Query("UPDATE FileAttachment f SET f.downloadCount = f.downloadCount + 1 WHERE f.id = :id")
    void incrementDownloadCount(Long id);
}
