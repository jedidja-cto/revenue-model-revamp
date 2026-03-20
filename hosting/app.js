import {
  auth,
  completeEmailLinkSignIn,
  db,
  logout,
  observeAuthState,
  sendEmailLink,
  setupPhoneAuth,
  signInEmail,
  signInGoogle,
  signInPhone,
  signUpEmail,
} from './firebase-client.js';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js';
import { runSimulation } from './simulation-engine.browser.js';

const STEP_META = [
  { step: 1, label: 'Business', nextLabel: 'Next: Products →' },
  { step: 2, label: 'Products', nextLabel: 'Next: Expenses →' },
  { step: 3, label: 'Expenses', nextLabel: 'Next: Review →' },
  { step: 4, label: 'Review & Run' },
];

const PRODUCT_CATEGORY_OPTIONS = [
  'Standard',
  'Premium',
  'Subscription',
  'Service',
  'Other',
];

const EXPENSE_CATEGORY_OPTIONS = [
  'Rent',
  'Salaries',
  'Electricity',
  'Transport',
  'Marketing',
  'Software',
  'Other',
];

const AUTH_ERROR_MESSAGES = {
  'auth/popup-closed-by-user': 'The sign-in window was closed. Please try again.',
  'auth/invalid-email': "That doesn't look like a valid email address.",
  'auth/wrong-password': 'Incorrect password. Try again or reset it.',
  'auth/user-not-found': 'No account found with that email.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/email-already-in-use': 'An account with that email already exists.',
  'auth/weak-password': 'Use a stronger password with at least 6 characters.',
  'auth/invalid-verification-code': 'That verification code is invalid. Please try again.',
  'auth/invalid-phone-number': 'Enter a valid phone number in international format.',
  'auth/missing-phone-number': 'Enter your phone number before requesting a code.',
};

const authScreen = document.querySelector('#auth-screen');
const appShell = document.querySelector('#app-shell');
const topbarHomeButton = document.querySelector('#topbar-home-button');
const topbarBusinessName = document.querySelector('#topbar-business-name');
const authStatus = document.querySelector('#auth-status');
const signOutButton = document.querySelector('#sign-out-button');
const accessPendingShell = document.querySelector('#access-pending-shell');
const accessPendingFeedback = document.querySelector('#access-pending-feedback');
const onboardingShell = document.querySelector('#onboarding-shell');
const onboardingForm = document.querySelector('#onboarding-form');
const onboardingNameInput = document.querySelector('#onboarding-name');
const onboardingRoleInput = document.querySelector('#onboarding-role');
const onboardingIndustryInput = document.querySelector('#onboarding-industry');
const onboardingFinanceTrackingInput = document.querySelector('#onboarding-finance-tracking');
const onboardingSubmitButton = document.querySelector('#onboarding-submit-button');
const onboardingFeedback = document.querySelector('#onboarding-feedback');

const googleButton = document.querySelector('#google-button');
const toggleEmailAuth = document.querySelector('#toggle-email-auth');
const togglePhoneAuth = document.querySelector('#toggle-phone-auth');
const toggleMagicLink = document.querySelector('#toggle-magic-link');
const authGlobalFeedback = document.querySelector('#auth-global-feedback');

const emailAuthPanel = document.querySelector('#email-auth-panel');
const phoneAuthPanel = document.querySelector('#phone-auth-panel');
const magicLinkPanel = document.querySelector('#magic-link-panel');

const emailAuthForm = document.querySelector('#email-auth-form');
const emailInput = document.querySelector('#email-input');
const passwordInput = document.querySelector('#password-input');
const loginButton = document.querySelector('#login-button');
const signupButton = document.querySelector('#signup-button');
const emailAuthFeedback = document.querySelector('#email-auth-feedback');

const emailLinkForm = document.querySelector('#email-link-form');
const emailLinkInput = document.querySelector('#email-link-input');
const emailLinkButton = document.querySelector('#email-link-button');
const emailLinkFeedback = document.querySelector('#email-link-feedback');

const phoneInput = document.querySelector('#phone-input');
const phoneCodeInput = document.querySelector('#phone-code-input');
const phoneSendButton = document.querySelector('#phone-send-button');
const phoneVerifyButton = document.querySelector('#phone-verify-button');
const phoneAuthFeedback = document.querySelector('#phone-auth-feedback');

const scenarioForm = document.querySelector('#scenario-form');
const formFeedback = document.querySelector('#form-feedback');
const backButton = document.querySelector('#back-button');
const nextButton = document.querySelector('#next-button');
const runSimulationButton = document.querySelector('#run-simulation-button');
const reviewWarning = document.querySelector('#review-warning');
const mobileStepLabel = document.querySelector('#mobile-step-label');
const stepItems = Array.from(document.querySelectorAll('.step-item'));
const stepPanels = Array.from(document.querySelectorAll('.builder-step'));

const businessNameInput = document.querySelector('#business-name');
const businessIndustryInput = document.querySelector('#business-industry');
const scenarioNameInput = document.querySelector('#scenario-name');
const projectionMonthsInput = document.querySelector('#projection-months');
const taxRateInput = document.querySelector('#tax-rate');
const demandChangeInput = document.querySelector('#demand-change');
const priceChangeInput = document.querySelector('#price-change');
const costChangeInput = document.querySelector('#cost-change');
const expenseChangeInput = document.querySelector('#expense-change');

const productsList = document.querySelector('#products-list');
const expensesList = document.querySelector('#expenses-list');
const addProductButton = document.querySelector('#add-product-button');
const addExpenseButton = document.querySelector('#add-expense-button');

const reviewBusiness = document.querySelector('#review-business');
const reviewProducts = document.querySelector('#review-products');
const reviewExpenses = document.querySelector('#review-expenses');

