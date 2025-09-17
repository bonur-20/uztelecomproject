/**
 * Управление модальным окном с информацией об операторе
 */

document.addEventListener('DOMContentLoaded', function() {
    // Элементы модального окна
    const modal = document.getElementById('operator-info-modal');
    const modalOverlay = document.getElementById('operator-info-modal-overlay');
    const modalClose = document.getElementById('operator-info-modal-close');
    const infoIcon = document.querySelector('.info-icon');
    
    // Данные для разных операторов (пример)
    const operatorInfoData = {
        "Riskiyev Bonur Boxodir o'g'li (0485)": [
            "* 05.08.2025 — недоработка 0 минут; перерыв превышен на 1 час 57 минут;",
            "* 07.08.2025 — недоработка 9 минут; перерыв превышен на 6 часов 16 минут;",
            "* 08.08.2025 — недоработка 12 часов;",
            "* 09.08.2025 — недоработка 0 минут; перерыв превышен на 1 час 57 минут;",
            "* 12.08.2025 — недоработка 9 минут; перерыв превышен на 6 часов 16 минут;",
            "* 13.08.2025 — недоработка 1 минута; перерыв превышен на 3 часа 47 минут;",
            "* 14.08.2025 — перерыв превышен, учитываем от 01:30: 17 минут;",
            "* 16.08.2025 — перерыв превышен, учитываем от 01:30: 16 минут"
        ],
        "Abdug'aniyev Abdulaziz Abdug'ofur o'g'li (358)": [
            "* 01.08.2025 — недоработка 2 часа 15 минут;",
            "* 03.08.2025 — перерыв превышен на 45 минут;",
            "* 05.08.2025 — недоработка 30 минут; перерыв превышен на 1 час 20 минут;",
            "* 08.08.2025 — недоработка 4 часа 30 минут;",
            "* 10.08.2025 — перерыв превышен на 2 часа 10 минут;"
        ],
        "Ahmadova Xilola Mahmud qizi (0256)": [
            "* 02.08.2025 — недоработка 1 час 45 минут;",
            "* 04.08.2025 — перерыв превышен на 3 часа 25 минут;",
            "* 06.08.2025 — недоработка 15 минут;",
            "* 09.08.2025 — недоработка 2 часа; перерыв превышен на 1 час 15 минут;"
        ]
    };
    
    // Функция открытия модального окна
    function openModal() {
        if (!modal) return;
        
        // Получаем информацию о выбранном операторе
        const selectedOperator = document.querySelector('.otrabotki-operator-item.selected');
        let operatorName = "Текущий оператор";
        let operatorData = operatorInfoData["Riskiyev Bonur Boxodir o'g'li (0485)"]; // По умолчанию
        
        if (selectedOperator) {
            const nameElement = selectedOperator.querySelector('.otrabotki-operator-name');
            if (nameElement) {
                operatorName = nameElement.textContent.trim();
                // Ищем данные для этого оператора
                if (operatorInfoData[operatorName]) {
                    operatorData = operatorInfoData[operatorName];
                }
            }
        }
        
        // Обновляем заголовок модального окна
        const modalTitle = modal.querySelector('.operator-info-modal-title');
        if (modalTitle) {
            const violationCount = operatorData.length;
            modalTitle.textContent = `Подробная информация (${violationCount} нарушений)`;
        }
        
        // Обновляем содержимое модального окна
        const detailsContainer = modal.querySelector('.operator-info-details');
        if (detailsContainer) {
            detailsContainer.innerHTML = operatorData.map(item => `<p>${item}</p>`).join('');
        }
        
        // Показываем модальное окно
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    // Функция закрытия модального окна
    function closeModal() {
        if (!modal) return;
        
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // Функция toggle модального окна
    function toggleModal() {
        if (!modal) return;
        
        // Проверяем, открыто ли модальное окно
        if (modal.classList.contains('show')) {
            closeModal();
        } else {
            openModal();
        }
    }
    
    // Обработчик клика по иконке информации (toggle)
    if (infoIcon) {
        infoIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleModal();
        });
    }
    
    // Обработчик клика по кнопке закрытия
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Обработчик клика по оверлею
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
    
    // Обработчик нажатия Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeModal();
        }
    });
    
    // Экспортируем функции в глобальную область для использования из других скриптов
    window.openOperatorInfoModal = openModal;
    window.closeOperatorInfoModal = closeModal;
    window.toggleOperatorInfoModal = toggleModal;
    
    console.log('Модальное окно информации об операторе инициализировано');
});
