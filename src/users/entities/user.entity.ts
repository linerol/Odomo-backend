import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The unique identifier of the user' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  email: string;

  @ApiProperty({ example: 0, description: 'The current Koban balance of the user' })
  kobanBalance: number;

  @ApiProperty({ description: 'The date when the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date when the user was last updated' })
  updatedAt: Date;

  @ApiProperty({ example: false, description: 'Whether the user has seen the onboarding' })
  hasSeenOnboarding: boolean;

  @ApiProperty({ example: 10000, description: 'The daily step goal of the user' })
  stepGoal: number;

  @ApiProperty({ example: 14, description: 'Current daily step goal streak', required: false })
  streak?: number;

  @ApiProperty({ example: 245800, description: 'Total steps accumulated', required: false })
  totalSteps?: number;

  @ApiProperty({ example: 'avatar_1.png', description: 'The avatar chosen by the user', required: false, nullable: true })
  avatar: string | null;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
