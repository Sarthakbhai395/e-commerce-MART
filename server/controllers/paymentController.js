const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_1DP5mmOlF5G5ag' // In production, use your secret key
});

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Public
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Create the expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_test_1DP5mmOlF5G5ag')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    // Verify the signature
    const isVerified = expectedSignature === razorpay_signature;
    
    if (isVerified) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed: ' + err.message
    });
  }
};

// @desc    Create Razorpay order
// @route   POST /api/payment/order
// @access  Public
exports.createOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }
    
    // Create order options
    const options = {
      amount: Math.round(amount * 100), // Convert to paise and round to avoid floating point issues
      currency,
      receipt: 'receipt_' + Date.now()
    };
    
    // Create order using Razorpay SDK
    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    console.error('Order creation error:', err);
    // Log more detailed error information
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      description: err.description
    });
    
    res.status(500).json({
      success: false,
      error: 'Order creation failed: ' + err.message
    });
  }
};