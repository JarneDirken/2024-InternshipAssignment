import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",  // This is very open; restrict it according to your needs
      methods: ["GET", "POST"]
    }
  });

  // io.on("connection", (socket) => {
  //   console.log(`Client connected: ${socket.id}`);
    
  //   // const intervalId = setInterval(() => {
  //   //   io.emit('new-notification', { message: 'Periodic test notification' });
  //   //   console.log('Periodic test notification emitted');
  //   // }, 10000);
  
  //   // socket.on("disconnect", () => {
  //   //   console.log(`Client disconnected: ${socket.id}`);
  //   //   clearInterval(intervalId); // Cleanup the interval when the client disconnects
  //   // });
  
  // });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
  
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // server
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
