/**
 * Конфигурация приложения
 * Содержит основные настройки и константы
 */

// Конфигурация приложения
const AppConfig = {
    // Настройки окон
    windows: {
        defaultWidth: '320px',
        defaultHeight: '220px',
        minWidth: 220,
        minHeight: 140,
        defaultPosition: {
            left: '20px',
            top: '20px'
        }
    },
    
    // Настройки хранения данных
    storage: {
        windowStatesKey: 'windowStates',
        checkboxStatesKey: 'windowCheckboxStates'
    },
    
    // Настройки уведомлений
    notifications: {
        duration: 3000,
        position: {
            top: '80px',
            right: '20px'
        }
    },
    
    // Настройки автосохранения
    autoSave: {
        delay: 100
    }
};

// Экспорт для использования в других модулях
window.AppConfig = AppConfig;
