// === Динамический расчет процентов для топ-3 критериев ===
document.addEventListener('DOMContentLoaded', function() {
    // Массив всех 11 критериев (примерные значения, заменить на реальные при необходимости)
    const allCriteria = [92, 88, 75, 70, 68, 65, 60, 58, 55, 50, 45];
    // Топ-3 критерии (первые три)
    const topCriteria = allCriteria.slice(0, 3);
    const total = allCriteria.reduce((sum, val) => sum + val, 0);
    // Находим все .percentage-badge в таблице
    const badges = document.querySelectorAll('.criteria-table .percentage-badge');
    badges.forEach((badge, idx) => {
        if (idx < topCriteria.length) {
            const percent = ((topCriteria[idx] / total) * 100).toFixed(1);
            badge.textContent = percent + '%';
        }
    });
});
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggle-password-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.src = 'assets/иконки/Visibility.png';
    } else {
        passwordInput.type = 'password';
        toggleIcon.src = 'assets/иконки/Visibility Lock.png';
    }
}

document.querySelector('.login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();
    if (login === '1' && password === '1') {
        window.location.href = 'main.html'; // Переход в главное меню
    } else {
        alert('Введите 1 для логина и пароля');
    }
});

// --- Фоны и цвета для смены ---
const backgrounds = [
    {
        url: "assets/фон/фон 1.jpg",
        main: "#003F7D",
        accent: "#1976d2",
        text: "#fff"
    },
    {
        url: "assets/фон/фон 2.png",
        main: "#2d3a4a",
        accent: "#4a90e2",
        text: "#f0f0f0"
    },
    {
        url: "assets/фон/фон 4.png",
        main: "#2d3a4a",
        accent: "#4a90e2",
        text: "#f0f0f0"
    },
    {
        url: "assets/фон/фон 5.png",
        main: "#2d3a4a",
        accent: "#4a90e2",
        text: "#f0f0f0"
    },
    {
        url: "assets/фон/фон 6.png",
        main: "#2d3a4a",
        accent: "#4a90e2",
        text: "#f0f0f0"
    },
    {
        url: "assets/фон/фон 7.png",
        main: "#2d3a4a",
        accent: "#4a90e2",
        text: "#f0f0f0"
    },
     {
        url: "assets/фон/фон 9.jpg",
        main: "#8a7bbd",      // фиолетово-синий, как небо на фото
        accent: "#3a6fa1",    // голубой
        text: "#fff"
    },
     {
        url: "assets/фон/фон 10.jpg",
        main: "#2d3a4a",
        accent: "#4a90e2",
        text: "#f0f0f0"
    },
     {
        url: "assets/фон/фон 11.jpg",
        main: "#003F7D",
        accent: "#1976d2",
        text: "#fff"
    },
     {
        url: "assets/фон/фон 12.jpg",
        main: "#2d3a4a",
        accent: "#4a90e2",
        text: "#f0f0f0"
    },
];
let bgIndex = 0;

function setTheme(theme) {
    // Меняем фон
    document.querySelector('.background').style.backgroundImage = `url('${theme.url}')`;
    // Меняем цвета основных элементов
    document.body.style.background = theme.main;
    document.querySelector('.header').style.background = theme.main;
    document.querySelector('.header').style.color = theme.text;
    document.querySelector('.login-container').style.background = theme.main + 'cc';
    document.querySelector('.login-form button').style.background = theme.accent;
    document.querySelector('.login-form button').style.color = theme.text;
    document.querySelector('.welcome-title').style.color = theme.text;
    // Footer
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.style.background = theme.main;
        footer.style.color = theme.text;
    }
}

// Клик по логотипу — смена темы
const logo = document.querySelector('.logo');
if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', function() {
        bgIndex = (bgIndex + 1) % backgrounds.length;
        setTheme(backgrounds[bgIndex]);
    });
}

// Установить первую тему при загрузке
setTheme(backgrounds[0]);

