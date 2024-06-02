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

module.exports = {
  getHome
};
