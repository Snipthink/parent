let activeModal = null;
let lastFocused = null;

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  lastFocused = document.activeElement;
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  activeModal = modal;
  requestAnimationFrame(() => {
    const focusTarget = modal.querySelector('input, select, textarea, button:not([aria-label="Close"])');
    focusTarget?.focus();
  });
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('hidden');
  activeModal = null;
  document.body.classList.remove('modal-open');
  lastFocused?.focus?.();
}

export function initModal() {
  const pairs = [
    ['openDoctorModalBtn', 'doctorModal', 'closeDoctorModalBtn', 'doctorModalBackdrop'],
    ['openPrivacyModalBtn', 'privacyModal', 'closePrivacyModalBtn', 'privacyModalBackdrop'],
    ['openTermsModalBtn', 'termsModal', 'closeTermsModalBtn', 'termsModalBackdrop'],
    ['closeAppointmentModalBtn', 'appointmentModal', 'closeAppointmentModalBtn', 'appointmentModalBackdrop']
  ];

  pairs.forEach(([openId, modalId, closeId, backdropId]) => {
    document.getElementById(openId)?.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(modalId);
    });
    if (closeId) document.getElementById(closeId)?.addEventListener('click', () => closeModal(modalId));
    document.getElementById(backdropId)?.addEventListener('click', () => closeModal(modalId));
  });

  document.querySelectorAll('[data-open-appointment]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      openModal('appointmentModal');
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (activeModal) closeModal(activeModal.id);
    const videoModal = document.getElementById('videoModal');
    if (videoModal && !videoModal.classList.contains('hidden')) {
      videoModal.classList.add('hidden');
      document.body.classList.remove('modal-open');
      const frame = document.getElementById('videoModalFrame');
      if (frame) frame.src = '';
    }
    const panel = document.getElementById('themeSettingsPanel');
    if (panel && !panel.classList.contains('hidden')) panel.classList.add('hidden');
  });

  document.getElementById('appointmentCallBtn')?.addEventListener('click', () => {
    const href = document.getElementById('floatCallBtn')?.getAttribute('href');
    if (href && href !== 'tel:') window.location.href = href;
  });

  document.getElementById('appointmentModalForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const error = document.getElementById('appointmentModalError');
    if (!form.checkValidity()) {
      error.textContent = 'Please complete the required fields before sending your appointment request.';
      error.classList.remove('hidden');
      form.reportValidity();
      return;
    }
    error.classList.add('hidden');
    const data = new FormData(form);
    const clinicName = document.getElementById('navClinicName')?.textContent?.trim() || 'Clinic';
    const lines = [
      `Appointment Request - ${clinicName}`,
      `Name: ${data.get('name')}`,
      `Phone: ${data.get('phone')}`,
      `Age: ${data.get('age')}`,
      `Gender: ${data.get('gender')}`,
      `Email: ${data.get('email') || 'Not provided'}`,
      `Reason: ${data.get('reason')}`,
      `Preferred Date: ${data.get('date')}`,
      `Preferred Time: ${data.get('time') || 'Flexible'}`,
      `Additional Information: ${data.get('message') || 'None'}`
    ];
    const whatsapp = document.getElementById('floatWhatsappBtn')?.getAttribute('href');
    if (!whatsapp || !whatsapp.startsWith('https://wa.me/')) {
      error.textContent = 'WhatsApp is not configured yet. Please use the Call Clinic button.';
      error.classList.remove('hidden');
      return;
    }
    window.open(`${whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    closeModal('appointmentModal');
    form.reset();
  });
}

export { openModal, closeModal };
