# 연구노트 관리 시스템

## 프로젝트 개요
연구원들을 위한 종합 연구노트 관리 시스템입니다. 연구 활동 기록, 시간 관리, 휴가 신청, 셀프 평가, 일정 관리 기능을 제공합니다.

## 주요 기능

### ✅ 완료된 기능
1. **사용자 인증**
   - 아이디(또는 이메일) 기반 로그인/회원가입 시스템
   - 세션 기반 인증 (7일 유효)
   - 안전한 토큰 관리
   - 비밀번호 재설정 이메일 발송 및 토큰 기반 복구

2. **연구노트 관리** ⭐ 최신 업데이트!
   - 연구노트 작성, 수정, 삭제
   - Google Drive URL 연동 (파일 링크 저장)
   - 시간순 정렬 및 조회
   - 노트별 생성/수정 시간 자동 기록
   - **태그 기능** - 콤마로 구분된 태그 추가, 클릭으로 필터링
   - **검색 기능** - 제목/내용 실시간 검색
   - **캘린더 통합** - 연구노트 작성일이 캘린더에 📝 아이콘으로 표시

3. **시간 기록 시스템**
   - 연구 시간 기록
   - 공부 시간 기록
   - 일별/주간/월간 통계
   - 활동별 시간 추적

4. **휴가 신청 시스템**
   - 휴가 신청 (시작일~종료일, 사유)
   - 신청 상태 관리 (대기/승인/거절)
   - 대기중인 신청 취소 가능
   - **관리자 승인/거절** 및 사유 기록 지원

5. **셀프 평가 시스템**
   - 일일 자가 평가 (생산성, 품질, 협업)
   - 1-5점 척도 평가
   - 메모 기능
   - 평가 이력 조회

6. **캘린더** ⭐ 최신 업데이트!
   - 월간 캘린더 뷰
   - 모든 일정 통합 표시
   - 연구/공부 시간 표시
   - 휴가 일정 표시
   - 세미나 일정 관리
   - 출장 일정 관리
   - **연구노트 작성일 표시** (📝 아이콘)
   - 이전/다음 달 이동
   - 색상별 이벤트 구분

7. **세미나 관리 (개선!)**
   - 세미나 추가, 수정, 삭제
   - 날짜, 시간, 장소 기록
   - 설명 및 상세 정보
   - **공유 세미나 기능** - 모든 사용자와 공유 가능

8. **출장 관리**
   - 출장 추가, 수정, 삭제
   - 목적지, 목적, 기간 기록
   - 상태 관리 (예정/진행중/완료/취소)

9. **통계 탭 (NEW!)**
   - 주간/월간 시간 통계
   - 이번 주 vs 지난 주 비교
   - 일별 상세 기록
   - 시각적 통계 카드

10. **관리자 기능 (NEW!)**
    - 모든 연구원 목록 조회
    - 연구원별 상세 통계
    - 연구노트별 코멘트 관리 및 답글 확인
    - 휴가 신청 승인/거절 및 사유 기록
    - 휴가/평가 현황 확인

11. **대시보드**
    - 연구노트 개수
    - 오늘의 연구/공부 시간
    - 대기중인 휴가 신청
    - 최근 평가 평균

12. **계정 복구 (NEW!)**
    - 비밀번호 재설정 링크 이메일 발송
    - 토큰 기반 새 비밀번호 설정
    - 이메일 미설정 시 개발용 리셋 링크 반환

13. **코멘트 협업 (NEW!)**
    - 관리자는 연구노트별로 코멘트를 작성하고 스레드 관리
    - 연구원과 관리자는 각 코멘트에 답글을 남겨 대화 가능
    - 노트 상세 화면과 관리자 대시보드에서 동일한 스레드 확인

## API 엔드포인트

### 인증
- `POST /api/login` - 로그인 (identifier, password)
- `POST /api/register` - 회원가입 (email, password, name, username?, recoveryEmail?)
- `POST /api/logout` - 로그아웃
- `POST /api/password-reset/request` - 비밀번호 재설정 링크 요청 (identifier)
- `POST /api/password-reset/confirm` - 재설정 토큰으로 새 비밀번호 설정 (token, newPassword)

