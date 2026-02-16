import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { Observable } from "rxjs";
import { HttpDemoService } from "./http-demo.service";

@ApiTags("HTTP Module")
@Controller("http")
export class HttpDemoController {
  constructor(private readonly httpDemoService: HttpDemoService) {}

  @Get("users")
  @ApiOperation({ summary: "Get all users (Observable)" })
  @ApiResponse({ status: 200, description: "Returns users from external API" })
  getUsers(): Observable<any[]> {
    return this.httpDemoService.getUsers();
  }

  @Get("users/:id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  getUserById(@Param("id", ParseIntPipe) id: number): Observable<any> {
    return this.httpDemoService.getUserById(id);
  }

  @Post("posts")
  @ApiOperation({ summary: "Create a post (POST request demo)" })
  createPost(
    @Body() body: { title: string; body: string; userId: number }
  ): Observable<any> {
    return this.httpDemoService.createPost(body);
  }

  @Get("with-retry")
  @ApiOperation({ summary: "Demo: HTTP request with retry" })
  @ApiQuery({ name: "url", required: false, description: "URL to fetch" })
  @ApiQuery({
    name: "retries",
    required: false,
    description: "Number of retries",
  })
  getWithRetry(
    @Query("url") url?: string,
    @Query("retries") retries?: string
  ): Observable<any> {
    const targetUrl = url || "https://jsonplaceholder.typicode.com/posts/1";
    const retryCount = parseInt(retries || "3", 10);
    return this.httpDemoService.getWithRetry(targetUrl, retryCount);
  }

  @Get("with-timeout")
  @ApiOperation({ summary: "Demo: HTTP request with timeout" })
  @ApiQuery({ name: "timeout", required: false, description: "Timeout in ms" })
  getWithTimeout(@Query("timeout") timeoutMs?: string): Observable<any> {
    const timeout = parseInt(timeoutMs || "5000", 10);
    return this.httpDemoService.getWithTimeout(
      "https://jsonplaceholder.typicode.com/posts/1",
      timeout
    );
  }

  @Get("users-promise")
  @ApiOperation({ summary: "Demo: Observable → Promise with lastValueFrom" })
  @ApiResponse({ status: 200, description: "Returns users as Promise" })
  async getUsersAsPromise(): Promise<any[]> {
    return this.httpDemoService.getUsersAsPromise();
  }

  @Get("first-user")
  @ApiOperation({ summary: "Demo: Observable → Promise with firstValueFrom" })
  async getFirstUser(): Promise<any> {
    return this.httpDemoService.getFirstUser();
  }

  @Get("multiple-users")
  @ApiOperation({ summary: "Demo: Parallel requests with forkJoin" })
  @ApiQuery({
    name: "ids",
    description: "Comma-separated user IDs",
    example: "1,2,3",
  })
  getMultipleUsers(@Query("ids") ids: string): Observable<any[]> {
    const userIds = ids.split(",").map((id) => parseInt(id.trim(), 10));
    return this.httpDemoService.getMultipleUsers(userIds);
  }

  @Get("http-module-info")
  @ApiOperation({ summary: "Explain NestJS HTTP Module" })
  getHttpModuleInfo() {
    return {
      title: "NestJS HTTP Module Explained (Axios)",
      overview: "NestJS provides @nestjs/axios to make external HTTP calls",
      httpServiceVsAxios: {
        axios: {
          returns: "Promise",
          operators: "None (use async/await)",
          testing: "Need to mock axios directly",
          integration: "No NestJS integration",
        },
        httpService: {
          returns: "Observable",
          operators: "RxJS (map, retry, timeout, catchError)",
          testing: "Easy mocking via NestJS DI",
          integration: "Works with NestJS interceptors",
        },
      },
      configuration: {
        basic: `
          HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
            baseURL: 'https://api.example.com',
          })
        `,
        async: `
          HttpModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              timeout: config.get('HTTP_TIMEOUT'),
            }),
          })
        `,
      },
      observableToPromise: {
        lastValueFrom: "await lastValueFrom(observable) - waits for completion",
        firstValueFrom: "await firstValueFrom(observable) - gets first value",
        when: "Use when you need Promise (async/await) instead of Observable",
      },
      commonPatterns: {
        basicGet: `
          this.httpService.get(url).pipe(
            map(response => response.data)
          )
        `,
        withRetry: `
          this.httpService.get(url).pipe(
            map(response => response.data),
            retry(3)
          )
        `,
        withTimeout: `
          this.httpService.get(url).pipe(
            map(response => response.data),
            timeout(5000)
          )
        `,
        parallelRequests: `
          forkJoin([
            this.httpService.get(url1),
            this.httpService.get(url2),
          ]).pipe(
            map(([res1, res2]) => [res1.data, res2.data])
          )
        `,
      },
    };
  }
}
