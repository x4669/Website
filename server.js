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

    socket.on("joinVideoChat", () => {
        if (waitingUser) {
            socket.partner = waitingUser;
            waitingUser.partner = socket;

            waitingUser.emit("startConnection");
            socket.emit("startConnection");

            waitingUser = null;
        } else {
            waitingUser = socket;
        }
    });

    socket.on("offer", (offer) => {
        if (socket.partner) {
            socket.partner.emit("offer", offer);
        }
    });

    socket.on("answer", (answer) => {
        if (socket.partner) {
            socket.partner.emit("answer", answer);
        }
    });

    socket.on("iceCandidate", (candidate) => {
        if (socket.partner) {
            socket.partner.emit("iceCandidate", candidate);
        }
    });

    socket.on("leaveVideoChat", () => {
        if (socket.partner) {
            socket.partner.partner = null;
            socket.partner.emit("endConnection");
        }
        socket.partner = null;
        if (waitingUser === socket) {
            waitingUser = null;
        }
    });

    socket.on("disconnect", () => {
        if (socket.partner) {
            socket.partner.partner = null;
            socket.partner.emit("endConnection");
        }
        if (waitingUser === socket) {
            waitingUser = null;
        }
        console.log("A user disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
