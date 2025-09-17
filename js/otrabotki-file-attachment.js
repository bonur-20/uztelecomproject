/**
 * Менеджер прикрепленных файлов к комментариям в секции отработки
 */
class OtrabotkaFileAttachmentManager {
    constructor() {
        this.attachedFiles = [];
        this.maxFiles = 5;
        this.maxFileSize = 5 * 1024 * 1024; // 5 MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 
                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                             'application/vnd.ms-excel', 
                             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                             'text/plain'];
        
        // Инициализация интерфейса
        this.initUI();
    }
    
    /**
     * Инициализирует пользовательский интерфейс и добавляет обработчики событий
     */
    initUI() {
        // Находим кнопку прикрепления файла и добавляем скрытый input для выбора файлов
        const attachButton = document.querySelector('.otrabotki-attach-file-btn');
        if (attachButton) {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.multiple = true;
            fileInput.accept = this.allowedTypes.join(',');
            fileInput.style.display = 'none';
            fileInput.id = 'otrabotki-file-input';
            document.body.appendChild(fileInput);
            
            attachButton.addEventListener('click', (e) => {
                // Проверяем, что клик был именно на кнопке или внутри .otrabotki-attach-btn-content
                if (e.target.closest('.otrabotki-attach-btn-content')) {
                    fileInput.click();
                }
            });
            
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
                // Очищаем input, чтобы можно было повторно выбрать те же файлы
                fileInput.value = '';
            });
        }
        
        // Инициализируем контейнер файлов
        const filesContainer = document.getElementById('otrabotki-comment-files');
        if (filesContainer) {
            // Показываем контейнер если есть файлы, иначе скрываем
            this.updateFilesVisibility();
            
            // Добавляем обработчик для кнопок удаления файлов
            filesContainer.addEventListener('click', (e) => {
                const removeButton = e.target.closest('.otrabotki-comment-file-remove');
                if (removeButton) {
                    const fileElement = removeButton.closest('.otrabotki-comment-file');
                    const fileName = fileElement.querySelector('.otrabotki-comment-file-name').textContent;
                    this.removeFile(fileName);
                }
            });
            
            // Добавляем обработчик для горизонтальной прокрутки колесиком мыши
            this.addScrollSupport(filesContainer);
        }
        
        // Также добавляем поддержку прокрутки для всей кнопки
        if (attachButton) {
            this.addScrollSupport(attachButton);
        }
        
        // Добавим тестовые файлы для проверки прокрутки
        this.addTestFiles();
    }
    
    /**
     * Обрабатывает выбор файлов пользователем
     * @param {FileList} fileList - список выбранных файлов
     */
    handleFileSelection(fileList) {
        if (!fileList || fileList.length === 0) return;
        
        // Конвертируем FileList в массив для удобства работы
        const filesArray = Array.from(fileList);
        
        // Проверяем, не превышен ли лимит файлов
        if (this.attachedFiles.length + filesArray.length > this.maxFiles) {
            alert(`Вы можете прикрепить максимум ${this.maxFiles} файлов`);
            return;
        }
        
        // Проверяем каждый файл
        filesArray.forEach(file => {
            // Проверка типа файла
            if (!this.allowedTypes.includes(file.type)) {
                alert(`Тип файла "${file.name}" не поддерживается`);
                return;
            }
            
            // Проверка размера файла
            if (file.size > this.maxFileSize) {
                alert(`Файл "${file.name}" превышает максимальный размер ${this.maxFileSize / (1024 * 1024)} MB`);
                return;
            }
            
            // Добавляем файл в список
            this.attachedFiles.push({
                file: file,
                name: file.name,
                type: file.type,
                size: file.size
            });
        });
        
        // Обновляем интерфейс
        this.updateFilesUI();
    }
    
    /**
     * Удаляет файл из списка прикрепленных
     * @param {string} fileName - имя файла для удаления
     */
    removeFile(fileName) {
        const index = this.attachedFiles.findIndex(item => item.name === fileName);
        if (index !== -1) {
            this.attachedFiles.splice(index, 1);
            this.updateFilesUI();
        }
    }
    
    /**
     * Очищает список прикрепленных файлов
     */
    clearFiles() {
        this.attachedFiles = [];
        this.clearFilesUI();
    }
    
    /**
     * Очищает UI от прикрепленных файлов
     */
    clearFilesUI() {
        const filesContainer = document.getElementById('otrabotki-comment-files');
        if (filesContainer) {
            filesContainer.innerHTML = '';
            filesContainer.style.display = 'none';
        }
    }
    
    /**
     * Обновляет интерфейс списка прикрепленных файлов
     */
    updateFilesUI() {
        const filesContainer = document.getElementById('otrabotki-comment-files');
        if (!filesContainer) return;
        
        // Очищаем контейнер
        filesContainer.innerHTML = '';
        
        // Если файлов нет, скрываем контейнер
        if (this.attachedFiles.length === 0) {
            filesContainer.style.display = 'none';
            return;
        }
        
        // Показываем контейнер
        filesContainer.style.display = 'flex';
        
        // Добавляем файлы в UI
        this.attachedFiles.forEach(fileItem => {
            const fileElement = document.createElement('div');
            fileElement.className = 'otrabotki-comment-file';
            
            // Определяем иконку в зависимости от типа файла
            let iconName = 'description';
            if (fileItem.type.startsWith('image/')) {
                iconName = 'image';
            } else if (fileItem.type.includes('pdf')) {
                iconName = 'picture_as_pdf';
            } else if (fileItem.type.includes('excel') || fileItem.type.includes('spreadsheet')) {
                iconName = 'table_chart';
            } else if (fileItem.type.includes('word') || fileItem.type.includes('document')) {
                iconName = 'description';
            }
            
            fileElement.innerHTML = `
                <span class="material-icons otrabotki-comment-file-icon">${iconName}</span>
                <span class="otrabotki-comment-file-name" title="${fileItem.name}">${fileItem.name}</span>
                <button class="otrabotki-comment-file-remove">
                    <span class="material-icons">close</span>
                </button>
            `;
            
            filesContainer.appendChild(fileElement);
        });
    }
    
    /**
     * Возвращает список прикрепленных файлов
     * @returns {Array} Массив прикрепленных файлов
     */
    getAttachedFiles() {
        return [...this.attachedFiles];
    }
    
    /**
     * Добавляет поддержку вертикальной прокрутки колесиком мыши
     * @param {Element} element - элемент для добавления поддержки прокрутки
     */
    addScrollSupport(element) {
        element.addEventListener('wheel', (e) => {
            const filesContainer = element.querySelector('.otrabotki-comment-files') || 
                                 (element.classList.contains('otrabotki-comment-files') ? element : null);
            
            if (filesContainer && filesContainer.scrollHeight > filesContainer.clientHeight) {
                e.preventDefault();
                // Используем обычную вертикальную прокрутку
                filesContainer.scrollTop += e.deltaY;
            }
        });
    }
    
    /**
     * Обновляет видимость контейнера файлов
     */
    updateFilesVisibility() {
        const filesContainer = document.getElementById('otrabotki-comment-files');
        if (filesContainer) {
            const hasFiles = filesContainer.children.length > 0;
            filesContainer.style.display = hasFiles ? 'flex' : 'none';
        }
    }
    
    /**
     * Добавляет тестовые файлы для проверки прокрутки
     */
    addTestFiles() {
        // Добавляем несколько тестовых файлов
        const testFiles = [
            { name: 'Документ_1.pdf', type: 'application/pdf', size: 1024 },
            { name: 'Отчет_2023.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 2048 },
            { name: 'Изображение.png', type: 'image/png', size: 512 },
            { name: 'Презентация.pptx', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 4096 },
            { name: 'Текстовый_файл.txt', type: 'text/plain', size: 256 }
        ];
        
        testFiles.forEach(file => {
            this.attachedFiles.push(file);
        });
        
        this.updateFilesUI();
    }
}

// Инициализируем менеджер прикрепленных файлов при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.otrabotkaFileAttachmentManager = new OtrabotkaFileAttachmentManager();
});
