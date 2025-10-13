package com.plm.api.config;

import com.plm.api.entity.Project;
import com.plm.api.entity.Task;
import com.plm.api.entity.ProjectStatus;
import com.plm.api.entity.TaskStatus;
import com.plm.api.entity.Priority;
import com.plm.api.repository.ProjectRepository;
import com.plm.api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // 샘플 데이터가 이미 있는지 확인
        if (projectRepository.count() == 0) {
            loadSampleData();
        }
    }
    
    private void loadSampleData() {
        // 샘플 프로젝트 1
        Project project1 = new Project("PLM 시스템 개발", "제품 생명주기 관리 시스템 개발 프로젝트", 
                                     ProjectStatus.ACTIVE, "manager1");
        project1.setStartDate(LocalDateTime.now().minusDays(30));
        project1.setEndDate(LocalDateTime.now().plusDays(60));
        project1 = projectRepository.save(project1);
        
        // 샘플 프로젝트 2
        Project project2 = new Project("모바일 앱 리뉴얼", "기존 모바일 앱의 UI/UX 개선 프로젝트", 
                                     ProjectStatus.PLANNING, "manager2");
        project2.setStartDate(LocalDateTime.now().plusDays(7));
        project2.setEndDate(LocalDateTime.now().plusDays(90));
        project2 = projectRepository.save(project2);
        
        // 샘플 프로젝트 3
        Project project3 = new Project("데이터베이스 최적화", "성능 개선을 위한 데이터베이스 최적화", 
                                     ProjectStatus.COMPLETED, "manager1");
        project3.setStartDate(LocalDateTime.now().minusDays(60));
        project3.setEndDate(LocalDateTime.now().minusDays(10));
        project3 = projectRepository.save(project3);
        
        // 프로젝트 1의 태스크들
        Task task1 = new Task("요구사항 분석", "프로젝트의 상세 요구사항을 분석하고 문서화", 
                             TaskStatus.DONE, Priority.HIGH, "developer1", project1);
        task1.setDueDate(LocalDateTime.now().minusDays(20));
        taskRepository.save(task1);
        
        Task task2 = new Task("UI/UX 설계", "사용자 인터페이스 및 사용자 경험 설계", 
                             TaskStatus.IN_PROGRESS, Priority.HIGH, "designer1", project1);
        task2.setDueDate(LocalDateTime.now().plusDays(5));
        taskRepository.save(task2);
        
        Task task3 = new Task("백엔드 API 개발", "RESTful API 개발 및 테스트", 
                             TaskStatus.TODO, Priority.MEDIUM, "developer2", project1);
        task3.setDueDate(LocalDateTime.now().plusDays(15));
        taskRepository.save(task3);
        
        Task task4 = new Task("프론트엔드 개발", "React 기반 프론트엔드 개발", 
                             TaskStatus.TODO, Priority.MEDIUM, "developer3", project1);
        task4.setDueDate(LocalDateTime.now().plusDays(25));
        taskRepository.save(task4);
        
        // 프로젝트 2의 태스크들
        Task task5 = new Task("현재 앱 분석", "기존 앱의 문제점 분석 및 개선사항 도출", 
                             TaskStatus.TODO, Priority.HIGH, "analyst1", project2);
        task5.setDueDate(LocalDateTime.now().plusDays(10));
        taskRepository.save(task5);
        
        Task task6 = new Task("디자인 시스템 구축", "일관된 디자인 시스템 구축", 
                             TaskStatus.TODO, Priority.MEDIUM, "designer2", project2);
        task6.setDueDate(LocalDateTime.now().plusDays(20));
        taskRepository.save(task6);
        
        // 프로젝트 3의 태스크들 (완료된 프로젝트)
        Task task7 = new Task("성능 분석", "데이터베이스 성능 분석 및 병목지점 파악", 
                             TaskStatus.DONE, Priority.URGENT, "dba1", project3);
        task7.setDueDate(LocalDateTime.now().minusDays(45));
        taskRepository.save(task7);
        
        Task task8 = new Task("인덱스 최적화", "쿼리 성능 개선을 위한 인덱스 최적화", 
                             TaskStatus.DONE, Priority.HIGH, "dba1", project3);
        task8.setDueDate(LocalDateTime.now().minusDays(30));
        taskRepository.save(task8);
        
        Task task9 = new Task("쿼리 튜닝", "느린 쿼리 최적화 및 성능 개선", 
                             TaskStatus.DONE, Priority.HIGH, "dba2", project3);
        task9.setDueDate(LocalDateTime.now().minusDays(20));
        taskRepository.save(task9);
        
        System.out.println("샘플 데이터 로딩 완료:");
        System.out.println("- 프로젝트 3개 생성");
        System.out.println("- 태스크 9개 생성");
    }
}