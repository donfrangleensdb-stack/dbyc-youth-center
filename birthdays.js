/* ==========================================================================
   DBYC Birthdays Module — Birthday Celebrations of Members
   ========================================================================== */
const BirthdaysModule = {
  render(container) {
    const members = JSON.parse(localStorage.getItem('dbyc_members') || '[]');
    const today = new Date();
    const todayMD = `${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const thisMonth = today.getMonth() + 1;
    const nextMonth = thisMonth === 12 ? 1 : thisMonth + 1;

    const getBirthMonthDay = (dob) => {
      if (!dob) return null;
      const parts = dob.split('-');
      if (parts.length < 3) return null;
      return { mm: parseInt(parts[1]), dd: parseInt(parts[2]), md: `${parts[1]}-${parts[2]}` };
    };

    const today_bday  = members.filter(m => { const b = getBirthMonthDay(m.dob); return b && b.md === todayMD; });
    const month_bday  = members.filter(m => { const b = getBirthMonthDay(m.dob); return b && b.mm === thisMonth && b.md !== todayMD; });
    const next_bday   = members.filter(m => { const b = getBirthMonthDay(m.dob); return b && b.mm === nextMonth; });

    const monthNames = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

    const cardHtml = (m, highlight) => {
      const b = getBirthMonthDay(m.dob);
      const age = m.dob ? today.getFullYear() - parseInt(m.dob.split('-')[0]) : '?';
      const initials = (m.name || 'M').split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
      return `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:${highlight ? 'linear-gradient(135deg,#FFF9C4,#FFF3B0)' : '#fff'};border:1.5px solid ${highlight ? '#FFB800' : '#E2E8F0'};border-radius:12px;margin-bottom:8px;">
          <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#003F8A,#1565C0);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0;border:2px solid ${highlight ? '#FFB800' : '#DDE3F0'};">${initials}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:14px;color:#0E1B35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${Utils.escapeHtml(m.name || 'Unknown')}</div>
            <div style="font-size:11px;color:#64748B;">${m.group || ''} ${m.group && m.team ? '•' : ''} ${m.team || ''}</div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:20px;">${highlight ? '🎂' : '🎁'}</div>
            <div style="font-size:11px;font-weight:700;color:${highlight ? '#D97706' : '#475569'};">${b ? monthNames[b.mm] + ' ' + b.dd : 'N/A'}</div>
            ${highlight ? `<div style="font-size:10px;color:#059669;font-weight:700;">Turning ${age}!</div>` : ''}
          </div>
        </div>`;
    };

    const noneMsg = (msg) => `<div style="text-align:center;padding:24px;color:#94A3B8;font-size:13px;">${msg}</div>`;

    container.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">🎂 Birthday Celebrations</div>
        <div class="page-subtitle">பிறந்தநாள் கொண்டாட்டங்கள் • ${monthNames[thisMonth]} ${today.getFullYear()}</div></div>
        <button class="btn btn-primary btn-sm" onclick="BirthdaysModule.addBirthdayWish()">🎉 Send Wish</button>
      </div>

      <!-- Today's Birthdays -->
      <div class="card" style="margin-bottom:16px;border:2px solid #FFB800;">
        <div class="card-header" style="background:linear-gradient(135deg,#FFB800,#F59E0B);color:#1A1000;">
          <div class="card-title" style="color:#1A1000;">🌟 Today's Birthdays (இன்றைய பிறந்தநாள்)</div>
          <span class="badge" style="background:#fff;color:#D97706;font-weight:800;">${today_bday.length}</span>
        </div>
        <div class="card-body" style="padding:12px;">
          ${today_bday.length ? today_bday.map(m => cardHtml(m, true)).join('') : noneMsg('No birthdays today 🎈')}
        </div>
      </div>

      <!-- This Month -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <div class="card-title">📅 This Month — ${monthNames[thisMonth]}</div>
          <span class="badge badge-primary">${month_bday.length}</span>
        </div>
        <div class="card-body" style="padding:12px;">
          ${month_bday.length ? month_bday.map(m => cardHtml(m, false)).join('') : noneMsg('No more birthdays this month')}
        </div>
      </div>

      <!-- Next Month -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <div class="card-title">🗓️ Next Month — ${monthNames[nextMonth]}</div>
          <span class="badge badge-accent">${next_bday.length}</span>
        </div>
        <div class="card-body" style="padding:12px;">
          ${next_bday.length ? next_bday.map(m => cardHtml(m, false)).join('') : noneMsg('No birthdays next month')}
        </div>
      </div>

      <!-- Stats -->
      <div class="grid-4" style="gap:12px;">
        <div class="stat-card"><div class="stat-icon" style="background:#FEF3C7;">🎂</div><div class="stat-body"><div class="stat-label">Today</div><div class="stat-value">${today_bday.length}</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#DBEAFE;">📅</div><div class="stat-body"><div class="stat-label">This Month</div><div class="stat-value">${month_bday.length + today_bday.length}</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#D1FAE5;">🗓️</div><div class="stat-body"><div class="stat-label">Next Month</div><div class="stat-value">${next_bday.length}</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#F3E8FF;">👥</div><div class="stat-body"><div class="stat-label">Total Members</div><div class="stat-value">${members.length}</div></div></div>
      </div>`;
  },

  addBirthdayWish() {
    UI.openModal('bday-wish-modal', `
      <div class="modal-header"><span class="modal-title">🎉 Send Birthday Wish</span><button class="modal-close" onclick="UI.closeModal()">✕</button></div>
      <div class="modal-body">
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label">Member Name</label>
          <input class="form-control" id="wish-name" placeholder="Enter member name...">
        </div>
        <div class="form-group">
          <label class="form-label">Wish Message</label>
          <textarea class="form-control" id="wish-msg" rows="3">🎂 Happy Birthday! Wishing you a blessed and joyful day filled with God's love. — DBYC Family</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="BirthdaysModule.sendWish()">🎉 Send Wish</button>
      </div>`);
  },

  sendWish() {
    const name = document.getElementById('wish-name')?.value.trim();
    if (!name) { UI.toast('error','Error','Please enter a member name'); return; }
    UI.closeModal();
    UI.toast('success','Wish Sent!', `Birthday wish sent for ${name}! 🎂`);
  }
};
