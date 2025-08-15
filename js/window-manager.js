/**
 * Менеджер управления окнами
 * Отвечает за создание, перемещение, изменение размера и управление окнами
 */

const WindowManager = {
    editMode: false,
    
    /**
     * Инициализация всех окон
     */
    initializeWindows: function() {
        const windows = document.querySelectorAll('.training-window');
        windows.forEach(window => {
            this.makeWindowDraggable(window);
            this.makeWindowResizable(window);
            this.addWindowControls(window);
        });
        
        // Инициализируем кнопки в отключенном состоянии
        this.initializeButtons();
    },
    
    /**
     * Инициализация кнопок в отключенном состоянии
     */
    initializeButtons: function() {
        // Инициализируем кнопки развертывания в отключенном состоянии
        document.querySelectorAll('.maximize-btn').forEach(btn => {
            btn.classList.add('disabled');
            btn.style.cursor = 'not-allowed';
            btn.title = 'Развертывание доступно только в режиме редактирования';
        });
        
        // Инициализируем кнопки свертывания в отключенном состоянии
        document.querySelectorAll('.minimize-btn').forEach(btn => {
            btn.classList.add('disabled');
            btn.style.cursor = 'not-allowed';
            btn.title = 'Свертывание доступно только в режиме редактирования';
        });
    },
    
    /**
     * Сделать окно перетаскиваемым
     * @param {HTMLElement} windowElement - Элемент окна
     */
    makeWindowDraggable: function(windowElement) {
        const header = windowElement.querySelector('.window-header');
        let isDragging = false;
        let currentX = 0;
        let currentY = 0;
        let initialX = 0;
        let initialY = 0;
        let xOffset = 0;
        let yOffset = 0;
        
        if (!header) return;
        
        header.addEventListener('mousedown', dragStart.bind(this));
        document.addEventListener('mousemove', drag.bind(this));
        document.addEventListener('mouseup', dragEnd.bind(this));
        
        function dragStart(e) {
            if (!this.editMode) return;
            if (e.target.closest('.window-controls')) return;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            if (e.target === header || header.contains(e.target)) {
                isDragging = true;
                windowElement.classList.add('dragging');
            }
        }
        
        function drag(e) {
            if (isDragging && this.editMode) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                xOffset = currentX;
                yOffset = currentY;
                
                // Ограничиваем перемещение в пределах training-layout
                const constraints = this.getConstraints(windowElement);
                currentX = Math.max(constraints.minX, Math.min(currentX, constraints.maxX));
                currentY = Math.max(constraints.minY, Math.min(currentY, constraints.maxY));
                
                windowElement.style.left = currentX + 'px';
                windowElement.style.top = currentY + 'px';
            }
        }
        
        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            windowElement.classList.remove('dragging');
            
            // Сохраняем состояние после перетаскивания
            setTimeout(() => {
                WindowStateManager.saveWindowState(windowElement);
            }, 50);
        }
    },
    
    /**
     * Получить ограничения для перемещения окна
     * @param {HTMLElement} windowElement - Элемент окна
     * @returns {Object} - Объект с ограничениями
     */
    getConstraints: function(windowElement) {
        const trainingLayout = document.querySelector('.training-layout');
        let constraints = {
            minX: 20,
            minY: 20,
            maxX: 1000,
            maxY: 600
        };
        
        if (trainingLayout) {
            const containerRect = trainingLayout.getBoundingClientRect();
            const windowRect = windowElement.getBoundingClientRect();
            
            constraints.maxX = containerRect.width - windowRect.width - 20;
            constraints.maxY = containerRect.height - windowRect.height - 20;
        }
        
        return constraints;
    },
    
    /**
     * Сделать окно изменяемым по размеру
     * @param {HTMLElement} windowElement - Элемент окна
     */
    makeWindowResizable: function(windowElement) {
        const resizeHandle = windowElement.querySelector('.resize-handle');
        if (!resizeHandle) return;
        
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        
        resizeHandle.addEventListener('mousedown', initResize);
        
        function initResize(e) {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(windowElement).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(windowElement).height, 10);
            
            document.addEventListener('mousemove', doResize);
            document.addEventListener('mouseup', stopResize);
            
            e.preventDefault();
            e.stopPropagation();
        }
        
        function doResize(e) {
            if (!isResizing) return;
            
            const newWidth = startWidth + e.clientX - startX;
            const newHeight = startHeight + e.clientY - startY;
            
            // Применяем ограничения размера
            const constraints = WindowManager.getSizeConstraints(windowElement);
            const constrainedWidth = Math.max(constraints.minWidth, Math.min(newWidth, constraints.maxWidth));
            const constrainedHeight = Math.max(constraints.minHeight, Math.min(newHeight, constraints.maxHeight));
            
            windowElement.style.width = constrainedWidth + 'px';
            windowElement.style.height = constrainedHeight + 'px';
            
            // Проверяем, что окно не выходит за границы
            WindowManager.ensureWindowBounds(windowElement);
        }
        
        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', doResize);
            document.removeEventListener('mouseup', stopResize);
            
            // Сохраняем состояние окна после изменения размера
            WindowStateManager.saveWindowState(windowElement);
        }
    },
    
    /**
     * Получить ограничения размера для окна
     * @param {HTMLElement} windowElement - Элемент окна
     * @returns {Object} - Объект с ограничениями размера
     */
    getSizeConstraints: function(windowElement) {
        const trainingLayout = document.querySelector('.training-layout');
        let constraints = {
            minWidth: AppConfig.windows.minWidth,
            minHeight: AppConfig.windows.minHeight,
            maxWidth: 1200,
            maxHeight: 800
        };
        
        if (trainingLayout) {
            const layoutRect = trainingLayout.getBoundingClientRect();
            const windowRect = windowElement.getBoundingClientRect();
            
            const windowLeftInContainer = windowRect.left - layoutRect.left;
            const windowTopInContainer = windowRect.top - layoutRect.top;
            
            constraints.maxWidth = Math.max(constraints.minWidth, layoutRect.width - windowLeftInContainer - 20);
            constraints.maxHeight = Math.max(constraints.minHeight, layoutRect.height - windowTopInContainer - 20);
        }
        
        return constraints;
    },
    
    /**
     * Убедиться, что окно не выходит за границы контейнера
     * @param {HTMLElement} windowElement - Элемент окна
     */
    ensureWindowBounds: function(windowElement) {
        setTimeout(() => {
            const trainingLayout = document.querySelector('.training-layout');
            if (!trainingLayout) return;
            
            const updatedWindowRect = windowElement.getBoundingClientRect();
            const containerRect = trainingLayout.getBoundingClientRect();
            
            // Если окно выходит за правую границу
            if (updatedWindowRect.right > containerRect.right - 15) {
                const newLeft = containerRect.right - updatedWindowRect.width - 15;
                windowElement.style.left = Math.max(15, newLeft - containerRect.left) + 'px';
            }
            
            // Если окно выходит за нижнюю границу
            if (updatedWindowRect.bottom > containerRect.bottom - 15) {
                const newTop = containerRect.bottom - updatedWindowRect.height - 15;
                windowElement.style.top = Math.max(15, newTop - containerRect.top) + 'px';
            }
        }, 0);
    },
    
    /**
     * Добавить элементы управления окном
     * @param {HTMLElement} windowElement - Элемент окна
     */
    addWindowControls: function(windowElement) {
        const minimizeBtn = windowElement.querySelector('.minimize-btn');
        const maximizeBtn = windowElement.querySelector('.maximize-btn');
        const closeBtn = windowElement.querySelector('.close-btn');
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                if (!this.editMode) return;
                
                windowElement.classList.toggle('minimized');
                WindowStateManager.saveWindowState(windowElement);
            });
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
                if (!this.editMode) return;
                
                this.toggleMaximize(windowElement);
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeWindow(windowElement);
            });
        }
    },
    
    /**
     * Переключить максимизацию окна
     * @param {HTMLElement} windowElement - Элемент окна
     */
    toggleMaximize: function(windowElement) {
        const isMaximized = windowElement.classList.contains('maximized');
        
        if (!isMaximized) {
            // Сохраняем текущие размеры и позицию
            windowElement.setAttribute('data-original-width', windowElement.style.width || AppConfig.windows.defaultWidth);
            windowElement.setAttribute('data-original-height', windowElement.style.height || AppConfig.windows.defaultHeight);
            windowElement.setAttribute('data-original-left', windowElement.style.left || AppConfig.windows.defaultPosition.left);
            windowElement.setAttribute('data-original-top', windowElement.style.top || AppConfig.windows.defaultPosition.top);
            
            windowElement.classList.add('maximized');
        } else {
            // Восстанавливаем оригинальные размеры
            const originalWidth = windowElement.getAttribute('data-original-width');
            const originalHeight = windowElement.getAttribute('data-original-height');
            const originalLeft = windowElement.getAttribute('data-original-left');
            const originalTop = windowElement.getAttribute('data-original-top');
            
            if (originalWidth) windowElement.style.width = originalWidth;
            if (originalHeight) windowElement.style.height = originalHeight;
            if (originalLeft) windowElement.style.left = originalLeft;
            if (originalTop) windowElement.style.top = originalTop;
            
            windowElement.classList.remove('maximized');
        }
        
        WindowStateManager.saveWindowState(windowElement);
    },
    
    /**
     * Закрыть окно
     * @param {HTMLElement} windowElement - Элемент окна
     */
    closeWindow: function(windowElement) {
        windowElement.style.display = 'none';
        
        // Обновляем состояние чекбокса в выпадающем списке
        this.updateCheckboxState(windowElement);
        
        // Сохраняем состояние
        WindowStateManager.saveWindowState(windowElement);
        WindowStateManager.saveAllWindowStates();
        
        // Проверяем видимость заглушки
        if (window.AppManager) {
            window.AppManager.checkPlaceholderVisibility();
        }
    },
    
    /**
     * Обновить состояние чекбокса для окна
     * @param {HTMLElement} windowElement - Элемент окна
     */
    updateCheckboxState: function(windowElement) {
        const windowId = windowElement.id;
        let dataWindow = '';
        
        if (windowId === 'operators-errors-window') {
            dataWindow = 'operators-list';
        } else if (windowId === 'operator-details-window') {
            dataWindow = 'operator-details';
        }
        
        if (dataWindow) {
            const checkbox = document.querySelector(`input[data-window="${dataWindow}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
        }
    },
    
    /**
     * Установить режим редактирования
     * @param {boolean} enabled - Включить режим редактирования
     */
    setEditMode: function(enabled) {
        this.editMode = enabled;
        
        // Обновляем состояние кнопок
        document.querySelectorAll('.maximize-btn, .minimize-btn').forEach(btn => {
            if (enabled) {
                btn.classList.remove('disabled');
                btn.style.cursor = 'pointer';
                btn.title = btn.classList.contains('maximize-btn') ? 'Развернуть окно' : 'Свернуть окно';
            } else {
                btn.classList.add('disabled');
                btn.style.cursor = 'not-allowed';
                btn.title = btn.classList.contains('maximize-btn') 
                    ? 'Развертывание доступно только в режиме редактирования'
                    : 'Свертывание доступно только в режиме редактирования';
            }
        });
        
        // Показываем/скрываем кнопки закрытия
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.style.display = enabled ? 'block' : 'none';
        });
    }
};

// Экспорт для использования в других модулях
window.WindowManager = WindowManager;
