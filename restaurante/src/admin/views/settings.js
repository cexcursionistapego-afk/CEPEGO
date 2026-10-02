// Vista «Ajustes»: reservas online, avisos, servicios y horarios, cierres,
// menús (en valenciano, castellano e inglés) y equipo.

import { ctx, api, esc, icon, toast, ask, refresh, fieldError } from '../core.js';

const DAY_CHIPS = [[1, 'L'], [2, 'M'], [3, 'X'], [4, 'J'], [5, 'V'], [6, 'S'], [0, 'D']];
const LANGS = [['va', 'Valencià'], ['es', 'Castellano'], ['en', 'English']];

const num = (name, label, value, attrs = '') => `<label class="f"><span>${label}</span><input type="number" name="${name}" value="${esc(value)}" ${attrs}></label>`;
const check = (name, label, checked, hint = '') => `<label class="checkline"><input type="checkbox" name="${name}" ${checked ? 'checked' : ''}> <span>${label}${hint ? `<br><span class="muted" style="font-size:12.5px">${hint}</span>` : ''}</span></label>`;
const i18nInputs = (prefix, value = {}, label, textarea = false) => LANGS.map(([l, n]) => `<label class="f"><span>${label} · ${n}</span>${textarea
  ? `<textarea name="${prefix}.${l}" rows="${textarea}">${esc(value[l] || '')}</textarea>`
  : `<input name="${prefix}.${l}" value="${esc(value[l] || '')}">`}</label>`).join('');

async function save(section, data, button) {
  button.disabled = true;
  try {
    const { config } = await api('/api/admin/config', { method: 'PUT', body: { [section]: data } });
    Object.assign(ctx, { services: config.services, menus: config.menus, booking: config.booking });
    toast('Ajustes guardados');
    return config;
  } catch (err) {
    toast(err.message, 'error');
    throw err;
  } finally {
    button.disabled = false;
  }
}

// ── Servicios ──────────────────────────────────────────────────────────

