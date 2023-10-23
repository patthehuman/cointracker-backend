const mongoose = require('mongoose');

// Bitcoin address with balance.
const addressSchema = new mongoose.Schema({
    address: { type: String, unique: true },
    n_tx: { type: Number, default: 0 },
    n_unredeemed: { type: Number, default: 0 },
    total_received: { type: Number, default: 0 },
    total_sent: { type: Number, default: 0 },
    final_balance: { type: Number, default: 0 }
});

module.exports = mongoose.model('Address', addressSchema);