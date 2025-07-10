require('dotenv').config()
const session = require('express-session');
const MongoStore = require('connect-mongo');

const timeInative = 8

const sessionMiddleware = session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: 'sessions',
        ttl: timeInative * 60 * 60
    }),
    cookie: {
        maxAge: timeInative * 60 * 60 * 1000
    }
})

module.exports = sessionMiddleware