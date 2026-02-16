# 10. File Uploads & Media

NestJS provides seamless file upload handling with Multer integration.

---

## Libraries

| Library | Purpose |
|---------|---------|
| **Multer** | File upload handling |
| **Sharp** | Image processing |
| **Cloudinary** | Cloud media storage |
| **AWS S3** | Object storage |

---

## Multer Integration

### Installation
```bash
npm install @types/multer
```

Multer is included with `@nestjs/platform-express`.

### Single File Upload
```ts
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('uploads')
export class UploadsController {
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
```

### Multiple Files
```ts
import { FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';

@Post('multiple')
@UseInterceptors(FilesInterceptor('files', 10)) // max 10 files
uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
  return files.map(file => ({
    filename: file.originalname,
    size: file.size,
  }));
}

@Post('fields')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'avatar', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
]))
uploadFields(@UploadedFiles() files: {
  avatar?: Express.Multer.File[];
  documents?: Express.Multer.File[];
}) {
  return { avatar: files.avatar, documents: files.documents };
}
```

### File Validation
```ts
import { ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';

@Post('validated')
@UseInterceptors(FileInterceptor('file'))
uploadValidated(
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
      ],
    }),
  )
  file: Express.Multer.File,
) {
  return { filename: file.originalname };
}
```

### Custom Storage
```ts
import { diskStorage } from 'multer';
import { extname } from 'path';

@Post('disk')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Unsupported file type'), false);
      }
    },
  }),
)
uploadToDisk(@UploadedFile() file: Express.Multer.File) {
  return { path: file.path };
}
```

---

## AWS S3 Upload

### Installation
```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

### S3 Service
```ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: configService.get('AWS_SECRET_KEY'),
      },
    });
  }

  async upload(file: Express.Multer.File, key: string): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.configService.get('S3_BUCKET'),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${this.configService.get('S3_BUCKET')}.s3.amazonaws.com/${key}`;
  }
}
```

---

## Image Processing with Sharp

### Installation
```bash
npm install sharp
```

### Usage
```ts
import * as sharp from 'sharp';

@Injectable()
export class ImageService {
  async resize(file: Express.Multer.File, width: number, height: number) {
    return sharp(file.buffer)
      .resize(width, height)
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  async createThumbnail(file: Express.Multer.File) {
    return sharp(file.buffer)
      .resize(150, 150, { fit: 'cover' })
      .toBuffer();
  }
}
```

---

## Serve Static Files

```ts
// main.ts
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
}
```

---

## Best Practices

1. **Validate file types** on server side
2. **Limit file sizes** to prevent abuse
3. **Use cloud storage** for production (S3, Cloudinary)
4. **Generate unique filenames** to prevent conflicts
5. **Scan files for malware** in sensitive applications
6. **Use signed URLs** for private files
7. **Implement rate limiting** for upload endpoints
