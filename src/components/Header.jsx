import React from "react";
import { cart, downArrow, location, profile } from "../image";

const Header = ({ userName }) => {
  return (
    <div className="header">
      <div className="profile-btn">
        <div>
          <img src={profile} alt="profile" style={{ height: "70px", width: "70px" }} />
        </div>
        <div className="greeting-msg">
          <p>Good Morning</p>
          <h5>{userName}</h5> {/* Display dynamic user name */}
        </div>
      </div>
      <div className="cart-icon">
        <img src={cart} alt="cart"/>
      </div>
      <div className="cart-location">
        <div className="cart-child">
          <img src={location} alt="location"/>
          <p>Cart-5</p>
          <img src={downArrow} alt="down-arrow"/>
        </div>
      </div>
    </div>
  );
};

export default Header;
