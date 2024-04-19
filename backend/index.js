const express = require("express");
const Room = require("./models/room");
const Manager = require("./models/manager");
const Customer = require("./models/customer");
const Booking = require("./models/booking");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT_BACKEND || 4001;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: '*',
        credentials: true,
    })
);

// Create a login API endpoint for the manager
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the manager with the provided username and password
        const manager = await Manager.findOne({ username, password });
        if (!manager) {
            return res.status(401).json({ success: false, message: 'Manager not found' });
        }

        return res.status(200).json({ success: true, manager });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Failed to login' });
    }
});


//manager routes
// Add room endpoint
app.post('/api/addRoom', async (req, res) => {
    const { roomNumber, roomType, isAC, pricePerDay } = req.body;
    console.log("body: ", roomNumber, roomType, isAC, pricePerDay);
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
        return res.status(200).json({
            success: false,
            message: "room already exists"
        })
    }
    const room = new Room({ roomNumber, roomType, isAC, pricePerDay });
    await room.save();
    res.json({ success: true, message: 'Room added successfully', room });
});

// Generate login details endpoint
app.post('/api/generateLoginDetails', async (req, res) => {
    const { name, role, username, password } = req.body;

    // Check if the username already exists
    const existingManager = await Manager.findOne({ username });
    if (existingManager) {
        // If the username exists, return a message indicating that the username is already taken
        return res.status(200).json({
            success: false,
            message: 'Username already exists'
        });
    }

    // Save the new username and password to the database
    try {
        const manager = new Manager({ name, role, username, password });
        await manager.save();
        res.json({
            success: true, message: "generated login details", username, password
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to generate login details' });
    }
});

// Get occupancy rate endpoint
app.get('/api/occupancyRate', async (req, res) => {
    try {
        // Fetch all rooms from the database
        const rooms = await Room.find();

        // Calculate the total number of rooms
        const totalRooms = rooms.length;

        // Calculate the number of rooms with availabilityStatus as false
        const occupiedRooms = rooms.filter(room => !room.availabilityStatus).length;

        // Calculate the occupancy rate
        const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

        res.json({ success: true, message: "occupancy fetched", occupancyRate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to calculate occupancy rate' });
    }
});

// Increase room prices endpoint
app.put('/api/changeTariff', async (req, res) => {
    const { tariffAmount } = req.body;

    try {
        // Fetch all rooms from the database
        const rooms = await Room.find();

        // Update the pricePerDay of each room
        rooms.forEach(async (room) => {
            room.pricePerDay += parseInt(tariffAmount);
            await room.save();
        });

        res.json({ success: true, message: 'Room prices updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update room prices' });
    }
});

//reciptionist routes
// Register customer endpoint
app.post('/api/registerCustomer', async (req, res) => {
    const { name, email, address } = req.body;

    try {
        // Check if the email already exists
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(200).json({ success: false, message: 'Email already registered' });
        }

        // Create a new customer object
        const customer = new Customer({ name, email, address });

        // Save the new customer to the database
        await customer.save();

        res.json({ success: true, message: 'Customer registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to register customer' });
    }
});

// Create a check-in advance bill endpoint
app.post('/api/checkinBill', async (req, res) => {
    const { customerEmail, checkinDate, expectedCheckoutDate, roomNumber } = req.body;
    console.log("body: ", customerEmail, checkinDate, expectedCheckoutDate, roomNumber);

    try {

        // Calculate the advance to be paid
        const diffInDays = Math.ceil((new Date(expectedCheckoutDate) - new Date(checkinDate)) / (1000 * 60 * 60 * 24));
        const room = await Room.findOne({ roomNumber });
        console.log("room: ", room);
        const advance = 0.3 * (diffInDays + 1) * room.pricePerDay;

        const booking = await Booking.findOne({ customerEmail, isCheckout: true });
        if (booking) {
            return res.json({ success: true, advance, discount: 0.2 * advance });
        }

        res.json({ success: true, advance, discount: 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: true, message: 'Failed to calculate check-in bill' });
    }
});

// Create an API endpoint to get occupied room numbers
app.get('/api/occupiedRooms', async (req, res) => {
    try {
        // Extract room numbers from occupied bookings
        const occupiedRooms = await Room.find({ availabilityStatus: false }).select('roomNumber isAC roomType');

        res.json({ success: true, occupiedRooms });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch occupied rooms' });
    }
});

// Create an API endpoint to get free room numbers
app.get('/api/freeRooms', async (req, res) => {
    try {
        // Extract room numbers from occupied bookings
        const freeRooms = await Room.find({ availabilityStatus: true }).select('roomNumber isAC roomType');

        res.json({ success: true, freeRooms });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch occupied rooms' });
    }
});

// Create a booking endpoint
app.post('/api/createBooking', async (req, res) => {
    const { customerEmail, roomNumber, checkinDate, expectedCheckoutDate, advancePaid } = req.body;
    console.log("body: ", customerEmail, roomNumber, checkinDate, expectedCheckoutDate, advancePaid);

    try {
        // Check if the customer exists
        const existingCustomer = await Customer.findOne({ email: customerEmail });
        if (!existingCustomer) {
            return res.status(200).json({ success: false, message: 'Customer not found' });
        }

        // Update customer database with booking details
        existingCustomer.roomNumber = roomNumber;
        existingCustomer.checkinDate = checkinDate;
        existingCustomer.expectedCheckoutDate = expectedCheckoutDate;
        await existingCustomer.save();

        // Update room database with roomNumber
        const room = await Room.findOne({ roomNumber });
        if (!room) {
            return res.status(200).json({ success: false, message: 'Room not found' });
        }
        if (room.availabilityStatus === false) {
            return res.status(200).json({ success: false, message: 'Room already booked' });
        }
        room.availabilityStatus = false;
        room.customerEmail = customerEmail;
        await room.save();

        // Create a new booking
        const booking = new Booking({
            customerEmail,
            roomNumber,
            checkinDate,
            advancePaid,
            expectedCheckoutDate
        });
        await booking.save();

        res.json({ success: true, message: 'Booking created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create booking' });
    }
});

// Create a checkout bill endpoint
app.post('/api/checkoutBill/', async (req, res) => {
    const roomNumber = parseInt(req.body.roomNumber);
    console.log("body: ", roomNumber);

    try {
        // Find the booking for the given room number
        const booking = await Booking.findOne({ roomNumber, isCheckout: false });
        if (!booking) {
            return res.status(200).json({ success: true, message: 'Booking not found or already checked out' });
        }

        // Calculate the total bill amount
        const checkinDate = booking.checkinDate;
        const checkoutDate = new Date();
        const diffInDays = Math.ceil((checkoutDate - new Date(checkinDate)) / (1000 * 60 * 60 * 24));
        console.log("diffInDays: ", diffInDays);
        const room = await Room.findOne({ roomNumber });
        const totalBill = (diffInDays * room.pricePerDay) + room.foodTotal;
        const totalBalance = totalBill - booking.advancePaid;

        res.json({ success: true, totalBalance, totalBill });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to calculate checkout bill' });
    }
});


// Create a checkout endpoint
app.post('/api/createCheckout', async (req, res) => {
    const { roomNumber, checkoutDate, totalBalance } = req.body;

    try {
        // Find the booking for the given room number
        const booking = await Booking.findOne({ roomNumber, isCheckout: false });
        if (!booking) {
            return res.status(200).json({ success: false, message: 'Booking not found or already checked out' });
        }

        // Update the booking with checkout details
        booking.isCheckout = true;
        booking.exactCheckoutDate = checkoutDate;
        booking.totalPaid = totalBalance + booking.advancePaid;
        const totalAmount = booking.totalPaid;
        await booking.save();

        // Update customer database
        const customer = await Customer.findOne({ email: booking.customerEmail });
        if (!customer) {
            return res.status(200).json({ success: false, message: 'Customer not found' });
        }
        customer.roomNumber = null;
        customer.expectedCheckoutDate = null;
        customer.checkinDate = null;
        await customer.save();

        // Update room database
        const room = await Room.findOne({ roomNumber });
        room.availabilityStatus = true;
        room.customerEmail = null;
        room.foodTotal = 0;
        await room.save();

        res.json({ success: true, message: 'Checkout completed successfully', totalAmount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create checkout' });
    }
});

// Create a search and add food price endpoint
app.post('/api/searchAndAddFoodPrice', async (req, res) => {
    const { roomNumber, totalPrice } = req.body;

    try {
        // Find the room with the given room number
        const room = await Room.findOne({ roomNumber });
        if (!room) {
            return res.json({ success: false, message: 'Room not found' });
        }

        // Add the food price to the room's foodTotal
        room.foodTotal += totalPrice;
        await room.save();

        res.json({ success: true, message: 'Food price added to room successfully', room });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add food price to room' });
    }
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to the API",
    });
});

app.listen(PORT, () => {
    console.log(`server started on port no. ${PORT}`);
});

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("successfully connected to db"))
    .catch((err) => {
        console.log("issue with db connection");
        console.log(err);
    })
