const amqp = require('amqplib');
const connectDB = require('./config/db');
const addressController = require('./controllers/addressController');

async function consume() {
    try {
        const connection = await amqp.connect('amqp://localhost:5672');
        const channel = await connection.createChannel();

        if (!connection) {
            console.error('Failed to establish connection with RabbitMQ.');
            return;
        }

        const queue = 'addressQueue';

        await channel.assertQueue(queue, { durable: false });
        console.log(`[*] Waiting for messages in ${queue}.`);

        channel.consume(queue, (msg) => {
            console.log(`[x] Received ${msg.content.toString()}`);
            let data = JSON.parse(msg.content);
            addressController.synchronizeTransactions(data);
        }, {
            noAck: true
        });
    } catch (error) {
        console.error("Error consuming message:", error);
    }
}

connectDB();
consume();
