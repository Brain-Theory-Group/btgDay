// 전역 상태
let currentUser = null;
let currentToken = null;
let currentView = 'dashboard';

// API 헬퍼
const api = axios.create({
  baseURL: '/api'
});

// 토큰을 헤더에 자동 추가
api.interceptors.request.use(config => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// 인증 확인
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    currentToken = token;
    currentUser = JSON.parse(user);
    showDashboard();
  } else {
    showLogin();
  }
}

// 로그인 화면
function showLogin() {
  document.getElementById('app').innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
          <i class="fas fa-flask mr-2"></i>연구노트 관리
        </h1>
        
        <div id="login-form">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input type="email" id="login-email" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="researcher@example.com">
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <input type="password" id="login-password" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••">
          </div>
          
          <button onclick="handleLogin()" 
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4">
            <i class="fas fa-sign-in-alt mr-2"></i>로그인
          </button>
          
          <button onclick="showRegister()" 
            class="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            <i class="fas fa-user-plus mr-2"></i>회원가입
          </button>
        </div>
        
        <div id="error-message" class="mt-4 text-red-600 text-sm text-center hidden"></div>
        
        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-gray-600 text-center mb-2">테스트 계정:</p>
          <p class="text-xs text-gray-500 text-center">researcher1@example.com / password123</p>
        </div>
      </div>
    </div>
  `;
}

// 회원가입 화면
function showRegister() {
  document.getElementById('app').innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
          <i class="fas fa-user-plus mr-2"></i>회원가입
        </h1>
        
        <div id="register-form">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">이름</label>
            <input type="text" id="register-name" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="홍길동">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input type="email" id="register-email" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="researcher@example.com">
          </div>
          
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <input type="password" id="register-password" 
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••">
          </div>
          
          <button onclick="handleRegister()" 
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-4">
            <i class="fas fa-check mr-2"></i>가입하기
          </button>
          
          <button onclick="showLogin()" 
            class="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            <i class="fas fa-arrow-left mr-2"></i>로그인으로 돌아가기
          </button>
        </div>
        
        <div id="error-message" class="mt-4 text-red-600 text-sm text-center hidden"></div>
      </div>
    </div>
  `;
}

// 로그인 처리
async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const response = await api.post('/login', { email, password });
    currentToken = response.data.token;
    currentUser = response.data.user;
    
    localStorage.setItem('token', currentToken);
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    showDashboard();
  } catch (error) {
    showError(error.response?.data?.error || '로그인에 실패했습니다.');
  }
}

// 회원가입 처리
async function handleRegister() {
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  
  try {
    await api.post('/register', { email, password, name });
    alert('회원가입이 완료되었습니다. 로그인해주세요.');
    showLogin();
  } catch (error) {
    showError(error.response?.data?.error || '회원가입에 실패했습니다.');
  }
}

// 로그아웃
async function handleLogout() {
  await api.post('/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentToken = null;
  currentUser = null;
  showLogin();
}

// 에러 표시
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  setTimeout(() => errorDiv.classList.add('hidden'), 3000);
}

// 대시보드 표시
async function showDashboard() {
  currentView = 'dashboard';
  
  try {
    const dashboard = await api.get('/dashboard');
    const stats = dashboard.data;
    
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <!-- 상단 네비게이션 -->
        <nav class="bg-white shadow-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
              <div class="flex items-center">
                <h1 class="text-xl font-bold text-gray-800">
                  <i class="fas fa-flask mr-2 text-blue-600"></i>연구노트 관리
                </h1>
              </div>
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">
                  <i class="fas fa-user mr-1"></i>${currentUser.name}
                </span>
                <button onclick="handleLogout()" 
                  class="text-sm text-gray-600 hover:text-gray-800">
                  <i class="fas fa-sign-out-alt mr-1"></i>로그아웃
                </button>
              </div>
            </div>
          </div>
        </nav>

        <!-- 메인 컨텐츠 -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- 통계 카드 -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">연구노트</p>
                  <p class="text-2xl font-bold text-gray-800">${stats.notes_count}</p>
                </div>
                <i class="fas fa-book text-3xl text-blue-500"></i>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">오늘 연구시간</p>
                  <p class="text-2xl font-bold text-gray-800">
                    ${stats.today_time.find(t => t.record_type === 'research')?.total || 0}분
                  </p>
                </div>
                <i class="fas fa-flask text-3xl text-green-500"></i>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">오늘 공부시간</p>
                  <p class="text-2xl font-bold text-gray-800">
                    ${stats.today_time.find(t => t.record_type === 'study')?.total || 0}분
                  </p>
                </div>
                <i class="fas fa-graduation-cap text-3xl text-purple-500"></i>
              </div>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600">대기중인 휴가</p>
                  <p class="text-2xl font-bold text-gray-800">${stats.pending_vacations}</p>
                </div>
                <i class="fas fa-umbrella-beach text-3xl text-orange-500"></i>
              </div>
            </div>
          </div>

          <!-- 네비게이션 탭 -->
          <div class="bg-white rounded-lg shadow-sm mb-6">
            <div class="border-b border-gray-200">
              <nav class="flex -mb-px">
                <button onclick="showNotes()" 
                  class="px-6 py-4 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent">
                  <i class="fas fa-book mr-2"></i>연구노트
                </button>
                <button onclick="showTimeRecords()" 
                  class="px-6 py-4 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent">
                  <i class="fas fa-clock mr-2"></i>시간 기록
                </button>
                <button onclick="showVacations()" 
                  class="px-6 py-4 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent">
                  <i class="fas fa-umbrella-beach mr-2"></i>휴가 신청
                </button>
                <button onclick="showEvaluations()" 
                  class="px-6 py-4 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent">
                  <i class="fas fa-star mr-2"></i>셀프 평가
                </button>
                <button onclick="showCalendar()" 
                  class="px-6 py-4 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent">
                  <i class="fas fa-calendar-alt mr-2"></i>캘린더
                </button>
                <button onclick="showStats()" 
                  class="px-6 py-4 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent">
                  <i class="fas fa-chart-bar mr-2"></i>통계
                </button>
                ${currentUser.role === 'admin' ? `
                <button onclick="showAdminDashboard()" 
                  class="px-6 py-4 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-blue-600 border-b-2 border-transparent">
                  <i class="fas fa-users-cog mr-2"></i>관리자
                </button>
                ` : ''}
              </nav>
            </div>
          </div>

          <!-- 컨텐츠 영역 -->
          <div id="content-area" class="bg-white rounded-lg shadow-sm p-6">
            <div class="text-center text-gray-500 py-12">
              <i class="fas fa-hand-pointer text-4xl mb-4"></i>
              <p>위 탭을 선택하여 시작하세요</p>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Dashboard error:', error);
    handleLogout();
  }
}

