-- ============================================================
-- 추가 테이블 (schema_add.sql)
-- SQL Editor에서 실행
-- ============================================================


-- 12. 교회 기본 정보 (church_info)
CREATE TABLE church_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(200),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO church_info (id, name, address, phone) VALUES
(1, '해운대순복음교회', '부산광역시 해운대구 좌동순환로 388', '051-704-3391');


-- 13. 표어 (motto)
CREATE TABLE motto (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  year INTEGER NOT NULL UNIQUE,
  text VARCHAR(200) NOT NULL,
  scripture VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO motto (year, text, scripture) VALUES
(2026, '오직 나의 영으로', '슥 4:6');


-- 14. 이번 주 말씀 (weekly_word)
CREATE TABLE weekly_word (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  bulletin_date DATE NOT NULL UNIQUE,
  verse TEXT NOT NULL,
  reference VARCHAR(100),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO weekly_word (bulletin_date, verse, reference, content) VALUES
('2026-03-01',
 '요단에서 올라온 그 열두 돌을 여호수아가 길갈에 세우고 이스라엘 자손에게 말하여 이르되 후일에 너희의 자손이 그들의 아버지에게 묻기를 이 돌들은 무슨 뜻이니이까 하거든 너희 자손에게 알게 하여 이르기를 이스라엘이 마른 땅을 밟고 이 요단을 건넜음이라 하라',
 '여호수아 4:21~22',
 '하나님의 역사는 기억되어야 합니다. 이스라엘 백성이 돌을 세운 것처럼, 우리도 삶 속에서 하나님의 인도하심을 기억하고 다음 세대에 전해야 합니다. 이번 주도 나의 삶에 세워진 하나님의 증거들을 돌아보며, 그 은혜를 고백하는 한 주가 되시기 바랍니다.');


-- 15. 교회 일정 (weekly_schedule)
CREATE TABLE weekly_schedule (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  bulletin_date DATE NOT NULL,
  sort_order INTEGER NOT NULL,
  date_label VARCHAR(20) NOT NULL,
  day_of_week VARCHAR(10) NOT NULL,
  time VARCHAR(20),
  title VARCHAR(200) NOT NULL,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO weekly_schedule (bulletin_date, sort_order, date_label, day_of_week, time, title, location) VALUES
('2026-03-01', 1,  '3월 1일',  '주일',   '09:00', '주일예배 1부',         '본당'),
('2026-03-01', 2,  '3월 1일',  '주일',   '11:00', '주일예배 2부',         '본당'),
('2026-03-01', 3,  '3월 1일',  '주일',   '17:00', '오순절성령비전캠프 2기 시작', '지하층'),
('2026-03-01', 4,  '3월 2일',  '월요일', '05:00', '새벽기도회',           '은혜홀'),
('2026-03-01', 5,  '3월 4일',  '수요일', '19:00', '삼일밤예배',           '본당'),
('2026-03-01', 6,  '3월 6일',  '금요일', '20:00', '금요성령기도회',       '본당'),
('2026-03-01', 7,  '3월 8일',  '주일',   '09:00', '주일예배 1부 (일꾼헌신예배)', '본당'),
('2026-03-01', 8,  '3월 8일',  '주일',   '11:00', '주일예배 2부 (일꾼헌신예배)', '본당');
