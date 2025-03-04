import express from 'express';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';
import {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  toggleFeaturedProduct,
  recommendedProduct,
  addComment,
  getComment,
  editComment,
  editProduct,
  searchAndFilterProducts,
  rateProduct,
  highestRatingProducts,
} from '../controllers/product.controller.js';

const router = express.Router();

router.post('/', protectRoute, adminRoute, createProduct);
router.patch('/:productId', protectRoute, adminRoute, editProduct);
router.delete('/:id', protectRoute, adminRoute, deleteProduct);
router.patch("/:id/featured", protectRoute, adminRoute, toggleFeaturedProduct);
router.get('/', protectRoute, getAllProducts);
router.get('/featured-products', protectRoute, getFeaturedProducts);
router.get("/recommendations", protectRoute, recommendedProduct);
router.get('/category/:category', protectRoute, (req, res) => {
  res.redirect(301, `/products/search?categories=${req.params.category}`);
});
router.put('/rate/:productId', protectRoute, rateProduct);
router.post('/:productId/comments', protectRoute, addComment);
router.get('/:productId/comments', protectRoute, getComment);
router.patch('/:productId/:commentId', protectRoute, editComment);
router.get('/search', searchAndFilterProducts);
router.get('/top-rated', protectRoute, highestRatingProducts);
router.get('/:id', protectRoute, getProductById);

export default router;
