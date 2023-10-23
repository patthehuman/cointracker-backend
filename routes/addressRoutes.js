const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// Address routes
router.post('/addresses', addressController.createAddress); // Create new Address
router.delete('/addresses/:address', addressController.deleteAddress); // Delete addres
router.get('/addresses/:address', addressController.getAddress); // Get single address
router.get('/addresses', addressController.getAllAddresses); // Get list of all addresses
router.get('/addresses/:address/transactions', addressController.getAddressTransactions); // Get address transactions

module.exports = router;