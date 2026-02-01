import { OdomoStatsDto } from '../../odomo/dto/odomo-stats.dto.js';

export class SyncResponseDto {
  xpGained: number;
  kobansGained: number;
  newKobanBalance: number;
  odomo: OdomoStatsDto;
  leveledUp: boolean;
  stageEvolved: boolean;
}
