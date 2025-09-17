// Календарь для страницы отработки — полностью копия логики из work-transfer-manager.js (только для блока дат)
// Требует наличия CalendarPopover в проекте

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const inputFrom = document.getElementById('date-from');
        const inputTo = document.getElementById('date-to');
        if (inputFrom && !inputFrom.value) {
            try {
                inputFrom.setAttribute('placeholder', 'С опр. даты');
                inputFrom.classList.remove('date-selected');
                if (inputFrom.closest('.date-picker')) inputFrom.closest('.date-picker').classList.remove('date-selected');
            } catch {}
        }
        if (inputTo && !inputTo.value) {
            try {
                inputTo.setAttribute('placeholder', 'До опр. даты');
                inputTo.classList.remove('date-selected');
                if (inputTo.closest('.date-picker')) inputTo.closest('.date-picker').classList.remove('date-selected');
            } catch {}
        }
        const calFromEl = document.getElementById('calendar-from');
        const calToEl = document.getElementById('calendar-to');
        function closeCalendars() {
            if (calFromEl) calFromEl.classList.add('calendar-hidden');
            if (calToEl) calToEl.classList.add('calendar-hidden');
        }
        if (inputFrom && calFromEl && typeof CalendarPopover !== 'undefined') {
            calFromEl._instance = new CalendarPopover(calFromEl, {
                onSelect: (date, text) => {
                    inputFrom.value = text;
                    inputFrom.classList.add('date-selected');
                    if (inputFrom.closest('.date-picker')) inputFrom.closest('.date-picker').classList.add('date-selected');
                    closeCalendars();
                }
            });
            const openFrom = () => {
                closeCalendars();
                calFromEl._instance.showAt(inputFrom);
                // Специальное позиционирование для левого блока (отрabotki-left-panel)
                try {
                    const inLeftPanel = inputFrom.closest('.otrabotki-left-panel');
                    if (inLeftPanel) {
                        calFromEl.style.top = '34px';
                        calFromEl.style.left = '0%';
                        calFromEl.style.transform = 'translateX(-53%)';
                    }
                } catch {}
            };
            inputFrom.addEventListener('focus', openFrom);
            inputFrom.addEventListener('click', openFrom);
            const pickerFrom = inputFrom.closest('.date-picker');
            if (pickerFrom) pickerFrom.addEventListener('click', openFrom);
        }
        if (inputTo && calToEl && typeof CalendarPopover !== 'undefined') {
            calToEl._instance = new CalendarPopover(calToEl, {
                onSelect: (date, text) => {
                    inputTo.value = text;
                    inputTo.classList.add('date-selected');
                    if (inputTo.closest('.date-picker')) inputTo.closest('.date-picker').classList.add('date-selected');
                    closeCalendars();
                }
            });
            const openTo = () => {
                closeCalendars();
                calToEl._instance.showAt(inputTo);
                // Специальное позиционирование для левого блока (отрabotki-left-panel)
                try {
                    const inLeftPanel = inputTo.closest('.otrabotki-left-panel');
                    if (inLeftPanel) {
                        calToEl.style.top = '34px';
                        calToEl.style.left = '0%';
                        calToEl.style.transform = 'translateX(-55%)';
                    }
                } catch {}
            };
            inputTo.addEventListener('focus', openTo);
            inputTo.addEventListener('click', openTo);
            const pickerTo = inputTo.closest('.date-picker');
            if (pickerTo) pickerTo.addEventListener('click', openTo);
        }
        document.addEventListener('click', (e) => {
            const within = (calFromEl && calFromEl.contains(e.target)) || (calToEl && calToEl.contains(e.target)) ||
                (inputFrom && (e.target === inputFrom || (inputFrom.closest('.date-picker') && inputFrom.closest('.date-picker').contains(e.target)))) ||
                (inputTo && (e.target === inputTo || (inputTo.closest('.date-picker') && inputTo.closest('.date-picker').contains(e.target))));
            if (!within) closeCalendars();
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCalendars(); });

        // Очистка дат по кнопке
        const clearFromBtn = document.getElementById('date-from-clear');
        if (clearFromBtn && inputFrom) {
            clearFromBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                inputFrom.value = '';
                inputFrom.classList.remove('date-selected');
                if (inputFrom.closest('.date-picker')) inputFrom.closest('.date-picker').classList.remove('date-selected');
            });
        }
        const clearToBtn = document.getElementById('date-to-clear');
        if (clearToBtn && inputTo) {
            clearToBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                inputTo.value = '';
                inputTo.classList.remove('date-selected');
                if (inputTo.closest('.date-picker')) inputTo.closest('.date-picker').classList.remove('date-selected');
            });
        }
    });
})();