// 연구노트 화면
async function showNotes(searchQuery = '', tagFilter = '') {
  currentView = 'notes';
  
  try {
    let url = '/notes';
    const params = [];
    if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
    if (tagFilter) params.push(`tag=${encodeURIComponent(tagFilter)}`);
    if (params.length > 0) url += '?' + params.join('&');
    
    const response = await api.get(url);
    const notes = response.data;
    
    let notesHTML = notes.map(note => {
      const tags = note.tags ? note.tags.split(',').map(tag => 
        `<span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mr-1 cursor-pointer hover:bg-blue-200" 
               onclick="showNotes('', '${tag.trim()}')">#${tag.trim()}</span>`
      ).join('') : '';
      
      return `
        <div class="border-b border-gray-200 py-4 last:border-0">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-800 mb-1">${note.title}</h3>
              <p class="text-sm text-gray-600 mb-2 line-clamp-2">${note.content}</p>
              ${tags ? `<div class="mb-2">${tags}</div>` : ''}
              ${note.gdrive_url ? `<a href="${note.gdrive_url}" target="_blank" class="text-xs text-blue-600 hover:underline">
                <i class="fab fa-google-drive mr-1"></i>Google Drive에서 보기
              </a>` : ''}
              <p class="text-xs text-gray-400 mt-1">${new Date(note.created_at).toLocaleString('ko-KR')}</p>
            </div>
            <div class="flex space-x-2 ml-4">
              <button onclick="editNote(${note.id})" 
                class="text-blue-600 hover:text-blue-800">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteNote(${note.id})" 
                class="text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    if (notes.length === 0) {
      notesHTML = '<p class="text-center text-gray-500 py-8">검색 결과가 없습니다.</p>';
    }
    
    document.getElementById('content-area').innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">
          <i class="fas fa-book mr-2"></i>연구노트
        </h2>
        <button onclick="showNoteForm()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>새 노트 작성
        </button>
      </div>
      
      <!-- 검색 바 -->
      <div class="mb-4 flex space-x-2">
        <input type="text" id="note-search" value="${searchQuery}" 
          placeholder="제목이나 내용으로 검색..." 
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          onkeypress="if(event.key==='Enter') searchNotes()">
        <button onclick="searchNotes()" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <i class="fas fa-search mr-2"></i>검색
        </button>
        ${searchQuery || tagFilter ? `
          <button onclick="showNotes()" 
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            <i class="fas fa-times mr-2"></i>초기화
          </button>
        ` : ''}
      </div>
      
      ${tagFilter ? `<div class="mb-4 text-sm text-gray-600">
        <i class="fas fa-filter mr-1"></i>태그 필터: <strong>#${tagFilter}</strong>
      </div>` : ''}
      
      <div id="notes-list">
        ${notesHTML}
      </div>
    `;
  } catch (error) {
    console.error('Notes error:', error);
  }
}

// 노트 검색
function searchNotes() {
  const searchQuery = document.getElementById('note-search').value;
  showNotes(searchQuery, '');
}
        </h2>
        <button onclick="showNoteForm()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>새 노트 작성
        </button>
      </div>
      
      <div id="notes-list">
        ${notesHTML}
      </div>
    `;
  } catch (error) {
    console.error('Notes error:', error);
  }
}

// 노트 작성 폼
function showNoteForm(noteId = null) {
  document.getElementById('content-area').innerHTML = `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-xl font-bold text-gray-800 mb-6">
        <i class="fas fa-edit mr-2"></i>${noteId ? '노트 수정' : '새 노트 작성'}
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">제목</label>
          <input type="text" id="note-title" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="연구노트 제목">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">내용</label>
          <textarea id="note-content" rows="10"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="연구 내용을 작성하세요..."></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Google Drive URL (선택)</label>
          <input type="url" id="note-gdrive" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://drive.google.com/...">
          <p class="text-xs text-gray-500 mt-1">
            <i class="fas fa-info-circle mr-1"></i>
            Google Drive에 업로드한 파일의 공유 링크를 입력하세요
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">태그 (선택)</label>
          <input type="text" id="note-tags" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="실험,데이터분석,머신러닝">
          <p class="text-xs text-gray-500 mt-1">
            <i class="fas fa-tag mr-1"></i>
            쉼표(,)로 구분하여 여러 태그를 입력하세요
          </p>
        </div>
        
        <div class="flex space-x-4">
          <button onclick="saveNote(${noteId})" 
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            <i class="fas fa-save mr-2"></i>저장
          </button>
          <button onclick="showNotes()" 
            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
            <i class="fas fa-times mr-2"></i>취소
          </button>
        </div>
      </div>
    </div>
  `;
  
  if (noteId) {
    loadNoteData(noteId);
  }
}

// 노트 데이터 로드
async function loadNoteData(noteId) {
  try {
    const response = await api.get(`/notes/${noteId}`);
    const note = response.data;
    
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content;
    document.getElementById('note-gdrive').value = note.gdrive_url || '';
    document.getElementById('note-tags').value = note.tags || '';
  } catch (error) {
    console.error('Load note error:', error);
  }
}

// 노트 저장
async function saveNote(noteId) {
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-content').value;
  const gdrive_url = document.getElementById('note-gdrive').value;
  const tags = document.getElementById('note-tags').value;
  
  if (!title || !content) {
    alert('제목과 내용을 입력해주세요.');
    return;
  }
  
  try {
    if (noteId) {
      await api.put(`/notes/${noteId}`, { title, content, gdrive_url, tags });
    } else {
      await api.post('/notes', { title, content, gdrive_url, tags });
    }
    showNotes();
  } catch (error) {
    console.error('Save note error:', error);
    alert('저장에 실패했습니다.');
  }
}

// 노트 수정
function editNote(noteId) {
  showNoteForm(noteId);
}

// 노트 삭제
async function deleteNote(noteId) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  
  try {
    await api.delete(`/notes/${noteId}`);
    showNotes();
  } catch (error) {
    console.error('Delete note error:', error);
  }
}

// 시간 기록 화면
async function showTimeRecords() {
  currentView = 'time';
  
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const response = await api.get(`/time-records?date=${today}`);
    const records = response.data;
    
    let recordsHTML = records.map(record => `
      <div class="flex justify-between items-center border-b border-gray-200 py-3 last:border-0">
        <div>
          <span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${
            record.record_type === 'research' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
          }">
            <i class="fas ${record.record_type === 'research' ? 'fa-flask' : 'fa-graduation-cap'} mr-1"></i>
            ${record.record_type === 'research' ? '연구' : '공부'}
          </span>
          <span class="ml-3 text-gray-800 font-semibold">${record.duration_minutes}분</span>
          ${record.description ? `<p class="text-sm text-gray-600 mt-1">${record.description}</p>` : ''}
        </div>
        <button onclick="deleteTimeRecord(${record.id})" 
          class="text-red-600 hover:text-red-800">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
    
    if (records.length === 0) {
      recordsHTML = '<p class="text-center text-gray-500 py-8">오늘 기록된 시간이 없습니다.</p>';
    }
    
    document.getElementById('content-area').innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">
          <i class="fas fa-clock mr-2"></i>시간 기록 (${today})
        </h2>
        <button onclick="showTimeRecordForm()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>시간 추가
        </button>
      </div>
      
      <div id="records-list">
        ${recordsHTML}
      </div>
    `;
  } catch (error) {
    console.error('Time records error:', error);
  }
}

// 시간 기록 폼
function showTimeRecordForm() {
  const today = new Date().toISOString().split('T')[0];
  
  document.getElementById('content-area').innerHTML = `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-xl font-bold text-gray-800 mb-6">
        <i class="fas fa-plus mr-2"></i>시간 기록 추가
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">활동 유형</label>
          <select id="record-type" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="research">연구</option>
            <option value="study">공부</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">시간 (분)</label>
          <input type="number" id="record-duration" min="1"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="60">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">설명 (선택)</label>
          <textarea id="record-description" rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="무엇을 했는지 간단히 작성하세요..."></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">날짜</label>
          <input type="date" id="record-date" value="${today}"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="flex space-x-4">
          <button onclick="saveTimeRecord()" 
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            <i class="fas fa-save mr-2"></i>저장
          </button>
          <button onclick="showTimeRecords()" 
            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
            <i class="fas fa-times mr-2"></i>취소
          </button>
        </div>
      </div>
    </div>
  `;
}

// 시간 기록 저장
async function saveTimeRecord() {
  const record_type = document.getElementById('record-type').value;
  const duration_minutes = parseInt(document.getElementById('record-duration').value);
  const description = document.getElementById('record-description').value;
  const record_date = document.getElementById('record-date').value;
  
  if (!duration_minutes || duration_minutes <= 0) {
    alert('시간을 입력해주세요.');
    return;
  }
  
  try {
    await api.post('/time-records', {
      record_type,
      duration_minutes,
      description,
      record_date
    });
    showTimeRecords();
  } catch (error) {
    console.error('Save time record error:', error);
    alert('저장에 실패했습니다.');
  }
}

// 시간 기록 삭제
async function deleteTimeRecord(recordId) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  
  try {
    await api.delete(`/time-records/${recordId}`);
    showTimeRecords();
  } catch (error) {
    console.error('Delete time record error:', error);
  }
}

// 휴가 신청 화면
async function showVacations() {
  currentView = 'vacations';
  
  try {
    const response = await api.get('/vacations');
    const vacations = response.data;
    
    let vacationsHTML = vacations.map(vacation => `
      <div class="border-b border-gray-200 py-4 last:border-0">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-800 font-semibold">
              ${vacation.start_date} ~ ${vacation.end_date}
            </p>
            <p class="text-sm text-gray-600 mt-1">${vacation.reason || '사유 없음'}</p>
            <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              vacation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              vacation.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }">
              ${
                vacation.status === 'pending' ? '대기중' :
                vacation.status === 'approved' ? '승인됨' : '거절됨'
              }
            </span>
          </div>
          ${vacation.status === 'pending' ? `
            <button onclick="deleteVacation(${vacation.id})" 
              class="text-red-600 hover:text-red-800">
              <i class="fas fa-times"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
    
    if (vacations.length === 0) {
      vacationsHTML = '<p class="text-center text-gray-500 py-8">신청한 휴가가 없습니다.</p>';
    }
    
    document.getElementById('content-area').innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">
          <i class="fas fa-umbrella-beach mr-2"></i>휴가 신청
        </h2>
        <button onclick="showVacationForm()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>휴가 신청
        </button>
      </div>
      
      <div id="vacations-list">
        ${vacationsHTML}
      </div>
    `;
  } catch (error) {
    console.error('Vacations error:', error);
  }
}

