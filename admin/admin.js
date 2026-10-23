let authToken = localStorage.getItem('we_ats_admin_token') || '';
let currentPage = 1;
let currentStatusFilter = 'all';
let currentSearchQuery = '';
let searchTimeout = null;
let currentApplicationsList = [];

document.addEventListener('DOMContentLoaded', () => {
  if (authToken) {
    verifySession();
  } else {
    showLoginOverlay();
  }

  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

function showLoginOverlay() {
  document.getElementById('login-overlay').style.display = 'flex';
  document.getElementById('admin-app').style.display = 'none';
}

function showAdminApp() {
  document.getElementById('login-overlay').style.display = 'none';
  document.getElementById('admin-app').style.display = 'block';
  loadDashboardData();
  loadApplications();
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('admin-user').value.trim();
  const password = document.getElementById('admin-pass').value.trim();
  const errEl = document.getElementById('login-err');
  const btn = document.getElementById('login-submit-btn');

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'جاري التحقق والاتصال... ⏳';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'فشل تسجيل الدخول.');
    }

    authToken = data.token;
    localStorage.setItem('we_ats_admin_token', authToken);
    document.getElementById('admin-name-display').textContent = data.admin.fullName;
    showAdminApp();

  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'تسجيل الدخول للمنظومة ⚡';
  }
}

async function verifySession() {
  try {
    const res = await fetch('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (!res.ok) {
      throw new Error('Expired session');
    }
    showAdminApp();
  } catch (err) {
    localStorage.removeItem('we_ats_admin_token');
    authToken = '';
    showLoginOverlay();
  }
}

function adminLogout() {
  localStorage.removeItem('we_ats_admin_token');
  authToken = '';
  showLoginOverlay();
}

async function loadDashboardData() {
  try {
    const res = await fetch('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const result = await res.json();
    if (!result.success) return;

    const d = result.data;
    document.getElementById('stat-total-apps').textContent = d.totalApplications;
    document.getElementById('stat-accepted-apps').textContent = d.statusCounts.accepted || 0;
    document.getElementById('stat-avg-score').textContent = d.averageScore || '0';

    document.getElementById('count-submitted').textContent = d.statusCounts.submitted || 0;
    document.getElementById('count-under_review').textContent = d.statusCounts.under_review || 0;
    document.getElementById('count-interview_scheduled').textContent = d.statusCounts.interview_scheduled || 0;
    document.getElementById('count-accepted').textContent = d.statusCounts.accepted || 0;
    document.getElementById('count-rejected').textContent = d.statusCounts.rejected || 0;

  } catch (err) {
    console.error('Failed to load dashboard metrics:', err);
  }
}

function filterByStatus(status) {
  document.getElementById('status-filter-select').value = status;
  currentStatusFilter = status;
  currentPage = 1;
  loadApplications();
}

function debounceSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearchQuery = document.getElementById('app-search-input').value.trim();
    currentPage = 1;
    loadApplications();
  }, 350);
}

async function loadApplications() {
  const tbody = document.getElementById('applications-table-body');
  tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;">جاري جلب الطلبات... ⏳</td></tr>`;

  currentStatusFilter = document.getElementById('status-filter-select').value;

  let url = `/api/admin/applications?page=${currentPage}&limit=15&status=${encodeURIComponent(currentStatusFilter)}`;
  if (currentSearchQuery) {
    url += `&q=${encodeURIComponent(currentSearchQuery)}`;
  }

  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);

    currentApplicationsList = result.data;
    renderApplicationsTable(result.data, result.pagination);

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--we-red); padding: 2rem;">${err.message}</td></tr>`;
  }
}

function renderApplicationsTable(apps, pagination) {
  const tbody = document.getElementById('applications-table-body');
  if (!apps || apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2.5rem; color: var(--admin-muted);">لا توجد طلبات مطابقة لمعايير البحث الحالية.</td></tr>`;
    updatePaginationControls(0, 0, 0);
    return;
  }

  const statusLabels = {
    submitted: 'تم التقديم',
    under_review: 'قيد التدقيق',
    interview_scheduled: 'مقابلة محددة',
    accepted: 'مقبول 🎯',
    rejected: 'غير مستوفٍ'
  };

  tbody.innerHTML = apps.map(a => `
    <tr>
      <td><span class="app-code-badge">${a.app_code}</span></td>
      <td style="font-weight: 700;">${escapeHTML(a.full_name)}</td>
      <td style="font-family: monospace;">${a.national_id}</td>
      <td style="font-weight: 800; color: var(--we-gold);">${a.prep_score}</td>
      <td>${escapeHTML(a.governorate)}</td>
      <td style="font-size: 0.82rem;">${escapeHTML(a.school_name_ar || '-')}</td>
      <td style="font-size: 0.82rem;">${escapeHTML(a.spec_title_ar || 'ديجيتال ارك')}</td>
      <td>
        <span class="status-pill ${a.status}">
          ${statusLabels[a.status] || a.status}
        </span>
      </td>
      <td>
        <button class="btn-view" onclick="openApplicationModal(${a.id})">
          عرض وتعديل ✏️
        </button>
      </td>
    </tr>
  `).join('');

  updatePaginationControls(pagination.page, pagination.totalPages, pagination.total);
}

