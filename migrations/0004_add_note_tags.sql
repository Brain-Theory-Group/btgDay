-- 연구노트에 태그 기능 추가
ALTER TABLE research_notes ADD COLUMN tags TEXT; -- 쉼표로 구분된 태그 문자열

-- 태그 검색을 위한 인덱스는 SQLite에서 전문 검색 인덱스로 대체 불가능하므로 생략
-- 대신 LIKE 쿼리를 사용하여 검색
