const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// In-memory Data Store
const users = [];
const exercises = [];

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// 1. POST: Create a new user
app.post('/api/users', (req, res) => {
    const { username } = req.body;
    const newUser = {
        username,
        _id: users.length.toString(),
    };
    users.push(newUser);
    res.json(newUser);
});

// 2. GET: Fetch all users
app.get('/api/users', (req, res) => {
    res.json(users);
});

// 3. POST: Add exercises
app.post('/api/users/:_id/exercises', (req, res) => {
    const { description, duration, date } = req.body;
    const userId = req.params._id;

    const user = users.find(u => u._id === userId);
    if (!user) return res.status(404).send('User not found');

    const newExercise = {
        userId,
        description,
        duration: Number(duration),
        date: date ? new Date(date).toDateString() : new Date().toDateString(),
    };
    exercises.push(newExercise);

    res.json({
        username: user.username,
        description: newExercise.description,
        duration: newExercise.duration,
        date: newExercise.date,
        _id: userId,
    });
});

// 4. GET: Retrieve exercise logs
app.get('/api/users/:_id/logs', (req, res) => {
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    const user = users.find(u => u._id === userId);
    if (!user) return res.status(404).send('User not found');

    let userExercises = exercises.filter(e => e.userId === userId);

    if (from) userExercises = userExercises.filter(e => new Date(e.date) >= new Date(from));
    if (to) userExercises = userExercises.filter(e => new Date(e.date) <= new Date(to));
    if (limit) userExercises = userExercises.slice(0, Number(limit));

    res.json({
        username: user.username,
        count: userExercises.length,
        _id: userId,
        log: userExercises.map(e => ({
            description: e.description,
            duration: e.duration,
            date: e.date,
        })),
    });
});

// Listener
const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port);
});