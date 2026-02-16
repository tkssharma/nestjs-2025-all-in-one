# 6. Messaging, Queues & Events

NestJS provides excellent support for event-driven architecture and message brokers.

---

## Message Brokers Supported

| Broker | Transport | Use Case |
|--------|-----------|----------|
| **Kafka** | `Transport.KAFKA` | High throughput, streaming |
| **RabbitMQ** | `Transport.RMQ` | Reliable messaging |
| **NATS** | `Transport.NATS` | Lightweight, fast |
| **Redis** | `Transport.REDIS` | Pub/Sub, caching |
| **AWS SQS** | Custom | Cloud-native |
| **MQTT** | `Transport.MQTT` | IoT devices |

---

## Architecture

```
┌─────────────┐         ┌─────────────┐
│  Service A  │         │  Service B  │
│  (Producer) │         │  (Consumer) │
└──────┬──────┘         └──────┬──────┘
       │                       │
       ▼                       ▼
┌─────────────────────────────────────┐
│           Message Broker            │
│  (Kafka / RabbitMQ / Redis / NATS)  │
└─────────────────────────────────────┘
```

---

## Microservices Module

### Installation
```bash
npm install @nestjs/microservices
```

---

## RabbitMQ Integration

### Installation
```bash
npm install amqplib amqp-connection-manager
```

### Producer (Hybrid App)
```ts
// main.ts
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Connect to RabbitMQ as microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'orders_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
```

### Sending Messages
```ts
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrdersService {
  constructor(
    @Inject('ORDERS_SERVICE') private client: ClientProxy,
  ) {}

  async createOrder(order: CreateOrderDto) {
    // Save order to DB
    const savedOrder = await this.ordersRepo.save(order);
    
    // Emit event (fire and forget)
    this.client.emit('order_created', savedOrder);
    
    return savedOrder;
  }

  async processPayment(data: PaymentDto) {
    // Send message and wait for response
    return this.client.send('process_payment', data).toPromise();
  }
}
```

### Receiving Messages
```ts
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class OrdersController {
  // Handle events (fire and forget)
  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any) {
    console.log('Order created:', data);
    // Send notification, update inventory, etc.
  }

  // Handle messages (request-response)
  @MessagePattern('process_payment')
  async processPayment(@Payload() data: any) {
    const result = await this.paymentService.process(data);
    return result;
  }
}
```

### Client Module Registration
```ts
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'orders_queue',
        },
      },
    ]),
  ],
})
export class OrdersModule {}
```

---

## Kafka Integration

### Installation
```bash
npm install kafkajs
```

### Configuration
```ts
// main.ts
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'orders',
      brokers: ['localhost:9092'],
    },
    consumer: {
      groupId: 'orders-consumer',
    },
  },
});
```

### Producer
```ts
@Injectable()
export class OrdersService {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('order.created');
    await this.kafkaClient.connect();
  }

  async createOrder(order: CreateOrderDto) {
    return this.kafkaClient.emit('order.created', {
      key: order.id,
      value: order,
    });
  }
}
```

### Consumer
```ts
@Controller()
export class OrdersController {
  @EventPattern('order.created')
  handleOrderCreated(@Payload() message: any) {
    console.log('Received:', message);
  }
}
```

---

## Redis Pub/Sub

### Installation
```bash
npm install ioredis
```

### Configuration
```ts
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.REDIS,
  options: {
    host: 'localhost',
    port: 6379,
  },
});
```

### Usage
```ts
// Publisher
@Inject('REDIS_SERVICE') private redisClient: ClientProxy;

async publishEvent() {
  this.redisClient.emit('user.created', { id: 1, name: 'John' });
}

// Subscriber
@EventPattern('user.created')
handleUserCreated(@Payload() data: any) {
  console.log('User created:', data);
}
```

---

## NATS

### Installation
```bash
npm install nats
```

### Configuration
```ts
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
  },
});
```

---

## Event Emitter (In-Process)

### Installation
```bash
npm install @nestjs/event-emitter
```

### Setup
```ts
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
})
export class AppModule {}
```

### Emitting Events
```ts
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OrdersService {
  constructor(private eventEmitter: EventEmitter2) {}

  async createOrder(order: CreateOrderDto) {
    const savedOrder = await this.ordersRepo.save(order);
    
    this.eventEmitter.emit('order.created', new OrderCreatedEvent(savedOrder));
    
    return savedOrder;
  }
}
```

### Listening to Events
```ts
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationService {
  @OnEvent('order.created')
  handleOrderCreated(event: OrderCreatedEvent) {
    // Send email, push notification, etc.
  }

  @OnEvent('order.*')
  handleAllOrderEvents(event: any) {
    // Handle all order events
  }
}
```

---

## Best Practices

1. **Use event-driven architecture** for decoupling
2. **Implement idempotency** for message handlers
3. **Use dead letter queues** for failed messages
4. **Monitor queue depth** and consumer lag
5. **Use schema validation** for messages
6. **Implement retry logic** with exponential backoff
7. **Use correlation IDs** for tracing