### 연구노트
- `GET /api/notes` - 노트 목록 조회 (검색: ?search=키워드, 태그 필터: ?tag=태그명)
- `GET /api/notes/:id` - 노트 상세 조회
- `POST /api/notes` - 노트 작성 (title, content, gdrive_url, tags)
- `PUT /api/notes/:id` - 노트 수정
- `DELETE /api/notes/:id` - 노트 삭제

### 시간 기록
- `GET /api/time-records?date=YYYY-MM-DD` - 날짜별 시간 기록 조회
- `GET /api/time-records/stats?period=week|month` - 통계 조회
- `POST /api/time-records` - 시간 기록 추가 (record_type, duration_minutes, description, record_date)
- `DELETE /api/time-records/:id` - 시간 기록 삭제

### 휴가 신청
- `GET /api/vacations` - 휴가 신청 목록 조회
- `POST /api/vacations` - 휴가 신청 (start_date, end_date, reason)
- `DELETE /api/vacations/:id` - 휴가 신청 취소

### 셀프 평가
- `GET /api/evaluations` - 평가 목록 조회 (최근 30개)
- `POST /api/evaluations` - 평가 작성 (evaluation_date, productivity_score, quality_score, collaboration_score, notes)

### 세미나
- `GET /api/seminars` - 세미나 목록 조회 (개인 + 공유 세미나)
- `POST /api/seminars` - 세미나 추가 (title, description, event_date, start_time, end_time, location, is_shared)
- `PUT /api/seminars/:id` - 세미나 수정
- `DELETE /api/seminars/:id` - 세미나 삭제

### 출장
- `GET /api/business-trips` - 출장 목록 조회
- `POST /api/business-trips` - 출장 추가 (destination, purpose, start_date, end_date, status)
- `PUT /api/business-trips/:id` - 출장 수정
- `DELETE /api/business-trips/:id` - 출장 삭제

### 캘린더
- `GET /api/calendar?year=YYYY&month=MM` - 월별 통합 캘린더 데이터 조회

### 통계
- `GET /api/stats/weekly` - 주간 통계
- `GET /api/stats/monthly` - 월간 통계
- `GET /api/stats/summary` - 통계 요약 (이번 주, 지난 주, 이번 달)

### 관리자 (admin 권한 필요)
- `GET /api/admin/researchers` - 모든 연구원 목록
- `GET /api/admin/researcher/:id` - 연구원 상세 정보 (연구노트, 휴가, 평가 포함)
- `GET /api/admin/vacations?status=pending|approved|rejected|all` - 휴가 신청 관리 목록
- `POST /api/admin/vacations/:id/decision` - 휴가 신청 승인/거절 (body: { decision, reason? })

### 코멘트 (관리자 ↔ 연구원)
- `GET /api/comments` - 받은 코멘트 목록 (관리자는 `?userId=`로 대상 연구원 지정 가능)
- `GET /api/notes/:id/comments` - 특정 연구노트의 코멘트/답글 스레드
- `POST /api/comments` - 연구노트 코멘트 작성 (admin만, body: { related_id, comment_text })
- `POST /api/comments/:id/replies` - 코멘트에 답글 작성 (관리자/연구원)
- `DELETE /api/comments/:id` - 코멘트 삭제 (admin만)

### 대시보드
- `GET /api/dashboard` - 대시보드 통계

## Google Drive 연동
- 연구노트 작성 시 Google Drive 파일 링크를 저장할 수 있습니다
- Google Drive에서 파일 공유 링크를 복사하여 노트에 첨부하세요
- 노트 목록에서 링크를 클릭하면 Google Drive에서 파일을 바로 열 수 있습니다

### Google Drive 파일 업로드 방법
1. Google Drive에 연구 파일 업로드
2. 파일 우클릭 → "공유" → "링크 복사"
3. 연구노트 작성 시 "Google Drive URL" 필드에 붙여넣기

