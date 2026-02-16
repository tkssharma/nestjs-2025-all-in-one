# 13. Frontend & Full-Stack Integration

NestJS works seamlessly with modern frontend frameworks through REST, GraphQL, and WebSockets.

---

## Works Well With

| Framework | Integration |
|-----------|-------------|
| **Next.js** | REST, GraphQL, tRPC |
| **Angular** | REST, WebSockets |
| **React** | REST, GraphQL |
| **Vue/Nuxt** | REST, GraphQL |
| **Mobile Apps** | REST, GraphQL |

---

## Integration Patterns

```
┌─────────────────────────────────────────┐
│              Frontend                    │
│  (Next.js / React / Angular / Mobile)   │
└─────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────────┐
│  REST   │   │ GraphQL │   │ WebSockets  │
└─────────┘   └─────────┘   └─────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│              NestJS Backend              │
└─────────────────────────────────────────┘
```

---

## CORS Configuration

```ts
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3000', 'https://myapp.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  
  await app.listen(4000);
}
```

---

## REST API for Frontend

### Standard Response Format
```ts
export class ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

@Controller('users')
export class UsersController {
  @Get()
  async findAll(@Query() query: PaginationDto): Promise<ApiResponse<User[]>> {
    const [users, total] = await this.usersService.findAll(query);
    return {
      success: true,
      data: users,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }
}
```

---

## WebSockets (Real-time)

### Installation
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### Gateway
```ts
import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { room: string; message: string }) {
    this.server.to(payload.room).emit('message', {
      sender: client.id,
      message: payload.message,
    });
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, room: string) {
    client.join(room);
    client.emit('joined', room);
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
```

### Frontend (React)
```tsx
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

socket.on('message', (data) => {
  console.log('Received:', data);
});

socket.emit('message', { room: 'general', message: 'Hello!' });
```

---

## Server-Sent Events (SSE)

```ts
@Controller('events')
export class EventsController {
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return interval(1000).pipe(
      map((num) => ({
        data: { timestamp: new Date(), count: num },
      })),
    );
  }
}
```

### Frontend
```ts
const eventSource = new EventSource('http://localhost:4000/events/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

---

## Serving Frontend (Monorepo)

### Static Files
```ts
// main.ts
import { join } from 'path';

app.useStaticAssets(join(__dirname, '..', 'public'));
app.setBaseViewsDir(join(__dirname, '..', 'views'));
```

### With Next.js
```ts
// Proxy API requests or use NestJS as API-only
// Next.js handles frontend, NestJS handles API

// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/:path*',
      },
    ];
  },
};
```

---

## API Versioning

```ts
// main.ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});

// Controller
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {}

@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {}

// Routes: /v1/users, /v2/users
```

---

## Best Practices

1. **Use DTOs** for request/response typing
2. **Enable CORS** appropriately for security
3. **Version your API** for backward compatibility
4. **Use WebSockets** for real-time features
5. **Implement proper error handling** with consistent format
6. **Document API** with Swagger for frontend devs
7. **Use environment-based URLs** for different environments
