module.exports = (requestHandler) => {
    return (req, res, next) => {
        console.log("Middleware next:", typeof next);
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => {
                console.log("Caught error:", err);
                console.log("Error stack:", err.stack);
                next(err);
            });
    };
};