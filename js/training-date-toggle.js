// training-date-toggle.js
// Слайдер работает независимо, не влияет на отображение даты

let toggleInitialized = false;

function initTrainingDateToggle() {
    console.log('🔄 Попытка инициализации слайдера...');
    
    const toggle = document.getElementById('training-date-toggle');
    
    console.log('Toggle element:', toggle);
    
    if (!toggle) {
        console.log('❌ Слайдер не найден');
        const allToggles = document.querySelectorAll('input[type="checkbox"]');
        console.log('Найдено checkbox элементов:', allToggles.length);
        return false;
    }

    console.log('✅ Слайдер найден, инициализируем...');

    // Проверяем, не инициализирован ли уже
    if (toggle.dataset.initialized === 'true') {
        console.log('⚠️ Слайдер уже инициализирован');
        return true;
    }

    // Сохраняем состояние в localStorage
    const saved = localStorage.getItem('training-date-toggle');
    if (saved === 'off') {
        toggle.checked = false;
        console.log('📱 Восстановлено состояние: ВЫКЛЮЧЕН');
    } else {
        toggle.checked = true;
        console.log('📱 Восстановлено состояние: ВКЛЮЧЕН');
    }

    // Функция переключения состояния
    function toggleState() {
        console.log('🎛️ Переключение слайдера...');
        toggle.checked = !toggle.checked;
        
        if (toggle.checked) {
            localStorage.setItem('training-date-toggle', 'on');
            console.log('✅ Слайдер включен');
        } else {
            localStorage.setItem('training-date-toggle', 'off');
            console.log('❌ Слайдер выключен');
        }
        
        // Обновляем tooltip
        if (window.updateSliderTooltip) {
            window.updateSliderTooltip();
        }
    }

    // Обработчик изменения checkbox
    function handleToggleChange(e) {
        console.log('🎛️ Change event:', e.target.checked);
        const isChecked = e.target.checked;
        
        if (isChecked) {
            localStorage.setItem('training-date-toggle', 'on');
            console.log('✅ Слайдер включен (change)');
        } else {
            localStorage.setItem('training-date-toggle', 'off');
            console.log('❌ Слайдер выключен (change)');
        }
        
        // Обновляем tooltip
        if (window.updateSliderTooltip) {
            window.updateSliderTooltip();
        }
    }
    
    // Убираем старые обработчики
    toggle.removeEventListener('change', handleToggleChange);
    toggle.removeEventListener('click', toggleState);
    
    // Находим элемент слайдера
    const slider = toggle.nextElementSibling;
    if (slider && slider.classList.contains('slider')) {
        slider.removeEventListener('click', toggleState);
        // Добавляем обработчик клика на визуальный слайдер
        slider.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleState();
        });
        console.log('✅ Обработчик клика добавлен на слайдер');
    }
    
    // Добавляем обработчики на checkbox
    toggle.addEventListener('change', handleToggleChange);
    
    // Добавляем клик на родительский switch контейнер
    const switchContainer = toggle.closest('.switch');
    if (switchContainer) {
        switchContainer.addEventListener('click', function(e) {
            console.log('🎛️ Клик по switch контейнеру');
            if (e.target === switchContainer || e.target === slider) {
                e.preventDefault();
                toggleState();
            }
        });
        console.log('✅ Обработчик добавлен на switch контейнер');
    }
    
    // Помечаем как инициализированный
    toggle.dataset.initialized = 'true';
    toggleInitialized = true;
    
    // Обновляем tooltip при инициализации
    if (window.updateSliderTooltip) {
        setTimeout(() => window.updateSliderTooltip(), 100);
    }
    
    console.log('✅ Слайдер инициализирован успешно (независимо от даты)');
    return true;
}

// Универсальная функция инициализации с повторными попытками
function tryInitSlider(attempts = 0) {
    const maxAttempts = 10;
    
    if (attempts >= maxAttempts) {
        console.log('❌ Не удалось инициализировать слайдер после', maxAttempts, 'попыток');
        return;
    }
    
    if (initTrainingDateToggle()) {
        console.log('✅ Слайдер инициализирован с попытки', attempts + 1);
        return;
    }
    
    // Повторяем через 200ms
    setTimeout(() => {
        tryInitSlider(attempts + 1);
    }, 200);
}

// Делаем функции глобальными
window.initTrainingDateToggle = initTrainingDateToggle;
window.tryInitSlider = tryInitSlider;

// Инициализируем при загрузке документа
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM загружен, запускаем инициализацию слайдера...');
    setTimeout(() => {
        tryInitSlider();
    }, 500);
});

// Дополнительная инициализация при клике на оператора
document.addEventListener('click', function(e) {
    if (e.target.closest('.operator-item')) {
        console.log('👤 Выбран оператор, повторная инициализация слайдера...');
        setTimeout(() => {
            if (!toggleInitialized) {
                tryInitSlider();
            }
        }, 300);
    }
});

// Инициализация при любом изменении DOM в области деталей оператора
const observeOperatorDetails = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            const hasToggle = mutation.target.querySelector('#training-date-toggle');
            if (hasToggle && !toggleInitialized) {
                console.log('🔍 Обнаружен слайдер в DOM, инициализируем...');
                setTimeout(() => {
                    tryInitSlider();
                }, 100);
            }
        }
    });
});

// Начинаем наблюдение за изменениями в body
setTimeout(() => {
    observeOperatorDetails.observe(document.body, {
        childList: true,
        subtree: true
    });
}, 1000);
