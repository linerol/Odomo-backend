import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOdomoDto {
  @ApiPropertyOptional({ example: 'My Odomo', description: 'The name of the Odomo' })
  @IsString()
  @IsOptional()
  name?: string;
}
