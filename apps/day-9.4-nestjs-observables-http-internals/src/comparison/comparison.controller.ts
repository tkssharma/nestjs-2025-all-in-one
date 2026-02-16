import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

/**
 * ============================================================
 * FRAMEWORK COMPARISON
 * NestJS vs Express vs HapiJS
 * ============================================================
 */

@ApiTags("Comparison")
@Controller("comparison")
export class ComparisonController {
  @Get("nestjs-vs-express-vs-hapi")
  @ApiOperation({ summary: "Compare NestJS, Express, and HapiJS" })
  getComparison() {
    return {
      title: "NestJS vs Express vs HapiJS",
      overview: {
        express: "Minimalist, unopinionated web framework",
        nestjs: "Full-featured framework built on Express/Fastify",
        hapijs: "Configuration-centric enterprise framework",
      },
      comparison: {
        architecture: {
          express: {
            style: "Minimalist, no structure enforced",
            opinion: "Unopinionated - you decide everything",
            pattern: "No specific pattern (typically MVC)",
            pros: ["Maximum flexibility", "Lightweight"],
            cons: ["No guidance", "Inconsistent codebases"],
          },
          nestjs: {
            style: "Modular, Angular-inspired",
            opinion: "Opinionated with conventions",
            pattern: "Modules, Controllers, Services, DI",
            pros: ["Consistent structure", "Scalable", "Testable"],
            cons: ["Learning curve", "More boilerplate"],
          },
          hapijs: {
            style: "Configuration-based, plugin system",
            opinion: "Semi-opinionated",
            pattern: "Plugin architecture",
            pros: ["Enterprise-ready", "Built-in validation"],
            cons: ["Smaller ecosystem", "More verbose"],
          },
        },
        dependencyInjection: {
          express: {
            builtin: false,
            solution: "Manual or use libraries (inversify, tsyringe)",
          },
          nestjs: {
            builtin: true,
            solution: "First-class DI container, @Injectable()",
          },
          hapijs: {
            builtin: false,
            solution: "Manual, use plugins",
          },
        },
        typescript: {
          express: "Optional, needs setup",
          nestjs: "First-class, built-in",
          hapijs: "Supported, not primary",
        },
        scalability: {
          express: {
            rating: "Good with proper architecture",
            notes: "Depends entirely on developer",
          },
          nestjs: {
            rating: "Excellent",
            notes: "Modules naturally scale, microservices support",
          },
          hapijs: {
            rating: "Good",
            notes: "Plugin system helps organization",
          },
        },
        learningCurve: {
          express: {
            difficulty: "Easy",
            time: "1-2 days for basics",
            prerequisite: "JavaScript/Node.js",
          },
          nestjs: {
            difficulty: "Medium-High",
            time: "1-2 weeks",
            prerequisite: "TypeScript, OOP concepts, ideally Angular",
          },
          hapijs: {
            difficulty: "Medium",
            time: "3-5 days",
            prerequisite: "JavaScript/Node.js",
          },
        },
        ecosystem: {
          express: {
            size: "Largest",
            middleware: "Thousands available",
            community: "Huge",
          },
          nestjs: {
            size: "Growing rapidly",
            middleware: "Can use Express middleware + own modules",
            community: "Active, enterprise adoption",
          },
          hapijs: {
            size: "Smaller",
            middleware: "Plugin-based (fewer options)",
            community: "Niche, enterprise",
          },
        },
        testing: {
          express: "Manual setup (Jest, Mocha, Supertest)",
          nestjs: "Built-in testing utilities, DI makes mocking easy",
          hapijs: "@hapi/lab and @hapi/code (custom tools)",
        },
        performance: {
          express: "Fast (baseline)",
          nestjs: "Similar to Express (it uses Express/Fastify)",
          hapijs: "Slightly slower due to more features",
        },
      },
      codeComparison: {
        simpleEndpoint: {
          express: `
            const express = require('express');
            const app = express();
            
            app.get('/users', (req, res) => {
              res.json([{ id: 1, name: 'John' }]);
            });
            
            app.listen(3000);
          `,
          nestjs: `
            @Controller('users')
            export class UsersController {
              constructor(private usersService: UsersService) {}
              
              @Get()
              findAll() {
                return this.usersService.findAll();
              }
            }
          `,
          hapijs: `
            const Hapi = require('@hapi/hapi');
            
            const server = Hapi.server({ port: 3000 });
            
            server.route({
              method: 'GET',
              path: '/users',
              handler: () => [{ id: 1, name: 'John' }]
            });
            
            server.start();
          `,
        },
      },
    };
  }

