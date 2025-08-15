// slider-tooltip.js
// Управление tooltip для слайдера обучения

class SliderTooltip {
    constructor() {
        this.initialized = false;
        this.init();
    }

    init() {
        // Ожидаем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupTooltip());
        } else {
            this.setupTooltip();
        }

        // Наблюдение за изменениями DOM для динамически добавленных элементов
        this.observeDOM();
    }

    setupTooltip() {
        const toggle = document.getElementById('training-date-toggle');
        if (!toggle) {
            console.log('Slider tooltip: toggle not found, retrying...');
            setTimeout(() => this.setupTooltip(), 500);
            return;
        }

        const slider = toggle.nextElementSibling;
        if (!slider || !slider.classList.contains('slider')) {
            console.log('Slider tooltip: slider element not found');
            return;
        }

        // Проверяем, есть ли уже tooltip
        let tooltip = slider.querySelector('.slider-tooltip');
        if (!tooltip) {
            // Создаем tooltip если его нет
            tooltip = document.createElement('div');
            tooltip.className = 'slider-tooltip';
            tooltip.innerHTML = '<span class="tooltip-text">Допущенные ошибки</span>';
            slider.appendChild(tooltip);
        }

        // Устанавливаем начальное состояние
        this.updateTooltip(toggle);

        // Добавляем обработчик изменения состояния
        toggle.addEventListener('change', () => this.updateTooltip(toggle));
        
        // Добавляем обработчик клика по слайдеру
        slider.addEventListener('click', () => {
            // Небольшая задержка, чтобы состояние toggle успело измениться
            setTimeout(() => this.updateTooltip(toggle), 10);
        });
        
        // Добавляем обработчик клика по switch контейнеру
        const switchContainer = toggle.closest('.switch');
        if (switchContainer) {
            switchContainer.addEventListener('click', () => {
                setTimeout(() => this.updateTooltip(toggle), 10);
            });
        }

        this.initialized = true;
        console.log('Slider tooltip: initialized successfully');
    }

    updateTooltip(toggle) {
        const tooltipText = document.querySelector('.slider-tooltip .tooltip-text');
        if (!tooltipText) {
            console.log('Slider tooltip: tooltip text element not found');
            return;
        }

        console.log('Slider tooltip: updating, toggle.checked =', toggle.checked);
        
        if (toggle.checked) {
            tooltipText.textContent = 'Необученные звонки';
            console.log('Slider tooltip: set to "Необученные звонки"');
        } else {
            tooltipText.textContent = 'Допущенные ошибки';
            console.log('Slider tooltip: set to "Допущенные ошибки"');
        }
    }

    observeDOM() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const hasToggle = mutation.target.querySelector('#training-date-toggle');
                    if (hasToggle && !this.initialized) {
                        console.log('Slider tooltip: detected toggle in DOM');
                        setTimeout(() => this.setupTooltip(), 100);
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Инициализируем tooltip при загрузке
const sliderTooltip = new SliderTooltip();

// Экспортируем глобальную функцию для обновления tooltip
window.updateSliderTooltip = function() {
    const toggle = document.getElementById('training-date-toggle');
    if (toggle && sliderTooltip) {
        sliderTooltip.updateTooltip(toggle);
    }
};
