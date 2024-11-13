import { Route, Routes } from "react-router-dom";
import "./App.css";
import Cart from "./components/Cart";
import ThankuScreen from "./components/ThankuScreen";
import ScannedItems from "./components/ScannedItems";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/thankuscreen" element={<ThankuScreen />} />
      <Route path="/scanneditems" element={<ScannedItems />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
