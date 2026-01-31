-- 테스트 사용자 생성 (비밀번호: password123)
INSERT OR IGNORE INTO users (email, name, password, role) VALUES 
  ('researcher1@example.com', '김연구', 'password123', 'researcher'),
  ('researcher2@example.com', '이과학', 'password123', 'researcher'),
  ('admin@example.com', '관리자', 'password123', 'admin');

-- 샘플 연구노트
INSERT OR IGNORE INTO research_notes (user_id, title, content) VALUES 
  (1, '실험 1 - 초기 데이터 수집', '오늘 첫 번째 실험을 진행했습니다. 데이터 수집이 원활하게 진행되었습니다.'),
  (1, '실험 2 - 분석 결과', '데이터 분석 결과 예상과 일치하는 패턴을 발견했습니다.'),
  (2, '문헌 조사', '관련 논문 5편을 읽고 정리했습니다.');

-- 샘플 시간 기록
INSERT OR IGNORE INTO time_records (user_id, record_type, duration_minutes, description, record_date) VALUES 
  (1, 'research', 240, '실험 진행 및 데이터 분석', date('now')),
  (1, 'study', 120, '머신러닝 논문 리뷰', date('now')),
  (2, 'research', 180, '문헌 조사', date('now'));

-- 샘플 휴가 신청
INSERT OR IGNORE INTO vacation_requests (user_id, start_date, end_date, reason, status) VALUES 
  (1, date('now', '+7 days'), date('now', '+9 days'), '개인 사유', 'pending');

-- 샘플 셀프 평가
INSERT OR IGNORE INTO self_evaluations (user_id, evaluation_date, productivity_score, quality_score, collaboration_score, notes) VALUES 
  (1, date('now'), 4, 5, 4, '오늘은 생산적인 하루였습니다. 실험이 잘 진행되었습니다.');
