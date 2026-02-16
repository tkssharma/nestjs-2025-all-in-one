import { Controller, Get, Sse } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Observable, interval, of, forkJoin } from "rxjs";
import { map, take, delay } from "rxjs/operators";

interface MessageEvent {
  data: string | object;
}

/**
 * RxJS The NestJS Way Demo
 * Full documentation: docs/08-rxjs-nestjs.md
 */

@ApiTags("RxJS NestJS Way")
@Controller("rxjs")
export class RxjsNestjsWayController {
  @Get("observable")
  @ApiOperation({ summary: "Demo: Return Observable (NestJS auto-subscribes)" })
  getObservable(): Observable<{ message: string; timestamp: string }> {
    return of({
      message: "This is returned from an Observable",
      timestamp: new Date().toISOString(),
    }).pipe(delay(100));
  }

  @Get("parallel")
  @ApiOperation({ summary: "Demo: Parallel requests with forkJoin" })
  getParallel(): Observable<{ results: string[] }> {
    return forkJoin([
      of("Result 1").pipe(delay(100)),
      of("Result 2").pipe(delay(200)),
      of("Result 3").pipe(delay(150)),
    ]).pipe(map((results) => ({ results })));
  }

  @Sse("stream")
  @ApiOperation({ summary: "Demo: Server-Sent Events stream" })
  getStream(): Observable<MessageEvent> {
    return interval(1000).pipe(
      take(5),
      map((count) => ({
        data: { count: count + 1, timestamp: new Date().toISOString() },
      }))
    );
  }

  @Get("demo")
  @ApiOperation({ summary: "RxJS demo info" })
  getDemo() {
    return {
      availableEndpoints: [
        "/rxjs/observable - Returns data via Observable",
        "/rxjs/parallel - Demonstrates forkJoin",
        "/rxjs/stream - SSE stream (5 events)",
      ],
      documentation: "See docs/08-rxjs-nestjs.md for full guide",
    };
  }
}
