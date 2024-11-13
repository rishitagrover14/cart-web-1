import React from "react";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";

function LandingPage() {
  const navigate = useNavigate();

  const handleShopNowClick = () => {
    navigate("/login");
  };

  return (
    <Container className="text-center mt-5">
      <Row className="align-items-center">
        <Col xs={12} md={4} className="d-flex justify-content-center">
          {/* Use relative path for images in the public folder */}
          <img src="/images/cart.svg" alt="cart" />
        </Col>
        <Col xs={12} md={4} className="text-center">
          <h1>Cartified</h1>
          <p>Shopping made smart</p>
        </Col>
        <Col xs={12} md={4} className="d-flex justify-content-center">
          <button
            onClick={handleShopNowClick}
            className="start-shopping-btn"
          >
            Start Shopping
          </button>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col className="d-flex justify-content-center">
          {/* Use relative path for images in the public folder */}
          <img src="/images/groceries.svg" alt="Groceries" className="groceries-image" />
        </Col>
      </Row>
    </Container>
  );
}

export default LandingPage;
