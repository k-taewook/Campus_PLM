# PLM MySQL 데이터베이스 초기 설정 스크립트
# 
# 사용법:
# 1. MySQL에 root로 로그인: mysql -u root -p
# 2. 이 스크립트 실행: source database-setup.sql
# 
# 또는 명령어로 직접 실행:
# mysql -u root -p < database-setup.sql

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS plmdb_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS plmdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- PLM 사용자 생성 및 권한 부여
CREATE USER IF NOT EXISTS 'plm_user'@'localhost' IDENTIFIED BY 'plm_password';
CREATE USER IF NOT EXISTS 'plm_user'@'%' IDENTIFIED BY 'plm_password';

-- 개발 데이터베이스 권한
GRANT ALL PRIVILEGES ON plmdb_dev.* TO 'plm_user'@'localhost';
GRANT ALL PRIVILEGES ON plmdb_dev.* TO 'plm_user'@'%';

-- 운영 데이터베이스 권한
GRANT ALL PRIVILEGES ON plmdb.* TO 'plm_user'@'localhost';
GRANT ALL PRIVILEGES ON plmdb.* TO 'plm_user'@'%';

-- 권한 적용
FLUSH PRIVILEGES;

-- 생성 확인
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'plm_user';

PRINT '데이터베이스 및 사용자 생성 완료!';
PRINT '개발 DB: plmdb_dev';
PRINT '운영 DB: plmdb';
PRINT '사용자: plm_user';
PRINT '비밀번호: plm_password';