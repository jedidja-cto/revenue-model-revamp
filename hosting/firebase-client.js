import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js';
import {
  getAnalytics,
  isSupported as analyticsSupported,
} from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAuth,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  linkWithCredential,
  onAuthStateChanged,
  reauthenticateWithCredential,
  RecaptchaVerifier,
  sendSignInLinkToEmail,
  setPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js';

const missingFirebaseConfig =
  !window.FIREBASE_CONFIG ||
  !window.FIREBASE_CONFIG.apiKey ||
  window.FIREBASE_CONFIG.apiKey.startsWith('REPLACE_WITH') ||
  !window.FIREBASE_CONFIG.appId ||
  window.FIREBASE_CONFIG.appId.startsWith('REPLACE_WITH');

if (missingFirebaseConfig) {
  document.body.innerHTML = `
    <main class="layout">
      <section class="card">
        <div class="card-header">
          <h2>Firebase setup needed</h2>
          <span class="badge">Configuration</span>
        </div>
        <p class="lede">
          Update <code>hosting/firebase-config.js</code> with your Firebase web app
          config before using the browser MVP.
        </p>
      </section>
    </main>
  `;
  throw new Error(
    'Firebase web app config is incomplete. Update hosting/firebase-config.js before using the MVP.',
  );
}

export const app = initializeApp(window.FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
let phoneConfirmationResult = null;

export const analytics = await (async () => {
  if (!window.FIREBASE_CONFIG.measurementId) {
    return null;
  }

  if (!(await analyticsSupported())) {
    return null;
  }

  return getAnalytics(app);
})();

await setPersistence(auth, browserLocalPersistence);

export function observeAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signUpEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signInAnonymous() {
  return signInAnonymously(auth);
}

export async function logout() {
  return signOut(auth);
}

export function getDefaultEmailLinkSettings() {
  return {
    url: `${window.location.origin}${window.location.pathname}`,
    handleCodeInApp: true,
  };
}

export async function sendEmailLink(email, actionCodeSettings = getDefaultEmailLinkSettings()) {
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem('emailForSignIn', email);
}

export async function completeEmailLinkSignIn() {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }

  const storedEmail = window.localStorage.getItem('emailForSignIn');
  const email = storedEmail || window.prompt('Enter your email to complete sign-in:');

  if (!email) {
    throw new Error('Email is required to complete email-link sign-in.');
  }

  const result = await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem('emailForSignIn');
  return result;
}

export function setupPhoneAuth(containerId, invisible = true) {
  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: invisible ? 'invisible' : 'normal',
    callback: () => {
      console.log('reCAPTCHA solved');
    },
  });

  return window.recaptchaVerifier;
}

export async function signInPhone(phoneNumber, verificationCode = null) {
  if (verificationCode) {
    if (!phoneConfirmationResult) {
      throw new Error('Request a phone verification code before confirming it.');
    }

    const result = await phoneConfirmationResult.confirm(verificationCode);
    phoneConfirmationResult = null;
    return result;
  }

  if (!window.recaptchaVerifier) {
    throw new Error(
      'Phone authentication is not initialized. Call setupPhoneAuth(containerId) first.',
    );
  }

  phoneConfirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    window.recaptchaVerifier,
  );

  return phoneConfirmationResult;
}

export async function linkEmailLink(email) {
  const credential = EmailAuthProvider.credentialWithLink(email, window.location.href);
  return linkWithCredential(auth.currentUser, credential);
}

export async function reauthEmailLink(email) {
  const credential = EmailAuthProvider.credentialWithLink(email, window.location.href);
  return reauthenticateWithCredential(auth.currentUser, credential);
}
