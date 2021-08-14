export interface Member {
  id: string;
  roomId: string;
  vote: number | null;
  isHost: boolean;
  name: string;
}

export enum RoomStatus {
  GatheringMembers = 'gathering_members',
  Voting = 'voting',
  WaitingForVotes = 'waiting_for_votes',
  VotingComplete = 'voting_complete',
}
