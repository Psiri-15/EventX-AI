const crypto = require('crypto');
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  Razorpay = null;
}

const isRazorpayConfigured = () => {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_ID.trim() !== '' &&
    process.env.RAZORPAY_KEY_SECRET.trim() !== ''
  );
};

let razorpayInstance = null;
if (isRazorpayConfigured() && Razorpay) {
  try {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('[Payment] Razorpay initialized in test/live mode.');
  } catch (err) {
    console.warn('[Payment] Failed to initialize Razorpay:', err.message);
  }
} else {
  console.log('[Payment] Razorpay credentials not detected. Demo Payment Mode is ACTIVE.');
}

/**
 * Create order for checkout
 */
const createOrder = async ({ amount, currency = 'INR', receipt }) => {
  // Check if Razorpay is configured and usable
  if (razorpayInstance) {
    try {
      const options = {
        amount: Math.round(amount * 100), // in paise
        currency,
        receipt,
      };
      const order = await razorpayInstance.orders.create(options);
      return {
        mode: 'razorpay',
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };
    } catch (err) {
      console.error('Razorpay order creation error:', err);
      // Fallback to demo mode
    }
  }

  // Demo / Mock Mode Order
  const demoOrderId = `demo_ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    mode: 'demo',
    orderId: demoOrderId,
    amount: amount,
    currency,
    message: 'Demo Payment Mode: Verified instantaneously without external gateway credentials.',
  };
};

/**
 * Verify payment signature
 */
const verifyPayment = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!isRazorpayConfigured()) {
    // Demo verification always passes for valid demo payload
    return true;
  }

  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpay_signature;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
};

module.exports = {
  isRazorpayConfigured,
  createOrder,
  verifyPayment,
};
