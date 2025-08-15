/**
 * Основной менеджер приложения
 * Координирует работу всех компонентов и управляет общей логикой
 */

const AppManager = {
    editMode: false,
    
    /**
     * Инициализация приложения
     */
    init: function() {
        console.log('Инициализация приложения...');
        
        // Инициализируем все компоненты
        this.initComponents();
        this.setupEventListeners();
        this.restoreState();
        
        console.log('Приложение успешно инициализировано');
    },
    
    /**
     * Инициализация компонентов
     */
    initComponents: function() {
        // Инициализация окон
        WindowManager.initializeWindows();
        
        // Восстановление состояния окон
        WindowStateManager.restoreAllWindowStates();
        
        // Настройка автосохранения
        setTimeout(() => {
            WindowStateManager.restoreAllWindowStates();
            WindowStateManager.setupAutoSave();
        }, 100);
    },
    
    /**
     * Настройка обработчиков событий
     */
    setupEventListeners: function() {
        // Обработчики для режима редактирования
        this.setupEditModeHandlers();
        
        // Обработчики для окон
        this.setupWindowHandlers();
        
        // Обработчики для чекбоксов
        this.setupCheckboxHandlers();
        
        // Обработчик для кнопки сброса
        this.setupResetHandler();
        
        // Обработчики для сайдбара
        this.setupSidebarHandlers();
        
        // Обработчики для выпадающих списков
        this.setupDropdownHandlers();
    },
    
    /**
     * Настройка обработчиков режима редактирования
     */
    setupEditModeHandlers: function() {
        const editorToggle = document.getElementById('editor-toggle');
        const saveBtn = document.getElementById('save-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const addRemoveBtn = document.getElementById('add-remove-btn');
        
        if (editorToggle) {
            editorToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.enterEditMode();
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exitEditMode();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exitEditMode();
            });
        }
        
        if (addRemoveBtn) {
            addRemoveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const dropdown = document.getElementById('window-selector-dropdown');
                dropdown.classList.toggle('show');
            });
        }
    },
    
    /**
     * Настройка обработчиков окон
     */
    setupWindowHandlers: function() {
        // Закрытие dropdown при клике вне его
        const windowSelectorDropdown = document.getElementById('window-selector-dropdown');
        const addRemoveBtn = document.getElementById('add-remove-btn');
        
        document.addEventListener('click', (e) => {
            if (windowSelectorDropdown && !windowSelectorDropdown.contains(e.target) && e.target !== addRemoveBtn) {
                windowSelectorDropdown.classList.remove('show');
            }
        });
    },
    
    /**
     * Настройка обработчиков чекбоксов
     */
    setupCheckboxHandlers: function() {
        const windowCheckboxes = document.querySelectorAll('.window-selector-item input[type="checkbox"]');
        windowCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const windowType = checkbox.getAttribute('data-window');
                const isChecked = checkbox.checked;
                
                console.log(`Окно "${windowType}" ${isChecked ? 'включено' : 'выключено'}`);
                
                if (isChecked) {
                    this.addWindow(windowType);
                } else {
                    this.removeWindow(windowType);
                }
            });
        });
    },
    
    /**
     * Настройка обработчика кнопки сброса
     */
    setupResetHandler: function() {
        const resetWindowsBtn = document.getElementById('reset-windows-btn');
        if (resetWindowsBtn) {
            resetWindowsBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleReset();
            });
        }
    },
    
    /**
     * Настройка обработчиков сайдбара
     */
    setupSidebarHandlers: function() {
        const sidebar = document.querySelector('.sidebar');
        const logoImg = document.getElementById('sidebar-logo-img');
        
        if (sidebar && logoImg) {
            sidebar.addEventListener('mouseenter', () => {
                logoImg.src = 'assets/logo.png';
                sidebar.classList.add('open');
                document.body.classList.add('sidebar-open');
                this.updateMaximizedWindowsSize();
            });
            
            sidebar.addEventListener('mouseleave', () => {
                logoImg.src = 'assets/mini.png';
                sidebar.classList.remove('open');
                document.body.classList.remove('sidebar-open');
                this.updateMaximizedWindowsSize();
            });
        }
        
        // Обработчики для выпадающего меню пользователя
        const headerUserImg = document.querySelector('.header-user-img');
        const headerDropdown = document.getElementById('header-dropdown');
        
        if (headerUserImg && headerDropdown) {
            headerUserImg.addEventListener('click', (e) => {
                headerDropdown.classList.toggle('show');
                e.stopPropagation();
            });
            
            document.addEventListener('click', (e) => {
                if (!headerDropdown.contains(e.target) && e.target !== headerUserImg) {
                    headerDropdown.classList.remove('show');
                }
            });
        }
    },
    
    /**
     * Настройка обработчиков выпадающих списков
     */
    setupDropdownHandlers: function() {
        // Кастомный select в заголовке
        const groupSelect = document.querySelector('.header-group-select');
        const groupSelected = document.querySelector('.header-group-selected');
        const groupList = document.querySelector('.header-group-list');
        const groupItems = document.querySelectorAll('.header-group-list li');
        
        if (groupSelect && groupSelected && groupList) {
            groupSelect.onclick = (e) => {
                groupList.classList.toggle('show');
            };
            
            groupItems.forEach(item => {
                item.onclick = (e) => {
                    groupSelected.textContent = item.textContent;
                    groupItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    groupList.classList.remove('show');
                    e.stopPropagation();
                };
            });
            
            document.addEventListener('click', (e) => {
                if (!groupSelect.contains(e.target)) {
                    groupList.classList.remove('show');
                }
            });
        }
    },
    
    /**
     * Вход в режим редактирования
     */
    enterEditMode: function() {
        this.editMode = true;
        WindowManager.setEditMode(true);
        
        document.body.classList.add('windows-edit-mode');
        
        const headerEditorControls = document.getElementById('header-editor-controls');
        headerEditorControls.style.display = 'flex';
        setTimeout(() => {
            headerEditorControls.classList.add('show');
        }, 10);
        
        // Закрываем dropdown
        const headerDropdown = document.getElementById('header-dropdown');
        headerDropdown.classList.remove('show');
        
        NotificationManager.show('Режим редактирования активирован. Теперь можно перемещать окна.', 'info');
        console.log('Режим редактирования активирован');
    },
    
    /**
     * Выход из режима редактирования
     */
    exitEditMode: function() {
        this.editMode = false;
        WindowManager.setEditMode(false);
        
        document.body.classList.remove('windows-edit-mode');
        
        const headerEditorControls = document.getElementById('header-editor-controls');
        headerEditorControls.classList.remove('show');
        
        // Скрываем dropdown окон при выходе из режима редактирования
        const windowSelectorDropdown = document.getElementById('window-selector-dropdown');
        if (windowSelectorDropdown) {
            windowSelectorDropdown.classList.remove('show');
        }
        
        setTimeout(() => {
            headerEditorControls.style.display = 'none';
        }, 300);
        
        console.log('Режим редактирования деактивирован');
    },
    
    /**
     * Добавить окно
     * @param {string} windowType - Тип окна
     */
    addWindow: function(windowType) {
        console.log(`Добавляем окно: ${windowType}`);
        
        if (windowType === 'operators-list') {
            const operatorsWindow = document.getElementById('operators-errors-window');
            if (operatorsWindow) {
                operatorsWindow.style.display = 'flex';
                if (window.OperatorsManager) {
                    window.OperatorsManager.initOperatorsList();
                }
                WindowStateManager.saveWindowState(operatorsWindow);
            }
        } else if (windowType === 'operator-details') {
            const detailsWindow = document.getElementById('operator-details-window');
            if (detailsWindow) {
                detailsWindow.style.display = 'flex';
                WindowStateManager.saveWindowState(detailsWindow);
            }
        }
        
        this.checkPlaceholderVisibility();
    },
    
    /**
     * Удалить окно
     * @param {string} windowType - Тип окна
     */
    removeWindow: function(windowType) {
        console.log(`Удаляем окно: ${windowType}`);
        
        if (windowType === 'operators-list') {
            const operatorsWindow = document.getElementById('operators-errors-window');
            if (operatorsWindow) {
                operatorsWindow.style.display = 'none';
                WindowStateManager.saveWindowState(operatorsWindow);
            }
        } else if (windowType === 'operator-details') {
            const detailsWindow = document.getElementById('operator-details-window');
            if (detailsWindow) {
                detailsWindow.style.display = 'none';
                WindowStateManager.saveWindowState(detailsWindow);
            }
        }
        
        WindowStateManager.saveAllWindowStates();
        this.checkPlaceholderVisibility();
    },
    
    /**
     * Проверить видимость заглушки
     */
    checkPlaceholderVisibility: function() {
        const placeholder = document.querySelector('.training-placeholder');
        if (!placeholder) return;
        
        // Проверяем конкретные окна
        const operatorsWindow = document.getElementById('operators-errors-window');
        const detailsWindow = document.getElementById('operator-details-window');
        
        const operatorsVisible = operatorsWindow && 
            operatorsWindow.style.display !== 'none' && 
            getComputedStyle(operatorsWindow).display !== 'none';
            
        const detailsVisible = detailsWindow && 
            detailsWindow.style.display !== 'none' && 
            getComputedStyle(detailsWindow).display !== 'none';
        
        // Скрываем или показываем заглушку
        if (operatorsVisible || detailsVisible) {
            placeholder.style.display = 'none';
        } else {
            placeholder.style.display = 'block';
        }
    },
    
    /**
     * Обработка сброса настроек
     */
    async handleReset() {
        const confirmed = await ModalManager.showConfirm(
            'Сброс настроек окон',
            'Вы уверены, что хотите сбросить все настройки окон? Это действие нельзя отменить.',
            'Сбросить',
            'Отмена'
        );
        
        if (confirmed) {
            this.resetAllWindows();
        }
    },
    
    /**
     * Сброс всех окон к исходному состоянию
     */
    resetAllWindows: function() {
        // Очищаем сохраненные состояния
        WindowStateManager.clearStates();
        
        // Сбрасываем все окна к исходному состоянию - все скрыты
        const windows = document.querySelectorAll('.training-window');
        windows.forEach(window => {
            window.style.display = 'none';
            window.style.width = AppConfig.windows.defaultWidth;
            window.style.height = AppConfig.windows.defaultHeight;
            window.style.left = AppConfig.windows.defaultPosition.left;
            window.style.top = AppConfig.windows.defaultPosition.top;
            window.style.zIndex = 'auto';
            window.classList.remove('maximized', 'minimized');
        });
        
        // Сбрасываем все чекбоксы к неактивному состоянию
        const checkboxes = document.querySelectorAll('.window-selector-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Показываем заглушку
        setTimeout(() => {
            this.checkPlaceholderVisibility();
        }, 200);
        
        NotificationManager.show('Настройки окон сброшены. Все окна скрыты.', 'info');
        console.log('Настройки окон сброшены к исходному состоянию - все окна скрыты');
    },
    
    /**
     * Обновление размеров максимизированных окон
     */
    updateMaximizedWindowsSize: function() {
        console.log('Размеры training-layout автоматически обновились');
    },
    
    /**
     * Восстановление состояния приложения
     */
    restoreState: function() {
        // Автоматически инициализируем окно операторов если оно отмечено как включенное
        setTimeout(() => {
            const operatorsCheckbox = document.querySelector('input[data-window="operators-list"]');
            const operatorsWindow = document.getElementById('operators-errors-window');
            
            if (operatorsCheckbox && operatorsCheckbox.checked && operatorsWindow) {
                if (operatorsWindow.style.display === 'none') {
                    this.addWindow('operators-list');
                } else if (operatorsWindow.style.display === 'flex' || operatorsWindow.style.display === '') {
                    if (window.OperatorsManager) {
                        window.OperatorsManager.initOperatorsList();
                    }
                }
            }
        }, 200);
        
        // Проверяем видимость заглушки при загрузке
        this.checkPlaceholderVisibility();
    }
};

// Экспорт для использования в других модулях
window.AppManager = AppManager;