  @Get("when-to-use-nestjs")
  @ApiOperation({ summary: "When to choose NestJS" })
  getWhenToUseNestJS() {
    return {
      title: "When to Use NestJS",
      idealFor: [
        "Enterprise applications with complex business logic",
        "Teams familiar with Angular or TypeScript",
        "Microservices architecture",
        "Projects requiring strong typing and maintainability",
        "Long-term projects with multiple developers",
        "APIs that need built-in validation, auth, caching",
        "When you want conventions over configuration",
      ],
      benefits: [
        "Consistent project structure across teams",
        "Built-in dependency injection",
        "First-class TypeScript support",
        "Modular architecture scales well",
        "Excellent documentation",
        "Active community and ecosystem",
        "Easy testing with mocking",
        "Supports both REST and GraphQL",
        "Microservices support out of the box",
      ],
    };
  }

  @Get("when-not-to-use-nestjs")
  @ApiOperation({ summary: "When NOT to use NestJS" })
  getWhenNotToUseNestJS() {
    return {
      title: "When NOT to Use NestJS",
      avoidWhen: [
        {
          scenario: "Simple scripts or CLI tools",
          reason: "Overkill - too much boilerplate for simple tasks",
          alternative: "Plain Node.js or Express",
        },
        {
          scenario: "Small prototypes or MVPs",
          reason: "Setup time may slow initial development",
          alternative: "Express with minimal structure",
        },
        {
          scenario: "Team unfamiliar with TypeScript/OOP",
          reason: "Steep learning curve will slow the team",
          alternative: "Express until team is ready",
        },
        {
          scenario: "Performance-critical edge functions",
          reason: "DI and decorators add (minimal) overhead",
          alternative: "Fastify standalone or raw Node.js",
        },
        {
          scenario: "Serverless with cold start concerns",
          reason: "Module initialization adds to cold start time",
          alternative: "Lighter frameworks or compile to single file",
        },
        {
          scenario: "You need maximum flexibility",
          reason: "NestJS is opinionated, may feel restrictive",
          alternative: "Express or Koa",
        },
      ],
      summary:
        "NestJS is powerful but not always necessary. Match the tool to the problem.",
    };
  }

  @Get("migration-express-to-nestjs")
  @ApiOperation({ summary: "Tips for migrating Express to NestJS" })
  getMigrationTips() {
    return {
      title: "Migrating from Express to NestJS",
      approach: "Incremental migration is recommended",
      steps: [
        {
          step: 1,
          title: "Keep Express middleware",
          tip: "NestJS can use Express middleware directly",
          example: "app.use(cors()), app.use(helmet())",
        },
        {
          step: 2,
          title: "Convert routes to controllers",
          tip: "Map Express routes to NestJS controller methods",
        },
        {
          step: 3,
          title: "Extract business logic to services",
          tip: "Move logic out of route handlers into @Injectable() services",
        },
        {
          step: 4,
          title: "Organize into modules",
          tip: "Group related controllers and services into modules",
        },
        {
          step: 5,
          title: "Add validation with DTOs",
          tip: "Replace manual validation with class-validator",
        },
        {
          step: 6,
          title: "Implement guards for auth",
          tip: "Replace auth middleware with guards",
        },
      ],
      canKeep: [
        "Express middleware (CORS, Helmet, etc.)",
        "Existing database connections",
        "External service integrations",
      ],
      shouldChange: [
        "Route handlers → Controllers",
        "Manual DI → NestJS DI container",
        "Manual validation → ValidationPipe + DTOs",
        "Auth middleware → Guards",
      ],
    };
  }

  @Get("summary")
  @ApiOperation({ summary: "Quick decision summary" })
  getSummary() {
    return {
      title: "Quick Framework Decision Guide",
      chooseExpress: [
        "Small to medium projects",
        "Maximum flexibility needed",
        "Team prefers JavaScript over TypeScript",
        "Quick prototypes",
        "Simple REST APIs",
      ],
      chooseNestJS: [
        "Enterprise applications",
        "TypeScript-first development",
        "Need structure and conventions",
        "Microservices architecture",
        "Long-term maintainability matters",
        "Team familiar with Angular patterns",
      ],
      chooseHapi: [
        "Enterprise with specific security requirements",
        "Configuration-driven development",
        "Need built-in input validation",
        "Prefer plugins over middleware",
      ],
      bottomLine:
        "NestJS = Structure + TypeScript + DI. Express = Flexibility + Simplicity. Choose based on project needs and team expertise.",
    };
  }
}
