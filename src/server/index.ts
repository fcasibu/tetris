import Fastify from 'fastify';
import fastifyIo from 'fastify-socket.io';
import { GameInstanceManager } from './services/game-instance-manager';
import type { ServerSocket } from '@shared/types/socket.events';

const fastify = Fastify({ logger: true });

fastify.register(fastifyIo, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const gameInstanceManager = new GameInstanceManager();

fastify.ready((err) => {
  if (err) throw err;

  gameInstanceManager.init(fastify.io);
});

fastify.listen({ port: 8080 }, () => {
  console.log('Server startedf at http://localhost:8080');
});

declare module 'fastify' {
  interface FastifyInstance {
    io: ServerSocket;
  }
}
