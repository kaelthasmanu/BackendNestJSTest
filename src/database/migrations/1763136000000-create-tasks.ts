import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

export class CreateTasks1763136000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const timestampType =
      queryRunner.connection.options.type === 'postgres' ? 'timestamptz' : 'datetime';

    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'title', type: 'varchar', length: '150' },
          { name: 'description', type: 'text' },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'pendiente'",
          },
          { name: 'responsible', type: 'varchar', length: '120' },
          { name: 'due_date', type: 'date' },
          {
            name: 'created_at',
            type: timestampType,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: timestampType,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        checks: [
          {
            name: 'CHK_tasks_status',
            expression: `"status" IN ('pendiente', 'en curso', 'hecha')`,
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({ name: 'IDX_tasks_status', columnNames: ['status'] }),
    );
    await queryRunner.createIndex(
      'tasks',
      new TableIndex({ name: 'IDX_tasks_responsible', columnNames: ['responsible'] }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tasks');
  }
}
