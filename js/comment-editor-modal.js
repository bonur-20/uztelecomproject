// Менеджер модального окна редактирования комментария обучения
class CommentEditorModal {
    constructor() {
        this.modal = null;
        this.currentErrorId = null;
        this.maxCharacters = 1000;
        this.attachedFiles = [];
        this.init();
    }

    init() {
        this.createModalHTML();
        this.setupEventListeners();
    }

    createModalHTML() {
        const modalHTML = `
            <div class="comment-editor-modal" id="commentEditorModal">
                <div class="comment-editor-container">
                    <div class="comment-editor-header">
                        <div class="comment-editor-title">
                            <span class="material-icons">edit_note</span>
                            Редактирование комментария обучения
                        </div>
                        <button class="comment-editor-close" onclick="commentEditorModal.close()">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                    
                    <div class="comment-editor-body">
                        <!-- Информация об ошибке -->
                        <div class="comment-editor-error-info">
                            <div class="comment-editor-error-id" id="editorErrorId"></div>
                            <div class="comment-editor-error-description" id="editorErrorDescription"></div>
                        </div>
                        
                        <!-- История комментариев -->
                        <div class="comment-editor-history">
                            <div class="comment-editor-history-title">
                                <span class="material-icons">history</span>
                                История комментариев
                            </div>
                            <div id="commentHistory"></div>
                        </div>
                        
                        <!-- Форма редактирования -->
                        <div class="comment-editor-form">
                            <div class="comment-editor-form-title">
                                <span class="material-icons">edit</span>
                                Новый комментарий
                            </div>
                            
                            <textarea 
                                class="comment-editor-textarea" 
                                id="commentEditorTextarea"
                                placeholder="Введите обновленный комментарий обучения...
                                
• Опишите исправления
• Укажите дополнительные рекомендации  
• Добавьте необходимые пояснения"
                                maxlength="${this.maxCharacters}"
                            ></textarea>
                            
                            <div class="comment-editor-char-counter" id="charCounter">
                                0 / ${this.maxCharacters} символов
                            </div>
                            
                            <!-- Действия с файлами -->
                            <div class="comment-editor-file-actions">
                                <button class="comment-editor-file-btn" onclick="commentEditorModal.attachFile()">
                                    <span class="material-icons">attach_file</span>
                                    Прикрепить файл
                                </button>
                                <button class="comment-editor-file-btn" onclick="commentEditorModal.addScreenshot()">
                                    <span class="material-icons">screenshot_monitor</span>
                                    Добавить скриншот
                                </button>
                            </div>
                            
                            <!-- Drag & Drop зона -->
                            <div class="comment-editor-drop-zone" id="commentDropZone">
                                <div class="comment-editor-drop-zone-text">
                                    <span class="material-icons">cloud_upload</span>
                                    Перетащите файлы сюда или используйте кнопки выше
                                    <small>Поддерживаются: изображения, документы, видео (до 15 МБ)</small>
                                </div>
                            </div>
                            
                            <!-- Прикрепленные файлы -->
                            <div id="editorAttachedFiles"></div>
                        </div>
                    </div>
                    
                    <div class="comment-editor-footer">
                        <div class="comment-editor-info">
                            <span class="material-icons">info</span>
                            Изменения будут сохранены в истории обучения
                        </div>
                        <div class="comment-editor-actions">
                            <button class="comment-editor-btn comment-editor-btn-cancel" onclick="commentEditorModal.close()">
                                <span class="material-icons">close</span>
                                Отменить
                            </button>
                            <button class="comment-editor-btn comment-editor-btn-save" id="saveCommentBtn" onclick="commentEditorModal.save()">
                                <span class="material-icons">save</span>
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('commentEditorModal');
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
        const textarea = document.getElementById('commentEditorTextarea');
        textarea.addEventListener('input', () => {
            this.updateCharCounter();
            this.validateForm();
        });

        // Drag and Drop
        const dropZone = document.getElementById('commentDropZone');
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFileDrop(e.dataTransfer.files);
        });
    }

    open(errorId) {
        this.currentErrorId = errorId;
        this.loadErrorData(errorId);
        this.loadCommentHistory(errorId);
        this.resetForm();
        
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Фокус на textarea
        setTimeout(() => {
            document.getElementById('commentEditorTextarea').focus();
        }, 300);
    }

    close() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
        this.currentErrorId = null;
        this.attachedFiles = [];
    }

    loadErrorData(errorId) {
        // Здесь загружаем данные об ошибке
        const errorData = this.getErrorData(errorId);
        
        document.getElementById('editorErrorId').textContent = `Ошибка #${errorData.id}`;
        document.getElementById('editorErrorDescription').textContent = errorData.description;
    }

