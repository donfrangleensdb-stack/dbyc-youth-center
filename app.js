/* DBYC Main Application Bootstrapper & UI Controller */
const UI = {
  toast(type, title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `
      <div style="font-size:1.2rem">${icon}</div>
      <div class="toast-body">
        <div class="toast-title">${Utils.escapeHtml(title)}</div>
        <div class="toast-message">${Utils.escapeHtml(message)}</div>
      </div>
      <div style="cursor:pointer;color:var(--text-muted);font-size:12px" onclick="this.parentElement.remove()">✕</div>`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4500);
  },

  openModal(id, htmlContent) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    overlay.innerHTML = `<div class="modal" id="${id}">${htmlContent}</div>`;
    overlay.classList.add('open');
  },

  closeModal(id) {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.classList.remove('open');
  },

  togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btn) btn.innerHTML = '🙈';
    } else {
      input.type = 'password';
      if (btn) btn.innerHTML = '👁️';
    }
  },

  showLoading(msg = 'Loading...') {
    let el = document.getElementById('global-loader');
    if (!el) {
      el = document.createElement('div');
      el.id = 'global-loader';
      el.style.position = 'fixed';
      el.style.inset = '0';
      el.style.background = 'rgba(0,30,80,0.6)';
      el.style.zIndex = '10000';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = '#fff';
      el.innerHTML = `<div class="spinner-lg" style="border-top-color:var(--accent);margin-bottom:12px"></div><div id="global-loader-text" style="font-weight:600"></div>`;
      document.body.appendChild(el);
    }
    document.getElementById('global-loader-text').textContent = msg;
    el.style.display = 'flex';
  },

  hideLoading() {
    const el = document.getElementById('global-loader');
    if (el) el.style.display = 'none';
  },

  updateNav(currentRoute) {
    const u = Auth.getUser();
    const role = u?.role || 'member';

    // 1. Highlight active links
    document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(el => {
      if (el.getAttribute('data-route') === currentRoute) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // 2. Dynamic topbar title
    const titleMap = {
      dashboard: role === 'member' ? 'DBYC Member Portal • எனது தளம்' : 'DBYC Central Dashboard',
      members: 'Member Directory & Verification',
      attendance: 'QR Camera Terminal',
      qr: role === 'member' ? 'My Official DBYC Digital Pass (எனது அடையாள அட்டை)' : 'Digital Member Passes & ID Badges',
      certificates: 'Official Certificates Generator',
      reports: 'Championship & Reports',
      rules: 'Rules of the Oratory • மன்ற விதிமுறைகள்'
    };
    const titleEl = document.getElementById('topbar-page-title');
    if (titleEl) titleEl.textContent = titleMap[currentRoute] || 'DBYC Portal';

    // 3. Enforce Role-Based Visibility on Navigation Elements
    // Members link: Only Leaders and Directors
    document.querySelectorAll('[data-route="members"]').forEach(el => {
      el.style.display = Auth.canSeeAllMembers() ? '' : 'none';
    });
    // Attendance scan link: Incharges, Leaders, and Directors
    document.querySelectorAll('[data-route="attendance"]').forEach(el => {
      el.style.display = Auth.canTakeAttendance() ? '' : 'none';
    });
    // Certificates and Reports: Only Director and Assistant Director
    document.querySelectorAll('[data-route="certificates"], [data-route="reports"]').forEach(el => {
      el.style.display = Auth.canSeeCertificatesAndReports() ? '' : 'none';
    });
    // Sidebar section headers
    const certSection = document.getElementById('sidebar-cert-section');
    if (certSection) {
      certSection.style.display = Auth.canSeeCertificatesAndReports() ? '' : 'none';
    }

    // Update Pass Label for Member
    const qrLabels = document.querySelectorAll('[data-route="qr"] .nav-label, [data-route="qr"] span:not(.nav-icon)');
    qrLabels.forEach(el => {
      el.textContent = role === 'member' ? 'My Digital Pass' : 'Member Passes';
    });
  },

  updateUserInfo() {
    const u = Auth.getUser();
    if (!u) return;
    const nameEls = document.querySelectorAll('.user-display-name');
    nameEls.forEach(el => el.textContent = u.name || 'User');
    const roleEls = document.querySelectorAll('.user-display-role');
    roleEls.forEach(el => {
      const roleText = u.role === 'member' ? 'Youth Member' : (u.role || 'Member').replace('_', ' ');
      el.textContent = roleText;
    });
    const grpEls = document.querySelectorAll('.user-display-group');
    grpEls.forEach(el => el.textContent = u.group || 'All Groups');
    const avatarEls = document.querySelectorAll('.user-display-avatar');
    avatarEls.forEach(el => {
      el.innerHTML = u.picture ? `<img src="${u.picture}" alt="${u.name}">` : Utils.initials(u.name);
    });
  },

  openAuthorityProfileModal() {
    const u = Auth.getUser();
    if (!u) return;
    UI.openModal('auth-profile-modal', `
      <div class="modal-header">
        <span class="modal-title">⚙️ Authority Profile & Portal Settings</span>
        <button class="modal-close" onclick="UI.closeModal('auth-profile-modal')">✕</button>
      </div>
      <div class="modal-body">
        <div style="text-align:center;margin-bottom:var(--s-4)">
          <div style="position:relative;display:inline-block">
            <div id="auth-photo-container" style="width:88px;height:88px;border-radius:50%;border:3px solid var(--primary);overflow:hidden;margin:0 auto var(--s-2)">
              ${u.picture ? `<img src="${u.picture}" style="width:100%;height:100%;object-fit:cover">` : `<div class="member-avatar large">${Utils.initials(u.name)}</div>`}
            </div>
            <label style="position:absolute;bottom:0;right:0;background:var(--accent);color:#000;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;box-shadow:var(--shadow-sm)" title="Upload Photo">
              📷
              <input type="file" accept="image/*" style="display:none" onchange="UI.handleAuthorityPhotoSelect(event)">
            </label>
          </div>
          <div style="font-weight:700;font-size:var(--text-base)">${Utils.escapeHtml(u.name)}</div>
          <div>${Utils.roleBadge(u.role)} &bull; ${Utils.groupBadge(u.group)}</div>
        </div>

        <div style="display:flex;flex-direction:column;gap:var(--s-3)">
          <div class="form-group">
            <label class="form-label">Authority Official Name</label>
            <input type="text" id="ap-name" class="form-control" value="${Utils.escapeHtml(u.name)}">
          </div>
          <div class="form-group">
            <label class="form-label" style="font-weight:600">Update Authority Password (கடவுச்சொல் திருத்துதல்)</label>
            <div class="password-input-wrap" style="margin-bottom:var(--s-2)">
              <input type="password" id="ap-pwd" class="form-control" placeholder="New password (leave blank to keep current)">
              <button type="button" class="password-toggle-btn" onclick="UI.togglePasswordVisibility('ap-pwd', this)" title="Show/Hide">👁️</button>
            </div>
            <div class="password-input-wrap">
              <input type="password" id="ap-confirm-pwd" class="form-control" placeholder="Confirm new password">
              <button type="button" class="password-toggle-btn" onclick="UI.togglePasswordVisibility('ap-confirm-pwd', this)" title="Show/Hide">👁️</button>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Min 4 characters. Leave blank if you don't wish to change password.</div>
          </div>

          <!-- Spiritual Background Theme Chooser -->
          <div class="form-group" style="margin-top:var(--s-3);border-top:1px solid var(--border);padding-top:var(--s-3)">
            <label class="form-label" style="font-weight:700;color:var(--primary)">🎨 Don Bosco Spiritual Background Theme</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--s-2);margin-top:var(--s-2)">
              ${UI.THEME_LIST.map(th => {
                const isActive = (UI.getCurrentThemeKey() === th.key);
                const thumbSrc = (typeof DBYC_THEMES !== 'undefined' && DBYC_THEMES[th.key]) ? DBYC_THEMES[th.key] : th.file;
                return `
                  <div onclick="UI.applyTheme('${th.key}')" style="cursor:pointer;border:2px solid ${isActive ? 'var(--primary)' : 'var(--border)'};border-radius:var(--r-md);overflow:hidden;position:relative;background:#000;box-shadow:${isActive ? '0 0 0 2px var(--accent)' : 'none'}">
                    <img src="${thumbSrc}" style="width:100%;height:64px;object-fit:cover;opacity:0.85" alt="${th.name}">
                    <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,35,85,0.85);color:#fff;font-size:9px;font-weight:700;padding:2px 4px;text-align:center">
                      ${isActive ? '✓ ' : ''}${th.name}
                    </div>
                  </div>`;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="UI.closeModal('auth-profile-modal')">Cancel</button>
        <button class="btn btn-primary" onclick="UI.saveAuthorityProfile()">Save Profile</button>
      </div>`);
  },

  THEME_LIST: [
    { key: 'banner', name: 'Joyful Kingdom (Banner)', file: 'assets/don-bosco-banner.jpg' },
    { key: 'walk', name: 'Journey with Youth', file: 'assets/don-bosco-walk.jpg' },
    { key: 'oratory', name: 'Oratory Courtyard', file: 'assets/don-bosco-oratory.jpg' },
    { key: 'teaching', name: 'Good Night Teaching', file: 'assets/don-bosco-teaching.jpg' }
  ],

  getCurrentThemeKey() {
    return localStorage.getItem('dbyc_active_theme') || 'banner';
  },

  applyTheme(key) {
    const th = this.THEME_LIST.find(t => t.key === key) || this.THEME_LIST[0];
    localStorage.setItem('dbyc_active_theme', th.key);

    const themeImg = (typeof DBYC_THEMES !== 'undefined' && DBYC_THEMES[th.key]) ? DBYC_THEMES[th.key] : th.file;

    document.body.style.backgroundImage = `
      linear-gradient(180deg, rgba(244, 246, 251, 0.93) 0%, rgba(240, 244, 250, 0.95) 100%),
      url('${themeImg}')
    `;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';

    const loginEl = document.getElementById('login-screen');
    if (loginEl) {
      loginEl.style.backgroundImage = `
        linear-gradient(145deg, rgba(0, 35, 85, 0.88) 0%, rgba(0, 63, 138, 0.82) 55%, rgba(15, 23, 42, 0.94) 100%),
        url('${themeImg}')
      `;
    }

    if (typeof UI !== 'undefined' && UI.toast) {
      UI.toast('success', 'Theme Applied', `Theme: ${th.name}`);
    }
  },

  cycleTheme() {
    const current = this.getCurrentThemeKey();
    const idx = this.THEME_LIST.findIndex(t => t.key === current);
    const nextIdx = (idx + 1) % this.THEME_LIST.length;
    this.applyTheme(this.THEME_LIST[nextIdx].key);
  },

  _tempAuthorityPhoto: '',

  async handleAuthorityPhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      this._tempAuthorityPhoto = await Utils.compressImage(file, 240, 240, 0.82);
      const box = document.getElementById('auth-photo-container');
      if (box) box.innerHTML = `<img src="${this._tempAuthorityPhoto}" style="width:100%;height:100%;object-fit:cover">`;
    } catch(err) {
      console.error(err);
    }
  },

  saveAuthorityProfile() {
    const name = document.getElementById('ap-name')?.value.trim();
    const pwd = document.getElementById('ap-pwd')?.value.trim();
    const confirmPwd = document.getElementById('ap-confirm-pwd')?.value.trim();

    if (pwd) {
      if (pwd.length < 4) {
        UI.toast('warning', 'Password Validation', 'New password must be at least 4 characters.');
        return;
      }
      if (pwd !== confirmPwd) {
        UI.toast('warning', 'Password Mismatch', 'New password and confirmation password do not match.');
        return;
      }
    }

    Auth.updateAuthorityProfile({
      name: name,
      password: pwd || undefined,
      picture: this._tempAuthorityPhoto || Auth.getUser()?.picture
    });

    this._tempAuthorityPhoto = '';
    UI.closeModal('auth-profile-modal');
  },

  toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('sidebar-overlay');
    if (sb) sb.classList.toggle('open');
    if (ov) ov.classList.toggle('open');
  }
};


// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
  // Register routes
  Router.register('dashboard', (c) => Dashboard.render(c));
  Router.register('events', (c) => EventsModule.render(c));
  Router.register('formation', (c) => FormationModule.render(c));
  Router.register('volunteer', (c) => VolunteerModule.render(c));
  Router.register('leaderboard', (c) => LeaderboardModule.render(c));
  Router.register('members', (c) => Members.render(c));
  Router.register('attendance', (c) => Attendance.render(c));
  Router.register('qr', (c) => QRGenerator.render(c));
  Router.register('certificates', (c) => Certificates.render(c));
  Router.register('reports', (c) => Reports.render(c));
  Router.register('rules', (c) => Rules.render(c));
  Router.register('birthdays',       (c) => BirthdaysModule.render(c));
  Router.register('event-calendar',  (c) => EventCalendar.render(c));
  Router.register('upcoming-events', (c) => UpcomingEvents.render(c));
  Router.register('minutes',         (c) => DBYCMinutes.render(c));
  Router.register('news',            (c) => DBYCNews.render(c));
  Router.register('statistics',      (c) => MembersStatistics.render(c));
  Router.register('teams',           (c) => TeamSystem.render(c));

  // Initialize auth state and theme
  Auth.init();
  UI.applyTheme(UI.getCurrentThemeKey());
  Router.init();

  // Initialize Tamil & English Voice Typing & Virtual Keyboard
  if (typeof VoiceKeyboard !== 'undefined') {
    VoiceKeyboard.init();
  }

  // Register service worker if supported
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('ServiceWorker registration optional:', err);
    });
  }

  // Initialize PWA Controller
  PWA.init();
});

