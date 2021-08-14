import express from 'express';
import { createServer } from 'http';
import { generateSlug } from 'random-word-slugs';
import { Server, Socket } from 'socket.io';
import { WebSocketEvents } from '../../client/src/shared/constants';
import { Member, RoomStatus } from '../../client/src/shared/types';
import { getRandomAnimal } from './animals';
import env from './config';
import { Room } from './types';

const app = express();
const httpServer = createServer(app);

if (!env.clientEndpoint) {
  throw new Error('Unknown clientEndpoint');
}
const io = new Server(httpServer, {
  cors: {
    origin: [env.clientEndpoint],
  },
});
const PORT = process.env.port || 3000;

let members: Member[] = [];
let rooms: Room[] = [];

app.get('/', (req, res) => {
  res.send('AWHD');
});

app.get('/members', (req, res) => {
  res.send(members);
});

app.get('/rooms', (req, res) => {
  res.send(rooms);
});

io.on('connection', (socket: Socket) => {
  console.log('user connected: ', socket.id);

  socket.on('disconnect', async () => {
    console.log('user disconnected');
    tidyRooms();
    findNewHost(socket.id);
    const foundMemberIndex = members.findIndex(
      (member) => member.id === socket.id
    );
    if (foundMemberIndex >= 0) {
      const removedMember = members.splice(foundMemberIndex, 1);
      const roomId = removedMember[0].roomId;
      // const allSocketIds = Array.from(
      //   (await io.sockets.in(roomId).allSockets()).keys()
      // );
      const roomMembers = getRoom(roomId).members;
      io.to(roomId).emit(WebSocketEvents.MemberDisconnected, {
        roomId,
        members: roomMembers,
      });
      // rooms = getActiveRooms();
    } else {
      // TODO: handle member not found
    }
  });

  socket.on(WebSocketEvents.CreateRoom, async () => {
    console.log(WebSocketEvents.CreateRoom);

    removeMemberIfAlreadyInRoom(socket);

    const roomId = generateSlug();
    await socket.join(roomId);

    // does member exist in another room
    const member = {
      roomId,
      vote: null,
      id: socket.id,
      isHost: true,
      name: getRandomAnimal(),
    };
    members.push(member);
    rooms.push({
      id: roomId,
      state: RoomStatus.GatheringMembers,
    });
    // rooms = getActiveRooms();
    io.to(roomId).emit(WebSocketEvents.RoomCreated, {
      roomId,
      members: [member],
    });
  });

  socket.on(WebSocketEvents.JoinRoom, async (roomId: string) => {
    const foundRoom = rooms.find((room) => room.id === roomId);
    removeMemberIfAlreadyInRoom(socket);
    if (foundRoom) {
      await socket.join(roomId);
      const member = {
        roomId,
        vote: null,
        id: socket.id,
        isHost: false,
        name: getRandomAnimal(),
      };
      members.push(member);
      // const allSocketIds = Array.from(
      //   (await io.sockets.in(roomId).allSockets()).keys()
      // );

      const roomMembers = getRoom(roomId).members;
      console.log(WebSocketEvents.RoomJoined);
      io.to(roomId).emit(WebSocketEvents.RoomJoined, {
        roomId,
        members: roomMembers,
      });
    } else {
      console.log(WebSocketEvents.RoomNotFound);
      io.to(socket.id).emit(WebSocketEvents.RoomNotFound, {
        roomId,
      });
    }
  });

  socket.on(WebSocketEvents.OpenVoting, () => {
    socket.rooms.forEach((room) => {
      io.to(room).emit(WebSocketEvents.OpenVoting);
    });
  });

  socket.on(WebSocketEvents.RevealVotes, () => {
    socket.rooms.forEach((room) => {
      io.to(room).emit(WebSocketEvents.RevealVotes);
    });
  });

  // Room left but still on site TODO //Might be able to get away with not doing this if we only connect to the socket in a lower component
  // socket.on(WebSocketEvents.JoinRoom, async (roomId: string) => {
  // findNewHost(socket.id)
  // });

  // room left
});

const getActiveRooms = () => {
  const rooms = Array.from(io.sockets.adapter.rooms);
  // Want to remove socketIds, i.e remove things that are not actually rooms
  const activeRooms = rooms.filter((room) => !room[1].has(room[0]));
  // Care about the name of the room
  return activeRooms.map((i) => i[0]);
};

const getRoom = (roomId: string) => {
  const membersInRoom = members.filter((member) => member.roomId === roomId);
  return {
    roomId: roomId,
    members: membersInRoom,
  };
};

const getRooms = () => {
  const roomIds = Array.from(new Set(members.map((member) => member.roomId)));
  const rooms = roomIds.map((roomId) => {
    const membersInRoom = members.filter((member) => member.roomId === roomId);
    return {
      roomId: roomId,
      members: membersInRoom,
    };
  });
  return rooms;
};

// The rooms that a member is a part of
const membersRooms = (memberId: string) => {
  const memberInRooms = members.filter((member) => member.id === memberId);
  return memberInRooms;
};

const removeMemberIfAlreadyInRoom = (socket: Socket) => {
  const memberRooms = membersRooms(socket.id);
  if (memberRooms.length > 0) {
    // Remove member from existing rooms
    members = members.filter((member) => {
      const memberInOtherRooms = memberRooms.find(
        (memberRoom) =>
          memberRoom.id === member.id && member.roomId === memberRoom.roomId
      );
      if (memberInOtherRooms) {
        socket.leave(member.roomId);
      }
      return !memberInOtherRooms;
    });
  }
};

const tidyRooms = () => {
  const activeRoomIds = getActiveRooms();
  rooms = rooms.filter((room) => {
    return activeRoomIds.some((activeRoomId) => {
      return activeRoomId === room.id;
    });
  });
};

/**
 *
 * @param memberId The memberId that was the host that is now not
 */
const findNewHost = (memberId: string) => {
  const memberDetails = members.filter(
    (member) => member.id === memberId && member.isHost === true
  );
  memberDetails.forEach((member) => {
    const roomToFindNewHost = member.roomId;
    const newHostIndex = members.findIndex(
      (member) => roomToFindNewHost === member.roomId && member.id !== memberId
    );
    if (newHostIndex >= 0) {
      members[newHostIndex].isHost = true;
      const roomMembers = getRoom(roomToFindNewHost).members;
      io.to(roomToFindNewHost).emit(WebSocketEvents.UpdateMembers, {
        roomMembers,
      });
    } else {
      console.log('None left in room');
    }
  });
};

httpServer.listen(PORT, () => {
  console.log(`The application is listening on port ${PORT}`);
});

// Host opens vote and then displays vote screen
// Submit vote go to waiting screen
// Host can close vote early
// Vote closed, summary screen
//ability to change vote

// There should be a host, if the host leaves then next person should be a host
// There should be a name generated for the member
