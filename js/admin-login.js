
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { auth, isFirebaseConfigured } from "./firebase.js";

const form = document.getElementById("admin-login-form");
const email = document.getElementById("admin-email");
const password = document.getElementById("admin-password");
const message = document.getElementById("admin-status");
const submit = document.getElementById("login-submit");
const togglePassword = document.getElementById("toggle-password");

if (!form || !email || !password || !message || !submit || !togglePassword) {
  console.error("Missing login elements:", {
    form: !!form,
    email: !!email,
    password: !!password,
    message: !!message,
    submit: !!submit,
    togglePassword: !!togglePassword,
  });
} else {
  togglePassword.addEventListener("click", () => {
    const showing = password.type === "text";
    password.type = showing ? "password" : "text";
    togglePassword.textContent = showing ? "Show password" : "Hide password";
    togglePassword.setAttribute("aria-pressed", String(!showing));
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.replace("./admin-dashboard.html");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    submit.disabled = true;
    submit.textContent = "SIGNING IN…";

    try {
      if (!isFirebaseConfigured) {
        throw new Error("Firebase configuration is incomplete.");
      }

      await signInWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value
      );

      window.location.replace("./admin-dashboard.html");
    } catch (error) {
      console.error("Firebase sign-in error:", error);

      const errors = {
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Wait before trying again.",
        "auth/network-request-failed": "Network error. Check your internet connection.",
        "auth/unauthorized-domain": "Add 127.0.0.1 to Firebase Authentication's authorised domains.",
        "auth/operation-not-allowed": "Enable Email/Password sign-in in Firebase Authentication.",
      };

      message.textContent =
        errors[error.code] || error.message || "Sign-in failed.";
    } finally {
      submit.disabled = false;
      submit.textContent = "SIGN IN SECURELY →";
    }
  });
}