// Universal DBYC PWA Install Controller (Works on Android, iOS, Windows, Mac, Chrome, Edge, Safari)
const PWA = {
  _deferredPrompt: null,

  init() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this._deferredPrompt = e;
      console.log('DBYC PWA install prompt ready');
      this.updateInstallButtons(true);
    });

    window.addEventListener('appinstalled', () => {
      this._deferredPrompt = null;
      UI.toast('success', 'App Installed!', 'DBYC Portal is now installed on your device home screen.');
      this.updateInstallButtons(false);
    });
  },

  updateInstallButtons(isReady) {
    const btns = document.querySelectorAll('.pwa-install-trigger');
    btns.forEach(btn => {
      btn.style.display = 'inline-flex';
      if (isReady) {
        btn.classList.add('pulse-ready');
      }
    });
  },

  async install() {
    if (this._deferredPrompt) {
      this._deferredPrompt.prompt();
      const { outcome } = await this._deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        UI.toast('success', 'Installation Started', 'Adding DBYC Portal to your applications...');
      }
      this._deferredPrompt = null;
    } else {
      // Show rich visual instructional modal based on client OS
      this.showInstallInstructionsModal();
    }
  },

  showInstallInstructionsModal() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);

    let instructions = '';
    if (isIOS) {
      instructions = `
        <div style="background:#F0F4FF;padding:12px;border-radius:8px;margin-bottom:12px;text-align:left">
          <div style="font-weight:700;color:var(--primary);margin-bottom:6px">📱 Apple iPhone / iPad (Safari Browser):</div>
          <ol style="padding-left:20px;margin:0;font-size:13px;line-height:1.6">
            <li>Tap the <strong>Share</strong> button (⎋ with an arrow pointing up) at the bottom bar of Safari.</li>
            <li>Scroll down and tap <strong>"Add to Home Screen" (முகப்புத் திரையில் சேர்)</strong> ➕.</li>
            <li>Tap <strong>"Add"</strong> in the top-right corner. The DBYC App icon will appear on your home screen!</li>
          </ol>
        </div>`;
    } else if (isAndroid) {
      instructions = `
        <div style="background:#F0F4FF;padding:12px;border-radius:8px;margin-bottom:12px;text-align:left">
          <div style="font-weight:700;color:var(--primary);margin-bottom:6px">📱 Android Phone (Chrome / Brave / Edge):</div>
          <ol style="padding-left:20px;margin:0;font-size:13px;line-height:1.6">
            <li>Tap the <strong>3 vertical dots (⋮)</strong> menu in the top-right corner of your browser.</li>
            <li>Tap <strong>"Install App"</strong> or <strong>"Add to Home screen" (பயன்பாட்டை நிறுவுக)</strong>.</li>
            <li>Confirm by tapping <strong>Install</strong>. DBYC will open as a native fullscreen app!</li>
          </ol>
        </div>`;
    } else {
      instructions = `
        <div style="background:#F0F4FF;padding:12px;border-radius:8px;margin-bottom:12px;text-align:left">
          <div style="font-weight:700;color:var(--primary);margin-bottom:6px">💻 Laptop / PC (Google Chrome & Microsoft Edge):</div>
          <ol style="padding-left:20px;margin:0;font-size:13px;line-height:1.6">
            <li>Look at the right end of the <strong>URL / Address bar</strong> at the top.</li>
            <li>Click the <strong>Install DBYC (⊞ / 💻)</strong> icon.</li>
            <li>Or click browser <strong>Menu (⋮) &gt; Save and share &gt; Install DBYC</strong>.</li>
          </ol>
        </div>`;
    }

    const logoSrc = (typeof DBYC_LOGO_DATA !== 'undefined' && DBYC_LOGO_DATA) ? DBYC_LOGO_DATA : './assets/dbyc-logo.jpg';

    UI.openModal('pwa-install-modal', `
      <div class="modal-header">
        <span class="modal-title">📲 Install DBYC Portal App (பயன்பாட்டை நிறுவுக)</span>
        <button class="modal-close" onclick="UI.closeModal('pwa-install-modal')">✕</button>
      </div>
      <div class="modal-body" style="text-align:center">
        <img src="${logoSrc}" style="width:72px;height:72px;border-radius:16px;border:2px solid var(--accent);margin-bottom:8px;object-fit:cover">
        <div style="font-size:16px;font-weight:800;color:var(--primary)">DON BOSCO YOUTH CENTRE</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px">Official Progressive Web App (Offline & Fast)</div>
        
        ${instructions}

        <div style="margin-top:14px;padding:12px;background:rgba(16,185,129,0.08);border:1.5px dashed #10b981;border-radius:10px;text-align:center">
          <div style="font-size:12px;color:#065f46;font-weight:700;margin-bottom:6px">🤖 Having trouble installing or need automated fixes? (PWA சிக்கலா?)</div>
          <button class="btn btn-sm" onclick="UI.closeModal('pwa-install-modal');if(typeof AIDoctor!=='undefined')AIDoctor.openModal();" style="background:#10b981;color:#fff;border:none;font-weight:700;padding:6px 14px;border-radius:6px;cursor:pointer">
            ✨ Launch AI PWA Doctor & Auto-Rectify (AI சரிசெய்தல்)
          </button>
        </div>

        <div style="display:flex;align-items:center;justify-content:center;gap:8px;color:var(--success);font-size:12px;font-weight:600;margin-top:12px">
          <span>✓ Works 100% Offline</span> &bull; <span>✓ Zero Storage (< 1MB)</span> &bull; <span>✓ Fast & Free</span>
        </div>
      </div>
      <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
        <button class="btn btn-outline btn-sm" onclick="UI.closeModal('pwa-install-modal');if(typeof AIDoctor!=='undefined')AIDoctor.openModal();" style="color:#047857;border-color:#10b981">
          🤖 AI PWA Doctor
        </button>
        <button class="btn btn-primary" onclick="UI.closeModal('pwa-install-modal')">Got it! (புரிந்தது)</button>
      </div>`);
  }
};
