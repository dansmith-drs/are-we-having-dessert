export enum WebSocketEvents {
  CreateRoom = 'event://create-room',
  RoomCreated = 'event://room-created',
  RoomJoined = 'event://room-joined',
  MemberDisconnected = 'event://member-disconnected',
  JoinRoom = 'event://join-room',
  RoomNotFound = 'event://room-not-found',

  UpdateMembers = 'event://update-members',

  OpenVoting = 'event://open-voting',
  RevealVotes = 'event://reveal-votes',

  SubmitVote = 'event://submit-vote',
}
