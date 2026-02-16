import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get("user-agent") || "";
    const requestId = req.requestId || "unknown";
    const start = Date.now();

    res.on("finish", () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      this.logger.log(
        `[${requestId}] ${method} ${originalUrl} ${statusCode} - ${duration}ms - ${ip} - ${userAgent}`
      );
    });

    next();
  }
}
