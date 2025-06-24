// .env 파일에서 API 키를 가져옵니다.
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// HTML 요소 가져오기
const lyricsForm = document.getElementById('lyrics-form');
const songTitleInput = document.getElementById('song-title');
const songArtistInput = document.getElementById('song-artist');
const resultContainer = document.getElementById('result-container');

// 폼(Form) 제출 이벤트 리스너 설정
lyricsForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 기본 동작을 막음

    // API 키 존재 여부를 먼저 확인
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('YOUR_OPENAI_API_KEY')) {
        resultContainer.textContent = '오류: .env 파일에 OpenAI API 키를 올바르게 설정해주세요!';
        return;
    }

    const title = songTitleInput.value.trim();
    const artist = songArtistInput.value.trim();

    if (!title || !artist) {
        alert('노래 제목과 가수를 모두 입력해주세요.');
        return;
    }
    
    // 로딩 상태 표시
    resultContainer.innerHTML = ''; // 이전 결과 초기화
    resultContainer.classList.add('loading');

    try {
        // API에 보낼 프롬프트 구성
        const prompt = `
          당신은 노래 가사 전문가입니다. 사용자가 요청한 노래를 찾아서 가사를 제공해주세요.

          [요청 정보]
          - 노래 제목: ${title}
          - 가수: ${artist}

          [처리 지침]
          1. 사용자의 요청이 한국어일 경우, 해당하는 영어 제목과 가수 이름을 함께 고려하여 검색해주세요. (예: '렛잇비' -> 'Let It Be', '비틀즈' -> 'The Beatles')
          2. 정확한 노래를 찾았다면, 찾은 노래의 "원제 - 가수"를 첫 줄에 명시한 후, 그 아래에 가사 전체를 보여주세요.
          3. 만약 정확한 노래를 찾을 수 없다면, "요청하신 노래를 찾을 수 없습니다." 라고만 간결하게 답변해주세요.
          4. 절대 가사를 지어내거나 추측해서 답변하지 마세요.
        `;

        // OpenAI API 호출
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            // API 에러가 발생하면, 상태 코드를 포함하여 명확한 에러 메시지를 생성
            const errorData = await response.json().catch(() => null); // 에러 응답 본문이 JSON이 아닐 수도 있으므로 대비
            const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
            throw new Error(`API 요청 실패: ${errorMessage}`);
        }

        const data = await response.json();
        const lyrics = data.choices[0].message.content;

        // 결과 표시
        resultContainer.classList.remove('loading');
        resultContainer.textContent = lyrics;

    } catch (error) {
        console.error('오류 발생:', error);
        resultContainer.classList.remove('loading');
        resultContainer.textContent = `오류가 발생했습니다: ${error.message}`;
    }
});