/**
 * ===== APP INITIALIZATION =====
 * Главный файл инициализации приложения
 * Загружает и инициализирует все модули в правильном порядке
 */

// Глобальная конфигурация приложения
window.APP_CONFIG = {
    version: '2.0.0',
    debug: true,
    apiEndpoint: '/api',
    maxNotifications: 5,
    autoSaveInterval: 30000, // 30 секунд
    windowAnimationDuration: 300,
    defaultWindowSize: { width: 320, height: 220 },
    
    // Настройки для различных модулей
    modules: {
        notifications: {
            autoHide: true,
            duration: 5000,
            position: 'top-right'
        },
        windows: {
            enableDrag: true,
            enableResize: true,
            snapToGrid: false,
            gridSize: 10
        },
        operators: {
            refreshInterval: 60000, // 1 минута
            maxDisplayed: 100
        }
    }
};

/**
 * Менеджер загрузки и инициализации модулей
 */
class AppInitializer {
    constructor() {
        this.modules = new Map();
        this.loadingPromises = new Map();
        this.initOrder = [
            'config',
            'notifications',
            'modals', 
            'windowState',
            'windowManager',
            'operatorManager',
            'operatorUI',
            'appManager'
        ];
        this.isInitialized = false;
    }

    /**
     * Регистрация модуля
     */
    registerModule(name, moduleInstance) {
        if (this.modules.has(name)) {
            console.warn(`Модуль ${name} уже зарегистрирован`);
            return;
        }
        
        this.modules.set(name, moduleInstance);
        
        if (window.APP_CONFIG.debug) {
            console.log(`✓ Модуль ${name} зарегистрирован`);
        }
    }

    /**
     * Получение модуля по имени
     */
    getModule(name) {
        return this.modules.get(name);
    }

    /**
     * Проверка готовности всех модулей
     */
    checkModulesReady() {
        const requiredModules = this.initOrder;
        const missingModules = [];

        for (const moduleName of requiredModules) {
            if (!this.modules.has(moduleName)) {
                missingModules.push(moduleName);
            }
        }

        if (missingModules.length > 0) {
            console.error('Отсутствуют модули:', missingModules);
            return false;
        }

        return true;
    }

    /**
     * Инициализация всех модулей
     */
    async initializeModules() {
        if (this.isInitialized) {
            console.warn('Приложение уже инициализировано');
            return;
        }

        try {
            console.log('🚀 Начинаем инициализацию приложения...');

            // Проверяем готовность модулей
            if (!this.checkModulesReady()) {
                throw new Error('Не все необходимые модули загружены');
            }

            // Инициализируем модули в правильном порядке
            for (const moduleName of this.initOrder) {
                const module = this.modules.get(moduleName);
                
                if (module && typeof module.init === 'function') {
                    console.log(`⚙️ Инициализация модуля: ${moduleName}`);
                    await module.init();
                } else {
                    console.warn(`Модуль ${moduleName} не имеет метода init()`);
                }
            }

            this.isInitialized = true;
            console.log('✅ Все модули успешно инициализированы');

            // Уведомляем об успешной загрузке
            this.dispatchEvent('appReady');
            
        } catch (error) {
            console.error('❌ Ошибка при инициализации приложения:', error);
            this.dispatchEvent('appError', { error });
        }
    }

    /**
     * Отправка пользовательского события
     */
    dispatchEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { 
            detail: { ...data, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }

    /**
     * Проверка состояния приложения
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            modulesCount: this.modules.size,
            modules: Array.from(this.modules.keys()),
            version: window.APP_CONFIG.version
        };
    }
}

// Создаем глобальный экземпляр инициализатора
window.AppInitializer = new AppInitializer();

// Функции для обратной совместимости
window.showTrainingForm = function(errorId) {
    if (window.OperatorsManager) {
        window.OperatorsManager.showTrainingForm(errorId);
    }
};

window.saveTrainingComment = function(errorId) {
    if (window.OperatorsManager) {
        window.OperatorsManager.saveTrainingComment(errorId);
    }
};

window.cancelTrainingComment = function(errorId) {
    if (window.OperatorsManager) {
        window.OperatorsManager.cancelTrainingComment(errorId);
    }
};

window.editTrainingComment = function(errorId) {
    if (window.OperatorsManager) {
        window.OperatorsManager.editTrainingComment(errorId);
    }
};

// Алиасы для удобства
window.showCustomConfirm = function(title, message, confirmText, cancelText) {
    return ModalManager.showConfirm(title, message, confirmText, cancelText);
};

window.showNotification = function(message, type) {
    NotificationManager.show(message, type);
};
