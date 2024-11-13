import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import Header from "./Header";

const ThankuScreen = () => {
  return (
    <Container fluid className="container">
      <Header />
      <Row className="h-100">
        <Col
          md={12}
          className="d-flex align-items-center justify-content-center"
        > 
          <div className="thanks">
            <h3>Thank You For Shopping !!!</h3>
            <h5>See you soon</h5>
            <p>Good Day:</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ThankuScreen;
