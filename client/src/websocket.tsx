import React, { createContext } from 'react';
import io, { Socket } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import {
  addAllMembers,
  setRoomId,
  setRoomStatus,
  updateRoom,
} from './features/room/roomSlice';
import { push } from 'connected-react-router';
import { WebSocketEvents } from './shared/constants';
import { Member, RoomStatus } from './shared/types';

// Required when adding declarations inside a module (.ts, not .d.ts)
// If you have documentation about why this is required I would love to know 🤓
declare global {
  // Target the module containing the `ProcessEnv` interface
  // https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
  namespace NodeJS {
    // Merge the existing `ProcessEnv` definition with ours
    // https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces
    export interface ProcessEnv {
      REACT_APP_SOCKET_ENDPOINT: string;
    }
  }
}

type WebSocketContextProps = {
  socket: Socket;
  createRoom: () => void;
  joinRoom: (roomId: string) => void;
  openVoting: () => void;
  revealVotes: () => void;
};
const WebSocketContext = createContext<WebSocketContextProps | null>(null);

export { WebSocketContext };

let socket: Socket | null = null;
let ws: WebSocketContextProps | null = null;
const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();

  const createRoom = () => {
    socket?.emit(WebSocketEvents.CreateRoom);
  };

  const joinRoom = (roomId: string) => {
    socket?.emit(WebSocketEvents.JoinRoom, roomId);
  };

  const openVoting = () => {
    socket?.emit(WebSocketEvents.OpenVoting);
  };

  const revealVotes = () => {
    socket?.emit(WebSocketEvents.RevealVotes);
  };

  if (!socket) {
    socket = io(process.env.REACT_APP_SOCKET_ENDPOINT);

    socket.on(
      WebSocketEvents.RoomCreated,
      (payload: { roomId: string; members: Member[] }) => {
        console.log(WebSocketEvents.RoomCreated);
        dispatch(updateRoom(payload));
        dispatch(push(`/room/${payload.roomId}`));
      }
    );

    socket.on(
      WebSocketEvents.RoomJoined,
      (payload: { roomId: string; members: Member[] }) => {
        console.log(WebSocketEvents.RoomJoined);
        dispatch(updateRoom(payload));
        dispatch(push(`/room/${payload.roomId}`));
      }
    );

    socket.on(
      WebSocketEvents.MemberDisconnected,
      (payload: { roomId: string; members: Member[] }) => {
        console.log(WebSocketEvents.MemberDisconnected);
        dispatch(addAllMembers(payload.members));
      }
    );

    socket.on(
      WebSocketEvents.MemberDisconnected,
      (payload: { roomId: string; members: Member[] }) => {
        console.log(WebSocketEvents.UpdateMembers);
        dispatch(addAllMembers(payload.members));
      }
    );

    socket.on(
      WebSocketEvents.RoomNotFound,
      (payload: { roomId: string; members: string[] }) => {
        console.log(WebSocketEvents.RoomNotFound);
        dispatch(setRoomId(undefined)); // Undefined means not found
        dispatch(addAllMembers([]));
      }
    );

    socket.on(WebSocketEvents.OpenVoting, () => {
      console.log(WebSocketEvents.OpenVoting);
      dispatch(setRoomStatus(RoomStatus.Voting));
    });

    socket.on(WebSocketEvents.RevealVotes, () => {
      console.log(WebSocketEvents.RevealVotes);
      dispatch(setRoomStatus(RoomStatus.VotingComplete));
    });

    ws = {
      socket,
      createRoom,
      joinRoom,
      openVoting,
      revealVotes,
    };
  }
  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
