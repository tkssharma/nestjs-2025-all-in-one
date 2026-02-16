import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { HttpDemoController } from "./http-demo.controller";
import { HttpDemoService } from "./http-demo.service";

/**
 * ============================================================
 * NESTJS HTTP MODULE (AXIOS)
 * ============================================================
 *
 * @nestjs/axios provides HttpModule and HttpService for making
 * external HTTP calls. It wraps Axios and returns Observables.
 *
 * ============================================================
 * CONFIGURATION OPTIONS
 * ============================================================
 *
 * HttpModule.register({
 *   timeout: 5000,           // Request timeout in ms
 *   maxRedirects: 5,         // Max redirects to follow
 *   baseURL: 'https://api.example.com',  // Base URL for requests
 *   headers: {               // Default headers
 *     'Content-Type': 'application/json',
 *   },
 * })
 *
 * ============================================================
 * ASYNC CONFIGURATION
 * ============================================================
 *
 * HttpModule.registerAsync({
 *   imports: [ConfigModule],
 *   inject: [ConfigService],
 *   useFactory: (config: ConfigService) => ({
 *     timeout: config.get('HTTP_TIMEOUT'),
 *     baseURL: config.get('API_BASE_URL'),
 *   }),
 * })
 *
 * ============================================================
 */

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [HttpDemoController],
  providers: [HttpDemoService],
})
export class HttpDemoModule {}
