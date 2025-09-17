// Управление селекторами даты и времени в отработках
class OtrabatkiDateTimeManager {
    constructor() {
        this.dateInput = null;
        this.timeInput = null;
        this.calendarPopover = null;
        this.clearBtn = null;
        this.init();
    }

    init() {
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDateTimeInputs());
        } else {
            this.setupDateTimeInputs();
        }
    }

    setupDateTimeInputs() {
        this.dateInput = document.querySelector('.otrabotki-date-input');
        this.timeInput = document.querySelector('.otrabotki-time-input');
        this.calendarPopover = document.getElementById('otrabotki-calendar-detail');
        this.timePickerPopover = document.getElementById('otrabotki-time-picker');
        this.clearBtn = document.querySelector('.otrabotki-datetime-selectors .date-clear-btn');
        
        this.selectedHour = 0;  // По умолчанию 00 часов
        this.selectedMinute = 0; // По умолчанию 00 минут

        if (this.dateInput && this.timeInput) {
            // Устанавливаем время 00:00 по умолчанию
            this.setTime(this.selectedHour, this.selectedMinute);
            this.addEventListeners();
            this.initCalendarPopover();
            this.initTimePickerPopover();
        }
    }

    initCalendarPopover() {
        // Создаем CalendarPopover экземпляр для нашего селектора даты
        if (this.calendarPopover && this.dateInput) {
            if (typeof CalendarPopover !== 'undefined') {
                try {
                    // Создаем экземпляр календаря
                    this.calendarPopover._instance = new CalendarPopover(this.calendarPopover, {
                        onSelect: (selectedDate) => {
                            this.setDate(selectedDate);
                            this.onDateChange(selectedDate);
                            this.hideCalendar();
                        }
                    });
                    
                    this.setupCalendarIntegration();
                    console.log('Calendar popover initialized successfully');
                } catch (error) {
                    console.error('Error initializing calendar popover:', error);
                }
            } else {
                console.error('CalendarPopover class not found');
            }
        } else {
            console.error('Calendar popover or date input not found');
        }
    }

    setupCalendarIntegration() {
        // Обработчик клика на date picker для показа календаря
        const datePicker = this.dateInput.closest('.date-picker');
        if (datePicker) {
            datePicker.addEventListener('click', (e) => {
                if (e.target !== this.clearBtn && !this.clearBtn.contains(e.target)) {
                    this.showCalendar();
                }
            });
        }
        
        // Слушатель изменения размеров окна и сайдбара для обновления позиции календаря и time-picker
        window.addEventListener('resize', () => {
            if (!this.calendarPopover.classList.contains('calendar-hidden')) {
                this.updateCalendarPosition();
            }
            if (!this.timePickerPopover.classList.contains('time-picker-hidden')) {
                this.positionTimePicker();
            }
        });
        
        // Наблюдатель за изменениями класса body для отслеживания состояния сайдбара
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    // Небольшая задержка для завершения анимации сайдбара
                    setTimeout(() => {
                        if (!this.calendarPopover.classList.contains('calendar-hidden')) {
                            this.updateCalendarPosition();
                        }
                        if (!this.timePickerPopover.classList.contains('time-picker-hidden')) {
                            this.positionTimePicker();
                        }
                    }, 100);
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
        
        // Закрытие календаря при клике вне его
        document.addEventListener('click', (e) => {
            const dateTimeSelectors = document.querySelector('.otrabotki-datetime-selectors');
            const isWithinDateTime = dateTimeSelectors && dateTimeSelectors.contains(e.target);
            
            if (!isWithinDateTime) {
                this.hideCalendar();
            } else {
                // Если клик внутри селекторов, проверяем конкретные области
                const dateGroup = this.dateInput.closest('.otrabotki-datetime-group');
                const timeGroup = this.timeInput.closest('.otrabotki-datetime-group');
                
                const isWithinDatePicker = dateGroup && dateGroup.contains(e.target);
                // Проверяем и саму группу времени, и time-picker, т.к. он теперь в корне body
                const isWithinTimePicker = (timeGroup && timeGroup.contains(e.target)) || 
                                          (this.timePickerPopover && this.timePickerPopover.contains(e.target));
                
                if (!isWithinDatePicker) {
                    this.hideCalendar();
                }
                if (!isWithinTimePicker) {
                    this.hideTimePicker();
                }
            }
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCalendar();
                this.hideTimePicker();
            }
        });
    }

    showCalendar() {
        if (this.calendarPopover && this.calendarPopover._instance) {
            // Находим календарную привязку (anchor)
            const calendarAnchor = document.querySelector('.otrabotki-datetime-selectors .calendar-anchor');
            if (calendarAnchor) {
                this.positionCalendar(calendarAnchor);
            }
            
            this.calendarPopover.classList.remove('calendar-hidden');
            this.calendarPopover.setAttribute('aria-hidden', 'false');
            
            // Обновляем календарь для текущего месяца
            if (this.calendarPopover._instance.updateCalendar) {
                this.calendarPopover._instance.updateCalendar();
            }
            
            console.log('Calendar shown');
        } else {
            console.error('Calendar popover or instance not available');
        }
    }
    
    hideCalendar() {
        if (this.calendarPopover) {
            this.calendarPopover.classList.add('calendar-hidden');
            this.calendarPopover.setAttribute('aria-hidden', 'true');
        }
    }
    
    positionCalendar(anchor) {
        if (!this.calendarPopover || !anchor) return;
        
        // Находим конкретно date-picker внутри anchor
        const datePicker = anchor.querySelector('.date-picker');
        const targetElement = datePicker || anchor;
        
        const rect = targetElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Временно показываем календарь для получения его размеров
        this.calendarPopover.style.visibility = 'hidden';
        this.calendarPopover.style.display = 'block';
        const calendarRect = this.calendarPopover.getBoundingClientRect();
        this.calendarPopover.style.visibility = '';
        
        // Позиционируем календарь под date-picker
        let left = rect.left + (rect.width - calendarRect.width) / 2;
        let top = rect.bottom + 2;
        
        // Проверяем, не выходит ли календарь за границы экрана
        if (left + calendarRect.width > viewportWidth - 2) {
            left = viewportWidth - calendarRect.width - 2;
        }
        if (left < 2) {
            left = 2;
        }
        
        if (top + calendarRect.height > viewportHeight - 2) {
            top = rect.top - calendarRect.height - 2;
        }
        
        this.calendarPopover.style.position = 'fixed';
        this.calendarPopover.style.left = `${left}px`;
        this.calendarPopover.style.top = `${top}px`;
        this.calendarPopover.style.zIndex = '1000';
        this.calendarPopover.style.transform = 'none';
    }
    
    updateCalendarPosition() {
        // Обновляем позицию календаря если он открыт
        const calendarAnchor = document.querySelector('.otrabotki-datetime-selectors .calendar-anchor');
        if (calendarAnchor && !this.calendarPopover.classList.contains('calendar-hidden')) {
            this.positionCalendar(calendarAnchor);
        }
    }

    initTimePickerPopover() {
        if (!this.timePickerPopover) return;
        
        this.createTimeOptions();
        this.setupTimePickerEvents();
    }

    createTimeOptions() {
        const hoursContainer = this.timePickerPopover.querySelector('[data-type="hours"]');
        const minutesContainer = this.timePickerPopover.querySelector('[data-type="minutes"]');
        
        // Создаем опции для часов (0-23)
        for (let hour = 0; hour < 24; hour++) {
            const option = document.createElement('div');
            option.className = 'time-option';
            option.textContent = hour.toString().padStart(2, '0');
            option.dataset.value = hour;
            hoursContainer.appendChild(option);
        }
        
        // Создаем опции для минут (поминутно)
        for (let minute = 0; minute < 60; minute++) {
            const option = document.createElement('div');
            option.className = 'time-option';
            option.textContent = minute.toString().padStart(2, '0');
            option.dataset.value = minute;
            minutesContainer.appendChild(option);
        }
    }

    setupTimePickerEvents() {
        // Обработчик клика на time input
        const timePicker = this.timeInput.closest('.date-picker');
        if (timePicker) {
            timePicker.addEventListener('click', (e) => {
                this.showTimePicker();
            });
        }

        // Добавляем обработчик для закрытия при клике вне time picker
        document.addEventListener('mousedown', (e) => {
            if (this.timePickerPopover && !this.timePickerPopover.classList.contains('time-picker-hidden')) {
                const isClickInside = this.timePickerPopover.contains(e.target);
                const isClickOnInput = this.timeInput.closest('.date-picker').contains(e.target);
                
                if (!isClickInside && !isClickOnInput) {
                    this.hideTimePicker();
                }
            }
        });

        // Останавливаем всплытие кликов внутри time picker
        this.timePickerPopover.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Обработчики для выбора времени
        const hoursContainer = this.timePickerPopover.querySelector('[data-type="hours"]');
        const minutesContainer = this.timePickerPopover.querySelector('[data-type="minutes"]');
        
        hoursContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('time-option')) {
                e.stopPropagation(); // Prevent event from bubbling up
                hoursContainer.querySelectorAll('.time-option').forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedHour = parseInt(e.target.dataset.value);
            }
        });
        
        minutesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('time-option')) {
                e.stopPropagation(); // Prevent event from bubbling up
                minutesContainer.querySelectorAll('.time-option').forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedMinute = parseInt(e.target.dataset.value);
            }
        });

        // Обработчики кнопок
        const okBtn = this.timePickerPopover.querySelector('.time-picker-ok');
        const cancelBtn = this.timePickerPopover.querySelector('.time-picker-cancel');
        
        okBtn.addEventListener('click', () => {
            this.setTime(this.selectedHour, this.selectedMinute);
            this.hideTimePicker();
        });
        
        cancelBtn.addEventListener('click', () => {
            this.hideTimePicker();
        });


    }

    showTimePicker() {
        if (this.timePickerPopover) {
            // Позиционируем time-picker относительно кнопки времени
            this.positionTimePicker();
            
            // Обновляем выбранные значения в UI
            this.updateTimePickerSelection();
            this.timePickerPopover.classList.remove('time-picker-hidden');
        }
    }

    hideTimePicker() {
        if (this.timePickerPopover) {
            this.timePickerPopover.classList.add('time-picker-hidden');
        }
    }

    positionTimePicker() {
        if (!this.timePickerPopover || !this.timeInput) return;

        // Находим контейнер времени для позиционирования
        const timeContainer = this.timeInput.closest('.date-picker');
        if (!timeContainer) return;

        const rect = timeContainer.getBoundingClientRect();
        const popoverRect = this.timePickerPopover.getBoundingClientRect();
        
        // Позиционируем над кнопкой времени, сдвигаем левее
        let top = rect.top - popoverRect.height - 2;
        let left = rect.left - 60;

        // getBoundingClientRect() уже учитывает фактическое положение элементов
        // включая смещения от sidebar, поэтому дополнительная коррекция не нужна

        // Проверяем, чтобы не выходил за пределы экрана
        if (top < 2) {
            // Если не помещается сверху, показываем снизу
            top = rect.bottom + 2;
        }

        // Корректируем горизонтальное положение
        const minLeft = 10;
        const maxLeft = window.innerWidth - popoverRect.width - 10;
        
        if (left < minLeft) {
            left = minLeft;
        } else if (left > maxLeft) {
            left = maxLeft;
        }

        this.timePickerPopover.style.top = `${top}px`;
        this.timePickerPopover.style.left = `${left}px`;
    }

    updateTimePickerSelection() {
        const hoursContainer = this.timePickerPopover.querySelector('[data-type="hours"]');
        const minutesContainer = this.timePickerPopover.querySelector('[data-type="minutes"]');
        
        // Снимаем все выделения
        hoursContainer.querySelectorAll('.time-option').forEach(opt => opt.classList.remove('selected'));
        minutesContainer.querySelectorAll('.time-option').forEach(opt => opt.classList.remove('selected'));
        
        // Выделяем текущие значения
        const hourOption = hoursContainer.querySelector(`[data-value="${this.selectedHour}"]`);
        const minuteOption = minutesContainer.querySelector(`[data-value="${this.selectedMinute}"]`);
        
        if (hourOption) {
            hourOption.classList.add('selected');
            hourOption.scrollIntoView({ block: 'center' });
        }
        if (minuteOption) {
            minuteOption.classList.add('selected');
            minuteOption.scrollIntoView({ block: 'center' });
        }
    }

    setTime(hour, minute) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeInput.value = timeString;
        this.selectedHour = hour;
        this.selectedMinute = minute;
        this.onTimeChange(timeString);
    }

    setCurrentDateTime() {
        const now = new Date();
        
        // Устанавливаем текущую дату в формате для отображения
        this.setDate(now);

        // Устанавливаем текущее время (округленное до ближайших 5 минут)
        const hours = now.getHours();
        const minutes = Math.round(now.getMinutes() / 5) * 5;
        this.setTime(hours, minutes % 60);
    }

    setDate(date) {
        if (!this.dateInput) return;
        
        if (date instanceof Date) {
            // Форматируем дату для отображения
            const options = { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
            };
            const formattedDate = date.toLocaleDateString('ru-RU', options);
            this.dateInput.value = formattedDate;
            
            // Добавляем класс выбранной даты
            const datePicker = this.dateInput.closest('.date-picker');
            if (datePicker) {
                datePicker.classList.add('date-selected');
            }
        }
    }

    clearDate() {
        if (this.dateInput) {
            this.dateInput.value = '';
            const datePicker = this.dateInput.closest('.date-picker');
            if (datePicker) {
                datePicker.classList.remove('date-selected');
            }
        }
    }

    addEventListeners() {
        // Обработчик клика на time input (теперь readonly)
        if (this.timeInput) {
            this.timeInput.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTimePicker();
            });
        }

        // Обработчик кнопки очистки даты
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearDate();
                this.onDateChange('');
            });
        }

        // Обработчик фокуса на date input (readonly, поэтому только фокус)
        if (this.dateInput) {
            this.dateInput.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCalendar();
            });
        }
    }

    onDateChange(selectedDate) {
        console.log('Дата изменена:', selectedDate);
        
        // Убрана валидация даты - теперь можно выбирать любую дату, включая будущую
        
        // Можно добавить дополнительную логику обработки
        this.updateRelatedData();
    }

    onTimeChange(newTime) {
        console.log('Время изменено:', newTime);
        
        // Можно добавить дополнительную логику обработки
        this.updateRelatedData();
    }

    validateTime(input) {
        const value = input.value;
        if (value) {
            // Можно добавить дополнительную валидацию времени
            input.setCustomValidity('');
        }
    }

    updateRelatedData() {
        // Здесь можно обновлять связанные данные при изменении даты/времени
        const selectedDateTime = this.getSelectedDateTime();
        console.log('Выбранная дата и время:', selectedDateTime);
    }

    getSelectedDateTime() {
        const selectedDate = this.getSelectedDate();
        const time = this.timeInput ? this.timeInput.value : null;
        
        if (selectedDate && time) {
            const [hours, minutes] = time.split(':');
            selectedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return selectedDate;
        }
        
        return selectedDate; // возвращаем хотя бы дату, если время не выбрано
    }

    setDateTime(date, time) {
        if (date) {
            if (typeof date === 'string') {
                // Если передана строка, парсим как дату
                const parsedDate = new Date(date);
                this.setDate(parsedDate);
            } else if (date instanceof Date) {
                this.setDate(date);
            }
        }
        if (this.timeInput && time) {
            this.timeInput.value = time;
        }
    }

    getSelectedDate() {
        if (!this.dateInput || !this.dateInput.value) return null;
        
        // Парсим дату из формата dd.mm.yyyy
        const dateStr = this.dateInput.value;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // месяцы в JS начинаются с 0
            const year = parseInt(parts[2]);
            return new Date(year, month, day);
        }
        return null;
    }

    showWarning(message) {
        // Простое уведомление (можно заменить на более красивое)
        if (window.notificationManager && window.notificationManager.show) {
            window.notificationManager.show('warning', message);
        } else {
            alert(message);
        }
    }
}

// Инициализируем менеджер даты и времени
const otrabatkiDateTimeManager = new OtrabatkiDateTimeManager();

// Экспортируем для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OtrabatkiDateTimeManager;
}
