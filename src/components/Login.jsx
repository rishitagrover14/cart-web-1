import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../FirebaseConfig";
import { ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // Ensure you are importing the shared Login.css

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Fetch the user's name from the database
      const userRef = ref(database, `users/${userId}/name`);
      const snapshot = await get(userRef);
      const userName = snapshot.exists() ? snapshot.val() : "User";

      // Store the user's name in localStorage for use in ScannedItems
      localStorage.setItem("userName", userName);

      alert("Login successful!");
      navigate("/scanneditems");
    } catch (error) {
      setError("Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-container">
      <div className="login-box">
        
        <div className="form-container">
          <h1 className="opacity">LOGIN</h1>

          {error && (
            <div className="error-alert mt-4" role="alert">
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder="USERNAME"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Logging in..." : "SUBMIT"}
            </button>
          </form>

          <p className="register-forget opacity">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Register
            </a>
          </p>
        </div>
 
      </div>
    </section>
  );
}

export default Login;
