package com.plm.api.common.config;

import com.plm.api.project.entity.Project;
import com.plm.api.project.entity.ProjectMember;
import com.plm.api.project.entity.ProjectStatus;
import com.plm.api.project.repository.ProjectRepository;
import com.plm.api.project.repository.ProjectMemberRepository;
import com.plm.api.task.entity.Task;
import com.plm.api.task.entity.TaskStatus;
import com.plm.api.task.entity.Priority;
import com.plm.api.task.repository.TaskRepository;
import com.plm.api.team.entity.Team;
import com.plm.api.team.entity.TeamMember;
import com.plm.api.team.entity.TeamMemberRole;
import com.plm.api.team.repository.TeamRepository;
import com.plm.api.team.repository.TeamMemberRepository;
import com.plm.api.user.entity.User;
import com.plm.api.user.entity.UserRole;
import com.plm.api.user.entity.UserStatus;
import com.plm.api.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TeamRepository teamRepository;
    
    @Autowired
    private TeamMemberRepository teamMemberRepository;
    
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    @Override
    public void run(String... args) throws Exception {
        // 샘플 사용자 생성
        loadSampleUsers();
        
        // 샘플 데이터가 이미 있는지 확인
        if (projectRepository.count() == 0) {
            loadSampleData();
        }
    }
    
    private void loadSampleUsers() {
        // 관리자 계정 (ADMIN)
        createUserIfNotExists("admin@plm.com", "admin", "admin1234", "시스템 관리자", UserRole.ADMIN);
        
        // 리더 계정들 (LEADER)
        createUserIfNotExists("leader1@plm.com", "leader1", "leader1234", "김리더", UserRole.LEADER);
        createUserIfNotExists("leader2@plm.com", "leader2", "leader1234", "이리더", UserRole.LEADER);
        
        // 멤버 계정들 (MEMBER)
        createUserIfNotExists("member1@plm.com", "member1", "member1234", "박멤버", UserRole.MEMBER);
        createUserIfNotExists("member2@plm.com", "member2", "member1234", "최멤버", UserRole.MEMBER);
        createUserIfNotExists("member3@plm.com", "member3", "member1234", "정멤버", UserRole.MEMBER);
        createUserIfNotExists("member4@plm.com", "member4", "member1234", "강멤버", UserRole.MEMBER);
        createUserIfNotExists("member5@plm.com", "member5", "member1234", "윤멤버", UserRole.MEMBER);
        
        System.out.println("\n===========================================");
        System.out.println("테스트 계정 정보");
        System.out.println("===========================================");
        System.out.println("관리자 계정:");
        System.out.println("  Email: admin@plm.com");
        System.out.println("  Password: admin1234");
        System.out.println();
        System.out.println("리더 계정:");
        System.out.println("  Email: leader1@plm.com");
        System.out.println("  Password: leader1234");
        System.out.println();
        System.out.println("멤버 계정:");
        System.out.println("  Email: member1@plm.com");
        System.out.println("  Password: member1234");
        System.out.println("===========================================\n");
    }
    
    private void createUserIfNotExists(String email, String username, String password, String fullName, UserRole role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setFullName(fullName);
            user.setRole(role);
            user.setStatus(UserStatus.ACTIVE);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(user);
        }
    }
    
    private void loadSampleData() {
        // 사용자 조회 (ID로 접근하기 위해)
        User admin = userRepository.findByEmail("admin@plm.com").orElse(null);
        User leader1 = userRepository.findByEmail("leader1@plm.com").orElse(null);
        User leader2 = userRepository.findByEmail("leader2@plm.com").orElse(null);
        User member1 = userRepository.findByEmail("member1@plm.com").orElse(null);
        User member2 = userRepository.findByEmail("member2@plm.com").orElse(null);
        User member3 = userRepository.findByEmail("member3@plm.com").orElse(null);
        User member4 = userRepository.findByEmail("member4@plm.com").orElse(null);
        User member5 = userRepository.findByEmail("member5@plm.com").orElse(null);
        
        // ========== 팀 생성 ==========
        // 팀 1: 백엔드 개발팀
        Team team1 = new Team();
        team1.setName("백엔드 개발팀");
        team1.setDescription("백엔드 API 및 서버 개발을 담당하는 팀");
        team1.setCreatedAt(LocalDateTime.now());
        team1.setUpdatedAt(LocalDateTime.now());
        team1 = teamRepository.save(team1);
        
        // 팀1 멤버 추가
        if (leader1 != null) {
            TeamMember tm1 = new TeamMember();
            tm1.setTeam(team1);
            tm1.setUser(leader1);
            tm1.setRole(TeamMemberRole.ADMIN);
            tm1.setJoinedAt(LocalDateTime.now());
            teamMemberRepository.save(tm1);
        }
        
        if (member1 != null) {
            TeamMember tm2 = new TeamMember();
            tm2.setTeam(team1);
            tm2.setUser(member1);
            tm2.setRole(TeamMemberRole.MEMBER);
            tm2.setJoinedAt(LocalDateTime.now());
            teamMemberRepository.save(tm2);
        }
        
        if (member2 != null) {
            TeamMember tm3 = new TeamMember();
            tm3.setTeam(team1);
            tm3.setUser(member2);
            tm3.setRole(TeamMemberRole.MEMBER);
            tm3.setJoinedAt(LocalDateTime.now());
            teamMemberRepository.save(tm3);
        }
        
        // 팀 2: 프론트엔드 개발팀
        Team team2 = new Team();
        team2.setName("프론트엔드 개발팀");
        team2.setDescription("React 기반 프론트엔드 개발 팀");
        team2.setCreatedAt(LocalDateTime.now());
        team2.setUpdatedAt(LocalDateTime.now());
        team2 = teamRepository.save(team2);
        
        // 팀2 멤버 추가
        if (leader2 != null) {
            TeamMember tm4 = new TeamMember();
            tm4.setTeam(team2);
            tm4.setUser(leader2);
            tm4.setRole(TeamMemberRole.ADMIN);
            tm4.setJoinedAt(LocalDateTime.now());
            teamMemberRepository.save(tm4);
        }
        
        if (member3 != null) {
            TeamMember tm5 = new TeamMember();
            tm5.setTeam(team2);
            tm5.setUser(member3);
            tm5.setRole(TeamMemberRole.MEMBER);
            tm5.setJoinedAt(LocalDateTime.now());
            teamMemberRepository.save(tm5);
        }
        
        if (member4 != null) {
            TeamMember tm6 = new TeamMember();
            tm6.setTeam(team2);
            tm6.setUser(member4);
            tm6.setRole(TeamMemberRole.MEMBER);
            tm6.setJoinedAt(LocalDateTime.now());
            teamMemberRepository.save(tm6);
        }
        
        // ========== 프로젝트 생성 ==========
        // 샘플 프로젝트 1: PLM 시스템 개발
        Project project1 = new Project("PLM 시스템 개발", "제품 생명주기 관리 시스템 개발 프로젝트", 
                                     ProjectStatus.ACTIVE, leader1 != null ? leader1.getId().toString() : "1");
        project1.setStartDate(LocalDateTime.now().minusDays(30));
        project1.setEndDate(LocalDateTime.now().plusDays(60));
        project1 = projectRepository.save(project1);
        
        // 프로젝트 1 멤버 추가
        if (leader1 != null) {
            ProjectMember pm1 = new ProjectMember();
            pm1.setProject(project1);
            pm1.setUser(leader1);
            pm1.setJoinedAt(LocalDateTime.now());
            projectMemberRepository.save(pm1);
        }
        
        if (member1 != null) {
            ProjectMember pm2 = new ProjectMember();
            pm2.setProject(project1);
            pm2.setUser(member1);
            pm2.setJoinedAt(LocalDateTime.now());
            projectMemberRepository.save(pm2);
        }
        
        if (member2 != null) {
            ProjectMember pm3 = new ProjectMember();
            pm3.setProject(project1);
            pm3.setUser(member2);
            pm3.setJoinedAt(LocalDateTime.now());
            projectMemberRepository.save(pm3);
        }
        
        if (member3 != null) {
            ProjectMember pm4 = new ProjectMember();
            pm4.setProject(project1);
            pm4.setUser(member3);
            pm4.setJoinedAt(LocalDateTime.now());
            projectMemberRepository.save(pm4);
        }
        
        // 샘플 프로젝트 2: 모바일 앱 리뉴얼
        Project project2 = new Project("모바일 앱 리뉴얼", "기존 모바일 앱의 UI/UX 개선 프로젝트", 
                                     ProjectStatus.PLANNING, leader2 != null ? leader2.getId().toString() : "2");
        project2.setStartDate(LocalDateTime.now().plusDays(7));
        project2.setEndDate(LocalDateTime.now().plusDays(90));
        project2 = projectRepository.save(project2);
        
        // 프로젝트 2 멤버 추가
        if (leader2 != null) {
            ProjectMember pm5 = new ProjectMember();
            pm5.setProject(project2);
            pm5.setUser(leader2);
            pm5.setJoinedAt(LocalDateTime.now());
            projectMemberRepository.save(pm5);
        }
        
        if (member3 != null) {
            ProjectMember pm6 = new ProjectMember();
            pm6.setProject(project2);
            pm6.setUser(member3);
            pm6.setJoinedAt(LocalDateTime.now());
            projectMemberRepository.save(pm6);
        }
        
        if (member4 != null) {
            ProjectMember pm7 = new ProjectMember();
            pm7.setProject(project2);
            pm7.setUser(member4);
            pm7.setJoinedAt(LocalDateTime.now());
            projectMemberRepository.save(pm7);
        }
        
        // 샘플 프로젝트 3: 데이터베이스 최적화
        Project project3 = new Project("데이터베이스 최적화", "성능 개선을 위한 데이터베이스 최적화", 
                                     ProjectStatus.COMPLETED, leader1 != null ? leader1.getId().toString() : "1");
        project3.setStartDate(LocalDateTime.now().minusDays(60));
        project3.setEndDate(LocalDateTime.now().minusDays(10));
        project3 = projectRepository.save(project3);
        
        // 프로젝트 3 멤버 추가
        if (leader1 != null) {
            ProjectMember pm8 = new ProjectMember();
            pm8.setProject(project3);
            pm8.setUser(leader1);
            pm8.setJoinedAt(LocalDateTime.now().minusDays(60));
            projectMemberRepository.save(pm8);
        }
        
        if (member5 != null) {
            ProjectMember pm9 = new ProjectMember();
            pm9.setProject(project3);
            pm9.setUser(member5);
            pm9.setJoinedAt(LocalDateTime.now().minusDays(60));
            projectMemberRepository.save(pm9);
        }
        
        // ========== 태스크 생성 ==========
        // 프로젝트 1의 태스크들
        Task task1 = new Task("요구사항 분석", "프로젝트의 상세 요구사항을 분석하고 문서화", 
                             TaskStatus.DONE, Priority.HIGH, member1 != null ? member1.getId().toString() : "1", project1);
        task1.setStartDate(LocalDateTime.now().minusDays(30));
        task1.setDueDate(LocalDateTime.now().minusDays(20));
        taskRepository.save(task1);
        
        Task task2 = new Task("UI/UX 설계", "사용자 인터페이스 및 사용자 경험 설계", 
                             TaskStatus.IN_PROGRESS, Priority.HIGH, member3 != null ? member3.getId().toString() : "3", project1);
        task2.setStartDate(LocalDateTime.now().minusDays(10));
        task2.setDueDate(LocalDateTime.now().plusDays(5));
        taskRepository.save(task2);
        
        Task task3 = new Task("백엔드 API 개발", "RESTful API 개발 및 테스트", 
                             TaskStatus.TODO, Priority.MEDIUM, member2 != null ? member2.getId().toString() : "2", project1);
        task3.setStartDate(LocalDateTime.now().plusDays(5));
        task3.setDueDate(LocalDateTime.now().plusDays(15));
        taskRepository.save(task3);
        
        Task task4 = new Task("프론트엔드 개발", "React 기반 프론트엔드 개발", 
                             TaskStatus.TODO, Priority.MEDIUM, member3 != null ? member3.getId().toString() : "3", project1);
        task4.setStartDate(LocalDateTime.now().plusDays(10));
        task4.setDueDate(LocalDateTime.now().plusDays(25));
        taskRepository.save(task4);
        
        // 프로젝트 2의 태스크들
        Task task5 = new Task("현재 앱 분석", "기존 앱의 문제점 분석 및 개선사항 도출", 
                             TaskStatus.TODO, Priority.HIGH, member3 != null ? member3.getId().toString() : "3", project2);
        task5.setStartDate(LocalDateTime.now().plusDays(7));
        task5.setDueDate(LocalDateTime.now().plusDays(10));
        taskRepository.save(task5);
        
        Task task6 = new Task("디자인 시스템 구축", "일관된 디자인 시스템 구축", 
                             TaskStatus.TODO, Priority.MEDIUM, member4 != null ? member4.getId().toString() : "4", project2);
        task6.setStartDate(LocalDateTime.now().plusDays(11));
        task6.setDueDate(LocalDateTime.now().plusDays(20));
        taskRepository.save(task6);
        
        // 프로젝트 3의 태스크들 (완료된 프로젝트)
        Task task7 = new Task("성능 분석", "데이터베이스 성능 분석 및 병목지점 파악", 
                             TaskStatus.DONE, Priority.URGENT, member5 != null ? member5.getId().toString() : "5", project3);
        task7.setStartDate(LocalDateTime.now().minusDays(60));
        task7.setDueDate(LocalDateTime.now().minusDays(45));
        taskRepository.save(task7);
        
        Task task8 = new Task("인덱스 최적화", "쿼리 성능 개선을 위한 인덱스 최적화", 
                             TaskStatus.DONE, Priority.HIGH, member5 != null ? member5.getId().toString() : "5", project3);
        task8.setStartDate(LocalDateTime.now().minusDays(45));
        task8.setDueDate(LocalDateTime.now().minusDays(30));
        taskRepository.save(task8);
        
        Task task9 = new Task("쿼리 튜닝", "느린 쿼리 최적화 및 성능 개선", 
                             TaskStatus.DONE, Priority.HIGH, member5 != null ? member5.getId().toString() : "5", project3);
        task9.setStartDate(LocalDateTime.now().minusDays(35));
        task9.setDueDate(LocalDateTime.now().minusDays(20));
        taskRepository.save(task9);
        
        System.out.println("샘플 데이터 로딩 완료:");
        System.out.println("  - 2개 팀 (백엔드 개발팀, 프론트엔드 개발팀)");
        System.out.println("  - 3개 프로젝트 (각각 리더 및 팀원 포함)");
        System.out.println("  - 9개 태스크 (각 프로젝트별 담당자 할당)");
    }
}
