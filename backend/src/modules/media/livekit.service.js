import { AccessToken } from "livekit-server-sdk";

/**
 * Returns the public WebSocket URL for the LiveKit SFU server
 */
export const getLiveKitUrl = () => {
  return process.env.LIVEKIT_URL || "ws://localhost:7880";
};

/**
 * Generates a cryptographically signed JWT token for a participant joining a LiveKit video room.
 *
 * @param {Object} params
 * @param {string} params.roomId - The unique identifier of the room
 * @param {Object} params.user - The authenticated user or guest object ({ _id, fullName, username, avatar, isGuest })
 * @param {boolean} [params.isHost=false] - Whether the user is the room creator/host
 * @param {Object} [params.permissions={}] - Granular participant publishing permissions
 * @returns {Promise<string>} Signed LiveKit JWT access token
 */
export const generateLiveKitToken = async ({
  roomId,
  user,
  isHost = false,
  permissions = {},
}) => {
  if (!roomId) {
    throw new Error("Room ID is required to generate a LiveKit token");
  }
  if (!user || !user._id) {
    throw new Error("User identity is required to generate a LiveKit token");
  }

  const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "secret";

  const participantIdentity = String(user._id);
  const participantName = user.fullName || user.username || `guest_${participantIdentity.slice(-6)}`;

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: participantName,
    ttl: "8h", // Token valid for 8 hours of continuous meeting
    metadata: JSON.stringify({
      avatar: user.avatar || "",
      isGuest: Boolean(user.isGuest),
      role: isHost ? "host" : "participant",
    }),
  });

  token.addGrant({
    room: roomId,
    roomJoin: true,
    canPublish: permissions.canPublish !== undefined ? permissions.canPublish : true,
    canSubscribe: permissions.canSubscribe !== undefined ? permissions.canSubscribe : true,
    canPublishData: permissions.canPublishData !== undefined ? permissions.canPublishData : true,
    roomAdmin: Boolean(isHost),
  });

  return await token.toJwt();
};
