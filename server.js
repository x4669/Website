const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let waitingUser = null;

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinChat", () => {
        if (waitingUser) {
            socket.partner = waitingUser;
            waitingUser.partner = socket;

            waitingUser.emit("receiveMessage", "You are now connected to a stranger.");
            socket.emit("receiveMessage", "You are now connected to a stranger.");

            waitingUser = null;
        } else {
            waitingUser = socket;
            socket.emit("receiveMessage", "Waiting for a stranger to join...");
        }
    });

    socket.on("sendMessage", (message) => {
        if (socket.partner) {
            socket.partner.emit("receiveMessage", message);
        }
    });

    socket.on("leaveChat", () => {
        if (socket.partner) {
            socket.partner.emit("receiveMessage", "The stranger has left the chat.");
            socket.partner.partner = null;
        }
        socket.partner = null;
        waitingUser = waitingUser === socket ? null : waitingUser;
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
        if (socket.partner) {
            socket.partner.emit("receiveMessage", "The stranger has left the chat.");
            socket.partner.partner = null;
        }
        waitingUser = waitingUser === socket ? null : waitingUser;
    });
});

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
