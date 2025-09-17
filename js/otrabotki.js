// Кастомный dropdown для группы
    const groupDropdown = document.getElementById('otrabotki-group-dropdown-root');
    const groupDropdownSelected = document.getElementById('otrabotki-group-dropdown-selected');
    const groupDropdownList = document.getElementById('otrabotki-group-dropdown-list');
    const groupDropdownItems = groupDropdownList ? groupDropdownList.querySelectorAll('.otrabotki-group-dropdown-item') : [];
    const groupSelect = document.querySelector('select.otrabotki-group-select');
    let groupActiveIdx = 0;
    function closeGroupDropdown() {
        groupDropdown.classList.remove('open');
    }
    function openGroupDropdown() {
        groupDropdown.classList.add('open');
        // Активировать выбранный
        groupDropdownItems.forEach((item, idx) => {
            item.classList.toggle('active', idx === groupActiveIdx);
        });
    }
    if (groupDropdown && groupDropdownSelected && groupDropdownList && groupSelect) {
        // Открытие/закрытие по клику
        groupDropdownSelected.addEventListener('click', function(e) {
            e.stopPropagation();
            if (groupDropdown.classList.contains('open')) {
                closeGroupDropdown();
            } else {
                openGroupDropdown();
            }
        });
        // Выбор пункта
        groupDropdownItems.forEach((item, idx) => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                groupDropdownSelected.textContent = item.textContent;
                groupActiveIdx = idx;
                // Синхронизировать с select
                groupSelect.selectedIndex = idx;
                // Добавить выделение бордера
                groupDropdownSelected.classList.add('selected');
                closeGroupDropdown();
            });
        });
        // Клик вне — закрыть
        document.addEventListener('click', function(e) {
            if (!groupDropdown.contains(e.target)) {
                closeGroupDropdown();
            }
        });
        // Навигация по стрелкам
        groupDropdownSelected.addEventListener('keydown', function(e) {
            if (!groupDropdown.classList.contains('open')) return;
            if (e.key === 'ArrowDown') {
                groupActiveIdx = (groupActiveIdx + 1) % groupDropdownItems.length;
                openGroupDropdown();
                e.preventDefault();
            } else if (e.key === 'ArrowUp') {
                groupActiveIdx = (groupActiveIdx - 1 + groupDropdownItems.length) % groupDropdownItems.length;
                openGroupDropdown();
                e.preventDefault();
            } else if (e.key === 'Enter') {
                groupDropdownItems[groupActiveIdx].click();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                closeGroupDropdown();
                e.preventDefault();
            }
        });
        // Дать tabindex для фокуса
        groupDropdownSelected.tabIndex = 0;
    }

// Каталог операторов (импортируем из переноса рабочего дня)
const otrabotkiOperators = [
    { fullName: "Abdug'aniyev Abdulaziz Abdug'ofur o'g'li (358)", avatar: "assets/Операторы с Ф.И.О/Abdug'aniyev Abdulaziz Abdug'ofur o'g'li (358).png", hours: 4.5 },
    { fullName: "Abduxalilov Abdulaziz Abduvali o'g'li (0308)", avatar: "assets/Операторы с Ф.И.О/Abduxalilov Abdulaziz Abduvali o'g'li (0308).png", hours: 7.2 },
    { fullName: "Adilova Arofat Faxriddin qizi (0211)", avatar: "assets/Операторы с Ф.И.О/Adilova Arofat Faxriddin qizi (0211).jpg", hours: 2.0 },
    { fullName: "Ahmadova Xilola Mahmud qizi (0256)", avatar: "assets/Операторы с Ф.И.О/Ahmadova Xilola Mahmud qizi (0256).jpg", hours: 5.0 },
    { fullName: "Alimov Shaxzod Ilxomovich (0544)", avatar: "assets/Операторы с Ф.И.О/Alimov Shaxzod Ilxomovich (0544).png", hours: 3.5 },
    { fullName: "Ayniddinov Tursunboy Dilshod o'g'li (0372)", avatar: "assets/Операторы с Ф.И.О/Ayniddinov Tursunboy Dilshod o'g'li (0372).jpg", hours: 6.1 },
    { fullName: "Banyazov Kudratilla Irgashovich (0281)", avatar: "assets/Операторы с Ф.И.О/Banyazov Kudratilla Irgashovich (0281).png", hours: 0.2 },
    { fullName: "Baxtiyorov Sirojiddin Furqat o'g'li (269)", avatar: "assets/Операторы с Ф.И.О/Baxtiyorov Sirojiddin Furqat o'g'li (269).jpg", hours: 2.7 },
    { fullName: "Bekmuxamedov Abdumavlon Abduvoxid o'g'li (0365)", avatar: "assets/Операторы с Ф.И.О/Bekmuxamedov Abdumavlon Abduvoxid o'g'ли (0365).png", hours: 8.0 },
    { fullName: "Fozilxonov Zoirxon Davron o'g'ли (0147)", avatar: "assets/Операторы с Ф.И.О/Fozilxonov Zoirxon Davron o'g'ли (0147).png", hours: 3.0 },
    { fullName: "Riskiyev Bonur Boxodir o'g'ли (0485)", avatar: "assets/Операторы с Ф.И.О/Riskiyev Bonur Boxodir o'g'ли (0485).jpg", hours: 28 },
    { fullName: "Ruziyeva Xusnora Sodiqjon qizi (247)", avatar: "assets/Операторы с Ф.И.О/Ruziyeva Xusnora Sodiqjon qizi (247).png", hours: 2.2 },
    { fullName: "Sobirov Abduxakim Qobil o'g'ли (0116)", avatar: "assets/Операторы с Ф.И.О/Sobirov Abduxakim Qobil o'g'ли (0116).png", hours: 4.0 }
];

