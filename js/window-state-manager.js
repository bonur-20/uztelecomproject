/**
 * Система управления состоянием окон
 * Отвечает за сохранение, восстановление и очистку состояний окон
 */

const WindowStateManager = {
    storageKey: AppConfig.storage.windowStatesKey,
    
    /**
     * Сохранение состояния конкретного окна
     * @param {HTMLElement} windowElement - Элемент окна
     */
    saveWindowState: function(windowElement) {
        const windowId = windowElement.id;
        if (!windowId) return;
        
        const state = {
            width: windowElement.style.width || AppConfig.windows.defaultWidth,
            height: windowElement.style.height || AppConfig.windows.defaultHeight,
            left: windowElement.style.left || AppConfig.windows.defaultPosition.left,
            top: windowElement.style.top || AppConfig.windows.defaultPosition.top,
            zIndex: windowElement.style.zIndex || 'auto',
            visible: windowElement.style.display !== 'none',
            maximized: windowElement.classList.contains('maximized'),
            minimized: windowElement.classList.contains('minimized')
        };
        this.saveState(windowId, state);
    },
    
    /**
     * Сохранение состояния всех окон
     */
    saveAllWindowStates: function() {
        const windows = document.querySelectorAll('.training-window');
        windows.forEach(window => {
            this.saveWindowState(window);
        });
        
        // Сохраняем состояние чекбоксов
        const checkboxStates = {};
        const checkboxes = document.querySelectorAll('.window-selector-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const windowType = checkbox.getAttribute('data-window');
            if (windowType) {
                checkboxStates[windowType] = checkbox.checked;
            }
        });
        localStorage.setItem(AppConfig.storage.checkboxStatesKey, JSON.stringify(checkboxStates));
        
        console.log('Состояние всех окон сохранено');
    },
    
    /**
     * Сохранение состояния конкретного окна в localStorage
     * @param {string} windowId - ID окна
     * @param {Object} state - Состояние окна
     */
    saveState: function(windowId, state) {
        const savedStates = this.getAllStates();
        savedStates[windowId] = state;
        localStorage.setItem(this.storageKey, JSON.stringify(savedStates));
    },
    
    /**
     * Получение всех сохраненных состояний
     * @returns {Object} - Объект с состояниями всех окон
     */
    getAllStates: function() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : {};
    },
    
    /**
     * Получение состояния конкретного окна
     * @param {string} windowId - ID окна
     * @returns {Object|null} - Состояние окна или null
     */
    getWindowState: function(windowId) {
        const states = this.getAllStates();
        return states[windowId] || null;
    },
    
    /**
     * Очистка всех сохраненных состояний
     */
    clearStates: function() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(AppConfig.storage.checkboxStatesKey);
        console.log('Все сохраненные состояния окон очищены');
    },
    
    /**
     * Восстановление состояния конкретного окна
     * @param {HTMLElement} windowElement - Элемент окна
     */
    restoreWindowState: function(windowElement) {
        const windowId = windowElement.id;
        if (!windowId) return;
        
        const state = this.getWindowState(windowId);
        if (!state) return;
        
        // Восстанавливаем размеры и позицию
        windowElement.style.width = state.width;
        windowElement.style.height = state.height;
        windowElement.style.left = state.left;
        windowElement.style.top = state.top;
        
        if (state.zIndex !== 'auto') {
            windowElement.style.zIndex = state.zIndex;
        }
        
        // Восстанавливаем состояние максимизации/минимизации
        if (state.maximized) {
            windowElement.classList.add('maximized');
        } else {
            windowElement.classList.remove('maximized');
        }
        
        if (state.minimized) {
            windowElement.classList.add('minimized');
        } else {
            windowElement.classList.remove('minimized');
        }
        
        // Восстанавливаем видимость
        if (state.visible) {
            windowElement.style.display = 'flex';
            
            // Для окна операторов инициализируем данные
            if (windowId === 'operators-errors-window') {
                setTimeout(() => {
                    if (window.OperatorsManager) {
                        window.OperatorsManager.initOperatorsList();
                    }
                }, 100);
            }
        } else {
            windowElement.style.display = 'none';
        }
        
        console.log(`Состояние окна ${windowId} восстановлено`);
    },
    
    /**
     * Восстановление состояния всех окон
     */
    restoreAllWindowStates: function() {
        // Восстанавливаем состояние чекбоксов
        const checkboxStates = localStorage.getItem(AppConfig.storage.checkboxStatesKey);
        if (checkboxStates) {
            try {
                const states = JSON.parse(checkboxStates);
                Object.keys(states).forEach(windowType => {
                    const checkbox = document.querySelector(`input[data-window="${windowType}"]`);
                    if (checkbox) {
                        checkbox.checked = states[windowType];
                    }
                });
            } catch (e) {
                console.error('Ошибка при восстановлении состояния чекбоксов:', e);
            }
        }
        
        // Восстанавливаем состояние окон
        const windows = document.querySelectorAll('.training-window');
        windows.forEach(window => {
            this.restoreWindowState(window);
        });
        
        console.log('Состояние всех окон восстановлено');
    },
    
    /**
     * Настройка автосохранения при изменениях
     */
    setupAutoSave: function() {
        // Сохранение при изменении размера окон
        const resizeObserver = new ResizeObserver(entries => {
            entries.forEach(entry => {
                const element = entry.target;
                if (element.classList.contains('training-window')) {
                    setTimeout(() => {
                        this.saveWindowState(element);
                    }, AppConfig.autoSave.delay);
                }
            });
        });
        
        // Наблюдаем за всеми окнами
        document.querySelectorAll('.training-window').forEach(window => {
            resizeObserver.observe(window);
        });
        
        // Сохранение при изменении DOM (добавление/удаление окон)
        const mutationObserver = new MutationObserver(mutations => {
            let shouldSave = false;
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    const element = mutation.target;
                    if (element.classList.contains('training-window')) {
                        shouldSave = true;
                    }
                }
            });
            
            if (shouldSave) {
                setTimeout(() => {
                    this.saveAllWindowStates();
                }, AppConfig.autoSave.delay);
            }
        });
        
        // Наблюдаем за изменениями в контейнере окон
        const trainingLayout = document.querySelector('.training-layout');
        if (trainingLayout) {
            mutationObserver.observe(trainingLayout, {
                attributes: true,
                subtree: true,
                attributeFilter: ['style', 'class']
            });
        }
        
        console.log('Автосохранение настроено');
    }
};

// Экспорт для использования в других модулях
window.WindowStateManager = WindowStateManager;
