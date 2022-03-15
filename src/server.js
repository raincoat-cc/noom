import http from "http";
import { Server } from "socket.io";
import express from "express";
import path from "path";
const __dirname = path.resolve();

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on("connection", socket => {
  socket.onAny(event => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome");
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach(room => socket.to(room).emit("bye"));
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", msg);
    done();
  });
});

/* 
const wss = new WebSocketServer({ server: httpServer });
const sockets = [];
wss.on("connection", socket => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  socket.on("close", () => console.log("DisConnected from the Browser ❌"));
  socket.on("message", msg => {
    const message = JSON.parse(msg.toString("utf8"));
    switch (message.type) {
      case "new_message":
        sockets.forEach(aSocket =>
          aSocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case "nickname":
        socket["nickname"] = message.payload;
    }
  });
}); */
httpServer.listen(3000, handleListen);
