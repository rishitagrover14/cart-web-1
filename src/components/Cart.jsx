import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import { ref, get } from "firebase/database";
import { database } from "../FirebaseConfig";
import Header from "./Header";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "User");
  const navigate = useNavigate(); // Create navigate function

  useEffect(() => {
    const fetchCartData = async () => {
      const checkoutCartRef = ref(database, "checkout_cart");
      const productDetailsRef = ref(database, "productDetails");
      const userRef = ref(database, "users"); // Assuming user data is stored here

      const [cartSnapshot, productDetailsSnapshot, userSnapshot] = await Promise.all([
        get(checkoutCartRef),
        get(productDetailsRef),
        get(userRef)
      ]);

      if (cartSnapshot.exists() && productDetailsSnapshot.exists() && userSnapshot.exists()) {
        const cartData = cartSnapshot.val();
        const productDetailsData = productDetailsSnapshot.val();
        const userData = userSnapshot.val();

        const userId = localStorage.getItem("userId"); // Retrieve user ID from localStorage (or any other method)
        const user = userData[userId];
        setUserName(user ? user.name : "User");

        const cartItemsWithDetails = cartData.map((item) => {
          const productDetail = productDetailsData[item.id];
          return {
            ...item,
            weight: productDetail ? productDetail.weight : 0,
            price: productDetail ? productDetail.price : item.price,
            image: productDetail ? `/images/${productDetail.name.replace(/ /g, "_")}.png` : "images/default.png"
          };
        });

        setCartItems(cartItemsWithDetails);

        const total = cartItemsWithDetails.reduce(
          (acc, item) => {
            acc.totalPrice += item.price * item.quantity;
            acc.totalWeight += item.weight * item.quantity;
            return acc;
          },
          { totalPrice: 0, totalWeight: 0 }
        );

        setTotalPrice(total.totalPrice);
        setTotalWeight(total.totalWeight);
      }
    };

    fetchCartData();
  }, []);

  const handlePayment = () => {
    navigate("/thankuscreen"); // Navigate to ThankuScreen
  };

  return (
    <Container>
      <Header userName={userName} />
      <Row>
        <Link to="/scanneditems" className="continue-shopping">
          ← Continue Shopping
        </Link>
        <Col md={7}>
          <div className="item" style={{ height: "relative" }}>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="item-card d-flex justify-content-between my-4">
                  <div className="item-details d-flex">
                    <div className="item-image">
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: "50px", height: "50px" }}
                      />
                    </div>
                    <div style={{ marginLeft: "10px" }}>
                      <p className="blueText mb-0">{item.name}</p>
                      <p className="redText">
                        {item.weight}g, ${item.price.toFixed(2)} each
                      </p>
                      <p className="quantity">Quantity: {item.quantity}</p>
                      <p className="total">
                        Total: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Your cart is empty.</p>
            )}
          </div>
        </Col>

        <Col md={5}>
          <div className="cart-summary" style={{ height: "300px" }}>
            <div className="total d-flex justify-content-between">
              <p>Subtotal</p>
              <p>${totalPrice.toFixed(2)}</p>
            </div>
            <div className="total d-flex justify-content-between">
              <p>GST (18%)</p>
              <p>${(totalPrice * 0.18).toFixed(2)}</p>
            </div>
            <div className="total d-flex justify-content-between">
              <p>Total</p>
              <p>${(totalPrice + totalPrice * 0.18).toFixed(2)}</p>
            </div>
            <button
              className="pay-btn"
              style={{
                padding: "10px 20px",
                border: "none",
                backgroundColor: "green",
                color: "white",
                borderRadius: "20px",
              }}
              onClick={handlePayment} // Trigger payment and navigation
            >
              Pay Now →
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
