import { Room } from "../room/room.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { generateLiveKitToken, getLiveKitUrl } from "./livekit.service.js";

/**
 * Generates an authenticated LiveKit video/audio session token for an active room.
 * Validates room existence, lock status, guest session boundaries, and permissions.
 */
export const getMediaToken = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const user = req.user;

  if (!roomId) {
    throw new ApiError(400, "Room ID is required");
  }
  if (!user) {
    throw new ApiError(401, "Authentication required to join media session");
  }

  // Validate guest session scope
  if (user.isGuest && user.guestRoomId && user.guestRoomId !== roomId) {
    throw new ApiError(403, "Guest session is only valid for the invited room");
  }

  const room = await Room.findOne({ roomId });
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  if (room.status === "ended") {
    throw new ApiError(400, "This room session has been ended by the host");
  }

  const isHost = !user.isGuest && room.host.toString() === user._id.toString();

  // Enforce room lock
  if (room.roomSettings?.isLocked && !isHost) {
    const isParticipant = room.participants?.some(
      (p) => p.toString() === user._id.toString()
    );
    if (!isParticipant) {
      throw new ApiError(403, "This room is locked by the host");
    }
  }

  // Enforce organization membership
  if (room.organization && !isHost) {
    if (user.isGuest) {
      throw new ApiError(403, "Organization rooms require a verified team account");
    }
    const userOrgs = user.organizations?.map((o) => o.toString()) || [];
    if (!userOrgs.includes(room.organization.toString())) {
      throw new ApiError(403, "You do not have permission to join this organization room");
    }
  }

  const token = await generateLiveKitToken({
    roomId,
    user,
    isHost,
    permissions: {
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        token,
        url: getLiveKitUrl(),
        roomId,
        identity: String(user._id),
      },
      "LiveKit media token issued successfully"
    )
  );
});
