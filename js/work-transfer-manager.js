/**
 * Менеджер для переноса рабочего дня
 * Управляет новыми окнами переноса рабочего дня
 */

class WorkTransferManager {
    constructor() {
    // Сохранённые записи (строки таблицы)
    this.data = [];
    // Справочник операторов для выбора
    this.operators = [];
    // Выбранный оператор (для создания новой записи)
    this.selectedOperatorId = null;
    // Текущая редактируемая запись (id записи), если открыт режим редактирования
    this.editingId = null;
    this.pendingAttachments = [];
    this.init();
    }
    
    init() {
    console.log('WorkTransferManager: Инициализация отдела переноса рабочего дня');
    this.setupEventListeners();
    // Загружаем каталог операторов (из ассетов)
    this.loadSampleData();
    // Загружаем сохранённые строки таблицы из localStorage
    try {
        const raw = localStorage.getItem('work-transfer-data');
        const parsed = raw ? JSON.parse(raw) : [];
        this.data = Array.isArray(parsed) ? parsed : [];
    } catch { this.data = []; }
    // Удаляем ранее засеянные демо-строки, чтобы по умолчанию таблица была пустой
    this._migrateDemoRows();
    this.renderList();
    this.renderAttachmentsPreview();
    // Приведём плейсхолдер аватара к выбранному варианту, если оператор не выбран
    this.syncAvatarPlaceholderImage();
    // Отключим родной автозаполнитель браузера у поля поиска
    const searchInp = document.getElementById('global-search');
    if (searchInp) {
        searchInp.setAttribute('autocomplete', 'off');
        searchInp.setAttribute('autocorrect', 'off');
        searchInp.setAttribute('autocapitalize', 'off');
        searchInp.setAttribute('spellcheck', 'false');
        searchInp.setAttribute('inputmode', 'search');
        // Запрет нативного меню автозаполнения на keydown
        searchInp.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' && e.target && e.target.matches('#global-search')) {
                // Пробуем подавить системное меню автозаполнения
                e.preventDefault();
            }
        });
    }
    }
    
    /**
     * Парсинг даты из разных форматов в объект Date.
     * Поддерживаются:
     *  - ISO (YYYY-MM-DD)
     *  - Локализованные строки вида "20 Авг 2025", "20 авг. 2025 г." и т.п.
     */
    parseDateAny(text) {
        if (!text) return null;
        const raw = String(text).trim();
        // 1) Прямая попытка через Date
        const d1 = new Date(raw);
        if (!isNaN(d1.getTime())) return d1;
        // 2) Попробуем распарсить RU-строки вида: 20 авг. 2025 г.
        let t = raw
            .toLowerCase()
            .replace(/\u00a0/g, ' ') // неразрывные пробелы
            .replace(/[,]/g, ' ')
            .replace(/\s+г\.?$/i, '') // хвост "г." или "г"
            .replace(/\./g, '') // точки в аббревиатурах месяцев
            .trim();
        const tokens = t.split(/\s+/).filter(Boolean);
        if (tokens.length >= 3) {
            const day = parseInt(tokens[0], 10);
            const monthToken = tokens[1];
            const year = parseInt(tokens[2], 10);
            if (!isNaN(day) && !isNaN(year)) {
                const m = this._ruMonthToIndex(monthToken);
                if (m >= 0) {
                    const d = new Date(year, m, day);
                    if (!isNaN(d.getTime())) return d;
                }
            }
        }
        return null;
    }

    /**
     * Синхронизирует изображение плейсхолдера аватара с учётом data-use-creative
     * Используется только когда оператор не выбран и мы показываем пустую аву
     */
    syncAvatarPlaceholderImage() {
        if (this.selectedOperatorId) return; // если выбран оператор — ничего не трогаем
        const avatarBox = document.querySelector('.user-avatar');
        const avatarImg = avatarBox?.querySelector('img');
        if (!avatarBox || !avatarImg) return;
        const useCreative = (avatarBox.getAttribute('data-use-creative') || '').toLowerCase() === 'true';
        const ph = useCreative
            ? (avatarBox.getAttribute('data-placeholder-creative') || 'assets/Аватар/placeholder-creative.svg')
            : (avatarBox.getAttribute('data-placeholder') || 'assets/Аватар/placeholder.png');
        avatarImg.src = ph;
    }

    _ruMonthToIndex(token) {
        const s = (token || '').toLowerCase();
        // поддержим как короткие, так и "корневые" формы
        const map = {
            'ян': 0, 'янв': 0, 'январ': 0,
            'фе': 1, 'фев': 1, 'феврал': 1,
            'мар': 2, 'март': 2,
            'апр': 3, 'апрел': 3,
            'май': 4,
            'июн': 5,
            'июл': 6,
            'авг': 7, 'август': 7,
            'сен': 8, 'сент': 8,
            'окт': 9, 'октябр': 9,
            'ноя': 10, 'нояб': 10, 'ноябр': 10,
            'дек': 11, 'декабр': 11
        };
        // ищем совпадение по началу строки, чтобы покрыть варианты
        for (const key of Object.keys(map)) {
            if (s.startsWith(key)) return map[key];
        }
        return -1;
    }

    /** Возвращает ISO-дату (YYYY-MM-DD) из Date */
    toISODate(d) {
        if (!(d instanceof Date) || isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    setupEventListeners() {
        // Обработчик для кнопки редактирования
        const editorToggle = document.getElementById('editor-toggle');
        if (editorToggle) {
            editorToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleEditMode();
            });
        }
        
        // Обработчик для кнопки сохранения
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveConfiguration();
            });
        }
        
        // Обработчик для кнопки отмены
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelEdit();
            });
        }
        
        // Обработчик для сброса окон
        const resetBtn = document.getElementById('reset-windows-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetWindows();
            });
        }

        // Глобальная кнопка сохранения
        const saveGlobal = document.getElementById('save-global');
        if (saveGlobal) saveGlobal.addEventListener('click', () => this.handleGlobalSave());

        // Файл
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            // Разрешаем выбирать только изображения
            try { fileInput.setAttribute('accept', 'image/*'); } catch {}
            // Разрешим выбор нескольких файлов (ограничим логикой до 2)
            try { fileInput.setAttribute('multiple', 'multiple'); } catch {}
            // Удалим старую подпись имени файла, если она осталась в разметке
            const wrap = fileInput.closest('.attach-wrap');
            if (wrap) {
                const legacy = wrap.querySelector('#file-name');
                if (legacy) legacy.remove();
            }
            fileInput.addEventListener('change', (e) => this.handleFileAttach(e));
        }

        // Делегирование для удаления прикреплённых файлов (до сохранения)
        const preview = document.getElementById('attachments-preview');
        if (preview) {
            preview.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-remove-attachment]');
                if (!btn) return;
                e.preventDefault();
                const idxAttr = btn.getAttribute('data-idx');
                const idx = typeof idxAttr === 'string' ? parseInt(idxAttr, 10) : -1;
                if (idx >= 0) {
                    if (!Array.isArray(this.pendingAttachments)) this.pendingAttachments = [];
                    this.pendingAttachments.splice(idx, 1);
                }
                const fi = document.getElementById('file-input');
                if (fi) fi.value = '';
                this.renderAttachmentsPreview();
            });
        }

        // Поиск + подсказки операторов
    const search = document.getElementById('global-search');
    const sugg = document.getElementById('global-search-suggestions');
            if (search && sugg) {
            let t;
                const positionSugg = () => {
                    const anchor = search.closest('.search-input') || search;
                    const r = anchor.getBoundingClientRect();
                    // Place under the input with small gap
                    const top = Math.round(r.bottom + 1);
                    const left = Math.round(r.left);
                    const vw = document.documentElement.clientWidth || window.innerWidth;
                    const width = Math.min(Math.round(r.width), vw - 8);
                    // Clamp within viewport width
                    const maxLeft = Math.max(0, vw - width - 8);
                    const finalLeft = Math.min(left, maxLeft);
                    Object.assign(sugg.style, {
                        position: 'fixed',
                        top: top + 'px',
                        left: finalLeft + 'px',
                        width: width + 'px',
                        marginTop: '0px'
                    });
                };
            const renderSuggestions = (query = '') => {
                const q = (query || '').trim().toLowerCase();
                const items = this.operators.filter(d => d.fullName.toLowerCase().includes(q));
                if (!items.length) {
                    sugg.innerHTML = `<div class="search-suggestion-item empty">Ничего не найдено</div>`;
                } else {
                    sugg.innerHTML = items.map((d, i) => `<div class="search-suggestion-item" role="option" data-id="${d.operatorId}" data-idx="${i}">${d.fullName}</div>`).join('');
                }
            };
                const openSugg = () => {
                    positionSugg();
                    sugg.classList.remove('hidden');
                    // во время анимации открытия/закрытия сайдбара подстраиваем позицию
                    const start = performance.now();
                    const tick = (ts) => {
                        if (sugg.classList.contains('hidden')) return; // прекращаем, если закрыли
                        if (ts - start < 600) { // типичная длительность анимации сайдбара
                            positionSugg();
                            requestAnimationFrame(tick);
                        }
                    };
                    requestAnimationFrame(tick);
                };
            const closeSugg = () => { sugg.classList.add('hidden'); };
        const selectById = (id) => {
                const item = this.operators.find(x => x.operatorId === id);
                if (!item) return;
                this.selectedOperatorId = id;
                // При выборе оператора выходим из режима редактирования (если он был)
                this.editingId = null;
                search.value = item.fullName;
                // Показать аватар и причину
                const avatarBox = document.querySelector('.user-avatar');
                const avatarImg = avatarBox?.querySelector('img');
                if (avatarBox && avatarImg) {
            const placeholder = avatarBox.getAttribute('data-placeholder') || 'assets/Аватар/placeholder.png';
            avatarImg.onerror = () => { avatarImg.src = placeholder; avatarImg.onerror = null; };
            avatarImg.src = item.avatar || placeholder;
                    avatarBox.classList.remove('hidden');
                }
                const reasonText = document.querySelector('.reason-text');
                if (reasonText) {
                    reasonText.textContent = item.reason || '';
                    if (item.reason) reasonText.classList.remove('hidden');
                    else reasonText.classList.add('hidden');
                }
                closeSugg();
            };

            // input: фильтруем и показываем
            search.addEventListener('input', (e) => {
                clearTimeout(t);
                t = setTimeout(() => {
                    renderSuggestions(e.target.value);
                    openSugg();
                }, 150);
            });
            // focus/click: показываем полный список
            const showAll = () => { renderSuggestions(''); openSugg(); };
            search.addEventListener('focus', showAll);
            search.addEventListener('click', showAll);

            // click на подсказку
            sugg.addEventListener('click', (e) => {
                const itemEl = e.target.closest('.search-suggestion-item');
                if (!itemEl || itemEl.classList.contains('empty')) return;
                const id = itemEl.getAttribute('data-id');
                selectById(id);
            });

            // закрытие по клику вне
            document.addEventListener('click', (e) => {
                const within = e.target === search || e.target === sugg || (sugg.contains(e.target)) || (search.closest('.search-field') && search.closest('.search-field').contains(e.target));
                if (!within) closeSugg();
            });
            // ESC закрывает
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSugg(); });

            // Поддерживаем позицию при прокрутке/изменении размера
            const repositionIfOpen = () => { if (!sugg.classList.contains('hidden')) positionSugg(); };
            window.addEventListener('resize', repositionIfOpen);
            window.addEventListener('scroll', repositionIfOpen, true);

            // Подстраиваем позицию при открытии/закрытии сайдбара (транзишены/анимации)
            const sidebarEl = document.querySelector('.sidebar');
            if (sidebarEl) {
                let rafId = null;
                const startLoop = () => {
                    if (rafId) return;
                    const t0 = performance.now();
                    const step = (t) => {
                        if (sugg.classList.contains('hidden')) { rafId = null; return; }
                        // ограничим ~800мс
                        if (t - t0 < 800) {
                            positionSugg();
                            rafId = requestAnimationFrame(step);
                        } else {
                            rafId = null;
                        }
                    };
                    rafId = requestAnimationFrame(step);
                };
                const stopLoop = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } positionSugg(); };

                sidebarEl.addEventListener('transitionrun', startLoop, { passive: true });
                sidebarEl.addEventListener('transitionstart', startLoop, { passive: true });
                sidebarEl.addEventListener('animationstart', startLoop, { passive: true });
                sidebarEl.addEventListener('transitionend', stopLoop, { passive: true });
                sidebarEl.addEventListener('animationend', stopLoop, { passive: true });
                const sbObserver = new MutationObserver(repositionIfOpen);
                sbObserver.observe(sidebarEl, { attributes: true, attributeFilter: ['class','style'] });
            }
            // Наблюдаем за изменениями макета
            const layoutEl = document.querySelector('.training-layout');
            if (layoutEl) {
                const lyObserver = new MutationObserver(repositionIfOpen);
                lyObserver.observe(layoutEl, { attributes: true, attributeFilter: ['class','style'] });
            }
            // Наблюдаем изменение классов body (например, .sidebar-open)
            const bodyObserver = new MutationObserver(repositionIfOpen);
            bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }

        // Calendar popovers
    const inputFrom = document.getElementById('date-from');
    const inputTo = document.getElementById('date-to');
    // Заглушка по умолчанию для полей даты
    if (inputFrom && !inputFrom.value) { try { inputFrom.setAttribute('placeholder', 'Выберите дату'); } catch {} }
    if (inputTo && !inputTo.value) { try { inputTo.setAttribute('placeholder', 'Выберите дату'); } catch {} }
        const calFromEl = document.getElementById('calendar-from');
        const calToEl = document.getElementById('calendar-to');
        if (inputFrom && calFromEl) {
          this.calFrom = new CalendarPopover(calFromEl, {
            onSelect: (date, text) => { inputFrom.value = text; this._closeCalendars(); }
          });
          const openFrom = () => this._openCalendar(calFromEl, inputFrom);
          inputFrom.addEventListener('focus', openFrom);
          inputFrom.addEventListener('click', openFrom);
          const pickerFrom = inputFrom.closest('.date-picker');
          if (pickerFrom) pickerFrom.addEventListener('click', openFrom);
        }
        if (inputTo && calToEl) {
          this.calTo = new CalendarPopover(calToEl, {
            onSelect: (date, text) => { inputTo.value = text; this._closeCalendars(); }
          });
          const openTo = () => this._openCalendar(calToEl, inputTo);
          inputTo.addEventListener('focus', openTo);
          inputTo.addEventListener('click', openTo);
          const pickerTo = inputTo.closest('.date-picker');
          if (pickerTo) pickerTo.addEventListener('click', openTo);
        }
        document.addEventListener('click', (e) => {
          const within = (calFromEl && calFromEl.contains(e.target)) || (calToEl && calToEl.contains(e.target)) ||
            (inputFrom && (e.target === inputFrom || (inputFrom.closest('.date-picker') && inputFrom.closest('.date-picker').contains(e.target)))) ||
            (inputTo && (e.target === inputTo || (inputTo.closest('.date-picker') && inputTo.closest('.date-picker').contains(e.target))));
          if (!within) this._closeCalendars();
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this._closeCalendars(); });
    }
    
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        
        const headerControls = document.getElementById('header-editor-controls');
        const userDropdown = document.getElementById('header-dropdown');
        
        if (this.isEditMode) {
            // Включаем режим редактирования
            if (headerControls) {
                headerControls.style.display = 'flex';
                setTimeout(() => {
                    headerControls.classList.add('show');
                }, 10);
            }
            
            // Скрываем dropdown пользователя
            if (userDropdown) {
                userDropdown.classList.remove('show');
            }
            
            console.log('WorkTransferManager: Режим редактирования включен');
            this.showEditHints();
            
        } else {
            // Выключаем режим редактирования
            if (headerControls) {
                headerControls.classList.remove('show');
                setTimeout(() => {
                    headerControls.style.display = 'none';
                }, 300);
            }
            
            console.log('WorkTransferManager: Режим редактирования выключен');
            this.hideEditHints();
        }
    }
    
    showEditHints() {
        // Показываем подсказки для режима редактирования
        const placeholder = document.querySelector('.training-placeholder');
        if (placeholder) {
            const hint = document.createElement('div');
            hint.className = 'edit-mode-hint';
            hint.innerHTML = `
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #2196f3;">
                    <p><strong>🎨 Режим редактирования активен</strong></p>
                    <p>Здесь будут появляться новые окна для управления переносом рабочего дня</p>
                    <p><em>Используйте кнопки в заголовке для управления окнами</em></p>
                </div>
            `;
            placeholder.appendChild(hint);
        }
    }
    
    hideEditHints() {
        // Скрываем подсказки режима редактирования
        const hints = document.querySelectorAll('.edit-mode-hint');
        hints.forEach(hint => hint.remove());
    }
    
    saveConfiguration() {
        // Сохраняем конфигурацию окон
        const config = {
            windows: this.windows,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('work-transfer-windows-config', JSON.stringify(config));
        
        console.log('WorkTransferManager: Конфигурация сохранена', config);
        
        // Показываем уведомление
        this.showNotification('Настройки сохранены', 'success');
        
        // Выключаем режим редактирования
        this.toggleEditMode();
    }
    
    cancelEdit() {
        // Отменяем изменения и выключаем редактирование
        console.log('WorkTransferManager: Отмена редактирования');
        
        // Восстанавливаем сохраненную конфигурацию
        this.loadConfiguration();
        
        // Выключаем режим редактирования
        this.toggleEditMode();
        
        this.showNotification('Изменения отменены', 'info');
    }
    
    resetWindows() {
        // Сбрасываем все окна
        if (confirm('Вы уверены, что хотите сбросить все настройки окон?')) {
            this.windows = [];
            localStorage.removeItem('work-transfer-windows-config');
            
            console.log('WorkTransferManager: Настройки окон сброшены');
            this.showNotification('Настройки окон сброшены', 'warning');
            
            // Перезагружаем интерфейс
            this.renderWindows();
        }
    }
    
    loadConfiguration() {
    // not used in this simplified manager
    }
    
    renderWindows() {
    // legacy
    }
    
    createWindow(config) {
        // Создаем новое окно
        const layout = document.querySelector('.training-layout');
        if (!layout) return;
        
        const windowElement = document.createElement('div');
        windowElement.className = 'work-transfer-window';
        windowElement.dataset.windowId = config.id;
        
        windowElement.innerHTML = `
            <div class="work-transfer-window-header">
                <h3 class="work-transfer-window-title">
                    <span class="material-icons">${config.icon}</span>
                    ${config.title}
                </h3>
                <div class="work-transfer-window-controls">
                    <button class="work-transfer-window-btn" onclick="workTransferManager.minimizeWindow('${config.id}')">
                        <span class="material-icons">minimize</span>
                    </button>
                    <button class="work-transfer-window-btn" onclick="workTransferManager.closeWindow('${config.id}')">
                        <span class="material-icons">close</span>
                    </button>
                </div>
            </div>
            <div class="work-transfer-window-content">
                ${config.content || '<p>Содержимое окна будет добавлено позже...</p>'}
            </div>
        `;
        
        // Добавляем окно в layout (перед заглушкой)
        const placeholder = layout.querySelector('.training-placeholder');
        if (placeholder) {
            layout.insertBefore(windowElement, placeholder);
        } else {
            layout.appendChild(windowElement);
        }
        
        console.log('WorkTransferManager: Создано окно', config);
    }

    /* ==== НОВЫЕ МЕТОДЫ ДЛЯ СПИСКА ==== */
    loadSampleData() {
        // Формируем каталог операторов на основе папки assets/Операторы с Ф.И.О
        // Преобразуем имена файлов в ФИО и ID из скобок
        const operatorFiles = [
            "Abdug'aniyev Abdulaziz Abdug'ofur o'g'li (358).png",
            "Abduxalilov Abdulaziz Abduvali o'g'li (0308).png",
            "Adilova Arofat Faxriddin qizi (0211).jpg",
            "Ahmadova Xilola Mahmud qizi (0256).jpg",
            "Alimov Shaxzod Ilxomovich (0544).png",
            "Ayniddinov Tursunboy Dilshod o'g'li (0372).jpg",
            "Banyazov Kudratilla Irgashovich (0281).png",
            "Baxtiyorov Sirojiddin Furqat o'g'li (269).jpg",
            "Bekmuxamedov Abdumavlon Abduvoxid o'g'li (0365).png",
            "Fozilxonov Zoirxon Davron o'g'li (0147).png",
            "Riskiyev Bonur Boxodir o'g'li (0485).jpg",
            "Ruziyeva Xusnora Sodiqjon qizi (247).png",
            "Sobirov Abduxakim Qobil o'g'li (0116).png",
        ];
        const basePath = 'assets/Операторы с Ф.И.О/';
        const items = operatorFiles.map(fn => {
            const nameNoExt = fn.replace(/\.(png|jpg|jpeg|gif)$/i, '');
            const idMatch = nameNoExt.match(/\(([^)]+)\)$/);
            const operatorId = idMatch ? idMatch[1].replace(/^0+/, '') : String(Math.random()).slice(2, 6);
            const fullName = nameNoExt;
            return { operatorId, avatar: basePath + fn, fullName };
        });
        // Примерные причины — распределим по операторам по порядку
        const exampleReasons = [
            'Б (с: 19.08.2025 до: 22.08.2025)',
            'Б (с: 02.09.2025 до: )',
            'Б (с: 27.08.2025 до: 31.08.2025)',
            'Б (с: 26.08.2025 до: 30.08.2025)',
            'Б (с: 21.08.2025 до: ) и Н (с: 20.08.2025 до: 20.08.2025)',
            'О (с: 03.09.2025 до: 01.10.2025)',
            'Б (с: 03.09.2025 до: ) и Н (с: 29.08.2025 до: 30.08.2025)',
            'О (с: 01.08.2025 до: 07.09.2025) и Б (с: 06.09.2025 до: )',
            'Б (с: 18.08.2025 до: 23.08.2025)',
            'О (с: 04.08.2025 до: 07.09.2025) и Б (с: 08.09.2025 до: )'
        ];
        for (let i = 0; i < items.length; i++) {
            items[i].reason = exampleReasons[i] || '';
        }
        this.operators = items;
    }

    // Миграция: удалить старые демо-строки, попавшие в localStorage при предыдущих версиях
    _migrateDemoRows() {
        if (!Array.isArray(this.data) || !this.data.length) return;
        const before = this.data.length;
        this.data = this.data.filter(row => {
            // демо-признаки: фиксированные августовские даты, пустой комментарий/вложения и аватар из каталога операторов
            const isDemoDates = row.dateFrom === '2025-08-20' && row.dateTo === '2025-08-27';
            const fromCatalog = typeof row.avatar === 'string' && row.avatar.indexOf('assets/Операторы с Ф.И.О/') === 0;
            const noMeta = (!row.attachments || row.attachments.length === 0) && (!row.comment || row.comment === '');
            return !(isDemoDates && fromCatalog && noMeta);
        });
        if (this.data.length !== before) {
            localStorage.setItem('work-transfer-data', JSON.stringify(this.data));
        }
    }

    renderList(filter = '') {
        const wrapper = document.getElementById('list-wrapper');
        if (!wrapper) return;
        // Вставляем шапку внутри скролла (7 колонок: оператор | дата | комментарий | файл | дата фиксации | кем зафиксирован | статус)
        const sort = this.sort || (this.sort = (JSON.parse(localStorage.getItem('work-transfer-sort')||'null')||{ key: '', dir: 'asc' }));
        wrapper.innerHTML = `
            <div class="list-header list-grid" role="rowheader" aria-hidden="true">
                <div class="col-operator sortable" data-sort="operator" aria-sort="${sort.key==='operator'?sort.dir:'none'}">Оператор <span class="material-icons sort-icon">${sort.key==='operator' ? (sort.dir==='asc'?'arrow_upward':'arrow_downward') : 'swap_vert'}</span></div>
                <div class="col-date">Дата</div>
                <div class="col-comment">Комментарий:</div>
                <div class="col-attach sortable" data-sort="attach" aria-sort="${sort.key==='attach'?sort.dir:'none'}"><span class="material-icons" style="font-size:16px;color:#6b7788;">attach_file</span> Прикреплённый файл <span class="material-icons sort-icon">${sort.key==='attach' ? (sort.dir==='asc'?'arrow_upward':'arrow_downward') : 'swap_vert'}</span></div>
                <div class="col-fixdate sortable" data-sort="fixdate" aria-sort="${sort.key==='fixdate'?sort.dir:'none'}">Дата фиксации <span class="material-icons sort-icon">${sort.key==='fixdate' ? (sort.dir==='asc'?'arrow_upward':'arrow_downward') : 'swap_vert'}</span></div>
                <div class="col-fixedby sortable" data-sort="fixedby" aria-sort="${sort.key==='fixedby'?sort.dir:'none'}">Кем зафиксирован <span class="material-icons sort-icon">${sort.key==='fixedby' ? (sort.dir==='asc'?'arrow_upward':'arrow_downward') : 'swap_vert'}</span></div>
                <div class="col-status sortable" data-sort="status" aria-sort="${sort.key==='status'?sort.dir:'none'}">Статус <span class="material-icons sort-icon">${sort.key==='status' ? (sort.dir==='asc'?'arrow_upward':'arrow_downward') : 'swap_vert'}</span></div>
            </div>
        `;
        let data = this.data.filter(d => d.fullName.toLowerCase().includes((filter||'').toLowerCase()));
        const cmpStr = (a,b) => String(a||'').localeCompare(String(b||''), 'ru', { sensitivity: 'base' });
        const cmpNum = (a,b) => (Number(a||0) - Number(b||0));
        const dir = (sort.dir === 'desc') ? -1 : 1;
        if (sort.key === 'operator') {
            data.sort((a,b) => dir * cmpStr(a.fullName, b.fullName));
        } else if (sort.key === 'attach') {
            const hasAtt = (x) => (Array.isArray(x.attachments) && x.attachments.length>0) || (x.attachment && x.attachment.name);
            data.sort((a,b) => dir * ((hasAtt(a)?1:0) - (hasAtt(b)?1:0)));
        } else if (sort.key === 'fixedby') {
            data.sort((a,b) => dir * cmpStr(a.fixedBy, b.fixedBy));
        } else if (sort.key === 'fixdate') {
            data.sort((a,b) => dir * cmpNum(a.fixedAt, b.fixedAt));
        } else if (sort.key === 'status') {
            data.sort((a,b) => dir * cmpStr(a.status || 'Ожидание', b.status || 'Ожидание'));
        } else {
            // По умолчанию — новые сверху
            data.sort((a,b) => (b.createdAt||0) - (a.createdAt||0));
        }
        // Навесим обработчики сортировки
        const headerEl = wrapper.querySelector('.list-header');
        headerEl.querySelectorAll('.sortable').forEach(el => {
            el.addEventListener('click', () => {
                const key = el.getAttribute('data-sort');
                if (!key) return;
                if (!this.sort) this.sort = { key: '', dir: 'asc' };
                if (this.sort.key === key) {
                    this.sort.dir = (this.sort.dir === 'asc') ? 'desc' : 'asc';
                } else {
                    this.sort.key = key;
                    this.sort.dir = 'asc';
                }
                localStorage.setItem('work-transfer-sort', JSON.stringify(this.sort));
                this.renderList(filter);
            });
        });
        // Нет данных — оставляем список пустым (только шапка)
        if (!data.length) {
            return;
        }
        data.forEach(item => {
            const row = document.createElement('div');
            row.className = 'list-row list-grid';
            row.dataset.id = item.id;
            const atts = (Array.isArray(item.attachments) && item.attachments.length)
                ? item.attachments.slice(0, 2)
                : ((item.attachment && item.attachment.name) ? [item.attachment] : []);
            const attachHTML = atts.map(att => {
                const name = String(att.name || '');
                const dot = name.lastIndexOf('.');
                const base = dot > 0 ? name.slice(0, dot) : name;
                const ext = dot > 0 ? name.slice(dot + 1) : '';
                const baseMax = 16;
                const shortBase = base.length > baseMax ? (base.slice(0, baseMax).trim() + '…') : base;
                const shown = ext ? `${shortBase}.${ext}` : shortBase;
                return `
                <span class="att-item">
                    <span class="material-icons" style="vertical-align:middle;color:#6b7788;">image</span>
                    <a href="${att.url || '#'}" title="${name}">${shown}</a>
                </span>`;
            }).join('');
            const fixedAtStr = this.formatDateTime(item.fixedAt);
            const fixedByStr = item.fixedBy || '—';
        row.innerHTML = `
                <div class="cell-operator">
            <img src="${item.avatar || 'assets/Аватар/placeholder.png'}" alt="avatar" onerror="this.onerror=null;this.src='assets/Аватар/placeholder.png'"/>
                    <div class="name">${item.fullName}</div>
                </div>
                <div class="cell-date">
                    <span class="material-icons">calendar_today</span>
                    ${this.formatDate(item.dateFrom)}
                    <span class="material-icons" style="color:#cbd7e6">arrow_forward</span>
                    <span class="material-icons">calendar_today</span>
                    ${this.formatDate(item.dateTo)}
                </div>
                <div class="cell-comment">${item.comment}</div>
                <div class="cell-attachment">${attachHTML}</div>
                <div class="cell-fixedat">${fixedAtStr}</div>
                <div class="cell-fixedby">${fixedByStr}</div>
                <div class="cell-status">
                    <button class="edit-btn" data-id="${item.id}"><span class="material-icons" style="color:#0b6fc0;">edit</span></button>
                    <span class="material-icons status" title="Ожидание" style="color:#ffc107;">schedule</span>
                </div>
            `;
            wrapper.appendChild(row);
        });

        // привязка обработчиков редактирования
        wrapper.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.openEdit(id);
            });
        });
    }

    formatDate(isoOrText) {
        try {
            const d = this.parseDateAny(isoOrText);
            if (!d) return '—';
            return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) { return String(isoOrText || '—'); }
    }

    // Формат: 18.08.2025, 08:10
    formatDateTime(value) {
        try {
            let d = null;
            if (typeof value === 'number') d = new Date(value);
            else if (value) d = this.parseDateAny(value);
            if (!d || isNaN(d.getTime())) return '—';
            const pad = (n) => String(n).padStart(2, '0');
            return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch { return '—'; }
    }

    openEdit(id) {
        this.editingId = id;
        const item = this.data.find(d => d.id === id);
        if (!item) return;
        // заполняем поля
        document.getElementById('global-search').value = item.fullName;
        this.selectedOperatorId = item.operatorId || null;
        // Показать аватар и причину в режиме редактирования
        const avatarBox = document.querySelector('.user-avatar');
        const avatarImg = avatarBox?.querySelector('img');
        if (avatarBox && avatarImg) {
            const placeholder = avatarBox.getAttribute('data-placeholder') || 'assets/Аватар/placeholder.png';
            avatarImg.onerror = () => { avatarImg.src = placeholder; avatarImg.onerror = null; };
            avatarImg.src = item.avatar || placeholder;
            avatarBox.classList.remove('hidden');
        }
        const reasonText = document.querySelector('.reason-text');
        if (reasonText) {
            const op = this.operators.find(o => o.operatorId === (item.operatorId || this.selectedOperatorId));
            const txt = (item.reason) || (op && op.reason) || '';
            reasonText.textContent = txt;
            if (txt) reasonText.classList.remove('hidden');
            else reasonText.classList.add('hidden');
        }
        document.getElementById('date-from').value = this.formatDate(item.dateFrom);
        document.getElementById('date-to').value = this.formatDate(item.dateTo);
        document.getElementById('global-comment').value = item.comment;
        this.showNotification('Открыт режим редактирования записи ' + id, 'info');
        // Инициализируем staging из записи (поддержка старого поля attachment)
        this.pendingAttachments = [];
        if (item.attachments && Array.isArray(item.attachments)) {
            this.pendingAttachments = item.attachments.slice(0, 2).map(a => ({ name: a.name || '' }));
        } else if (item.attachment && item.attachment.name) {
            this.pendingAttachments = [{ name: item.attachment.name }];
        }
        this.renderAttachmentsPreview();
    }

    handleGlobalSave() {
        const comment = document.getElementById('global-comment').value;
        const dateFrom = (document.getElementById('date-from')?.value || '').trim();
        const dateTo = (document.getElementById('date-to')?.value || '').trim();
        // Требуем выбор обеих дат перед сохранением
        if (!dateFrom || !dateTo) {
            this.showNotification('Выберите обе даты перед сохранением', 'warning');
            return;
        }
        // Преобразуем ввод в ISO-формат для стабильного хранения
        const dFromObj = this.parseDateAny(dateFrom);
        const dToObj = this.parseDateAny(dateTo);
        if (!dFromObj || !dToObj) {
            this.showNotification('Неверный формат даты', 'warning');
            return;
        }
    const isoFrom = this.toISODate(dFromObj);
    const isoTo = this.toISODate(dToObj);
    // Определяем пользователя из шапки и время фиксации
    const headerUser = document.querySelector('.header-user');
    const fixedBy = headerUser?.querySelector('span')?.textContent?.trim() || '';
    const fixedAt = Date.now();
        if (this.editingId) {
            const item = this.data.find(d => d.id === this.editingId);
            if (item) {
                item.comment = comment;
                // Перезаписываем даты в ISO
                item.dateFrom = isoFrom;
                item.dateTo = isoTo;
                // Применим staged-вложения (до 2 шт.)
                item.attachments = (this.pendingAttachments || []).slice(0, 2).map(p => ({ name: p.name, url: '#' }));
                // Для обратной совместимости оставим первое во "вложении"
                const first = item.attachments[0];
                item.attachment = first ? { name: first.name, url: first.url } : { name: '', url: '#' };
        // Обновим фиксацию
        item.fixedAt = fixedAt;
        item.fixedBy = fixedBy;
                // Очистим staging
                this.pendingAttachments = [];
                localStorage.setItem('work-transfer-data', JSON.stringify(this.data));
                this.renderList();
                this.showNotification('Изменения сохранены', 'success');
                this.renderAttachmentsPreview();
                // Сброс поля выбора оператора в дефолт
                this.editingId = null;
                this.selectedOperatorId = null;
                const searchInp1 = document.getElementById('global-search');
                if (searchInp1) searchInp1.value = '';
                const sugg1 = document.getElementById('global-search-suggestions');
                if (sugg1) { sugg1.classList.add('hidden'); sugg1.innerHTML = ''; }
                // Сброс аватарки и причины
                const avatarBox1 = document.querySelector('.user-avatar');
                const avatarImg1 = avatarBox1?.querySelector('img');
                if (avatarBox1 && avatarImg1) {
                    const useCreative = (avatarBox1.getAttribute('data-use-creative') || '').toLowerCase() === 'true';
                    const ph = useCreative
                        ? (avatarBox1.getAttribute('data-placeholder-creative') || 'assets/Аватар/placeholder-creative.svg')
                        : (avatarBox1.getAttribute('data-placeholder') || 'assets/Аватар/placeholder.png');
                    avatarImg1.src = ph;
                }
                const reasonText1 = document.querySelector('.reason-text');
                if (reasonText1) { reasonText1.textContent = ''; reasonText1.classList.add('hidden'); }
                // Очистим даты и комментарий
                const df1 = document.getElementById('date-from');
                const dt1 = document.getElementById('date-to');
                if (df1) df1.value = '';
                if (dt1) dt1.value = '';
                const cm1 = document.getElementById('global-comment');
                if (cm1) cm1.value = '';
                this._closeCalendars();
            }
        } else {
            // создание новой записи (упрощённо)
            if (!this.selectedOperatorId) {
                this.showNotification('Выберите оператора перед сохранением', 'warning');
                return;
            }
            const newId = String(Date.now());
            const attachments = (this.pendingAttachments || []).slice(0, 2).map(p => ({ name: p.name, url: '#' }));
            const attachment = attachments[0] || { name: '', url: '#' };
            const op = this.operators.find(o => o.operatorId === this.selectedOperatorId);
            const fullName = op ? op.fullName : (document.getElementById('global-search').value || ('Новый сотрудник ('+newId+')'));
            const avatar = (op && op.avatar) ? op.avatar : 'assets/Аватар/placeholder.png';
            const newItem = {
                id: newId,
                operatorId: this.selectedOperatorId,
                avatar,
                fullName,
                reason: (op && op.reason) || '',
                dateFrom: isoFrom,
                dateTo: isoTo,
                comment: comment || '',
                attachment,
                attachments,
                createdAt: Date.now(),
                fixedAt,
                fixedBy
            };
            this.data.unshift(newItem);
            localStorage.setItem('work-transfer-data', JSON.stringify(this.data));
            this.renderList();
            this.showNotification('Сохранено', 'success');
            // Очистим временное вложение и UI подписи
            this.pendingAttachments = [];
            const fi = document.getElementById('file-input');
            if (fi) fi.value = '';
            this.renderAttachmentsPreview();
            // Сбросим выбор оператора — новое сохранение потребует явного выбора снова
            this.selectedOperatorId = null;
            const avatarBox = document.querySelector('.user-avatar');
            const avatarImg = avatarBox?.querySelector('img');
            if (avatarBox && avatarImg) {
                const useCreative = (avatarBox.getAttribute('data-use-creative') || '').toLowerCase() === 'true';
                const ph = useCreative
                    ? (avatarBox.getAttribute('data-placeholder-creative') || 'assets/Аватар/placeholder-creative.svg')
                    : (avatarBox.getAttribute('data-placeholder') || 'assets/Аватар/placeholder.png');
                avatarImg.src = ph;
            }
            // На всякий случай синхронизируем через helper
            this.syncAvatarPlaceholderImage();
            const reasonText = document.querySelector('.reason-text');
            if (reasonText) {
                reasonText.textContent = '';
                reasonText.classList.add('hidden');
            }
            // Очистим поле поиска и закроем подсказки
            const searchInp2 = document.getElementById('global-search');
            if (searchInp2) searchInp2.value = '';
            const sugg2 = document.getElementById('global-search-suggestions');
            if (sugg2) { sugg2.classList.add('hidden'); sugg2.innerHTML = ''; }
            // Очистим даты и комментарий
            const df2 = document.getElementById('date-from');
            const dt2 = document.getElementById('date-to');
            if (df2) df2.value = '';
            if (dt2) dt2.value = '';
            const cm2 = document.getElementById('global-comment');
            if (cm2) cm2.value = '';
            this._closeCalendars();
        }
    }

    handleFileAttach(e) {
        const files = Array.from((e.target.files || []));
        if (!files.length) return;
        // Текущий список (до 2)
        if (!Array.isArray(this.pendingAttachments)) this.pendingAttachments = [];
        let added = 0;
        for (const f of files) {
            if (this.pendingAttachments.length >= 2) break;
            if (!/^image\//i.test(f.type)) {
                this.showNotification('Можно прикреплять только изображения (JPG, PNG и т.п.)', 'warning');
                continue;
            }
            this.pendingAttachments.push({ name: f.name });
            added++;
        }
        if (!added && files.length) {
            // если ничего не добавили (например, всё не image), просто сбросим инпут
            e.target.value = '';
            return;
        }
        if (this.pendingAttachments.length >= 2 && files.length - added > 0) {
            this.showNotification('Добавлено максимум 2 файла', 'info');
        }
        this.renderAttachmentsPreview();
        // Сбросим value, чтобы одно и то же имя можно было выбрать снова при необходимости
        e.target.value = '';
    }

    renderAttachmentsPreview() {
        const preview = document.getElementById('attachments-preview');
        if (!preview) return;
        const list = Array.isArray(this.pendingAttachments) ? this.pendingAttachments : [];
        if (!list.length) { preview.innerHTML = ''; return; }
        preview.innerHTML = list.map((p, idx) => `
            <div class="attachment-chip" data-idx="${idx}">
                <span class="material-icons" aria-hidden="true">attach_file</span>
                <span class="name" title="${p.name}">${p.name}</span>
                <button type="button" class="remove" data-remove-attachment data-idx="${idx}" title="Удалить">
                    <span class="material-icons" style="font-size:16px;">close</span>
                </button>
            </div>
        `).join('');
    }
    
    minimizeWindow(windowId) {
        // Минимизируем окно
        const windowElement = document.querySelector(`[data-window-id="${windowId}"]`);
        if (windowElement) {
            const content = windowElement.querySelector('.work-transfer-window-content');
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            
            const btn = windowElement.querySelector('.work-transfer-window-btn');
            const icon = btn.querySelector('.material-icons');
            icon.textContent = content.style.display === 'none' ? 'expand_more' : 'minimize';
        }
    }
    
    closeWindow(windowId) {
        // Закрываем окно
        if (this.isEditMode) {
            // В режиме редактирования удаляем окно
            this.windows = this.windows.filter(w => w.id !== windowId);
            const windowElement = document.querySelector(`[data-window-id="${windowId}"]`);
            if (windowElement) {
                windowElement.remove();
            }
            console.log('WorkTransferManager: Окно удалено', windowId);
        } else {
            // В обычном режиме просто скрываем
            const windowElement = document.querySelector(`[data-window-id="${windowId}"]`);
            if (windowElement) {
                windowElement.style.display = 'none';
            }
        }
    }
    
    showNotification(message, type = 'info') {
        // Показываем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'warning' ? '#fff3cd' : '#cce7ff'};
            color: ${type === 'success' ? '#155724' : type === 'warning' ? '#856404' : '#004085'};
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Автоудаление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    _openCalendar(popoverEl, anchorInput) {
        // Close any open calendars first
        this._closeCalendars();
        // Ensure parent is positioned
        const anchorWrap = anchorInput.closest('.calendar-anchor');
        if (anchorWrap) anchorWrap.classList.add('calendar-anchor');
        // Show and position
        if (popoverEl && typeof CalendarPopover !== 'undefined') {
            if (!popoverEl._instance) {
                // Fallback instance that writes the selected date back to the input
                popoverEl._instance = new CalendarPopover(popoverEl, {
                    onSelect: (date, text) => { anchorInput.value = text; this._closeCalendars(); }
                });
            }
            popoverEl._instance.showAt(anchorInput);
        }
    }

    _closeCalendars() {
        document.querySelectorAll('.calendar-popover').forEach(el => el.classList.add('calendar-hidden'));
    }
}

// Инициализация менеджера переноса рабочего дня
let workTransferManager;

document.addEventListener('DOMContentLoaded', function() {
    workTransferManager = new WorkTransferManager();
    workTransferManager.loadConfiguration();
});

// Добавляем стили для анимации уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

class CalendarPopover {
    constructor(container, options = {}) {
        this.el = container;
        this.onSelect = options.onSelect || (() => {});
        const today = new Date(); today.setHours(0,0,0,0);
        this.selectedDate = new Date(today);
        this.viewYear = today.getFullYear();
        this.viewMonth = today.getMonth(); // 0-11
        this.render();
    }
    fmtTitle(year, monthIdx) {
        const months = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
        return `${months[monthIdx]} ${year}`;
    }
    fmtValue(d) {
        const months = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
    buildGrid(y, m) {
    const first = new Date(y, m, 1);
    const startDay = (first.getDay() + 6) % 7; // make Monday=0
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevMonthDays = new Date(y, m, 0).getDate();
    const cells = [];
    // leading from prev month
    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, muted: true, date: new Date(y, m - 1, prevMonthDays - i) });
    }
    // current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, muted: false, date: new Date(y, m, d) });
    }
    // trailing next month to fill grid (up to 6 rows)
    while (cells.length % 7 !== 0) {
      const nextIdx = cells.length - (startDay + daysInMonth);
      const nextDay = nextIdx + 1;
      cells.push({ day: nextDay, muted: true, date: new Date(y, m + 1, nextDay) });
    }
    return cells;
  }
    render() {
    if (!this.el) return;
    const y = this.viewYear, m = this.viewMonth;
    const weekdays = ['П','В','С','Ч','П','С','В'];
    const cells = this.buildGrid(y, m);
    const today = new Date(); today.setHours(0,0,0,0);
    this.el.innerHTML = `
      <div class="calendar-header">
        <div class="calendar-nav" data-nav="prev">&#8592;</div>
                <div class="calendar-title">${this.selectedDate.getDate()} ${this.fmtTitle(y,m)}</div>
        <div class="calendar-nav" data-nav="next">&#8594;</div>
      </div>
      <div class="calendar-weekdays">${weekdays.map(w=>`<div>${w}</div>`).join('')}</div>
      <div class="calendar-grid">
        ${cells.map(c => {
          const d = new Date(c.date); d.setHours(0,0,0,0);
          const isToday = d.getTime() === today.getTime();
                    const isSelected = d.getTime() === this.selectedDate.getTime();
                    return `<div class="calendar-day${c.muted?' muted':''}${isToday?' today':''}${isSelected?' selected':''}" data-date="${d.toISOString()}">${c.day}</div>`
        }).join('')}
      </div>
    `;
    this.bind();
  }
  bind() {
        // Ensure clicks inside the popover don't bubble to the document and trigger outside-close
        if (!this._containerBound) {
            this._containerBound = true;
            this.el.addEventListener('mousedown', (e) => e.stopPropagation());
            this.el.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
            this.el.addEventListener('click', (e) => e.stopPropagation());
        }

        const prevBtn = this.el.querySelector('[data-nav="prev"]');
        const nextBtn = this.el.querySelector('[data-nav="next"]');
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear--; } else this.viewMonth--;
                this.render();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear++; } else this.viewMonth++;
                this.render();
            });
        }
        this.el.querySelectorAll('.calendar-day').forEach(n => n.addEventListener('click', (e) => {
            e.stopPropagation();
            const iso = n.getAttribute('data-date');
            const d = new Date(iso);
            this.selectedDate = new Date(d);
            this.onSelect(d, this.fmtValue(d));
            // Обновляем разметку, чтобы подсветка выбранной даты сохранилась для следующего открытия
            this.render();
            this.hide();
        }));
  }
  showAt(anchorEl) {
    if (!this.el) return;
        // При открытии синхронизируем отображаемый месяц с ранее выбранной датой
        if (this.selectedDate) {
            this.viewYear = this.selectedDate.getFullYear();
            this.viewMonth = this.selectedDate.getMonth();
            this.render();
        }
    this.el.classList.remove('calendar-hidden');
    // position under the date-picker and center horizontally
    const picker = anchorEl.closest('.date-picker') || anchorEl;
    const topPx = (picker.offsetTop || 0) + picker.offsetHeight + 2;
    this.el.style.top = topPx + 'px';
    this.el.style.left = '50%';
    this.el.style.transform = 'translateX(-50%)';
  }
  hide() { if (this.el) this.el.classList.add('calendar-hidden'); }
}
