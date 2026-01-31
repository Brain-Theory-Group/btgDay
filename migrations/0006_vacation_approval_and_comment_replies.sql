-- 휴가 승인 정보 컬럼 추가
ALTER TABLE vacation_requests ADD COLUMN approved_by INTEGER REFERENCES users(id);
ALTER TABLE vacation_requests ADD COLUMN approved_at DATETIME;
ALTER TABLE vacation_requests ADD COLUMN decision_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_vacation_requests_approved_by ON vacation_requests(approved_by);
CREATE INDEX IF NOT EXISTS idx_vacation_requests_status ON vacation_requests(status);

-- 코멘트 답글 테이블: 연구원/관리자 모두 참여 가능
CREATE TABLE IF NOT EXISTS comment_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'researcher' CHECK(role IN ('researcher', 'admin')),
  reply_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_comment_replies_comment_id ON comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_replies_user_id ON comment_replies(user_id);
