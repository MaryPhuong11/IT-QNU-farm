import { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addToCart, setCart } from "../../app/features/cart/cartSlice";
import { addCartItemAPI, getCartFromServer } from "../../app/features/cart/cartApi";
import "./product-details.css";

const ProductDetails = ({ selectedProduct }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e) => {
    setQuantity(Number(e.target.value));
  };

  const handelAdd = async (selectedProduct, quantity) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      // Nếu đã đăng nhập, gọi API backend
      try {
        await addCartItemAPI(user.id, selectedProduct.id, Number(quantity));
        const serverCart = await getCartFromServer(user.id);
        const mappedCart = (serverCart.cartList || []).map(item => ({
          id: item.product.id,
          productName: item.product.productName,
          imgUrl: item.product.imgUrl,
          price: Number(item.product.price),
          qty: item.quantity,
        }));
        dispatch(setCart(mappedCart));
        localStorage.setItem("cartList", JSON.stringify(mappedCart));
        toast.success("Product has been added to cart!");
      } catch (err) {
        toast.error("Add to cart failed!");
      }
    } else {
      // Nếu chưa đăng nhập, dùng Redux/localStorage như cũ
      dispatch(addToCart({ product: selectedProduct, num: Number(quantity) }));
      toast.success("Product has been added to cart!");
    }
  };

  if (!selectedProduct) return null;

  return (
    <section className="product-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>
            <img 
              loading="lazy" 
              src={selectedProduct.imgUrl || '/placeholder.png'} 
              alt={selectedProduct.productName} 
            />
          </Col>
          <Col md={6}>
            <h2>{selectedProduct.productName}</h2>
            <div className="rate">
              <div className="stars">
                {[...Array(5)].map((_, index) => (
                  <i 
                    key={index} 
                    className={`fa fa-star ${index < Math.round(selectedProduct.avgRating) ? 'active' : ''}`}
                  ></i>
                ))}
              </div>
              <span>{selectedProduct.avgRating?.toFixed(1) || 0} ratings</span>
            </div>
            <div className="info">
              <span className="price">${Number(selectedProduct.price).toFixed(2)}</span>
              <span>Category: {selectedProduct.category?.name}</span>
            </div>
            <p>{selectedProduct.shortDesc || selectedProduct.description}</p>
            <input
              className="qty-input"
              type="number"
              min="1"
              placeholder="Qty"
              value={quantity}
              onChange={handleQuantityChange}
            />
            <button
              aria-label="Add"
              type="submit"
              className="add"
              onClick={() => handelAdd(selectedProduct, quantity)}
            >
              Add To Cart
            </button>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ProductDetails;
