import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors())

// 정적 파일 제공
app.use('/static/*', serveStatic({ root: './public' }))

// ==================== 인증 API ====================

// 로그인
app.post('/api/login', async (c) => {
  const { email, password } = await c.req.json()
  
  const user = await c.env.DB.prepare(
    'SELECT id, email, name, role FROM users WHERE email = ? AND password = ?'
  ).bind(email, password).first()
  
  if (!user) {
    return c.json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' }, 401)
  }
  
  // 세션 토큰 생성
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일
  
  await c.env.DB.prepare(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)'
  ).bind(user.id, token, expiresAt.toISOString()).run()
  
  return c.json({ 
    token, 
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  })
})

// 회원가입
app.post('/api/register', async (c) => {
  const { email, password, name } = await c.req.json()
  
  try {
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
    ).bind(email, password, name).run()
    
    return c.json({ 
      success: true, 
      userId: result.meta.last_row_id 
    })
  } catch (error) {
    return c.json({ error: '이미 존재하는 이메일입니다.' }, 400)
  }
})

// 로그아웃
app.post('/api/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (token) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
  }
  
  return c.json({ success: true })
})

// 인증 미들웨어
const authMiddleware = async (c: any, next: any) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return c.json({ error: '인증이 필요합니다.' }, 401)
  }
  
  const session = await c.env.DB.prepare(
    'SELECT user_id, expires_at FROM sessions WHERE token = ?'
  ).bind(token).first()
  
  if (!session || new Date(session.expires_at as string) < new Date()) {
    return c.json({ error: '세션이 만료되었습니다.' }, 401)
  }
  
  c.set('userId', session.user_id)
  await next()
}

// ==================== 연구노트 API ====================

// 연구노트 목록 조회
app.get('/api/notes', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  const notes = await c.env.DB.prepare(
    `SELECT id, title, content, gdrive_url, created_at, updated_at 
     FROM research_notes 
     WHERE user_id = ? 
     ORDER BY created_at DESC`
  ).bind(userId).all()
  
  return c.json(notes.results)
})

// 연구노트 단일 조회
app.get('/api/notes/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.param('id')
  
  const note = await c.env.DB.prepare(
    'SELECT * FROM research_notes WHERE id = ? AND user_id = ?'
  ).bind(noteId, userId).first()
  
  if (!note) {
    return c.json({ error: '노트를 찾을 수 없습니다.' }, 404)
  }
  
  return c.json(note)
})

// 연구노트 작성
app.post('/api/notes', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const { title, content, gdrive_url } = await c.req.json()
  
  const result = await c.env.DB.prepare(
    'INSERT INTO research_notes (user_id, title, content, gdrive_url) VALUES (?, ?, ?, ?)'
  ).bind(userId, title, content, gdrive_url || null).run()
  
  return c.json({ 
    success: true, 
    id: result.meta.last_row_id 
  })
})

