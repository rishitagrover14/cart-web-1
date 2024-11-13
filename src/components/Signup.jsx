import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../FirebaseConfig";
import { ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Ensure you are importing the shared Login.css

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name || !email || !mobile || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Save additional user data to Firebase Realtime Database
      await set(ref(database, `users/${userId}`), {
        name,
        email,
        mobile,
      });

      alert("Signup successful!");
      navigate("/login"); // Redirect to login page after signup
    } catch (error) {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-container">
      <div className="login-box">
        
        <div className="form-container">
          <h1 className="opacity">SIGN UP</h1>
          
          {error && (
            <div className="error-alert mt-4" role="alert">
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSignup}>
            <div className="input-group">
              <input
                type="text"
                placeholder="NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="tel"
                placeholder="MOBILE NUMBER"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="opacity" disabled={loading}>
              {loading ? "Signing up..." : "SIGN UP"}
            </button>
          </form>
          
          <p className="register-forget opacity">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">Log in</a>
          </p>
        </div>
        
      </div>
    </section>
  );
}

export default Signup;
