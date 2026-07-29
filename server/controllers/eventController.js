const Event = require('../models/Event');

exports.getAllEvents = async (req, res) => {
    try{

        const filters = {};
        if(req.query.category) {
            filters.category = req.query.category;
        }
        if(req.query.ticketPrice){
            filters.ticketPrice = req.query.ticketPrice;
        }
        const events = await Event.find(filters);
        res.json(events);
    } catch(error) {
        res.status(500).json({error: error.message});
    }
};

exports.getEventById = async (req,res) => {
    try{
        const event = await Event.findById(req.params.id);
        if(!event){
            return res.status(404).json({error: 'Event not found'});
        }
        res.json(event);
    }catch(error) {
        res.status(500).json({error: error.message});
    }
};
 

exports.createEvent = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("USER:", req.user);

        const event = await Event.create({
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            location: req.body.location,
            category: req.body.category,
            totalSeats: req.body.totalSeats,
            availableSeats: req.body.totalSeats,
            ticketPrice: req.body.ticketPrice,
            imageUrl: req.body.imageUrl,
            createdBy: req.user.id
        });

        res.status(201).json(event);

    } catch (err) {
        console.error("CREATE EVENT ERROR:", err);
        res.status(500).json({
            message: "Server Error",
            error: err.message
        });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


