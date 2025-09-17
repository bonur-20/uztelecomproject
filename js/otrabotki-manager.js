/**
 * Файл управления отработками
 * Связывает выбор оператора и отображение деталей
 */

console.log('Загрузка otrabotki-manager.js');

// Глобальные переменные для доступа из других скриптов
let updateOperatorDetails;
let showOperatorDetails;
let initOperatorSchedules;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен в otrabotki-manager.js');
    // Находим правую панель с деталями
    const detailPanel = document.querySelector('.otrabotki-detail-card');
    
    // Устанавливаем обработчики событий для элементов списка операторов
    function setupOperatorItemHandlers() {
        const operatorItems = document.querySelectorAll('.otrabotki-operator-item');

        operatorItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Избежать конфликтов с другими обработчиками
                if (e && typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
                if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

                // Снять выделение со всех актуальных элементов и выделить текущий
                document.querySelectorAll('.otrabotki-operator-item').forEach(op => op.classList.remove('selected'));
                this.classList.add('selected');

                // Получаем индекс оператора из атрибута data-idx
                const operatorIdx = parseInt(this.getAttribute('data-idx'));

                // Обновляем детали оператора в правой панели
                if (typeof updateOperatorDetails === 'function') updateOperatorDetails(operatorIdx);

                // Снять заглушку на правой панели и показать детали
                const rightPanel = document.querySelector('.training-layout__right');
                if (rightPanel) rightPanel.classList.remove('empty');
                if (typeof showOperatorDetails === 'function') showOperatorDetails();
            });
        });
    }
    
    // Функция обновления деталей оператора в правой панели
    // Словарь групп для операторов (рандомно распределено)
    const operatorGroups = {
        "Abdug'aniyev Abdulaziz Abdug'ofur o'g'li (358)": "Группа 1009",
        "Abduxalilov Abdulaziz Abduvali o'g'li (0308)": "Группа 1242",
        "Adilova Arofat Faxriddin qizi (0211)": "Группа 1170",
        "Ahmadova Xilola Mahmud qizi (0256)": "Группа ДОП",
        "Alimov Shaxzod Ilxomovich (0544)": "Группа 1093",
        "Ayniddinov Tursunboy Dilshod o'g'li (0372)": "Группа БКМ",
        "Banyazov Kudratilla Irgashovich (0281)": "Группа 1000",
        "Baxtiyorov Sirojiddin Furqat o'g'li (269)": "Группа 1170",
        "Bekmuxamedov Abdumavlon Abduvoxid o'g'li (0365)": "Группа 1242",
        "Fozilxonov Zoirxon Davron o'g'li (0147)": "Группа 1093",
        "Riskiyev Bonur Boxodir o'g'li (0485)": "Группа ДОП",
        "Ruziyeva Xusnora Sodiqjon qizi (247)": "Группа БКМ",
        "Sobirov Abduxakim Qobil o'g'li (0116)": "Группа 1009"
    };

    // Инициализируем расписания операторов при первой загрузке
    let operatorSchedulesDict = {};
    
    function initOperatorSchedules() {
        // Проверяем, загружен ли модуль с расписаниями
        if (window.operatorSchedules && window.otrabotkiOperators) {
            // Генерируем расписания для всех операторов
            operatorSchedulesDict = window.operatorSchedules.generateOperatorSchedules(window.otrabotkiOperators);
            console.log('Инициализированы расписания операторов:', operatorSchedulesDict);
        } else {
            console.error('Модуль расписаний или данные операторов не загружены');
        }
    }
    
    function updateOperatorDetails(operatorIdx) {
        console.log(`Обновление деталей оператора с индексом ${operatorIdx}`);
        
        if (!window.otrabotkiOperators || operatorIdx === undefined || operatorIdx < 0 || operatorIdx >= window.otrabotkiOperators.length) {
            console.error('Invalid operator index or operators data not found');
            return;
        }
        
        const operator = window.otrabotkiOperators[operatorIdx];
        console.log('Данные оператора:', operator);
        
        // Обновляем фото оператора
        const avatarImg = document.getElementById('otrabotki-detail-avatar');
        if (avatarImg && operator.avatar) {
            avatarImg.src = operator.avatar;
            avatarImg.onerror = function() {
                this.onerror = null;
                this.src = 'assets/Аватар/Иконка профиля пользователя.png';
            };
        }
        
        // Обновляем имя оператора
        const nameElement = document.getElementById('otrabotki-detail-name');
        if (nameElement && operator.fullName) {
            nameElement.textContent = operator.fullName;
        }
        
        // Обновляем расписание оператора
        const scheduleElement = document.querySelector('.schedule-label');
        if (scheduleElement && operator.fullName) {
            // Проверяем, инициализированы ли расписания
            if (Object.keys(operatorSchedulesDict).length === 0) {
                initOperatorSchedules();
            }
            
            // Получаем расписание из словаря или устанавливаем прочерк
            const schedule = operatorSchedulesDict[operator.fullName] || '-';
            scheduleElement.textContent = schedule;
            
            // Обновляем атрибут для всплывающей подсказки
            scheduleElement.setAttribute('data-full-text', schedule);
        }
        
        // Обновляем группу оператора
        const groupElement = document.querySelector('.otrabotki-detail-group');
        console.log('Элемент группы:', groupElement);
        
        if (groupElement && operator.fullName) {
            // Берем группу из словаря или используем дефолтную
            const group = operatorGroups[operator.fullName] || "Группа 1000";
            console.log(`Устанавливаем группу для ${operator.fullName}: ${group}`);
            groupElement.textContent = group;
        } else {
            console.error('Элемент группы не найден или имя оператора отсутствует');
            console.log('groupElement:', groupElement);
            console.log('operator.fullName:', operator.fullName);
        }
        
        // Отправляем событие для обновления счетчика времени
        const operatorSelectedEvent = new CustomEvent('operatorSelected', {
            detail: {
                hours: operator.hours || 0,
                fullName: operator.fullName
            }
        });
        document.dispatchEvent(operatorSelectedEvent);
    }
    
    // Функция показа деталей оператора
    function showOperatorDetails() {
        if (detailPanel) {
            // Удаляем класс empty, если он есть
            detailPanel.classList.remove('empty');
            
            // Показываем детали, если они скрыты
            detailPanel.style.display = 'block';
        }
    }
    
    // Инициализация при загрузке страницы
    function init() {
        // Инициализируем расписания операторов
        initOperatorSchedules();
        
        // При первой загрузке страницы проверяем, есть ли уже выбранный оператор
        setupOperatorItemHandlers();
        
        // Наблюдаем за изменениями в списке операторов (например, при поиске)
        const operatorsList = document.querySelector('.otrabotki-operators-list');
        if (operatorsList) {
            const observer = new MutationObserver(function(mutations) {
                setupOperatorItemHandlers();
            });
            
            observer.observe(operatorsList, { childList: true });
        }
        
        // Инициализируем расписание для текущего оператора в интерфейсе
        const selectedOperator = document.querySelector('.otrabotki-operator-item.selected');
        if (selectedOperator) {
            const operatorIdx = parseInt(selectedOperator.getAttribute('data-idx'));
            updateOperatorDetails(operatorIdx);
        }
    }
    
    // Запускаем инициализацию
    init();
    
    // Экспортируем функции в глобальный объект window для доступа из других скриптов
    window.updateOperatorDetails = updateOperatorDetails;
    window.showOperatorDetails = showOperatorDetails;
    window.initOperatorSchedules = initOperatorSchedules;
});
