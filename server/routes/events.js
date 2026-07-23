const express = require('express');
const router = express.Router();
const {protect, admin} = require('../middleware/auth');
const {getAllEvents, getEventById, createEvent, updateEvent, deleteEvent} = require('../controllers/eventController');


//Get all events
router.get('/', getAllEvents);


//Get Event by ID
router.get('/:id', getEventById);

//Create Event (Admin only)
router.post('/', protect,admin, createEvent);

//update event (Admin only)
router.put('/:id', protect, admin, updateEvent);

//Delete event (Admin only)
router.delete('/:id', protect, admin, deleteEvent);


module.exports = router;
