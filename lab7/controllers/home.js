// home.js

async function getHome(request, response) {
  try {
    const chatroomsCursor = await request.app.locals.db.collection("chatrooms").find();
    const chatrooms = await chatroomsCursor.toArray();
    const uniqueChatrooms = [...new Map(chatrooms.map(item => [item['roomName'], item])).values()];
    response.render('home', { title: 'Home', chatrooms: uniqueChatrooms });
  } catch (error) {
    console.error("Error fetching chatrooms:", error);
    response.status(500).send("Internal Server Error");
  }
}

async function getMessages(request, response) {
  const roomName = request.params.roomName;
  const room = await request.app.locals.db.collection("chatrooms").findOne({ roomName });
  response.json(room ? room.messages : []);
}

async function createChatroom(request, response) {
  try {
    const roomName = request.body.roomName || roomHandler.roomIdGenerator();
    const existingRoom = await request.app.locals.db.collection("chatrooms").findOne({ roomName });
    if (!existingRoom) {
      await request.app.locals.db.collection("chatrooms").insertOne({ roomName, messages: [] });
    }
    response.redirect(`/${roomName}`);
  } catch (error) {
    console.error("Error creating chatroom:", error);
    response.status(500).send("Internal Server Error");
  }
}

async function postMessages(request, response) {
  const roomName = request.params.roomName;
  const { nickname, body, datetime } = request.body;
  await request.app.locals.db.collection("chatrooms").updateOne(
    { roomName },
    { $push: { messages: { nickname, body, datetime } } }
  );
  response.sendStatus(200);
}

module.exports = {
  getHome,
  getMessages,
  createChatroom,
  postMessages
};