// 휴가 신청 폼
function showVacationForm() {
  const today = new Date().toISOString().split('T')[0];
  
  document.getElementById('content-area').innerHTML = `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-xl font-bold text-gray-800 mb-6">
        <i class="fas fa-plus mr-2"></i>휴가 신청
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">시작 날짜</label>
          <input type="date" id="vacation-start" min="${today}"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">종료 날짜</label>
          <input type="date" id="vacation-end" min="${today}"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">사유</label>
          <textarea id="vacation-reason" rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="휴가 사유를 입력하세요..."></textarea>
        </div>
        
        <div class="flex space-x-4">
          <button onclick="saveVacation()" 
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            <i class="fas fa-paper-plane mr-2"></i>신청
          </button>
          <button onclick="showVacations()" 
            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
            <i class="fas fa-times mr-2"></i>취소
          </button>
        </div>
      </div>
    </div>
  `;
}

// 휴가 신청 저장
async function saveVacation() {
  const start_date = document.getElementById('vacation-start').value;
  const end_date = document.getElementById('vacation-end').value;
  const reason = document.getElementById('vacation-reason').value;
  
  if (!start_date || !end_date) {
    alert('날짜를 선택해주세요.');
    return;
  }
  
  if (new Date(start_date) > new Date(end_date)) {
    alert('종료 날짜는 시작 날짜 이후여야 합니다.');
    return;
  }
  
  try {
    await api.post('/vacations', { start_date, end_date, reason });
    showVacations();
  } catch (error) {
    console.error('Save vacation error:', error);
    alert('신청에 실패했습니다.');
  }
}

