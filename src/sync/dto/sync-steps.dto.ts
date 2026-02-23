import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncStepsDto {
  @ApiProperty({ example: 5000, description: 'Number of steps to sync' })
  @IsInt({ message: 'Steps must be an integer' })
  @Min(0, { message: 'Steps cannot be negative' })
  steps: number;
}
