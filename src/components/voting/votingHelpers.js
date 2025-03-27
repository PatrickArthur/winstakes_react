// src/components/voting/votingHelpers.js

export const isVotingOpen = (challenge) => {
  if (!challenge.start_date) return false;

  const start = new Date(challenge.start_date);
  const now = new Date();
  const end = new Date(start.getTime() + 72 * 60 * 60 * 1000); // 72 hours
  return now >= start && now <= end;
};

export const canUserVote = (challenge, isParticipant, isFollowerOfCreator) => {
  switch (challenge.judging_method) {
    case "publicVote":
      return true;
    case "participantsOnly":
      return isParticipant;
    case "hybridVote":
      return isParticipant || isFollowerOfCreator;
    default:
      return false;
  }
};