// 휴가 신청 취소
async function deleteVacation(vacationId) {
  if (!confirm('휴가 신청을 취소하시겠습니까?')) return;
  
  try {
    await api.delete(`/vacations/${vacationId}`);
    showVacations();
  } catch (error) {
    console.error('Delete vacation error:', error);
  }
}

// 셀프 평가 화면
async function showEvaluations() {
  currentView = 'evaluations';
  
  try {
    const response = await api.get('/evaluations');
    const evaluations = response.data;
    
    let evaluationsHTML = evaluations.map(evaluation => `
      <div class="border-b border-gray-200 py-4 last:border-0">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <p class="text-gray-800 font-semibold mb-2">${evaluation.evaluation_date}</p>
            <div class="grid grid-cols-3 gap-4 mb-2">
              <div>
                <p class="text-xs text-gray-600">생산성</p>
                <p class="text-lg font-bold text-blue-600">${evaluation.productivity_score}/5</p>
              </div>
              <div>
                <p class="text-xs text-gray-600">품질</p>
                <p class="text-lg font-bold text-green-600">${evaluation.quality_score}/5</p>
              </div>
              <div>
                <p class="text-xs text-gray-600">협업</p>
                <p class="text-lg font-bold text-purple-600">${evaluation.collaboration_score}/5</p>
              </div>
            </div>
            ${evaluation.notes ? `<p class="text-sm text-gray-600">${evaluation.notes}</p>` : ''}
          </div>
        </div>
      </div>
    `).join('');
    
    if (evaluations.length === 0) {
      evaluationsHTML = '<p class="text-center text-gray-500 py-8">아직 작성한 평가가 없습니다.</p>';
    }
    
    document.getElementById('content-area').innerHTML = `
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">
          <i class="fas fa-star mr-2"></i>셀프 평가
        </h2>
        <button onclick="showEvaluationForm()" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <i class="fas fa-plus mr-2"></i>평가 작성
        </button>
      </div>
      
      <div id="evaluations-list">
        ${evaluationsHTML}
      </div>
    `;
  } catch (error) {
    console.error('Evaluations error:', error);
  }
}

// 셀프 평가 폼
function showEvaluationForm() {
  const today = new Date().toISOString().split('T')[0];
  
  document.getElementById('content-area').innerHTML = `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-xl font-bold text-gray-800 mb-6">
        <i class="fas fa-plus mr-2"></i>셀프 평가 작성
      </h2>
      
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">평가 날짜</label>
          <input type="date" id="evaluation-date" value="${today}"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">생산성 (1-5)</label>
          <input type="range" id="productivity-score" min="1" max="5" value="3"
            class="w-full" oninput="document.getElementById('productivity-value').textContent = this.value">
          <div class="flex justify-between text-sm text-gray-600">
            <span>낮음</span>
            <span class="font-bold" id="productivity-value">3</span>
            <span>높음</span>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">품질 (1-5)</label>
          <input type="range" id="quality-score" min="1" max="5" value="3"
            class="w-full" oninput="document.getElementById('quality-value').textContent = this.value">
          <div class="flex justify-between text-sm text-gray-600">
            <span>낮음</span>
            <span class="font-bold" id="quality-value">3</span>
            <span>높음</span>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">협업 (1-5)</label>
          <input type="range" id="collaboration-score" min="1" max="5" value="3"
            class="w-full" oninput="document.getElementById('collaboration-value').textContent = this.value">
          <div class="flex justify-between text-sm text-gray-600">
            <span>낮음</span>
            <span class="font-bold" id="collaboration-value">3</span>
            <span>높음</span>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">메모</label>
          <textarea id="evaluation-notes" rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="오늘의 업무 내용이나 느낀 점을 작성하세요..."></textarea>
        </div>
        
        <div class="flex space-x-4">
          <button onclick="saveEvaluation()" 
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            <i class="fas fa-save mr-2"></i>저장
          </button>
          <button onclick="showEvaluations()" 
            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
            <i class="fas fa-times mr-2"></i>취소
          </button>
        </div>
      </div>
    </div>
  `;
}

