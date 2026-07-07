const express = require('express');
const { body } = require('express-validator');
const {
  getInteractionsByCustomer,
  createInteraction,
  deleteInteraction,
} = require('../controllers/interactionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.get('/customer/:customerId', getInteractionsByCustomer);

router.post(
  '/',
  [
    body('customer').notEmpty().withMessage('Customer is required'),
    body('type').isIn(['Call', 'Email', 'Meeting', 'Note']).withMessage('Invalid interaction type'),
    body('summary').trim().notEmpty().withMessage('Summary is required'),
  ],
  validate,
  createInteraction
);

router.delete('/:id', authorize('admin'), deleteInteraction);

module.exports = router;