function updatePaginationControls(page, totalPages, total) {
  document.getElementById('pagination-info').textContent = `عرض الصفحة ${page} من ${totalPages || 1} (إجمالي ${total} طلب)`;
  document.getElementById('prev-page-btn').disabled = (page <= 1);
  document.getElementById('next-page-btn').disabled = (page >= totalPages || totalPages === 0);
}

function changePage(delta) {
  currentPage += delta;
  loadApplications();
}

function openApplicationModal(appId) {
  const app = currentApplicationsList.find(a => a.id === appId);
  if (!app) return;

  document.getElementById('edit-app-id').value = app.id;
  document.getElementById('modal-app-code').textContent = app.app_code;
  document.getElementById('modal-app-name').textContent = app.full_name;

  document.getElementById('m-nid').textContent = app.national_id;
  document.getElementById('m-gender').textContent = app.gender || 'مشترك';
  document.getElementById('m-score').textContent = `${app.prep_score} / 280`;
  document.getElementById('m-gov').textContent = app.governorate;
  document.getElementById('m-student-phone').textContent = app.student_phone || '-';
  document.getElementById('m-guardian').textContent = `${app.guardian_name || '-'} (${app.guardian_phone || '-'})`;
  document.getElementById('m-school').textContent = app.school_name_ar || '-';
  document.getElementById('m-spec').textContent = app.spec_title_ar || 'ديجيتال ارك';
  document.getElementById('m-email').textContent = app.email || 'غير مسجل';

  document.getElementById('edit-status').value = app.status;
  document.getElementById('edit-interview-date').value = app.interview_date || '';
  document.getElementById('edit-interview-loc').value = app.interview_location || '';
  document.getElementById('edit-notes').value = app.admin_notes || '';

  document.getElementById('app-modal').classList.add('active');
}

function closeAdminModal() {
  document.getElementById('app-modal').classList.remove('active');
}

