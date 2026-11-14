import {
  Global,
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createDatabaseOptions } from './database-options.js';
import { DATA_SOURCE } from './database.constants.js';

@Injectable()
class DatabaseShutdown implements OnApplicationShutdown {
  constructor(@Inject(DATA_SOURCE) private readonly dataSource: DataSource) {}

  onApplicationShutdown(): Promise<void> {
    return this.dataSource.destroy();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: DATA_SOURCE,
      useFactory: async () => new DataSource(createDatabaseOptions()).initialize(),
    },
    DatabaseShutdown,
  ],
  exports: [DATA_SOURCE],
})
export class DatabaseModule {}
