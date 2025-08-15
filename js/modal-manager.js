/**
 * Менеджер модальных окон
 * Отвечает за создание и управление модальными окнами
 */

const ModalManager = {
    /**
     * Показать модальное окно подтверждения
     * @param {string} title - Заголовок окна
     * @param {string} message - Текст сообщения
     * @param {string} confirmText - Текст кнопки подтверждения
     * @param {string} cancelText - Текст кнопки отмены
     * @returns {Promise<boolean>} - Promise с результатом (true - подтвердить, false - отменить)
     */
    showConfirm: function(title, message, confirmText = 'Да', cancelText = 'Отмена') {
        return new Promise((resolve) => {
            // Создаем модальное окно
            const modal = document.createElement('div');
            modal.className = 'custom-modal';
            
            modal.innerHTML = `
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <div class="custom-modal-icon">
                            <span class="material-icons">warning</span>
                        </div>
                        <h3 class="custom-modal-title">${title}</h3>
                    </div>
                    <div class="custom-modal-text">${message}</div>
                    <div class="custom-modal-buttons">
                        <button class="custom-modal-btn custom-modal-btn-cancel" data-action="cancel">
                            ${cancelText}
                        </button>
                        <button class="custom-modal-btn custom-modal-btn-confirm" data-action="confirm">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            
            // Добавляем модальное окно на страницу
            document.body.appendChild(modal);
            
            // Обработчики событий
            const handleClick = (e) => {
                const action = e.target.getAttribute('data-action');
                if (action === 'confirm') {
                    this.closeModal(modal, resolve, true);
                } else if (action === 'cancel') {
                    this.closeModal(modal, resolve, false);
                }
            };
            
            const handleKeydown = (e) => {
                if (e.key === 'Escape') {
                    this.closeModal(modal, resolve, false);
                } else if (e.key === 'Enter') {
                    this.closeModal(modal, resolve, true);
                }
            };
            
            // Добавляем обработчики
            modal.addEventListener('click', (e) => {
                // Закрываем при клике на фон
                if (e.target === modal) {
                    this.closeModal(modal, resolve, false);
                }
            });
            
            modal.addEventListener('click', handleClick);
            document.addEventListener('keydown', handleKeydown);
            
            // Фокус на кнопке отмены по умолчанию
            setTimeout(() => {
                const cancelBtn = modal.querySelector('[data-action="cancel"]');
                if (cancelBtn) {
                    cancelBtn.focus();
                }
            }, 100);
            
            // Сохраняем обработчик для последующего удаления
            modal._keydownHandler = handleKeydown;
        });
    },
    
    /**
     * Закрыть модальное окно
     * @param {HTMLElement} modal - Элемент модального окна
     * @param {Function} resolve - Функция разрешения Promise
     * @param {boolean} result - Результат
     */
    closeModal: function(modal, resolve, result) {
        // Анимация закрытия
        modal.style.animation = 'modalFadeOut 0.3s ease';
        const content = modal.querySelector('.custom-modal-content');
        content.style.animation = 'modalSlideOut 0.3s ease';
        
        setTimeout(() => {
            document.body.removeChild(modal);
            if (modal._keydownHandler) {
                document.removeEventListener('keydown', modal._keydownHandler);
            }
            resolve(result);
        }, 300);
    }
};

// Экспорт для использования в других модулях
window.ModalManager = ModalManager;