// Экспортируем массив операторов в глобальную область видимости
window.otrabotkiOperators = otrabotkiOperators;



let selectedOperatorIndex = null;
let onlySelectedOperator = false;
let selectedOperatorObj = null;

// Централизованный выбор оператора: выделяем в списке, обновляем правую панель и состояние
function selectOperatorByIndex(idx, opts = {}) {
    const { fromSearch = false } = opts;
    const list = document.querySelector('.otrabotki-operators-list');
    if (typeof idx !== 'number' || !window.otrabotkiOperators || idx < 0 || idx >= window.otrabotkiOperators.length) return;

    selectedOperatorIndex = idx;
    selectedOperatorObj = window.otrabotkiOperators[idx];

    // Режим отображения: при выборе из поиска можно показать только выбранного
    onlySelectedOperator = !!fromSearch;

    if (fromSearch) {
        // Из поиска: перерисуем список, сохраним фильтр и оставим только выбранного при необходимости
        const currentFilter = document.querySelector('.otrabotki-operator-search')?.value || "";
        renderOtrabotkiOperatorsList(currentFilter);
    } else {
        // Из списка: не перерисовываем, чтобы выделение не «мигало» и не пропадало
        if (list) {
            list.querySelectorAll('.otrabotki-operator-item').forEach(op => op.classList.remove('selected'));
            const selectedEl = list.querySelector(`.otrabotki-operator-item[data-idx="${idx}"]`);
            if (selectedEl) {
                selectedEl.classList.add('selected');
                selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }

    // Обновить правую панель (если подключён менеджер деталей)
    try { if (window.updateOperatorDetails) window.updateOperatorDetails(idx); } catch (e) {}
    try { if (window.showOperatorDetails) window.showOperatorDetails(); } catch (e) {}

    // Скрыть заглушку на правой панели, если она используется
    const rightPanel = document.querySelector('.training-layout__right');
    if (rightPanel) rightPanel.classList.remove('empty');
}

function renderOtrabotkiOperatorsList(filter = "") {
    const list = document.querySelector('.otrabotki-operators-list');
    if (!list) return;
    let items = otrabotkiOperators.slice();
    let q = (filter || "").toLowerCase();
    if (onlySelectedOperator && selectedOperatorObj) {
        items = [selectedOperatorObj];
    } else if (q) {
        items = otrabotkiOperators.filter(op => op.fullName.toLowerCase().includes(q));
    }
    // Сортировка по убыванию часов
    items.sort((a, b) => (b.hours || 0) - (a.hours || 0));
    
    // Сохраняем текущий выбранный элемент
    const currentSelectedIdx = selectedOperatorIndex;
    
    list.innerHTML = items.map((op, idx) => {
        const opIdx = otrabotkiOperators.findIndex(o => o.fullName === op.fullName);
        const isSelected = selectedOperatorObj && op.fullName === selectedOperatorObj.fullName;
        
        return `
        <div class="otrabotki-operator-item${isSelected ? ' selected' : ''}" data-idx="${opIdx}">
            <img class="otrabotki-operator-avatar" src="${op.avatar}" alt="" loading="lazy" onerror="this.onerror=null;this.src='assets/Аватар/Иконка профиля пользователя.png'">
            <div class="otrabotki-operator-info">
                <div class="otrabotki-operator-name">${op.fullName}</div>
            </div>
            <div class="otrabotki-operator-hours">${op.hours != null ? op.hours + ' ч.' : ''}</div>
        </div>
        `;
    }).join("");
    // Навесим обработчик выбора
    list.querySelectorAll('.otrabotki-operator-item').forEach(item => {
        item.addEventListener('click', function() {
            const idx = Number(this.getAttribute('data-idx'));
            selectOperatorByIndex(idx, { fromSearch: false });
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    renderOtrabotkiOperatorsList();
    const search = document.querySelector('.otrabotki-operator-search');
    const dropdown = document.getElementById('otrabotki-operators-dropdown-root');
    let dropdownActiveIdx = -1;

    // --- Следим за изменениями сайдбара и layout, чтобы dropdown всегда был под полем поиска ---
    function observeSidebarAndLayout() {
        // .sidebar, .sidebar-figma, .training-layout
        const sidebar = document.querySelector('.sidebar') || document.querySelector('.sidebar-figma');
        const layout = document.querySelector('.training-layout');
        if (sidebar) {
            let rafId = null;
            const startLoop = () => {
                if (rafId) return;
                const t0 = performance.now();
                const step = (t) => {
                    if (!dropdown.classList.contains('active')) { rafId = null; return; }
                    if (t - t0 < 800) {
                        positionDropdown();
                        rafId = requestAnimationFrame(step);
                    } else {
                        rafId = null;
                    }
                };
                rafId = requestAnimationFrame(step);
            };
            const stopLoop = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } positionDropdown(); };
            sidebar.addEventListener('transitionrun', startLoop, { passive: true });
            sidebar.addEventListener('transitionstart', startLoop, { passive: true });
            sidebar.addEventListener('animationstart', startLoop, { passive: true });
            sidebar.addEventListener('transitionend', stopLoop, { passive: true });
            sidebar.addEventListener('animationend', stopLoop, { passive: true });
            const sbObserver = new MutationObserver(positionDropdown);
            sbObserver.observe(sidebar, { attributes: true, attributeFilter: ['class','style'] });
        }
        if (layout) {
            const lyObserver = new MutationObserver(positionDropdown);
            lyObserver.observe(layout, { attributes: true, attributeFilter: ['class','style'] });
        }
        // Наблюдаем изменение классов body (например, .sidebar-open)
        const bodyObserver = new MutationObserver(positionDropdown);
        bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    observeSidebarAndLayout();

    function positionDropdown() {
        if (!search || !dropdown) return;
        const rect = search.getBoundingClientRect();
        const winWidth = window.innerWidth;
        let left = rect.left;
        let width = rect.width;
        // Регулируемый отступ между полем поиска и dropdown
        const dropdownOffset = 2; // px — измените это значение для нужного отступа
        // Если dropdown не помещается справа — прижать к правому краю окна
        if (left + width > winWidth - 8) {
            left = Math.max(8, winWidth - width - 8);
        }
        dropdown.style.position = 'fixed';
        dropdown.style.left = left + 'px';
        dropdown.style.top = (rect.bottom + dropdownOffset) + 'px';
        dropdown.style.minWidth = width + 'px';
        dropdown.style.maxWidth = Math.min(width, winWidth - 10) + 'px';
    }

    function renderDropdown(filter = "", forceShowAll = false) {
        if (!dropdown) return;
        const q = (filter || "").toLowerCase();
        let filtered = otrabotkiOperators.filter(op => op.fullName.toLowerCase().includes(q));
        if ((q === "" && !forceShowAll) || filtered.length === 0) {
            dropdown.classList.remove('active');
            dropdown.innerHTML = "";
            return;
        }
        if (forceShowAll && q === "") {
            filtered = otrabotkiOperators;
        }
        dropdown.innerHTML = filtered.map((op, idx) => `
            <div class="otrabotki-operators-dropdown-item${dropdownActiveIdx === idx ? ' active' : ''}" data-idx="${idx}">
                <span>${op.fullName}</span>
            </div>
        `).join("");
        dropdown.classList.add('active');
        positionDropdown();
        // Навесить обработчик выбора
        dropdown.querySelectorAll('.otrabotki-operators-dropdown-item').forEach((item, idx) => {
            item.addEventListener('click', function(e) {
                const name = (filtered[idx] && filtered[idx].fullName) || null;
                const opIdx = name ? otrabotkiOperators.findIndex(op => op.fullName === name) : -1;
                if (opIdx !== -1) {
                    // Unify behavior with list click
                    selectOperatorByIndex(opIdx, { fromSearch: true });
                    if (typeof search !== 'undefined' && search) {
                        search.value = otrabotkiOperators[opIdx].fullName;
                        if (typeof updateClearBtnVisibility === 'function') updateClearBtnVisibility();
                    }
                }
                dropdown.classList.remove('active');
                dropdown.innerHTML = '';
            });
        });
    }

    if (search) {
        search.addEventListener('input', function(e) {
            if (!e.target.value) {
                onlySelectedOperator = false;
                selectedOperatorObj = null;
            }
            renderOtrabotkiOperatorsList(e.target.value);
            renderDropdown(e.target.value);
            dropdownActiveIdx = -1;
        });
        // Кнопка удаления выбранного оператора
        let clearBtn = document.querySelector('.otrabotki-operator-search-clear');
        if (!clearBtn) {
            clearBtn = document.createElement('span');
            clearBtn.className = 'otrabotki-operator-search-clear material-icons';
            clearBtn.textContent = 'close';
            clearBtn.title = 'Удалить выбранного оператора';
            clearBtn.style.cssText = 'position:absolute;right:10px;top:49%;transform:translateY(-50%);cursor:pointer;color:#bfc9d9;font-size:20px;display:none;z-index:2;';
            const wrap = document.querySelector('.otrabotki-operator-search-wrap');
            if (wrap) wrap.appendChild(clearBtn);
        }
        function updateClearBtnVisibility() {
            if (search.value && search.value.trim().length > 0) {
                clearBtn.style.display = 'block';
            } else {
                clearBtn.style.display = 'none';
            }
        }
        search.addEventListener('input', function(e) {
            if (!e.target.value) {
                onlySelectedOperator = false;
                selectedOperatorObj = null;
            }
            updateClearBtnVisibility();
        });
        // Показывать кнопку при любом фокусе, если есть текст
        search.addEventListener('focus', function(e) {
            updateClearBtnVisibility();
        });
        clearBtn.addEventListener('mousedown', function(e) {
            e.preventDefault();
            search.value = '';
            onlySelectedOperator = false;
            selectedOperatorObj = null;
            renderOtrabotkiOperatorsList();
            renderDropdown();
            clearBtn.style.display = 'none';
        });
        updateClearBtnVisibility();
        search.addEventListener('focus', function(e) {
            renderDropdown(e.target.value, true);
        });
        search.addEventListener('blur', function(e) {
            setTimeout(() => {
                dropdown.classList.remove('active');
                dropdown.innerHTML = "";
            }, 120);
        });
        search.addEventListener('keydown', function(e) {
            const q = search.value.toLowerCase();
            const filtered = otrabotkiOperators.filter(op => op.fullName.toLowerCase().includes(q));
            if (!dropdown.classList.contains('active') || filtered.length === 0) return;
            if (e.key === 'ArrowDown') {
                dropdownActiveIdx = Math.min(filtered.length - 1, dropdownActiveIdx + 1);
                renderDropdown(search.value);
                e.preventDefault();
            } else if (e.key === 'ArrowUp') {
                dropdownActiveIdx = Math.max(0, dropdownActiveIdx - 1);
                renderDropdown(search.value);
                e.preventDefault();
            } else if (e.key === 'Enter') {
                if (dropdownActiveIdx >= 0 && dropdownActiveIdx < filtered.length) {
                    const name = filtered[dropdownActiveIdx].fullName;
                    const opIdx = otrabotkiOperators.findIndex(op => op.fullName === name);
                    if (opIdx !== -1) {
                        selectOperatorByIndex(opIdx, { fromSearch: true });
                        search.value = name;
                        if (typeof updateClearBtnVisibility === 'function') updateClearBtnVisibility();
                    }
                    dropdown.classList.remove('active');
                    dropdown.innerHTML = '';
                }
            }
        });
        window.addEventListener('resize', positionDropdown);
        window.addEventListener('scroll', positionDropdown, true);
    }
});
