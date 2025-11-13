import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./RegistrationPage.css";
import { registerUser } from '../../lib/auth';
import { loginUser } from '../../lib/auth';
import { supabase } from '../../../lib/supabase-client';
import { COUNTRY_CODES } from '../../lib/country-codes';

const bulletIcons = [
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="#0E76A8"/><path d="M5.5 9.5L8 12l4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect width="18" height="18" rx="9" fill="#0E76A8"/><path d="M5.5 9.5L8 12l4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect width="18" height="18" rx="9" fill="#0E76A8"/><circle cx="9" cy="9" r="4" fill="#fff"/></svg>
];

const bullets = [
  "Distinguished Research Ecosystem",
  "Competitive Fellowships & Benefits",
  "World-class Faculty & Mentorship",
];

const initialState = {
  name: "",
  email: "",
  phone: "",
  countryCode: "+91",
  password: "",
  confirmPassword: "",
};

const RegistrationPage = ({ onRegistrationSuccess, onLoginSuccess }) => {
  const [form, setForm] = useState(initialState);
  const [touched, setTouched] = useState({});
  const [warning, setWarning] = useState({});
  const [fieldErrors, setFieldErrors] = useState({}); // For field-specific errors (object)
  const [generalFormError, setGeneralFormError] = useState(""); // For general form errors (string)
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  // Validation
  const validate = {
    name: (v) => v.trim().length > 0,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    phone: (v) => /^\d{10}$/.test(v),
    password: (v) => v.length >= 6,
    confirmPassword: (v) => v === form.password,
  };

  const errorMsg = {
    name: "Name is required.",
    email: "Enter a valid email address.",
    phone: "Enter a valid phone number.",
    password: "Password must be at least 6 characters.",
    confirmPassword: "Passwords do not match.",
  };

  const fields = ["name", "email", "phone", "password", "confirmPassword"];

  // Check if previous field is valid
  const isFieldEnabled = (field) => {
    const idx = fields.indexOf(field);
    if (idx === 0) return true;
    const prev = fields[idx - 1];
    return validate[prev](form[prev]);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setWarning({});

    // Ensure error value is a string, even if empty
    const validator = validate[name];
    const newError = value && validator ? (!validator(value) ? errorMsg[name] : "") : "";
    setFieldErrors((prev) => ({
      ...prev,
      [name]: newError,
    }));

    setGeneralFormError(""); // Clear general error on input change
  };

  // Handle focus
  const handleFocus = (field) => {
    if (!isFieldEnabled(field)) {
      setWarning((prev) => ({ ...prev, [field]: true }));
    } else {
      setWarning((prev) => ({ ...prev, [field]: false }));
    }
  };

  // Form valid for registration
  const isRegistrationFormValid =
    fields.every((f) => validate[f](form[f])) &&
    fields.every((f) => !fieldErrors[f]);

  // Handle registration submit
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setGeneralFormError(""); // Clear any previous general form error

    if (form.password !== form.confirmPassword) {
      setGeneralFormError('Passwords do not match');
      return;
    }

    if (isRegistrationFormValid) {
      try {
        // Ensure no stale session is present (prevents loading another user's draft)
        await supabase.auth.signOut();

        // 1) Register user
        await registerUser({
          name: form.name,
          email: form.email,
          phone: `${form.countryCode} ${form.phone}`,
          password: form.password
        });

        // 2) Explicitly sign in as the newly registered user
        try {
          await loginUser({ username: form.email, password: form.password });
        } catch (loginErr) {
          // If auto-login fails (e.g., email confirmation required), show a helpful message
          setGeneralFormError(loginErr.message || 'Please verify your email, then login.');
          return;
        }

        // 3) Navigate only after we are sure the session belongs to the new user
        navigate('/application');
      } catch (err) {
        setGeneralFormError(err.message || 'Registration failed');
      }
    } else {
      setGeneralFormError('Please fill in all required fields correctly');
    }
  };

  // State and Handlers for Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(''); // Clear any previous login error
    try {
      await loginUser({
        username: loginUsername,
        password: loginPassword
      });
      if (onLoginSuccess) onLoginSuccess();
      else navigate('/application');
    } catch (err) {
      setLoginError(err.message || 'Invalid email/phone or password');
    }
  };

  return (
    <div className="figma-bg">
      <div className="figma-container">
        {/* Left */}
        <div className="figma-left">
          <img src="/image%202.png" alt="BML Munjal University" className="figma-logo" />
          <div className="figma-hirewise">HIREWISE</div>
          <div className="figma-adm">Admissions 2025</div>
          <h1 className="figma-heading">APPLICATIONS FOR FACULTY & STAFF POSITIONS — NOW OPEN</h1>
          <div className="figma-italic-row">
            <span className="figma-italic-bar"></span>
            <span className="figma-italic">Inspiring Research. Empowering Educators.</span>
          </div>
          <p className="figma-desc">Join BML Munjal University's thriving academic community. Advance your research, inspire the next generation, and shape the future with us.</p>
          <ul className="figma-bullets">
            {bullets.map((b, i) => (
              <li key={b}><span className="figma-bullet-icon">{bulletIcons[i]}</span>{b}</li>
            ))}
          </ul>
        </div>
        {/* Right */}
        <div className="figma-right">
          {showLogin ? (
            <div className="figma-card">
              <button className="figma-back-btn" onClick={() => setShowLogin(false)}>
                <span className="figma-login-icon"><svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M10 12l-4-4 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="3" width="12" height="10" rx="2" stroke="#fff" strokeWidth="1.5" /></svg></span>
                Back to Register
              </button>

              <div className="figma-card-title">
                <span className="figma-user-icon"><svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#0E76A8" /><path d="M10 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM6.5 15v-1a3.5 3.5 0 017 0v1" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" /></svg></span>
                Login
              </div>

              <form className="figma-form" onSubmit={handleLoginSubmit} autoComplete="off">
                <div className="figma-form-group">
                  <div className={`figma-float-label ${loginUsername ? "filled" : ""}`}>
                    <input className="figma-input" type="text" name="loginUsername" id="loginUsername" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} required autoComplete="off" placeholder=" " />
                    <label htmlFor="loginUsername">Email</label>
                  </div>
                </div>

                <div className="figma-form-group">
                  <div className={`figma-float-label ${loginPassword ? "filled" : ""}`}>
                    <input className="figma-input" type="password" name="loginPassword" id="loginPassword" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required autoComplete="off" placeholder=" " />
                    <label htmlFor="loginPassword">Password</label>
                  </div>
                </div>
                {loginError && <div className="figma-error">{loginError}</div>}
                <button className="figma-apply-btn" type="submit">
                  <span className="figma-send-icon"><svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M3 15l12-6-12-6v5l8 1-8 1v5z" fill="#fff"/></svg></span>
                  LOGIN
                </button>
              </form>
            </div>
          ) : (
            <div className="figma-card">
              <div className="figma-card-title">
                <span className="figma-user-icon"><svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#0E76A8"/><path d="M10 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM6.5 15v-1a3.5 3.5 0 017 0v1" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg></span>
                Registration Form
              </div>
              <form className="figma-form" onSubmit={handleRegistrationSubmit} autoComplete="off">
                {/* Name */}
                <div className="figma-form-group">
                  <div className={`figma-float-label ${form.name ? "filled" : ""}`}>
                    <input className="figma-input" type="text" name="name" id="name" value={form.name} onChange={handleChange} onFocus={() => handleFocus("name")} autoComplete="off" placeholder=" " />
                    <label htmlFor="name">Full Name</label>
                  </div>
                  <div className="figma-warning">{warning.name && !isFieldEnabled("name") && "⚠ Please fill out the previous field first."}</div>
                  {touched.name && fieldErrors.name && typeof fieldErrors.name === 'string' && <div className="figma-error">{fieldErrors.name}</div>}
                </div>
                {/* Email */}
                <div className="figma-form-group">
                  <div className={`figma-float-label ${form.email ? "filled" : ""}`}>
                    <input className="figma-input" type="email" name="email" id="email" value={form.email} onChange={handleChange} onFocus={() => handleFocus("email")} disabled={!isFieldEnabled("email")} autoComplete="off" placeholder=" " />
                    <label htmlFor="email">Email Address</label>
                  </div>
                  <div className="figma-warning">{warning.email && !isFieldEnabled("email") && "⚠ Please fill out the previous field first."}</div>
                  {touched.email && fieldErrors.email && typeof fieldErrors.email === 'string' && <div className="figma-error">{fieldErrors.email}</div>}
                </div>
                {/* Phone */}
                <div className="figma-form-group figma-phone-row">
                  <div className="figma-country-code">
                    <select
                      className="figma-country-select"
                      name="countryCode"
                      id="countryCode"
                      value={form.countryCode}
                      onChange={handleChange}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={`figma-float-label ${form.phone ? "filled" : ""} figma-phone-input-wrap`}>
                    <input className="figma-input figma-phone-input" type="tel" name="phone" id="phone" value={form.phone} onChange={handleChange} onFocus={() => handleFocus("phone")} disabled={!isFieldEnabled("phone")} autoComplete="off" maxLength={10} placeholder=" " />
                    <label htmlFor="phone">Mobile Number</label>
                  </div>
                </div>
                <div className="figma-warning">{warning.phone && !isFieldEnabled("phone") && "⚠ Please fill out the previous field first."}</div>
                {touched.phone && fieldErrors.phone && typeof fieldErrors.phone === 'string' && <div className="figma-error">{fieldErrors.phone}</div>}
                {/* Password */}
                <div className="figma-form-group">
                  <div className={`figma-float-label ${form.password ? "filled" : ""}`}>
                    <input className="figma-input" type="password" name="password" id="password" value={form.password} onChange={handleChange} onFocus={() => handleFocus("password")} disabled={!isFieldEnabled("password")} autoComplete="off" placeholder=" " />
                    <label htmlFor="password">Create Password</label>
                  </div>
                  <div className="figma-warning">{warning.password && !isFieldEnabled("password") && "⚠ Please fill out the previous field first."}</div>
                  {touched.password && fieldErrors.password && typeof fieldErrors.password === 'string' && <div className="figma-error">{fieldErrors.password}</div>}
                </div>
                {/* Confirm Password */}
                <div className="figma-form-group">
                  <div className={`figma-float-label ${form.confirmPassword ? "filled" : ""}`}>
                    <input className="figma-input" type="password" name="confirmPassword" id="confirmPassword" value={form.confirmPassword} onChange={handleChange} onFocus={() => handleFocus("confirmPassword")} disabled={!isFieldEnabled("confirmPassword")} autoComplete="off" placeholder=" " />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                  </div>
                  <div className="figma-warning">{warning.confirmPassword && !isFieldEnabled("confirmPassword") && "⚠ Please fill out the previous field first."}</div>
                  {touched.confirmPassword && fieldErrors.confirmPassword && typeof fieldErrors.confirmPassword === 'string' && <div className="figma-error">{fieldErrors.confirmPassword}</div>}
                </div>
                {generalFormError && <div className="figma-error">{generalFormError}</div>}
                <button className="figma-apply-btn" type="submit" disabled={!isRegistrationFormValid}>
                  <span className="figma-send-icon"><svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M3 15l12-6-12-6v5l8 1-8 1v5z" fill="#fff"/></svg></span>
                  APPLY NOW
                </button>
                <p className="auth-link">
                  Already have an account?
                  <button className="figma-login-btn-inline" type="button" onClick={() => setShowLogin(true)}>
                    LOGIN
                  </button>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
      <footer className="figma-footer">
        <div className="figma-footer-content">
          <img src="/image%202.png" alt="BML Munjal University" className="figma-footer-logo" />
          <span className="figma-footer-text">© 2024 BML Munjal University. All rights reserved.</span>
          <div className="figma-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegistrationPage;