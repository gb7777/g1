/**
 * SCRIPT INTERATIVO - ADVERTORIAL G1 PROSPERIDADE & FÉ
 * 
 * ATENÇÃO: Configure o seu link de checkout/vídeo na variável abaixo!
 */
const CONFIG = {
    // Link oficial de checkout Lastlink:
    CHECKOUT_URL: "https://lastlink.com/p/C29BA9D3C/checkout-payment/",
    
    // Intervalo de 10 minutos entre cada notificação de compra (em milissegundos)
    NOTIFICATION_INTERVAL: 10 * 60 * 1000
};

// ==========================================================================
// 1. INICIALIZAÇÃO E ATUALIZAÇÃO DE LINKS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    updateDates();
    setupCheckoutLinks();
    initLiveNotifications();
    initSpotsScarcity();
});

// ==========================================================================
// 1.1 CONTADOR DE ESCASSEZ DE VAGAS (25 DE 1.000 -> 1 EM 35 MINUTOS)
// ==========================================================================
function initSpotsScarcity() {
    const INITIAL_REMAINING = 25;
    const MIN_SPOTS = 1;
    const TOTAL_CAPACITY = 1000;
    const DURATION_MINUTES = 35;
    const TOTAL_DURATION_MS = DURATION_MINUTES * 60 * 1000;
    const STORAGE_KEY = 'g1_scarcity_start_time';

    let startTime = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    // Se não existir, define o horário inicial e não reinicia mais
    if (!startTime) {
        startTime = now.toString();
        localStorage.setItem(STORAGE_KEY, startTime);
    }

    const startTimestamp = parseInt(startTime, 10);

    function updateScarcity() {
        const elapsed = Math.max(0, Date.now() - startTimestamp);
        const progressRatio = Math.min(1, elapsed / TOTAL_DURATION_MS);
        
        // Vagas preenchidas das 24 restantes ao longo de 35m
        const additionalClaimed = Math.floor(progressRatio * (INITIAL_REMAINING - MIN_SPOTS));
        const spotsLeft = Math.max(MIN_SPOTS, INITIAL_REMAINING - additionalClaimed);

        // Preenchimento de 97.5% até 99.9%
        const totalClaimed = (TOTAL_CAPACITY - INITIAL_REMAINING) + additionalClaimed;
        const fillPercent = ((totalClaimed / TOTAL_CAPACITY) * 100).toFixed(1);

        const spotsCountElem = document.getElementById('spotsCount');
        const spotsProgressElem = document.getElementById('spotsProgress');

        if (spotsCountElem) {
            spotsCountElem.textContent = spotsLeft;
        }

        if (spotsProgressElem) {
            spotsProgressElem.style.width = `${fillPercent}%`;
        }
    }

    updateScarcity();
    setInterval(updateScarcity, 2000);
}

function setupCheckoutLinks() {
    // Aplica o link de checkout em todos os botões com a classe .checkout-link
    const links = document.querySelectorAll('.checkout-link');
    links.forEach(link => {
        link.href = CONFIG.CHECKOUT_URL;
    });
}

function scrollToVideo(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const target = document.getElementById('videoSection') || document.querySelector('.g1-video-block') || document.getElementById('scarcityBar');
    if (target) {
        const yOffset = -70; // Espaço para o cabeçalho fixo do G1
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });
    }
}

function playVslVideo() {
    const video = document.getElementById('vslVideo');
    const overlay = document.getElementById('vslOverlay');
    if (video) {
        video.muted = false;
        video.play().then(() => {
            if (overlay) overlay.classList.add('hidden');
        }).catch(err => {
            console.log("Autoplay policy triggered, attempting muted play first:", err);
            video.muted = true;
            video.play();
            if (overlay) overlay.classList.add('hidden');
        });
    }
}

