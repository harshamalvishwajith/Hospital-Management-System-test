import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");

  const navigateTo = useNavigate();

  // Function to get border color for confirm password field
  const getConfirmPasswordBorderColor = () => {
    if (confirmPassword.length === 0) return '';
    return password === confirmPassword ? 'green' : 'red';
  };

  // Function to validate password strength
  const validatePasswordStrength = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return regex.test(password);
  };

  // Function to get password border color
  const getPasswordBorderColor = () => {
    if (password.length === 0) return '';
    if (password.length < 8) return 'red';
    if (!validatePasswordStrength(password)) return 'orange';
    return 'green';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    // Check if password is at least 8 characters
    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters!");
      return;
    }

    // Check password strength
    if (!validatePasswordStrength(password)) {
      toast.error("Password must contain uppercase, lowercase, number and special character");
      return;
    }
    
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/patient/register",
        {
          firstName,
          lastName,
          email,
          phone,
          password,
          gender,
          aadhar,
          dob,
          role: "Patient",
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(response.data.message);
      setIsAuthenticated(true);
      navigateTo("/");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }
  return (
    <div className="container form-component register-form">
      <h2>Sign Up</h2>
      <p>Please Signup to Continue</p>
      <p>
        Get Started Fill out the form below to create your Life Care Hospital
        account. Your information is safe with us, and we are committed to
        maintaining your privacy and security.
      </p>

      <form onSubmit={handleRegister}>
        <div>
          <input
            type="text"
            value={firstName}
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            value={lastName}
            placeholder="Last Name"
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div>
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="number"
            value={phone}
            placeholder="Phone"
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <input
            type="number"
            value={aadhar}
            placeholder="Aadhar Number"
            onChange={(e) => setAadhar(e.target.value)}
          />
          <input
            type="date"
            value={dob}
            placeholder="Date of Birth"
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <div>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
          </select>

          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            style={{
              borderColor: getPasswordBorderColor()
            }}
          />
            
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setconfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            style={{
              borderColor: getConfirmPasswordBorderColor()
            }}
          />
        </div>

        {password.length > 0 && password.length < 8 && (
          <p style={{ color: 'red', fontSize: '12px', margin: '5px 0' }}>
            Password must contain at least 8 characters
          </p>
        )}

        {password.length >= 8 && !validatePasswordStrength(password) && (
          <p style={{ color: 'orange', fontSize: '12px', margin: '5px 0' }}>
            Password must contain uppercase, lowercase, number and special character (@$!%*?&)
          </p>
        )}

        {password.length >= 8 && validatePasswordStrength(password) && (
          <p style={{ color: 'green', fontSize: '12px', margin: '5px 0' }}>
            Strong password ✓
          </p>
        )}

        {confirmPassword.length > 0 && password !== confirmPassword && (
          <p style={{ color: 'red', fontSize: '12px', margin: '5px 0' }}>
            Passwords do not match
          </p>
        )}

        {confirmPassword.length > 0 && password === confirmPassword && password.length >= 8 && validatePasswordStrength(password) && (
          <p style={{ color: 'green', fontSize: '12px', margin: '5px 0' }}>
            Passwords match ✓
          </p>
        )}

        <div
          style={{
            gap: "10px",
            justifyContent: "flex-end",
            flexDirection: "row",
          }}
        >
          <p style={{ marginBottom: 0 }}>Already Registered?</p>
          <Link
            to={"/login"}
            style={{ textDecoration: "none", alignItems: "center" }}
          >
            Login Now
          </Link>
        </div>
        <div style={{ justifyContent: "center", alignItems: "center" }}>
          <button type="submit">Register</button>
        </div>
      </form>
    </div>
  );
};

export default Register;
