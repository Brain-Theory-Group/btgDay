-- 코멘트 테이블 (관리자가 연구원에게 남기는 코멘트)
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL, -- 코멘트를 받는 사용자
  admin_id INTEGER NOT NULL, -- 코멘트를 작성한 관리자
  comment_text TEXT NOT NULL,
  related_type TEXT, -- 'note', 'evaluation', 'time_record' 등
  related_id INTEGER, -- 관련된 항목의 ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- 세미나에 공유 기능 추가
ALTER TABLE seminars ADD COLUMN is_shared INTEGER DEFAULT 0; -- 0: 개인, 1: 공유

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_admin_id ON comments(admin_id);
CREATE INDEX IF NOT EXISTS idx_seminars_shared ON seminars(is_shared);
