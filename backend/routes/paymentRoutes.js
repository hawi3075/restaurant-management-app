const express = require('express');
const router = express.Router();

router.post('/api/payments/telebirr/initiate', async (req, res) => {
  try {
    const { amount, reference } = req.body;
    
    // Call Telebirr Merchant API / Generate prepay ID here using your credentials
    // const telebirrResponse = await createTelebirrOrder({ amount, reference });

    return res.json({
      success: true,
      paymentUrl: process.env.TELEBIRR_WEB_CHECKOUT_URL || 'https://developerportal.ethiotelebirr.et:38443/payment/web/paygate',
      reference
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;