// 셀프 평가 저장
async function saveEvaluation() {
  const evaluation_date = document.getElementById('evaluation-date').value;
  const productivity_score = parseInt(document.getElementById('productivity-score').value);
  const quality_score = parseInt(document.getElementById('quality-score').value);
  const collaboration_score = parseInt(document.getElementById('collaboration-score').value);
  const notes = document.getElementById('evaluation-notes').value;
  
  try {
    await api.post('/evaluations', {
      evaluation_date,
      productivity_score,
      quality_score,
      collaboration_score,
      notes
    });
    showEvaluations();
  } catch (error) {
    console.error('Save evaluation error:', error);
    alert('저장에 실패했습니다.');
  }
}

// ==================== 캘린더 ====================

// 캘린더 화면
async function showCalendar() {
  currentView = 'calendar';
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  
  await renderCalendar(year, month);
}

// 캘린더 렌더링
async function renderCalendar(year, month) {
  try {
    const response = await api.get(`/calendar?year=${year}&month=${month.toString().padStart(2, '0')}`);
    const events = response.data;
    
    // 해당 월의 첫날과 마지막 날
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0: 일요일
    
    // 이전/다음 달 계산
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    
    // 날짜별 이벤트 매핑
    const eventsByDate = {};
    
    // 시간 기록
    events.time_records.forEach(record => {
      if (!eventsByDate[record.date]) eventsByDate[record.date] = [];
      eventsByDate[record.date].push({
        type: 'time',
        subtype: record.subtype,
        title: `${record.subtype === 'research' ? '연구' : '공부'} ${record.duration_minutes}분`,
        color: record.subtype === 'research' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800',
        icon: record.subtype === 'research' ? 'fa-flask' : 'fa-graduation-cap'
      });
    });
    
    // 휴가
    events.vacations.forEach(vacation => {
      const start = new Date(vacation.date);
      const end = new Date(vacation.end_date);
      
      // 휴가 기간의 모든 날짜에 표시
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
        eventsByDate[dateStr].push({
          type: 'vacation',
          title: '휴가',
          color: 'bg-orange-100 text-orange-800',
          icon: 'fa-umbrella-beach'
        });
      }
    });
    
    // 세미나
    events.seminars.forEach(seminar => {
      if (!eventsByDate[seminar.date]) eventsByDate[seminar.date] = [];
      eventsByDate[seminar.date].push({
        type: 'seminar',
        title: seminar.title,
        time: seminar.start_time,
        color: 'bg-blue-100 text-blue-800',
        icon: 'fa-users',
        data: seminar
      });
    });
    
    // 출장
    events.business_trips.forEach(trip => {
      const start = new Date(trip.date);
      const end = new Date(trip.end_date);
      
      // 출장 기간의 모든 날짜에 표시
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
        eventsByDate[dateStr].push({
          type: 'business_trip',
          title: `출장: ${trip.title}`,
          color: 'bg-red-100 text-red-800',
          icon: 'fa-plane'
        });
      }
    });
    
    // 연구노트
    events.research_notes.forEach(note => {
      if (!eventsByDate[note.date]) eventsByDate[note.date] = [];
      eventsByDate[note.date].push({
        type: 'research_note',
        title: `📝 ${note.title}`,
        color: 'bg-teal-100 text-teal-800',
        icon: 'fa-book'
      });
    });
    
    // 달력 그리드 생성
    let calendarHTML = '';
    let dayCounter = 1;
    const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;
    
    for (let i = 0; i < totalCells; i++) {
      if (i % 7 === 0) {
        calendarHTML += '<div class="grid grid-cols-7 gap-2">';
      }
      
      if (i < startDayOfWeek || dayCounter > daysInMonth) {
        calendarHTML += '<div class="min-h-32 bg-gray-50 rounded-lg p-2"></div>';
      } else {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${dayCounter.toString().padStart(2, '0')}`;
        const dayEvents = eventsByDate[dateStr] || [];
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        
        calendarHTML += `
          <div class="min-h-32 bg-white rounded-lg p-2 border ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}">
            <div class="text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'} mb-2">
              ${dayCounter}
            </div>
            <div class="space-y-1">
              ${dayEvents.slice(0, 3).map(event => `
                <div class="text-xs px-2 py-1 rounded ${event.color} truncate">
                  <i class="fas ${event.icon} mr-1"></i>
                  ${event.time ? event.time + ' ' : ''}${event.title}
                </div>
              `).join('')}
              ${dayEvents.length > 3 ? `<div class="text-xs text-gray-500 px-2">+${dayEvents.length - 3} more</div>` : ''}
            </div>
          </div>
        `;
        dayCounter++;
      }
      
      if ((i + 1) % 7 === 0) {
        calendarHTML += '</div>';
      }
    }
    
    document.getElementById('content-area').innerHTML = `
      <div>
        <!-- 캘린더 헤더 -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center space-x-4">
            <button onclick="renderCalendar(${prevYear}, ${prevMonth})" 
              class="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              <i class="fas fa-chevron-left"></i>
            </button>
            <h2 class="text-2xl font-bold text-gray-800">
              ${year}년 ${month}월
            </h2>
            <button onclick="renderCalendar(${nextYear}, ${nextMonth})" 
              class="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="flex space-x-2">
            <button onclick="showSeminarForm()" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <i class="fas fa-plus mr-2"></i>세미나 추가
            </button>
            <button onclick="showBusinessTripForm()" 
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <i class="fas fa-plus mr-2"></i>출장 추가
            </button>
          </div>
        </div>
        
        <!-- 요일 헤더 -->
        <div class="grid grid-cols-7 gap-2 mb-2">
          <div class="text-center font-semibold text-red-600">일</div>
          <div class="text-center font-semibold text-gray-700">월</div>
          <div class="text-center font-semibold text-gray-700">화</div>
          <div class="text-center font-semibold text-gray-700">수</div>
          <div class="text-center font-semibold text-gray-700">목</div>
          <div class="text-center font-semibold text-gray-700">금</div>
          <div class="text-center font-semibold text-blue-600">토</div>
        </div>
        
        <!-- 캘린더 그리드 -->
        <div class="space-y-2">
          ${calendarHTML}
        </div>
        
        <!-- 범례 -->
        <div class="mt-6 flex flex-wrap gap-4">
          <div class="flex items-center">
            <div class="w-4 h-4 bg-green-100 rounded mr-2"></div>
            <span class="text-sm text-gray-600">연구</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 bg-purple-100 rounded mr-2"></div>
            <span class="text-sm text-gray-600">공부</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 bg-orange-100 rounded mr-2"></div>
            <span class="text-sm text-gray-600">휴가</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 bg-blue-100 rounded mr-2"></div>
            <span class="text-sm text-gray-600">세미나</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 bg-red-100 rounded mr-2"></div>
            <span class="text-sm text-gray-600">출장</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 bg-teal-100 rounded mr-2"></div>
            <span class="text-sm text-gray-600">연구노트</span>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Calendar error:', error);
  }
}

