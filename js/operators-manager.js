/**
 * Менеджер операторов
 * Отвечает за управление списком операторов и их данными
 */

const OperatorsManager = {
    currentOperatorsData: null,
    currentOperatorErrors: null,
    
    // Список доступных аватаров
    avatars: [
        "1P8A0085.jpg", "1P8A0111.jpg", "1P8A0141.jpg", "1P8A0193.jpg", "1P8A0199.jpg",
        "1P8A0276.jpg", "1P8A0543.jpg", "2Y0A0426.jpg", "2Y0A9000.png", "2Y0A9032.png",
        "2Y0A9049.png", "2Y0A9086.png", "2Y0A9323.png", "2Y0A9346.png", "2Y0A9419.png",
        "2Y0A9427.png", "2Y0A9433.png", "2Y0A9689.jpg", "Adilova Arofat Faxriddin qizi.jpg",
        "Foto.jpg", "Fozilxonov Zoirxon Davron o'g'ли 0147.png", "Пулатова Юлдуз.png"
    ],
    
    // Список случайных имен для операторов
    names: [
        "Алиев Шерзод Бахтиярович", "Каримова Нилуфар Азимовна", "Рахимов Жасур Олимович",
        "Умарова Дилдора Рустамовна", "Носиров Азиз Фарходович", "Исакова Мадина Шухратовна",
        "Холиков Бахтиёр Мухаммадович", "Турсунова Нигора Анваровна", "Абдуллаев Отабек Камилович",
        "Нурматова Севара Улугбековна", "Мирзаев Фаррух Собирович", "Жуманиязова Гульшан Рахматовна",
        "Хашимов Санжар Тохирович", "Файзуллаева Малика Нуриддиновна", "Самадов Жавлон Икромович",
        "Кодирова Шахноза Абдувахобовна", "Эргашев Достон Мухтарович", "Ибрагимова Дилноза Шавкатовна",
        "Султанов Джахонгир Бахромович", "Хамидова Наргиза Элмуродовна", "Расулов Акмал Садикович",
        "Юсупова Нодира Хакимовна"
    ],
    
    // Временные интервалы
    timeOptions: [
        "15 мин. назад", "30 мин. назад", "45 мин. назад", "1 час назад", "1.5 часа назад", 
        "2 часа назад", "2.5 часа назад", "3 часа назад", "4 часа назад", "5 часов назад"
    ],
    
    /**
     * Инициализация списка операторов
     */
    initOperatorsList: function() {
        const operatorsData = this.generateRandomOperators();
        this.currentOperatorsData = operatorsData;
        window.currentOperatorsData = operatorsData; // Для обратной совместимости
        
        // Применяем сортировку по умолчанию
        const sortedOperators = this.applyOperatorFilter(operatorsData, 'all');
        
        this.renderOperatorsList(sortedOperators);
        this.setupOperatorsSearch(operatorsData);
        this.setupOperatorsFilters(operatorsData);
        this.setupRefreshButton();
    },
    
    /**
     * Генерация случайных данных операторов
     * @returns {Array} - Массив операторов
     */
    generateRandomOperators: function() {
        const operators = [];
        const usedAvatars = [];
        const usedNames = [];
        
        const operatorCount = Math.floor(Math.random() * 6) + 15; // 15-20 операторов
        
        for (let i = 0; i < operatorCount; i++) {
            // Выбираем случайный аватар
            let avatar;
            if (usedAvatars.length < this.avatars.length) {
                do {
                    avatar = this.avatars[Math.floor(Math.random() * this.avatars.length)];
                } while (usedAvatars.includes(avatar));
                usedAvatars.push(avatar);
            } else {
                avatar = this.avatars[Math.floor(Math.random() * this.avatars.length)];
            }
            
            // Выбираем случайное имя
            let name;
            if (usedNames.length < this.names.length) {
                do {
                    name = this.names[Math.floor(Math.random() * this.names.length)];
                } while (usedNames.includes(name));
                usedNames.push(name);
            } else {
                name = this.names[Math.floor(Math.random() * this.names.length)];
            }
            
            const employeeNumber = String(Math.floor(Math.random() * 9000) + 1000);
            const errors = Math.floor(Math.random() * 20); // Необученные ошибки
            const success = Math.floor(Math.random() * 50) + 10; // Успешные обращения
            const trainedErrors = Math.floor(Math.random() * 10); // Обученные ошибки
            const totalErrors = errors + trainedErrors; // Общее количество ошибок
            const status = errors > 10 ? "error" : "success";
            
            // Генерируем дату последнего обучения
            let lastTrainingDate = null;
            if (errors <= 10 && Math.random() < 0.7) {
                const daysAgo = Math.floor(Math.random() * 30) + 1;
                lastTrainingDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
            }
            
            operators.push({
                id: i + 1,
                name: `${name} (${employeeNumber})`,
                avatar: `assets/Аватар/${avatar}`,
                errors: errors,
                success: success,
                calendar: totalErrors,
                time: this.timeOptions[Math.floor(Math.random() * this.timeOptions.length)],
                status: status,
                lastTrainingDate: lastTrainingDate
            });
        }
        
        return operators;
    },
    
    /**
     * Рендеринг списка операторов
     * @param {Array} operators - Массив операторов для отображения
     */
    renderOperatorsList: function(operators) {
        const container = document.querySelector('.operators-list-container');
        if (!container) return;
        
        container.innerHTML = operators.map(operator => `
            <div class="operator-item" data-operator-id="${operator.id}">
                <img src="${operator.avatar}" 
                     alt="${operator.name}" 
                     class="operator-avatar"
                     onerror="this.src='assets/Аватар/Foto.jpg'; this.onerror=null;">
                <div class="operator-info">
                    <div class="operator-name">${operator.name}</div>
                    <div class="operator-meta">
                        <div class="meta-badge error" title="Необученные ошибки">
                            <span class="material-icons" style="font-size: 12px;">error</span>
                            ${operator.errors}
                        </div>
                        <div class="meta-badge success" title="Успешные обращения">
                            <span class="material-icons" style="font-size: 12px;">check_circle</span>
                            ${operator.success}
                        </div>
                        <div class="meta-badge calendar" title="Общее количество ошибок">
                            <span class="material-icons" style="font-size: 12px;">assignment</span>
                            ${operator.calendar}
                        </div>
                        <div class="meta-time">${operator.time}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Добавляем обработчики клика
        this.addOperatorClickHandlers(container);
    },
    
    /**
     * Добавление обработчиков клика для операторов
     * @param {HTMLElement} container - Контейнер со списком операторов
     */
    addOperatorClickHandlers: function(container) {
        container.querySelectorAll('.operator-item').forEach(item => {
            item.addEventListener('click', () => {
                // Убираем выделение с других элементов
                container.querySelectorAll('.operator-item').forEach(el => el.classList.remove('selected'));
                // Добавляем выделение к текущему элементу
                item.classList.add('selected');
                
                const operatorId = item.getAttribute('data-operator-id');
                console.log('Выбран оператор с ID:', operatorId);
                
                this.updateOperatorDetails(operatorId);
            });
        });
    },
    
    /**
     * Обновление информации о выбранном операторе
     * @param {string} operatorId - ID оператора
     */
    updateOperatorDetails: function(operatorId) {
        const operator = this.currentOperatorsData.find(op => op.id === Number(operatorId));
        if (!operator) return;
        
        // Показываем информацию о выбранном операторе
        this.showOperatorInfo(operator);
        
        // Генерируем и отображаем ошибки оператора
        const operatorErrors = this.generateOperatorErrors(operatorId, operator.name);
        this.currentOperatorErrors = operatorErrors;
        window.currentOperatorErrors = operatorErrors; // Для обратной совместимости
        
        this.renderOperatorErrors(operatorErrors);
        
        console.log(`Загружены детали для оператора: ${operator.name}`);
    },
    
    /**
     * Показать информацию об операторе
     * @param {Object} operator - Объект оператора
     */
    showOperatorInfo: function(operator) {
        const selectedOperatorInfo = document.getElementById('selected-operator-info');
        const noOperatorSelected = document.getElementById('no-operator-selected');
        
        if (selectedOperatorInfo && noOperatorSelected) {
            selectedOperatorInfo.style.display = 'block';
            noOperatorSelected.style.display = 'none';
        }
        
        // Обновляем аватар и имя оператора
        const avatarImg = document.getElementById('operator-detail-avatar');
        const nameDiv = document.getElementById('operator-detail-name');
        if (avatarImg && nameDiv) {
            avatarImg.src = operator.avatar;
            avatarImg.onerror = () => {
                avatarImg.src = 'assets/Аватар/Foto.jpg';
                avatarImg.onerror = null;
            };
            nameDiv.textContent = operator.name;
        }
        
        // Обновляем статистику
        const errorsSpan = document.getElementById('operator-detail-errors');
        const successSpan = document.getElementById('operator-detail-success');
        if (errorsSpan && successSpan) {
            errorsSpan.textContent = operator.errors;
            successSpan.textContent = operator.success;
        }
    },
    
    /**
     * Генерация ошибок для конкретного оператора
     * @param {string} operatorId - ID оператора
     * @param {string} operatorName - Имя оператора
     * @returns {Array} - Массив ошибок
     */
    generateOperatorErrors: function(operatorId, operatorName) {
        const errorTypes = [
            "Предупреждение об ожидании на линии: Не сообщил о том за ожидание на линии используется стандартную фразу «Спасибо за ожидание»",
            "Оформление и обработка заявок: Не указал куда ранее обращался заявитель",
            "Качество обслуживания: Недостаточно вежливое общение с клиентом",
            "Техническая поддержка: Не предоставил полную информацию по услуге",
            "Документооборот: Неправильно заполнил форму заявки",
            "Соблюдение регламента: Превышение времени обслуживания клиента",
            "Идентификация клиента: Не запросил дополнительные данные для верификации",
            "Консультирование: Предоставил неактуальную информацию об услугах"
        ];
        
        const services = ["1213_TV", "1000_ru", "1242_mob", "1093_int", "1170_cab"];
        const lkOptions = ["True", "False"];
        
        const errors = [];
        const errorCount = Math.floor(Math.random() * 8) + 3; // 3-10 ошибок
        
        for (let i = 0; i < errorCount; i++) {
            const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
            const service = services[Math.floor(Math.random() * services.length)];
            const lk = lkOptions[Math.floor(Math.random() * lkOptions.length)];
            
            // Генерируем случайную дату и время
            const now = new Date();
            const pastDate = new Date(now.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000));
            const dateStr = pastDate.toLocaleDateString('ru-RU');
            const timeStr = pastDate.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Генерируем уникальный код ошибки
            const code = `${Math.floor(Math.random() * 90000) + 10000}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
            
            // Определяем, обучен ли оператор по этой ошибке
            const isTrained = Math.random() < 0.3; // 30% шанс
            
            const error = {
                id: i + 1,
                code: code,
                operatorId: operatorId,
                description: errorType,
                date: dateStr,
                time: timeStr,
                service: service,
                lk: lk,
                isTrained: isTrained,
                trainingComments: []
            };
            
            // Если ошибка обучена, добавляем комментарий
            if (isTrained) {
                this.addTrainingComment(error, pastDate);
            }
            
            errors.push(error);
        }
        
        return errors;
    },
    
    /**
     * Добавить комментарий обучения к ошибке
     * @param {Object} error - Объект ошибки
     * @param {Date} pastDate - Дата ошибки
     */
    addTrainingComment: function(error, pastDate) {
        const trainingDate = new Date(pastDate.getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000));
        const trainingDateStr = trainingDate.toLocaleDateString('ru-RU');
        const trainingTimeStr = trainingDate.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        const comments = [
            "Тушунтириш берилди.",
            "Операторга мазкур хато борасида тушунтириш берилди.",
            "Қайтаданланмаслиги учун огохлантирилди.",
            "Хизмат кўрсатиш сифатини яхшилаш бўйича кўрсатма берилди.",
            "Регламентга риоя қилиш зарурлиги тушунтирилди."
        ];
        
        const comment = comments[Math.floor(Math.random() * comments.length)];
        
        error.trainingComments.push({
            id: 1,
            date: `${trainingDateStr} ${trainingTimeStr}`,
            text: comment,
            isOriginal: true
        });
        
        // 20% шанс редактирования
        if (Math.random() < 0.2) {
            this.addEditedComment(error, trainingDate);
        }
    },
    
    /**
     * Добавить отредактированный комментарий
     * @param {Object} error - Объект ошибки
     * @param {Date} trainingDate - Дата обучения
     */
    addEditedComment: function(error, trainingDate) {
        const editDate = new Date(trainingDate.getTime() + (Math.random() * 3 * 24 * 60 * 60 * 1000));
        const editDateStr = editDate.toLocaleDateString('ru-RU');
        const editTimeStr = editDate.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        const editComments = [
            "Масала хал булди",
            "Қўшимча тушунтириш берилди",
            "Амалда қўлланилди",
            "Назорат остида сақланди",
            "Сифат яхшиланди"
        ];
        
        const editComment = editComments[Math.floor(Math.random() * editComments.length)];
        
        error.trainingComments.push({
            id: 2,
            date: `${editDateStr} ${editTimeStr}`,
            text: editComment,
            isOriginal: false
        });
    },
    
    /**
     * Применение фильтра к операторам
     * @param {Array} operators - Массив операторов
     * @param {string} filterValue - Значение фильтра
     * @returns {Array} - Отфильтрованный массив
     */
    applyOperatorFilter: function(operators, filterValue) {
        let filteredOperators = [...operators];
        
        switch (filterValue) {
            case 'all':
                filteredOperators.sort((a, b) => b.errors - a.errors);
                break;
            case 'untrained':
                filteredOperators = filteredOperators.filter(op => op.errors > 10);
                filteredOperators.sort((a, b) => b.errors - a.errors);
                break;
            case 'training-date':
                filteredOperators = filteredOperators.filter(op => op.lastTrainingDate !== null);
                filteredOperators.sort((a, b) => a.lastTrainingDate - b.lastTrainingDate);
                break;
            default:
                filteredOperators.sort((a, b) => b.errors - a.errors);
                break;
        }
        
        return filteredOperators;
    },
    
    // Методы для работы с интерфейсом (renderOperatorErrors, setupOperatorsSearch, etc.)
    // будут добавлены в следующем файле для экономии места
    
    /**
     * Обновить список операторов
     */
    refreshOperatorsList: function() {
        const newOperatorsData = this.generateRandomOperators();
        this.currentOperatorsData = newOperatorsData;
        window.currentOperatorsData = newOperatorsData;
        
        const sortedOperators = this.applyOperatorFilter(newOperatorsData, 'all');
        
        this.renderOperatorsList(sortedOperators);
        this.setupOperatorsSearch(newOperatorsData);
        this.setupOperatorsFilters(newOperatorsData);
    },
    
    /**
     * Настройка кнопки обновления
     */
    setupRefreshButton: function() {
        const refreshBtn = document.getElementById('refresh-operators-btn');
        if (!refreshBtn) return;
        
        refreshBtn.addEventListener('click', () => {
            refreshBtn.classList.add('loading');
            
            setTimeout(() => {
                this.refreshOperatorsList();
                refreshBtn.classList.remove('loading');
                
                // Сбрасываем поиск и фильтры
                const searchInput = document.getElementById('operators-search-input');
                if (searchInput) {
                    searchInput.value = '';
                }
                
                const allFilter = document.querySelector('input[name="operator-filter"][value="all"]');
                if (allFilter) {
                    allFilter.checked = true;
                }
                
                console.log('Список операторов обновлён');
            }, 500);
        });
    }
};

// Экспорт для использования в других модулях
window.OperatorsManager = OperatorsManager;
