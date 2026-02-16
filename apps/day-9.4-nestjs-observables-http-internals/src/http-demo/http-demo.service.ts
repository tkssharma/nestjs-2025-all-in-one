import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Observable, of } from "rxjs";
import { map, catchError, tap, retry, timeout } from "rxjs/operators";
import { AxiosResponse, AxiosError } from "axios";
import { lastValueFrom, firstValueFrom } from "rxjs";

/**
 * ============================================================
 * HTTPSERVICE vs AXIOS
 * ============================================================
 *
 * AXIOS (Direct):
 * - Returns Promises
 * - Standard async/await
 * - No NestJS integration
 *
 * HTTPSERVICE (NestJS):
 * - Returns Observables
 * - RxJS operators (retry, timeout, etc.)
 * - Integrates with NestJS interceptors
 * - Can be mocked easily for testing
 *
 * ============================================================
 * OBSERVABLE → PROMISE CONVERSION
 * ============================================================
 *
 * If you need a Promise instead of Observable:
 *
 * // Get first value as Promise
 * const result = await firstValueFrom(observable);
 *
 * // Get last value as Promise (waits for completion)
 * const result = await lastValueFrom(observable);
 *
 * ============================================================
 */

@Injectable()
export class HttpDemoService {
  private readonly logger = new Logger(HttpDemoService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Basic GET request returning Observable
   */
  getUsers(): Observable<any[]> {
    return this.httpService
      .get("https://jsonplaceholder.typicode.com/users")
      .pipe(
        map((response: AxiosResponse) => response.data),
        tap((data) => this.logger.log(`Fetched ${data.length} users`)),
        catchError((error: AxiosError) => {
          this.logger.error(`Error fetching users: ${error.message}`);
          return of([]);
        })
      );
  }

  /**
   * GET request with path parameter
   */
  getUserById(id: number): Observable<any> {
    return this.httpService
      .get(`https://jsonplaceholder.typicode.com/users/${id}`)
      .pipe(
        map((response: AxiosResponse) => response.data),
        catchError((error: AxiosError) => {
          this.logger.error(`Error fetching user ${id}: ${error.message}`);
          return of(null);
        })
      );
  }

  /**
   * POST request
   */
  createPost(data: {
    title: string;
    body: string;
    userId: number;
  }): Observable<any> {
    return this.httpService
      .post("https://jsonplaceholder.typicode.com/posts", data)
      .pipe(
        map((response: AxiosResponse) => response.data),
        tap((result) => this.logger.log(`Created post with id: ${result.id}`)),
        catchError((error: AxiosError) => {
          this.logger.error(`Error creating post: ${error.message}`);
          throw error;
        })
      );
  }

  /**
   * Request with retry logic
   */
  getWithRetry(url: string, retries: number = 3): Observable<any> {
    return this.httpService.get(url).pipe(
      map((response: AxiosResponse) => response.data),
      retry(retries),
      catchError((error: AxiosError) => {
        this.logger.error(`Failed after ${retries} retries: ${error.message}`);
        return of({ error: "Request failed after retries" });
      })
    );
  }

  /**
   * Request with timeout
   */
  getWithTimeout(url: string, timeoutMs: number = 5000): Observable<any> {
    return this.httpService.get(url).pipe(
      map((response: AxiosResponse) => response.data),
      timeout(timeoutMs),
      catchError((error: any) => {
        if (error.name === "TimeoutError") {
          this.logger.error(`Request timed out after ${timeoutMs}ms`);
          return of({ error: "Request timed out" });
        }
        return of({ error: error.message });
      })
    );
  }

  /**
   * Observable → Promise conversion using lastValueFrom
   */
  async getUsersAsPromise(): Promise<any[]> {
    const users$ = this.httpService
      .get("https://jsonplaceholder.typicode.com/users")
      .pipe(map((response: AxiosResponse) => response.data));

    // Convert Observable to Promise
    return lastValueFrom(users$);
  }

  /**
   * Observable → Promise using firstValueFrom
   */
  async getFirstUser(): Promise<any> {
    const user$ = this.httpService
      .get("https://jsonplaceholder.typicode.com/users/1")
      .pipe(map((response: AxiosResponse) => response.data));

    return firstValueFrom(user$);
  }

  /**
   * Parallel requests using forkJoin pattern
   */
  getMultipleUsers(ids: number[]): Observable<any[]> {
    // Create array of observables
    const requests = ids.map((id) =>
      this.httpService
        .get(`https://jsonplaceholder.typicode.com/users/${id}`)
        .pipe(
          map((response: AxiosResponse) => response.data),
          catchError(() => of(null))
        )
    );

    // Import forkJoin from rxjs to execute in parallel
    const { forkJoin } = require("rxjs");
    return forkJoin(requests);
  }
}
