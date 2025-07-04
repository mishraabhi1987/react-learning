import React, { useState } from "react";

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email) errors.email = "Email is required.";
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
    errors.email = "Invalid email address.";
  if (!form.phone) errors.phone = "Phone is required.";
  else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "")))
    errors.phone = "Phone must be 10 digits.";
  return errors;
}

function PersonalDetailsForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    localStorage.setItem("personalDetails", JSON.stringify(form));
    setSubmitted(true);
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 8,
        background: "#f9f9f9",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#333" }}>
        Personal Details Form
      </h2>
      {submitted ? (
        <div style={{ color: "green", textAlign: "center" }}>
          Thank you! Your details have been saved.
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Name:</label>
            <br />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: errors.name ? "1.5px solid #e74c3c" : "1px solid #ccc",
              }}
            />
            {errors.name && (
              <div style={{ color: "#e74c3c", fontSize: 13 }}>
                {errors.name}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Email:</label>
            <br />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: errors.email ? "1.5px solid #e74c3c" : "1px solid #ccc",
              }}
            />
            {errors.email && (
              <div style={{ color: "#e74c3c", fontSize: 13 }}>
                {errors.email}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500 }}>Phone:</label>
            <br />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 4,
                border: errors.phone ? "1.5px solid #e74c3c" : "1px solid #ccc",
              }}
            />
            {errors.phone && (
              <div style={{ color: "#e74c3c", fontSize: 13 }}>
                {errors.phone}
              </div>
            )}
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: 10,
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}

export default PersonalDetailsForm;
