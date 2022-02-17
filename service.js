var http = require("http"); //Burada binamızın oturacağı zemini söylüyoruz.
var express = require("express"); // Ve burada ise zemine dikeceğimiz binayı tanımlıyoruz(express bu binayı tamamen hazır bir şekilde bize veriyor).
var app = express(); // Bu tanımladığımız binayı artık çalıştırmaya başlıyoruz.
var server = http.createServer(app); // Çalıştırdığımız ve hazır olan binamızı http.create server ile zemine oturdup ikisini birleştiriyoruz ve böylece serverimiz full halde hazır oluyor.
// var io = require('socket.io')(server);
const io = require("socket.io")(server, {
  cors: {
    origins: ["http://localhost:4200", "http://localhost:4201"],
  },
});
var rooms = {};

app.get("/", (req, res) => {
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // res.send('asasd');
  res.sendFile("./index.html", { root: __dirname });
});

io.on("connection", (socket) => {
  // join user's own room
  socket.join(socket.id);
  console.log("----------------\na user connected");

  socket.on("disconnect", () => {
    console.log("user " + rooms[socket.id] + " disconnected");
    io.emit("offline person", rooms[socket.id]);
    delete rooms[socket.id];
  });
  socket.on("support message", ({ message, roomName }) => {
    console.log("here is support message " + message);
    io.to(roomName).emit("sup msg", message);
  });

  socket.on("join", (roomName) => {
    console.log("join: " + roomName);
    socket.join(roomName);
    if (Object.values(rooms).indexOf(roomName) <= -1) {
      rooms[socket.id.toString()] = roomName;
    }

    console.log(rooms);
    io.emit("online rooms", Object.values(rooms));
  });

  socket.on("message", ({ message, roomName }) => {
    console.log("message: " + message + " in " + roomName);

    io.to(roomName).emit("user msg", message);
  });
});

const port = 8002; // Serverimizin dinleyeceği portu söylüyoruz.
server.listen(port, () => {
  // Bizim kurduğumuz server yapısının kapısının ismini bir üst satırda söylediğimiz porttan dinlemesini söylüyoruz.
  console.log("Server is listening on:" + port + " now..."); // Dinlediğinin kanıtı olarak ekrana yazdırıyoruz.
});
