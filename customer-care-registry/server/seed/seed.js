/**
 * Seed script - populates the database with sample users, customers,
 * complaints, interactions, and feedback for demo/evaluation purposes.
 *
 * Usage: npm run seed  (run from the /server directory)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Customer = require('../models/Customer');
const Complaint = require('../models/Complaint');
const InteractionHistory = require('../models/InteractionHistory');
const Feedback = require('../models/Feedback');

const CATEGORIES = ['Service Delay', 'Product Issue', 'Billing', 'Staff Behavior', 'Technical', 'Donation', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Closed'];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Customer.deleteMany(),
    Complaint.deleteMany(),
    InteractionHistory.deleteMany(),
    Feedback.deleteMany(),
  ]);

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Alice Admin',
    email: 'admin@ccr.org',
    password: 'Admin@123',
    role: 'admin',
  });

  const agents = await User.create([
    { name: 'Ben Agent', email: 'agent@ccr.org', password: 'Agent@123', role: 'agent' },
    { name: 'Cara Support', email: 'cara@ccr.org', password: 'Agent@123', role: 'agent' },
    { name: 'Dev Patel', email: 'dev@ccr.org', password: 'Agent@123', role: 'agent' },
  ]);

  console.log('Creating customers...');
  const customerNames = [
    'John Mwangi', 'Grace Otieno', 'Samuel Kim', 'Fatima Noor', 'Liam Chen',
    'Maria Garcia', 'Ahmed Hassan', 'Priya Sharma', 'Oliver Smith', 'Aisha Bello',
    'Noah Johnson', 'Wanjiru Kamau', 'Carlos Rivera', 'Emeka Okafor', 'Sofia Rossi',
  ];

  const customers = await Customer.create(
    customerNames.map((name, i) => ({
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `+1-555-01${String(i).padStart(2, '0')}`,
      address: `${100 + i} Community Ave, Hometown`,
      gender: randomFrom(['male', 'female', 'unspecified']),
      tags: [randomFrom(['beneficiary', 'donor', 'volunteer'])],
      status: 'active',
      createdBy: admin._id,
    }))
  );

  console.log('Creating complaints with timelines...');
  const complaintSubjects = [
    'Delayed food package delivery',
    'Incorrect billing on donation receipt',
    'Rude behavior from front desk staff',
    'Unable to access online portal',
    'Missing item in relief kit',
    'Volunteer scheduling conflict',
    'Delayed response to inquiry email',
    'Damaged goods received',
    'Difficulty updating donation details',
    'Long wait time at service center',
  ];

  const complaints = [];
  for (let i = 0; i < 25; i += 1) {
    const status = randomFrom(STATUSES);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 150));

    const complaint = await Complaint.create({
      customer: randomFrom(customers)._id,
      subject: randomFrom(complaintSubjects),
      description: 'Customer reported an issue that requires follow-up from the support team. Details were captured during intake and require verification.',
      category: randomFrom(CATEGORIES),
      priority: randomFrom(PRIORITIES),
      status,
      assignedAgent: randomFrom(agents)._id,
      createdBy: randomFrom(agents)._id,
      createdAt,
      resolvedAt: ['Resolved', 'Closed'].includes(status) ? new Date() : undefined,
      timeline: [{ status: 'Pending', note: 'Complaint registered', updatedBy: admin._id, updatedAt: createdAt }],
    });
    complaints.push(complaint);
  }

  console.log('Creating interaction history...');
  const interactionTypes = ['Call', 'Email', 'Meeting', 'Note'];
  const interactions = [];
  for (let i = 0; i < 40; i += 1) {
    interactions.push({
      customer: randomFrom(customers)._id,
      complaint: Math.random() > 0.5 ? randomFrom(complaints)._id : undefined,
      type: randomFrom(interactionTypes),
      summary: 'Follow-up conversation regarding the reported concern; customer was updated on progress.',
      handledBy: randomFrom(agents)._id,
    });
  }
  await InteractionHistory.create(interactions);

  console.log('Creating feedback...');
  const feedbackDocs = [];
  for (let i = 0; i < 30; i += 1) {
    feedbackDocs.push({
      customer: randomFrom(customers)._id,
      complaint: Math.random() > 0.4 ? randomFrom(complaints)._id : undefined,
      rating: Math.ceil(Math.random() * 5),
      comments: 'Thank you for the assistance provided by the support team.',
      submittedBy: randomFrom(agents)._id,
    });
  }
  await Feedback.create(feedbackDocs);

  console.log('\nSeed complete!');
  console.log('Login credentials:');
  console.log('  Admin -> admin@ccr.org / Admin@123');
  console.log('  Agent -> agent@ccr.org / Agent@123');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
