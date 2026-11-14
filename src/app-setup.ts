import {
  StandardSchemaValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupApp(app: INestApplication): void {
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tasks API | Contrato REST')
    .setDescription(
      [
        'API REST para administrar tareas, documentada con contratos OpenAPI.',
        '',
        '### Convenciones',
        '- Los estados disponibles son `pendiente`, `en curso` y `hecha`.',
        '- Las fechas límite usan `YYYY-MM-DD`; las marcas de auditoría se devuelven en UTC.',
        '- Los cuerpos y parámetros desconocidos o inválidos responden `400`.',
        '- La paginación usa `page` (predeterminado `1`) y `limit` (predeterminado `10`, máximo `100`).',
        '- El listado se ordena por creación descendente y combina los filtros con AND.',
        '- Las respuestas de error usan el formato HTTP de NestJS (`statusCode`, `message`, `error`).',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addTag('Tareas', 'Operaciones CRUD, filtrado y paginación de tareas.')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'docs-json',
    customSiteTitle: 'Tasks API | Swagger',
    swaggerOptions: {
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
    },
  });
}