// 연구노트 수정
app.put('/api/notes/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.param('id')
  const { title, content, gdrive_url } = await c.req.json()
  
  await c.env.DB.prepare(
    `UPDATE research_notes 
     SET title = ?, content = ?, gdrive_url = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).bind(title, content, gdrive_url || null, noteId, userId).run()
  
  return c.json({ success: true })
})

// 연구노트 삭제
app.delete('/api/notes/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const noteId = c.req.param('id')
  
  await c.env.DB.prepare(
    'DELETE FROM research_notes WHERE id = ? AND user_id = ?'
  ).bind(noteId, userId).run()
  
  return c.json({ success: true })
})

// ==================== 시간 기록 API ====================

// 시간 기록 조회 (날짜별)
app.get('/api/time-records', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]
  
  const records = await c.env.DB.prepare(
    `SELECT * FROM time_records 
     WHERE user_id = ? AND record_date = ? 
     ORDER BY created_at DESC`
  ).bind(userId, date).all()
  
  return c.json(records.results)
})

// 시간 기록 통계 (주간/월간)
app.get('/api/time-records/stats', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const period = c.req.query('period') || 'week' // week, month
  
  let dateFilter = ''
  if (period === 'week') {
    dateFilter = "date('now', '-7 days')"
  } else {
    dateFilter = "date('now', '-30 days')"
  }
  
  const stats = await c.env.DB.prepare(
    `SELECT 
       record_type,
       SUM(duration_minutes) as total_minutes,
       COUNT(*) as count
     FROM time_records 
     WHERE user_id = ? AND record_date >= ${dateFilter}
     GROUP BY record_type`
  ).bind(userId).all()
  
  return c.json(stats.results)
})

// 시간 기록 추가
app.post('/api/time-records', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const { record_type, duration_minutes, description, record_date } = await c.req.json()
  
  const result = await c.env.DB.prepare(
    `INSERT INTO time_records (user_id, record_type, duration_minutes, description, record_date) 
     VALUES (?, ?, ?, ?, ?)`
  ).bind(userId, record_type, duration_minutes, description, record_date).run()
  
  return c.json({ 
    success: true, 
    id: result.meta.last_row_id 
  })
})

// 시간 기록 삭제
app.delete('/api/time-records/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const recordId = c.req.param('id')
  
  await c.env.DB.prepare(
    'DELETE FROM time_records WHERE id = ? AND user_id = ?'
  ).bind(recordId, userId).run()
  
  return c.json({ success: true })
})

// ==================== 휴가 신청 API ====================

// 휴가 신청 목록 조회
app.get('/api/vacations', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  const vacations = await c.env.DB.prepare(
    `SELECT * FROM vacation_requests 
     WHERE user_id = ? 
     ORDER BY created_at DESC`
  ).bind(userId).all()
  
  return c.json(vacations.results)
})

// 휴가 신청
app.post('/api/vacations', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const { start_date, end_date, reason } = await c.req.json()
  
  const result = await c.env.DB.prepare(
    `INSERT INTO vacation_requests (user_id, start_date, end_date, reason) 
     VALUES (?, ?, ?, ?)`
  ).bind(userId, start_date, end_date, reason).run()
  
  return c.json({ 
    success: true, 
    id: result.meta.last_row_id 
  })
})

// 휴가 신청 취소
app.delete('/api/vacations/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const vacationId = c.req.param('id')
  
  await c.env.DB.prepare(
    'DELETE FROM vacation_requests WHERE id = ? AND user_id = ? AND status = "pending"'
  ).bind(vacationId, userId).run()
  
  return c.json({ success: true })
})

// ==================== 셀프 평가 API ====================

// 셀프 평가 목록 조회
app.get('/api/evaluations', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  const evaluations = await c.env.DB.prepare(
    `SELECT * FROM self_evaluations 
     WHERE user_id = ? 
     ORDER BY evaluation_date DESC 
     LIMIT 30`
  ).bind(userId).all()
  
  return c.json(evaluations.results)
})

// 셀프 평가 추가
app.post('/api/evaluations', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const { evaluation_date, productivity_score, quality_score, collaboration_score, notes } = await c.req.json()
  
  const result = await c.env.DB.prepare(
    `INSERT INTO self_evaluations 
     (user_id, evaluation_date, productivity_score, quality_score, collaboration_score, notes) 
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(userId, evaluation_date, productivity_score, quality_score, collaboration_score, notes).run()
  
  return c.json({ 
    success: true, 
    id: result.meta.last_row_id 
  })
})

// ==================== 세미나 API ====================

// 세미나 목록 조회 (개인 + 공유 세미나)
app.get('/api/seminars', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  const seminars = await c.env.DB.prepare(
    `SELECT s.*, u.name as creator_name FROM seminars s
     LEFT JOIN users u ON s.user_id = u.id
     WHERE s.user_id = ? OR s.is_shared = 1
     ORDER BY s.event_date DESC, s.start_time DESC`
  ).bind(userId).all()
  
  return c.json(seminars.results)
})

