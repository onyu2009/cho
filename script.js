// 페이지 로드 시 초기 설정
document.addEventListener('DOMContentLoaded', () => {
    // 탭을 'coorder'로 열고, 'coorder-input' 화면을 활성화
    openTab('coorder'); 
    showScreen('coorder-input'); 
    
    showCommunityList(); 
    checkNonSuccessTime(); 
    calculate(); // 초기 로드 시 계산 실행
});

let couponCount = 3; 
let pots = [
    { 
        id: 1, 
        name: "저녁 6시 🍗치킨 픽업팟", 
        members: 3, 
        time: "D-20분", 
        pickup: "CU 영종스카이점 (도보 5분)", 
        content: "두 명만 더 모이면 바로 주문합니다! 픽업은 7시까지 오시면 돼요.",
        comments: [
            { author: "이웃1", text: "저 참여하고 싶어요! 현재 몇 명 모였나요?" },
            { author: "글쓴이", text: "지금 3명 모였습니다. 어서오세요!" }
        ] 
    },
    { 
        id: 2, 
        name: "점심 12시 🍝파스타 픽업팟 (마감)", 
        members: 1, 
        time: "마감", 
        pickup: "GS25 영종고점 (도보 8분)", 
        content: "오늘은 아쉽게도 주문을 놓쳤어요. 다음에 같이 시켜봐요!",
        comments: [] 
    },
];
let nextPotId = 3;

/**
 * 하단 탭 전환 기능
 */
function openTab(tabName) {
    // 모든 메인 탭 콘텐츠 숨김
    document.querySelectorAll('.main-tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none'; // DOM에서 제거
    });
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

    // 해당 탭 콘텐츠 활성화
    const activeTab = document.getElementById(tabName);
    activeTab.classList.add('active');
    activeTab.style.display = 'block';

    // 탭 버튼 활성화
    const buttonToActivate = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
    if (buttonToActivate) {
        buttonToActivate.classList.add('active');
    }
    
    // 헤더 제목 변경
    document.getElementById('header-title').innerText = 
        tabName === 'coorder' ? '배달 플랫폼' : 
        tabName === 'community' ? '같이 주문' : '리워드 이벤트';
    
    // N빵 탭으로 돌아오면 항상 입력 화면으로 복귀
    if (tabName === 'coorder') {
        showScreen('coorder-input');
    }

    if (tabName === 'event') {
        checkNonSuccessTime();
    }
}

/**
 * N빵 결제 탭 내 서브 화면 전환 기능 (슬라이드 애니메이션)
 */
function showScreen(screenId) {
    // 모든 서브 스크린 비활성화 및 오른쪽으로 이동
    document.querySelectorAll('#coorder .sub-screen').forEach(screen => {
        screen.classList.remove('active');
        if (screen.id !== screenId) {
             screen.style.transform = 'translateX(100%)';
        }
    });

    // 선택된 서브 스크린 활성화 및 중앙으로 이동
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.classList.add('active');
        screenToShow.style.transform = 'translateX(0)'; 
    }
    
    // 상세 화면일 때 헤더 제목 변경
    if (screenId === 'coorder-payment-detail') {
        document.getElementById('header-title').innerText = '정산하기';
    } else {
        document.getElementById('header-title').innerText = '배달 플랫폼';
    }
}


// ----------------------------------------------------------------------
// 💰 N빵 결제 기능
// ----------------------------------------------------------------------

function calculate() {
    const foodSelect = document.getElementById('food-select');
    const itemPrice = Number(foodSelect.value); 
    
    let quantity = document.getElementById('chicken-qty').value;
    let members = document.getElementById('split-members').value; 
    
    const qty = Number(quantity) || 0;
    const mbs = Number(members) || 1; 

    let totalPrice = qty * itemPrice;
    let splitPrice = totalPrice / mbs; 

    document.getElementById('total-price').innerText = totalPrice.toLocaleString();
    
    if (mbs <= 0 || qty <= 0) {
        document.getElementById('split-price').innerText = '0';
    } else {
        document.getElementById('split-price').innerText = Math.round(splitPrice).toLocaleString(); 
    }
}

