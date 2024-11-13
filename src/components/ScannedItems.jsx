import React, { useState, useEffect } from "react";
import { ref, get, update, remove, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import { database } from "../FirebaseConfig";
import Header from "./Header";

const ScannedItems = () => {
  const [products, setProducts] = useState([]);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "User"); // Retrieve name from localStorage
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Displaying user name from localStorage:", userName); // Log to verify
    const fetchProducts = async () => {
      const qrCodesRef = ref(database, "qr_codes");
      const qrCodesSnapshot = await get(qrCodesRef);

      if (qrCodesSnapshot.exists()) {
        const productIDs = Object.values(qrCodesSnapshot.val());
        const productDetailsRef = ref(database, "productDetails");
        const productDetailsSnapshot = await get(productDetailsRef);

        if (productDetailsSnapshot.exists()) {
          const allProductsData = productDetailsSnapshot.val();
          const productsData = productIDs.map((id) => {
            const product = allProductsData[id];
            return {
              id,
              ...product,
              quantity: 1,
            };
          });

          setProducts(productsData);
          updateCartSummary(productsData);
        }
      }
    };
    fetchProducts();
  }, []);

  const updateCartSummary = (products) => {
    const totalWeight = products.reduce((acc, product) => acc + product.weight * product.quantity, 0);
    const totalPrice = products.reduce((acc, product) => acc + product.price * product.quantity, 0);
    const productCount = products.reduce((acc, product) => acc + product.quantity, 0);

    update(ref(database), {
      product_count: productCount,
      totalWeight,
      total_Price: totalPrice,
    });
  };

  const incrementQuantity = async (productId) => {
    const updatedProducts = products.map((product) =>
      product.id === productId ? { ...product, quantity: product.quantity + 1 } : product
    );
    setProducts(updatedProducts);
    updateCartSummary(updatedProducts);

    // Update Firebase
    const productRef = ref(database, `productDetails/${productId}`);
    await update(productRef, {
      quantity: updatedProducts.find(product => product.id === productId).quantity
    });
  };

  const decrementQuantity = async (productId) => {
    const updatedProducts = products.map((product) =>
      product.id === productId ? { ...product, quantity: product.quantity - 1 } : product
    );

    const updatedProduct = updatedProducts.find((product) => product.id === productId);

    // If quantity is zero, remove the product from Firebase and UI
    if (updatedProduct.quantity === 0) {
      // Remove product from qr_codes node
      const qrCodesRef = ref(database, `qr_codes/${productId}`);
      await remove(qrCodesRef);

      // Remove product from checkout_cart node
      const checkoutCartRef = ref(database, `checkout_cart/${productId}`);
      await remove(checkoutCartRef);

      // Filter out the product from the products array
      const filteredProducts = updatedProducts.filter((product) => product.id !== productId);
      setProducts(filteredProducts);
      updateCartSummary(filteredProducts); // Update cart summary after product removal
    } else {
      setProducts(updatedProducts);
      updateCartSummary(updatedProducts);
    }

    // Update the Firebase product quantity to reflect the decrement
    const productRef = ref(database, `productDetails/${productId}`);
    await update(productRef, {
      quantity: updatedProduct.quantity
    });
  };

  const handleCheckout = async () => {
    const checkoutData = products.map((product) => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      totalPrice: product.price * product.quantity,
      totalWeight: product.weight * product.quantity,
    }));

    const checkoutCartRef = ref(database, "checkout_cart");
    await set(checkoutCartRef, checkoutData);
    navigate("/cart");
  };

  return (
    <Container>
      <Header userName={userName} />
      <Col md={12}>
        <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
          <input
            type="text"
            placeholder="🔍 Search Items"
            style={{
              width: "70%",
              padding: "10px 20px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              outline: "none",
              fontSize: "16px",
              color: "#666",
              backgroundColor: "#fff",
            }}
          />
        </div>
      </Col>

      <Row>
        <Col md={12}>
          <div className="item" style={{ padding: "10px", width: "80%", marginLeft: "100px" }}>
            {products.map((product) => (
              <div
                key={product.id}
                className="item-card d-flex justify-content-between my-3"
                style={{ borderBottom: "1px solid #ccc", paddingBottom: "10px" }}
              >
                <div className="item-details d-flex">
                  <div className="item-image">
                    <img
                      src={`/images/${product.name.replace(/ /g, "_")}.png`}
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "images/default.png";
                      }}
                      style={{ width: "100px", height: "100px" }}
                    />
                  </div>
                  <div style={{ marginLeft: "10px" }}>
                    <p className="blueText mb-0">{product.name}</p>
                    <p className="redText">
                      {product.weight}g, ₹{product.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="quantity-control d-flex align-items-center">
                  <button
                    onClick={() => decrementQuantity(product.id)}
                    style={{
                      padding: "0 10px",
                      border: "none",
                      backgroundColor: "#228B22",
                      borderRadius: "5px",
                      margin: "0 5px",
                      color: "white",
                    }}
                  >
                    -
                  </button>
                  <span className="quantity" style={{ minWidth: "20px", textAlign: "center" }}>
                    {product.quantity}
                  </span>
                  <button
                    onClick={() => incrementQuantity(product.id)}
                    style={{
                      padding: "0 10px",
                      border: "none",
                      backgroundColor: "#228B22",
                      borderRadius: "5px",
                      margin: "0 5px",
                      color: "white",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center mt-4">
        <button
          onClick={handleCheckout}
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "20px",
            width: "400px",
          }}
        >
          Checkout
        </button>
      </Row>
    </Container>
  );
};

export default ScannedItems;
