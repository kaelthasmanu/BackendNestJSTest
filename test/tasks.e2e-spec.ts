import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Repository } from 'typeorm';
import { AppModule } from './../src/app.module.js';
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
        responsible: 'Alex',
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
        responsible: 'Alex',
        dueDate: '2026-02-30',
      })
      .expect(400);
  });

  it('lists tasks with filters and pagination metadata', async () => {
    await request(app.getHttpServer()).post('/tasks').send({
      title: 'First task',
      description: 'For Alex',
      responsible: 'Alex',
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
      .get('/tasks?status=en%20curso&responsible=Alex&page=1&limit=1')
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].responsible).toBe('Alex');
    expect(response.body.meta).toEqual({
      page: 1,
      limit: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('returns 404 for an unknown task', async () => {
    await request(app.getHttpServer()).get('/tasks/999').expect(404);
  });

  it('serves the OpenAPI document', async () => {
    const response = await request(app.getHttpServer()).get('/docs-json').expect(200);

    expect(response.body.paths).toHaveProperty('/tasks');
    expect(response.body.paths).toHaveProperty('/tasks/{id}');
  });

  it('updates and deletes a task', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Update this task',
        description: 'Verify PATCH and DELETE',
        responsible: 'Alex',
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
});
