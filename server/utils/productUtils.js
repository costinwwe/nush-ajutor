/**
 * Get featured products 
 * @param {Array} products - All products
 * @param {Number} limit - Number of products to return
 * @returns {Array} - Featured products
 */
exports.getFeaturedProducts = (products, limit = 8) => {
  return products
    .filter(product => product.featured)
    .slice(0, limit);
};

/**
 * Get new arrival products
 * @param {Array} products - All products
 * @param {Number} limit - Number of products to return
 * @returns {Array} - New arrival products
 */
exports.getNewArrivals = (products, limit = 8) => {
  return products
    .filter(product => product.isNew)
    .slice(0, limit);
};

/**
 * Get products on sale (with discount > 0)
 * @param {Array} products - All products
 * @param {Number} limit - Number of products to return
 * @returns {Array} - Products on sale
 */
exports.getProductsOnSale = (products, limit = 8) => {
  return products
    .filter(product => product.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, limit);
};

/**
 * Get best selling products (based on number of reviews)
 * @param {Array} products - All products
 * @param {Number} limit - Number of products to return
 * @returns {Array} - Best selling products
 */
exports.getBestSellers = (products, limit = 8) => {
  return products
    .sort((a, b) => b.numReviews - a.numReviews)
    .slice(0, limit);
}; 