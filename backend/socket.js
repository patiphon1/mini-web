let io;

module.exports = {
  init: (httpServer) => {
    io = require('socket.io')(httpServer,{
      cors: {
        origin: '*', // Allow requests from any origin
        methods: ["GET", "POST"], // Allow these HTTP methods
        allowedHeaders: ["*"],
        credentials: true
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};

