# RxJS The NestJS Way

## Why RxJS in NestJS?

- **Interceptors** use Observables to wrap handler responses
- **HttpService** returns Observables
- **WebSockets** emit Observable streams
- **Microservices** communicate via Observable patterns

---

## Observable vs Promise

| Feature | Promise | Observable |
|---------|---------|------------|
| Values | Single | Multiple |
| Execution | Eager (runs immediately) | Lazy (runs on subscribe) |
| Cancelable | No | Yes |
| Operators | Limited | Rich (map, filter, retry) |

```typescript
// Promise - single value, eager
async getUser(): Promise<User> {
  return this.db.findOne(id);
}

// Observable - can emit multiple, lazy
getUser(): Observable<User> {
  return this.httpService.get(url).pipe(
    map(res => res.data),
  );
}
```

---

## Common RxJS Operators in NestJS

### map - Transform data

```typescript
return this.httpService.get('/users').pipe(
  map(response => response.data),
  map(users => users.filter(u => u.active)),
);
```

### catchError - Handle errors

```typescript
return this.httpService.get('/api').pipe(
  catchError(error => {
    this.logger.error(error);
    return of({ error: 'Fallback data' });
  }),
);
```

### tap - Side effects (logging)

```typescript
return this.httpService.get('/users').pipe(
  tap(response => this.logger.log(`Fetched ${response.data.length} users`)),
  map(response => response.data),
);
```

### retry - Retry on failure

```typescript
return this.httpService.get('/flaky-api').pipe(
  retry(3), // Retry up to 3 times
  catchError(err => of({ error: 'Failed after retries' })),
);
```

### timeout - Fail if too slow

```typescript
return this.httpService.get('/slow-api').pipe(
  timeout(5000),
  catchError(err => {
    if (err instanceof TimeoutError) {
      throw new RequestTimeoutException();
    }
    throw err;
  }),
);
```

### delay - Add delay

```typescript
return of({ data: 'result' }).pipe(
  delay(1000), // Wait 1 second
);
```

---

## Observable → Promise Conversion

### lastValueFrom (wait for completion)

```typescript
import { lastValueFrom } from 'rxjs';

async getUsers(): Promise<User[]> {
  const users$ = this.httpService.get('/users').pipe(
    map(res => res.data),
  );
  return lastValueFrom(users$);
}
```

### firstValueFrom (get first value)

```typescript
import { firstValueFrom } from 'rxjs';

async getFirstUser(): Promise<User> {
  const user$ = this.httpService.get('/users/1').pipe(
    map(res => res.data),
  );
  return firstValueFrom(user$);
}
```

---

## Parallel Requests with forkJoin

```typescript
import { forkJoin } from 'rxjs';

getMultipleResources(): Observable<[User[], Posts[]]> {
  return forkJoin([
    this.httpService.get('/users').pipe(map(r => r.data)),
    this.httpService.get('/posts').pipe(map(r => r.data)),
  ]);
}
```

---

## Sequential Requests with switchMap

```typescript
import { switchMap } from 'rxjs/operators';

getUserWithPosts(userId: string): Observable<UserWithPosts> {
  return this.httpService.get(`/users/${userId}`).pipe(
    switchMap(userResponse => {
      const user = userResponse.data;
      return this.httpService.get(`/users/${userId}/posts`).pipe(
        map(postsResponse => ({
          ...user,
          posts: postsResponse.data,
        })),
      );
    }),
  );
}
```

---

## Interceptor with RxJS

```typescript
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    return next.handle().pipe(
      // Transform response
      map(data => ({
        success: true,
        data,
        duration: Date.now() - now,
      })),
      // Log
      tap(response => console.log(`Response in ${response.duration}ms`)),
      // Handle errors
      catchError(err => {
        return throwError(() => err);
      }),
    );
  }
}
```

---

## Streaming with interval

```typescript
@Get('stream')
@Sse() // Server-Sent Events
streamData(): Observable<MessageEvent> {
  return interval(1000).pipe(
    take(10),
    map(count => ({
      data: { count, timestamp: new Date().toISOString() },
    })),
  );
}
```

---

## Combining Multiple Sources

### merge - Combine as they emit

```typescript
import { merge } from 'rxjs';

getNotifications(): Observable<Notification> {
  return merge(
    this.emailService.getNotifications(),
    this.smsService.getNotifications(),
    this.pushService.getNotifications(),
  );
}
```

### combineLatest - Wait for all, emit on any change

```typescript
import { combineLatest } from 'rxjs';

getDashboard(): Observable<Dashboard> {
  return combineLatest([
    this.usersService.getCount(),
    this.ordersService.getCount(),
    this.revenueService.getTotal(),
  ]).pipe(
    map(([users, orders, revenue]) => ({ users, orders, revenue })),
  );
}
```

---

## Error Handling Patterns

### Fallback Value

```typescript
return this.httpService.get('/api').pipe(
  catchError(() => of(defaultValue)),
);
```

### Retry with Delay

```typescript
import { retryWhen, delay, take } from 'rxjs/operators';

return this.httpService.get('/api').pipe(
  retryWhen(errors =>
    errors.pipe(
      delay(1000),  // Wait 1 second between retries
      take(3),      // Max 3 retries
    ),
  ),
);
```

### Exponential Backoff

```typescript
import { retryWhen, mergeMap, throwError, timer } from 'rxjs';

return this.httpService.get('/api').pipe(
  retryWhen(errors =>
    errors.pipe(
      mergeMap((error, i) => {
        const retryAttempt = i + 1;
        if (retryAttempt > 3) {
          return throwError(() => error);
        }
        const delayMs = Math.pow(2, retryAttempt) * 1000;
        return timer(delayMs);
      }),
    ),
  ),
);
```

---

## Best Practices

1. **Don't subscribe in services** - Let NestJS handle subscription
2. **Use operators instead of callbacks** - pipe() chains are cleaner
3. **Handle errors explicitly** - Always use catchError
4. **Convert to Promise when needed** - Use lastValueFrom/firstValueFrom
5. **Avoid nested subscribes** - Use switchMap, mergeMap instead
6. **Unsubscribe when needed** - takeUntil for cleanup
