// Демонстрационные данные для тестирования модального окна редактирования комментария

// Расширяем существующие данные операторов демонстрационными комментариями
if (typeof operatorData !== 'undefined' && operatorData.errors) {
    // Добавляем тестовые комментарии к первым нескольким ошибкам
    operatorData.errors.forEach((error, index) => {
        if (index < 3) { // Только для первых 3 ошибок
            error.trainingComments = [
                {
                    text: `Исходный комментарий обучения для ошибки ${error.id}:\n\nНеобходимо улучшить качество обслуживания клиентов. Рекомендуется:\n• Быть более внимательным к деталям\n• Следовать протоколу общения\n• Проверять всю информацию дважды`,
                    date: '12.07.2025 14:30',
                    isOriginal: true,
                    files: [
                        {
                            name: 'protocol_guide.pdf',
                            size: 1024 * 500, // 500KB
                            type: 'application/pdf'
                        }
                    ]
                }
            ];
            
            // Добавляем отредактированный комментарий для второй ошибки
            if (index === 1) {
                error.trainingComments.push({
                    text: `Обновленный комментарий:\n\nПосле дополнительного анализа было выявлено:\n• Оператор показал значительное улучшение\n• Рекомендуется продолжить практику\n• Добавлено дополнительное обучение по работе с возражениями`,
                    date: '13.07.2025 16:45',
                    isOriginal: false,
                    files: [
                        {
                            name: 'training_materials.docx',
                            size: 1024 * 750, // 750KB
                            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        },
                        {
                            name: 'example_call.mp3',
                            size: 1024 * 1024 * 2, // 2MB
                            type: 'audio/mpeg'
                        }
                    ]
                });
            }
        }
    });
}

// Функция для добавления демонстрационного комментария (для тестирования)
function addDemoComment(errorId) {
    if (typeof operatorData !== 'undefined' && operatorData.errors) {
        const error = operatorData.errors.find(e => e.id === errorId);
        if (error) {
            if (!error.trainingComments) {
                error.trainingComments = [];
            }
            
            const demoComment = {
                text: `Демонстрационный комментарий добавлен ${new Date().toLocaleString('ru-RU')}:\n\nЭто пример того, как выглядит новый комментарий обучения. Здесь можно:\n• Описать прогресс обучения\n• Добавить рекомендации\n• Приложить файлы\n• Отметить важные моменты`,
                date: new Date().toLocaleString('ru-RU'),
                isOriginal: false,
                files: [
                    {
                        name: 'demo_screenshot.png',
                        size: 1024 * 200, // 200KB
                        type: 'image/png'
                    }
                ]
            };
            
            error.trainingComments.push(demoComment);
            
            // Обновляем отображение
            if (typeof updateOperatorDisplay === 'function') {
                updateOperatorDisplay();
            }
            
            console.log('Демонстрационный комментарий добавлен для ошибки', errorId);
        }
    }
}

// Добавляем функцию в глобальную область видимости для тестирования
window.addDemoComment = addDemoComment;

console.log('📝 Демонстрационные данные для комментариев загружены');