/**
 * 정산하기 버튼 클릭 시 상세 화면으로 전환
 */
function openPaymentDetailScreen() {
    const totalPrice = document.getElementById('total-price').innerText;
    const splitPrice = document.getElementById('split-price').innerText;
    const members = document.getElementById('split-members').value;
    
    // 유효성 검사
    if (Number(members) <= 0 || Number(totalPrice.replace(/,/g, '')) <= 0) {
        alert('주문 메뉴와 분할 참여 인원을 확인해주세요.');
        return;
    }

    // 상세 화면에 값 업데이트
    document.getElementById('detail-total-price').innerText = `${totalPrice} 원`;
    document.getElementById('detail-split-price').innerText = `${splitPrice} 원`;
    document.getElementById('detail-members').innerText = members;
    document.getElementById('detail-member-count').innerText = members;
    
    // 화면 전환
    showScreen('coorder-payment-detail');
}

/**
 * 상세 화면에서 뒤로가기 버튼 클릭 시 입력 화면으로 복귀
 */
function closePaymentDetailScreen() {
    showScreen('coorder-input');
}

function finalizePayment() {
    alert('✅ 정산 요청 완료! \n\n참여 인원들에게 송금 요청 알림이 발송되었습니다.');
    // 정산 완료 후 다시 입력 화면으로 돌아감
    closePaymentDetailScreen(); 
}


// ----------------------------------------------------------------------
// 🤝 같이 주문 (커뮤니티) 기능 (이하 기존 코드 유지)
// ----------------------------------------------------------------------