## 테스트 계정
```
# 연구원 계정
이메일: researcher1@example.com
비밀번호: password123

이메일: researcher2@example.com
비밀번호: password123

# 관리자 계정 (지도교수)
아이디: admin
이메일: admin@example.com
비밀번호: password123
이름: 박지도교수
```

## 로컬 개발 URL
- **로컬 서버**: http://localhost:3000
- **샌드박스 공개 URL**: https://3000-ixhzzne2xvhm0k5hdqdbv-3844e1b6.sandbox.novita.ai

## 데이터 아키텍처

### 데이터 모델
- **users**: 사용자 정보 (id, email, username, recovery_email, password, name, role)
- **research_notes**: 연구노트 (id, user_id, title, content, gdrive_url, created_at, updated_at)
- **time_records**: 시간 기록 (id, user_id, record_type, duration_minutes, description, record_date)
- **vacation_requests**: 휴가 신청 (id, user_id, start_date, end_date, reason, status, approved_by, approved_at, decision_reason)
- **self_evaluations**: 셀프 평가 (id, user_id, evaluation_date, scores, notes)
- **seminars**: 세미나 일정 (id, user_id, title, description, event_date, start_time, end_time, location)
- **business_trips**: 출장 일정 (id, user_id, destination, purpose, start_date, end_date, status)
- **sessions**: 세션 관리 (id, user_id, token, expires_at)
- **password_reset_tokens**: 비밀번호 재설정 토큰 (id, user_id, token, expires_at, used)
- **comment_replies**: 코멘트 답글 (id, comment_id, user_id, role, reply_text, created_at)

### 스토리지 서비스
- **Cloudflare D1**: SQLite 기반 관계형 데이터베이스
- **Google Drive**: 연구 파일 저장 (외부 서비스, URL 링크 방식)

## 환경 변수 / Secrets
- `RESEND_API_KEY`: Resend API 키 (비밀번호 재설정 이메일 발송용)
- `RESEND_FROM_EMAIL`: Resend에서 사용할 발신 주소 (예: `Research Notes <no-reply@example.com>`)
- `APP_BASE_URL`: 이메일 링크에 사용할 기본 도메인 (선택, 미설정 시 요청 도메인 사용)

Cloudflare Pages에 배포할 때는 다음 명령으로 설정하세요.
```bash
npx wrangler pages secret put RESEND_API_KEY --project-name btgday
npx wrangler pages secret put RESEND_FROM_EMAIL --project-name btgday
npx wrangler pages secret put APP_BASE_URL --project-name btgday
```
※ 이메일 발송이 설정되지 않은 경우 개발 편의를 위해 API 응답과 서버 로그에 재설정 링크가 포함됩니다.

## 사용자 가이드

### 로그인
1. 첫 화면에서 아이디 또는 이메일과 비밀번호를 입력합니다.
2. 또는 "회원가입" 버튼으로 새 계정을 생성합니다.

### 비밀번호 재설정
1. 로그인 화면에서 "비밀번호를 잊으셨나요?" 버튼을 클릭합니다.
2. 아이디 또는 이메일을 입력하고 재설정 링크를 요청합니다.
3. 이메일로 받은 링크를 클릭하거나 토큰을 복사해 새 비밀번호를 설정합니다.
4. 이메일 설정이 없는 개발 환경에서는 API 응답/콘솔에 제공된 링크를 사용할 수 있습니다.

### 연구노트 작성
1. "연구노트" 탭 클릭
2. "새 노트 작성" 버튼 클릭
3. 제목, 내용 입력
4. (선택) Google Drive 링크 추가
5. "저장" 버튼 클릭

### 시간 기록
1. "시간 기록" 탭 클릭
2. "시간 추가" 버튼 클릭
3. 활동 유형 (연구/공부) 선택
4. 시간(분), 설명, 날짜 입력
5. "저장" 버튼 클릭

### 휴가 신청
1. "휴가 신청" 탭 클릭
2. "휴가 신청" 버튼 클릭
3. 시작일, 종료일, 사유 입력
4. "신청" 버튼 클릭

