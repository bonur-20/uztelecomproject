/* sidebar-pin-manager.js - Управление функцией закрепления сайдбара */

class SidebarPinManager {
    constructor() {
        this.isPinned = false;
        this.pinMode = 'none'; // 'none', 'collapsed', 'expanded'
        this.sidebar = null;
        this.pinButtonCollapsed = null;
        this.pinButtonExpanded = null;
        this.menuSelector = null;
        this.overlay = null;
        this.menuItems = [];
        this.activeNotifications = new Set(); // Отслеживаем активные уведомления
        
        this.init();
    }
    
    init() {
        this.initElements();
        // ВРЕМЕННО ОТКЛЮЧЕНО: создание селектора меню
        // this.createMenuSelector();
        this.setupEventListeners();
        // ВРЕМЕННО ОТКЛЮЧЕНО: настройка пунктов меню
        // this.setupMenuItems();
        
        console.log('SidebarPinManager инициализирован (селектор меню отключен)');
    }
    
    initElements() {
        // Находим новые кнопки в сайдбаре
        this.pinButtonCollapsed = document.getElementById('sidebar-pin-collapsed-btn');
        this.pinButtonExpanded = document.getElementById('sidebar-pin-expanded-btn');
        this.sidebar = document.querySelector('.sidebar-figma');
        
        if (!this.pinButtonCollapsed || !this.pinButtonExpanded) {
            console.error('Кнопки закрепления не найдены');
            return;
        }
        
        if (!this.sidebar) {
            console.error('Сайдбар не найден');
            return;
        }
    }
    
    createMenuSelector() {
        // Создаем оверлей
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-menu-selector-overlay';
        document.body.appendChild(this.overlay);
        
        // Создаем селектор меню
        this.menuSelector = document.createElement('div');
        this.menuSelector.className = 'sidebar-menu-selector';
        this.menuSelector.id = 'sidebar-menu-selector';
        
        this.menuSelector.innerHTML = `
            <div class="sidebar-menu-selector-header">
                <span class="material-icons">menu</span>
                <span>Меню навигации</span>
            </div>
            <div class="sidebar-menu-selector-list" id="sidebar-menu-list">
                <!-- Пункты меню будут добавлены динамически -->
            </div>
        `;
        
        document.body.appendChild(this.menuSelector);
    }
    
    setupMenuItems() {
        // Получаем все пункты меню из сайдбара
        const sidebarMenuItems = document.querySelectorAll('.sidebar-menu-figma a');
        const menuList = document.getElementById('sidebar-menu-list');
        
        if (!menuList) return;
        
        this.menuItems = [];
        menuList.innerHTML = '';
        
        sidebarMenuItems.forEach((item, index) => {
            const icon = item.querySelector('.material-icons');
            const label = item.querySelector('.sidebar-label');
            const badge = item.querySelector('.sidebar-badge');
            
            if (!icon) return;
            
            const menuItem = {
                index: index,
                icon: icon.textContent,
                label: label ? label.textContent : `Пункт ${index + 1}`,
                badge: badge ? badge.textContent : null,
                originalElement: item,
                isActive: item.classList.contains('active')
            };
            
            this.menuItems.push(menuItem);
            
            // Создаем элемент в селекторе
            const selectorItem = document.createElement('div');
            selectorItem.className = `sidebar-menu-selector-item ${menuItem.isActive ? 'active' : ''}`;
            selectorItem.setAttribute('data-menu-index', index);
            
            selectorItem.innerHTML = `
                <span class="material-icons">${menuItem.icon}</span>
                <span class="menu-item-label">${menuItem.label}</span>
                ${menuItem.badge ? `<span class="menu-item-badge">${menuItem.badge}</span>` : ''}
            `;
            
            menuList.appendChild(selectorItem);
            
            // Добавляем обработчик клика
            selectorItem.addEventListener('click', () => {
                this.selectMenuItem(index);
            });
        });
    }
    