// 세미나 추가 폼
function showSeminarForm(seminarId = null) {
  const today = new Date().toISOString().split('T')[0];
  
  document.getElementById('content-area').innerHTML = `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-xl font-bold text-gray-800 mb-6">
        <i class="fas fa-plus mr-2"></i>세미나 추가
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">제목</label>
          <input type="text" id="seminar-title" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="세미나 제목">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
          <textarea id="seminar-description" rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="세미나 설명"></textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">날짜</label>
          <input type="date" id="seminar-date" value="${today}"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">시작 시간</label>
            <input type="time" id="seminar-start-time" value="14:00"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">종료 시간</label>
            <input type="time" id="seminar-end-time" value="16:00"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">장소</label>
          <input type="text" id="seminar-location" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="세미나실">
        </div>
        
        <div>
          <label class="flex items-center">
            <input type="checkbox" id="seminar-shared" class="mr-2">
            <span class="text-sm font-medium text-gray-700">모든 사용자와 공유</span>
          </label>
          <p class="text-xs text-gray-500 mt-1">
            <i class="fas fa-info-circle mr-1"></i>
            체크하면 다른 연구원들도 이 세미나를 볼 수 있습니다
          </p>
        </div>
        
        <div class="flex space-x-4">
          <button onclick="saveSeminar()" 
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            <i class="fas fa-save mr-2"></i>저장
          </button>
          <button onclick="showCalendar()" 
            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
            <i class="fas fa-times mr-2"></i>취소
          </button>
        </div>
      </div>
    </div>
  `;
}

// 세미나 저장
async function saveSeminar() {
  const title = document.getElementById('seminar-title').value;
  const description = document.getElementById('seminar-description').value;
  const event_date = document.getElementById('seminar-date').value;
  const start_time = document.getElementById('seminar-start-time').value;
  const end_time = document.getElementById('seminar-end-time').value;
  const location = document.getElementById('seminar-location').value;
  const is_shared = document.getElementById('seminar-shared').checked;
  
  if (!title || !event_date) {
    alert('제목과 날짜를 입력해주세요.');
    return;
  }
  
  try {
    await api.post('/seminars', {
      title,
      description,
      event_date,
      start_time,
      end_time,
      location,
      is_shared
    });
    showCalendar();
  } catch (error) {
    console.error('Save seminar error:', error);
    alert('저장에 실패했습니다.');
  }
}

// 출장 추가 폼
function showBusinessTripForm(tripId = null) {
  const today = new Date().toISOString().split('T')[0];
  
  document.getElementById('content-area').innerHTML = `
    <div class="max-w-2xl mx-auto">
      <h2 class="text-xl font-bold text-gray-800 mb-6">
        <i class="fas fa-plus mr-2"></i>출장 추가
      </h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">목적지</label>
          <input type="text" id="trip-destination" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="서울, 부산 등">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">목적</label>
          <textarea id="trip-purpose" rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="출장 목적"></textarea>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">시작 날짜</label>
            <input type="date" id="trip-start-date" min="${today}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">종료 날짜</label>
            <input type="date" id="trip-end-date" min="${today}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">상태</label>
          <select id="trip-status" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="planned">예정</option>
            <option value="ongoing">진행중</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
        
        <div class="flex space-x-4">
          <button onclick="saveBusinessTrip()" 
            class="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
            <i class="fas fa-save mr-2"></i>저장
          </button>
          <button onclick="showCalendar()" 
            class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
            <i class="fas fa-times mr-2"></i>취소
          </button>
        </div>
      </div>
    </div>
  `;
}

