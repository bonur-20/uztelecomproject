/**
 * Скрипт для инициализации всплывающих подсказок для расписания
 * Использует подход с DOM-элементами вместо CSS псевдоэлементов
 */
document.addEventListener('DOMContentLoaded', function() {
    // Создаем контейнер для всплывающих подсказок
    createTooltipContainer();
    
    // Инициализируем подсказки
    initScheduleTooltips();
    
    // Также инициализируем при динамическом обновлении содержимого
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (document.querySelector('.schedule-label')) {
                initScheduleTooltips();
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});

// Создание контейнера для всплывающих подсказок
function createTooltipContainer() {
    // Проверяем, нет ли уже контейнера
    if (document.getElementById('schedule-tooltip-container')) {
        return;
    }
    
    const tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'schedule-tooltip-container';
    tooltipContainer.className = 'schedule-tooltip-container';
    document.body.appendChild(tooltipContainer);
    
    console.log('Создан контейнер для всплывающих подсказок расписания');
}

// Инициализация всплывающих подсказок
function initScheduleTooltips() {
    console.log('Инициализация всплывающих подсказок для расписания...');
    
    // Находим все элементы с классом schedule-label
    const scheduleLabels = document.querySelectorAll('.schedule-label');
    
    // Получаем контейнер для всплывающих подсказок
    const tooltipContainer = document.getElementById('schedule-tooltip-container');
    
    if (!tooltipContainer) {
        console.error('Контейнер для всплывающих подсказок не найден!');
        return;
    }
    
    // Для каждого элемента добавляем обработчики событий
    scheduleLabels.forEach(function(label) {
        const fullText = label.textContent.trim();
        
        // Удаляем предыдущие обработчики, если они есть
        label.removeEventListener('mouseenter', showTooltip);
        label.removeEventListener('mouseleave', hideTooltip);
        
        // Добавляем новые обработчики
        label.addEventListener('mouseenter', showTooltip);
        label.addEventListener('mouseleave', hideTooltip);
        
        // Сохраняем полный текст как атрибут
        label.setAttribute('data-full-text', fullText);
    });
    
    console.log(`Всплывающие подсказки инициализированы для ${scheduleLabels.length} элементов`);
}

// Показ всплывающей подсказки
function showTooltip(event) {
    const label = event.target;
    const fullText = label.getAttribute('data-full-text');
    const tooltipContainer = document.getElementById('schedule-tooltip-container');
    
    if (!tooltipContainer || !fullText) return;
    
    console.log('Показываем подсказку:', fullText);
    
    // Устанавливаем текст подсказки
    tooltipContainer.textContent = fullText;
    
    // Получаем позицию элемента
    const rect = label.getBoundingClientRect();
    
    // Устанавливаем позицию подсказки
    tooltipContainer.style.left = `${rect.left}px`;
    tooltipContainer.style.top = `${rect.bottom + 10}px`; // 10px отступ от элемента
    
    // Делаем подсказку видимой
    tooltipContainer.classList.add('visible');
}

// Скрытие всплывающей подсказки
function hideTooltip() {
    const tooltipContainer = document.getElementById('schedule-tooltip-container');
    
    if (tooltipContainer) {
        tooltipContainer.classList.remove('visible');
    }
}
