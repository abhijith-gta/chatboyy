
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);
const path = require("path");

const PORT = process.env.PORT || 5000;

let onlineUsers = 0;
const waitingUsers = [];

app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  onlineUsers++;
  io.emit("onlineCount", onlineUsers);

  pairUser(socket);

  socket.on("message", (msg) => {
    if (socket.partner) {
      socket.partner.emit("message", { name: "Stranger", message: msg });
    } else {
      socket.emit("message", { name: "System", message: "Stranger not connected." });
    }
  });

  socket.on("typing", (isTyping) => {
    if (socket.partner && isTyping) {
      socket.partner.emit("typing");
    }
  });

  socket.on("skip", () => {
    if (socket.partner) {
      socket.partner.emit("message", { name: "System", message: "Stranger has skipped the chat." });
      socket.partner.partner = null;
      pairUser(socket.partner);
    }
    socket.partner = null;
    pairUser(socket);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    onlineUsers--;
    io.emit("onlineCount", onlineUsers);

    if (socket.partner) {
      socket.partner.emit("message", { name: "System", message: "Stranger has disconnected." });
      socket.partner.partner = null;
      pairUser(socket.partner);
    }

    const index = waitingUsers.indexOf(socket);
    if (index !== -1) waitingUsers.splice(index, 1);
  });
});

function pairUser(socket) {
  if (waitingUsers.length > 0) {
    const partner = waitingUsers.shift();
    connectPair(socket, partner);
  } else {
    waitingUsers.push(socket);
    socket.emit("message", { name: "System", message: "Waiting for a stranger..." });
  }
}

function connectPair(s1, s2) {
  s1.partner = s2;
  s2.partner = s1;
  s1.emit("message", { name: "System", message: "You are now connected to a stranger." });
  s2.emit("message", { name: "System", message: "You are now connected to a stranger." });
}

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
