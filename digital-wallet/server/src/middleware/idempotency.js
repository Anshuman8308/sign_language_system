import IdempotencyRequest from '../models/IdempotencyRequest.js';

/**
 * Idempotency middleware - prevents duplicate financial operations.
 * Pass header: Idempotency-Key: <uuid>
 */
export const idempotencyMiddleware = async (req, res, next) => {
  const key = req.headers['idempotency-key'];

  if (!key) return next();

  try {
    const userId = req.user?._id;
    if (!userId) return next();

    const requestHash = IdempotencyRequest.generateHash(req.body);
    const existing = await IdempotencyRequest.findOne({ userId, key });

    if (existing) {
      if (existing.requestHash !== requestHash) {
        return res.status(422).json({
          success: false,
          message: 'Idempotency key reused with different payload',
        });
      }
      // Return cached response
      return res
        .status(existing.responseSnapshot.statusCode)
        .json(existing.responseSnapshot.body);
    }

    req.idempotencyContext = { key, requestHash, endpoint: req.originalUrl };

    // Intercept response to cache it
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.idempotencyContext) {
        IdempotencyRequest.create({
          userId,
          key: req.idempotencyContext.key,
          endpoint: req.idempotencyContext.endpoint,
          requestHash: req.idempotencyContext.requestHash,
          responseSnapshot: { statusCode: res.statusCode, body },
        }).catch(console.error);
      }
      return originalJson(body);
    };

    next();
  } catch (error) {
    next(error);
  }
};
