// Тест загрузки модального окна редактирования комментариев

// Проверяем загрузку после полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🧪 Проверка загрузки модального окна...');
        
        if (typeof commentEditorModal !== 'undefined') {
            console.log('✅ commentEditorModal успешно загружен');
            console.log('📋 Доступные методы:', Object.getOwnPropertyNames(commentEditorModal));
            
            // Тестируем создание модального окна
            const modal = document.getElementById('commentEditorModal');
            if (modal) {
                console.log('✅ HTML модального окна создан');
            } else {
                console.error('❌ HTML модального окна не найден');
            }
            
        } else {
            console.error('❌ commentEditorModal не загружен');
        }
        
        // Проверяем функцию editTrainingComment
        if (typeof editTrainingComment === 'function') {
            console.log('✅ Функция editTrainingComment доступна');
        } else {
            console.error('❌ Функция editTrainingComment не найдена');
        }
        
        // Проверяем CSS файл
        const cssFiles = Array.from(document.styleSheets).map(sheet => {
            try {
                return sheet.href;
            } catch(e) {
                return null;
            }
        }).filter(href => href && href.includes('comment-editor-modal.css'));
        
        if (cssFiles.length > 0) {
            console.log('✅ CSS файл модального окна загружен:', cssFiles[0]);
        } else {
            console.error('❌ CSS файл модального окна не найден');
        }
        
    }, 2000); // Ждем 2 секунды после загрузки
});

// Экспортируем функцию для ручного тестирования
window.testModalWindow = function(errorId = 47357) {
    console.log('🧪 Ручной тест модального окна для ошибки:', errorId);
    
    if (typeof commentEditorModal !== 'undefined') {
        commentEditorModal.open(errorId);
    } else {
        console.error('❌ Модальное окно не доступно');
    }
};

// Добавляем стили для кнопки тестирования
const testButton = document.createElement('button');
testButton.innerHTML = '🧪 Тест модального окна';
testButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 10px 15px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    z-index: 9999;
    font-size: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
`;

testButton.onclick = () => window.testModalWindow();

// Добавляем кнопку после загрузки
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        document.body.appendChild(testButton);
        console.log('🧪 Добавлена тестовая кнопка в правый нижний угол');
    }, 1000);
});
