import { IsInt, Min } from 'class-validator';

export class SyncStepsDto {
  @IsInt({ message: 'Steps must be an integer' })
  @Min(0, { message: 'Steps cannot be negative' })
  steps: number;
}
