import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Repository } from 'typeorm';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app-setup.js';
import { Task } from './../src/tasks/task.entity.js';
import { TASKS_REPOSITORY } from '../src/tasks/constants/tasks.constants.js';

describe('Tasks API (e2e)', () => {
  let app: INestApplication;
  let repository: Repository<Task>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    repository = app.get(TASKS_REPOSITORY);
  });

  beforeEach(async () => {
    await repository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a task and defaults its status to pending', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Prepare release',
        description: 'Run the release checklist',
        responsible: 'Manuel',
        dueDate: '2026-12-01',
      })
      .expect(201);

    expect(response.body.status).toBe('pendiente');
    expect(response.body.title).toBe('Prepare release');
  });

  it('rejects invalid input with 400', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: '',
        description: 'Invalid task',
        responsible: 'Manuel',
        dueDate: '2026-02-30',
      })
      .expect(400);
  });

  it('lists tasks with filters and pagination metadata', async () => {
    await request(app.getHttpServer()).post('/tasks').send({
      title: 'First task',
      description: 'For Manuel',
      responsible: 'Manuel',
      dueDate: '2026-12-01',
      status: 'en curso',
    });
    await request(app.getHttpServer()).post('/tasks').send({
      title: 'Second task',
      description: 'For Sam',
      responsible: 'Sam',
      dueDate: '2026-12-02',
    });

    const response = await request(app.getHttpServer())
      .get('/tasks?status=en%20curso&responsible=Manuel&page=1&limit=1')
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].responsible).toBe('Manuel');
    expect(response.body.meta).toEqual({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('paginates in stable order, filters results, and handles pages beyond the result set', async () => {
    const createdIds: number[] = [];

    for (let index = 0; index < 13; index += 1) {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: `Task ${index}`,
          description: `Description ${index}`,
          responsible: index % 2 === 0 ? 'Manuel' : 'Sam',
          dueDate: '2026-12-01',
          status: index % 3 === 0 ? 'pendiente' : 'en curso',
        })
        .expect(201);
      createdIds.push(response.body.id);
    }

    const firstPage = await request(app.getHttpServer())
      .get('/tasks?page=1&limit=5')
      .expect(200);
    const firstPageAgain = await request(app.getHttpServer())
      .get('/tasks?page=1&limit=5')
      .expect(200);
    const secondPage = await request(app.getHttpServer())
      .get('/tasks?page=2&limit=5')
      .expect(200);
    const lastPage = await request(app.getHttpServer())
      .get('/tasks?page=3&limit=5')
      .expect(200);

    expect(firstPage.body.meta).toEqual({
      page: 1,
      limit: 5,
      total: 13,
      totalPages: 3,
    });
    expect(firstPage.body.data.map((task: Task) => task.id)).toEqual(
      firstPageAgain.body.data.map((task: Task) => task.id),
    );
    expect(firstPage.body.data).toHaveLength(5);
    expect(secondPage.body.data).toHaveLength(5);
    expect(lastPage.body.data).toHaveLength(3);

    const allPageIds = [
      ...firstPage.body.data,
      ...secondPage.body.data,
      ...lastPage.body.data,
    ].map((task: Task) => task.id);
    expect(new Set(allPageIds).size).toBe(13);
    expect(allPageIds).toEqual([...createdIds].reverse());

    const filtered = await request(app.getHttpServer())
      .get('/tasks?status=pendiente&responsible=Sam&page=1&limit=5')
      .expect(200);
    expect(filtered.body.meta.total).toBe(2);
    expect(
      filtered.body.data.every(
        (task: Task) =>
          task.status === 'pendiente' && task.responsible === 'Sam',
      ),
    ).toBe(true);

    const outOfRange = await request(app.getHttpServer())
      .get('/tasks?page=99&limit=5')
      .expect(200);
    expect(outOfRange.body.data).toEqual([]);
    expect(outOfRange.body.meta).toEqual({
      page: 99,
      limit: 5,
      total: 13,
      totalPages: 3,
    });
  });

  it('rejects invalid filters, pagination, duplicate parameters, and unknown query fields', async () => {
    const invalidQueries = [
      '/tasks?page=0',
      '/tasks?page=1.5',
      '/tasks?page=1e2',
      '/tasks?page=1000001',
      '/tasks?limit=0',
      '/tasks?limit=101',
      '/tasks?limit=abc',
      '/tasks?status=unknown',
      '/tasks?responsible=%20',
      `/tasks?responsible=${'x'.repeat(121)}`,
      '/tasks?page=1&page=2',
      '/tasks?extra=true',
    ];

    for (const path of invalidQueries) {
      await request(app.getHttpServer()).get(path).expect(400);
    }
  });

  it('returns 404 for an unknown task', async () => {
    await request(app.getHttpServer()).get('/tasks/999').expect(404);
  });

  it('serves the OpenAPI document', async () => {
    const response = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);
    const specification = response.body;

    expect(specification.paths).toHaveProperty('/tasks');
    expect(specification.paths).toHaveProperty('/tasks/{id}');
    const createRequest =
      specification.paths['/tasks'].post.requestBody.content['application/json']
        .schema;
    expect(createRequest).toMatchObject({
      type: 'object',
      additionalProperties: false,
      required: ['title', 'description', 'responsible', 'dueDate'],
    });
    expect(createRequest.properties).toHaveProperty('title');
    expect(createRequest.properties).toHaveProperty('status');
    expect(
      specification.paths['/tasks'].post.responses['201'].content[
        'application/json'
      ].schema.$ref,
    ).toBe('#/components/schemas/TaskResponseDto');
    expect(
      specification.paths['/tasks'].get.parameters.map(
        (parameter: { name: string }) => parameter.name,
      ),
    ).toEqual(['status', 'responsible', 'page', 'limit']);
    expect(
      specification.paths['/tasks'].get.responses['200'].content[
        'application/json'
      ].schema.$ref,
    ).toBe('#/components/schemas/TaskListResponseDto');
    expect(
      specification.paths['/tasks'].get.parameters[2].schema,
    ).toMatchObject({
      type: 'integer',
      minimum: 1,
      maximum: 1_000_000,
      default: 1,
    });
    const updateRequest =
      specification.paths['/tasks/{id}'].patch.requestBody.content[
        'application/json'
      ].schema;
    expect(updateRequest).toMatchObject({
      type: 'object',
      additionalProperties: false,
    });
    expect(updateRequest.required).toBeUndefined();
    expect(updateRequest.properties).toHaveProperty('status');
    expect(specification.paths['/tasks/{id}'].patch.description).toContain(
      'al menos un campo',
    );
    expect(
      specification.components.schemas.TaskResponseDto.properties,
    ).toHaveProperty('createdAt');
    expect(
      specification.components.schemas.TaskResponseDto.properties,
    ).toHaveProperty('updatedAt');
    expect(specification.components.schemas.TaskStatus.enum).toEqual([
      'pendiente',
      'en curso',
      'hecha',
    ]);
  });

  it('updates and deletes a task', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Update this task',
        description: 'Verify PATCH and DELETE',
        responsible: 'Manuel',
        dueDate: '2026-12-01',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({ status: 'hecha' })
      .expect(200)
      .expect(({ body }) => expect(body.status).toBe('hecha'));

    await request(app.getHttpServer())
      .delete(`/tasks/${created.body.id}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/tasks/${created.body.id}`)
      .expect(404);
  });

  it('normalizes task fields, preserves omitted fields in PATCH, and rejects invalid writes atomically', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: '  Original title  ',
        description: '  Original description  ',
        responsible: '  Manuel  ',
        dueDate: '2026-12-01',
      })
      .expect(201);

    expect(created.body).toMatchObject({
      title: 'Original title',
      description: 'Original description',
      responsible: 'Manuel',
      status: 'pendiente',
    });

    const invalidBodies = [
      {},
      { title: null },
      { title: '  ' },
      { title: 'Must not be persisted', status: 'invalid' },
      { description: 'x'.repeat(5001) },
      { responsible: 'x'.repeat(121) },
      { dueDate: '2026-02-30' },
      { extra: true },
    ];
    for (const body of invalidBodies) {
      await request(app.getHttpServer())
        .patch(`/tasks/${created.body.id}`)
        .send(body)
        .expect(400);
    }

    const unchanged = await request(app.getHttpServer())
      .get(`/tasks/${created.body.id}`)
      .expect(200);
    expect(unchanged.body).toMatchObject({
      title: 'Original title',
      description: 'Original description',
      responsible: 'Manuel',
      dueDate: '2026-12-01',
      status: 'pendiente',
      createdAt: created.body.createdAt,
    });

    const updated = await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({ title: 'Updated title' })
      .expect(200);
    expect(updated.body).toMatchObject({
      title: 'Updated title',
      description: 'Original description',
      responsible: 'Manuel',
      dueDate: '2026-12-01',
      status: 'pendiente',
      createdAt: created.body.createdAt,
    });
    expect(updated.body.updatedAt >= created.body.updatedAt).toBe(true);
  });

  it('distinguishes malformed task IDs from missing tasks', async () => {
    for (const id of ['0', 'abc', '1.5']) {
      await request(app.getHttpServer()).get(`/tasks/${id}`).expect(400);
    }

    await request(app.getHttpServer())
      .patch('/tasks/999999')
      .send({ title: 'Valid title' })
      .expect(404);
    await request(app.getHttpServer()).delete('/tasks/999999').expect(404);
  });
});
