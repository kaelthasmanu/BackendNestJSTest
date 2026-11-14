import {
  CreateDateColumn,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatus } from './types/task-status.js';

@Entity({ name: 'tasks' })
@Index('IDX_tasks_status', ['status'])
@Index('IDX_tasks_responsible', ['responsible'])
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 20, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'varchar', length: 120 })
  responsible: string;

  @Column({ type: 'date', name: 'due_date' })
  dueDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