async function saveStatusUpdate(e) {
  e.preventDefault();
  const id = document.getElementById('edit-app-id').value;
  const status = document.getElementById('edit-status').value;
  const interviewDate = document.getElementById('edit-interview-date').value.trim();
  const interviewLocation = document.getElementById('edit-interview-loc').value.trim();
  const adminNotes = document.getElementById('edit-notes').value.trim();

  try {
    const res = await fetch(`/api/admin/applications/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status, interviewDate, interviewLocation, adminNotes })
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.error);

    if (result.emailSent) {
      if (result.emailPreviewUrl) {
        const viewEmail = confirm(`✅ تم حفظ الموعد بنجاح!\n📧 تم إصدار إخطار رسمي بموعد المقابلة والساعة ومقر المدرسة لبريد الطالب بنجاح!\n\nهل ترغب في فتح ومعاينة الرسالة الرسمية الصادرة للطالب؟`);
        if (viewEmail) {
          window.open(result.emailPreviewUrl, '_blank');
        }
      } else {
        alert(`✅ تم حفظ التعديلات بنجاح!\n📧 تم إرسال إخطار رسمي بموعد المقابلة والساعة ومقر المدرسة إلى البريد الإلكتروني للطالب بنجاح!`);
      }
    } else {
      alert('✅ تم حفظ التعديلات بنجاح!');
    }

    closeAdminModal();
    loadDashboardData();
    loadApplications();

  } catch (err) {
    alert('❌ فشل حفظ التعديلات: ' + err.message);
  }
}

function exportCSV() {
  window.open(`/api/admin/applications/export?token=${encodeURIComponent(authToken)}`, '_blank');
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- SMTP REAL EMAIL CONFIGURATION ---
function openSmtpModal() {
  const modal = document.getElementById('smtp-modal');
  if (modal) modal.style.display = 'flex';
  loadSmtpSettings();
}

function closeSmtpModal() {
  const modal = document.getElementById('smtp-modal');
  if (modal) modal.style.display = 'none';
}

function toggleSmtpFields() {
  const type = document.getElementById('smtp-service-type').value;
  const brevoGroup = document.getElementById('brevo-fields-group');
  const gmailGroup = document.getElementById('gmail-fields-group');
  const customGroup = document.getElementById('custom-smtp-fields-group');
  if (brevoGroup) brevoGroup.style.display = type === 'brevo' ? 'block' : 'none';
  if (gmailGroup) gmailGroup.style.display = type === 'gmail' ? 'block' : 'none';
  if (customGroup) customGroup.style.display = type === 'custom' ? 'block' : 'none';
}

async function loadSmtpSettings() {
  const statusBox = document.getElementById('smtp-status-box');
  try {
    const res = await fetch('/api/admin/settings/smtp', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);

    const d = result.data;
    if (d.isRealConfigured) {
      const typeLabel = d.type === 'brevo' ? 'Brevo Cloud' : (d.type === 'gmail' ? 'Google Gmail' : 'Custom SMTP');
      statusBox.innerHTML = `🟢 <b>البريد الحقيقي مفعل بنجاح</b> عبر (${typeLabel}) للحساب: <b>${escapeHTML(d.email)}</b>`;
      statusBox.style.borderColor = '#00FF88';
      statusBox.style.color = '#00FF88';
      statusBox.style.background = 'rgba(0, 255, 136, 0.08)';
    } else {
      statusBox.innerHTML = `🟡 <b>حساب تجريبي محاكي (Ethereal)</b>: لم يتم ربط بريد حقيقي بعد. قم بإدخال حسابك لإرسال الإيميلات لصناديق البريد الحقيقية.`;
      statusBox.style.borderColor = '#FFB800';
      statusBox.style.color = '#FFB800';
      statusBox.style.background = 'rgba(255, 184, 0, 0.08)';
    }

    if (d.type && ['brevo', 'gmail', 'custom'].includes(d.type)) {
      document.getElementById('smtp-service-type').value = d.type;
      toggleSmtpFields();
    }

    if (d.brevoUser && document.getElementById('cfg-brevo-user')) {
      document.getElementById('cfg-brevo-user').value = d.brevoUser;
    }
    if (d.gmailUser && document.getElementById('cfg-gmail-user')) {
      document.getElementById('cfg-gmail-user').value = d.gmailUser;
    }
    if (d.smtpHost && document.getElementById('cfg-smtp-host')) {
      document.getElementById('cfg-smtp-host').value = d.smtpHost;
    }
    if (d.smtpPort && document.getElementById('cfg-smtp-port')) {
      document.getElementById('cfg-smtp-port').value = d.smtpPort;
    }
    if (d.smtpUser && document.getElementById('cfg-smtp-user')) {
      document.getElementById('cfg-smtp-user').value = d.smtpUser;
    }

  } catch (err) {
    statusBox.textContent = '❌ فشل جلب حالة خادم البريد: ' + err.message;
  }
}

async function saveSmtpConfig(e) {
  e.preventDefault();
  const serviceType = document.getElementById('smtp-service-type').value;
  const brevoUser = (document.getElementById('cfg-brevo-user') ? document.getElementById('cfg-brevo-user').value : '').trim();
  const brevoKey = (document.getElementById('cfg-brevo-key') ? document.getElementById('cfg-brevo-key').value : '').trim();
  const gmailUser = (document.getElementById('cfg-gmail-user') ? document.getElementById('cfg-gmail-user').value : '').trim();
  const gmailAppPass = (document.getElementById('cfg-gmail-pass') ? document.getElementById('cfg-gmail-pass').value : '').trim();
  const smtpHost = (document.getElementById('cfg-smtp-host') ? document.getElementById('cfg-smtp-host').value : '').trim();
  const smtpPort = document.getElementById('cfg-smtp-port') ? document.getElementById('cfg-smtp-port').value : '587';
  const smtpUser = (document.getElementById('cfg-smtp-user') ? document.getElementById('cfg-smtp-user').value : '').trim();
  const smtpPass = (document.getElementById('cfg-smtp-pass') ? document.getElementById('cfg-smtp-pass').value : '').trim();

  const saveBtn = document.getElementById('btn-save-smtp');
  const origText = saveBtn.innerHTML;
  saveBtn.innerHTML = 'جاري الحفظ... ⏳';
  saveBtn.disabled = true;

  try {
    const res = await fetch('/api/admin/settings/smtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        serviceType,
        brevoUser,
        brevoKey,
        gmailUser,
        gmailAppPass,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass
      })
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.error);

    alert('✅ ' + result.message);
    loadSmtpSettings();
  } catch (err) {
    alert('❌ فشل الحفظ: ' + err.message);
  } finally {
    saveBtn.innerHTML = origText;
    saveBtn.disabled = false;
  }
}

async function sendTestEmailNow() {
  const targetEmail = (document.getElementById('test-email-target').value || '').trim();
  const resBox = document.getElementById('smtp-test-result');
  const testBtn = document.getElementById('btn-send-test-email');

  if (!targetEmail || !targetEmail.includes('@')) {
    alert('يرجى إدخال عنوان بريد إلكتروني صالح للاختبار.');
    return;
  }

  resBox.style.display = 'block';
  resBox.style.background = 'rgba(255,255,255,0.05)';
  resBox.style.color = '#fff';
  resBox.textContent = 'جاري إرسال الرسالة التجريبية... ⏳';
  testBtn.disabled = true;

  try {
    const res = await fetch('/api/admin/settings/smtp/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ testEmail: targetEmail })
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.error);

    resBox.style.background = 'rgba(0, 255, 136, 0.12)';
    resBox.style.color = '#00FF88';
    resBox.innerHTML = `✅ <b>نجح الإرسال!</b> تم إرسال رسالة تجريبية بنجاح إلى <b>${escapeHTML(targetEmail)}</b>. تفقد بريدك الآن!`;
  } catch (err) {
    resBox.style.background = 'rgba(255, 0, 85, 0.12)';
    resBox.style.color = '#ff0055';
    resBox.innerHTML = `❌ <b>فشل الإرسال:</b> ${escapeHTML(err.message)}`;
  } finally {
    testBtn.disabled = false;
  }
}
