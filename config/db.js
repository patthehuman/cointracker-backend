const mongoose = require('mongoose');

const connect = async () => {
    try {
        await mongoose.connect('mongodb://0.0.0.0:27017/cointracker', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connect;