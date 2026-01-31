-- 세미나 테이블
CREATE TABLE IF NOT EXISTS seminars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 출장 테이블
CREATE TABLE IF NOT EXISTS business_trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  destination TEXT NOT NULL,
  purpose TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'planned', -- planned, ongoing, completed, cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_seminars_user_id ON seminars(user_id);
CREATE INDEX IF NOT EXISTS idx_seminars_date ON seminars(event_date);
CREATE INDEX IF NOT EXISTS idx_business_trips_user_id ON business_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_business_trips_dates ON business_trips(start_date, end_date);