function serviceCard(s, i) {
  return `<div class="svc-edit" data-svc="${i}">
    <div class="row-actions"><strong>${esc(s.label?.va || s.label?.es || 'Nuevo servicio')}</strong><button type="button" class="btn btn-sm btn-danger" data-remove-svc="${i}">Quitar</button></div>
    <div class="form-grid">
      <label class="f"><span>Identificador</span><input name="id" value="${esc(s.id || '')}" ${s.id ? 'readonly' : ''} placeholder="p. ej. cena"></label>
      <fieldset class="f" style="border:0;padding:0;margin:0"><legend>Días</legend><div class="chips days-picker">${DAY_CHIPS.map(([d, l]) => `<label class="chip"><input type="checkbox" name="days" value="${d}" ${(s.days || []).includes(d) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></fieldset>
      ${LANGS.map(([l, n]) => `<label class="f"><span>Nombre · ${n}</span><input name="label.${l}" value="${esc(s.label?.[l] || '')}"></label>`).join('')}
      <label class="f full"><span>Horas de llegada (separadas por comas)</span><input name="slots" value="${esc((s.slots || []).join(', '))}" placeholder="20:30, 20:45, 21:00"></label>
      <div class="f full"><span>Generar turnos</span><div class="toolbar"><input class="input" type="time" data-gen-from value="${esc(s.slots?.[0] || '20:30')}" style="width:auto" aria-label="Desde"> a <input class="input" type="time" data-gen-to value="${esc(s.slots?.at(-1) || '21:30')}" style="width:auto" aria-label="Hasta"> cada <select class="input" data-gen-step style="width:auto" aria-label="Intervalo"><option>15</option><option>30</option><option>20</option><option>45</option><option>60</option></select> min <button type="button" class="btn btn-sm" data-gen>Generar</button></div></div>
      ${num('slotCapacity', 'Comensales por turno', s.slotCapacity ?? 8, 'min="1" max="500"')}
      ${num('capacity', 'Comensales por servicio', s.capacity ?? 24, 'min="1" max="1000"')}
      ${num('duration', 'Duración (min)', s.duration ?? 150, 'min="30" max="600" step="15"')}
    </div>
  </div>`;
}

function readServices(box) {
  return [...box.querySelectorAll('[data-svc]')].map((c) => {
    const q = (n) => c.querySelector(`[name="${n}"]`);
    return {
      id: q('id').value.trim(),
      label: Object.fromEntries(LANGS.map(([l]) => [l, q(`label.${l}`).value.trim()])),
      days: [...c.querySelectorAll('[name=days]:checked')].map((x) => Number(x.value)),
      slots: q('slots').value.split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean).map((x) => (/^\d:\d\d$/.test(x) ? '0' + x : x)),
      slotCapacity: q('slotCapacity').value, capacity: q('capacity').value, duration: q('duration').value,
    };
  });
}

// ── Menús ──────────────────────────────────────────────────────────────

function menuCard(m, i) {
  const courses = (l) => (m.courses || []).map((c) => c[l] || '').join('\n');
  return `<div class="menu-edit" data-menu="${i}">
    <div class="row-actions"><strong>${esc(m.name?.va || m.name?.es || 'Nuevo menú')}</strong>
      <span class="toolbar">${check('active', 'Visible en la web', m.active !== false)}<button type="button" class="btn btn-sm btn-danger" data-remove-menu="${i}">Quitar</button></span></div>
    <div class="form-grid">
      <label class="f"><span>Identificador</span><input name="id" value="${esc(m.id || '')}" ${m.id ? 'readonly' : ''} placeholder="p. ej. origen"></label>
      ${num('price', 'Precio por persona (€)', m.price ?? 0, 'min="0" step="1"')}
      ${i18nInputs('name', m.name, 'Nombre')}
    </div>
    <div class="form-grid">${i18nInputs('summary', m.summary, 'Descripción', 2)}</div>
    <p class="muted" style="font-size:12.5px">Platos: uno por línea, en el mismo orden en los tres idiomas. Si un idioma se deja vacío, se usa el castellano.</p>
    <div class="form-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${LANGS.map(([l, n]) => `<label class="f"><span>Platos · ${n}</span><textarea name="courses.${l}" rows="8">${esc(courses(l))}</textarea></label>`).join('')}</div>
    <div><p class="section-label" style="margin-bottom:8px">Maridajes</p>
      <div data-pairings>${(m.pairing || []).map((p) => pairingRow(p)).join('')}</div>
      <button type="button" class="btn btn-sm" data-add-pairing>${icon('plus')} Añadir maridaje</button>
    </div>
  </div>`;
}

function pairingRow(p = {}) {
  return `<div class="pair-row" data-pairing data-id="${esc(p.id || '')}">
    <label class="f"><span>Valencià</span><input name="p.va" value="${esc(p.name?.va || '')}"></label>
    <label class="f"><span>Castellano</span><input name="p.es" value="${esc(p.name?.es || '')}"></label>
    <label class="f"><span>English</span><input name="p.en" value="${esc(p.name?.en || '')}"></label>
    <div class="toolbar" style="align-items:end"><label class="f" style="width:90px"><span>€</span><input type="number" name="p.price" value="${esc(p.price ?? 0)}" min="0"></label><button type="button" class="btn btn-icon btn-ghost" data-remove-pairing aria-label="Quitar maridaje">${icon('x')}</button></div>
  </div>`;
}

function readMenus(box) {
  return [...box.querySelectorAll('[data-menu]')].map((c) => {
    const q = (n) => c.querySelector(`[name="${n}"]`);
    const lines = (l) => q(`courses.${l}`).value.split('\n').map((x) => x.trim());
    const es = lines('es'), va = lines('va'), en = lines('en');
    const courses = [];
    for (let i = 0; i < Math.max(es.length, va.length, en.length); i++) {
      if (!es[i] && !va[i] && !en[i]) continue;
      courses.push({ va: va[i] || es[i] || '', es: es[i] || va[i] || '', en: en[i] || '' });
    }
    return {
      id: q('id').value.trim(),
      active: q('active').checked,
      price: q('price').value,
      name: Object.fromEntries(LANGS.map(([l]) => [l, q(`name.${l}`).value.trim()])),
      summary: Object.fromEntries(LANGS.map(([l]) => [l, q(`summary.${l}`).value.trim()])),
      courses,
      pairing: [...c.querySelectorAll('[data-pairing]')].map((p) => ({
        id: p.dataset.id || undefined,
        name: { va: p.querySelector('[name="p.va"]').value.trim(), es: p.querySelector('[name="p.es"]').value.trim(), en: p.querySelector('[name="p.en"]').value.trim() },
        price: p.querySelector('[name="p.price"]').value,
      })),
    };
  });
}

// ── Cierres ────────────────────────────────────────────────────────────

function closureRow(c = {}) {
  return `<div class="closure-row" data-closure>
    <label class="f"><span>Desde</span><input type="date" name="from" value="${esc(c.from || '')}" required></label>
    <label class="f"><span>Hasta</span><input type="date" name="to" value="${esc(c.to || c.from || '')}"></label>
    <label class="f"><span>Servicio</span><select name="service"><option value="all">Todo el día</option>${ctx.services.map((s) => `<option value="${s.id}"${s.id === c.service ? ' selected' : ''}>${esc(s.label.es)}</option>`).join('')}</select></label>
    <label class="f"><span>Motivo (interno)</span><input name="note" value="${esc(c.note || '')}" placeholder="Vacaciones, evento privado…"></label>
    <button type="button" class="btn btn-icon btn-ghost" data-remove-closure aria-label="Quitar cierre">${icon('x')}</button>
  </div>`;
}

// ── Vista ──────────────────────────────────────────────────────────────

export async function render(el) {
  const isAdmin = ctx.me.role === 'admin';
  const [{ config }, users] = await Promise.all([
    api('/api/admin/config'),
    isAdmin ? api('/api/admin/users').then((r) => r.users) : Promise.resolve([]),
  ]);
  const b = config.booking;
  const n = config.notifications || {};

  el.innerHTML = `
  <div class="topbar"><h1 class="page-title"><small>Ajustes</small>Configuración</h1></div>
  <div class="settings">
  ${isAdmin ? `
    <form class="card card-pad" data-section="booking">
      <h2>Reservas online</h2><p class="muted">Cómo y cuándo se puede reservar desde la web.</p>
      <div class="form-grid">
        ${num('minParty', 'Mínimo de comensales', b.minParty, 'min="1" max="20"')}
        ${num('maxParty', 'Máximo por reserva web', b.maxParty, 'min="1" max="40"')}
        ${num('windowDays', 'Antelación máxima (días)', b.windowDays, 'min="1" max="365"')}
        ${num('minAdvanceHours', 'Antelación mínima (horas)', b.minAdvanceMinutes / 60, 'min="0" max="168" step="0.5"')}
        ${num('cancellationHours', 'Cancelación gratuita hasta (horas antes)', b.cancellationHours, 'min="0" max="336"')}
      </div>
      <div style="display:grid;gap:10px;margin:16px 0">
        ${check('autoConfirm', 'Confirmar automáticamente las reservas web', b.autoConfirm, 'Si lo desactivas, entran como «pendientes» y las confirmas desde el panel.')}
        ${check('requireMenuChoice', 'Obligar a elegir menú al reservar', b.requireMenuChoice)}
        ${check('waitlist', 'Ofrecer lista de espera cuando no hay mesa', b.waitlist)}
      </div>
      <div class="form-actions"><button class="btn btn-primary">Guardar</button></div>
    </form>

    <form class="card card-pad" data-section="notifications">
      <h2>Avisos al cliente</h2>
      <p class="muted">Email: <span class="status-dot ${ctx.mail ? 'on' : ''}">${ctx.mail ? 'configurado' : 'sin configurar (RESEND_API_KEY y MAIL_FROM)'}</span> · SMS: <span class="status-dot ${ctx.sms ? 'on' : ''}">${ctx.sms ? 'configurado' : 'sin configurar (TWILIO_*)'}</span></p>
      <div style="display:grid;gap:10px;margin:8px 0 16px">
        ${check('smsConfirm', 'SMS de confirmación al reservar o confirmar', n.smsConfirm, 'Incluye un enlace corto para ver o cancelar la reserva.')}
        ${check('smsReminder', 'SMS recordatorio el día antes', n.smsReminder)}
        ${check('smsCancel', 'SMS cuando se cancela una reserva', n.smsCancel)}
        ${check('emailReminder', 'Email recordatorio el día antes', n.emailReminder)}
      </div>
      <p class="muted" style="font-size:12.5px;margin-bottom:12px">Los SMS se escriben sin caracteres especiales para que quepan en un solo mensaje (160 caracteres) y salen en el idioma del cliente. Los números fijos no reciben SMS.</p>
      <div class="form-actions"><button class="btn btn-primary">Guardar</button></div>
    </form>

    <form class="card card-pad" data-section="services">
      <h2>Servicios y horarios</h2><p class="muted">Turnos de llegada y aforo. El ritmo por turno evita que toda la sala llegue a la vez.</p>
      <div data-services>${config.services.map(serviceCard).join('')}</div>
      <div class="form-actions" style="justify-content:space-between"><button type="button" class="btn" data-add-svc>${icon('plus')} Añadir servicio</button><button class="btn btn-primary">Guardar</button></div>
    </form>

    <form class="card card-pad" data-section="closures">
      <h2>Cierres y vacaciones</h2><p class="muted">Días u horarios en los que no se aceptan reservas web.</p>
      <div data-closures>${config.closures.map(closureRow).join('')}</div>
      <div class="form-actions" style="justify-content:space-between"><button type="button" class="btn" data-add-closure>${icon('plus')} Añadir cierre</button><button class="btn btn-primary">Guardar</button></div>
    </form>

    <form class="card card-pad" data-section="menus">
      <h2>Menús</h2><p class="muted">Lo que se guarda aquí aparece en la web (menús, portada, reservas y tarjeta regalo) en unos segundos.</p>
      <div data-menus>${config.menus.map(menuCard).join('')}</div>
      <div class="form-actions" style="justify-content:space-between"><button type="button" class="btn" data-add-menu>${icon('plus')} Añadir menú</button><button class="btn btn-primary">Guardar</button></div>
    </form>

    <section class="card card-pad">
      <h2>Equipo</h2><p class="muted">«Administración» puede cambiarlo todo; «Sala» gestiona reservas y clientes.</p>
      <div>${users.map((u) => `<div class="user-row"><span><strong>${esc(u.name)}</strong> <span class="muted">@${esc(u.username)} · ${u.role === 'admin' ? 'Administración' : 'Sala'}${u.builtin ? ' · cuenta principal (ADMIN_PASSWORD)' : ''}</span></span>
        ${u.builtin || u.id === ctx.me.id ? '' : `<span class="toolbar"><button class="btn btn-sm" data-reset="${u.id}">Nueva contraseña</button><button class="btn btn-sm btn-danger" data-del-user="${u.id}">Quitar</button></span>`}</div>`).join('')}</div>
      <form class="form-grid" data-new-user style="margin-top:16px;padding-top:16px;border-top:1px solid var(--line)">
        <label class="f"><span>Usuario</span><input name="username" required autocomplete="off" placeholder="p. ej. marta"></label>
        <label class="f"><span>Nombre</span><input name="name" required></label>
        <label class="f"><span>Rol</span><select name="role"><option value="sala">Sala</option><option value="admin">Administración</option></select></label>
        <label class="f"><span>Contraseña (mín. 10)</span><input name="password" type="password" required minlength="10" autocomplete="new-password"></label>
        <div class="form-actions full"><button class="btn btn-primary">Añadir persona</button></div>
      </form>
    </section>` : '<p class="notice">Solo el perfil de administración puede cambiar los ajustes del restaurante.</p>'}
    ${ctx.me.id !== 'admin' ? `<form class="card card-pad" data-own-password>
      <h2>Mi contraseña</h2>
      <div class="form-grid"><label class="f"><span>Nueva contraseña (mín. 10)</span><input type="password" name="password" required minlength="10" autocomplete="new-password"></label></div>
      <div class="form-actions"><button class="btn btn-primary">Cambiar</button></div>
    </form>` : ''}
  </div>`;

  if (!isAdmin) {
    bindOwnPassword(el);
    return {};
  }

  // Reservas online
  el.querySelector('[data-section="booking"]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    await save('booking', {
      minParty: f.minParty.value, maxParty: f.maxParty.value, windowDays: f.windowDays.value,
      minAdvanceMinutes: Math.round(Number(f.minAdvanceHours.value) * 60), cancellationHours: f.cancellationHours.value,
      autoConfirm: f.autoConfirm.checked, requireMenuChoice: f.requireMenuChoice.checked, waitlist: f.waitlist.checked,
    }, f.querySelector('button.btn-primary')).catch(() => {});
  });

  // Avisos
  el.querySelector('[data-section="notifications"]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    await save('notifications', {
      smsConfirm: f.smsConfirm.checked, smsReminder: f.smsReminder.checked, smsCancel: f.smsCancel.checked, emailReminder: f.emailReminder.checked,
    }, f.querySelector('button.btn-primary')).catch(() => {});
  });

  // Servicios
  const svcForm = el.querySelector('[data-section="services"]');
  const svcBox = svcForm.querySelector('[data-services]');
  svcForm.querySelector('[data-add-svc]').addEventListener('click', () => {
    svcBox.insertAdjacentHTML('beforeend', serviceCard({ days: [3, 4, 5, 6], slots: [], label: {} }, svcBox.children.length));
  });
  svcBox.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove-svc]');
    if (rm) rm.closest('[data-svc]').remove();
    const gen = e.target.closest('[data-gen]');
    if (gen) {
      const c = gen.closest('[data-svc]');
      const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      const from = toMin(c.querySelector('[data-gen-from]').value || '20:00');
      const to = toMin(c.querySelector('[data-gen-to]').value || '21:30');
      const step = Number(c.querySelector('[data-gen-step]').value) || 15;
      const out = [];
      for (let m = from; m <= to && out.length < 40; m += step) out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
      c.querySelector('[name=slots]').value = out.join(', ');
    }
  });
  svcForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await save('services', readServices(svcBox), svcForm.querySelector('button.btn-primary')).then(() => refresh()).catch(() => {});
  });

  // Cierres
  const clForm = el.querySelector('[data-section="closures"]');
  const clBox = clForm.querySelector('[data-closures]');
  clForm.querySelector('[data-add-closure]').addEventListener('click', () => clBox.insertAdjacentHTML('beforeend', closureRow({ from: ctx.today })));
  clBox.addEventListener('click', (e) => { const rm = e.target.closest('[data-remove-closure]'); if (rm) rm.closest('[data-closure]').remove(); });
  clForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rows = [...clBox.querySelectorAll('[data-closure]')].map((r) => ({
      from: r.querySelector('[name=from]').value, to: r.querySelector('[name=to]').value || r.querySelector('[name=from]').value,
      service: r.querySelector('[name=service]').value, note: r.querySelector('[name=note]').value,
    })).filter((r) => r.from);
    await save('closures', rows, clForm.querySelector('button.btn-primary')).catch(() => {});
  });

  // Menús
  const mForm = el.querySelector('[data-section="menus"]');
  const mBox = mForm.querySelector('[data-menus]');
  mForm.querySelector('[data-add-menu]').addEventListener('click', () => mBox.insertAdjacentHTML('beforeend', menuCard({ active: true, name: {}, summary: {}, courses: [], pairing: [] }, mBox.children.length)));
  mBox.addEventListener('click', async (e) => {
    const rm = e.target.closest('[data-remove-menu]');
    if (rm) {
      const r = await ask('¿Quitar este menú? Las reservas que ya lo tengan lo conservarán.', { confirm: 'Quitar', danger: true });
      if (r.ok) rm.closest('[data-menu]').remove();
    }
    const addP = e.target.closest('[data-add-pairing]');
    if (addP) addP.previousElementSibling.insertAdjacentHTML('beforeend', pairingRow());
    const rmP = e.target.closest('[data-remove-pairing]');
    if (rmP) rmP.closest('[data-pairing]').remove();
  });
  mForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await save('menus', readMenus(mBox), mForm.querySelector('button.btn-primary')).catch(() => {});
  });

  // Equipo
  const uForm = el.querySelector('[data-new-user]');
  uForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/api/admin/users', { method: 'POST', body: Object.fromEntries(new FormData(uForm)) });
      toast('Persona añadida');
      refresh();
    } catch (err) {
      if (!fieldError(uForm, /contraseña/i.test(err.message) ? 'password' : 'username', err.message)) toast(err.message, 'error');
    }
  });
  el.querySelectorAll('[data-del-user]').forEach((btn) => btn.addEventListener('click', async () => {
    const r = await ask('¿Quitar el acceso a esta persona? Su sesión se cerrará.', { confirm: 'Quitar acceso', danger: true });
    if (!r.ok) return;
    try { await api(`/api/admin/users?id=${encodeURIComponent(btn.dataset.delUser)}`, { method: 'DELETE' }); toast('Acceso retirado'); refresh(); }
    catch (err) { toast(err.message, 'error'); }
  }));
  el.querySelectorAll('[data-reset]').forEach((btn) => btn.addEventListener('click', async () => {
    const password = prompt('Nueva contraseña (mínimo 10 caracteres):');
    if (!password) return;
    try { await api('/api/admin/users/password', { method: 'POST', body: { id: btn.dataset.reset, password } }); toast('Contraseña cambiada'); }
    catch (err) { toast(err.message, 'error'); }
  }));
  bindOwnPassword(el);
  return {};
}

function bindOwnPassword(el) {
  el.querySelector('[data-own-password]')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/api/admin/users/password', { method: 'POST', body: { password: e.target.password.value } });
      toast('Contraseña cambiada');
      e.target.reset();
    } catch (err) { toast(err.message, 'error'); }
  });
}
