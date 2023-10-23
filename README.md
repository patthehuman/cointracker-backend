# Blockchain API Integration

A backend API system that integrates with the blockchain.info API. Built using Node.js and backed by MongoDB. The system also integrates with RabbitMQ.

## Limitations

- The Blockchain.info API appears to have rate limits relating to limit and offset queries for transactions. There is a 5 second sleep between API calls during transaction sync, however, you may run into this issue during testing.
- Blockchair.com API appears to be a paid service model.

## Features

- CRUD operations for blockchain addresses & transactions.
- Integration with `blockchain.info` API to fetch wallet & transaction details.
- RabbitMQ for transaction message synchronization.
- Test suite built with Jest.

## Endpoints

- `POST /addresses`: Create a new address.
- `DELETE /addresses/:address`: Delete an address.
- `GET /addresses/:address`: Retrieve details of a single address.
- `GET /addresses`: Get a list of all addresses.
- `GET /addresses/:address/transactions`: Fetch transactions associated with a particular address.

## Tech Stack

- **Runtime**: Node.js
- **Database**: MongoDB
- **Queue**: RabbitMQ
- **Testing**: Jest

## Dependencies

- `amqplib`: RabbitMQ client for Node.js.
- `axios`: Promise based HTTP client.
- `express`: Minimalist web framework for Node.js.

## Dev Dependencies

- `jest`: JavaScript Testing.
- `mongodb-memory-server`: Spinning up mongod in memory for fast tests.
- `mongoose`: MongoDB object modeling tool.
- `supertest`: HTTP assertions made easy via `superagent`.

## Data Models

- **Transaction**: Represents a blockchain transaction.
- **Address**: Represents a blockchain address.

## Getting Started

### Prerequisites

Ensure you have the following installed on your server:

- Node.js
- MongoDB
- RabbitMQ

### Installation

1. Clone the repository:
   ```sh
   git clone git@github.com:patthehuman/cointracker-backend.git
   ```

2. Navigate into the directory:
    ```sh
    cd cointracker-backend
    ```

3. Install the dependencies:
    ```sh
    npm install
    ```

### Running the Project

1. Start the server:
   ```sh
   node server.js
   ```

2. Start the queue consumer:
   ```sh
   node queue.js
   ```

### Running Tests

1. Execute the test suite:
   ```sh
   npm test
   ```

## Other Notes & Issues

- This project currently only supports BTC.
- This project currently does not use ES6 syntax and should be converted.
- Data input and validation for bitcoin wallet hashes.
- For all intensive purposes, lets assume that there are no users, and that this is a single user application.
- Database limitations. For the purpose of this tutorial we are using using MongoDB, however, in a real world environment we may want to consider using a relational database such as Postgres.
- We may consider breaking out the RabbitMQ connection similarly to how we break out mongo connection so we don't reconnect on each transaction synchronization
- Logging. A proper logging system is missing within this project.