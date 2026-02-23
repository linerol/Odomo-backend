import { OdomoStatsDto } from '../../odomo/dto/odomo-stats.dto.js';
import { ApiProperty } from '@nestjs/swagger';

export class SyncResponseDto {
  @ApiProperty()
  xpGained: number;
  @ApiProperty()
  kobansGained: number;
  @ApiProperty()
  newKobanBalance: number;
  @ApiProperty()
  odomo: OdomoStatsDto;
  @ApiProperty()
  leveledUp: boolean;
  @ApiProperty()
  stageEvolved: boolean;
}