function showCommunityList() {
    const potListDiv = document.getElementById('pot-list');
    let html = '';

    if (pots.length === 0) {
        html = '<p style="text-align: center; color: #888; padding: 20px;">현재 모집 중인 배달 팟이 없습니다.</p>';
    } else {
        pots.forEach(pot => {
            let commentsHtml = pot.comments.map(c => 
                `<p style="font-size: 12px; margin: 3px 0;"><strong style="color: var(--accent-color);">${c.author}:</strong> ${c.text}</p>`
            ).join('');
            
            html += `
                <div class="pot-item">
                    <p class="pot-title">${pot.name}</p>
                    <p class="pot-meta">인원: ${pot.members}명 | 마감: ${pot.time} | 픽업: ${pot.pickup}</p>
                    <p style="margin: 10px 0; font-size: 13px;">${pot.content}</p>
                    <button style="width: auto; padding: 5px 10px; font-size: 13px; background-color: var(--main-color); color: white; margin-top: 5px;">참여하기</button>
                    
                    <div class="comment-section">
                        <h5 style="margin-top: 0; color: #555; font-weight: 600;">💬 댓글 (${pot.comments.length})</h5>
                        <div id="comments-${pot.id}" style="max-height: 90px; overflow-y: auto; padding-right: 5px;">
                            ${commentsHtml}
                        </div>
                        <div class="comment-input-group">
                            <input type="text" id="comment-input-${pot.id}" placeholder="댓글 달기" class="comment-input">
                            <button onclick="addComment(${pot.id})" class="comment-button">등록</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    potListDiv.innerHTML = html;
}

function postPot() {
    const title = document.getElementById('new-pot-title').value.trim();
    const content = document.getElementById('new-pot-content').value.trim();

    if (!title || !content) {
        alert('팟 이름과 내용을 모두 입력해주세요.');
        return;
    }

    const newPot = {
        id: nextPotId++,
        name: title,
        members: 1, 
        time: "모집 중",
        pickup: "편의점 제휴 픽업존 (위치정보)", 
        content: content,
        comments: []
    };

    pots.unshift(newPot); 
    showCommunityList(); 
    
    document.getElementById('new-pot-title').value = '';
    document.getElementById('new-pot-content').value = '';
    
    alert('🎉 새로운 배달 팟이 등록되었습니다!');
}

function addComment(potId) {
    const commentInput = document.getElementById(`comment-input-${potId}`);
    const commentText = commentInput.value.trim();

    if (!commentText) {
        commentInput.focus();
        return;
    }

    const pot = pots.find(p => p.id === potId);
    if (pot) {
        pot.comments.push({ author: "사용자", text: commentText }); 
        
        showCommunityList(); 
    }
    commentInput.value = '';
}


// ----------------------------------------------------------------------
// 🎲 이벤트/게임 기능 (이하 기존 코드 유지)
// ----------------------------------------------------------------------

let gameTimerInterval;
let timeRemaining = 0;

function runEvent(eventType) {
    const couponElement = document.getElementById('coupon-count');
    
    if (eventType === 'attendance') {
        couponCount += 1;
        alert('🎉 출석 체크 완료! 쿠폰 1장이 지급되었습니다.');
    } else if (eventType === 'nonsuccess') {
        const button = document.querySelector('.event-button.nonsuccess');
        
        if (button.disabled) {
             alert('⏳ 비수요 시간이 아닙니다.');
        } else {
            couponCount += 1;
            alert('⏰ 비수요 시간 쿠폰 1장이 지급되었습니다!');
            button.disabled = true; 
            button.innerText = '쿠폰 수령 완료!';
        }
    }
    
    couponElement.innerText = couponCount;
}

function startGame() {
    const startBtn = document.getElementById('start-game-btn');
    const clickBtn = document.getElementById('click-btn');
    const timerSpan = document.getElementById('game-timer');
    const clickCountSpan = document.getElementById('click-count');
    const message = document.getElementById('game-message');

    if (gameTimerInterval) clearInterval(gameTimerInterval);
    
    timeRemaining = 10;
    clickCountSpan.innerText = 0;
    timerSpan.innerText = timeRemaining;
    message.innerText = '10초 동안 클릭 버튼을 최대한 많이 누르세요!';

    startBtn.style.display = 'none';
    clickBtn.style.display = 'block';
    clickBtn.disabled = false;

    gameTimerInterval = setInterval(() => {
        timeRemaining--;
        timerSpan.innerText = timeRemaining;

        if (timeRemaining <= 0) {
            clearInterval(gameTimerInterval);
            endGame();
        }
    }, 1000);
}

function increaseClick() {
    if (timeRemaining > 0) {
        let count = parseInt(document.getElementById('click-count').innerText);
        document.getElementById('click-count').innerText = count + 1;
    }
}

function endGame() {
    const startBtn = document.getElementById('start-game-btn');
    const clickBtn = document.getElementById('click-btn');
    const finalClicks = parseInt(document.getElementById('click-count').innerText);
    const message = document.getElementById('game-message');
    const couponElement = document.getElementById('coupon-count');
    
    clickBtn.disabled = true;
    startBtn.style.display = 'block';
    clickBtn.style.display = 'none';

    let reward = 0;
    let resultMessage = '';

    if (finalClicks >= 80) {
        reward = 5;
        resultMessage = `👏 대단해요! ${finalClicks}회 클릭! 쿠폰 5장이 지급됩니다.`;
    } else if (finalClicks >= 40) {
        reward = 2;
        resultMessage = `🎉 ${finalClicks}회 클릭! 쿠폰 2장이 지급됩니다.`;
    } else {
        reward = 0;
        resultMessage = `😥 아쉬워요. ${finalClicks}회 클릭. 다음 기회에 도전하세요!`;
    }

    couponCount += reward;
    couponElement.innerText = couponCount;
    message.innerText = resultMessage;
    alert(resultMessage);
}


/**
 * 비수요 시간 쿠폰 버튼 활성화/비활성화 체크
 */
function checkNonSuccessTime() {
    const now = new Date();
    const hour = now.getHours();
    const couponButton = document.querySelector('.event-button.nonsuccess');
    
    if (hour >= 14 && hour < 16) {
        couponButton.disabled = false;
        couponButton.style.backgroundColor = '#ff5722'; 
        couponButton.style.color = 'white'; 
        couponButton.innerText = `🔥 지금 바로 쿠폰 받기! (${hour}시)`;
    } else {
        couponButton.disabled = true;
        couponButton.style.backgroundColor = '#ccc'; 
        couponButton.style.color = '#777';
        couponButton.innerText = `⏳ 비수요 시간 쿠폰 받기 (현재 ${hour}시)`;
    }
}