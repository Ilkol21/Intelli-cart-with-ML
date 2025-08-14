// src/typeorm.logger.ts
import { Logger as NestLogger } from '@nestjs/common';
import { Logger as TypeOrmLoggerInterface, QueryRunner } from 'typeorm';

export class TypeOrmLogger implements TypeOrmLoggerInterface {
    private readonly logger = new NestLogger('TypeORM');

    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.logger.log(`Query: ${query} -- Parameters: ${JSON.stringify(parameters)}`);
    }

    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.logger.error(`Query Failed: ${query} -- Parameters: ${JSON.stringify(parameters)} -- Error: ${error}`);
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.logger.warn(`Query is slow: ${query} -- Execution time: ${time}ms -- Parameters: ${JSON.stringify(parameters)}`);
    }

    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        this.logger.log(message);
    }

    logMigration(message: string, queryRunner?: QueryRunner) {
        this.logger.log(message);
    }

    log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
        if (level === 'warn') {
            this.logger.warn(message);
        } else {
            this.logger.log(message);
        }
    }
}
