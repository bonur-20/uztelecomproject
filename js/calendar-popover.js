// CalendarPopover — универсальный popover-календарь (выделено из work-transfer-manager.js)
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
        for (let i = startDay - 1; i >= 0; i--) {
            cells.push({ day: prevMonthDays - i, muted: true, date: new Date(y, m - 1, prevMonthDays - i) });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ day: d, muted: false, date: new Date(y, m, d) });
        }
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
            this.render();
            this.hide();
        }));
    }
    showAt(anchorEl) {
        if (!this.el) return;
        if (this.selectedDate) {
            this.viewYear = this.selectedDate.getFullYear();
            this.viewMonth = this.selectedDate.getMonth();
            this.render();
        }
        this.el.classList.remove('calendar-hidden');
        const picker = anchorEl.closest('.date-picker') || anchorEl;
        const topPx = (picker.offsetTop || 0) + picker.offsetHeight + 2;
        this.el.style.top = topPx + 'px';
        this.el.style.left = '50%';
        this.el.style.transform = 'translateX(-50%)';
    }
    hide() { if (this.el) this.el.classList.add('calendar-hidden'); }
}