### 휴가 승인 (관리자)
1. 상단 네비게이션에서 "관리자" 탭을 엽니다.
2. "대기중인 휴가 신청" 카드에서 요청 내용을 검토합니다.
3. 승인 또는 거절 버튼을 클릭합니다. (거절 시 사유를 입력할 수 있습니다.)
4. 처리 결과가 즉시 연구원 화면과 데이터베이스에 반영됩니다.

### 코멘트 관리 및 답글
- **연구원**: 연구노트 목록에서 "코멘트 보기" 버튼을 눌러 관리자 피드백과 답글을 확인하고, 필요 시 답글을 작성합니다.
- **관리자**: 연구원 상세 화면의 "연구노트 및 코멘트 관리" 섹션에서 코멘트를 작성하고 스레드를 모니터링합니다.
- 코멘트와 답글은 실시간으로 갱신되며, 모든 참여자가 같은 스레드를 확인할 수 있습니다.

### 셀프 평가
1. "셀프 평가" 탭 클릭
2. "평가 작성" 버튼 클릭
3. 생산성, 품질, 협업 점수 선택 (1-5점)
4. 메모 작성
5. "저장" 버튼 클릭

### 캘린더
1. "캘린더" 탭 클릭
2. 월간 캘린더에서 모든 일정 확인
3. 이전/다음 달 버튼으로 이동
4. "세미나 추가" 버튼으로 세미나 일정 등록
5. "출장 추가" 버튼으로 출장 일정 등록

### 세미나 추가
1. 캘린더 탭에서 "세미나 추가" 클릭
2. 제목, 설명 입력
3. 날짜, 시작/종료 시간 선택
4. 장소 입력
5. "저장" 버튼 클릭

### 출장 추가
1. 캘린더 탭에서 "출장 추가" 클릭
2. 목적지, 목적 입력
3. 시작일, 종료일 선택
4. 상태 선택 (예정/진행중/완료/취소)
5. "저장" 버튼 클릭

## 배포

### 로컬 개발
```bash
# 데이터베이스 초기화
npm run db:migrate:local
npm run db:seed

# 빌드
npm run build

# 개발 서버 시작
pm2 start ecosystem.config.cjs

# 로그 확인
pm2 logs --nostream
```

### Cloudflare Pages 배포
```bash
# Cloudflare API 키 설정 필요
# 1. D1 데이터베이스 생성
npx wrangler d1 create webapp-production

# 2. wrangler.jsonc에 database_id 업데이트

# 3. 프로덕션 마이그레이션
npm run db:migrate:prod

# 4. 배포
npm run deploy:prod
```

## 기술 스택
- **프론트엔드**: HTML, JavaScript, Tailwind CSS, Axios
- **백엔드**: Hono (Cloudflare Workers)
- **데이터베이스**: Cloudflare D1 (SQLite)
- **배포**: Cloudflare Pages
- **개발 도구**: PM2, Wrangler

## 프로젝트 구조
```
webapp/
├── src/
│   └── index.tsx              # Hono 백엔드 API
├── public/
│   └── static/
│       ├── app.js             # 프론트엔드 JavaScript
│       └── styles.css         # 커스텀 CSS
├── migrations/
│   ├── 0001_initial_schema.sql      # 초기 데이터베이스 스키마
│   └── 0002_add_calendar_events.sql # 캘린더 이벤트 추가
├── seed.sql                   # 테스트 데이터
├── ecosystem.config.cjs       # PM2 설정
├── wrangler.jsonc            # Cloudflare 설정
└── package.json              # 의존성 및 스크립트
```

## 다음 개발 단계 (선택 사항)
1. **캘린더 상세 기능**: 일정 클릭 시 상세 정보 모달, 수정/삭제 기능
2. **관리자 기능**: 휴가 신청 승인/거절 기능
3. **고급 통계**: 그래프 및 차트 추가
4. **알림 시스템**: 이메일 또는 푸시 알림
5. **파일 업로드**: Google Drive API 직접 연동
6. **검색 기능**: 연구노트 전문 검색
7. **엑스포트**: PDF 내보내기 기능
8. **주간/일간 뷰**: 캘린더에 다양한 뷰 옵션 추가

## 라이선스
MIT

## 마지막 업데이트
2026-01-31
