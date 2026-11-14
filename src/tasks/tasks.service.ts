import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from './task.entity.js';
import { TaskStatus } from './types/task-status.js';
import { TASKS_REPOSITORY } from './constants/tasks.constants.js';
import type { CreateTaskInput } from './dto/create-task.dto.js';
import type { ListTasksQueryDto } from './dto/list-tasks-query.dto.js';
import type { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASKS_REPOSITORY)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async create(input: CreateTaskInput): Promise<Task> {
    const task = this.tasksRepository.create({
      ...input,
      status: input.status ?? TaskStatus.PENDING,
    });
    return this.tasksRepository.save(task);
  }

  async findAll(query: ListTasksQueryDto) {
    const { status, responsible, page, limit } = query;
    const [data, total] = await this.tasksRepository.findAndCount({
      where: {
        ...(status ? { status } : {}),
        ...(responsible ? { responsible } : {}),
      },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async update(id: number, input: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    this.tasksRepository.merge(task, input);
    return this.tasksRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const result = await this.tasksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }
}
