import * as React from 'react';
import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { WebSocketContext } from '../../websocket';
import { selectRoomId, setRoomId } from './roomSlice';

export default function JoinRoom() {
  const dispatch = useAppDispatch();
  const roomId = useAppSelector(selectRoomId);
  const { id } = useParams<{ id: string }>();
  const ws = useContext(WebSocketContext);
  const [roomToJoin, setRoomToJoin] = useState<string>(id || '');

  return (
    <div>
      Join Room
      <button
        onClick={() => {
          ws?.joinRoom(roomToJoin);
        }}
      >
        Join Room
      </button>
      <input
        value={roomToJoin}
        onChange={(e) => {
          if (roomId !== null) {
            dispatch(setRoomId(null));
          }

          setRoomToJoin(e.currentTarget.value);
        }}
      ></input>
      {roomId === undefined ? <div>Room not found: {roomToJoin}</div> : null}
      <button
        onClick={() => {
          ws?.createRoom();
        }}
      >
        Host
      </button>
    </div>
  );
}
