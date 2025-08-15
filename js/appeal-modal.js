// Менеджер модального окна аппеляций
class AppealModal {
    constructor() {
        this.modal = null;
        this.currentErrorId = null;
        this.maxCharacters = 1000;
        this.attachedFiles = [];
        this.maxFileSize = 15 * 1024 * 1024; // 15 МБ
        this.maxFiles = 5;
        this.allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'video/mp4', 'video/avi', 'video/mov'
        ];
        this.init();
    }

    init() {
        this.createModalHTML();
        this.setupEventListeners();
    }

    createModalHTML() {
        const modalHTML = `
            <div class="appeal-modal" id="appealModal">
                <div class="appeal-modal-container">
                    <div class="appeal-modal-header">
                        <div class="appeal-modal-title">
                            <span class="material-icons">gavel</span>
                            Подача аппеляции
                        </div>
                        <button class="appeal-modal-close" onclick="appealModal.close()">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                    
                    <div class="appeal-modal-body">
                        <!-- Информация об ошибке -->
                        <div class="appeal-error-info">
                            <div class="appeal-error-id" id="appealErrorId">
                                <span class="material-icons">error_outline</span>
                                <span>Ошибка не выбрана</span>
                            </div>
                            <div class="appeal-error-description" id="appealErrorDescription">
                                Описание ошибки не найдено
                            </div>
                        </div>
                        
                        <!-- Форма аппеляции -->
                        <div class="appeal-form">
                            <div class="appeal-form-title">
                                <span class="material-icons">edit</span>
                                Описание аппеляции
                            </div>
                            
                            <textarea 
                                class="appeal-textarea" 
                                id="appealTextarea"
                                placeholder="Опишите причину аппеляции...

• Укажите конкретные причины несогласия
• Приведите обоснование вашей позиции
• Прикрепите подтверждающие документы при необходимости"
                                maxlength="${this.maxCharacters}"
                            ></textarea>
                            
                            <div class="appeal-char-counter" id="appealCharCounter">
                                0 / ${this.maxCharacters} символов
                            </div>
                            
                            <!-- Действия с файлами -->
                            <div class="appeal-file-actions">
                                <button class="appeal-file-btn" onclick="appealModal.attachFile()">
                                    <span class="material-icons">attach_file</span>
                                    Прикрепить файл
                                </button>
                            </div>
                            
                            <!-- Drag & Drop зона -->
                            <div class="appeal-drop-zone" id="appealDropZone">
                                <div class="appeal-drop-zone-text">
                                    <span class="material-icons">cloud_upload</span>
                                    Перетащите файлы сюда или используйте кнопку выше
                                    <small>Поддерживаются: изображения, документы, видео (до 15 МБ, максимум 5 файлов)</small>
                                </div>
                            </div>
                            
                            <!-- Прикрепленные файлы -->
                            <div id="appealAttachedFiles"></div>
                        </div>
                    </div>
                    
                    <div class="appeal-modal-footer">
                        <div class="appeal-info">
                            <span class="material-icons">info</span>
                            Аппеляция будет рассмотрена в течение 3 рабочих дней
                        </div>
                        <div class="appeal-actions">
                            <button class="appeal-btn-modal appeal-btn-cancel-modal" onclick="appealModal.close()">
                                <span class="material-icons">close</span>
                                Отменить
                            </button>
                            <button class="appeal-btn-modal appeal-btn-submit-modal" id="submitAppealBtn" onclick="appealModal.submit()">
                                <span class="material-icons">send</span>
                                Отправить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('appealModal');
        
        // Создаем скрытый input для файлов
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.className = 'appeal-file-input';
        fileInput.multiple = true;
        fileInput.accept = this.allowedTypes.join(',');
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
        document.body.appendChild(fileInput);
        this.fileInput = fileInput;
    }

    setupEventListeners() {
        // Закрытие модального окна по клику на фон
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.close();
            }
        });

        // Счетчик символов
        const textarea = document.getElementById('appealTextarea');
        textarea.addEventListener('input', () => {
            this.updateCharCounter();
            this.validateForm();
        });

        // Drag and Drop
        const dropZone = document.getElementById('appealDropZone');
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files);
            this.handleFileDrop(files);
        });

        // Клик по drop zone для выбора файлов
        dropZone.addEventListener('click', () => {
            if (this.attachedFiles.length < this.maxFiles) {
                this.attachFile();
            }
        });
    }

    open(errorId) {
        this.currentErrorId = errorId;
        this.loadErrorData(errorId);
        this.resetForm();
        
        // Загружаем сохраненные данные аппеляций
        this.loadAppealData();
        
        this.modal.classList.add('show');
        
        // Фокус на textarea
        setTimeout(() => {
            document.getElementById('appealTextarea').focus();
        }, 300);
    }

    close() {
        this.modal.classList.remove('show');
        this.currentErrorId = null;
        this.resetForm();
    }

    loadErrorData(errorId) {
        // Находим ошибку в данных
        const error = window.currentOperatorErrors?.find(err => err.id === errorId);
        if (error) {
            document.getElementById('appealErrorId').innerHTML = `
                <span class="material-icons">error_outline</span>
                <span>Ошибка #${error.id} - ${error.type}</span>
            `;
            document.getElementById('appealErrorDescription').textContent = error.description;
        }
    }

    resetForm() {
        document.getElementById('appealTextarea').value = '';
        this.attachedFiles = [];
        this.updateCharCounter();
        this.updateAttachedFilesList();
        this.validateForm();
    }

    updateCharCounter() {
        const textarea = document.getElementById('appealTextarea');
        const counter = document.getElementById('appealCharCounter');
        const currentLength = textarea.value.length;
        
        counter.textContent = `${currentLength} / ${this.maxCharacters} символов`;
        
        // Изменяем цвет в зависимости от количества символов
        counter.className = 'appeal-char-counter';
        if (currentLength > this.maxCharacters * 0.9) {
            counter.classList.add('error');
        } else if (currentLength > this.maxCharacters * 0.8) {
            counter.classList.add('warning');
        }
    }

    validateForm() {
        const textarea = document.getElementById('appealTextarea');
        const submitBtn = document.getElementById('submitAppealBtn');
        
        const isValid = textarea.value.trim().length > 0 && 
                       textarea.value.length <= this.maxCharacters;
        
        submitBtn.disabled = !isValid;
    }

    attachFile() {
        if (this.attachedFiles.length >= this.maxFiles) {
            this.showNotification(`Максимальное количество файлов: ${this.maxFiles}`, 'warning');
            return;
        }
        this.fileInput.click();
    }

    handleFileSelect(files) {
        this.handleFileDrop(Array.from(files));
    }

    handleFileDrop(files) {
        for (const file of files) {
            if (this.attachedFiles.length >= this.maxFiles) {
                this.showNotification(`Максимальное количество файлов: ${this.maxFiles}`, 'warning');
                break;
            }
            
            if (file.size > this.maxFileSize) {
                this.showNotification(`Файл "${file.name}" слишком большой. Максимальный размер: 15 МБ`, 'error');
                continue;
            }
            
            if (!this.allowedTypes.includes(file.type) && !this.isAllowedByExtension(file.name)) {
                this.showNotification(`Неподдерживаемый тип файла: "${file.name}"`, 'error');
                continue;
            }
            
            this.addFile(file);
        }
    }

    isAllowedByExtension(filename) {
        const extension = filename.toLowerCase().split('.').pop();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'mp4', 'avi', 'mov'];
        return allowedExtensions.includes(extension);
    }

    addFile(file) {
        const fileId = Date.now() + Math.random().toString(36).substr(2, 9);
        
        const fileObject = {
            id: fileId,
            file: file,
            name: file.name,
            size: file.size,
            type: file.type
        };
        
        this.attachedFiles.push(fileObject);
        this.updateAttachedFilesList();
        this.showNotification(`Файл "${file.name}" прикреплен`, 'success');
    }

    removeFile(fileId) {
        this.attachedFiles = this.attachedFiles.filter(f => f.id !== fileId);
        this.updateAttachedFilesList();
    }

    updateAttachedFilesList() {
        const container = document.getElementById('appealAttachedFiles');
        
        if (this.attachedFiles.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        const filesHTML = `
            <div class="appeal-attached-files">
                <div class="appeal-attached-files-title">
                    <span class="material-icons">attach_file</span>
                    Прикрепленные файлы (${this.attachedFiles.length}/${this.maxFiles})
                </div>
                <div class="appeal-file-list">
                    ${this.attachedFiles.map(file => `
                        <div class="appeal-file-item">
                            <div class="appeal-file-icon">
                                <span class="material-icons">${this.getFileIcon(file.type)}</span>
                            </div>
                            <div class="appeal-file-info">
                                <div class="appeal-file-name">${file.name}</div>
                                <div class="appeal-file-size">${this.formatFileSize(file.size)}</div>
                            </div>
                            <button class="appeal-file-remove" onclick="appealModal.removeFile('${file.id}')">
                                <span class="material-icons">close</span>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = filesHTML;
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'image';
        if (fileType.startsWith('video/')) return 'videocam';
        if (fileType.includes('pdf')) return 'picture_as_pdf';
        if (fileType.includes('word') || fileType.includes('document')) return 'description';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'table_chart';
        if (fileType.includes('text')) return 'text_snippet';
        return 'insert_drive_file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Б';
        const k = 1024;
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    submit() {
        const textarea = document.getElementById('appealTextarea');
        const appealText = textarea.value.trim();
        
        if (!appealText) {
            this.showNotification('Пожалуйста, введите текст аппеляции', 'error');
            return;
        }
        
        if (appealText.length > this.maxCharacters) {
            this.showNotification(`Превышено максимальное количество символов (${this.maxCharacters})`, 'error');
            return;
        }
        
        // Находим ошибку
        const error = window.currentOperatorErrors?.find(err => err.id === this.currentErrorId);
        if (!error) {
            this.showNotification('Ошибка не найдена', 'error');
            return;
        }
        
        // Создаем новую аппеляцию
        const now = new Date();
        const dateStr = now.toLocaleDateString('ru-RU');
        const timeStr = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
        
        const newAppeal = {
            id: (error.appeals?.length || 0) + 1,
            date: `${dateStr} ${timeStr}`,
            text: appealText,
            status: 'pending',
            files: this.attachedFiles.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type
            }))
        };
        
        // Добавляем аппеляцию к ошибке
        if (!error.appeals) {
            error.appeals = [];
        }
        error.appeals.push(newAppeal);
        
        // Сохраняем данные в localStorage для постоянного хранения
        this.saveAppealData();
        
        // Перерендериваем список ошибок
        if (window.renderOperatorErrors) {
            window.renderOperatorErrors(window.currentOperatorErrors);
        }
        
        // Показываем уведомление
        const fileCountText = this.attachedFiles.length > 0 ? ` с ${this.attachedFiles.length} файлом(ами)` : '';
        this.showNotification(`Аппеляция отправлена${fileCountText}`, 'success');
        
        console.log(`Аппеляция отправлена для ошибки ${this.currentErrorId}: ${appealText}`);
        console.log('Данные ошибки после добавления аппеляции:', error);
        console.log('Общее количество аппеляций для этой ошибки:', error.appeals.length);
        
        this.close();
    }

    showNotification(message, type = 'info') {
        // Используем существующую функцию уведомлений, если есть
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback на alert
            alert(message);
        }
    }

    saveAppealData() {
        try {
            if (window.currentOperatorErrors) {
                localStorage.setItem('operatorAppeals', JSON.stringify(window.currentOperatorErrors));
                console.log('Данные аппеляций сохранены в localStorage');
            }
        } catch (error) {
            console.error('Ошибка при сохранении данных аппеляций:', error);
        }
    }

    loadAppealData() {
        try {
            const savedData = localStorage.getItem('operatorAppeals');
            if (savedData && window.currentOperatorErrors) {
                const savedAppeals = JSON.parse(savedData);
                
                // Объединяем сохраненные аппеляции с текущими данными
                window.currentOperatorErrors.forEach(currentError => {
                    const savedError = savedAppeals.find(saved => saved.id === currentError.id);
                    if (savedError && savedError.appeals) {
                        currentError.appeals = savedError.appeals;
                    }
                });
                
                console.log('Данные аппеляций загружены из localStorage');
                
                // Перерендериваем список ошибок с загруженными аппеляциями
                if (window.renderOperatorErrors) {
                    window.renderOperatorErrors(window.currentOperatorErrors);
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных аппеляций:', error);
        }
    }

    clearAppealData() {
        try {
            localStorage.removeItem('operatorAppeals');
            console.log('Данные аппеляций очищены');
        } catch (error) {
            console.error('Ошибка при очистке данных аппеляций:', error);
        }
    }

    // Функция для экспорта данных аппеляций (для отладки)
    exportAppealData() {
        try {
            const data = localStorage.getItem('operatorAppeals');
            if (data) {
                console.log('Сохраненные данные аппеляций:', JSON.parse(data));
                return JSON.parse(data);
            } else {
                console.log('Нет сохраненных данных аппеляций');
                return null;
            }
        } catch (error) {
            console.error('Ошибка при экспорте данных аппеляций:', error);
            return null;
        }
    }
}

// Создаем глобальный экземпляр
const appealModal = new AppealModal();

// Переопределяем функцию showAppealForm для использования модального окна
function showAppealForm(errorId) {
    appealModal.open(errorId);
}

// Экспорт для использования в других модулях
window.appealModal = appealModal;