const resultsView = document.querySelector('#results-view');
const resultsScenarioName = document.querySelector('#results-scenario-name');
const resultsBusinessName = document.querySelector('#results-business-name');
const resultsSummary = document.querySelector('#results-summary');
const resultsTable = document.querySelector('#results-table');
const historyList = document.querySelector('#history-list');
const downloadCsvButton = document.querySelector('#download-csv-button');
const runAnotherScenarioButton = document.querySelector('#run-another-scenario-button');
const feedbackLinkButton = document.querySelector('#feedback-link-button');
const resultsChartCanvas = document.querySelector('#results-chart');

let currentStep = 1;
let currentRows = [];
let resultsChart = null;
let hasRenderedResults = false;
let activeScenarioContext = null;
let currentUserProfile = null;

const appUiConfig = window.APP_UI_CONFIG || {};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDecimalCurrency(value) {
  return `N$${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function formatPercent(value) {
  return `${Number(value).toFixed(0)}%`;
}

function formatTimestamp(value) {
  if (!value) {
    return 'Just now';
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate().toLocaleDateString();
  }

  if (typeof value?.seconds === 'number') {
    return new Date(value.seconds * 1000).toLocaleDateString();
  }

  return new Date(value).toLocaleDateString();
}

function buildCsvFileName() {
  const context =
    activeScenarioContext ||
    (currentRows[0]
      ? {
          businessName: currentRows[0].businessName || currentRows[0].input?.business?.name,
          scenarioName: currentRows[0].input?.scenario?.name,
        }
      : null);

  const businessName = slugify(context?.businessName || 'revenue-model');
  const scenarioName = slugify(context?.scenarioName || 'scenario-report');
  const timestamp = new Date()
    .toISOString()
    .replaceAll(':', '')
    .replaceAll('-', '')
    .replace(/\.\d{3}Z$/, 'Z')
    .replace('T', '-');

  return `${businessName}-${scenarioName}-${timestamp}.csv`;
}

function getNormalizedUserEmail(user = auth.currentUser) {
  return user?.email?.trim().toLowerCase() || '';
}

async function ensureApprovedUserAccess(user = auth.currentUser) {
  const normalizedEmail = getNormalizedUserEmail(user);
  if (!normalizedEmail) {
    return false;
  }

  const accessRef = doc(db, 'allowedUsers', normalizedEmail);
  let snapshot = await getDoc(accessRef);

  if (snapshot.exists()) {
    return snapshot.data()?.approved === true;
  }

  try {
    await setDoc(accessRef, {
      email: normalizedEmail,
      approved: true,
      source: 'bootstrap-migration',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    snapshot = await getDoc(accessRef);
    return snapshot.exists() && snapshot.data()?.approved === true;
  } catch (error) {
    if (
      error?.code !== 'permission-denied' &&
      error?.code !== 'firestore/permission-denied'
    ) {
      console.error('Unable to verify access approval.', error);
    }
    return false;
  }
}

function escapeCsvCell(value) {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function slugify(value) {
  return (
    String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'scenario'
  );
}

function getMonthLabels(length) {
  const base = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return Array.from({ length }, (_, index) => base[index % base.length]);
}

function mapAuthError(error) {
  return AUTH_ERROR_MESSAGES[error?.code] || 'Something went wrong. Please try again.';
}

function setFeedback(target, message, tone = 'neutral') {
  if (!message) {
    target.hidden = true;
    target.textContent = '';
    target.className = 'feedback';
    return;
  }

  target.hidden = false;
  target.textContent = message;
  target.className = `feedback feedback-${tone}`;
}

function setButtonLoading(button, text, isLoading) {
  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent;
  }

  button.disabled = isLoading;
  button.textContent = isLoading ? text : button.dataset.defaultLabel;
}

function setFieldError(input, message) {
  const field = input.closest('.field');
  const errorTarget = field?.querySelector('.field-error');

  if (!field || !errorTarget) {
    return;
  }

  field.classList.toggle('invalid', Boolean(message));
  errorTarget.textContent = message || '';
}

function validateEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

function validatePhone(value) {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

function validateIntegerPercent(value, { min = -1000, max = 1000 } = {}) {
  if (value === '') {
    return 'This field is required.';
  }

  if (!/^-?\d+$/.test(value)) {
    return 'Enter a whole number.';
  }

  const number = Number(value);
  if (number < min || number > max) {
    return `Enter a value between ${min} and ${max}.`;
  }

  return '';
}

function validateStaticField(input) {
  const value = input.value.trim();

  switch (input.id) {
    case 'onboarding-name':
      return value ? '' : 'Your name is required.';
    case 'onboarding-role':
      return value ? '' : 'Choose your role.';
    case 'onboarding-industry':
      return value ? '' : 'Choose an industry.';
    case 'onboarding-finance-tracking':
      return value ? '' : 'Choose how you track your finances.';
    case 'business-name':
      return value ? '' : 'Business name is required.';
    case 'business-industry':
      return value ? '' : 'Select an industry.';
    case 'scenario-name':
      return value ? '' : 'Scenario name is required.';
    case 'projection-months':
      return value ? '' : 'Choose a projection period.';
    case 'tax-rate':
      return validateIntegerPercent(value, { min: 0, max: 100 });
    case 'demand-change':
    case 'price-change':
    case 'cost-change':
    case 'expense-change':
      return validateIntegerPercent(value);
    case 'email-input':
    case 'email-link-input':
      if (!value) {
        return 'Email is required.';
      }
      return validateEmail(value) ? '' : "That doesn't look like a valid email address.";
    case 'password-input':
      if (!value) {
        return 'Password is required.';
      }
      return value.length >= 6 ? '' : 'Use at least 6 characters.';
    case 'phone-input':
      if (!value) {
        return 'Phone number is required.';
      }
      return validatePhone(value)
        ? ''
        : 'Enter a valid phone number in international format.';
    case 'phone-code-input':
      return value ? '' : 'Verification code is required.';
    default:
      return '';
  }
}

function validateDynamicField(input) {
  const role = input.dataset.role;
  const value = input.value.trim();

  switch (role) {
    case 'product-name':
      return value ? '' : 'Product name is required.';
    case 'product-selling-price':
    case 'product-cost-price':
    case 'product-units':
    case 'expense-amount':
      if (value === '') {
        return 'This field is required.';
      }
      return Number(value) >= 0 ? '' : 'Enter 0 or more.';
    case 'product-category':
    case 'expense-category':
      return value ? '' : 'Select a category.';
    case 'expense-name':
      return value ? '' : 'Expense name is required.';
    default:
      return '';
  }
}

function createOptionMarkup(options, selectedValue) {
  return options
    .map(
      (option) =>
        `<option value="${escapeHtml(option)}" ${option === selectedValue ? 'selected' : ''}>${escapeHtml(option)}</option>`,
    )
    .join('');
}

function createProductCard(data = {}) {
  const wrapper = document.createElement('article');
  wrapper.className = 'entry-card';
  wrapper.dataset.entryType = 'product';
  wrapper.innerHTML = `
    <div class="entry-card-header">
      <h4 class="entry-card-title">${escapeHtml(data.name || 'Item')}</h4>
      <button type="button" class="remove-link">Remove</button>
    </div>
    <div class="entry-grid">
      <label class="field">
        <span>What are you selling?</span>
        <input data-role="product-name" value="${escapeHtml(data.name || '')}" />
        <span class="field-error"></span>
      </label>
      <label class="field">
        <span>How much does the customer pay? (N$)</span>
        <input data-role="product-selling-price" type="number" min="0" step="0.01" value="${escapeHtml(data.sellingPrice ?? '')}" />
        <span class="field-error"></span>
      </label>
      <label class="field">
        <span>How much does it cost you to provide it? (N$)</span>
        <input data-role="product-cost-price" type="number" min="0" step="0.01" value="${escapeHtml(data.costPrice ?? '')}" />
        <span class="field-error"></span>
      </label>
      <label class="field">
        <span>How many do you expect to sell each month?</span>
        <input data-role="product-units" type="number" min="0" step="1" value="${escapeHtml(data.estimatedMonthlyUnits ?? '')}" />
        <span class="field-error"></span>
      </label>
      <label class="field">
        <span>What type of item is this?</span>
        <select data-role="product-category">
          <option value="">Select category</option>
          ${createOptionMarkup(PRODUCT_CATEGORY_OPTIONS, data.category || '')}
        </select>
        <span class="field-error"></span>
      </label>
      <label class="field">
        <span>Supplier (optional)</span>
        <input data-role="product-supplier" placeholder="Optional" value="${escapeHtml(data.supplier || '')}" />
        <span class="field-error"></span>
      </label>
    </div>
  `;
  return wrapper;
}

function createExpenseCard(data = {}) {
  const wrapper = document.createElement('article');
  wrapper.className = 'entry-card';
  wrapper.dataset.entryType = 'expense';
  wrapper.dataset.fixed = String(data.fixed ?? true);
  wrapper.innerHTML = `
    <div class="entry-card-header">
      <h4 class="entry-card-title">${escapeHtml(data.name || 'Business cost')}</h4>
      <button type="button" class="remove-link">Remove</button>
    </div>
    <div class="entry-grid">
      <label class="field">
        <span>What is this monthly cost?</span>
        <input data-role="expense-name" value="${escapeHtml(data.name || '')}" />
        <span class="field-error"></span>
      </label>
      <label class="field">
        <span>What type of cost is it?</span>
        <select data-role="expense-category">
          <option value="">Select category</option>
          ${createOptionMarkup(EXPENSE_CATEGORY_OPTIONS, data.category || '')}
        </select>
        <span class="field-error"></span>
      </label>
      <label class="field">
        <span>How much does it cost each month? (N$)</span>
        <input data-role="expense-amount" type="number" min="0" step="0.01" value="${escapeHtml(data.amountMonthly ?? '')}" />
        <span class="field-error"></span>
      </label>
      <div class="field">
        <span>Is this cost fixed every month?</span>
        <div class="toggle-row" role="group" aria-label="Fixed expense">
          <button type="button" class="toggle-pill ${data.fixed !== false ? 'active' : ''}" data-toggle-value="true">Yes</button>
          <button type="button" class="toggle-pill ${data.fixed === false ? 'active' : ''}" data-toggle-value="false">No</button>
        </div>
        <span class="field-error"></span>
      </div>
    </div>
  `;
  return wrapper;
}

function updateRemovableRows(list) {
  const cards = Array.from(list.children);
  cards.forEach((card, index) => {
    const removeButton = card.querySelector('.remove-link');
    removeButton.hidden = cards.length === 1 && index === 0;
  });
}

function addInitialRows() {
  productsList.innerHTML = '';
  expensesList.innerHTML = '';
  productsList.append(createProductCard());
  expensesList.append(createExpenseCard());
  updateRemovableRows(productsList);
  updateRemovableRows(expensesList);
}

function collectProducts() {
  return Array.from(productsList.children).map((card, index) => ({
    id: `product-${index + 1}`,
    businessId: 'pending',
    name: card.querySelector('[data-role="product-name"]').value.trim(),
    category: card.querySelector('[data-role="product-category"]').value.trim(),
    costPrice: Number(card.querySelector('[data-role="product-cost-price"]').value),
    sellingPrice: Number(card.querySelector('[data-role="product-selling-price"]').value),
    estimatedMonthlyUnits: Number(card.querySelector('[data-role="product-units"]').value),
    supplier:
      card.querySelector('[data-role="product-supplier"]').value.trim() || undefined,
    createdAt: new Date(),
  }));
}

function collectExpenses() {
  return Array.from(expensesList.children).map((card, index) => ({
    id: `expense-${index + 1}`,
    businessId: 'pending',
    name: card.querySelector('[data-role="expense-name"]').value.trim(),
    category: card.querySelector('[data-role="expense-category"]').value.trim(),
    amountMonthly: Number(card.querySelector('[data-role="expense-amount"]').value),
    fixed: card.dataset.fixed !== 'false',
    createdAt: new Date(),
  }));
}

function getIncompleteFieldList() {
  const missing = [];
  const staticInputs = [
    businessNameInput,
    businessIndustryInput,
    scenarioNameInput,
    projectionMonthsInput,
    taxRateInput,
    demandChangeInput,
    priceChangeInput,
    costChangeInput,
    expenseChangeInput,
  ];

  staticInputs.forEach((input) => {
    const error = validateStaticField(input);
    setFieldError(input, error);
    if (error) {
      missing.push(input.closest('.field').querySelector('span').textContent);
    }
  });

  productsList.querySelectorAll('[data-role]').forEach((input) => {
    const error = validateDynamicField(input);
    setFieldError(input, error);
    if (error) {
      missing.push(input.closest('.field').querySelector('span').textContent);
    }
  });

  expensesList.querySelectorAll('[data-role]').forEach((input) => {
    const error = validateDynamicField(input);
    setFieldError(input, error);
    if (error) {
      missing.push(input.closest('.field').querySelector('span').textContent);
    }
  });

  return Array.from(new Set(missing));
}

function buildScenarioInput() {
  const businessId = crypto.randomUUID();
  const products = collectProducts().map((product) => ({
    ...product,
    businessId,
  }));
  const expenses = collectExpenses().map((expense) => ({
    ...expense,
    businessId,
  }));

  return {
    input: {
      business: {
        id: businessId,
        name: businessNameInput.value.trim(),
        industry: businessIndustryInput.value,
        currency: 'NAD',
        createdAt: new Date(),
      },
      products,
      expenses,
      scenario: {
        id: crypto.randomUUID(),
        businessId,
        name: scenarioNameInput.value.trim(),
        priceChangePercent: Number(priceChangeInput.value),
        costChangePercent: Number(costChangeInput.value),
        demandChangePercent: Number(demandChangeInput.value),
        expenseChangePercent: Number(expenseChangeInput.value),
        createdAt: new Date(),
      },
    },
    config: {
      projectionMonths: Number(projectionMonthsInput.value),
      taxRate: Number(taxRateInput.value) / 100,
    },
  };
}

function buildUserProfile() {
  return {
    userId: auth.currentUser.uid,
    fullName: onboardingNameInput.value.trim(),
    role: onboardingRoleInput.value,
    industry: onboardingIndustryInput.value,
    financeTrackingMethod: onboardingFinanceTrackingInput.value,
  };
}

function updateReview() {
  const products = collectProducts();
  const expenses = collectExpenses();
  reviewBusiness.innerHTML = `
    <div><dt>Business name</dt><dd>${escapeHtml(businessNameInput.value || '-')}</dd></div>
    <div><dt>Business type</dt><dd>${escapeHtml(businessIndustryInput.value || '-')}</dd></div>
    <div><dt>Plan name</dt><dd>${escapeHtml(scenarioNameInput.value || '-')}</dd></div>
    <div><dt>Planning period</dt><dd>${escapeHtml(projectionMonthsInput.options[projectionMonthsInput.selectedIndex]?.text || '-')}</dd></div>
    <div><dt>Tax rate</dt><dd>${escapeHtml(formatPercent(taxRateInput.value || 0))}</dd></div>
    <div><dt>Monthly sales change</dt><dd>${escapeHtml(formatPercent(demandChangeInput.value || 0))}</dd></div>
  `;

  reviewProducts.innerHTML = products
    .map((product) => {
      const margin =
        product.sellingPrice > 0
          ? ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100
          : 0;
      return `
        <tr>
          <td>${escapeHtml(product.name || '—')}</td>
          <td>${formatDecimalCurrency(product.sellingPrice || 0)}</td>
          <td>${formatDecimalCurrency(product.costPrice || 0)}</td>
          <td>${escapeHtml(product.estimatedMonthlyUnits || 0)}</td>
          <td>${formatPercent(margin)}</td>
        </tr>
      `;
    })
    .join('');

  reviewExpenses.innerHTML = expenses
    .map(
      (expense) => `
        <tr>
          <td>${escapeHtml(expense.name || '—')}</td>
          <td>${formatDecimalCurrency(expense.amountMonthly || 0)}</td>
          <td>${expense.fixed ? 'Fixed' : 'Variable'}</td>
        </tr>
      `,
    )
    .join('');

  const missing = getIncompleteFieldList();
  if (missing.length > 0) {
    reviewWarning.hidden = false;
    reviewWarning.textContent = `Incomplete fields: ${missing.join(', ')}.`;
  } else {
    reviewWarning.hidden = true;
    reviewWarning.textContent = '';
  }
}

function updateStepUi() {
  stepPanels.forEach((panel) => {
    panel.classList.toggle('active', Number(panel.dataset.stepPanel) === currentStep);
  });

  stepItems.forEach((item) => {
    const step = Number(item.dataset.step);
    item.classList.toggle('active', step === currentStep);
    item.classList.toggle('completed', step < currentStep);
    item.querySelector('.step-circle').textContent = step < currentStep ? '✓' : String(step);
  });

  mobileStepLabel.textContent = `Step ${currentStep} of 4 • ${STEP_META[currentStep - 1].label}`;
  backButton.hidden = currentStep === 1;
  nextButton.hidden = currentStep === 4;
  runSimulationButton.hidden = currentStep !== 4;
  backButton.classList.toggle('hidden', currentStep === 1);
  nextButton.classList.toggle('hidden', currentStep === 4);
  runSimulationButton.classList.toggle('hidden', currentStep !== 4);
  nextButton.textContent = STEP_META[currentStep - 1].nextLabel || '';

  if (currentStep === 4) {
    updateReview();
  }
}

function goToStep(step) {
  currentStep = Math.min(4, Math.max(1, step));
  updateStepUi();
}

function resetBuilderForNewScenario() {
  hasRenderedResults = false;
  activeScenarioContext = null;
  goToStep(1);
  businessNameInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setFeedback(
    formFeedback,
    'You can adjust the details above and run another scenario whenever you are ready.',
    'neutral',
  );
}

function clearResultsDisplay() {
  hasRenderedResults = false;
  activeScenarioContext = null;
  resultsScenarioName.textContent = 'Saved scenarios';
  resultsBusinessName.textContent = 'Run a new simulation above or open one of your saved scenarios below.';
  resultsSummary.innerHTML = '';
  resultsTable.innerHTML = '';

  if (resultsChart) {
    resultsChart.destroy();
    resultsChart = null;
  }
}

function resetScenarioBuilder() {
  businessNameInput.value = '';
  businessIndustryInput.value = '';
  scenarioNameInput.value = 'Baseline';
  projectionMonthsInput.value = '12';
  taxRateInput.value = '20';
  demandChangeInput.value = '0';
  priceChangeInput.value = '0';
  costChangeInput.value = '0';
  expenseChangeInput.value = '0';

  addInitialRows();
  syncBusinessName();
  updateReview();
  clearResultsDisplay();
  goToStep(1);
}

function returnToBusinessHome() {
  resetScenarioBuilder();
  businessNameInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setFeedback(
    formFeedback,
    'Start a fresh scenario below whenever you are ready to test a new idea.',
    'neutral',
  );
}

function hideSignedInContent() {
  accessPendingShell.classList.add('hidden');
  onboardingShell.classList.add('hidden');
  document.querySelector('.wizard-progress').classList.add('hidden');
  document.querySelector('.app-content').classList.add('hidden');
}

function renderSummaryMetrics(result) {
  const totalTax = result.taxPaid.reduce((sum, value) => sum + value, 0);
  const totalNetCashflow = result.netCashflow.reduce((sum, value) => sum + value, 0);
  const metrics = [
    { label: 'Total Revenue', value: formatDecimalCurrency(result.revenue), tone: '' },
    {
      label: 'Total Profit',
      value: formatDecimalCurrency(result.netProfit),
      tone: result.netProfit >= 0 ? 'positive' : 'negative',
    },
    { label: 'Tax Owed', value: formatDecimalCurrency(totalTax), tone: '' },
    {
      label: 'Net Cashflow',
      value: formatDecimalCurrency(totalNetCashflow),
      tone: totalNetCashflow >= 0 ? 'positive' : 'negative',
    },
  ];

  resultsSummary.innerHTML = metrics
    .map(
      (metric) => `
        <article class="summary-metric-card">
          <p>${escapeHtml(metric.label)}</p>
          <strong class="${metric.tone}">${escapeHtml(metric.value)}</strong>
        </article>
      `,
    )
    .join('');
}

function renderChart(result) {
  if (!window.Chart) {
    return;
  }

  const labels = getMonthLabels(result.monthlyProjection.length);
  const revenue = result.monthlyProjection.map((item) => item.revenue);
  const profit = result.monthlyProjection.map((item) => item.profit);

  if (resultsChart) {
    resultsChart.destroy();
  }

  resultsChart = new window.Chart(resultsChartCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenue,
          backgroundColor: '#B4B2A9',
          borderRadius: 4,
        },
        {
          label: 'Profit',
          data: profit,
          backgroundColor: '#5DCAA5',
          borderRadius: 4,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
        },
      },
      scales: {
        y: {
          ticks: {
            callback(value) {
              if (value >= 1000) {
                return `N$${Math.round(value / 1000)}k`;
              }
              return `N$${value}`;
            },
          },
          grid: {
            color: '#E8E6E0',
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

function renderResultsTable(result) {
  resultsTable.innerHTML = result.monthlyProjection
    .map((projection, index) => {
      const profitClass = projection.profit >= 0 ? 'positive' : 'negative';
      const cashflow = result.netCashflow[index] ?? 0;
      const cashflowClass = cashflow >= 0 ? 'positive' : 'negative';
      return `
        <tr>
          <td>${projection.month}</td>
          <td>${formatDecimalCurrency(projection.revenue)}</td>
          <td class="${profitClass}">${formatDecimalCurrency(projection.profit)}</td>
          <td>${formatDecimalCurrency(result.taxPaid[index] ?? 0)}</td>
          <td>${formatDecimalCurrency(result.depreciation[index] ?? 0)}</td>
          <td class="${cashflowClass}">${formatDecimalCurrency(cashflow)}</td>
        </tr>
      `;
    })
    .join('');
}

function renderResults(input, result) {
  hasRenderedResults = true;
  activeScenarioContext = {
    businessName: input.business.name,
    scenarioName: input.scenario.name,
  };
  resultsView.classList.remove('hidden');
  resultsScenarioName.textContent = input.scenario.name;
  resultsBusinessName.textContent = input.business.name;
  topbarBusinessName.textContent = input.business.name;
  renderSummaryMetrics(result);
  renderChart(result);
  renderResultsTable(result);
}

function applyUserProfile(profile) {
  currentUserProfile = profile;
  onboardingNameInput.value = profile?.fullName || '';
  onboardingRoleInput.value = profile?.role || '';
  onboardingIndustryInput.value = profile?.industry || '';
  onboardingFinanceTrackingInput.value = profile?.financeTrackingMethod || '';
}

function renderHistory(rows) {
  currentRows = rows;
  downloadCsvButton.disabled = rows.length === 0;

  resultsView.classList.toggle('hidden', rows.length === 0 && !hasRenderedResults);

  if (rows.length === 0) {
    historyList.innerHTML =
      '<li class="saved-scenario-item"><p>Run your first simulation above to see results here.</p></li>';
    return;
  }

  historyList.innerHTML = rows
    .map((row) => {
      const netCashflow = row.result.netCashflow.reduce((sum, value) => sum + value, 0);
      const tone = netCashflow >= 0 ? 'positive' : 'negative';
      return `
        <li class="saved-scenario-item">
          <button type="button" class="saved-scenario-button" data-scenario-id="${escapeHtml(row.id)}">
            <span class="saved-scenario-copy">
              <strong>${escapeHtml(row.input?.scenario?.name || 'Scenario')}</strong>
              <span>${escapeHtml(row.businessName)} • ${escapeHtml(formatTimestamp(row.createdAt))}</span>
            </span>
            <strong class="${tone}">${formatDecimalCurrency(netCashflow)}</strong>
          </button>
        </li>
      `;
    })
    .join('');
}

function buildCsv(rows) {
  const header = [
    'businessName',
    'revenue',
    'grossProfit',
    'netProfit',
    'finalCumulativeProfit',
    'runwayMonths',
    'taxPaid',
    'depreciation',
    'netCashflow',
  ];

  const body = rows.map((row) =>
    [
      escapeCsvCell(row.businessName),
      escapeCsvCell(row.result.revenue),
      escapeCsvCell(row.result.grossProfit),
      escapeCsvCell(row.result.netProfit),
      escapeCsvCell(row.result.cumulativeProfit.at(-1) ?? 0),
      escapeCsvCell(row.result.runway),
      escapeCsvCell(row.result.taxPaid.reduce((sum, value) => sum + value, 0)),
      escapeCsvCell(row.result.depreciation.reduce((sum, value) => sum + value, 0)),
      escapeCsvCell(row.result.netCashflow.reduce((sum, value) => sum + value, 0)),
    ].join(','),
  );

  return [header.join(','), ...body].join('\n');
}

function downloadCsv() {
  const blob = new Blob([buildCsv(currentRows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildCsvFileName();
  link.click();
  URL.revokeObjectURL(url);
}

async function refreshHistory() {
  if (!auth.currentUser) {
    renderHistory([]);
    return;
  }

  const snapshot = await getDocs(
    query(collection(db, 'scenarios'), where('userId', '==', auth.currentUser.uid)),
  );
  const rows = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((left, right) => (right.createdAt?.seconds ?? 0) - (left.createdAt?.seconds ?? 0));
  renderHistory(rows);
}

async function fetchUserProfile(userId) {
  const snapshot = await getDoc(doc(db, 'userProfiles', userId));
  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

async function saveUserProfile(profile) {
  await setDoc(
    doc(db, 'userProfiles', auth.currentUser.uid),
    {
      ...profile,
      userId: auth.currentUser.uid,
      updatedAt: serverTimestamp(),
      createdAt: currentUserProfile?.createdAt || serverTimestamp(),
    },
    { merge: true },
  );
}

async function saveScenario(input, result) {
  await addDoc(collection(db, 'scenarios'), {
    userId: auth.currentUser.uid,
    businessName: input.business.name,
    input,
    result,
    createdAt: serverTimestamp(),
  });
}

function openAuthPanel(panelName) {
  const panels = {
    email: emailAuthPanel,
    phone: phoneAuthPanel,
    magic: magicLinkPanel,
  };

  Object.entries(panels).forEach(([name, panel]) => {
    const shouldOpen = name === panelName;
    panel.hidden = !shouldOpen;
    panel.classList.toggle('open', shouldOpen);
  });

  toggleEmailAuth.setAttribute('aria-expanded', String(panelName === 'email'));
}

async function handleAuthAction(action, feedbackTarget, button, loadingText) {
  setButtonLoading(button, loadingText, true);
  try {
    await action();
    setFeedback(feedbackTarget, '', 'neutral');
  } catch (error) {
    setFeedback(feedbackTarget, mapAuthError(error), 'error');
  } finally {
    setButtonLoading(button, loadingText, false);
  }
}

function syncBusinessName() {
  topbarBusinessName.textContent = businessNameInput.value.trim() || 'Scenario Builder';
}

function syncAuthStatus() {
  if (currentUserProfile?.fullName) {
    setFeedback(authStatus, `Welcome, ${currentUserProfile.fullName}`, 'neutral');
    return;
  }

  if (!auth.currentUser) {
    setFeedback(authStatus, '', 'neutral');
    return;
  }

  const user = auth.currentUser;
  const fallbackLabel =
    user.providerData[0]?.providerId === 'google.com'
      ? `Signed in with Google as ${user.displayName || user.email}`
      : `Signed in as ${user.email || user.phoneNumber || 'your account'}`;
  setFeedback(authStatus, fallbackLabel, 'neutral');
}

function syncOnboardingVisibility() {
  const isComplete = Boolean(currentUserProfile?.fullName);
  accessPendingShell.classList.add('hidden');
  onboardingShell.classList.toggle('hidden', isComplete);
  document.querySelector('.wizard-progress').classList.toggle('hidden', !isComplete);
  document.querySelector('.app-content').classList.toggle('hidden', !isComplete);
}

function syncFeedbackLink() {
  const feedbackUrl = appUiConfig.feedbackUrl?.trim();
  if (!feedbackUrl) {
    feedbackLinkButton.hidden = true;
    feedbackLinkButton.removeAttribute('href');
    return;
  }

  feedbackLinkButton.hidden = false;
  feedbackLinkButton.href = feedbackUrl;
  feedbackLinkButton.textContent = appUiConfig.feedbackLabel?.trim() || 'Share feedback';
}

function attachStaticValidation(input) {
  input.addEventListener('blur', () => {
    setFieldError(input, validateStaticField(input));
  });
}

function attachDynamicValidation(container) {
  container.addEventListener('focusout', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
      return;
    }

    if (!target.dataset.role) {
      return;
    }

    setFieldError(target, validateDynamicField(target));
  });
}

function populateBuilderFromInput(input, result) {
  businessNameInput.value = input.business.name;
  businessIndustryInput.value = input.business.industry;
  scenarioNameInput.value = input.scenario.name;
  projectionMonthsInput.value = String(result.monthlyProjection.length || 12);
  priceChangeInput.value = String(input.scenario.priceChangePercent);
  costChangeInput.value = String(input.scenario.costChangePercent);
  demandChangeInput.value = String(input.scenario.demandChangePercent);
  expenseChangeInput.value = String(input.scenario.expenseChangePercent);

  productsList.innerHTML = '';
  input.products.forEach((product) => productsList.append(createProductCard(product)));
  expensesList.innerHTML = '';
  input.expenses.forEach((expense) => expensesList.append(createExpenseCard(expense)));
  updateRemovableRows(productsList);
  updateRemovableRows(expensesList);
  syncBusinessName();
  updateReview();
}

toggleEmailAuth.addEventListener('click', () => {
  openAuthPanel(emailAuthPanel.classList.contains('open') ? '' : 'email');
});

togglePhoneAuth.addEventListener('click', (event) => {
  event.preventDefault();
  openAuthPanel(phoneAuthPanel.classList.contains('open') ? '' : 'phone');
});

toggleMagicLink.addEventListener('click', (event) => {
  event.preventDefault();
  openAuthPanel(magicLinkPanel.classList.contains('open') ? '' : 'magic');
});

emailAuthForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const emailError = validateStaticField(emailInput);
  const passwordError = validateStaticField(passwordInput);
  setFieldError(emailInput, emailError);
  setFieldError(passwordInput, passwordError);

  if (emailError || passwordError) {
    return;
  }

  await handleAuthAction(
    () => signInEmail(emailInput.value.trim(), passwordInput.value),
    emailAuthFeedback,
    loginButton,
    'Logging in...',
  );
});

signupButton.addEventListener('click', async () => {
  const emailError = validateStaticField(emailInput);
  const passwordError = validateStaticField(passwordInput);
  setFieldError(emailInput, emailError);
  setFieldError(passwordInput, passwordError);

  if (emailError || passwordError) {
    return;
  }

  await handleAuthAction(
    () => signUpEmail(emailInput.value.trim(), passwordInput.value),
    emailAuthFeedback,
    signupButton,
    'Creating...',
  );
});

emailLinkForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const error = validateStaticField(emailLinkInput);
  setFieldError(emailLinkInput, error);
  if (error) {
    return;
  }

  await handleAuthAction(
    () => sendEmailLink(emailLinkInput.value.trim()),
    emailLinkFeedback,
    emailLinkButton,
    'Sending...',
  );

  if (!emailLinkFeedback.hidden) {
    setFeedback(
      emailLinkFeedback,
      'Magic link sent. Open it in this browser to finish signing in.',
      'success',
    );
  }
});

phoneSendButton.addEventListener('click', async () => {
  const error = validateStaticField(phoneInput);
  setFieldError(phoneInput, error);
  if (error) {
    return;
  }

  await handleAuthAction(
    () => signInPhone(phoneInput.value.trim()),
    phoneAuthFeedback,
    phoneSendButton,
    'Sending...',
  );

  if (!phoneAuthFeedback.hidden) {
    setFeedback(
      phoneAuthFeedback,
      'Verification code sent. Enter it below to finish signing in.',
      'success',
    );
  }
});

phoneVerifyButton.addEventListener('click', async () => {
  const error = validateStaticField(phoneCodeInput);
  setFieldError(phoneCodeInput, error);
  if (error) {
    return;
  }

  await handleAuthAction(
    () => signInPhone(phoneInput.value.trim(), phoneCodeInput.value.trim()),
    phoneAuthFeedback,
    phoneVerifyButton,
    'Verifying...',
  );
});

googleButton.addEventListener('click', async () => {
  await handleAuthAction(signInGoogle, authGlobalFeedback, googleButton, 'Opening...');
});

signOutButton.addEventListener('click', async () => {
  await logout();
});

addProductButton.addEventListener('click', () => {
  productsList.append(createProductCard());
  updateRemovableRows(productsList);
});

addExpenseButton.addEventListener('click', () => {
  expensesList.append(createExpenseCard());
  updateRemovableRows(expensesList);
});

productsList.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.matches('.remove-link')) {
    target.closest('.entry-card')?.remove();
    updateRemovableRows(productsList);
    updateReview();
  }
});

expensesList.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.matches('.remove-link')) {
    target.closest('.entry-card')?.remove();
    updateRemovableRows(expensesList);
    updateReview();
    return;
  }

  if (target.matches('.toggle-pill')) {
    const card = target.closest('.entry-card');
    card.dataset.fixed = target.dataset.toggleValue;
    card.querySelectorAll('.toggle-pill').forEach((pill) => {
      pill.classList.toggle('active', pill === target);
    });
  }
});

attachDynamicValidation(productsList);
attachDynamicValidation(expensesList);

[
  onboardingNameInput,
  onboardingRoleInput,
  onboardingIndustryInput,
  onboardingFinanceTrackingInput,
  businessNameInput,
  businessIndustryInput,
  scenarioNameInput,
  projectionMonthsInput,
  taxRateInput,
  demandChangeInput,
  priceChangeInput,
  costChangeInput,
  expenseChangeInput,
  emailInput,
  passwordInput,
  emailLinkInput,
  phoneInput,
  phoneCodeInput,
].forEach(attachStaticValidation);

[businessNameInput, businessIndustryInput, scenarioNameInput].forEach((input) => {
  input.addEventListener('input', syncBusinessName);
});

[
  businessNameInput,
  businessIndustryInput,
  scenarioNameInput,
  projectionMonthsInput,
  taxRateInput,
  demandChangeInput,
  priceChangeInput,
  costChangeInput,
  expenseChangeInput,
].forEach((input) => {
  input.addEventListener('input', () => {
    if (currentStep === 4) {
      updateReview();
    }
  });
});

backButton.addEventListener('click', () => {
  goToStep(currentStep - 1);
});

nextButton.addEventListener('click', () => {
  goToStep(currentStep + 1);
});

onboardingForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const fields = [
    onboardingNameInput,
    onboardingRoleInput,
    onboardingIndustryInput,
    onboardingFinanceTrackingInput,
  ];

  const errors = fields.map((field) => {
    const error = validateStaticField(field);
    setFieldError(field, error);
    return error;
  });

  if (errors.some(Boolean)) {
    setFeedback(onboardingFeedback, 'Please complete all onboarding questions first.', 'error');
    return;
  }

  setButtonLoading(onboardingSubmitButton, 'Saving...', true);
  try {
    const profile = buildUserProfile();
    await saveUserProfile(profile);
    applyUserProfile(profile);
    syncAuthStatus();
    syncOnboardingVisibility();
    await refreshHistory();
    setFeedback(onboardingFeedback, '', 'neutral');
  } catch (error) {
    setFeedback(onboardingFeedback, error.message || 'Unable to save your details.', 'error');
  } finally {
    setButtonLoading(onboardingSubmitButton, 'Saving...', false);
  }
});

downloadCsvButton.addEventListener('click', downloadCsv);
runAnotherScenarioButton.addEventListener('click', resetBuilderForNewScenario);
topbarHomeButton.addEventListener('click', returnToBusinessHome);

historyList.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-scenario-id]');
  if (!trigger) {
    return;
  }

  const row = currentRows.find((item) => item.id === trigger.dataset.scenarioId);
  if (!row) {
    return;
  }

  populateBuilderFromInput(row.input, row.result);
  renderResults(row.input, row.result);
  goToStep(4);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

scenarioForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const missing = getIncompleteFieldList();

  if (missing.length > 0) {
    reviewWarning.hidden = false;
    reviewWarning.textContent = `Incomplete fields: ${missing.join(', ')}.`;
    setFeedback(
      formFeedback,
      'Please fix the highlighted fields before running the simulation.',
      'error',
    );
    return;
  }

  try {
    const { input, config } = buildScenarioInput();
    const result = runSimulation(input, config);
    renderResults(input, result);
    await saveScenario(input, result);
    await refreshHistory();
    setFeedback(formFeedback, `Simulation complete for ${input.business.name}.`, 'success');
  } catch (error) {
    setFeedback(formFeedback, error.message || 'Unable to run the simulation.', 'error');
  }
});

try {
  const result = await completeEmailLinkSignIn();
  if (result) {
    setFeedback(authGlobalFeedback, 'You are signed in with your magic link.', 'success');
  }
} catch (error) {
  setFeedback(authGlobalFeedback, mapAuthError(error), 'error');
}

observeAuthState(async (user) => {
  const isSignedIn = Boolean(user);
  authScreen.classList.toggle('hidden', isSignedIn);
  appShell.classList.toggle('hidden', !isSignedIn);

  if (!user) {
    hasRenderedResults = false;
    activeScenarioContext = null;
    currentUserProfile = null;
    resetScenarioBuilder();
    resultsView.classList.add('hidden');
    hideSignedInContent();
    setFeedback(authGlobalFeedback, 'Choose a sign-in method to continue.', 'neutral');
    return;
  }

  const hasApprovedAccess = await ensureApprovedUserAccess(user);

  if (!hasApprovedAccess) {
    currentUserProfile = null;
    resetScenarioBuilder();
    hideSignedInContent();
    accessPendingShell.classList.remove('hidden');
    const normalizedEmail = getNormalizedUserEmail(user);
    const pendingMessage = normalizedEmail
      ? `Signed in as ${normalizedEmail}. This account is waiting for private beta approval in the Firestore access list.`
      : 'This private beta currently supports approved email accounts only.';
    setFeedback(authStatus, 'Access pending', 'neutral');
    setFeedback(accessPendingFeedback, pendingMessage, 'neutral');
    setFeedback(authGlobalFeedback, '', 'neutral');
    return;
  }

  const profile = await fetchUserProfile(user.uid);
  applyUserProfile(profile);
  syncAuthStatus();
  syncOnboardingVisibility();
  setFeedback(authGlobalFeedback, '', 'neutral');
  syncBusinessName();

  if (profile?.fullName) {
    resetScenarioBuilder();
    await refreshHistory();
  } else {
    renderHistory([]);
    onboardingNameInput.focus();
  }
});

setupPhoneAuth('phone-send-button', true);
addInitialRows();
updateStepUi();
syncBusinessName();
syncFeedbackLink();
renderHistory([]);
resultsView.classList.add('hidden');
onboardingShell.classList.add('hidden');
document.querySelector('.wizard-progress').classList.add('hidden');
document.querySelector('.app-content').classList.add('hidden');