function toggleMobileMenu() {
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer && overlay) {
        drawer.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// ==========================================================================
// 2. ATUALIZAÇÃO DINÂMICA DE DATAS (SEMPRE HOJE)
// ==========================================================================
function updateDates() {
    const now = new Date();
    
    // Formato DD/MM/AAAA
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(Math.max(0, now.getMinutes() - 18)).padStart(2, '0');
    
    const monthsPt = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Atualiza campo de data no topo da matéria
    const publishDateElem = document.getElementById('publish-date');
    if (publishDateElem) {
        publishDateElem.textContent = `${day}/${month}/${year} ${hours}h${minutes}`;
    }
    
    // Atualiza texto de hoje por extenso
    const fullDateElems = document.querySelectorAll('.today-full-date');
    fullDateElems.forEach(el => {
        el.textContent = `${day} de ${monthsPt[now.getMonth()]} de ${year}`;
    });
}

// ==========================================================================
// 3. FUNÇÃO COPIAR LINK
// ==========================================================================
function copyPageLink() {
    const dummy = document.createElement('input');
    dummy.value = window.location.href;
    document.body.appendChild(dummy);
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    
    const copyText = document.getElementById('copyText');
    if (copyText) {
        copyText.textContent = "Link copiado!";
        setTimeout(() => {
            copyText.textContent = "Copiar link";
        }, 3000);
    }
}

// ==========================================================================
// 4. PLAYER DE ÁUDIO SIMULADO / SÍNTESE DE VOZ
// ==========================================================================
let isPlayingAudio = false;

function toggleAudioMock() {
    const playIcon = document.getElementById('playIcon');
    const listenText = document.getElementById('listenText');
    
    if (!isPlayingAudio) {
        isPlayingAudio = true;
        playIcon.textContent = "⏸";
        listenText.textContent = "Reproduzindo áudio da matéria...";
        
        // Se o navegador suportar síntese de voz nativa:
        if ('speechSynthesis' in window) {
            const leadText = document.querySelector('.lead-paragraph')?.textContent || "Descoberta de oração milenar esquecida viraliza no Brasil.";
            const utterance = new SpeechSynthesisUtterance(leadText);
            utterance.lang = 'pt-BR';
            utterance.rate = 1.0;
            utterance.onend = () => {
                isPlayingAudio = false;
                playIcon.textContent = "▶";
                listenText.textContent = "Ouvir este texto (04:12)";
            };
            window.speechSynthesis.speak(utterance);
        }
    } else {
        isPlayingAudio = false;
        playIcon.textContent = "▶";
        listenText.textContent = "Ouvir este texto (04:12)";
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
}

// ==========================================================================
// 5. INTERATIVIDADE DE COMENTÁRIOS (CURTIDAS & ENVIO)
// ==========================================================================
function likeComment(button) {
    const likeCountElem = button.querySelector('.like-count');
    if (!likeCountElem) return;
    
    let count = parseInt(likeCountElem.textContent, 10);
    if (button.classList.contains('liked')) {
        button.classList.remove('liked');
        likeCountElem.textContent = count - 1;
    } else {
        button.classList.add('liked');
        likeCountElem.textContent = count + 1;
    }
}

function submitUserComment() {
    const textarea = document.getElementById('userComment');
    const commentText = textarea.value.trim();
    
    if (!commentText) {
        alert('Por favor, digite seu comentário antes de enviar.');
        return;
    }
    
    const commentsList = document.getElementById('commentsList');
    const commentCount = document.getElementById('comment-count');
    
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.innerHTML = `
        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80" alt="Avatar" class="avatar">
        <div class="comment-content">
            <div class="comment-author">
                <strong>Você</strong>
                <span class="badge-verified">Verificado</span>
            </div>
            <div class="comment-time">Agora mesmo</div>
            <p class="comment-text">${escapeHtml(commentText)}</p>
            <div class="comment-actions">
                <button class="like-btn" onclick="likeComment(this)"><span class="like-icon">👍</span> Curtir (<span class="like-count">1</span>)</button>
                <button class="reply-btn">Responder</button>
            </div>
        </div>
    `;
    
    commentsList.insertBefore(newComment, commentsList.firstChild);
    textarea.value = '';
    
    if (commentCount) {
        commentCount.textContent = parseInt(commentCount.textContent, 10) + 1;
    }
    
    alert('Comentário enviado com sucesso!');
}

function loadMoreComments() {
    alert('Carregando mais testemunhos...');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================================================
// 6. NOTIFICAÇÃO TOAST AO VIVO (PESSOAS ADQUIRINDO A ORAÇÃO)
// ==========================================================================
const purchaseNotifications = [
    { 
        name: "Maria de Fátima (São Paulo, SP)", 
        action: "acabou de adquirir a <strong>Oração Sagrada de São Miguel Arcanjo</strong>",
        time: "Há 12 segundos",
        avatar: "images/senhora-idosa.jpg"
    },
    { 
        name: "Carlos Eduardo (Curitiba, PR)", 
        action: "garantiu o <strong>Acesso Completo + Áudio da Revelação</strong>",
        time: "Há 28 segundos",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
    },
    { 
        name: "Dona Neusa (Belo Horizonte, MG)", 
        action: "acabou de adquirir a <strong>Oração e iniciou a Novena de 21 Dias</strong>",
        time: "Há 45 segundos",
        avatar: "images/mulher-vestido.png"
    },
    { 
        name: "Sebastião Gomes (Salvador, BA)", 
        action: "adquiriu a <strong>Oração Sagrada para a bênção do seu lar</strong>",
        time: "Há 1 minuto",
        avatar: "images/casal-idoso.jpg"
    },
    { 
        name: "Ana Paula Silva (Goiânia, GO)", 
        action: "acabou de garantir seu exemplar com <strong>Destravamento Financeiro</strong>",
        time: "Há 2 minutos",
        avatar: "images/mulher-jaleco.png"
    },
    { 
        name: "Francisca Ribeiro (Campinas, SP)", 
        action: "acabou de adquirir o <strong>Guia Sagrado de São Miguel Arcanjo</strong>",
        time: "Há 3 minutos",
        avatar: "images/mulher-enrolado.jpg"
    },
    { 
        name: "José Roberto (Fortaleza, CE)", 
        action: "garantiu o <strong>Acesso à Oração de São Miguel Arcanjo</strong>",
        time: "Há 4 minutos",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
    }
];

let notifIndex = 0;
let toastTimeout = null;

function initLiveNotifications() {
    const toast = document.getElementById('liveToast');
    const toastName = document.getElementById('toastName');
    const toastAction = document.getElementById('toastAction');
    const toastTime = document.getElementById('toastTime');
    const toastAvatar = document.getElementById('toastAvatar');
    
    if (!toast || !toastName) return;
    
    function showNextNotification() {
        const item = purchaseNotifications[notifIndex];
        
        if (toastName) toastName.textContent = item.name;
        if (toastAction) toastAction.innerHTML = item.action;
        if (toastTime) toastTime.textContent = item.time;
        if (toastAvatar && item.avatar) toastAvatar.src = item.avatar;
        
        toast.classList.add('show');
        
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 6000);
        
        notifIndex = (notifIndex + 1) % purchaseNotifications.length;
    }
    
    // Dispara a cada 10 minutos (CONFIG.NOTIFICATION_INTERVAL)
    setInterval(showNextNotification, CONFIG.NOTIFICATION_INTERVAL);
}

function closeToast() {
    const toast = document.getElementById('liveToast');
    if (toast) {
        toast.classList.remove('show');
        if (toastTimeout) clearTimeout(toastTimeout);
    }
}
