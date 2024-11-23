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
            
            // Check if the product exists in the database
            if (!product) {
              console.error(`Product data not found for ID: ${id}`);
              return null; // Skip this product if not found
            }
    
            // Ensure the product has weight and price before using them
            const { weight = 0, price = 0, quantity = 0 } = product;
    
            if (weight === 0 || price === 0) {
              console.error(`Missing weight or price for product ID: ${id}`);
            }
    
            return {
              id,
              name: product.name,
              price,
              quantity,
              weight,
            };
          }).filter(product => product !== null); // Remove null products from the list
    
          setProducts(productsData);
          updateCartSummary(productsData);
        }
      }
    };
        fetchProducts();
  }, []);

  const updateCartSummary = (products) => {
    const totalWeight = products.reduce((acc, product) => {
      // Validate product weight and quantity before accumulating
      const weight = parseFloat(product.weight);
      const quantity = parseInt(product.quantity, 10);

      if (isNaN(weight) || isNaN(quantity)) {
        console.error(`Invalid product data: ${product.id}`, product);
        return acc; // Skip this product if data is invalid
      }

      return acc + weight * quantity;
    }, 0);

    const totalPrice = products.reduce((acc, product) => {
      const price = parseFloat(product.price);
      const quantity = parseInt(product.quantity, 10);

      if (isNaN(price) || isNaN(quantity)) {
        console.error(`Invalid product data: ${product.id}`, product);
        return acc; // Skip this product if data is invalid
      }

      return acc + price * quantity;
    }, 0);

    const productCount = products.reduce((acc, product) => acc + product.quantity, 0);

    if (!isNaN(totalWeight) && !isNaN(totalPrice)) {
      update(ref(database), {
        product_count: productCount,
        totalWeight,
        total_Price: totalPrice,
      });
    } else {
      console.error("Total weight or total price is invalid:", totalWeight, totalPrice);
    }
  };

  const incrementQuantity = async (productId) => {
    const updatedProducts = products.map((product) =>
      product.id === productId ? { ...product, quantity: product.quantity + 1 } : product
    );

    const updatedProduct = updatedProducts.find((product) => product.id === productId);
    if (isNaN(updatedProduct.quantity) || updatedProduct.quantity <= 0) {
      console.error("Invalid quantity:", updatedProduct.quantity);
      return; // Prevent update if the quantity is invalid
    }

    setProducts(updatedProducts);
    updateCartSummary(updatedProducts);

    // Update Firebase
    const productRef = ref(database, `productDetails/${productId}`);
    await update(productRef, {
      quantity: updatedProduct.quantity,
    });
  };

  const decrementQuantity = async (productId) => {
    const updatedProducts = products.map((product) =>
      product.id === productId ? { ...product, quantity: product.quantity - 1 } : product
    );

    const updatedProduct = updatedProducts.find((product) => product.id === productId);
    if (updatedProduct.quantity <= 0) {
      // Handle quantity removal
      const qrCodesRef = ref(database, `qr_codes/${productId}`);
      await remove(qrCodesRef);

      const checkoutCartRef = ref(database, `checkout_cart/${productId}`);
      await remove(checkoutCartRef);

      const filteredProducts = updatedProducts.filter((product) => product.id !== productId);
      setProducts(filteredProducts);
      updateCartSummary(filteredProducts); // Update cart summary after product removal
    } else {
      setProducts(updatedProducts);
      updateCartSummary(updatedProducts);
    }

    // Update Firebase product quantity
    const productRef = ref(database, `productDetails/${productId}`);
    await update(productRef, {
      quantity: updatedProduct.quantity,
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
            {products.length > 0 ? (
              products.map((product) => (
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
              ))
            ) : (
              <p>No products available to display</p>
            )}
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
            borderRadius: "5px",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Checkout
        </button>
      </Row>
    </Container>
  );
};

export default ScannedItems;