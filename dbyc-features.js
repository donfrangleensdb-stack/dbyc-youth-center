/* ==========================================================================
   DBYC Minutes, News, Members Statistics & Team System Modules
   ========================================================================== */

// ── DBYC MINUTES ─────────────────────────────────────────────────────────────
const DBYCMinutes = {
  _load() { return JSON.parse(localStorage.getItem('dbyc_minutes') || '[]'); },
  _save(data) { localStorage.setItem('dbyc_minutes', JSON.stringify(data)); },

  render(container) {
    const minutes = this._load().sort((a,b) => new Date(b.date)-new Date(a.date));
    container.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">📋 DBYC Minutes</div><div class="page-subtitle">கூட்ட நடவடிக்கை குறிப்புகள் • Meeting Records</div></div>
        <button class="btn btn-primary btn-sm" onclick="DBYCMinutes.addMinutes()">+ New Minutes</button>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">📄 All Meeting Minutes</div><span class="badge badge-primary">${minutes.length}</span></div>
        <div class="card-body" style="padding:12px;">
          ${minutes.length ? minutes.map(m => `
            <div style="padding:14px;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:12px;margin-bottom:10px;border-left:4px solid #003F8A;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
                <div>
                  <div style="font-weight:800;font-size:14px;color:#0E1B35;">${Utils.escapeHtml(m.title)}</div>
                  <div style="font-size:12px;color:#64748B;margin-top:3px;">📅 ${new Date(m.date).toDateString()} • 📍 ${Utils.escapeHtml(m.venue||'DBYC Hall')} • 👤 ${Utils.escapeHtml(m.chair||'Fr. Director')}</div>
                </div>
                <div style="display:flex;gap:6px;">
                  <button class="btn btn-outline btn-sm" onclick="DBYCMinutes.viewMinutes('${m.id}')">👁️ View</button>
                  <button class="btn btn-ghost btn-sm btn-icon" onclick="DBYCMinutes.deleteMinutes('${m.id}')">🗑️</button>
                </div>
              </div>
              ${m.agenda ? `<div style="margin-top:8px;font-size:12px;color:#475569;background:#fff;padding:8px;border-radius:6px;border:1px solid #E2E8F0;"><strong>Agenda:</strong> ${Utils.escapeHtml(m.agenda)}</div>` : ''}
              <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;">
                ${m.attendees ? `<span class="badge badge-primary">👥 ${m.attendees} attendees</span>` : ''}
                <span class="badge badge-success">✅ Recorded</span>
              </div>
            </div>`).join('') : `
            <div style="text-align:center;padding:40px;color:#94A3B8;">
              <div style="font-size:3rem;margin-bottom:12px;">📋</div>
              <div style="font-size:14px;font-weight:600;">No meeting minutes recorded yet.</div>
              <div style="font-size:12px;margin-top:4px;">Click "+ New Minutes" to add your first meeting record.</div>
            </div>`}
        </div>
      </div>`;
  },

  addMinutes() {
    UI.openModal('add-minutes-modal', `
      <div class="modal-header"><span class="modal-title">📋 New Meeting Minutes</span><button class="modal-close" onclick="UI.closeModal()">✕</button></div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group"><label class="form-label">Meeting Title <span class="required">*</span></label><input class="form-control" id="min-title" placeholder="e.g. Monthly Planning Meeting"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Date <span class="required">*</span></label><input class="form-control" id="min-date" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
          <div class="form-group"><label class="form-label">No. of Attendees</label><input class="form-control" id="min-attendees" type="number" min="1" placeholder="25"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Chairperson</label><input class="form-control" id="min-chair" placeholder="Fr. Director"></div>
          <div class="form-group"><label class="form-label">Venue</label><input class="form-control" id="min-venue" placeholder="DBYC Hall"></div>
        </div>
        <div class="form-group"><label class="form-label">Agenda</label><textarea class="form-control" id="min-agenda" rows="2" placeholder="Topics discussed..."></textarea></div>
        <div class="form-group"><label class="form-label">Minutes / Decisions <span class="required">*</span></label><textarea class="form-control" id="min-content" rows="5" placeholder="Record decisions, action items, discussions..."></textarea></div>
        <div class="form-group"><label class="form-label">Action Items</label><textarea class="form-control" id="min-actions" rows="2" placeholder="Who does what by when..."></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="DBYCMinutes.saveMinutes()">💾 Save Minutes</button>
      </div>`);
  },

  saveMinutes() {
    const title = document.getElementById('min-title')?.value.trim();
    const date  = document.getElementById('min-date')?.value;
    const content = document.getElementById('min-content')?.value.trim();
    if (!title || !date || !content) { UI.toast('error','Error','Title, Date and Minutes content are required'); return; }
    const mins = this._load();
    mins.push({ id: Date.now().toString(), title, date, chair: document.getElementById('min-chair')?.value.trim(), venue: document.getElementById('min-venue')?.value.trim(), attendees: document.getElementById('min-attendees')?.value, agenda: document.getElementById('min-agenda')?.value.trim(), content, actions: document.getElementById('min-actions')?.value.trim() });
    this._save(mins);
    UI.closeModal();
    UI.toast('success','Minutes Saved!','Meeting minutes recorded successfully.');
    Router.navigate('minutes');
  },

  viewMinutes(id) {
    const m = this._load().find(x => x.id === id);
    if (!m) return;
    UI.openModal('view-minutes-modal', `
      <div class="modal-header" style="background:linear-gradient(135deg,#003F8A,#1565C0);color:#fff;">
        <div><div class="modal-title" style="color:#fff;">📋 ${Utils.escapeHtml(m.title)}</div><div style="font-size:11px;color:rgba(255,255,255,0.8);">${new Date(m.date).toDateString()}</div></div>
        <button class="modal-close" style="color:#fff" onclick="UI.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
          ${[['📅 Date',new Date(m.date).toDateString()],['👤 Chair',m.chair||'—'],['📍 Venue',m.venue||'—'],['👥 Attendees',m.attendees||'—']].map(([k,v])=>`<div style="background:#F8FAFC;padding:8px;border-radius:8px;font-size:12px;"><div style="color:#94A3B8;font-size:10px;font-weight:700;text-transform:uppercase;">${k}</div><div style="color:#0E1B35;font-weight:600;">${v}</div></div>`).join('')}
        </div>
        ${m.agenda?`<div style="margin-bottom:10px;"><div style="font-weight:700;color:#003F8A;margin-bottom:4px;font-size:12px;">📌 AGENDA</div><div style="background:#F0F4FF;padding:10px;border-radius:8px;font-size:13px;">${Utils.escapeHtml(m.agenda)}</div></div>`:''}
        <div style="margin-bottom:10px;"><div style="font-weight:700;color:#003F8A;margin-bottom:4px;font-size:12px;">📄 MINUTES</div><div style="background:#F8FAFC;padding:12px;border-radius:8px;font-size:13px;line-height:1.6;white-space:pre-wrap;">${Utils.escapeHtml(m.content)}</div></div>
        ${m.actions?`<div><div style="font-weight:700;color:#D97706;margin-bottom:4px;font-size:12px;">⚡ ACTION ITEMS</div><div style="background:#FFFBEB;padding:10px;border-radius:8px;font-size:13px;white-space:pre-wrap;">${Utils.escapeHtml(m.actions)}</div></div>`:''}
      </div>
      <div class="modal-footer"><button class="btn btn-primary" onclick="window.print()">🖨️ Print</button><button class="btn btn-ghost btn-sm" onclick="UI.closeModal()">Close</button></div>`);
  },

  deleteMinutes(id) {
    if (!confirm('Delete this meeting minutes record?')) return;
    this._save(this._load().filter(x => x.id !== id));
    UI.toast('success','Deleted','Minutes record removed.');
    Router.navigate('minutes');
  }
};

// ── DBYC NEWS ─────────────────────────────────────────────────────────────────
const DBYCNews = {
  _load() { return JSON.parse(localStorage.getItem('dbyc_news') || '[]'); },
  _save(data) { localStorage.setItem('dbyc_news', JSON.stringify(data)); },

  render(container) {
    const news = this._load().sort((a,b) => new Date(b.date)-new Date(a.date));
    const catColor = c => c==='announcement'?'#003F8A':c==='achievement'?'#16A34A':c==='sports'?'#2563EB':c==='spiritual'?'#7C3AED':'#D97706';
    const catIcon  = c => c==='announcement'?'📢':c==='achievement'?'🏆':c==='sports'?'⚽':c==='spiritual'?'✝️':'📰';

    container.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">📰 DBYC News & Updates</div><div class="page-subtitle">செய்திகள் &amp; அறிவிப்புகள் • Latest from DBYC</div></div>
        <button class="btn btn-primary btn-sm" onclick="DBYCNews.addNews()">+ Post News</button>
      </div>

      <!-- Category filter chips -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
        ${['All','Announcement','Achievement','Sports','Spiritual','General'].map((c,i) => `<button class="btn btn-ghost btn-sm" style="border-radius:20px;font-size:12px;" onclick="DBYCNews.filterNews('${c.toLowerCase()}')">${c}</button>`).join('')}
      </div>

      <div id="news-list">
        ${news.length ? news.map(n => `
          <div style="background:#fff;border:1.5px solid #E2E8F0;border-radius:14px;margin-bottom:12px;overflow:hidden;box-shadow:0 2px 8px rgba(14,27,53,0.05);" data-cat="${n.category}">
            <div style="padding:4px 14px;background:${catColor(n.category)};color:#fff;font-size:11px;font-weight:800;letter-spacing:0.5px;display:flex;justify-content:space-between;">
              <span>${catIcon(n.category)} ${(n.category||'general').toUpperCase()}</span>
              <span>${new Date(n.date).toDateString()}</span>
            </div>
            <div style="padding:14px;">
              <div style="font-weight:800;font-size:15px;color:#0E1B35;line-height:1.3;margin-bottom:6px;">${Utils.escapeHtml(n.title)}</div>
              <div style="font-size:13px;color:#475569;line-height:1.6;">${Utils.escapeHtml(n.content)}</div>
              ${n.author?`<div style="margin-top:8px;font-size:11px;color:#94A3B8;">— ${Utils.escapeHtml(n.author)}</div>`:''}
            </div>
            <div style="padding:8px 14px;border-top:1px solid #F1F5F9;display:flex;justify-content:flex-end;gap:8px;">
              <button class="btn btn-ghost btn-sm btn-icon" onclick="DBYCNews.deleteNews('${n.id}')">🗑️</button>
            </div>
          </div>`).join('') : `
          <div style="text-align:center;padding:60px 20px;color:#94A3B8;">
            <div style="font-size:3rem;margin-bottom:12px;">📰</div>
            <div style="font-size:14px;font-weight:600;">No news posted yet.</div>
            <div style="font-size:12px;margin-top:4px;">Click "+ Post News" to share the latest DBYC updates!</div>
          </div>`}
      </div>`;
  },

  filterNews(cat) {
    document.querySelectorAll('#news-list > div[data-cat]').forEach(el => {
      el.style.display = (cat === 'all' || el.dataset.cat === cat) ? 'block' : 'none';
    });
  },

  addNews() {
    UI.openModal('add-news-modal', `
      <div class="modal-header"><span class="modal-title">📰 Post News / Update</span><button class="modal-close" onclick="UI.closeModal()">✕</button></div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group"><label class="form-label">Headline <span class="required">*</span></label><input class="form-control" id="news-title" placeholder="e.g. DBYC Wins Zonal Football Trophy"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Category</label>
            <select class="form-control" id="news-cat">
              <option value="announcement">📢 Announcement</option>
              <option value="achievement">🏆 Achievement</option>
              <option value="sports">⚽ Sports</option>
              <option value="spiritual">✝️ Spiritual</option>
              <option value="general">📰 General</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Date</label><input class="form-control" id="news-date" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
        </div>
        <div class="form-group"><label class="form-label">Content <span class="required">*</span></label><textarea class="form-control" id="news-content" rows="5" placeholder="Write the full news story here..."></textarea></div>
        <div class="form-group"><label class="form-label">Posted By</label><input class="form-control" id="news-author" placeholder="Fr. Director / DBYC Admin"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="DBYCNews.saveNews()">📰 Publish</button>
      </div>`);
  },

  saveNews() {
    const title   = document.getElementById('news-title')?.value.trim();
    const content = document.getElementById('news-content')?.value.trim();
    if (!title || !content) { UI.toast('error','Error','Headline and content are required'); return; }
    const news = this._load();
    news.push({ id: Date.now().toString(), title, content, category: document.getElementById('news-cat')?.value || 'general', date: document.getElementById('news-date')?.value || new Date().toISOString().split('T')[0], author: document.getElementById('news-author')?.value.trim() });
    this._save(news);
    UI.closeModal();
    UI.toast('success','Published!','News update posted successfully.');
    Router.navigate('news');
  },

  deleteNews(id) {
    if (!confirm('Delete this news post?')) return;
    this._save(this._load().filter(x => x.id !== id));
    UI.toast('success','Deleted','News post removed.');
    Router.navigate('news');
  }
};

