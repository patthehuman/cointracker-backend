const axios = require('axios');
const Address = require('../models/address');
const Transaction = require('../models/transaction');
const amqp = require('amqplib');

// Create a new address. Will upsert existing address and insert/synchronize transactions.
exports.createAddress = async (req, res) => {
    
    // Extract address from the body
    const { address } = req.body;

    // TODO: Validate input parameter. Can be base58 or hash160
    if(!address) {
        return res.status(500).json({ message: 'Invalid address hash.' });
    }

    try {
        const response = await axios.get(`https://blockchain.info/rawaddr/${address}`);

        const upsertAddress = await Address.findOneAndUpdate(
            { address: address },
            response.data,
            { upsert: true, new: true, lean: true }
        );

        // Due to blockchain.info limitations, and for the purposes of this project, we need to sleep in between API calls
        // 500 ms sleep then close connection
        await sleep(10000);

        // Synchronize transactions via RabbitMQ.
        queueSyncTransactions(address);

        return res.json(upsertAddress);

    } catch (error) {
        console.error('Error creating address:', error);
        return res.status(500).json({ message: 'Failed to create address' });
    }
};


// Logic to get all addresses in system
// TODO: Add limit and offset.
exports.getAllAddresses = async (req, res) => {
    try {
        const addresses = await Address.find(); // Fetch all addresses
        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Failed to fetch addresses' });
    }
};


// Deletes an address by address hash.
exports.deleteAddress = async (req, res) => {
    try {
        const { address } = req.params; // Extract address from request parameters
        const result = await Address.deleteOne({ address: address });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: `Address ${address} not found` });
        }

        // delete transactions
        await Transaction.deleteMany({address: address});

        res.json({ message: `Deleted address: ${address}` });

    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Failed to delete address' });
    }
};

// Gets an address by address hash.
exports.getAddress = async (req, res) => {
    try {
        const { address } = req.params; // Extract address from request parameters
        const foundAddress = await Address.findOne({ address: address });

        if (!foundAddress) {
            res.status(404).json({ message: `Address ${address} not found` });
        } else {
            res.json(foundAddress);
        }

    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ message: 'Failed to fetch address' });
    }
};


// Gets a list of transactions by specified wallet hash.
exports.getAddressTransactions = async (req, res) => {
    try {
        const { address } = req.params; // Extract address from request parameters
        const foundTransactions = await Transaction.find({ address: address });
        res.json(foundTransactions);
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ message: `Failed to fetch transactions for ${address}` });
    }
};


// Synchronizes transcations for given address. Not used in router.
exports.synchronizeTransactions = async (data) => {
    
    try {
        const address = data.address;
        const foundAddress = await Address.findOne({ address: address });

        if (!foundAddress) {
            console.log(`Unable to synchronize transactions for ${address}. Address not found.`);
            return
        }

        // find transactions.
        const transactions = await Transaction.find({ address: address });

        // Synchronize all or begin from last transaction count
        let offset = (transactions.length == 0) ? 0 : foundAddress.n_tx;

        //response.data.n_tx
        let allTransactions = await getAllTransactions(address, offset);

        // TODO: Use a mongo transaction to rollback on failure
        await collection.insertMany(allTransactions);
    } catch (error) {
        console.error('Error fetching address:', error);
    }

};



// Adds queue message to synchronize transactions.
// TODO: Break out connection into top level so we dont connect and reconnect on each transaction sync.
async function queueSyncTransactions(address) {
    try {
        const connection = await amqp.connect('amqp://localhost:5672');
        const channel = await connection.createChannel();

        if (!connection) {
            console.error('Failed to establish connection with RabbitMQ.');
            return;
        }

        const queue = 'addressQueue';
        const msg = JSON.stringify({address: address});

        await channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(msg));

        console.log(`[x] Sent ${msg}`);

        // 500 ms sleep then close connection
        await sleep(500); 
        connection.close();

    } catch (error) {
        console.error("Error producing message:", error);
    }
}

// function to retrieve all transactions from blockchain.info and return [Transaction] for databse insert
async function getAllTransactions(address, totalTxns) {
    const baseURL = `https://blockchain.info/rawaddr/${address}`;
    const limit = 50;
    let offset = totalTxns;
    let allTransactions = [];

    while(true) {
        console.log(`Getting transactions for ${address} at offset: ${offset}`);

        try {
            const response = await axios.get(baseURL, {
                params: {
                    limit: limit,
                    offset: offset
                }
            });

            var transactions = response.data.txs;
    
            if(transactions.length === 0) {
                // No more transactions
                break;
            }

            // Map the address to the transactions.
            transactions = transactions.map((transaction) => { 
                transaction.address = address;
                return transaction;
            });
    
            allTransactions = allTransactions.concat(transactions)
            offset += limit;
    
            // avoid rate limites on blockchain.info. 
            // see: https://www.blockchain.com/explorer/api/q
            // "Please limit your queries to a maximum of 1 every 10 seconds."
            await sleep(10000); // 10 seconds
        } catch(e) {
            console.log("Error getting transaction details. Possible rate limit.")
            break
        }
    }

    return allTransactions;
}

// Helper function to sleep using await.
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}