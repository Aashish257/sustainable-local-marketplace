export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        const error = new Error(err.errors ? err.errors[0].message : "Validation Error");
        error.status = 400;
        next(error);
    }
};
