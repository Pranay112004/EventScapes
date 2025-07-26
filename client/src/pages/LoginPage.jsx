import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5001/api/users/login",
        formData
      );
      // Store the token in localStorage to keep the user logged in
      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      navigate("/"); // Redirect to homepage
      window.location.reload(); // Refresh to update the app state
    } catch (err) {
      console.error(err.response.data);
      alert("Login failed. Please check your credentials.");
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
