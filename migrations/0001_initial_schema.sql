-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'researcher', -- researcher, admin
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 연구노트 테이블
CREATE TABLE IF NOT EXISTS research_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  gdrive_url TEXT, -- Google Drive URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 시간 기록 테이블 (연구/공부 시간)
CREATE TABLE IF NOT EXISTS time_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  record_type TEXT NOT NULL, -- research, study
  duration_minutes INTEGER NOT NULL,
  description TEXT,
  record_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 휴가 신청 테이블
CREATE TABLE IF NOT EXISTS vacation_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 셀프 평가 테이블
CREATE TABLE IF NOT EXISTS self_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  evaluation_date DATE NOT NULL,
  productivity_score INTEGER CHECK(productivity_score >= 1 AND productivity_score <= 5),
  quality_score INTEGER CHECK(quality_score >= 1 AND quality_score <= 5),
  collaboration_score INTEGER CHECK(collaboration_score >= 1 AND collaboration_score <= 5),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 세션 테이블 (간단한 세션 관리)
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_research_notes_user_id ON research_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_time_records_user_id ON time_records(user_id);
CREATE INDEX IF NOT EXISTS idx_time_records_date ON time_records(record_date);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_user_id ON vacation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_self_evaluations_user_id ON self_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
