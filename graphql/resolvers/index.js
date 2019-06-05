const bcryptjs = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/User');

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
};