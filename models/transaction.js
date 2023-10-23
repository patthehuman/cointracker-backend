const mongoose = require('mongoose');

// Bitcoin address transactions
const transactionSchema = new mongoose.Schema({
    address: String,
    hash: { type: String, unique: true }, 
    ver: Number,
    vin_sz: Number,
    vout_sz: Number,
    lock_time: String,
    size: Number,
    relayed_by: String,
    block_height: Number,
    tx_index: String,
    inputs: [
        {
            prev_out: {
                hash: String,
                value: String,
                tx_index: String,
                n: String
            },
            script: String
        }
    ],
    out: [
        {
            value: String,
            hash: String,
            script: String
        }
    ]
});

module.exports = mongoose.model('Transaction', transactionSchema);