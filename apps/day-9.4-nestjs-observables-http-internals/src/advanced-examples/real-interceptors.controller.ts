import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

/**
 * ============================================================
 * INTERCEPTORS - REAL USE CASES
 * ============================================================
 */

@ApiTags("Real Interceptors")
@Controller("interceptors")
export class RealInterceptorsController {
  @Get("use-cases")
  @ApiOperation({ summary: "Real-world interceptor use cases" })
  getUseCases() {
    return {
      title: "Real-World Interceptor Use Cases",
      useCases: {
        "1_response_transform": {
          name: "Response Transformation",
          description: "Wrap all responses in consistent format",
          code: `
            @Injectable()
            export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
              intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
                return next.handle().pipe(
                  map(data => ({
                    success: true,
                    data,
                    timestamp: new Date().toISOString(),
                  })),
                );
              }
            }
          `,
          output: '{ success: true, data: {...}, timestamp: "..." }',
        },
        "2_logging": {
          name: "Request/Response Logging",
          description: "Log request details and response time",
          code: `
            @Injectable()
            export class LoggingInterceptor implements NestInterceptor {
              private readonly logger = new Logger('HTTP');
              
              intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
                const request = context.switchToHttp().getRequest();
                const { method, url, body } = request;
                const now = Date.now();
                
                this.logger.log(\`→ \${method} \${url} \${JSON.stringify(body)}\`);
                
                return next.handle().pipe(
                  tap(response => {
                    this.logger.log(\`← \${method} \${url} \${Date.now() - now}ms\`);
                  }),
                );
              }
            }
          `,
        },
        "3_caching": {
          name: "Response Caching",
          description: "Cache responses to avoid repeated computation",
          code: `
            @Injectable()
            export class CacheInterceptor implements NestInterceptor {
              constructor(private cacheManager: Cache) {}
              
              async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
                const request = context.switchToHttp().getRequest();
                const cacheKey = \`\${request.method}:\${request.url}\`;
                
                const cached = await this.cacheManager.get(cacheKey);
                if (cached) {
                  return of(cached);
                }
                
                return next.handle().pipe(
                  tap(response => {
                    this.cacheManager.set(cacheKey, response, { ttl: 60 });
                  }),
                );
              }
            }
          `,
        },
        "4_timeout": {
          name: "Request Timeout",
          description: "Fail if handler takes too long",
          code: `
            @Injectable()
            export class TimeoutInterceptor implements NestInterceptor {
              intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
                return next.handle().pipe(
                  timeout(5000),
                  catchError(err => {
                    if (err instanceof TimeoutError) {
                      throw new RequestTimeoutException();
                    }
                    throw err;
                  }),
                );
              }
            }
          `,
        },
        "5_error_mapping": {
          name: "Error Mapping",
          description: "Transform errors to consistent format",
          code: `
            @Injectable()
            export class ErrorMappingInterceptor implements NestInterceptor {
              intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
                return next.handle().pipe(
                  catchError(err => {
                    if (err instanceof TypeORMError) {
                      throw new InternalServerErrorException('Database error');
                    }
                    if (err instanceof AxiosError) {
                      throw new BadGatewayException('External service error');
                    }
                    throw err;
                  }),
                );
              }
            }
          `,
        },
        "6_exclude_null": {
          name: "Exclude Null Values",
          description: "Remove null/undefined from responses",
          code: `
            @Injectable()
            export class ExcludeNullInterceptor implements NestInterceptor {
              intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
                return next.handle().pipe(
                  map(data => this.removeNulls(data)),
                );
              }
              
              private removeNulls(obj: any): any {
                return JSON.parse(JSON.stringify(obj, (_, value) => 
                  value === null ? undefined : value
                ));
              }
            }
          `,
        },
      },
    };
  }

  @Get("execution-context")
  @ApiOperation({ summary: "ExecutionContext in interceptors" })
  getExecutionContext() {
    return {
      title: "Using ExecutionContext in Interceptors",
      methods: {
        getClass: "Get controller class: context.getClass()",
        getHandler: "Get handler method: context.getHandler()",
        getType: "Get context type: context.getType() // 'http', 'ws', 'rpc'",
        switchToHttp: "Get HTTP objects: context.switchToHttp()",
        switchToWs: "Get WebSocket objects: context.switchToWs()",
        switchToRpc: "Get RPC objects: context.switchToRpc()",
      },
      httpContext: `
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        const next = ctx.getNext();
      `,
      readMetadata: `
        // Read custom metadata from handler
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
      `,
    };
  }

  @Get("conditional-skip")
  @ApiOperation({ summary: "Skip interceptor conditionally" })
  getConditionalSkip() {
    return {
      title: "Conditionally Skip Interceptor",
      pattern: `
        // Create a decorator to mark routes
        export const SkipLogging = () => SetMetadata('skipLogging', true);
        
        // Check in interceptor
        @Injectable()
        export class LoggingInterceptor implements NestInterceptor {
          constructor(private reflector: Reflector) {}
          
          intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
            const skipLogging = this.reflector.getAllAndOverride<boolean>('skipLogging', [
              context.getHandler(),
              context.getClass(),
            ]);
            
            if (skipLogging) {
              return next.handle(); // Skip logging
            }
            
            // Normal logging logic...
            return next.handle().pipe(tap(...));
          }
        }
        
        // Usage
        @SkipLogging()
        @Get('health')
        healthCheck() { return 'ok'; }
      `,
    };
  }

  @Get("stream-interceptor")
  @ApiOperation({ summary: "Interceptor for streaming responses" })
  getStreamInterceptor() {
    return {
      title: "Handling Streams in Interceptors",
      warning: "Be careful with interceptors that buffer the entire response",
      pattern: `
        @Injectable()
        export class StreamSafeInterceptor implements NestInterceptor {
          intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
            const response = context.switchToHttp().getResponse();
            
            // Check if response is a stream
            return next.handle().pipe(
              tap(data => {
                if (data instanceof Stream) {
                  // Don't try to transform streams
                  return;
                }
                // Transform non-stream responses
              }),
            );
          }
        }
      `,
    };
  }

  @Get("file-upload")
  @ApiOperation({ summary: "Interceptor for file uploads" })
  getFileUploadInterceptor() {
    return {
      title: "File Upload Interceptor Pattern",
      code: `
        @Injectable()
        export class FileValidationInterceptor implements NestInterceptor {
          constructor(
            private readonly maxSize: number,
            private readonly allowedTypes: string[],
          ) {}
          
          intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
            const request = context.switchToHttp().getRequest();
            const file = request.file;
            
            if (!file) {
              throw new BadRequestException('File is required');
            }
            
            if (file.size > this.maxSize) {
              throw new PayloadTooLargeException(\`File too large. Max: \${this.maxSize}\`);
            }
            
            if (!this.allowedTypes.includes(file.mimetype)) {
              throw new UnsupportedMediaTypeException('Invalid file type');
            }
            
            return next.handle();
          }
        }
        
        // Usage
        @Post('upload')
        @UseInterceptors(
          FileInterceptor('file'),
          new FileValidationInterceptor(5 * 1024 * 1024, ['image/jpeg', 'image/png']),
        )
        upload(@UploadedFile() file: Express.Multer.File) {}
      `,
    };
  }
}
