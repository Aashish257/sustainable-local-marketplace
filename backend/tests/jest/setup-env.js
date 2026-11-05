// Runs before every test file: safe, fast, offline settings.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.DISABLE_REDIS = "true"; // no Redis needed; cache/queue are skipped
process.env.BCRYPT_ROUNDS = "4";    // fast hashing in tests
process.env.RAZORPAY_KEY_ID = "rzp_test_dummy";
delete process.env.CLOUDINARY_CLOUD_NAME;
delete process.env.CLIENT_URL;