    loadCommentHistory(errorId) {
        const errorData = this.getErrorData(errorId);
        const historyContainer = document.getElementById('commentHistory');
        
        if (!errorData.trainingComments || errorData.trainingComments.length === 0) {
            historyContainer.innerHTML = `
                <div style="text-align: center; color: #6c757d; padding: 20px;">
                    <span class="material-icons" style="font-size: 32px; margin-bottom: 8px;">chat_bubble_outline</span>
                    <div>Комментариев пока нет</div>
                </div>
            `;
            return;
        }

        const historyHTML = errorData.trainingComments.map((comment, index) => `
            <div class="comment-history-item ${comment.isOriginal ? 'original' : 'edited'}">
                <div class="comment-history-date">
                    <span class="material-icons">${comment.isOriginal ? 'schedule' : 'edit'}</span>
                    ${comment.isOriginal ? 'Дата обучения:' : 'Отредактировано:'} ${comment.date}
                </div>
                <div class="comment-history-text">${comment.text}</div>
                ${comment.files && comment.files.length > 0 ? `
                    <div class="comment-history-files">
                        <div class="comment-history-files-title">
                            <span class="material-icons">attach_file</span>
                            Файлы (${comment.files.length})
                        </div>
                        ${comment.files.map(file => `
                            <div class="comment-history-file-item">
                                <span class="material-icons">${this.getFileIcon(file.type)}</span>
                                <span>${file.name}</span>
                                <span>(${this.formatFileSize(file.size)})</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        historyContainer.innerHTML = historyHTML;
    }

    resetForm() {
        document.getElementById('commentEditorTextarea').value = '';
        this.attachedFiles = [];
        this.updateCharCounter();
        this.updateAttachedFilesDisplay();
        this.validateForm();
    }

    updateCharCounter() {
        const textarea = document.getElementById('commentEditorTextarea');
        const counter = document.getElementById('charCounter');
        const length = textarea.value.length;
        
        counter.textContent = `${length} / ${this.maxCharacters} символов`;
        
        counter.className = 'comment-editor-char-counter';
        if (length > this.maxCharacters * 0.9) {
            counter.classList.add('warning');
        }
        if (length >= this.maxCharacters) {
            counter.classList.add('danger');
        }
    }

    validateForm() {
        const textarea = document.getElementById('commentEditorTextarea');
        const saveBtn = document.getElementById('saveCommentBtn');
        
        const isValid = textarea.value.trim().length > 0 && textarea.value.length <= this.maxCharacters;
        saveBtn.disabled = !isValid;
    }

    attachFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.mp4,.webm';
        
        input.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });
        
        input.click();
    }

    addScreenshot() {
        // Здесь можно добавить функциональность для создания скриншота
        this.showNotification('Функция скриншота будет добавлена в следующих версиях', 'info');
    }

    handleFileSelect(files) {
        Array.from(files).forEach(file => this.addFile(file));
    }

    handleFileDrop(files) {
        Array.from(files).forEach(file => this.addFile(file));
    }

    addFile(file) {
        // Проверки файла
        if (this.attachedFiles.length >= 5) {
            this.showNotification('Можно прикрепить не более 5 файлов', 'error');
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            this.showNotification(`Файл "${file.name}" слишком большой. Максимум 15 МБ`, 'error');
            return;
        }

        const fileData = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        };

        this.attachedFiles.push(fileData);
        this.updateAttachedFilesDisplay();
        this.showNotification(`Файл "${file.name}" прикреплен`, 'success');
    }

    removeFile(fileId) {
        this.attachedFiles = this.attachedFiles.filter(file => file.id !== fileId);
        this.updateAttachedFilesDisplay();
    }

    updateAttachedFilesDisplay() {
        const container = document.getElementById('editorAttachedFiles');
        
        if (this.attachedFiles.length === 0) {
            container.innerHTML = '';
            return;
        }

        const filesHTML = `
            <div class="comment-attached-files-list show">
                <div class="comment-attached-files-title">
                    <span class="material-icons">attach_file</span>
                    Прикрепленные файлы (${this.attachedFiles.length})
                </div>
                ${this.attachedFiles.map(file => `
                    <div class="comment-attached-file-item">
                        <div class="comment-attached-file-info">
                            <div class="comment-attached-file-icon">
                                <span class="material-icons">${this.getFileIcon(file.type)}</span>
                            </div>
                            <div class="comment-attached-file-details">
                                <div class="comment-attached-file-name">${file.name}</div>
                                <div class="comment-attached-file-size">${this.formatFileSize(file.size)}</div>
                            </div>
                        </div>
                        <button class="comment-remove-file-btn" onclick="commentEditorModal.removeFile(${file.id})" title="Удалить файл">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = filesHTML;
    }

    save() {
        const textarea = document.getElementById('commentEditorTextarea');
        const commentText = textarea.value.trim();
        
        if (!commentText) {
            this.showNotification('Введите текст комментария', 'error');
            return;
        }

        // Создаем объект комментария
        const newComment = {
            text: commentText,
            files: this.attachedFiles.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type
            })),
            date: new Date().toLocaleString('ru-RU'),
            isOriginal: false
        };

        // Сохраняем комментарий
        this.saveTrainingComment(this.currentErrorId, newComment);
        
        this.showNotification('Комментарий успешно сохранен', 'success');
        this.close();
        
        // Обновляем интерфейс
        if (typeof updateOperatorDisplay === 'function') {
            updateOperatorDisplay();
        }
    }

    // Вспомогательные методы
    getErrorData(errorId) {
        // Получаем данные об ошибке из текущих данных оператора
        if (typeof window.currentOperatorErrors !== 'undefined') {
            return window.currentOperatorErrors.find(error => error.id === errorId) || {};
        }
        // Fallback на глобальные данные операторов
        if (typeof operatorData !== 'undefined' && operatorData.errors) {
            return operatorData.errors.find(error => error.id === errorId) || {};
        }
        return {};
    }

    saveTrainingComment(errorId, comment) {
        // Сохраняем комментарий в текущие данные оператора
        if (typeof window.currentOperatorErrors !== 'undefined') {
            const error = window.currentOperatorErrors.find(e => e.id === errorId);
            if (error) {
                if (!error.trainingComments) {
                    error.trainingComments = [];
                }
                error.trainingComments.push(comment);
                
                // Обновляем отображение
                if (typeof renderOperatorErrors === 'function') {
                    renderOperatorErrors(window.currentOperatorErrors);
                }
                return;
            }
        }
        
        // Fallback на глобальные данные
        if (typeof operatorData !== 'undefined' && operatorData.errors) {
            const error = operatorData.errors.find(e => e.id === errorId);
            if (error) {
                if (!error.trainingComments) {
                    error.trainingComments = [];
                }
                error.trainingComments.push(comment);
            }
        }
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.includes('pdf')) return 'picture_as_pdf';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'description';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'table_chart';
        if (mimeType.startsWith('video/')) return 'movie';
        if (mimeType.startsWith('audio/')) return 'audiotrack';
        return 'insert_drive_file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Б';
        const k = 1024;
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Используем существующую систему уведомлений или создаем простую
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else if (typeof notificationManager !== 'undefined') {
            notificationManager.show(message, type);
        } else {
            // Простое уведомление как fallback
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 6px;
                color: white;
                font-size: 14px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            `;
            
            switch(type) {
                case 'success':
                    notification.style.backgroundColor = '#28a745';
                    break;
                case 'error':
                    notification.style.backgroundColor = '#dc3545';
                    break;
                case 'warning':
                    notification.style.backgroundColor = '#ffc107';
                    notification.style.color = '#000';
                    break;
                default:
                    notification.style.backgroundColor = '#17a2b8';
            }
            
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }
}

// Создаем глобальный экземпляр
const commentEditorModal = new CommentEditorModal();

// Функция для открытия модального окна (вызывается из HTML)
function editTrainingComment(errorId) {
    commentEditorModal.open(errorId);
}
