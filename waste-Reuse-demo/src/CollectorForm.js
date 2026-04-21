// ============================================================
// CollectorForm.js
// Registration form for collectors/upcyclers.
//
// PROPS:
//   onRegister(collectorData) — called when form is submitted
//   onClose()                 — called when user closes the form
// ============================================================

import { useState } from "react";

// Waste type checkboxes the collector can select
const WASTE_TYPES = [
  "Plastic", "Glass", "Paper", "Metal",
  "Clothes", "Electronics", "Wood", "Food waste"
];

// Collector type options
const COLLECTOR_TYPES = [
  "Individual collector",
  "Upcycle / Craft",
  "Resell",
  "Compost",
  "Donate",
  "Industrial recycler",
  "NGO",
];

// Icon picked automatically based on collector type
const TYPE_ICONS = {
  "Individual collector": "🙋",
  "Upcycle / Craft":      "🎨",
  "Resell":               "🏪",
  "Compost":              "🌿",
  "Donate":               "🤝",
  "Industrial recycler":  "🏭",
  "NGO":                  "♻️",
};

function CollectorForm({ onRegister, onClose }) {

  // ── Form field state ────────────────────────────────────────
  const [name,        setName]        = useState("");
  const [phone,       setPhone]       = useState("");
  const [address,     setAddress]     = useState("");
  const [city,        setCity]        = useState("");
  const [pincode,     setPincode]     = useState("");
  const [type,        setType]        = useState("");
  const [wasteTypes,  setWasteTypes]  = useState([]); // array of selected types
  const [description, setDescription] = useState("");

  // ── UI state ────────────────────────────────────────────────
  const [errors,    setErrors]    = useState({});  // validation errors
  const [submitted, setSubmitted] = useState(false); // show success screen

  // Toggle a waste type checkbox on/off
  const toggleWasteType = (w) => {
    setWasteTypes((prev) =>
      prev.includes(w)
        ? prev.filter((x) => x !== w)   // remove if already selected
        : [...prev, w]                   // add if not selected
    );
  };

  // Validate all fields before submitting
  const validate = () => {
    const e = {};
    if (!name.trim())    e.name    = "Name is required";
    if (!phone.trim())   e.phone   = "Phone number is required";
    else if (!/^\d{10}$/.test(phone.trim())) e.phone = "Enter a valid 10-digit number";
    if (!address.trim()) e.address = "Address is required";
    if (!city.trim())    e.city    = "City is required";
    if (!pincode.trim()) e.pincode = "PIN code is required";
    else if (!/^\d{6}$/.test(pincode.trim())) e.pincode = "Enter a valid 6-digit PIN";
    if (!type)           e.type    = "Please select a collector type";
    if (wasteTypes.length === 0) e.wasteTypes = "Select at least one waste type";
    return e;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // stop page reload

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors); // show errors
      return;
    }

    // Build the collector object (same shape as existing collectors array)
    const newCollector = {
      name:     name.trim(),
      type:     type,
      address:  `${address.trim()}, ${city.trim()} ${pincode.trim()}`,
      distance: "Just registered",
      phone:    phone.trim(),
      icon:     TYPE_ICONS[type] || "♻️",
      wasteTypes,
      description: description.trim(),
      isNew: true,  // flag so we can show a "New" badge
    };

    onRegister(newCollector); // send up to App.js
    setSubmitted(true);       // show success screen
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="form-success">
            <div className="success-icon">🌱</div>
            <h3>You're listed!</h3>
            <p>
              Thank you <strong>{name}</strong>! Your profile is now visible
              in the Nearby Services section. People can contact you directly.
            </p>
            <button className="btn-primary" onClick={onClose}>
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM ────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation so clicking inside the form doesn't close it */}
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Register as a Collector</h2>
            <p className="modal-subtitle">
              Let people in your area find and contact you
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="collector-form">

          {/* ── ROW 1: Name + Phone ── */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name / Organisation *</label>
              <input
                className={`form-input ${errors.name ? "input-error" : ""}`}
                type="text"
                placeholder="e.g. Priya Sharma or GreenMakers NGO"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
              />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <div className="phone-input-wrap">
                <span className="phone-prefix">+91</span>
                <input
                  className={`form-input phone-input ${errors.phone ? "input-error" : ""}`}
                  type="tel"
                  placeholder="10-digit number"
                  value={phone}
                  maxLength={10}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/, "")); // digits only
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                />
              </div>
              {errors.phone && <span className="error-msg">{errors.phone}</span>}
            </div>
          </div>

          {/* ── Address ── */}
          <div className="form-group">
            <label className="form-label">Street Address *</label>
            <input
              className={`form-input ${errors.address ? "input-error" : ""}`}
              type="text"
              placeholder="House / Shop no., Street, Area"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrors((prev) => ({ ...prev, address: "" }));
              }}
            />
            {errors.address && <span className="error-msg">{errors.address}</span>}
          </div>

          {/* ── ROW 2: City + PIN ── */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                className={`form-input ${errors.city ? "input-error" : ""}`}
                type="text"
                placeholder="e.g. Mumbai"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setErrors((prev) => ({ ...prev, city: "" }));
                }}
              />
              {errors.city && <span className="error-msg">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">PIN Code *</label>
              <input
                className={`form-input ${errors.pincode ? "input-error" : ""}`}
                type="text"
                placeholder="6-digit PIN"
                value={pincode}
                maxLength={6}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/, ""));
                  setErrors((prev) => ({ ...prev, pincode: "" }));
                }}
              />
              {errors.pincode && <span className="error-msg">{errors.pincode}</span>}
            </div>
          </div>

          {/* ── Collector Type ── */}
          <div className="form-group">
            <label className="form-label">What do you do with collected items? *</label>
            <select
              className={`form-input form-select ${errors.type ? "input-error" : ""}`}
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setErrors((prev) => ({ ...prev, type: "" }));
              }}
            >
              <option value="">— Select type —</option>
              {COLLECTOR_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.type && <span className="error-msg">{errors.type}</span>}
          </div>

          {/* ── Waste Types (checkboxes) ── */}
          <div className="form-group">
            <label className="form-label">What waste do you collect? * (select all that apply)</label>
            <div className="waste-chips">
              {WASTE_TYPES.map((w) => (
                <button
                  key={w}
                  type="button"   // important! prevents form submit
                  className={`waste-chip ${wasteTypes.includes(w) ? "waste-chip-active" : ""}`}
                  onClick={() => {
                    toggleWasteType(w);
                    setErrors((prev) => ({ ...prev, wasteTypes: "" }));
                  }}
                >
                  {wasteTypes.includes(w) ? "✓ " : ""}{w}
                </button>
              ))}
            </div>
            {errors.wasteTypes && <span className="error-msg">{errors.wasteTypes}</span>}
          </div>

          {/* ── Description (optional) ── */}
          <div className="form-group">
            <label className="form-label">
              Short Description <span className="optional-label">(optional)</span>
            </label>
            <textarea
              className="form-input form-textarea"
              placeholder="Tell people what you do, your availability, or any special instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* ── Submit ── */}
          <button type="submit" className="btn-primary form-submit-btn">
            Register Now →
          </button>

        </form>
      </div>
    </div>
  );
}

export default CollectorForm;