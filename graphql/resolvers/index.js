const bcryptjs = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/User');
const Booking = require('../../models/Booking');

const buildEvent = eventData => {
    return {
        ...eventData._doc,
        date: new Date(eventData.date),
        creator: user.bind(this, eventData._doc.creator)
    };
};

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } });
        return events.map(buildEvent);
    }
    catch (err) {
        throw err;
    }
};

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);

        return buildEvent(event);
    } catch (err) {
        throw err;
    }
}

const buildUser = userData => {
    return { ...userData._doc, createdEvents: events.bind(this, userData._doc.createdEvents) };
};

const user = async userId => {
    try {
        const userData = await User.findById(userId);
        return buildUser(userData);
    }
    catch (err) {
        throw err;
    }
};

const buildBooking = async bookingData => {
    return {
        ...bookingData._doc,
        user: user.bind(this, bookingData._doc.user),
        event: singleEvent.bind(this, bookingData._doc.event),
        createdAt: new Date(bookingData.createdAt).toISOString(),
        updatedAt: new Date(bookingData.updatedAt).toISOString()
    };
};

module.exports = {
    events: async () => {
        try {
            const eventList = await Event.find();
            return eventList.map(buildEvent);
        }
        catch (err) {
            throw err;
        }
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(buildBooking);
        } catch (err) {
            throw err;
        }
    },
    createEvent: (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5cf41342c6981d48e8ea496e'
        });
        let createdEvent;
        return event.save()
            .then(result => {
                console.log(result);
                createdEvent = buildEvent(result);
                return User.findById('5cf41342c6981d48e8ea496e');
            })
            .then(user => {
                if (!user) {
                    throw new Error('User not found.');
                }

                user.createdEvents.push(event);
                return user.save();
            })
            .then(result => {
                return createdEvent;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    },
    createUser: async (args) => {
        try {
            const existingUser = await User.findOne({ email: args.userInput.email });
            if (existingUser) {
                throw new Error('User already exists.');
            }
            const hashedPassword = await bcryptjs.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword,
            });
            const result = await user.save();

            return { ...result._doc, password: null };
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
    bookingEvent: async args => {
        const event = await Event.findOne({ _id: args.eventId });

        const booking = new Booking({
            user: '5cf41342c6981d48e8ea496e',
            event
        });

        const result = await booking.save();

        return buildBooking(result);
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = buildEvent(booking.event);

            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (err) {
            throw err;
        }
    }
};