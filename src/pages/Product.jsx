import { Fragment, useEffect, useState } from "react";
import Banner from "../components/Banner/Banner";
import { Container } from "react-bootstrap";
import ShopList from "../components/ShopList";
import { useParams } from "react-router-dom";
import ProductDetails from "../components/ProductDetails/ProductDetails";
import ProductReviews from "../components/ProductReviews/ProductReviews";
import useWindowScrollToTop from "../hooks/useWindowScrollToTop";
import { productService } from "../services/productService";
import Loader from "../components/Loader/Loader";
import { toast } from "react-toastify";

const Product = () => {
  const { id } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const product = await productService.getProductById(id);
        setSelectedProduct(product);
        // Lấy tất cả sản phẩm để lọc sản phẩm liên quan
        const allProducts = await productService.getAllProducts();
        setRelatedProducts(
          allProducts.filter(
            (item) =>
              item.category === product.category &&
              String(item.id) !== String(product.id)
          )
        );
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error("Không thể tải sản phẩm");
      }
    };
    fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  useWindowScrollToTop();

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;
  if (!selectedProduct) return <div>Không tìm thấy sản phẩm</div>;

  return (
    <Fragment>
      <Banner title={selectedProduct?.productName || selectedProduct?.name} />
      <ProductDetails selectedProduct={selectedProduct} />
      <ProductReviews selectedProduct={selectedProduct} />
      <section className="related-products">
        <Container>
          <h3>You might also like</h3>
        </Container>
        <ShopList productItems={relatedProducts} />
      </section>
    </Fragment>
  );
};

export default Product;
