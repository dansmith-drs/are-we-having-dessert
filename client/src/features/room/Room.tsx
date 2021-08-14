import { push } from 'connected-react-router';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { WebSocketContext } from '../../websocket';
import { selectMembers, selectRoomId, selectRoomStatus } from './roomSlice';

export default function Room() {
  const members = useAppSelector(selectMembers);
  const roomId = useAppSelector(selectRoomId);
  const roomStatus = useAppSelector(selectRoomStatus);

  const { id } = useParams<{ id: string }>();
  const ws = React.useContext(WebSocketContext);
  const dispatch = useDispatch();

  const isHost = members.some(
    (member) => member.id === ws?.socket.id && member.isHost === true
  );

  React.useEffect(() => {
    if (roomId !== id) {
      console.log('joinRoom');
      console.log(roomId);
      console.log(id);
      ws?.joinRoom(id);
    }
  }, [id, ws, roomId]);

  console.log(members);
  return roomId ? (
    <div>
      Room {id}
      <ol>
        {members.map((member) => {
          return (
            <li key={member.id}>
              {member.id} - {member.name} - {member.isHost ? 'Host' : 'Member'}{' '}
              - {member.vote ? member.vote : 'No vote'}
            </li>
          );
        })}
      </ol>
      {isHost ? (
        <button
          onClick={() => {
            ws?.openVoting();
          }}
        >
          Start votes
        </button>
      ) : null}
      <div>Status: {roomStatus}</div>
    </div>
  ) : (
    <React.Fragment>
      <div>room not found</div>
      <button
        onClick={() => {
          dispatch(push('/'));
        }}
      >
        Home
      </button>
    </React.Fragment>
  );
}
