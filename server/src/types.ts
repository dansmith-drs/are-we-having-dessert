import { RoomStatus } from '../../client/src/shared/types';

export interface Room {
  id: string;
  state: RoomStatus;
}
