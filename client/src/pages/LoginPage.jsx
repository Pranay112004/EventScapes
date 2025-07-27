import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // Keep this import

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Logging in..."); // Show loading toast

    try {
      const res = await axios.post("/api/users/login", formData);
      localStorage.setItem("token", res.data.token);

      toast.success("Login successful!", { id: toastId }); // Show success toast

      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error(err.response.data);
      toast.error("Login failed. Please check your credentials.", {
        id: toastId,
      }); // Show error toast
    }
  };

  return (
    <div className="form-container">
      <h2>Login to Your Account</h2>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email Address"
          name="email"
          value={email}
          onChange={onChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={onChange}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
