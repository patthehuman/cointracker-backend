const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Address = require('../models/address');

const mongoServer = new MongoMemoryServer();

beforeAll(async () => {
    await mongoose.connect('mongodb://0.0.0.0:27017/cointracker', { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Address Endpoints', () => {
    it('should create a new address', async () => {
        const res = await request(app).post('/addresses').send({ address: '3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Address stored successfully.');
    });

    it('should fail creating a new address', async () => {
        const res = await request(app).post('/addresses').send({ address: 'invalid address format' });
        expect(res.statusCode).toEqual(500);
    });

    it('should fetch all addresses', async () => {
        const res = await request(app).get('/addresses');
        expect(res.statusCode).toEqual(200);
    });

    it('should fetch a specific address', async () => {
        const address = '3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd';
        const res = await request(app).get(`/addresses/${address}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.address).toEqual(address);
    });

    it('should delete a specific address', async () => {
        const address = '3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd';
        const res = await request(app).delete(`/addresses/${address}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual(`Deleted address: ${address}`);
    });

    it('should delete a specific address that is not found', async () => {
        const address = 'unspecified address';
        const res = await request(app).delete(`/addresses/${address}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual(`Address ${address} not found`);
    });

    it('should get transactions for a specific address', async () => {
        const address = '3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd';
        const res = await request(app).get(`/addresses/${address}/transactions`);
        expect(res.statusCode).toEqual(200);
    });
});

