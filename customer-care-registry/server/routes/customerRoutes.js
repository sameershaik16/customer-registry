const express = require('express');
const { body } = require('express-validator');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect); // all customer routes require authentication

router
  .route('/')
  .get(getCustomers)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('phone').trim().notEmpty().withMessage('Phone is required'),
      body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
    ],
    validate,
    createCustomer
  );

router
  .route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(authorize('admin'), deleteCustomer);

module.exports = router;
