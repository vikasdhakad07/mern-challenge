import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  category: String // Add any other fields from the JSON data
});

const Product = mongoose.model('Product', productSchema);

export default Product;
