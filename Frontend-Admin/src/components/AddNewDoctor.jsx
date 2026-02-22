import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "./loading";
import { toast } from "react-toastify";

const AddNewDoctor = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [doctrDptmnt, setDoctrDptmnt] = useState("");
  const [doctrAvatar, setDoctrAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
  ];

  const navigateTo = useNavigate();

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // File size validation (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB limit. Please choose a smaller file.");
      e.target.value = ''; // Clear the input
      return;
    }
    
    // File type validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only PNG, JPEG, and WebP images are allowed.");
      e.target.value = ''; // Clear the input
      return;
    }
    
    // Additional filename validation
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '').substring(0, 255);
    if (sanitizedName !== file.name) {
      toast.warning("Filename contains invalid characters. It will be sanitized during upload.");
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setDoctrAvatar(file);
    };
    reader.onerror = () => {
      toast.error("Error reading file. Please try again.");
      e.target.value = ''; // Clear the input
    };
  };

  const addNewDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("aadhar", aadhar);
      formData.append("gender", gender);
      formData.append("dob", dob);
      formData.append("doctrDptmnt", doctrDptmnt);
      formData.append("password", password);
      formData.append("doctrAvatar", doctrAvatar);

      const response = await axios.post(
        "http://localhost:4000/api/v1/user/doctor/addnew",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success(response.data.message);
      navigateTo("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <Loading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <>
      <section className="page">
        <div className="container form-component add-doctor-form">
          <img src="/logo.png" alt="Life Care" className="logo" />
          <h1 className="form-title">Register a new Doctor</h1>

          <form onSubmit={addNewDoctor}>
            <div className="first-wrapper">
              <div>
                <img
                  src={avatarPreview ? `${avatarPreview}` : "/docHolder.jpg"}
                  alt="Doctor Avatar"
                />
                <input 
                  type="file" 
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={handleAvatar} 
                />
              </div>

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

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
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
                />
                <select
                  value={doctrDptmnt}
                  onChange={(e) => setDoctrDptmnt(e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departmentsArray.map((element, index) => (
                    <option value={element} key={index}>
                      {element}
                    </option>
                  ))}
                </select>
                <button type="submit">Register New Doctor</button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default AddNewDoctor;