// SVG bell icon for notifications
const notificationLink = document.querySelector('.sidebar-menu-figma a:nth-child(3)');
if (notificationLink) {
    // Remove old icon
    const oldIcon = notificationLink.querySelector('.material-icons');
    if (oldIcon) oldIcon.remove();
    // Insert SVG bell
    const svgBell = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgBell.setAttribute('width', '24');
    svgBell.setAttribute('height', '24');
    svgBell.setAttribute('viewBox', '0 0 24 24');
    svgBell.setAttribute('fill', 'none');
    svgBell.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgBell.innerHTML = `<path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-5-6.32V4a1 1 0 1 0-2 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 16z" fill="#fff"/>`;
    svgBell.classList.add('sidebar-bell-svg');
    notificationLink.insertBefore(svgBell, notificationLink.firstChild);
}
// Add animation to badge if exists
const badge = document.querySelector('.sidebar-badge');
if (badge) {
    badge.classList.add('animated');
}

// Sidebar logo switcher for collapsed/expanded state
const sidebar = document.querySelector('.collapsible-sidebar');
const logoImg = document.querySelector('.sidebar-logo-img');

if (sidebar && logoImg) {
    function updateLogo() {
        // Проверяем, закреплен ли сайдбар
        const isPinned = sidebar.classList.contains('sidebar-pinned') || 
                        sidebar.classList.contains('sidebar-pinned-collapsed') || 
                        sidebar.classList.contains('sidebar-pinned-expanded');
        
        if (isPinned) {
            // Если сайдбар закреплен, не меняем логотип автоматически
            console.log('🔒 Сайдбар закреплен - логотип не изменяется автоматически');
            return;
        }
        
        if (sidebar.classList.contains('open')) {
            logoImg.src = 'assets/logo.png';
        } else {
            logoImg.src = 'assets/mini.png';
        }
    }
    
    function handleMouseEnter() {
        // Проверяем, закреплен ли сайдбар
        const isPinned = sidebar.classList.contains('sidebar-pinned') || 
                        sidebar.classList.contains('sidebar-pinned-collapsed') || 
                        sidebar.classList.contains('sidebar-pinned-expanded');
        
        if (!isPinned) {
            sidebar.classList.add('open');
            updateLogo();
        }
    }
    
    function handleMouseLeave() {
        // Проверяем, закреплен ли сайдбар
        const isPinned = sidebar.classList.contains('sidebar-pinned') || 
                        sidebar.classList.contains('sidebar-pinned-collapsed') || 
                        sidebar.classList.contains('sidebar-pinned-expanded');
        
        if (!isPinned) {
            sidebar.classList.remove('open');
            updateLogo();
        }
    }
    
    sidebar.addEventListener('mouseenter', handleMouseEnter);
    sidebar.addEventListener('mouseleave', handleMouseLeave);
    
    // Инициализация при загрузке
    updateLogo();
}

// --- Drag-resize и pin для блоков основной области ---

// Drag-resize
let dragBlock = null;
let startX, startY, startWidth, startHeight;

document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        dragBlock = this.closest('.draggable-block');
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(dragBlock).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(dragBlock).height, 10);
        document.documentElement.addEventListener('mousemove', resizeBlock, false);
        document.documentElement.addEventListener('mouseup', stopResizeBlock, false);
    });
});

function resizeBlock(e) {
    if (!dragBlock) return;
    dragBlock.style.width = (startWidth + e.clientX - startX) + 'px';
    dragBlock.style.height = (startHeight + e.clientY - startY) + 'px';
}
function stopResizeBlock() {
    document.documentElement.removeEventListener('mousemove', resizeBlock, false);
    document.documentElement.removeEventListener('mouseup', stopResizeBlock, false);
    dragBlock = null;
}

// Pin/Unpin

document.querySelectorAll('.pin-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const block = this.closest('.draggable-block');
        block.classList.toggle('pinned');
        this.classList.toggle('pinned');
    });
});
