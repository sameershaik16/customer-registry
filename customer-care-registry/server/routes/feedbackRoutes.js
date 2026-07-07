const express = require('express');
const { body } = require('express-validator');
const {
  getFeedback,
  createFeedback,
  deleteFeedback,
  getFeedbackReport,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

// Must be declared before '/:id'-style routes elsewhere to avoid collisions
router.get('/reports', getFeedbackReport);

router
  .route('/')
  .get(getFeedback)
  .post(
    [
      body('customer').notEmpty().withMessage('Customer is required'),
      body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    ],
    validate,
    createFeedback
  );

router.delete('/:id', authorize('admin'), deleteFeedback);

module.exports = router;
