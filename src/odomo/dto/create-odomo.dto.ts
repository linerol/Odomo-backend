import { IsString, IsOptional } from 'class-validator';

export class CreateOdomoDto {
  @IsString()
  @IsOptional()
  name?: string;
}