// 세미나 추가
app.post('/api/seminars', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const { title, description, event_date, start_time, end_time, location, is_shared } = await c.req.json()
  
  const result = await c.env.DB.prepare(
    `INSERT INTO seminars (user_id, title, description, event_date, start_time, end_time, location, is_shared) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(userId, title, description, event_date, start_time, end_time, location, is_shared ? 1 : 0).run()
  
  return c.json({ 
    success: true, 
    id: result.meta.last_row_id 
  })
})

// 세미나 수정
app.put('/api/seminars/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const seminarId = c.req.param('id')
  const { title, description, event_date, start_time, end_time, location, is_shared } = await c.req.json()
  
  await c.env.DB.prepare(
    `UPDATE seminars 
     SET title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, location = ?, is_shared = ?
     WHERE id = ? AND user_id = ?`
  ).bind(title, description, event_date, start_time, end_time, location, is_shared ? 1 : 0, seminarId, userId).run()
  
  return c.json({ success: true })
})

// 세미나 삭제
app.delete('/api/seminars/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const seminarId = c.req.param('id')
  
  await c.env.DB.prepare(
    'DELETE FROM seminars WHERE id = ? AND user_id = ?'
  ).bind(seminarId, userId).run()
  
  return c.json({ success: true })
})

// ==================== 출장 API ====================

// 출장 목록 조회
app.get('/api/business-trips', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  const trips = await c.env.DB.prepare(
    `SELECT * FROM business_trips 
     WHERE user_id = ? 
     ORDER BY start_date DESC`
  ).bind(userId).all()
  
  return c.json(trips.results)
})

// 출장 추가
app.post('/api/business-trips', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const { destination, purpose, start_date, end_date, status } = await c.req.json()
  
  const result = await c.env.DB.prepare(
    `INSERT INTO business_trips (user_id, destination, purpose, start_date, end_date, status) 
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(userId, destination, purpose, start_date, end_date, status || 'planned').run()
  
  return c.json({ 
    success: true, 
    id: result.meta.last_row_id 
  })
})

// 출장 수정
app.put('/api/business-trips/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const tripId = c.req.param('id')
  const { destination, purpose, start_date, end_date, status } = await c.req.json()
  
  await c.env.DB.prepare(
    `UPDATE business_trips 
     SET destination = ?, purpose = ?, start_date = ?, end_date = ?, status = ?
     WHERE id = ? AND user_id = ?`
  ).bind(destination, purpose, start_date, end_date, status, tripId, userId).run()
  
  return c.json({ success: true })
})

// 출장 삭제
app.delete('/api/business-trips/:id', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const tripId = c.req.param('id')
  
  await c.env.DB.prepare(
    'DELETE FROM business_trips WHERE id = ? AND user_id = ?'
  ).bind(tripId, userId).run()
  
  return c.json({ success: true })
})

// ==================== 캘린더 API ====================

// 월별 캘린더 이벤트 조회
app.get('/api/calendar', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const year = c.req.query('year') || new Date().getFullYear().toString()
  const month = c.req.query('month') || (new Date().getMonth() + 1).toString().padStart(2, '0')
  
  const startDate = `${year}-${month}-01`
  const endDate = `${year}-${month}-31`
  
  // 시간 기록 (연구/공부)
  const timeRecords = await c.env.DB.prepare(
    `SELECT 'time_record' as type, record_type as subtype, record_date as date, 
            duration_minutes, description as title
     FROM time_records 
     WHERE user_id = ? AND record_date >= ? AND record_date <= ?`
  ).bind(userId, startDate, endDate).all()
  
  // 휴가
  const vacations = await c.env.DB.prepare(
    `SELECT 'vacation' as type, status as subtype, start_date as date, end_date,
            reason as title
     FROM vacation_requests 
     WHERE user_id = ? AND start_date <= ? AND end_date >= ?`
  ).bind(userId, endDate, startDate).all()
  
  // 세미나 (개인 + 공유)
  const seminars = await c.env.DB.prepare(
    `SELECT 'seminar' as type, 'seminar' as subtype, event_date as date,
            title, start_time, end_time, location, description
     FROM seminars 
     WHERE (user_id = ? OR is_shared = 1) AND event_date >= ? AND event_date <= ?`
  ).bind(userId, startDate, endDate).all()
  
  // 출장
  const trips = await c.env.DB.prepare(
    `SELECT 'business_trip' as type, status as subtype, start_date as date, end_date,
            destination as title, purpose as description
     FROM business_trips 
     WHERE user_id = ? AND start_date <= ? AND end_date >= ?`
  ).bind(userId, endDate, startDate).all()
  
  return c.json({
    time_records: timeRecords.results,
    vacations: vacations.results,
    seminars: seminars.results,
    business_trips: trips.results
  })
})

// ==================== 코멘트 API ====================

