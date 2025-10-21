const Product = require('../models/Product');
const User = require('../models/User');
const Activity = require('../models/Activity');
const path = require('path');
const fs = require('fs');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('seller', 'name');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    console.error('Error fetching products:', err); // Debug log
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error('Error fetching product:', err); // Debug log
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Sellers and Admins)
exports.createProduct = async (req, res, next) => {
  try {
    // Add seller to req.body
    req.body.seller = req.user.id;

    const product = await Product.create(req.body);
    
    // Log activity
    await Activity.create({
      admin: req.user.id,
      action: 'CREATE_PRODUCT',
      target: product._id,
      targetType: 'PRODUCT'
    });
    
    console.log('Product created:', product); // Debug log

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    console.error('Error creating product:', err); // Debug log
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller of product or Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if user is product seller or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // Log activity
    await Activity.create({
      admin: req.user.id,
      action: 'UPDATE_PRODUCT',
      target: product._id,
      targetType: 'PRODUCT'
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller of product or Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if user is product seller or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this product'
      });
    }

    // Use deleteOne() instead of remove() for newer Mongoose versions
    await product.deleteOne();
    
    // Log activity
    await Activity.create({
      admin: req.user.id,
      action: 'DELETE_PRODUCT',
      target: product._id,
      targetType: 'PRODUCT'
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting product:', err); // Better error logging
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + err.message
    });
  }
};

// @desc    Upload photo for product
// @route   PUT /api/products/:id/photo
// @access  Private (Seller of product or Admin)
exports.productPhotoUpload = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if user is product seller or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file'
      });
    }

    const file = req.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an image file'
      });
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return res.status(400).json({
        success: false,
        error: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`
      });
    }

    // Create custom filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `photo_${product._id}${fileExtension}`;

    // Move file from temp location to uploads directory
    const uploadPath = path.join(__dirname, '../public/uploads/', fileName);
    
    // Ensure the uploads directory exists
    const uploadDir = path.dirname(uploadPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move the file
    fs.renameSync(file.path, uploadPath);

    // Save the image path with /uploads/ prefix
    const imagePath = `/uploads/${fileName}`;
    await Product.findByIdAndUpdate(req.params.id, { image: imagePath });
    
    // Log activity
    await Activity.create({
      admin: req.user.id,
      action: 'UPDATE_PRODUCT',
      target: product._id,
      targetType: 'PRODUCT'
    });

    res.status(200).json({
      success: true,
      data: {
        image: imagePath,
        message: 'Image uploaded successfully'
      }
    });
  } catch (err) {
    console.error('Error uploading product photo:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + err.message
    });
  }
};