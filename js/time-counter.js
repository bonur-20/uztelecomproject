/**
 * Файл для работы с круговым счетчиком времени
 */

// Глобальные переменные для отслеживания времени
let currentOperatorHours = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация счетчика времени
    initTimeCounter();
    
    // Убираем автоматическое обновление времени, так как оно должно быть статичным
    // setInterval(updateTimeCounter, 1000);
    
    // Слушаем изменения выбранного оператора
    document.addEventListener('operatorSelected', function(event) {
        const operatorData = event.detail;
        updateOperatorTime(operatorData);
    });
});

/**
 * Преобразование часов в формат ЧЧ:ММ:СС
 * @param {number} hours - Количество часов (например, 8.5 или 25.5)
 * @returns {string} Время в формате ЧЧ:ММ:СС
 */
function hoursToTimeFormat(hours) {
    const totalMinutes = Math.floor(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const s = Math.floor((hours * 3600) % 60);
    
    // Поддержка отображения времени более 24 часов
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Получение данных времени от выбранного оператора
 */
function getOperatorTimeData() {
    // Попробуем найти выбранного оператора
    const selectedOperatorItem = document.querySelector('.otrabotki-operator-item.selected');
    
    if (selectedOperatorItem) {
        const operatorHoursElement = selectedOperatorItem.querySelector('.otrabotki-operator-hours');
        if (operatorHoursElement) {
            const hoursText = operatorHoursElement.textContent.trim();
            // Извлекаем число из текста "8.5 ч." или "8 ч."
            const hoursMatch = hoursText.match(/([\d.]+)\s*ч/);
            if (hoursMatch) {
                return parseFloat(hoursMatch[1]);
            }
        }
    }
    
    // Альтернативный способ - из глобальных данных операторов
    const selectedOperatorIndex = parseInt(selectedOperatorItem?.getAttribute('data-idx'));
    if (!isNaN(selectedOperatorIndex) && window.otrabotkiOperators && window.otrabotkiOperators[selectedOperatorIndex]) {
        const operator = window.otrabotkiOperators[selectedOperatorIndex];
        return operator.hours || 0;
    }
    
    return 0;
}

/**
 * Инициализация счетчика времени
 */
function initTimeCounter() {
    console.log('Инициализация кругового счетчика времени');
    
    // Получаем данные времени от выбранного оператора
    currentOperatorHours = getOperatorTimeData();
    
    // Устанавливаем статичное время на основе часов оператора
    const timeDisplay = document.querySelector('.time-counter-value');
    if (timeDisplay && currentOperatorHours > 0) {
        const timeString = hoursToTimeFormat(currentOperatorHours);
        timeDisplay.textContent = timeString;
    } else if (timeDisplay) {
        timeDisplay.textContent = '00:00:00';
    }
    
    // Обновляем круг прогресса
    updateProgressDisplay();
}

/**
 * Обновление времени оператора
 * @param {Object} operatorData - Данные оператора
 */
function updateOperatorTime(operatorData) {
    if (operatorData && operatorData.hours !== undefined) {
        currentOperatorHours = operatorData.hours;
        
        // Устанавливаем статичное время оператора
        const timeDisplay = document.querySelector('.time-counter-value');
        if (timeDisplay) {
            timeDisplay.textContent = hoursToTimeFormat(currentOperatorHours);
        }
        
        // Обновляем прогресс
        updateProgressDisplay();
    }
}

/**
 * Обновление отображения прогресса
 */
function updateProgressDisplay() {
    // Каждый круг представляет 24 часа
    const hoursPerRing = 24;
    
    // Вычисляем прогресс для внешнего кольца (первые 24 часа)
    const outerProgress = Math.min(currentOperatorHours / hoursPerRing, 1);
    
    // Вычисляем прогресс для внутреннего кольца (следующие 24 часа)
    const innerProgress = currentOperatorHours > hoursPerRing ? 
        Math.min((currentOperatorHours - hoursPerRing) / hoursPerRing, 1) : 0;
    
    console.log(`Обновление прогресса: ${currentOperatorHours} часов`);
    console.log(`Внешний круг: ${(outerProgress * 100).toFixed(1)}%`);
    console.log(`Внутренний круг: ${(innerProgress * 100).toFixed(1)}%`);
    
    // Обновляем кольца прогресса
    updateProgressRings(outerProgress, innerProgress);
}

/**
 * Обновление кругового индикатора прогресса для двух колец
 * @param {number} outerProgress - Значение прогресса внешнего кольца от 0 до 1
 * @param {number} innerProgress - Значение прогресса внутреннего кольца от 0 до 1
 */
function updateProgressRings(outerProgress, innerProgress) {
    const outerProgressCircle = document.querySelector('.progress-ring-circle');
    const innerProgressCircle = document.querySelector('.progress-ring-inner');
    
    // Обновляем внешнее кольцо
    if (outerProgressCircle) {
        updateRing(outerProgressCircle, outerProgress);
    }
    
    // Обновляем внутреннее кольцо
    if (innerProgressCircle) {
        updateRing(innerProgressCircle, innerProgress);
    }
}

/**
 * Обновление отдельного кольца прогресса
 * @param {Element} ring - SVG элемент кольца
 * @param {number} progress - Значение прогресса от 0 до 1
 */
function updateRing(ring, progress) {
    // Получаем радиус круга
    const radius = ring.getAttribute('r');
    
    // Вычисляем длину окружности
    const circumference = 2 * Math.PI * radius;
    
    // Вычисляем offset для stroke-dashoffset
    const offset = circumference * (1 - progress);
    
    // Устанавливаем новое значение
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${offset}`;
}

/**
 * Тестовая функция для проверки различных значений времени
 * Можно вызывать из консоли: testTimeDisplay(25.5) для 25.5 часов
 */
function testTimeDisplay(hours) {
    currentOperatorHours = hours;
    const timeDisplay = document.querySelector('.time-counter-value');
    if (timeDisplay) {
        timeDisplay.textContent = hoursToTimeFormat(hours);
    }
    updateProgressDisplay();
    console.log(`Тестирование: ${hours} часов = ${hoursToTimeFormat(hours)}`);
}

// Экспортируем функции в глобальный объект для использования из других скриптов
window.updateOperatorTime = updateOperatorTime;
window.initTimeCounter = initTimeCounter;
window.updateProgressRings = updateProgressRings;
window.testTimeDisplay = testTimeDisplay;
