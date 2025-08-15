/**
 * Менеджер аналитики учебного процесса
 * Отвечает за отображение графиков, обработку данных и интерактивность
 */

const AnalyticsManager = {
    pieChart: null,
    lineChart: null,
    currentData: null,
    lastCanvasSize: null,
    isInitialized: false,
    
    /**
     * Инициализация аналитики
     */
    init: function() {
        // Предотвращаем повторную инициализацию
        if (this.isInitialized) {
            console.warn('AnalyticsManager: уже инициализирован');
            return;
        }
        
        this.initEventListeners();
        this.loadInitialData();
        this.initCharts();
        this.addDatePresets();
        this.validateDateRange(); // Валидируем изначальные даты
        this.applyPercentageBadgeColors(); // Применяем цветовую градацию
        this.initResizeObserver(); // Добавляем отслеживание изменения размера
        
        this.isInitialized = true;
        console.log('AnalyticsManager: инициализирован');
    },
    
    /**
     * Инициализация обработчиков событий
     */
    initEventListeners: function() {
        const updateBtn = document.getElementById('analytics-update-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                this.updateAnalytics();
            });
        }
        
        // Обработчики изменения дат
        const startDateInput = document.getElementById('analytics-start-date');
        const endDateInput = document.getElementById('analytics-end-date');
        const dateRangeSelector = document.querySelector('.date-range-selector');
        
        if (startDateInput) {
            // Обработчики для интерактивности
            startDateInput.addEventListener('focus', (e) => {
                e.target.closest('.date-input-group').classList.add('active');
            });
            
            startDateInput.addEventListener('blur', (e) => {
                e.target.closest('.date-input-group').classList.remove('active');
            });
            
            startDateInput.addEventListener('change', (e) => {
                e.target.classList.add('changed');
                setTimeout(() => {
                    e.target.classList.remove('changed');
                }, 600);
                this.validateDateRange();
            });
            
            // Добавляем валидацию при вводе
            startDateInput.addEventListener('input', () => {
                this.validateDateRange();
            });
        }
        
        if (endDateInput) {
            // Обработчики для интерактивности
            endDateInput.addEventListener('focus', (e) => {
                e.target.closest('.date-input-group').classList.add('active');
            });
            
            endDateInput.addEventListener('blur', (e) => {
                e.target.closest('.date-input-group').classList.remove('active');
            });
            
            endDateInput.addEventListener('change', (e) => {
                e.target.classList.add('changed');
                setTimeout(() => {
                    e.target.classList.remove('changed');
                }, 600);
                this.validateDateRange();
            });
            
            // Добавляем валидацию при вводе
            endDateInput.addEventListener('input', () => {
                this.validateDateRange();
            });
        }
        
        // Добавляем обработчики для клавиатурных сокращений
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                this.updateAnalytics();
            }
        });
    },
    
    /**
     * Проверка корректности диапазона дат
     */
    validateDateRange: function() {
        const startDateInput = document.getElementById('analytics-start-date');
        const endDateInput = document.getElementById('analytics-end-date');
        const dateRangeSelector = document.querySelector('.date-range-selector');
        
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        // Убираем предыдущие классы состояния
        startDateInput.classList.remove('invalid');
        endDateInput.classList.remove('invalid');
        dateRangeSelector.classList.remove('valid', 'invalid');
        
        if (startDate && endDate) {
            if (startDate > endDate) {
                // Некорректный диапазон
                startDateInput.classList.add('invalid');
                endDateInput.classList.add('invalid');
                dateRangeSelector.classList.add('invalid');
                
                // Показываем уведомление о некорректном диапазоне
                if (window.showNotification) {
                    window.showNotification('Дата начала не может быть больше даты окончания', 'warning');
                }
                
                return false;
            } else {
                // Корректный диапазон
                dateRangeSelector.classList.add('valid');
                
                // Проверяем, не слишком ли большой диапазон
                const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays > 365) {
                    if (window.showNotification) {
                        window.showNotification('Выбран большой диапазон дат (более года). Это может повлиять на производительность.', 'info');
                    }
                }
                
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * Загрузка начальных данных
     */
    loadInitialData: function() {
        // Имитация данных для демонстрации
        this.currentData = {
            pieData: {
                trained: 54,
                untrained: 46
            },
            trainedArchive: 1000,
            criteriaData: [
                { id: '01', name: 'Приветствие', percentage: 92 },
                { id: '02', name: 'Внимательное слушание', percentage: 88 },
                { id: '03', name: 'Использование уточняющих вопросов', percentage: 75 },
                { id: '04', name: 'Заинтересованность в проблеме', percentage: 82 },
                { id: '05', name: 'Понятное предоставление информации', percentage: 89 },
                { id: '06', name: 'Доброжелательность, Вежливость', percentage: 94 },
                { id: '07', name: 'Грамотная речь', percentage: 91 },
                { id: '08', name: 'Оформление и обработка заявок', percentage: 77 },
                { id: '09', name: 'Предупреждение об ожидании на линии', percentage: 68 },
                { id: '10', name: 'Эмоциональная окраска голоса', percentage: 85 },
                { id: '11', name: 'Прощание', percentage: 96 }
            ],
            lineData: {
                months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
                values: [450, 230, 420, 380, 410, 350, 390, 320, 400, 350, 380, 390]
            }
        };
    },
    
    /**
     * Инициализация графиков
     */
    initCharts: function() {
        setTimeout(() => {
            try {
                this.initPieChart();
                this.initLineChart();
            } catch (error) {
                console.error('Ошибка при инициализации графиков:', error);
                // Показываем пользователю сообщение об ошибке
                if (window.showNotification) {
                    window.showNotification('Ошибка загрузки графиков. Попробуйте обновить страницу.', 'error');
                }
            }
        }, 100);
    },
    
    /**
     * Инициализация круговой диаграммы
     */
    initPieChart: function() {
        const canvas = document.getElementById('analytics-pie-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.currentData.pieData;
        
        // Очищаем canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Настройки для уменьшенного размера
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 15;
        
        // Данные для диаграммы
        const archive = this.currentData.trainedArchive || 0;
        const trained = data.trained;
        const untrained = data.untrained;
        const total = archive + trained + untrained;
        const archiveAngle = (archive / total) * 2 * Math.PI;
        const trainedAngle = (trained / total) * 2 * Math.PI;
        const untrainedAngle = (untrained / total) * 2 * Math.PI;

        // Сектор: архив (синий)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, archiveAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = '#4285f4';
        ctx.fill();

        // Сектор: обучено за день (зелёный)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, archiveAngle, archiveAngle + trainedAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = '#28a745';
        ctx.fill();

        // Сектор: необучено (красный)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, archiveAngle + trainedAngle, archiveAngle + trainedAngle + untrainedAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = '#ea4335';
        ctx.fill();

        // Внутренний круг (donut эффект)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Обновляем числа в info-блоках
        var infoArchive = document.getElementById('trained-calls-archive');
        if (infoArchive && this.currentData.trainedArchive !== undefined) {
            infoArchive.textContent = archive;
        }
        var infoCount = document.getElementById('trained-calls-count');
        if (infoCount) {
            infoCount.textContent = trained;
        }
        var infoUntrained = document.getElementById('untrained-calls-count');
        if (infoUntrained) {
            infoUntrained.textContent = untrained;
        }

        // Обновляем числа в info-блоках
        var infoArchive = document.getElementById('trained-calls-archive');
        if (infoArchive && this.currentData.trainedArchive !== undefined) {
            infoArchive.textContent = this.currentData.trainedArchive;
        }
        var infoCount = document.getElementById('trained-calls-count');
        if (infoCount) {
            infoCount.textContent = data.trained;
        }
        var infoUntrained = document.getElementById('untrained-calls-count');
        if (infoUntrained) {
            infoUntrained.textContent = data.untrained;
        }
        
        // Сохраняем данные для интерактивности
        this.pieChart = { 
            canvas, 
            ctx, 
            data, 
            centerX, 
            centerY, 
            radius, 
            trainedAngle, 
            untrainedAngle, 
            total 
        };
        
        // Добавляем обработчики событий для tooltip
        this.addPieChartTooltip();
    },
    
    /**
     * Инициализация линейного графика
     */
    initLineChart: function() {
        const canvas = document.getElementById('analytics-line-chart');
        if (!canvas) return;
        
        // Улучшаем качество для Retina дисплеев
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Устанавливаем размеры canvas с учетом DPI
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        // Улучшаем качество рендеринга
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const data = this.currentData.lineData;
        
        // Очищаем canvas
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        // Настройки для компактного размера
        const padding = 40;
        const chartWidth = rect.width - padding * 2;
        const chartHeight = rect.height - padding * 2;
        
        // Находим максимальное и минимальное значения
        const maxValue = Math.max(...data.values);
        const minValue = Math.min(...data.values);
        const valueRange = maxValue - minValue;
        
        // Рисуем сетку
        this.drawGrid(ctx, padding, chartWidth, chartHeight, maxValue, minValue, rect.width, rect.height);
        
        // Рисуем линию с улучшенным качеством
        ctx.beginPath();
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const points = [];
        data.values.forEach((value, index) => {
            const x = padding + (index / (data.values.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
            points.push({ x, y, value, month: data.months[index] });
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Рисуем точки с лучшим качеством
        points.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#4285f4';
            ctx.fill();
            
            // Белая обводка для точек
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        // Рисуем подписи месяцев
        ctx.fillStyle = '#666';
        ctx.font = '11px Segoe UI';
        ctx.textAlign = 'center';
        
        data.months.forEach((month, index) => {
            const x = padding + (index / (data.values.length - 1)) * chartWidth;
            const y = rect.height - 15;
            ctx.fillText(month, x, y);
        });
        
        // Добавляем интерактивность
        this.addLineChartInteractivity(canvas, points, rect);
        
        this.lineChart = { canvas, ctx, data, points, rect };
    },
    
    /**
     * Рисование сетки для линейного графика
     */
    drawGrid: function(ctx, padding, chartWidth, chartHeight, maxValue, minValue, canvasWidth, canvasHeight) {
        const valueRange = maxValue - minValue;
        const gridLines = 4; // Уменьшаем количество линий для компактности
        
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        
        // Горизонтальные линии
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (i / gridLines) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
            
            // Подписи значений
            const value = maxValue - (i / gridLines) * valueRange;
            ctx.fillStyle = '#666';
            ctx.font = '10px Segoe UI';
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(value), padding - 8, y + 3);
        }
        
        // Вертикальные линии (более тонкие)
        ctx.strokeStyle = '#f1f3f4';
        const verticalLines = 11; // 12 месяцев - 1
        for (let i = 0; i <= verticalLines; i++) {
            const x = padding + (i / verticalLines) * chartWidth;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
        }
    },
    
    /**
     * Обновление аналитики по выбранному периоду
     */
    updateAnalytics: function() {
        const startDate = document.getElementById('analytics-start-date').value;
        const endDate = document.getElementById('analytics-end-date').value;
        
        if (!startDate || !endDate) {
            if (window.showNotification) {
                window.showNotification('Выберите начальную и конечную даты', 'warning');
            }
            return;
        }
        
        // Показываем индикатор загрузки
        this.showLoadingState();
        
        // Имитация загрузки данных
        setTimeout(() => {
            this.generateRandomData(startDate, endDate);
            this.updateCharts();
            this.updateTable();
            this.hideLoadingState();
            
            if (window.showNotification) {
                window.showNotification('Аналитика обновлена', 'success');
            }
        }, 1000);
    },
    
    /**
     * Генерация случайных данных для демонстрации
     */
    generateRandomData: function(startDate, endDate) {
        // Генерируем новые случайные данные
        const trained = Math.floor(Math.random() * 30) + 40; // 40-70%
        const untrained = 100 - trained;
        
        // Если день сменился, добавляем обученных за день в архив
        if (!this.lastUpdateDate || this.lastUpdateDate !== startDate) {
            if (this.currentData.pieData && typeof this.currentData.trainedArchive === 'number') {
                this.currentData.trainedArchive += this.currentData.pieData.trained;
            }
            this.lastUpdateDate = startDate;
        }
        
        this.currentData.pieData = { trained, untrained };
        
        // Обновляем данные критериев с реалистичными процентами (60-98%)
        this.currentData.criteriaData = this.currentData.criteriaData.map(item => ({
            ...item,
            percentage: Math.floor(Math.random() * 39) + 60 // 60-98%
        }));
        
        // Генерируем новые данные для линейного графика
        this.currentData.lineData.values = this.currentData.lineData.months.map(() => 
            Math.floor(Math.random() * 300) + 200 // 200-500
        );
        
        // Обновляем легенду
        this.updateLegend();
    },
    
    /**
     * Обновление легенды
     */
    updateLegend: function() {
        const legendItems = document.querySelectorAll('.analytics-legend .legend-item span');
        if (legendItems.length >= 2) {
            legendItems[0].textContent = `Обученные ${this.currentData.pieData.trained}%`;
            legendItems[1].textContent = `Необученные ${this.currentData.pieData.untrained}%`;
        }
    },
    
    /**
     * Обновление таблицы критериев
     */
    updateTable: function() {
        const tableBody = document.querySelector('.criteria-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        this.currentData.criteriaData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td><span class="percentage-badge">${item.percentage}%</span></td>
            `;
            tableBody.appendChild(row);
        });
        
        // Применяем цветовую градацию после обновления
        this.applyPercentageBadgeColors();
    },
    
    /**
     * Обновление графиков
     */
    updateCharts: function() {
        this.initPieChart();
        this.initLineChart();
    },
    
    /**
     * Показать состояние загрузки
     */
    showLoadingState: function() {
        const updateBtn = document.getElementById('analytics-update-btn');
        if (updateBtn) {
            updateBtn.disabled = true;
            updateBtn.innerHTML = '<span class="material-icons">sync</span>Загрузка...';
            updateBtn.style.opacity = '0.6';
        }
    },
    
    /**
     * Скрыть состояние загрузки
     */
    hideLoadingState: function() {
        const updateBtn = document.getElementById('analytics-update-btn');
        if (updateBtn) {
            updateBtn.disabled = false;
            updateBtn.innerHTML = '<span class="material-icons">refresh</span>Обновить';
            updateBtn.style.opacity = '1';
        }
    },
    
    /**
     * Добавляет быстрые пресеты для выбора дат
     */
    addDatePresets: function() {
        const dateRangeSelector = document.querySelector('.date-range-selector');
        
        // Создаем контейнер для пресетов
        const presetsContainer = document.createElement('div');
        presetsContainer.className = 'date-presets';
        presetsContainer.innerHTML = `
            <button class="date-preset-btn" data-preset="today">Сегодня</button>
            <button class="date-preset-btn" data-preset="week">Неделя</button>
            <button class="date-preset-btn" data-preset="month">Месяц</button>
            <button class="date-preset-btn" data-preset="quarter">Квартал</button>
        `;
        
        // Добавляем обработчики для пресетов
        presetsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('date-preset-btn')) {
                const preset = e.target.dataset.preset;
                this.applyDatePreset(preset);
                
                // Добавляем визуальную обратную связь
                e.target.classList.add('active');
                setTimeout(() => {
                    e.target.classList.remove('active');
                }, 200);
            }
        });
        
        // Вставляем пресеты после селектора дат
        dateRangeSelector.parentNode.insertBefore(presetsContainer, dateRangeSelector.nextSibling);
    },
    
    /**
     * Применяет пресет дат
     */
    applyDatePreset: function(preset) {
        const startDateInput = document.getElementById('analytics-start-date');
        const endDateInput = document.getElementById('analytics-end-date');
        const today = new Date();
        let startDate, endDate;
        
        switch (preset) {
            case 'today':
                startDate = endDate = today;
                break;
            case 'week':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 7);
                endDate = today;
                break;
            case 'month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = today;
                break;
            case 'quarter':
                const quarter = Math.floor(today.getMonth() / 3);
                startDate = new Date(today.getFullYear(), quarter * 3, 1);
                endDate = today;
                break;
        }
        
        startDateInput.value = this.formatDateForInput(startDate);
        endDateInput.value = this.formatDateForInput(endDate);
        
        // Добавляем анимацию изменения
        startDateInput.classList.add('changed');
        endDateInput.classList.add('changed');
        
        setTimeout(() => {
            startDateInput.classList.remove('changed');
            endDateInput.classList.remove('changed');
        }, 600);
        
        this.validateDateRange();
    },
    
    /**
     * Форматирует дату для input[type="date"]
     */
    formatDateForInput: function(date) {
        return date.toISOString().split('T')[0];
    },
    
    /**
     * Добавляет tooltip для круговой диаграммы
     */
    addPieChartTooltip: function() {
        if (!this.pieChart || !this.pieChart.canvas) return;
        
        const canvas = this.pieChart.canvas;
        const tooltip = this.createTooltip();
        
        // Обработчик движения мыши
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const segment = this.getSegmentAtPoint(x, y);
            
            if (segment) {
                this.showTooltip(tooltip, e.clientX, e.clientY, segment);
                canvas.style.cursor = 'pointer';
            } else {
                this.hideTooltip(tooltip);
                canvas.style.cursor = 'default';
            }
        });
        
        // Обработчик выхода мыши с canvas
        canvas.addEventListener('mouseleave', () => {
            this.hideTooltip(tooltip);
            canvas.style.cursor = 'default';
        });
    },
    
    /**
     * Создает элемент tooltip
     */
    createTooltip: function() {
        let tooltip = document.getElementById('chart-tooltip');
        
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chart-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-family: "Segoe UI", sans-serif;
                pointer-events: none;
                z-index: 10000;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.2s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            `;
            document.body.appendChild(tooltip);
        }
        
        return tooltip;
    },
    
    /**
     * Определяет сегмент диаграммы по координатам точки
     */
    getSegmentAtPoint: function(x, y) {
        if (!this.pieChart) return null;
        const { centerX, centerY, radius, data } = this.pieChart;
        const archive = this.currentData.trainedArchive || 0;
        const trained = data.trained;
        const untrained = data.untrained;
        const total = archive + trained + untrained;
        const archiveAngle = (archive / total) * 2 * Math.PI;
        const trainedAngle = (trained / total) * 2 * Math.PI;
        const untrainedAngle = (untrained / total) * 2 * Math.PI;

        // Проверяем, находится ли точка внутри кольца диаграммы
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < radius * 0.5 || distance > radius + 5) {
            return null;
        }

        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += 2 * Math.PI;

        if (angle >= 0 && angle < archiveAngle) {
            const percentage = ((archive / total) * 100).toFixed(1);
            return {
                label: 'Обучено всего',
                value: archive,
                percentage: percentage,
                color: '#4285f4'
            };
        } else if (angle >= archiveAngle && angle < archiveAngle + trainedAngle) {
            const percentage = ((trained / total) * 100).toFixed(1);
            return {
                label: 'Обучено за день',
                value: trained,
                percentage: percentage,
                color: '#28a745'
            };
        } else {
            const percentage = ((untrained / total) * 100).toFixed(1);
            return {
                label: 'Необучено',
                value: untrained,
                percentage: percentage,
                color: '#ea4335'
            };
        }
    },
    
    /**
     * Показывает tooltip
     */
    showTooltip: function(tooltip, x, y, segment) {
        let labelText = segment.label;
        if (segment.label === 'Обучено всего') labelText = 'Архив (обучено всего)';
        if (segment.label === 'Обучено за день') labelText = 'Обучено за день';
        if (segment.label === 'Необучено') labelText = 'Необучено';
        tooltip.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 8px; height: 8px; background: ${segment.color}; border-radius: 50%;"></div>
                <span><strong>${labelText}</strong></span>
            </div>
            <div style="margin-top: 4px;">
                Количество: <strong>${segment.value}</strong><br>
                Процент: <strong>${segment.percentage}%</strong>
            </div>
        `;
        
        // Позиционируем tooltip
        const tooltipRect = tooltip.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        let tooltipX = x + 10;
        let tooltipY = y - 10;
        
        // Проверяем, не выходит ли tooltip за границы экрана
        if (tooltipX + tooltipRect.width > windowWidth) {
            tooltipX = x - tooltipRect.width - 10;
        }
        
        if (tooltipY < 0) {
            tooltipY = y + 20;
        }
        
        tooltip.style.left = tooltipX + 'px';
        tooltip.style.top = tooltipY + 'px';
        tooltip.style.opacity = '1';
    },
    
    /**
     * Скрывает tooltip
     */
    hideTooltip: function(tooltip) {
        tooltip.style.opacity = '0';
    },
    
    /**
     * Применяет цветовую градацию к процентным значениям
     */
    applyPercentageBadgeColors: function() {
        const badges = document.querySelectorAll('.percentage-badge');
        badges.forEach(badge => {
            const percentage = parseInt(badge.textContent);
            
            // Убираем все классы цветов
            badge.classList.remove('excellent', 'good', 'average', 'poor');
            
            // Применяем новый класс в зависимости от процента
            if (percentage >= 90) {
                badge.classList.add('excellent');
            } else if (percentage >= 80) {
                badge.classList.add('good');
            } else if (percentage >= 70) {
                badge.classList.add('average');
            } else {
                badge.classList.add('poor');
            }
        });
    },
    
    /**
     * Очистка ресурсов при уничтожении аналитики
     */
    destroy: function() {
        // Отключаем ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        
        // Отключаем MutationObserver
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        
        // Удаляем обработчики событий с canvas
        const canvas = document.getElementById('analytics-line-chart');
        if (canvas) {
            if (canvas._chartMouseMove) {
                canvas.removeEventListener('mousemove', canvas._chartMouseMove);
                canvas._chartMouseMove = null;
            }
            if (canvas._chartMouseLeave) {
                canvas.removeEventListener('mouseleave', canvas._chartMouseLeave);
                canvas._chartMouseLeave = null;
            }
        }
        
        // Удаляем tooltip
        const tooltip = document.querySelector('.chart-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
        
        // Очищаем данные
        this.pieChart = null;
        this.lineChart = null;
        this.currentData = null;
        this.lastCanvasSize = null;
        this.isInitialized = false;
        this.windowResizeAdded = false;
        
        console.log('AnalyticsManager: ресурсы очищены');
    },
    
    /**
     * Добавление интерактивности к линейному графику
     */
    addLineChartInteractivity: function(canvas, points, rect) {
        let tooltip = null;
        
        // Создаем tooltip элемент
        const createTooltip = () => {
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'chart-tooltip';
                tooltip.style.position = 'fixed';
                tooltip.style.pointerEvents = 'none';
                tooltip.style.zIndex = '10000';
                tooltip.style.opacity = '0';
                document.body.appendChild(tooltip);
            }
            return tooltip;
        };
        
        // Обработчик движения мыши
        const handleMouseMove = (e) => {
            const canvasRect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - canvasRect.left;
            const mouseY = e.clientY - canvasRect.top;
            
            // Ищем ближайшую точку
            let closestPoint = null;
            let minDistance = Infinity;
            
            points.forEach(point => {
                const distance = Math.sqrt(
                    Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
                );
                
                if (distance < 20 && distance < minDistance) {
                    minDistance = distance;
                    closestPoint = point;
                }
            });
            
            const tooltipEl = createTooltip();
            
            if (closestPoint) {
                // Показываем tooltip
                tooltipEl.innerHTML = `
                    <div style="font-weight: 600; margin-bottom: 4px;">${closestPoint.month}</div>
                    <div>Звонков: <strong style="color: #ffd600;">${closestPoint.value}</strong></div>
                `;
                
                tooltipEl.style.left = (e.clientX + 10) + 'px';
                tooltipEl.style.top = (e.clientY - 40) + 'px';
                tooltipEl.style.opacity = '1';
                tooltipEl.classList.add('active');
                
                // Меняем курсор
                canvas.style.cursor = 'pointer';
                
                // Подсвечиваем точку
                this.highlightPoint(canvas, closestPoint);
            } else {
                // Скрываем tooltip
                tooltipEl.style.opacity = '0';
                tooltipEl.classList.remove('active');
                canvas.style.cursor = 'default';
                
                // Убираем подсветку
                this.redrawChart();
            }
        };
        
        // Обработчик ухода мыши
        const handleMouseLeave = () => {
            const tooltipEl = createTooltip();
            tooltipEl.style.opacity = '0';
            tooltipEl.classList.remove('active');
            canvas.style.cursor = 'default';
            this.redrawChart();
        };
        
        // Добавляем обработчики
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        
        // Сохраняем обработчики для возможности их удаления
        canvas._chartMouseMove = handleMouseMove;
        canvas._chartMouseLeave = handleMouseLeave;
    },
    
    /**
     * Подсветка точки на графике
     */
    highlightPoint: function(canvas, point) {
        if (!this.lineChart) return;
        
        const ctx = this.lineChart.ctx;
        const rect = this.lineChart.rect;
        
        // Перерисовываем график
        this.redrawChart();
        
        // Рисуем подсвеченную точку
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff6b35';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Рисуем вертикальную линию
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 1;
        ctx.moveTo(point.x, 40);
        ctx.lineTo(point.x, rect.height - 40);
        ctx.stroke();
        ctx.setLineDash([]);
    },
    
    /**
     * Перерисовка графика
     */
    redrawChart: function() {
        try {
            if (this.lineChart && this.currentData) {
                this.initLineChart();
            }
        } catch (error) {
            console.error('Ошибка при перерисовке графика:', error);
        }
    },
    
    /**
     * Инициализация отслеживания изменения размера
     */
    initResizeObserver: function() {
        const canvas = document.getElementById('analytics-line-chart');
        if (!canvas) return;
        
        // Проверяем, не инициализирован ли уже observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Debounce функция для оптимизации
        let resizeTimeout;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleCanvasResize();
            }, 150);
        };
        
        // ResizeObserver для отслеживания изменения размера контейнера
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(debouncedResize);
            this.resizeObserver.observe(canvas.parentElement);
        }
        
        // Fallback для старых браузеров (только если не было добавлено ранее)
        if (!this.windowResizeAdded) {
            window.addEventListener('resize', debouncedResize);
            this.windowResizeAdded = true;
        }
        
        // Отслеживание изменения размера через MutationObserver
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    debouncedResize();
                }
            });
        });
        
        this.mutationObserver.observe(canvas.parentElement, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    },
    
    /**
     * Обработка изменения размера canvas
     */
    handleCanvasResize: function() {
        try {
            const canvas = document.getElementById('analytics-line-chart');
            if (!canvas) return;
            
            // Проверяем, действительно ли изменился размер
            const rect = canvas.getBoundingClientRect();
            const currentWidth = rect.width;
            const currentHeight = rect.height;
            
            if (this.lastCanvasSize && 
                this.lastCanvasSize.width === currentWidth && 
                this.lastCanvasSize.height === currentHeight) {
                return; // Размер не изменился
            }
            
            this.lastCanvasSize = { width: currentWidth, height: currentHeight };
            
            // Перерисовываем график с новыми размерами
            setTimeout(() => {
                this.redrawChart();
            }, 50);
        } catch (error) {
            console.error('Ошибка при изменении размера canvas:', error);
        }
    },
};

// Экспортируем для использования в других модулях
window.AnalyticsManager = AnalyticsManager;
