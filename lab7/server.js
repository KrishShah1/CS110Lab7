// server.js

const express = require('express');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const path = require('path');
const { MongoClient } = require('mongodb');

// Import handlers
const homeHandler = require('./controllers/home.js');
const roomHandler = require('./controllers/room.js');

const app = express();
const port = 8080;

// MongoDB connection setup
const uri = "mongodb+srv://ktran254:lab7110@cs110lab7.1j3rkdn.mongodb.net/?retryWrites=true&w=majority&appName=CS110Lab7";
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    const db = client.db("chatroomDB");
    app.locals.db = db;
    console.log("Connected to MongoDB");

    const collections = await db.listCollections().toArray();
    if (!collections.map((coll) => coll.name).includes("chatrooms")) {
      await db.createCollection("chatrooms");
    }

    // Start the server after the database connection is established
    app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

connectToDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Create controller handlers to handle requests at each endpoint
app.get('/', homeHandler.getHome);
app.get('/:roomName', roomHandler.getRoom);
app.get('/:roomName/messages', homeHandler.getMessages);
app.post('/create', homeHandler.createChatroom);
app.post('/:roomName/messages', homeHandler.postMessages);
