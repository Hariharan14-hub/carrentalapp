import React, { useState } from "react";
import emailjs from "emailjs-com";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/authApi";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [step, setStep] = useState("email");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const generateOtp = () => {
    const otpValue = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpValue);
    const templateParams = {
      email: email,
      passcode: otpValue,
    };
    emailjs
      .send("service_1djwz5p", "template_20wa7ca", templateParams, "E-qJJI6Ukg6flO32d")
      .then(() => {
        setSuccess("OTP sent to your email!");
        setError("");
        setStep("otp");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to send OTP. Please try again.");
      });
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setSuccess("");
      setStep("password");
      setError("");
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setError("");
    const formData = { email, newPassword };
    try {
      await forgotPassword(formData);
      setSuccess("Password updated successfully! Redirecting...");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    }
    setEmail("");
    setOtp("");
    setGeneratedOtp(null);
    setNewPassword("");
    setStep("email");
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ maxWidth: "400px", margin: "auto" }}>
        <h3 className="text-center mb-4">Reset Password</h3>

        {error && <div className="alert alert-danger text-center py-2">{error}</div>}
        {success && <div className="alert alert-success text-center py-2">{success}</div>}

        {step === "email" && (
          <>
            <div className="mb-3">
              <label className="form-label">Enter Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="btn btn-primary w-100" onClick={generateOtp}>
              Generate OTP
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="mb-3">
              <label className="form-label">Enter OTP</label>
              <input
                type="text"
                className="form-control"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button className="btn btn-primary w-100" onClick={verifyOtp}>
              Verify OTP
            </button>
          </>
        )}

        {step === "password" && (
          <>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button className="btn btn-warning w-100" onClick={resetPassword}>
              Save Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;