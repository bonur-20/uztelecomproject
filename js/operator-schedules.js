/**
 * Данные расписания для операторов
 * Содержит варианты расписаний и функции для их случайного выбора
 */

// Примеры расписаний для операторов
const operatorSchedules = {
    scheduleVariants: [
        'О (с: 02.09.2025 до: 25.09.2025)',
        'Б (с: 05.09.2025 до: )',
        'Б (с: 25.08.2025 до: 27.08.2025)',
        'Б (с: 07.08.2025 до: 21.08.2025)',
        'У (с: 03.09.2025 до: 30.09.2025) и Б (с: 18.08.2025 до: 22.08.2025)',
        'Б (с: 02.09.2025 до: ) и БС (с: 10.09.2025 до: 18.09.2025) и О (с: 03.09.2025 до: 05.10.2025) и Б (с: 30.08.2025 до: )',
        'О (с: 01.09.2025 до: 30.09.2025)',
        'БС (с: 15.09.2025 до: 30.09.2025)',
        'Н (с: 01.09.2025 до: 15.09.2025) и О (с: 16.09.2025 до: 30.09.2025)',
        'Б (с: 20.08.2025 до: 10.09.2025)'
    ],
    
    // Функция получения случайного расписания для оператора
    getRandomSchedule: function() {
        // С вероятностью 15% возвращаем прочерк вместо расписания
        if (Math.random() < 0.15) {
            return '-';
        }
        
        // Иначе выбираем случайный вариант из массива
        const randomIndex = Math.floor(Math.random() * this.scheduleVariants.length);
        return this.scheduleVariants[randomIndex];
    },
    
    // Создание словаря расписаний для всех операторов
    generateOperatorSchedules: function(operators) {
        const schedules = {};
        
        if (!operators || !Array.isArray(operators)) {
            console.error('Операторы не определены или не являются массивом');
            return schedules;
        }
        
        // Для каждого оператора генерируем случайное расписание
        operators.forEach(operator => {
            if (operator && operator.fullName) {
                schedules[operator.fullName] = this.getRandomSchedule();
            }
        });
        
        console.log('Сгенерированы расписания для операторов:', schedules);
        return schedules;
    }
};

// Экспортируем объект для использования в других модулях
window.operatorSchedules = operatorSchedules;
