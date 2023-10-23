
// Gobal logging for requests
exports.logger = (req, res, next) => {
    console.log(`${req.method} ${req.url} at ${new Date().toISOString()}`);
    next();
}

// Stubbed out function for user auth.
exports.authentication = (req, res, next) => {
    // TODO: User authentication
    next();
}