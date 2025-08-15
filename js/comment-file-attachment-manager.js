// Менеджер прикрепления файлов для комментариев обучения
class CommentFileAttachmentManager {
    constructor() {
        this.attachedFiles = new Map();
        this.maxFileSize = 15 * 1024 * 1024; // 15MB для комментариев обучения
        this.maxFiles = 3; // Меньше файлов для комментариев
        this.allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'video/mp4', 'video/webm', 'video/ogg',
            'audio/mp3', 'audio/wav', 'audio/ogg'
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработчик клика по кнопке прикрепления в комментариях
        document.addEventListener('click', (e) => {
            if (e.target.closest('.comment-attach-file-btn')) {
                e.preventDefault();
                this.openFileDialog(e.target.closest('.comment-attach-file-btn'));
            }
            
            if (e.target.closest('.comment-remove-file-btn')) {
                e.preventDefault();
                console.log('Remove file button clicked:', e.target);
                this.removeFile(e.target.closest('.comment-remove-file-btn'));
            }
        });

        // Обработчик изменения input файла для комментариев
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('comment-file-input-hidden')) {
                this.handleFileSelect(e.target);
            }
        });

        // Drag and Drop обработчики для комментариев
        document.addEventListener('dragover', (e) => {
            const dropZone = e.target.closest('.comment-file-drop-zone');
            if (dropZone) {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            const dropZone = e.target.closest('.comment-file-drop-zone');
            if (dropZone && !dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            const dropZone = e.target.closest('.comment-file-drop-zone');
            if (dropZone) {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                this.handleFileDrop(e.dataTransfer.files, dropZone);
            }
        });
    }

    openFileDialog(button) {
        // Ищем родительский контейнер формы комментария
        const formContainer = button.closest('.add-comment-form') || button.closest('.training-comment-form');
        if (!formContainer) return;

        let fileInput = formContainer.querySelector('.comment-file-input-hidden');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.className = 'comment-file-input-hidden';
            fileInput.multiple = true;
            fileInput.accept = this.getAcceptString();
            fileInput.style.display = 'none';
            formContainer.appendChild(fileInput);
        }

        fileInput.click();
    }

    handleFileSelect(input) {
        const files = Array.from(input.files);
        const container = input.closest('.add-comment-form') || input.closest('.training-comment-form');
        this.processFiles(files, container);
        input.value = ''; // Очистить input для повторного использования
    }

    handleFileDrop(files, dropZone) {
        const fileArray = Array.from(files);
        const container = dropZone.closest('.add-comment-form') || dropZone.closest('.training-comment-form');
        this.processFiles(fileArray, container);
    }

    processFiles(files, container) {
        const containerId = this.getContainerId(container);
        
        console.log('ProcessFiles Debug:', {
            containerId: containerId,
            filesCount: files.length,
            currentAttachedFiles: this.attachedFiles.get(containerId)?.length || 0,
            maxFiles: this.maxFiles
        });
        
        // Проверка лимита файлов
        const currentFilesCount = this.attachedFiles.get(containerId)?.length || 0;
        if (currentFilesCount + files.length > this.maxFiles) {
            console.error('File limit exceeded:', {
                current: currentFilesCount,
                adding: files.length,
                total: currentFilesCount + files.length,
                limit: this.maxFiles
            });
            this.showError(container, `Можно прикрепить не более ${this.maxFiles} файлов к комментарию`);
            return;
        }

        let validFiles = [];
        
        for (const file of files) {
            // Проверка размера файла
            if (file.size > this.maxFileSize) {
                this.showError(container, `Файл "${file.name}" слишком большой. Максимальный размер: ${this.formatFileSize(this.maxFileSize)}`);
                continue;
            }

            // Проверка типа файла
            if (!this.allowedTypes.includes(file.type)) {
                this.showError(container, `Файл "${file.name}" имеет неподдерживаемый формат`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            this.addFiles(validFiles, container);
        }
    }

    addFiles(files, container) {
        const containerId = this.getContainerId(container);
        
        if (!this.attachedFiles.has(containerId)) {
            this.attachedFiles.set(containerId, []);
        }

        const existingFiles = this.attachedFiles.get(containerId);
        
        files.forEach(file => {
            const fileId = Date.now() + Math.floor(Math.random() * 1000);
            existingFiles.push({
                id: fileId,
                file: file,
                name: file.name,
                size: file.size,
                type: file.type
            });
            console.log('Added file with ID:', fileId, 'Name:', file.name);
        });

        this.renderAttachedFiles(container);
        this.hideError(container);
        
        // Показать уведомление
        if (files.length === 1) {
            this.showNotification(`Файл "${files[0].name}" прикреплен к комментарию`, 'success');
        } else {
            this.showNotification(`К комментарию прикреплено файлов: ${files.length}`, 'success');
        }
    }

    removeFile(button) {
        console.log('RemoveFile Debug:', {
            button: button,
            hasButton: !!button,
            buttonClasses: button ? button.className : 'no button'
        });
        
        const fileItem = button.closest('.comment-attached-file-item');
        const container = button.closest('.add-comment-form') || button.closest('.training-comment-form');
        const fileId = parseInt(button.dataset.fileId);
        const containerId = this.getContainerId(container);

        console.log('RemoveFile Debug Container:', {
            fileItem: fileItem,
            container: container,
            fileId: fileId,
            fileIdRaw: button.dataset.fileId,
            isNaN: isNaN(fileId),
            containerId: containerId
        });

        if (this.attachedFiles.has(containerId)) {
            const files = this.attachedFiles.get(containerId);
            const fileIndex = files.findIndex(f => f.id === fileId);
            
            console.log('RemoveFile Debug Files:', {
                files: files,
                fileIndex: fileIndex
            });
            
            if (fileIndex !== -1) {
                const fileName = files[fileIndex].name;
                files.splice(fileIndex, 1);
                this.renderAttachedFiles(container);
                this.showNotification(`Файл "${fileName}" удален из комментария`, 'info');
                console.log('File removed successfully:', fileName);
            } else {
                console.error('File not found in array');
            }
        } else {
            console.error('Container not found in attachedFiles Map');
        }
    }

    renderAttachedFiles(container) {
        const containerId = this.getContainerId(container);
        const files = this.attachedFiles.get(containerId) || [];
        
        let filesList = container.querySelector('.comment-attached-files-list');
        
        if (files.length === 0) {
            if (filesList) {
                filesList.remove();
            }
            return;
        }

        if (!filesList) {
            filesList = document.createElement('div');
            filesList.className = 'comment-attached-files-list';
            
            // Вставить после формы действий
            const formActions = container.querySelector('.comment-form-actions') || container.querySelector('.training-form-actions');
            if (formActions) {
                formActions.after(filesList);
            } else {
                container.appendChild(filesList);
            }
        }

        filesList.innerHTML = `
            <div class="comment-attached-files-title">
                <span class="material-icons">attach_file</span>
                Прикрепленные файлы (${files.length})
            </div>
            ${files.map(file => `
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
                    <button class="comment-remove-file-btn" data-file-id="${file.id}" title="Удалить файл">
                        <span class="material-icons">close</span>
                    </button>
                </div>
            `).join('')}
        `;

        filesList.classList.add('show');
    }

    getContainerId(container) {
        // Используем более специфичные идентификаторы для комментариев
        if (container.id) {
            return container.id;
        }
        
        // Если нет ID, попробуем создать уникальный на основе content
        const textarea = container.querySelector('textarea');
        if (textarea && textarea.id) {
            return textarea.id.replace('comment-input-', 'comment-container-');
        }
        
        // Последний резерв - используем класс + случайное число
        return container.className + '_comment_' + Date.now();
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'videocam';
        if (mimeType.startsWith('audio/')) return 'audiotrack';
        if (mimeType === 'application/pdf') return 'picture_as_pdf';
        if (mimeType.includes('word')) return 'description';
        if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'table_chart';
        if (mimeType === 'text/plain') return 'text_snippet';
        return 'insert_drive_file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Б';
        const k = 1024;
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    getAcceptString() {
        return this.allowedTypes.join(',');
    }

    showError(container, message) {
        let errorDiv = container.querySelector('.comment-file-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'comment-file-error';
            
            const formActions = container.querySelector('.comment-form-actions') || container.querySelector('.training-form-actions');
            if (formActions) {
                formActions.after(errorDiv);
            } else {
                container.appendChild(errorDiv);
            }
        }

        errorDiv.innerHTML = `
            <span class="material-icons">error</span>
            ${message}
        `;
        
        errorDiv.classList.add('show');
        
        // Автоматически скрыть через 5 секунд
        setTimeout(() => {
            this.hideError(container);
        }, 5000);
    }

    hideError(container) {
        const errorDiv = container.querySelector('.comment-file-error');
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
    }

    showNotification(message, type = 'info') {
        // Интеграция с существующей системой уведомлений
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[COMMENT ${type.toUpperCase()}] ${message}`);
        }
    }

    // Получить прикрепленные файлы для формы комментария
    getAttachedFiles(container) {
        const containerId = this.getContainerId(container);
        return this.attachedFiles.get(containerId) || [];
    }

    // Очистить прикрепленные файлы для формы комментария
    clearAttachedFiles(container) {
        const containerId = this.getContainerId(container);
        
        console.log('ClearAttachedFiles Debug:', {
            containerId: containerId,
            hadFiles: this.attachedFiles.has(containerId),
            filesCount: this.attachedFiles.get(containerId)?.length || 0
        });
        
        this.attachedFiles.delete(containerId);
        
        const filesList = container.querySelector('.comment-attached-files-list');
        if (filesList) {
            filesList.remove();
        }
    }

    // Сохранить файлы с комментарием
    saveFilesWithComment(container, commentData) {
        const attachedFiles = this.getAttachedFiles(container);
        if (attachedFiles.length > 0) {
            commentData.files = attachedFiles.map(fileData => ({
                name: fileData.name,
                size: fileData.size,
                type: fileData.type,
                id: fileData.id
            }));
        }
        
        // Очистить прикрепленные файлы после сохранения
        this.clearAttachedFiles(container);
        
        return commentData;
    }
}

// Инициализация менеджера прикрепления файлов для комментариев
const commentFileAttachmentManager = new CommentFileAttachmentManager();

// Экспорт функций для использования в других модулях
window.commentFileAttachmentManager = commentFileAttachmentManager;
window.getCommentAttachedFiles = (container) => commentFileAttachmentManager.getAttachedFiles(container);
window.clearCommentAttachedFiles = (container) => commentFileAttachmentManager.clearAttachedFiles(container);
window.saveCommentWithFiles = (container, commentData) => commentFileAttachmentManager.saveFilesWithComment(container, commentData);
