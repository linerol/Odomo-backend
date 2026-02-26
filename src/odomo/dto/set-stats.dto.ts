import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsOptional } from 'class-validator';

export class SetStatsDto {
    @ApiPropertyOptional({ description: 'New hunger value (0-100)', minimum: 0, maximum: 100 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    hunger?: number;

    @ApiPropertyOptional({ description: 'New happiness value (0-100)', minimum: 0, maximum: 100 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    happiness?: number;

    @ApiPropertyOptional({ description: 'New hygiene value (0-100)', minimum: 0, maximum: 100 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    hygiene?: number;
}
