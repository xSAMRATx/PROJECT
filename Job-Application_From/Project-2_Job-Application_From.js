// Job application form: simple frontend validation (no backend).
// - Errors show after a field is touched, or for every field after a submit attempt.
// - The submit button stays disabled until all required fields are valid.
// - Double clicks / repeated submits are blocked while "submitting".

const form = document.getElementById('job-form');
const submitBtn = document.getElementById('submit-btn');
const successBox = document.getElementById('success');

const MAX_CV_SIZE = 2 * 1024 * 1024; // 2 MB
const CV_TYPES = ['pdf', 'doc', 'docx'];
const touched = new Set();
let isSubmitting = false;

function today() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
}
document.getElementById('start-date').min = today();

// Each rule returns an error message, or '' when the value is valid.
const rules = {
    first_name: (el) => {
        const v = el.value.trim();
        if (!v) return 'First name is required.';
        if (v.length < 2) return 'Please enter at least 2 characters.';
        return '';
    },
    last_name: (el) => {
        const v = el.value.trim();
        if (!v) return 'Last name is required.';
        if (v.length < 2) return 'Please enter at least 2 characters.';
        return '';
    },
    email: (el) => {
        const v = el.value.trim();
        if (!v) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter a valid email, like name@example.com.';
        return '';
    },
    phone: (el) => {
        const v = el.value.trim();
        if (!v) return 'Phone number is required.';
        if (!/^\+?[\d\s-]+$/.test(v)) return 'Use digits only (spaces, dashes and a leading + are fine).';
        const digits = v.replace(/\D/g, '').length;
        if (digits < 7 || digits > 15) return 'Phone number should have 7 to 15 digits.';
        return '';
    },
    job_role: (el) => (el.value ? '' : 'Please select a job role.'),
    start_date: (el) => {
        if (!el.value) return 'Please choose a start date.';
        if (el.value < today()) return 'Start date cannot be in the past.';
        return '';
    },
    experience: () => (form.querySelector('input[name="experience"]:checked') ? '' : 'Please choose your experience.'),
    city: (el) => (el.value.trim() ? '' : 'City is required.'),
    postcode: (el) => {
        const v = el.value.trim();
        if (v && !/^\d{4,6}$/.test(v)) return 'Postcode should be 4 to 6 digits.';
        return '';
    },
    cv: (el) => {
        const file = el.files[0];
        if (!file) return 'Please upload your CV.';
        const ext = file.name.split('.').pop().toLowerCase();
        if (!CV_TYPES.includes(ext)) return 'CV must be a PDF, DOC or DOCX file.';
        if (file.size > MAX_CV_SIZE) return 'CV must be 2 MB or smaller.';
        return '';
    },
    agree: (el) => (el.checked ? '' : 'Please confirm before applying.'),
};

const errorIds = {
    first_name: 'first-name-error', last_name: 'last-name-error', email: 'email-error',
    phone: 'phone-error', job_role: 'job-role-error', start_date: 'start-date-error',
    experience: 'experience-error', city: 'city-error', postcode: 'postcode-error',
    cv: 'cv-error', agree: 'agree-error',
};

function fieldsFor(name) {
    return Array.from(form.elements).filter((el) => el.name === name);
}

// Validate one field. Shows the message only if the field was touched.
function check(name) {
    const fields = fieldsFor(name);
    const message = rules[name](fields[0]);
    const show = touched.has(name) && message !== '';
    document.getElementById(errorIds[name]).textContent = show ? message : '';
    fields.forEach((el) => el.setAttribute('aria-invalid', show ? 'true' : 'false'));
    return message === '';
}

function updateButton() {
    const allValid = Object.keys(rules).map(check).every(Boolean);
    submitBtn.disabled = !allValid || isSubmitting;
}

form.addEventListener('input', (e) => {
    if (e.target.name && rules[e.target.name]) {
        // Radios, checkboxes, selects and files count as touched right away.
        if (['radio', 'checkbox', 'file', 'select-one', 'date'].includes(e.target.type)) touched.add(e.target.name);
        successBox.hidden = true;
        updateButton();
    }
});

form.addEventListener('focusout', (e) => {
    if (e.target.name && rules[e.target.name]) {
        touched.add(e.target.name);
        updateButton();
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isSubmitting) return; // block double submit

    Object.keys(rules).forEach((name) => touched.add(name));
    updateButton();
    if (submitBtn.disabled) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Fake a short network request, then show the success message.
    setTimeout(() => {
        isSubmitting = false;
        form.reset();
        touched.clear();
        submitBtn.textContent = 'Apply Now';
        updateButton();
        successBox.hidden = false;
        successBox.focus();
    }, 1200);
});

successBox.tabIndex = -1;
updateButton();