// ── MEMBERS STATISTICS ───────────────────────────────────────────────────────
const MembersStatistics = {
  render(container) {
    const members = JSON.parse(localStorage.getItem('dbyc_members') || '[]');
    const total = members.length;

    // Group breakdown
    const byGroup = {};
    members.forEach(m => { const g = m.group||'Unknown'; byGroup[g] = (byGroup[g]||0)+1; });

    // Team breakdown
    const byTeam = {};
    members.forEach(m => { const t = m.team||'No Team'; byTeam[t] = (byTeam[t]||0)+1; });

    // Gender breakdown
    const male   = members.filter(m => (m.gender||'').toLowerCase()==='male').length;
    const female = members.filter(m => (m.gender||'').toLowerCase()==='female').length;

    // Age breakdown
    const now = new Date().getFullYear();
    const ageGroups = { 'Below 14': 0, '14-17': 0, '18-21': 0, '22-25': 0, '26+': 0 };
    members.forEach(m => {
      if (!m.dob) return;
      const age = now - parseInt(m.dob.split('-')[0]);
      if (age < 14)       ageGroups['Below 14']++;
      else if (age <= 17) ageGroups['14-17']++;
      else if (age <= 21) ageGroups['18-21']++;
      else if (age <= 25) ageGroups['22-25']++;
      else                ageGroups['26+']++;
    });

    // Attendance rate
    const attendance = JSON.parse(localStorage.getItem('dbyc_attendance') || '[]');
    const avgRate = total ? Math.round(attendance.reduce((s,a) => s + (a.present||0), 0) / Math.max(attendance.length,1)) : 0;

    const barColor = ['#003F8A','#1565C0','#D97706','#16A34A','#DC2626','#7C3AED','#0891B2'];
    const maxGroup = Math.max(...Object.values(byGroup), 1);
    const maxTeam  = Math.max(...Object.values(byTeam), 1);

    container.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">📉 Members Statistics</div><div class="page-subtitle">உறுப்பினர் புள்ளிவிவரங்கள் • Full Analytics</div></div>
      </div>

      <!-- Key Metrics -->
      <div class="grid-4" style="gap:10px;margin-bottom:16px;">
        <div class="stat-card"><div class="stat-icon" style="background:#DBEAFE;">👥</div><div class="stat-body"><div class="stat-label">Total Members</div><div class="stat-value">${total}</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#DCFCE7;">🧑</div><div class="stat-body"><div class="stat-label">Male</div><div class="stat-value">${male}</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#FDF2F8;">👩</div><div class="stat-body"><div class="stat-label">Female</div><div class="stat-value">${female}</div></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:#FEF3C7;">📊</div><div class="stat-body"><div class="stat-label">Avg Attendance</div><div class="stat-value">${avgRate}%</div></div></div>
      </div>

      <div class="grid-2" style="gap:14px;margin-bottom:16px;">
        <!-- Group Breakdown -->
        <div class="card">
          <div class="card-header"><div class="card-title">🏷️ By Group</div></div>
          <div class="card-body">
            ${Object.entries(byGroup).map(([g,c],i) => `
              <div style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#0E1B35;margin-bottom:4px;"><span>${g}</span><span>${c} (${Math.round(c/total*100)}%)</span></div>
                <div style="height:10px;background:#F1F5F9;border-radius:99px;overflow:hidden;"><div style="height:100%;width:${Math.round(c/maxGroup*100)}%;background:${barColor[i%barColor.length]};border-radius:99px;transition:width 0.5s ease;"></div></div>
              </div>`).join('')}
          </div>
        </div>

        <!-- Team Breakdown -->
        <div class="card">
          <div class="card-header"><div class="card-title">🏅 By Team</div></div>
          <div class="card-body">
            ${Object.entries(byTeam).map(([t,c],i) => `
              <div style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;color:#0E1B35;margin-bottom:4px;"><span>${t}</span><span>${c} (${Math.round(c/total*100)}%)</span></div>
                <div style="height:10px;background:#F1F5F9;border-radius:99px;overflow:hidden;"><div style="height:100%;width:${Math.round(c/maxTeam*100)}%;background:${barColor[(i+2)%barColor.length]};border-radius:99px;transition:width 0.5s ease;"></div></div>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- Age Distribution -->
      <div class="card">
        <div class="card-header"><div class="card-title">📊 Age Distribution</div></div>
        <div class="card-body">
          <div style="display:flex;align-items:flex-end;gap:12px;height:120px;padding:0 10px;">
            ${Object.entries(ageGroups).map(([label,count],i) => {
              const maxA = Math.max(...Object.values(ageGroups),1);
              const pct = Math.round(count/maxA*100);
              return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                <div style="font-size:11px;font-weight:700;color:#0E1B35;">${count}</div>
                <div style="width:100%;background:${barColor[i%barColor.length]};border-radius:6px 6px 0 0;height:${Math.max(pct,4)}%;min-height:4px;transition:height 0.5s;"></div>
                <div style="font-size:10px;color:#64748B;text-align:center;line-height:1.2;">${label}</div>
              </div>`;}).join('')}
          </div>
        </div>
      </div>`;
  }
};

// ── TEAM SYSTEM ───────────────────────────────────────────────────────────────
const TeamSystem = {
  TEAMS: [
    { id: 'red',    name: 'Red Team',    color: '#DC2626', bg: '#FEE2E2', emoji: '🔴' },
    { id: 'blue',   name: 'Blue Team',   color: '#2563EB', bg: '#DBEAFE', emoji: '🔵' },
    { id: 'green',  name: 'Green Team',  color: '#16A34A', bg: '#DCFCE7', emoji: '🟢' },
    { id: 'yellow', name: 'Yellow Team', color: '#CA8A04', bg: '#FEF9C3', emoji: '🟡' },
  ],

  render(container) {
    const members = JSON.parse(localStorage.getItem('dbyc_members') || '[]');
    const points  = JSON.parse(localStorage.getItem('dbyc_team_points') || '{}');

    const teamData = this.TEAMS.map(t => ({
      ...t,
      members: members.filter(m => (m.team||'').toLowerCase() === t.name.toLowerCase()),
      points:  points[t.id] || 0
    })).sort((a,b) => b.points - a.points);

    const totalPts = Object.values(points).reduce((s,v) => s+v, 0);
    const maxPts   = Math.max(...teamData.map(t => t.points), 1);

    container.innerHTML = `
      <div class="page-header">
        <div><div class="page-title">🏅 Team System</div><div class="page-subtitle">அணி அமைப்பு • Team Scores & Members</div></div>
        <button class="btn btn-primary btn-sm" onclick="TeamSystem.addPoints()">+ Add Points</button>
      </div>

      <!-- Scoreboard -->
      <div class="card" style="margin-bottom:16px;border:2px solid #003F8A;">
        <div class="card-header" style="background:linear-gradient(135deg,#002D63,#003F8A);color:#fff;">
          <div class="card-title" style="color:#fff;">🏆 Live Scoreboard (வாழ்க்கை மதிப்பெண் பலகை)</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.8);">Total Points: ${totalPts}</div>
        </div>
        <div class="card-body">
          ${teamData.map((t, idx) => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:${t.bg};border-radius:12px;margin-bottom:8px;border:1.5px solid ${t.color}20;">
              <div style="font-size:1.5rem;width:32px;text-align:center;">${idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':'4️⃣'}</div>
              <div style="font-size:1.5rem;">${t.emoji}</div>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:800;font-size:14px;color:${t.color};">${t.name}</div>
                <div style="height:8px;background:#fff;border-radius:99px;overflow:hidden;margin-top:4px;border:1px solid ${t.color}30;">
                  <div style="height:100%;width:${Math.round(t.points/maxPts*100)}%;background:${t.color};border-radius:99px;transition:width 0.6s ease;"></div>
                </div>
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <div style="font-size:22px;font-weight:900;color:${t.color};">${t.points}</div>
                <div style="font-size:10px;color:#64748B;font-weight:700;">${t.members.length} members</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Team Member Lists -->
      <div class="grid-2" style="gap:12px;">
        ${teamData.map(t => `
          <div class="card">
            <div class="card-header" style="background:${t.bg};border-bottom-color:${t.color}30;">
              <div class="card-title" style="color:${t.color};">${t.emoji} ${t.name}</div>
              <div style="display:flex;gap:6px;align-items:center;">
                <span class="badge" style="background:${t.color};color:#fff;font-weight:800;">${t.points} pts</span>
                <button class="btn btn-sm" style="background:${t.color};color:#fff;padding:4px 10px;font-size:11px;" onclick="TeamSystem.addPointsTo('${t.id}')">+</button>
              </div>
            </div>
            <div class="card-body" style="padding:10px;max-height:200px;overflow-y:auto;">
              ${t.members.length ? t.members.map(m => `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;margin-bottom:4px;background:#fff;border:1px solid ${t.color}20;">
                  <div style="width:30px;height:30px;border-radius:50%;background:${t.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">${(m.name||'M').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
                  <div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:700;color:#0E1B35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${Utils.escapeHtml(m.name||'')}</div><div style="font-size:10px;color:#94A3B8;">${m.group||''}</div></div>
                </div>`).join('') : `<div style="text-align:center;padding:12px;color:#94A3B8;font-size:12px;">No members assigned yet</div>`}
            </div>
          </div>`).join('')}
      </div>`;
  },

  addPoints() {
    UI.openModal('add-points-modal', `
      <div class="modal-header"><span class="modal-title">🏅 Add Team Points</span><button class="modal-close" onclick="UI.closeModal()">✕</button></div>
      <div class="modal-body" style="display:flex;flex-direction:column;gap:12px;">
        <div class="form-group"><label class="form-label">Select Team <span class="required">*</span></label>
          <select class="form-control" id="pts-team">
            ${TeamSystem.TEAMS.map(t => `<option value="${t.id}">${t.emoji} ${t.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Points to Add <span class="required">*</span></label><input class="form-control" id="pts-value" type="number" min="1" max="1000" value="10" placeholder="e.g. 10, 25, 50..."></div>
        <div class="form-group"><label class="form-label">Reason</label><input class="form-control" id="pts-reason" placeholder="e.g. Won football match, Best attendance..."></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost btn-sm" onclick="UI.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="TeamSystem.savePoints()">✅ Add Points</button>
      </div>`);
  },

  addPointsTo(teamId) {
    document.getElementById('pts-team') ? document.getElementById('pts-team').value = teamId : this.addPoints();
    const sel = document.getElementById('pts-team');
    if (sel) sel.value = teamId;
  },

  savePoints() {
    const teamId = document.getElementById('pts-team')?.value;
    const pts    = parseInt(document.getElementById('pts-value')?.value) || 0;
    const reason = document.getElementById('pts-reason')?.value.trim();
    if (!teamId || pts < 1) { UI.toast('error','Error','Select a team and enter valid points'); return; }
    const points = JSON.parse(localStorage.getItem('dbyc_team_points') || '{}');
    points[teamId] = (points[teamId] || 0) + pts;
    localStorage.setItem('dbyc_team_points', JSON.stringify(points));
    const team = TeamSystem.TEAMS.find(t => t.id === teamId);
    UI.closeModal();
    UI.toast('success','Points Added!', `${pts} points added to ${team?.name}${reason ? ' — ' + reason : ''}!`);
    Router.navigate('teams');
  }
};
