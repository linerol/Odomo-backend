import { IsEmail, IsString, MinLength, IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password of the user', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ example: false, description: 'Whether the user has seen the onboarding', required: false })
  @IsBoolean()
  @IsOptional()
  hasSeenOnboarding?: boolean;

  @ApiProperty({ example: 10000, description: 'The daily step goal of the user', required: false })
  @IsNumber()
  @Min(1000)
  @Max(100000)
  @IsOptional()
  stepGoal?: number;

  @ApiProperty({ example: 'avatar_1.png', description: 'The avatar chosen by the user', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;
}