// 코멘트 목록 조회 (연구원이 받은 코멘트)
app.get('/api/comments', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  const comments = await c.env.DB.prepare(
    `SELECT c.*, u.name as admin_name 
     FROM comments c
     LEFT JOIN users u ON c.admin_id = u.id
     WHERE c.user_id = ? 
     ORDER BY c.created_at DESC`
  ).bind(userId).all()
  
  return c.json(comments.results)
})

// 코멘트 추가 (관리자만 가능)
app.post('/api/comments', authMiddleware, async (c) => {
  const adminId = c.get('userId')
  const { user_id, comment_text, related_type, related_id } = await c.req.json()
  
  // 관리자 권한 확인
  const admin = await c.env.DB.prepare(
    'SELECT role FROM users WHERE id = ?'
  ).bind(adminId).first()
  
  if (admin?.role !== 'admin') {
    return c.json({ error: '관리자만 코멘트를 작성할 수 있습니다.' }, 403)
  }
  
  const result = await c.env.DB.prepare(
    `INSERT INTO comments (user_id, admin_id, comment_text, related_type, related_id) 
     VALUES (?, ?, ?, ?, ?)`
  ).bind(user_id, adminId, comment_text, related_type || null, related_id || null).run()
  
  return c.json({ 
    success: true, 
    id: result.meta.last_row_id 
  })
})

// 코멘트 삭제 (관리자만 가능)
app.delete('/api/comments/:id', authMiddleware, async (c) => {
  const adminId = c.get('userId')
  const commentId = c.req.param('id')
  
  // 관리자 권한 확인
  const admin = await c.env.DB.prepare(
    'SELECT role FROM users WHERE id = ?'
  ).bind(adminId).first()
  
  if (admin?.role !== 'admin') {
    return c.json({ error: '관리자만 코멘트를 삭제할 수 있습니다.' }, 403)
  }
  
  await c.env.DB.prepare(
    'DELETE FROM comments WHERE id = ? AND admin_id = ?'
  ).bind(commentId, adminId).run()
  
  return c.json({ success: true })
})

// ==================== 관리자 API ====================

// 관리자 대시보드 - 모든 연구원 목록
app.get('/api/admin/researchers', authMiddleware, async (c) => {
  const adminId = c.get('userId')
  
  // 관리자 권한 확인
  const admin = await c.env.DB.prepare(
    'SELECT role FROM users WHERE id = ?'
  ).bind(adminId).first()
  
  if (admin?.role !== 'admin') {
    return c.json({ error: '관리자 권한이 필요합니다.' }, 403)
  }
  
  const researchers = await c.env.DB.prepare(
    `SELECT id, email, name, created_at FROM users WHERE role = 'researcher' ORDER BY name`
  ).all()
  
  return c.json(researchers.results)
})

// 관리자 대시보드 - 특정 연구원의 상세 정보
app.get('/api/admin/researcher/:id', authMiddleware, async (c) => {
  const adminId = c.get('userId')
  const researcherId = c.req.param('id')
  
  // 관리자 권한 확인
  const admin = await c.env.DB.prepare(
    'SELECT role FROM users WHERE id = ?'
  ).bind(adminId).first()
  
  if (admin?.role !== 'admin') {
    return c.json({ error: '관리자 권한이 필요합니다.' }, 403)
  }
  
  // 연구원 기본 정보
  const researcher = await c.env.DB.prepare(
    'SELECT id, email, name, created_at FROM users WHERE id = ?'
  ).bind(researcherId).first()
  
  // 연구노트 수
  const notesCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM research_notes WHERE user_id = ?'
  ).bind(researcherId).first()
  
  // 최근 7일 시간 기록
  const recentTime = await c.env.DB.prepare(
    `SELECT record_type, SUM(duration_minutes) as total 
     FROM time_records 
     WHERE user_id = ? AND record_date >= date('now', '-7 days')
     GROUP BY record_type`
  ).bind(researcherId).all()
  
  // 휴가 신청
  const vacations = await c.env.DB.prepare(
    'SELECT * FROM vacation_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 5'
  ).bind(researcherId).all()
  
  // 최근 평가
  const evaluations = await c.env.DB.prepare(
    'SELECT * FROM self_evaluations WHERE user_id = ? ORDER BY evaluation_date DESC LIMIT 5'
  ).bind(researcherId).all()
  
  return c.json({
    researcher,
    notes_count: notesCount?.count || 0,
    recent_time: recentTime.results,
    vacations: vacations.results,
    evaluations: evaluations.results
  })
})

