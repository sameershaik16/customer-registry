const express = require('express');
const { body } = require('express-validator');
const {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getComplaints)
  .post(
    [
      body('customer').notEmpty().withMessage('Customer is required'),
      body('subject').trim().notEmpty().withMessage('Subject is required'),
      body('description').trim().notEmpty().withMessage('Description is required'),
    ],
    validate,
    createComplaint
  );

router
  .route('/:id')
  .get(getComplaintById)
  .put(updateComplaint)
  .delete(authorize('admin'), deleteComplaint);

module.exports = router;
