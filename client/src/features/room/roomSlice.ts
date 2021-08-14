import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { Member, RoomStatus } from '../../shared/types';

export interface RoomState {
  roomId: string | null | undefined;
  members: Member[];
  status: RoomStatus;
}

const initialState: RoomState = {
  roomId: null,
  members: [],
  status: RoomStatus.GatheringMembers,
};

export const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomStatus: (state, action: PayloadAction<RoomStatus>) => {
      state.status = action.payload;
    },
    setRoomId: (state, action: PayloadAction<string | null | undefined>) => {
      state.roomId = action.payload;
    },
    addAllMembers: (state, action: PayloadAction<Member[]>) => {
      state.members = action.payload;
    },
    updateRoom: (
      state,
      action: PayloadAction<{ roomId: string; members: Member[] }>
    ) => {
      state.roomId = action.payload.roomId;
      state.members = action.payload.members;
    },
  },
});

export const { addAllMembers, setRoomId, updateRoom, setRoomStatus } =
  roomSlice.actions;

export const selectMembers = (state: RootState) => state.room.members;
export const selectRoomId = (state: RootState) => state.room.roomId;
export const selectRoomStatus = (state: RootState) => state.room.status;

export default roomSlice.reducer;