// ==================== 통계 API ====================

// 주간 통계
app.get('/api/stats/weekly', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  // 최근 7일 시간 기록
  const weeklyStats = await c.env.DB.prepare(
    `SELECT 
       record_date,
       record_type,
       SUM(duration_minutes) as total_minutes
     FROM time_records 
     WHERE user_id = ? AND record_date >= date('now', '-7 days')
     GROUP BY record_date, record_type
     ORDER BY record_date DESC`
  ).bind(userId).all()
  
  return c.json(weeklyStats.results)
})

// 월간 통계
app.get('/api/stats/monthly', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  // 최근 30일 시간 기록
  const monthlyStats = await c.env.DB.prepare(
    `SELECT 
       record_date,
       record_type,
       SUM(duration_minutes) as total_minutes
     FROM time_records 
     WHERE user_id = ? AND record_date >= date('now', '-30 days')
     GROUP BY record_date, record_type
     ORDER BY record_date DESC`
  ).bind(userId).all()
  
  return c.json(monthlyStats.results)
})

// 전체 통계 요약
app.get('/api/stats/summary', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  // 이번 주 (최근 7일)
  const thisWeek = await c.env.DB.prepare(
    `SELECT 
       record_type,
       SUM(duration_minutes) as total_minutes,
       COUNT(*) as count
     FROM time_records 
     WHERE user_id = ? AND record_date >= date('now', '-7 days')
     GROUP BY record_type`
  ).bind(userId).all()
  
  // 지난 주 (8-14일 전)
  const lastWeek = await c.env.DB.prepare(
    `SELECT 
       record_type,
       SUM(duration_minutes) as total_minutes
     FROM time_records 
     WHERE user_id = ? 
       AND record_date >= date('now', '-14 days')
       AND record_date < date('now', '-7 days')
     GROUP BY record_type`
  ).bind(userId).all()
  
  // 이번 달 (최근 30일)
  const thisMonth = await c.env.DB.prepare(
    `SELECT 
       record_type,
       SUM(duration_minutes) as total_minutes
     FROM time_records 
     WHERE user_id = ? AND record_date >= date('now', '-30 days')
     GROUP BY record_type`
  ).bind(userId).all()
  
  return c.json({
    this_week: thisWeek.results,
    last_week: lastWeek.results,
    this_month: thisMonth.results
  })
})

// ==================== 대시보드 API ====================

// 대시보드 통계
app.get('/api/dashboard', authMiddleware, async (c) => {
  const userId = c.get('userId')
  
  // 오늘 날짜
  const today = new Date().toISOString().split('T')[0]
  
  // 연구노트 수
  const notesCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM research_notes WHERE user_id = ?'
  ).bind(userId).first()
  
  // 오늘 시간 기록
  const todayTime = await c.env.DB.prepare(
    `SELECT record_type, SUM(duration_minutes) as total 
     FROM time_records 
     WHERE user_id = ? AND record_date = ?
     GROUP BY record_type`
  ).bind(userId, today).all()
  
  // 대기중인 휴가 신청
  const pendingVacations = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM vacation_requests WHERE user_id = ? AND status = "pending"'
  ).bind(userId).first()
  
  // 최근 평가 평균
  const avgEvaluation = await c.env.DB.prepare(
    `SELECT 
       AVG(productivity_score) as avg_productivity,
       AVG(quality_score) as avg_quality,
       AVG(collaboration_score) as avg_collaboration
     FROM (
       SELECT * FROM self_evaluations 
       WHERE user_id = ? 
       ORDER BY evaluation_date DESC 
       LIMIT 7
     )`
  ).bind(userId).first()
  
  return c.json({
    notes_count: notesCount?.count || 0,
    today_time: todayTime.results,
    pending_vacations: pendingVacations?.count || 0,
    avg_evaluation: avgEvaluation
  })
})

// ==================== 홈페이지 ====================

app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>연구노트 관리 시스템</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <div id="app"></div>
    
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>
  `)
})

export default app