// 출장 저장
async function saveBusinessTrip() {
  const destination = document.getElementById('trip-destination').value;
  const purpose = document.getElementById('trip-purpose').value;
  const start_date = document.getElementById('trip-start-date').value;
  const end_date = document.getElementById('trip-end-date').value;
  const status = document.getElementById('trip-status').value;
  
  if (!destination || !start_date || !end_date) {
    alert('필수 항목을 입력해주세요.');
    return;
  }
  
  if (new Date(start_date) > new Date(end_date)) {
    alert('종료 날짜는 시작 날짜 이후여야 합니다.');
    return;
  }
  
  try {
    await api.post('/business-trips', {
      destination,
      purpose,
      start_date,
      end_date,
      status
    });
    showCalendar();
  } catch (error) {
    console.error('Save business trip error:', error);
    alert('저장에 실패했습니다.');
  }
}

// ==================== 통계 탭 ====================

// 통계 화면
async function showStats() {
  currentView = 'stats';
  
  try {
    const summary = await api.get('/stats/summary');
    const weekly = await api.get('/stats/weekly');
    
    const stats = summary.data;
    const weeklyData = weekly.data;
    
    // 이번 주 데이터 계산
    const thisWeekResearch = stats.this_week.find(s => s.record_type === 'research')?.total_minutes || 0;
    const thisWeekStudy = stats.this_week.find(s => s.record_type === 'study')?.total_minutes || 0;
    
    // 지난 주 데이터 계산
    const lastWeekResearch = stats.last_week.find(s => s.record_type === 'research')?.total_minutes || 0;
    const lastWeekStudy = stats.last_week.find(s => s.record_type === 'study')?.total_minutes || 0;
    
    // 이번 달 데이터 계산
    const thisMonthResearch = stats.this_month.find(s => s.record_type === 'research')?.total_minutes || 0;
    const thisMonthStudy = stats.this_month.find(s => s.record_type === 'study')?.total_minutes || 0;
    
    // 주간 상세 데이터 정리
    const dailyData = {};
    weeklyData.forEach(record => {
      if (!dailyData[record.record_date]) {
        dailyData[record.record_date] = { research: 0, study: 0 };
      }
      dailyData[record.record_date][record.record_type] = record.total_minutes;
    });
    
    const dailyHTML = Object.keys(dailyData).sort().reverse().map(date => {
      const data = dailyData[date];
      return `
        <div class="border-b border-gray-200 py-3 last:border-0">
          <div class="flex justify-between items-center">
            <div class="font-semibold text-gray-800">${date}</div>
            <div class="flex space-x-4">
              <span class="text-green-600">
                <i class="fas fa-flask mr-1"></i>연구: ${data.research}분
              </span>
              <span class="text-purple-600">
                <i class="fas fa-graduation-cap mr-1"></i>공부: ${data.study}분
              </span>
              <span class="text-blue-600 font-bold">
                합계: ${data.research + data.study}분
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    document.getElementById('content-area').innerHTML = `
      <div>
        <h2 class="text-xl font-bold text-gray-800 mb-6">
          <i class="fas fa-chart-bar mr-2"></i>시간 통계
        </h2>
        
        <!-- 요약 카드 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- 이번 주 -->
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
            <h3 class="text-lg font-semibold mb-4">이번 주 (최근 7일)</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>연구:</span>
                <span class="font-bold">${Math.floor(thisWeekResearch / 60)}시간 ${thisWeekResearch % 60}분</span>
              </div>
              <div class="flex justify-between">
                <span>공부:</span>
                <span class="font-bold">${Math.floor(thisWeekStudy / 60)}시간 ${thisWeekStudy % 60}분</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-blue-400">
                <span>합계:</span>
                <span class="font-bold text-xl">${Math.floor((thisWeekResearch + thisWeekStudy) / 60)}시간 ${(thisWeekResearch + thisWeekStudy) % 60}분</span>
              </div>
            </div>
          </div>
          
          <!-- 지난 주 -->
          <div class="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
            <h3 class="text-lg font-semibold mb-4">지난 주 (8-14일 전)</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>연구:</span>
                <span class="font-bold">${Math.floor(lastWeekResearch / 60)}시간 ${lastWeekResearch % 60}분</span>
              </div>
              <div class="flex justify-between">
                <span>공부:</span>
                <span class="font-bold">${Math.floor(lastWeekStudy / 60)}시간 ${lastWeekStudy % 60}분</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-green-400">
                <span>합계:</span>
                <span class="font-bold text-xl">${Math.floor((lastWeekResearch + lastWeekStudy) / 60)}시간 ${(lastWeekResearch + lastWeekStudy) % 60}분</span>
              </div>
            </div>
          </div>
          
          <!-- 이번 달 -->
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
            <h3 class="text-lg font-semibold mb-4">이번 달 (최근 30일)</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span>연구:</span>
                <span class="font-bold">${Math.floor(thisMonthResearch / 60)}시간 ${thisMonthResearch % 60}분</span>
              </div>
              <div class="flex justify-between">
                <span>공부:</span>
                <span class="font-bold">${Math.floor(thisMonthStudy / 60)}시간 ${thisMonthStudy % 60}분</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-purple-400">
                <span>합계:</span>
                <span class="font-bold text-xl">${Math.floor((thisMonthResearch + thisMonthStudy) / 60)}시간 ${(thisMonthResearch + thisMonthStudy) % 60}분</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 일별 상세 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">주간 상세 기록</h3>
          <div>
            ${dailyHTML || '<p class="text-center text-gray-500 py-8">최근 7일간 기록이 없습니다.</p>'}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Stats error:', error);
  }
}

// ==================== 관리자 대시보드 ====================

// 관리자 대시보드
async function showAdminDashboard() {
  currentView = 'admin';
  
  if (currentUser.role !== 'admin') {
    alert('관리자 권한이 필요합니다.');
    showDashboard();
    return;
  }
  
  try {
    const response = await api.get('/admin/researchers');
    const researchers = response.data;
    
    const researchersHTML = researchers.map(researcher => `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
           onclick="showResearcherDetail(${researcher.id})">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold text-gray-800">${researcher.name}</h3>
            <p class="text-sm text-gray-600">${researcher.email}</p>
            <p class="text-xs text-gray-400 mt-1">가입일: ${new Date(researcher.created_at).toLocaleDateString('ko-KR')}</p>
          </div>
          <i class="fas fa-chevron-right text-gray-400"></i>
        </div>
      </div>
    `).join('');
    
    document.getElementById('content-area').innerHTML = `
      <div>
        <h2 class="text-xl font-bold text-gray-800 mb-6">
          <i class="fas fa-users-cog mr-2"></i>관리자 대시보드
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${researchersHTML}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Admin dashboard error:', error);
  }
}

// 연구원 상세 정보
async function showResearcherDetail(researcherId) {
  try {
    const response = await api.get(`/admin/researcher/${researcherId}`);
    const data = response.data;
    const researcher = data.researcher;
    
    // 최근 시간 기록
    const recentResearch = data.recent_time.find(t => t.record_type === 'research')?.total || 0;
    const recentStudy = data.recent_time.find(t => t.record_type === 'study')?.total || 0;
    
    // 휴가 신청 목록
    const vacationsHTML = data.vacations.map(vacation => `
      <div class="border-b border-gray-200 py-2 last:border-0">
        <div class="flex justify-between">
          <span class="text-sm">${vacation.start_date} ~ ${vacation.end_date}</span>
          <span class="text-xs px-2 py-1 rounded ${
            vacation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            vacation.status === 'approved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }">
            ${vacation.status === 'pending' ? '대기중' : vacation.status === 'approved' ? '승인' : '거절'}
          </span>
        </div>
      </div>
    `).join('') || '<p class="text-sm text-gray-500 text-center py-4">휴가 신청 없음</p>';
    
    // 최근 평가
    const evaluationsHTML = data.evaluations.map(eval => `
      <div class="border-b border-gray-200 py-2 last:border-0">
        <div class="text-sm text-gray-800">${eval.evaluation_date}</div>
        <div class="flex space-x-4 mt-1 text-xs">
          <span>생산성: ${eval.productivity_score}/5</span>
          <span>품질: ${eval.quality_score}/5</span>
          <span>협업: ${eval.collaboration_score}/5</span>
        </div>
      </div>
    `).join('') || '<p class="text-sm text-gray-500 text-center py-4">평가 기록 없음</p>';
    
    document.getElementById('content-area').innerHTML = `
      <div>
        <div class="flex items-center mb-6">
          <button onclick="showAdminDashboard()" class="mr-4 text-gray-600 hover:text-gray-800">
            <i class="fas fa-arrow-left mr-2"></i>돌아가기
          </button>
          <h2 class="text-xl font-bold text-gray-800">
            ${researcher.name} 상세 정보
          </h2>
        </div>
        
        <!-- 통계 카드 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <p class="text-sm text-gray-600">연구노트</p>
            <p class="text-3xl font-bold text-blue-600">${data.notes_count}</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <p class="text-sm text-gray-600">최근 7일 연구시간</p>
            <p class="text-3xl font-bold text-green-600">${Math.floor(recentResearch / 60)}h ${recentResearch % 60}m</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <p class="text-sm text-gray-600">최근 7일 공부시간</p>
            <p class="text-3xl font-bold text-purple-600">${Math.floor(recentStudy / 60)}h ${recentStudy % 60}m</p>
          </div>
        </div>
        
        <!-- 상세 정보 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-gray-800 mb-4">휴가 신청</h3>
            ${vacationsHTML}
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="font-semibold text-gray-800 mb-4">최근 평가</h3>
            ${evaluationsHTML}
          </div>
        </div>
        
        <!-- 코멘트 작성 -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="font-semibold text-gray-800 mb-4">코멘트 작성</h3>
          <textarea id="comment-text" rows="3" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="연구원에게 전달할 코멘트를 입력하세요..."></textarea>
          <button onclick="saveComment(${researcher.id})" 
            class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <i class="fas fa-comment mr-2"></i>코멘트 전송
          </button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Researcher detail error:', error);
  }
}

// 코멘트 저장
async function saveComment(userId) {
  const comment_text = document.getElementById('comment-text').value;
  
  if (!comment_text) {
    alert('코멘트 내용을 입력해주세요.');
    return;
  }
  
  try {
    await api.post('/comments', {
      user_id: userId,
      comment_text
    });
    alert('코멘트가 전송되었습니다.');
    document.getElementById('comment-text').value = '';
  } catch (error) {
    console.error('Save comment error:', error);
    alert('코멘트 전송에 실패했습니다.');
  }
}

// 초기 로드
checkAuth();
