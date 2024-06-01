// import dependencies
const express = require('express');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const path = require('path');
const { MongoClient } = require('mongodb');

// import handlers
const homeHandler = require('./controllers/home.js');
const roomHandler = require('./controllers/room.js');

const app = express();
const port = 3000;

// MongoDB connection setup
const uri = "mongodb://localhost:27017/"; // Replace with your MongoDB connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;
client.connect(async (err) => {
  if (err) throw err;
  db = client.db("chatroomDB");
  console.log("Connected to MongoDB");

  const collections = await db.listCollections().toArray();
  if (!collections.map((coll) => coll.name).includes("chatrooms")) {
    db.createCollection("chatrooms");
  }
  if (!collections.map((coll) => coll.name).includes("users")) {
    db.createCollection("users");
  }
  if (!collections.map((coll) => coll.name).includes("messages")) {
    db.createCollection("messages");
  }
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Create controller handlers to handle requests at each endpoint
app.get('/', homeHandler.getHome);
app.get('/:roomName', roomHandler.getRoom);

// Create API call to create a new chatroom
app.post('/create', async (req, res) => {
  try {
    const roomName = req.body.roomName || roomHandler.roomIdGenerator();
    await db.collection("chatrooms").insertOne({ roomName, messages: [] });
    res.redirect(`/${roomName}`);
  } catch (error) {
    console.error("Error creating chatroom:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Create API call to get messages for a chatroom
app.get('/:roomName/messages', async (req, res) => {
  const roomName = req.params.roomName;
  const room = await db.collection("chatrooms").findOne({ roomName });
  res.json(room ? room.messages : []);
});

// Create API call to post messages to a chatroom
app.post('/:roomName/messages', async (req, res) => {
  const roomName = req.params.roomName;
  const { nickname, body, datetime } = req.body;
  await db.collection("chatrooms").updateOne(
    { roomName },
    { $push: { messages: { nickname, body, datetime } } }
  );
  res.sendStatus(200);
});

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
