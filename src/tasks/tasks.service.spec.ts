import { NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { Task } from './task.entity.js';
import { TaskStatus } from './types/task-status.js';
import type { ListTasksQueryDto } from './dto/list-tasks-query.dto.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Pick<
    Repository<Task>,
    'create' | 'save' | 'findAndCount' | 'findOneBy' | 'merge' | 'delete'
  >;

  beforeEach(() => {
    repository = {
      create: vi.fn((input) => input as Task),
      save: vi.fn(async (task) => task),
      findAndCount: vi.fn(),
      findOneBy: vi.fn(),
      merge: vi.fn((task, input) => Object.assign(task, input)),
      delete: vi.fn(),
    };
    service = new TasksService(repository as Repository<Task>);
  });

  it('creates a task with the pending status by default', async () => {
    const input = {
      title: 'Write tests',
      description: 'Cover task endpoints',
      responsible: 'Manuel',
      dueDate: '2026-12-01',
    };

    await service.create(input);

    expect(repository.create).toHaveBeenCalledWith({
      ...input,
      status: TaskStatus.PENDING,
    });
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('filters and paginates tasks', async () => {
    vi.mocked(repository.findAndCount).mockResolvedValue([[], 23]);
    const query: ListTasksQueryDto = {
      status: TaskStatus.IN_PROGRESS,
      responsible: 'Manuel',
      page: 2,
      limit: 10,
    };

    const result = await service.findAll(query);

    expect(repository.findAndCount).toHaveBeenCalledWith({
      where: { status: TaskStatus.IN_PROGRESS, responsible: 'Manuel' },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: 10,
      take: 10,
    });
    expect(result.meta).toEqual({ page: 2, limit: 10, total: 23, totalPages: 3 });
  });

  it('returns 404 when a task does not exist', async () => {
    vi.mocked(repository.findOneBy).mockResolvedValue(null);

    await expect(service.findOne(44)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns 404 when deleting a task that does not exist', async () => {
    vi.mocked(repository.delete).mockResolvedValue({ affected: 0, raw: [] });

    await expect(service.remove(44)).rejects.toBeInstanceOf(NotFoundException);
  });
});
