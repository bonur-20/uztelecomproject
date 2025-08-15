// Менеджер прикрепления файлов
class FileAttachmentManager {
    constructor() {
        this.attachedFiles = new Map();
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.maxFiles = 5;
        this.allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Обработчик клика по кнопке прикрепления
        document.addEventListener('click', (e) => {
            if (e.target.closest('.attach-file-btn')) {
                e.preventDefault();
                this.openFileDialog(e.target.closest('.attach-file-btn'));
            }
            
            if (e.target.closest('.remove-file-btn')) {
                e.preventDefault();
                this.removeFile(e.target.closest('.remove-file-btn'));
            }
        });

        // Обработчик изменения input файла
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('file-input-hidden')) {
                this.handleFileSelect(e.target);
            }
        });

        // Drag and Drop обработчики
        document.addEventListener('dragover', (e) => {
            const dropZone = e.target.closest('.file-drop-zone');
            if (dropZone) {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            const dropZone = e.target.closest('.file-drop-zone');
            if (dropZone && !dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            const dropZone = e.target.closest('.file-drop-zone');
            if (dropZone) {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                this.handleFileDrop(e.dataTransfer.files, dropZone);
            }
        });
    }

    openFileDialog(button) {
        const container = button.closest('.appeal-form-actions') || button.closest('.comment-form-actions');
        if (!container) return;

        let fileInput = container.querySelector('.file-input-hidden');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.className = 'file-input-hidden';
            fileInput.multiple = true;
            fileInput.accept = this.getAcceptString();
            container.appendChild(fileInput);
        }

        fileInput.click();
    }

    handleFileSelect(input) {
        const files = Array.from(input.files);
        const container = input.closest('.appeal-form-actions') || input.closest('.comment-form-actions');
        this.processFiles(files, container);
        input.value = ''; // Очистить input для повторного использования
    }

    handleFileDrop(files, dropZone) {
        const fileArray = Array.from(files);
        const container = dropZone.closest('.add-appeal-form') || dropZone.closest('.comment-form');
        this.processFiles(fileArray, container);
    }

    processFiles(files, container) {
        const containerId = this.getContainerId(container);
        
        // Проверка лимита файлов
        const currentFilesCount = this.attachedFiles.get(containerId)?.length || 0;
        if (currentFilesCount + files.length > this.maxFiles) {
            this.showError(container, `Можно прикрепить не более ${this.maxFiles} файлов`);
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
            const fileId = Date.now() + Math.random();
            existingFiles.push({
                id: fileId,
                file: file,
                name: file.name,
                size: file.size,
                type: file.type
            });
        });

        this.renderAttachedFiles(container);
        this.hideError(container);
        
        // Показать уведомление
        if (files.length === 1) {
            this.showNotification(`Файл "${files[0].name}" прикреплен`, 'success');
        } else {
            this.showNotification(`Прикреплено файлов: ${files.length}`, 'success');
        }
    }

    removeFile(button) {
        const fileItem = button.closest('.attached-file-item');
        const container = button.closest('.add-appeal-form') || button.closest('.comment-form');
        const fileId = parseInt(button.dataset.fileId);
        const containerId = this.getContainerId(container);

        if (this.attachedFiles.has(containerId)) {
            const files = this.attachedFiles.get(containerId);
            const fileIndex = files.findIndex(f => f.id === fileId);
            
            if (fileIndex !== -1) {
                const fileName = files[fileIndex].name;
                files.splice(fileIndex, 1);
                this.renderAttachedFiles(container);
                this.showNotification(`Файл "${fileName}" удален`, 'info');
            }
        }
    }

    renderAttachedFiles(container) {
        const containerId = this.getContainerId(container);
        const files = this.attachedFiles.get(containerId) || [];
        
        let filesList = container.querySelector('.attached-files-list');
        
        if (files.length === 0) {
            if (filesList) {
                filesList.remove();
            }
            return;
        }

        if (!filesList) {
            filesList = document.createElement('div');
            filesList.className = 'attached-files-list';
            
            // Вставить после формы действий
            const formActions = container.querySelector('.appeal-form-actions') || container.querySelector('.comment-form-actions');
            if (formActions) {
                formActions.after(filesList);
            } else {
                container.appendChild(filesList);
            }
        }

        filesList.innerHTML = `
            <div class="attached-files-title">
                <span class="material-icons">attach_file</span>
                Прикрепленные файлы (${files.length})
            </div>
            ${files.map(file => `
                <div class="attached-file-item">
                    <div class="attached-file-info">
                        <div class="attached-file-icon">
                            <span class="material-icons">${this.getFileIcon(file.type)}</span>
                        </div>
                        <div class="attached-file-details">
                            <div class="attached-file-name">${file.name}</div>
                            <div class="attached-file-size">${this.formatFileSize(file.size)}</div>
                        </div>
                    </div>
                    <button class="remove-file-btn" data-file-id="${file.id}" title="Удалить файл">
                        <span class="material-icons">close</span>
                    </button>
                </div>
            `).join('')}
        `;

        filesList.classList.add('show');
    }

    getContainerId(container) {
        return container.id || container.className || 'default';
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
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
        let errorDiv = container.querySelector('.file-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'file-error';
            
            const formActions = container.querySelector('.appeal-form-actions') || container.querySelector('.comment-form-actions');
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
        const errorDiv = container.querySelector('.file-error');
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
    }

    showNotification(message, type = 'info') {
        // Интеграция с существующей системой уведомлений
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Получить прикрепленные файлы для формы
    getAttachedFiles(container) {
        const containerId = this.getContainerId(container);
        return this.attachedFiles.get(containerId) || [];
    }

    // Очистить прикрепленные файлы для формы
    clearAttachedFiles(container) {
        const containerId = this.getContainerId(container);
        this.attachedFiles.delete(containerId);
        
        const filesList = container.querySelector('.attached-files-list');
        if (filesList) {
            filesList.remove();
        }
    }
}

// Инициализация менеджера прикрепления файлов
const fileAttachmentManager = new FileAttachmentManager();

// Экспорт функций для использования в других модулях
window.fileAttachmentManager = fileAttachmentManager;
window.getAttachedFiles = (container) => fileAttachmentManager.getAttachedFiles(container);
window.clearAttachedFiles = (container) => fileAttachmentManager.clearAttachedFiles(container);
