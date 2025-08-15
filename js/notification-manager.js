/**
 * Менеджер уведомлений
 * Отвечает за показ уведомлений пользователю
 */

const NotificationManager = {
    /**
     * Показать уведомление
     * @param {string} message - Текст сообщения
     * @param {string} type - Тип уведомления ('info', 'warning', 'error')
     */
    show: function(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="material-icons">${this.getIcon(type)}</span>
            <span>${message}</span>
        `;
        
        // Применяем стили
        this.applyStyles(notification, type);
        
        // Добавляем CSS анимацию если её нет
        this.ensureAnimationStyles();
        
        document.body.appendChild(notification);
        
        // Автоматически убираем уведомление
        setTimeout(() => {
            this.hide(notification);
        }, AppConfig.notifications.duration);
    },
    
    /**
     * Получить иконку для типа уведомления
     * @param {string} type - Тип уведомления
     * @returns {string} - Название иконки Material Icons
     */
    getIcon: function(type) {
        const icons = {
            'info': 'info',
            'warning': 'warning',
            'error': 'error',
            'success': 'check_circle'
        };
        return icons[type] || 'info';
    },
    
    /**
     * Применить стили к уведомлению
     * @param {HTMLElement} notification - Элемент уведомления
     * @param {string} type - Тип уведомления
     */
    applyStyles: function(notification, type) {
        const colors = {
            'info': { bg: '#e3f2fd', color: '#1976d2', border: '#bbdefb' },
            'warning': { bg: '#fff3e0', color: '#f57c00', border: '#ffcc02' },
            'error': { bg: '#ffebee', color: '#d32f2f', border: '#e57373' },
            'success': { bg: '#e8f5e8', color: '#388e3c', border: '#a5d6a7' }
        };
        
        const colorSet = colors[type] || colors['info'];
        
        notification.style.cssText = `
            position: fixed;
            top: ${AppConfig.notifications.position.top};
            right: ${AppConfig.notifications.position.right};
            background: ${colorSet.bg};
            color: ${colorSet.color};
            border: 1px solid ${colorSet.border};
            border-radius: 8px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-size: 14px;
        `;
    },
    
    /**
     * Скрыть уведомление с анимацией
     * @param {HTMLElement} notification - Элемент уведомления
     */
    hide: function(notification) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    },
    
    /**
     * Убедиться, что CSS анимации загружены
     */
    ensureAnimationStyles: function() {
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// Экспорт для использования в других модулях
window.NotificationManager = NotificationManager;
