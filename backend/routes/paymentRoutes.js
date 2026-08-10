const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const CHAPA_INITIALIZE_URL = 'https://api.chapa.co/v1/transaction/initialize';
const CHAPA_VERIFY_URL = 'https://api.chapa.co/v1/transaction/verify';

const getChapaSecret = () => process.env.CHAPA_SECRET_KEY || '';

const buildCallbackUrl = (req) =>
  process.env.CHAPA_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/payments/chapa/callback`;

const buildReturnUrl = (txRef) =>
  process.env.CHAPA_RETURN_URL || `http://localhost:8082/?payment=chapa&tx_ref=${encodeURIComponent(txRef)}`;

async function verifyChapaTransaction(txRef) {
  const secretKey = getChapaSecret();
  if (!secretKey) {
    throw new Error('CHAPA_SECRET_KEY is not configured.');
  }

  const response = await fetch(`${CHAPA_VERIFY_URL}/${encodeURIComponent(txRef)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify Chapa transaction.');
  }

  return data;
}

async function markOrderPaid(txRef, verificationData) {
  const order = await Order.findOne({ paymentReference: txRef });
  if (!order) {
    return null;
  }

  order.paymentStatus = 'Paid';
  order.status = 'Confirmed';
  order.paymentReference = txRef;
  await order.save();
  return order;
}

router.post('/chapa/initiate', async (req, res) => {
  try {
    const {
      amount,
      tx_ref,
      email,
      first_name,
      last_name,
      phone_number,
      orderId,
    } = req.body;

    const secretKey = getChapaSecret();
    if (!secretKey) {
      return res.status(500).json({ success: false, message: 'CHAPA_SECRET_KEY is not configured.' });
    }

    if (!amount || !tx_ref || !email || !first_name) {
      return res.status(400).json({
        success: false,
        message: 'amount, tx_ref, email, and first_name are required to initialize Chapa payment.',
      });
    }

    const payload = {
      amount: String(amount),
      currency: 'ETB',
      email,
      first_name,
      last_name: last_name || first_name,
      phone_number: phone_number || undefined,
      tx_ref,
      callback_url: buildCallbackUrl(req),
      return_url: buildReturnUrl(tx_ref),
      customization: {
        title: 'Order Payment',
        description: `Payment for order ${tx_ref}`,
      },
    };

    const response = await fetch(CHAPA_INITIALIZE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: data.message || 'Unable to initialize Chapa payment.',
        raw: data,
      });
    }

    if (orderId || tx_ref) {
      const order = await Order.findOneAndUpdate(
        orderId ? { _id: orderId } : { paymentReference: tx_ref },
        {
          paymentMethod: 'chapa',
          paymentReference: tx_ref,
          paymentStatus: 'Pending',
        },
        { new: true }
      );

      if (!order) {
        console.warn('Chapa initialized but no order was found to attach payment metadata.');
      }
    }

    return res.status(200).json({
      success: true,
      checkout_url: data.data?.checkout_url,
      tx_ref,
      data: data.data,
    });
  } catch (error) {
    console.error('Chapa initialize error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/chapa/verify/:txRef', async (req, res) => {
  try {
    const { txRef } = req.params;
    const verification = await verifyChapaTransaction(txRef);

    if (String(verification?.data?.status || '').toLowerCase() === 'success') {
      const order = await markOrderPaid(txRef, verification);
      return res.status(200).json({ success: true, verification, order });
    }

    return res.status(200).json({ success: false, verification });
  } catch (error) {
    console.error('Chapa verify error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/chapa/callback', async (req, res) => {
  try {
    const txRef = req.query.trx_ref || req.query.tx_ref;
    if (!txRef) {
      return res.status(400).json({ success: false, message: 'trx_ref is required.' });
    }

    const verification = await verifyChapaTransaction(txRef);

    if (String(verification?.data?.status || '').toLowerCase() === 'success') {
      const order = await markOrderPaid(txRef, verification);
      return res.status(200).json({ success: true, order, verification });
    }

    return res.status(200).json({ success: false, verification });
  } catch (error) {
    console.error('Chapa callback error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;