# 11. Email, Notifications & External APIs

NestJS integrates external services as injectable providers for clean separation of concerns.

---

## Libraries

| Library | Purpose |
|---------|---------|
| **Nodemailer** | Email sending |
| **SendGrid** | Email service |
| **Twilio** | SMS/Voice |
| **Firebase** | Push notifications |
| **Stripe** | Payments |

---

## Nodemailer Integration

### Installation
```bash
npm install nodemailer @nestjs-modules/mailer
npm install -D @types/nodemailer
```

### Module Setup
```ts
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
})
export class AppModule {}
```

### Mail Service
```ts
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendWelcome(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome!',
      template: 'welcome',
      context: {
        name: user.name,
        url: 'https://example.com/verify',
      },
    });
  }

  async sendPasswordReset(email: string, token: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Password',
      template: 'reset-password',
      context: { resetUrl: `https://example.com/reset?token=${token}` },
    });
  }
}
```

---

## SendGrid Integration

### Installation
```bash
npm install @sendgrid/mail
```

### Service
```ts
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SendGridService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
  }

  async sendEmail(to: string, subject: string, html: string) {
    await sgMail.send({
      to,
      from: 'noreply@example.com',
      subject,
      html,
    });
  }
}
```

---

## Twilio (SMS)

### Installation
```bash
npm install twilio
```

### Service
```ts
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio;

  constructor(private configService: ConfigService) {
    this.client = new Twilio(
      configService.get('TWILIO_SID'),
      configService.get('TWILIO_TOKEN'),
    );
  }

  async sendSms(to: string, message: string) {
    return this.client.messages.create({
      to,
      from: this.configService.get('TWILIO_PHONE'),
      body: message,
    });
  }

  async sendVerificationCode(phone: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.sendSms(phone, `Your code is: ${code}`);
    return code;
  }
}
```

---

## Firebase Push Notifications

### Installation
```bash
npm install firebase-admin
```

### Service
```ts
import * as admin from 'firebase-admin';

@Injectable()
export class PushNotificationService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  async sendToDevice(token: string, title: string, body: string) {
    return admin.messaging().send({
      token,
      notification: { title, body },
    });
  }

  async sendToTopic(topic: string, title: string, body: string) {
    return admin.messaging().send({
      topic,
      notification: { title, body },
    });
  }
}
```

---

## Stripe Payments

### Installation
```bash
npm install stripe
```

### Service
```ts
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(amount: number, currency = 'usd') {
    return this.stripe.paymentIntents.create({
      amount: amount * 100, // cents
      currency,
    });
  }

  async createCustomer(email: string, name: string) {
    return this.stripe.customers.create({ email, name });
  }
}
```

### Webhook Handler
```ts
@Controller('webhooks')
export class WebhooksController {
  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }

    return { received: true };
  }
}
```

---

## Best Practices

1. **Use environment variables** for API keys
2. **Implement retry logic** for external API calls
3. **Use queues** for email/SMS to avoid blocking
4. **Handle webhooks** for async events
5. **Log external API calls** for debugging
6. **Implement rate limiting** awareness
7. **Use templates** for consistent messaging
