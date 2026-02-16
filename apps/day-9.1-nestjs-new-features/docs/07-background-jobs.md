# 7. Background Jobs & Queues

NestJS integrates with job queue libraries for handling background tasks.

---

## Libraries

| Library | Package | Features |
|---------|---------|----------|
| **Bull/BullMQ** | `@nestjs/bull` | Redis-backed, robust |
| **Agenda** | Custom | MongoDB-backed |
| **Bree** | Custom | Worker threads |

---

## Use Cases

- Email sending
- Report generation
- File processing
- Webhook retries
- Data synchronization
- Scheduled tasks

---

## Bull Integration

### Installation
```bash
npm install @nestjs/bull bull
npm install -D @types/bull
```

### Module Setup
```ts
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
    BullModule.registerQueue({
      name: 'reports',
    }),
  ],
})
export class AppModule {}
```

### Producer (Adding Jobs)
```ts
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendWelcomeEmail(user: User) {
    await this.emailQueue.add('welcome', {
      to: user.email,
      name: user.name,
    });
  }

  async sendBulkEmails(users: User[]) {
    const jobs = users.map(user => ({
      name: 'newsletter',
      data: { to: user.email },
    }));
    await this.emailQueue.addBulk(jobs);
  }

  async scheduleEmail(user: User, delay: number) {
    await this.emailQueue.add('reminder', { to: user.email }, {
      delay: delay, // milliseconds
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }
}
```

### Consumer (Processing Jobs)
```ts
import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email')
export class EmailProcessor {
  constructor(private mailerService: MailerService) {}

  @Process('welcome')
  async handleWelcome(job: Job<{ to: string; name: string }>) {
    await this.mailerService.sendMail({
      to: job.data.to,
      subject: 'Welcome!',
      template: 'welcome',
      context: { name: job.data.name },
    });
  }

  @Process('newsletter')
  async handleNewsletter(job: Job) {
    // Process newsletter
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    console.log(`Job ${job.id} completed with result:`, result);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    console.error(`Job ${job.id} failed:`, error.message);
  }
}
```

---

## Job Options

```ts
await queue.add('job-name', data, {
  delay: 5000,              // Delay in ms
  attempts: 3,              // Retry attempts
  backoff: {
    type: 'exponential',    // or 'fixed'
    delay: 1000,
  },
  priority: 1,              // Lower = higher priority
  timeout: 30000,           // Job timeout
  removeOnComplete: true,   // Remove job when done
  removeOnFail: false,      // Keep failed jobs
  jobId: 'unique-id',       // Custom job ID (for deduplication)
});
```

---

## Scheduled/Recurring Jobs

```ts
// Cron-based recurring jobs
await queue.add('daily-report', {}, {
  repeat: {
    cron: '0 9 * * *', // Every day at 9 AM
  },
});

// Fixed interval
await queue.add('health-check', {}, {
  repeat: {
    every: 60000, // Every minute
  },
});
```

---

## BullMQ (Newer Version)

### Installation
```bash
npm install @nestjs/bullmq bullmq
```

### Setup
```ts
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'tasks',
    }),
  ],
})
export class AppModule {}
```

### Processor
```ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('tasks')
export class TasksProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'process-file':
        return this.processFile(job.data);
      case 'send-notification':
        return this.sendNotification(job.data);
    }
  }
}
```

---

## Task Scheduling (Cron)

### Installation
```bash
npm install @nestjs/schedule
```

### Setup
```ts
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
})
export class AppModule {}
```

### Cron Jobs
```ts
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  @Cron('0 0 * * *') // Every midnight
  handleDailyTask() {
    console.log('Running daily task');
  }

  @Cron(CronExpression.EVERY_HOUR)
  handleHourlyTask() {
    console.log('Running hourly task');
  }

  @Interval(10000) // Every 10 seconds
  handleInterval() {
    console.log('Running interval task');
  }

  @Timeout(5000) // Once after 5 seconds
  handleTimeout() {
    console.log('Running timeout task');
  }
}
```

---

## Best Practices

1. **Use separate queues** for different job types
2. **Implement idempotency** - jobs may run multiple times
3. **Set appropriate timeouts** to prevent stuck jobs
4. **Monitor queue health** with Bull Board or similar
5. **Use dead letter queues** for failed jobs
6. **Clean up completed jobs** to save Redis memory
7. **Use job priorities** for critical tasks
