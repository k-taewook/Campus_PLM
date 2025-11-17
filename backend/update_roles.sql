-- 기존 사용자들의 role을 새로운 값으로 업데이트
-- MANAGER -> LEADER로 변경
UPDATE users SET role = 'LEADER' WHERE role = 'MANAGER';

-- DEVELOPER, DESIGNER, TESTER, VIEWER -> MEMBER로 변경  
UPDATE users SET role = 'MEMBER' WHERE role IN ('DEVELOPER', 'DESIGNER', 'TESTER', 'VIEWER');

-- 확인
SELECT id, username, email, role FROM users;