    setupEventListeners() {
        // Обработчик для кнопки закрепления в закрытом виде
        if (this.pinButtonCollapsed) {
            this.pinButtonCollapsed.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('🖱️ Клик по кнопке закрепления в закрытом виде');
                this.togglePin('collapsed');
            });
        }
        
        // Обработчик для кнопки закрепления в открытом виде
        if (this.pinButtonExpanded) {
            this.pinButtonExpanded.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('🖱️ Клик по кнопке закрепления в открытом виде');
                this.togglePin('expanded');
            });
        }
        
        // Обработчик для оверлея (закрытие селектора)
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.hideMenuSelector();
            });
        }
        
        // Обработчик для клика вне селектора
        document.addEventListener('click', (e) => {
            if (this.menuSelector && 
                !this.menuSelector.contains(e.target) && 
                !this.pinButtonCollapsed.contains(e.target) &&
                !this.pinButtonExpanded.contains(e.target)) {
                this.hideMenuSelector();
            }
        });
        
        // Обработчик для клика по зафиксированному сайдбару
        document.addEventListener('click', (e) => {
            if (this.isPinned && this.sidebar && this.sidebar.contains(e.target)) {
                // Исключаем клики по кнопке выхода
                const exitButton = e.target.closest('.sidebar-exit');
                if (exitButton) {
                    return; // Позволяем стандартное поведение для кнопки выхода
                }
                
                // Исключаем клики по ссылкам в меню сайдбара
                const menuLink = e.target.closest('.sidebar-menu-figma a');
                if (menuLink) {
                    // Если ссылка имеет href и это не якорная ссылка
                    const href = menuLink.getAttribute('href');
                    if (href && href !== '#' && href.trim() !== '') {
                        // Позволяем стандартное поведение ссылки
                        console.log('Переход по ссылке:', href);
                        return;
                    }
                }
                
                e.preventDefault();
                e.stopPropagation();
                
                // ВРЕМЕННО ОТКЛЮЧЕНО: Показ селектора меню
                // this.showMenuSelector();
                
                console.log('Клик по зафиксированному сайдбару (функциональность временно отключена)');
            }
        });
        
        // Обработчик для изменения размера окна
        window.addEventListener('resize', () => {
            if (this.isPinned) {
                this.adjustMenuSelectorPosition();
            }
        });
    }
    
    togglePin(mode = 'collapsed') {
        console.log(`🔄 togglePin вызван с режимом: ${mode}, текущий режим: ${this.pinMode}, закреплен: ${this.isPinned}`);
        
        if (this.pinMode === mode && this.isPinned) {
            // Если уже закреплен в этом режиме - открепляем
            this.unpinSidebar();
        } else {
            // Иначе закрепляем в указанном режиме
            this.pinSidebar(mode);
        }
    }
    
    pinSidebar(mode = 'collapsed') {
        if (!this.sidebar) return;
        
        console.log(`🔒 Начинаем фиксацию в режиме: ${mode}`);
        
        // Если уже закреплен в другом режиме, сначала открепляем
        if (this.isPinned && this.pinMode !== mode) {
            console.log(`⚡ Переключение с режима ${this.pinMode} на ${mode}`);
            this.unpinSidebar();
        }
        
        this.isPinned = true;
        this.pinMode = mode;
        
        // Добавляем классы для зафиксированного состояния
        document.body.classList.add('sidebar-pinned', `sidebar-pinned-${mode}`);
        this.sidebar.classList.add('sidebar-pinned', `sidebar-pinned-${mode}`);
        
        // Обновляем состояние кнопок
        this.updateButtonStates();
        
        // Удаляем обработчики hover с сайдбара
        this.sidebar.removeAttribute('onmouseenter');
        this.sidebar.removeAttribute('onmouseleave');
        
        if (mode === 'collapsed') {
            this.sidebar.classList.remove('open');
            this.ensureMiniLogo();
            document.body.classList.remove('sidebar-open');
            console.log('🔹 Применен режим collapsed - сайдбар закрыт');
        } else if (mode === 'expanded') {
            // Принудительно открываем сайдбар
            this.sidebar.classList.add('open');
            this.ensureFullLogo();
            document.body.classList.add('sidebar-open');
            console.log('🔸 Применен режим expanded - сайдбар открыт');
            
            // Исправляем позицию логотипа в расширенном режиме
            this.fixLogoPosition();
            
            // Дополнительная проверка через таймаут
            setTimeout(() => {
                if (!this.sidebar.classList.contains('open')) {
                    console.log('🔄 Повторное применение open класса');
                    this.sidebar.classList.add('open');
                    document.body.classList.add('sidebar-open');
                }
                // Повторная коррекция позиции логотипа
                this.fixLogoPosition();
            }, 100);
        }
        
        console.log(`🔒 Сайдбар зафиксирован в ${mode === 'collapsed' ? 'закрытом' : 'открытом'} состоянии`);
        this.showNotification(`Сайдбар зафиксирован в ${mode === 'collapsed' ? 'закрытом' : 'открытом'} виде`, 'info');
        
        // Обновляем размеры максимизированных окон
        this.updateMaximizedWindows();
    }
    
    unpinSidebar() {
        if (!this.sidebar) return;
        
        this.isPinned = false;
        this.pinMode = null;
        
        // Убираем классы для зафиксированного состояния
        document.body.classList.remove('sidebar-pinned', 'sidebar-pinned-collapsed', 'sidebar-pinned-expanded');
        this.sidebar.classList.remove('sidebar-pinned', 'sidebar-pinned-collapsed', 'sidebar-pinned-expanded');
        
        // Обновляем состояние кнопок
        this.updateButtonStates();
        
        // Восстанавливаем обработчики hover
        this.sidebar.setAttribute('onmouseenter', "this.classList.add('open')");
        this.sidebar.setAttribute('onmouseleave', "this.classList.remove('open')");
        
        // При откреплении автоматически открываем сайдбар
        this.sidebar.classList.add('open');
        document.body.classList.add('sidebar-open');
        
        // Устанавливаем полный логотип для открытого состояния
        setTimeout(() => {
            this.ensureFullLogo();
            console.log('🔄 Сайдбар автоматически открыт после открепления - устанавливаем полный логотип');
        }, 100);
        
        // Сбрасываем позицию логотипа
        this.fixLogoPosition();
        
        // Показываем уведомление
        this.showNotification('Сайдбар откреплен', 'info');
        
        console.log('🔓 Сайдбар откреплен');
        
        // Обновляем размеры максимизированных окон
        this.updateMaximizedWindows();
    }
    
    showMenuSelector() {
        if (!this.menuSelector || !this.isPinned) return;
        
        this.adjustMenuSelectorPosition();
        this.menuSelector.classList.add('show');
        this.overlay.classList.add('show');
        
        // Обновляем активные элементы
        this.updateActiveMenuItem();
    }
    
    hideMenuSelector() {
        if (!this.menuSelector) return;
        
        this.menuSelector.classList.remove('show');
        this.overlay.classList.remove('show');
    }
    
    adjustMenuSelectorPosition() {
        if (!this.menuSelector || !this.sidebar) return;
        
        const sidebarRect = this.sidebar.getBoundingClientRect();
        const headerHeight = document.querySelector('.header-fixed')?.offsetHeight || 70;
        
        this.menuSelector.style.top = `${headerHeight + 10}px`;
        this.menuSelector.style.left = `${sidebarRect.right + 10}px`;
    }
    
    updateActiveMenuItem() {
        const activeItem = document.querySelector('.sidebar-menu-figma a.active');
        const selectorItems = document.querySelectorAll('.sidebar-menu-selector-item');
        
        // Убираем активность со всех элементов селектора
        selectorItems.forEach(item => item.classList.remove('active'));
        
        // Находим и активируем соответствующий элемент
        if (activeItem) {
            const activeIndex = Array.from(document.querySelectorAll('.sidebar-menu-figma a')).indexOf(activeItem);
            const correspondingSelectorItem = document.querySelector(`[data-menu-index="${activeIndex}"]`);
            
            if (correspondingSelectorItem) {
                correspondingSelectorItem.classList.add('active');
            }
        }
    }
    
    selectMenuItem(index) {
        const menuItems = document.querySelectorAll('.sidebar-menu-figma a');
        const selectedItem = menuItems[index];
        
        if (!selectedItem) return;
        
        // Убираем активность со всех пунктов меню
        menuItems.forEach(item => item.classList.remove('active'));
        
        // Активируем выбранный пункт
        selectedItem.classList.add('active');
        
        // Обновляем селектор
        this.updateActiveMenuItem();
        
        // Обрабатываем специальные случаи навигации
        const href = selectedItem.getAttribute('href');
        const target = selectedItem.getAttribute('target');
        
        if (href && href !== '#') {
            if (target === '_blank') {
                // Открываем в новой вкладке
                window.open(href, '_blank');
            } else {
                // Переходим по ссылке
                window.location.href = href;
            }
        } else {
            // Имитируем клик по пункту меню для других обработчиков
            selectedItem.click();
        }
        
        // Скрываем селектор
        this.hideMenuSelector();
        
        const label = this.menuItems[index]?.label || `Пункт ${index + 1}`;
        console.log(`Выбран пункт меню: ${label}`);
        
        // Показываем уведомление
        this.showNotification(`Выбран пункт: ${label}`, 'success');
    }
    
    showNotification(message, type = 'info') {
        // Проверяем, есть ли уже такое уведомление
        const notificationKey = `${message}-${type}`;
        if (this.activeNotifications.has(notificationKey)) {
            return; // Не показываем дублирующееся уведомление
        }
        
        // Добавляем в список активных уведомлений
        this.activeNotifications.add(notificationKey);
        
        // Используем существующую функцию уведомлений, если она есть
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            // Удаляем из активных через 3 секунды
            setTimeout(() => {
                this.activeNotifications.delete(notificationKey);
            }, 3000);
            return;
        }
        
        // Создаем простое уведомление
        const notification = document.createElement('div');
        notification.className = `pin-notification pin-notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            max-width: 300px;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // Удаление уведомления
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                // Удаляем из списка активных уведомлений
                this.activeNotifications.delete(notificationKey);
            }, 300);
        }, 3000);
    }
    
    /**
     * Гарантированная установка mini логотипа
     */
    ensureMiniLogo() {
        const logoImg = document.getElementById('sidebar-logo-img');
        if (!logoImg) return;
        
        // Проверяем, открыт ли сайдбар
        const isOpen = this.sidebar && this.sidebar.classList.contains('open');
        
        if (isOpen) {
            // Если сайдбар открыт, устанавливаем полный логотип
            logoImg.src = 'assets/logo.png';
            console.log('🔄 Сайдбар открыт - устанавливаем полный логотип вместо мини');
            return;
        }
        
        // Принудительно устанавливаем src
        logoImg.src = 'assets/mini.png';
        
        // Убираем возможные CSS переопределения
        logoImg.style.content = '';
        logoImg.style.backgroundImage = '';
        
        // Проверяем через небольшую задержку
        setTimeout(() => {
            const currentIsOpen = this.sidebar && this.sidebar.classList.contains('open');
            if (currentIsOpen && !logoImg.src.includes('logo.png')) {
                logoImg.src = 'assets/logo.png';
                console.log('Логотип переключен на полный из-за открытого состояния');
            } else if (!currentIsOpen && !logoImg.src.includes('mini.png')) {
                logoImg.src = 'assets/mini.png';
                console.log('Логотип восстановлен принудительно');
            }
        }, 50);
        
        // Дополнительная проверка через большую задержку
        setTimeout(() => {
            const finalIsOpen = this.sidebar && this.sidebar.classList.contains('open');
            if (finalIsOpen && !logoImg.src.includes('logo.png')) {
                logoImg.src = 'assets/logo.png';
                logoImg.setAttribute('src', 'assets/logo.png');
                console.log('Логотип переключен на полный через setAttribute');
            } else if (!finalIsOpen && !logoImg.src.includes('mini.png')) {
                logoImg.src = 'assets/mini.png';
                logoImg.setAttribute('src', 'assets/mini.png');
                console.log('Логотип восстановлен через setAttribute');
            }
        }, 200);
    }

    /**
     * Исправляет позицию логотипа в расширенном режиме
     */
    fixLogoPosition() {
        const logoImg = document.getElementById('sidebar-logo-img');
        if (!logoImg) return;
        
        console.log('🔧 Исправляем позицию логотипа');
        
        // Принудительно сбрасываем все возможные смещения
        logoImg.style.marginLeft = '0px';
        logoImg.style.marginRight = '0px';
        logoImg.style.left = '0px';
        logoImg.style.right = '0px';
        logoImg.style.transform = 'none';
        logoImg.style.position = 'static';
        logoImg.style.float = 'none';
        logoImg.style.clear = 'both';
        
        // Также исправляем контейнер логотипа
        const logoContainer = logoImg.closest('.sidebar-logo');
        if (logoContainer) {
            logoContainer.style.justifyContent = 'center';
            logoContainer.style.alignItems = 'center';
            logoContainer.style.textAlign = 'center';
        }
        
        console.log('✅ Позиция логотипа исправлена');
    }

    /**
     * Гарантированная установка полного логотипа
     */
    ensureFullLogo() {
        const logoImg = document.getElementById('sidebar-logo-img');
        if (!logoImg) return;
        
        console.log('🖼️ Устанавливаем полный логотип');
        
        // Принудительно устанавливаем полный логотип
        logoImg.src = 'assets/logo.png';
        
        // Убираем возможные CSS переопределения
        logoImg.style.content = '';
        logoImg.style.backgroundImage = '';
        
        // Проверяем через небольшую задержку
        setTimeout(() => {
            if (!logoImg.src.includes('logo.png')) {
                logoImg.src = 'assets/logo.png';
                logoImg.setAttribute('src', 'assets/logo.png');
                console.log('✅ Полный логотип установлен принудительно через setAttribute');
            } else {
                console.log('✅ Полный логотип установлен успешно');
            }
        }, 50);
        
        // Дополнительная проверка через большую задержку
        setTimeout(() => {
            if (!logoImg.src.includes('logo.png')) {
                logoImg.src = 'assets/logo.png';
                logoImg.setAttribute('src', 'assets/logo.png');
                console.log('🔄 Повторная установка полного логотипа через setAttribute');
            }
        }, 200);
    }

    /**
     * Обновляет состояние кнопок закрепления
     */
    updateButtonStates() {
        if (!this.pinButtonCollapsed || !this.pinButtonExpanded) return;
        
        // Сбрасываем активное состояние с обеих кнопок
        this.pinButtonCollapsed.classList.remove('active');
        this.pinButtonExpanded.classList.remove('active');
        
        // Активируем соответствующую кнопку
        if (this.isPinned) {
            if (this.pinMode === 'collapsed') {
                this.pinButtonCollapsed.classList.add('active');
            } else if (this.pinMode === 'expanded') {
                this.pinButtonExpanded.classList.add('active');
            }
        }
    }

    /**
     * Обновляет размеры максимизированных окон
     */
    updateMaximizedWindows() {
        // Проверяем, есть ли в проекте window manager
        if (typeof window.windowManager !== 'undefined' && window.windowManager.updateMaximizedWindows) {
            window.windowManager.updateMaximizedWindows();
        }
        
        // Альтернативный вариант - поиск максимизированных окон напрямую
        const maximizedWindows = document.querySelectorAll('.window.maximized');
        maximizedWindows.forEach(window => {
            // Запускаем пересчет размеров
            const resizeEvent = new Event('resize');
            window.dispatchEvent(resizeEvent);
        });
    }

    // Публичные методы для внешнего управления
    getState() {
        return {
            isPinned: this.isPinned,
            menuItems: this.menuItems
        };
    }
    
    isPinnedState() {
        return this.isPinned;
    }
    
    forceUnpin() {
        if (this.isPinned) {
            this.unpinSidebar();
        }
    }
    
    forcePin() {
        if (!this.isPinned) {
            this.pinSidebar();
        }
    }
    
    refreshMenuItems() {
        this.setupMenuItems();
        console.log('Пункты меню обновлены');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Ждем полной загрузки всех элементов
    setTimeout(() => {
        window.sidebarPinManager = new SidebarPinManager();
    }, 500);
});

// Экспорт для использования в других модулях
window.SidebarPinManager = SidebarPinManager;

// Глобальная функция для проверки состояния закрепления
window.isSidebarPinned = function() {
    return window.sidebarPinManager ? window.sidebarPinManager.isPinnedState() : false;
};
