
export interface Prize {
  id: string;
  name: string;
  totalCount: number;
  remainingCount: number;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  hasWon: boolean;
}

export interface WinnerRecord {
  id: string;
  participantName: string;
  prizeName: string;
  method: string;
  timestamp: string;
}

export enum DrawMethod {
  SELECT_PRIZE_DRAW_PERSON = 'SELECT_PRIZE_DRAW_PERSON',
  DRAW_PERSON_ONLY = 'DRAW_PERSON_ONLY',
  DRAW_PERSON_THEN_PRIZE = 'DRAW_PERSON_THEN_PRIZE'
}
