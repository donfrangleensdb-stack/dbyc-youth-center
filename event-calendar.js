/* ==========================================================================
   DBYC Event Calendar + Upcoming Events + DBYC Minutes + News Module
   ========================================================================== */

// ── EVENT CALENDAR ──────────────────────────────────────────────────────────
const EventCalendar = {
  _events: [],
  _viewDate: new Date(),

  _load() { this._events = JSON.parse(localStorage.getItem('dbyc_cal_events') || '[]'); },
  _save() { localStorage.setItem('dbyc_cal_events', JSON.stringify(this._events)); },

  render(container) {
    this._load();
    const d = this._viewDate;
    const year = d.getFullYear(), month = d.getMonth();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const eventsThisMonth = this._events.filter(e => {
      const ed = new Date(e.date);
      return ed.getFullYear() === year && ed.getMonth() === month;
    });

    const eventsOnDay = (day) => this._events.filter(e => {
      const ed = new Date(e.date);
      return ed.getFullYear() === year && ed.getMonth() === month && ed.getDate() === day;
    });

    let calCells = '';
    for (let i = 0; i < firstDay; i++) calCells += `<div style="padding:8px;"></div>`;
    for (let d2 = 1; d2 <= daysInMonth; d2++) {
      const isToday = today.getDate() === d2 && today.getMonth() === month && today.getFullYear() === year;
      const dayEvts = eventsOnDay(d2);
      const hasMeeting = dayEvts.some(e => e.type === 'meeting');
      const hasEvent   = dayEvts.some(e => e.type === 'event');
      const hasHoliday = dayEvts.some(e => e.type === 'holiday');
      const dotColor   = hasHoliday ? '#DC2626' : hasEvent ? '#003F8A' : hasMeeting ? '#D97706' : 'transparent';
      calCells += `
        <div onclick="EventCalendar.showDay(${year},${month},${d2})" style="padding:6px 4px;text-align:center;border-radius:8px;cursor:pointer;background:${isToday ? '#003F8A' : '#F8FAFC'};border:1.5px solid ${isToday ? '#003F8A' : '#E2E8F0'};min-height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;transition:all 0.15s;">
          <div style="font-size:13px;font-weight:${isToday ? 800 : 600};color:${isToday ? '#fff' : '#0E1B35'};">${d2}</div>
          ${dotColor !== 'transparent' ? `<div style="width:6px;height:6px;border-radius:50%;background:${dotColor};"></div>` : ''}
        </div>`;
    }

    container.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">📅 Event Calendar</div><div class="page-subtitle">நிகழ்வு நாட்காட்டி • DBYC Schedule</div></div>
        <button class="btn btn-primary btn-sm" onclick="EventCalendar.addEvent()">+ Add Event</button>
      </div>

      <!-- Calendar Card -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="EventCalendar.prevMonth()">‹</button>
          <div class="card-title">${monthNames[month]} ${year}</div>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="EventCalendar.nextMonth()">›</button>
        </div>
        <div class="card-body" style="padding:12px;">
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:6px;">
            ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<div style="text-align:center;font-size:11px;font-weight:700;color:#94A3B8;padding:4px;">${d}</div>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;" id="cal-grid">
            ${calCells}
          </div>
          <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:5px;font-size:11px;"><div style="width:10px;height:10px;border-radius:50%;background:#003F8A;"></div>Event</div>
            <div style="display:flex;align-items:center;gap:5px;font-size:11px;"><div style="width:10px;height:10px;border-radius:50%;background:#D97706;"></div>Meeting</div>
            <div style="display:flex;align-items:center;gap:5px;font-size:11px;"><div style="width:10px;height:10px;border-radius:50%;background:#DC2626;"></div>Holiday</div>
          </div>
        </div>
      </div>

      <!-- Events this month list -->
      <div class="card">
        <div class="card-header"><div class="card-title">📋 Events in ${monthNames[month]}</div><span class="badge badge-primary">${eventsThisMonth.length}</span></div>
        <div class="card-body" style="padding:12px;">
          ${eventsThisMonth.length ? eventsThisMonth.sort((a,b) => new Date(a.date)-new Date(b.date)).map(e => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:#F8FAFC;border:1px solid #E2E8F0;border-left:4px solid ${e.type==='holiday'?'#DC2626':e.type==='meeting'?'#D97706':'#003F8A'};border-radius:8px;margin-bottom:8px;">
              <div style="font-size:1.3rem;">${e.type==='holiday'?'🎌':e.type==='meeting'?'📋':'🎉'}</div>
              <div style="flex:1;">
                <div style="font-weight:700;font-size:13px;">${Utils.escapeHtml(e.title)}</div>
                <div style="font-size:11px;color:#64748B;">${new Date(e.date).toDateString()} ${e.time ? '• ' + e.time : ''}</div>
                ${e.venue ? `<div style="font-size:11px;color:#94A3B8;">📍 ${Utils.escapeHtml(e.venue)}</div>` : ''}
              </div>
              <button class="btn btn-ghost btn-sm btn-icon" onclick="EventCalendar.deleteEvent('${e.id}')">🗑️</button>
            </div>`).join('') : '<div style="text-align:center;padding:20px;color:#94A3B8;font-size:13px;">No events this month. Click + Add Event.</div>'}
        </div>
      </div>`;
  },

  prevMonth() { this._viewDate = new Date(this._viewDate.getFullYear(), this._viewDate.getMonth()-1, 1); Router.navigate('event-calendar'); },
  nextMonth() { this._viewDate = new Date(this._viewDate.getFullYear(), this._viewDate.getMonth()+1, 1); Router.navigate('event-calendar'); },

  showDay(y, m, d) {
    this._load();
    const dayEvts = this._events.filter(e => {
      const ed = new Date(e.date);
      return ed.getFullYear()===y && ed.getMonth()===m && ed.getDate()===d;
    });
    const dateStr = new Date(y, m, d).toDateString();
    UI.openModal('cal-day-modal', `
      <div class="modal-header"><span class="modal-title">📅 ${dateStr}</span><button class="modal-close" onclick="UI.closeModal()">✕</button></div>
      <div class="modal-body">
        ${dayEvts.length ? dayEvts.map(e => `<div style="padding:10px;background:#F8FAFC;border-radius:8px;margin-bottom:8px;border-left:4px solid ${e.type==='holiday'?'#DC2626':e.type==='meeting'?'#D97706':'#003F8A'};">
          <div style="font-weight:700;">${Utils.escapeHtml(e.title)}</div>
          <div style="font-size:12px;color:#64748B;">${e.type} ${e.time?'• '+e.time:''} ${e.venue?'• '+e.venue:''}</div>
          ${e.desc?`<div style="font-size:12px;color:#475569;margin-top:4px;">${Utils.escapeHtml(e.desc)}</div>`:''}
        </div>`).join('') : '<div style="text-align:center;color:#94A3B8;padding:20px;">No events on this day.</div>'}
      </div>
      <div class="modal-footer"><button class="btn btn-primary" onclick="EventCalendar.addEvent('${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}');UI.closeModal()">+ Add Event Here</button><button class="btn btn-ghost btn-sm" onclick="UI.closeModal()">Close</button></div>`);
  },

  addEvent(prefillDate='') {
    UI.openModal('add-event-modal', `
      <div class="modal-header"><span class="modal-title">+ Add Event</span><button class="modal-close" onclick="UI.closeModal()">✕</button></div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group"><label class="form-label">Event Title <span class="required">*</span></label><input class="form-control" id="ev-title" placeholder="e.g. Annual Day, Camp Meeting..."></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Date <span class="required">*</span></label><input class="form-control" id="ev-date" type="date" value="${prefillDate}"></div>
          <div class="form-group"><label class="form-label">Time</label><input class="form-control" id="ev-time" type="time"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Type</label>
            <select class="form-control" id="ev-type">
              <option value="event">🎉 Event</option>
              <option value="meeting">📋 Meeting</option>
              <option value="holiday">🎌 Holiday</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Venue</label><input class="form-control" id="ev-venue" placeholder="Hall, Church, Field..."></div>
        </div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-control" id="ev-desc" rows="2" placeholder="Event details..."></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="EventCalendar.saveEvent()">💾 Save Event</button>
      </div>`);
  },

  saveEvent() {
    const title = document.getElementById('ev-title')?.value.trim();
    const date  = document.getElementById('ev-date')?.value;
    if (!title || !date) { UI.toast('error','Error','Title and Date are required'); return; }
    this._load();
    this._events.push({ id: Date.now().toString(), title, date, time: document.getElementById('ev-time')?.value, type: document.getElementById('ev-type')?.value || 'event', venue: document.getElementById('ev-venue')?.value.trim(), desc: document.getElementById('ev-desc')?.value.trim() });
    this._save();
    UI.closeModal();
    UI.toast('success','Event Added!', `"${title}" added to calendar.`);
    Router.navigate('event-calendar');
  },

  deleteEvent(id) {
    this._load();
    this._events = this._events.filter(e => e.id !== id);
    this._save();
    UI.toast('success','Deleted','Event removed from calendar.');
    Router.navigate('event-calendar');
  }
};

// ── UPCOMING EVENTS ──────────────────────────────────────────────────────────
const UpcomingEvents = {
  render(container) {
    const all = JSON.parse(localStorage.getItem('dbyc_cal_events') || '[]');
    const now = new Date();
    now.setHours(0,0,0,0);
    const upcoming = all.filter(e => new Date(e.date) >= now).sort((a,b) => new Date(a.date)-new Date(b.date));
    const past = all.filter(e => new Date(e.date) < now).sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,5);

    const typeIcon = t => t==='holiday'?'🎌':t==='meeting'?'📋':'🎉';
    const typeColor = t => t==='holiday'?'#DC2626':t==='meeting'?'#D97706':'#003F8A';
    const daysLeft = d => { const diff = Math.ceil((new Date(d)-now)/86400000); return diff===0?'Today!':diff===1?'Tomorrow':`In ${diff} days`; };

    const eventCard = (e) => `
      <div style="display:flex;gap:14px;padding:14px;background:#fff;border:1.5px solid #E2E8F0;border-radius:12px;margin-bottom:10px;box-shadow:0 1px 4px rgba(14,27,53,0.05);">
        <div style="width:52px;text-align:center;flex-shrink:0;">
          <div style="font-size:22px;">${typeIcon(e.type)}</div>
          <div style="font-size:9px;font-weight:800;color:${typeColor(e.type)};text-transform:uppercase;letter-spacing:0.5px;">${e.type}</div>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:800;font-size:14px;color:#0E1B35;">${Utils.escapeHtml(e.title)}</div>
          <div style="font-size:12px;color:#475569;margin-top:2px;">📅 ${new Date(e.date).toDateString()} ${e.time?'• ⏰ '+e.time:''}</div>
          ${e.venue?`<div style="font-size:12px;color:#64748B;">📍 ${Utils.escapeHtml(e.venue)}</div>`:''}
          ${e.desc?`<div style="font-size:11px;color:#94A3B8;margin-top:4px;">${Utils.escapeHtml(e.desc)}</div>`:''}
        </div>
        <div style="flex-shrink:0;text-align:right;">
          <div style="background:${typeColor(e.type)};color:#fff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:20px;white-space:nowrap;">${daysLeft(e.date)}</div>
        </div>
      </div>`;

    container.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">🗓️ Upcoming Events</div><div class="page-subtitle">வரவிருக்கும் நிகழ்வுகள் • What's coming up</div></div>
        <button class="btn btn-primary btn-sm" onclick="EventCalendar.addEvent();Router.navigate('upcoming-events')">+ Add</button>
      </div>

      <div class="grid-4" style="gap:10px;margin-bottom:16px;">
        <div class="stat-card"><div class="stat-icon" style="background:#DBEAFE;">🗓️</div><div class="stat-body"><div class="stat-label">Total Upcoming</div><div class="stat-value">${upcoming.length}</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#FEF3C7;">📋</div><div class="stat-body"><div class="stat-label">Meetings</div><div class="stat-value">${upcoming.filter(e=>e.type==='meeting').length}</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#DCFCE7;">🎉</div><div class="stat-body"><div class="stat-label">Events</div><div class="stat-value">${upcoming.filter(e=>e.type==='event').length}</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#FEE2E2;">🎌</div><div class="stat-body"><div class="stat-label">Holidays</div><div class="stat-value">${upcoming.filter(e=>e.type==='holiday').length}</div></div></div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><div class="card-title">⚡ Upcoming Events</div></div>
        <div class="card-body" style="padding:12px;">
          ${upcoming.length ? upcoming.map(eventCard).join('') : '<div style="text-align:center;padding:30px;color:#94A3B8;">No upcoming events. <a href="#" onclick="EventCalendar.addEvent()" style="color:#003F8A;">Add one now!</a></div>'}
        </div>
      </div>

      ${past.length ? `<div class="card"><div class="card-header"><div class="card-title">📁 Recent Past Events</div></div><div class="card-body" style="padding:12px;opacity:0.65;">${past.map(eventCard).join('')}</div></div>` : ''}`;
  }
};
