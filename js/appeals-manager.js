// Менеджер аппеляций
class AppealsManager {
    
    // Функция для показа формы аппеляции (переадресация на модальное окно)
    static showAppealForm(errorId) {
        // Используем новое модальное окно
        if (window.appealModal) {
            window.appealModal.open(errorId);
        } else {
            // Fallback на старый способ, если модальное окно не загружено
            const form = document.getElementById(`appeal-form-${errorId}`);
            if (form) {
                form.classList.add('show');
                const input = document.getElementById(`appeal-input-${errorId}`);
                if (input) {
                    input.focus();
                }
            }
        }
    }
    
    // Функция для отправки аппеляции
    static submitAppeal(errorId) {
        const input = document.getElementById(`appeal-input-${errorId}`);
        const form = document.getElementById(`appeal-form-${errorId}`);
        
        if (!input || !form) return;
        
        const appealText = input.value.trim();
        if (!appealText) {
            alert('Пожалуйста, введите текст аппеляции');
            return;
        }
        
        // Получаем прикрепленные файлы
        const attachedFiles = window.getAttachedFiles ? window.getAttachedFiles(form) : [];
        
        // Находим ошибку в данных
        const error = window.currentOperatorErrors.find(err => err.id === errorId);
        if (!error) return;
        
        // Создаем новую аппеляцию
        const now = new Date();
        const dateStr = now.toLocaleDateString('ru-RU');
        const timeStr = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        const newAppeal = {
            id: Date.now(), // Используем timestamp как ID
            date: `${dateStr} ${timeStr}`,
            text: appealText,
            status: 'pending', // pending, approved, rejected
            files: attachedFiles.map(fileData => ({
                name: fileData.name,
                size: fileData.size,
                type: fileData.type,
                id: fileData.id
            }))
        };
        
        // Добавляем аппеляцию к ошибке
        if (!error.appeals) {
            error.appeals = [];
        }
        error.appeals.push(newAppeal);
        
        // Очищаем форму и прикрепленные файлы
        input.value = '';
        if (window.clearAttachedFiles) {
            window.clearAttachedFiles(form);
        }
        
        // Перерендериваем список ошибок
        renderOperatorErrors(window.currentOperatorErrors);
        
        // Показываем уведомление
        const fileCountText = attachedFiles.length > 0 ? ` с ${attachedFiles.length} файлом(ами)` : '';
        this.showNotification(`Аппеляция${fileCountText} отправлена на рассмотрение`, 'info');
        
        console.log(`Отправлена аппеляция для ошибки ${errorId}: ${appealText}`);
    }
    
    // Функция для отмены аппеляции
    static cancelAppeal(errorId) {
        const form = document.getElementById(`appeal-form-${errorId}`);
        const input = document.getElementById(`appeal-input-${errorId}`);
        
        if (form && input) {
            form.classList.remove('show');
            input.value = '';
            
            // Очищаем прикрепленные файлы
            if (window.clearAttachedFiles) {
                window.clearAttachedFiles(form);
            }
        }
    }
    
    // Функция для показа уведомления (копия из main.html)
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="material-icons">${type === 'info' ? 'info' : 'warning'}</span>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'info' ? '#e3f2fd' : '#fff3e0'};
            color: ${type === 'info' ? '#1976d2' : '#f57c00'};
            border: 1px solid ${type === 'info' ? '#bbdefb' : '#ffcc02'};
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
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Делаем функции глобальными для вызова из HTML
window.showAppealForm = AppealsManager.showAppealForm;
window.submitAppeal = AppealsManager.submitAppeal;
window.cancelAppeal = AppealsManager.cancelAppeal;
