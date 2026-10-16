/**
 * Resolves a unified, de-duplicated list of peers by cross-referencing:
 * 1. connectedUsers (Presence via Socket.IO)
 * 2. roomUsers (Active WebRTC SFU participants via LiveKit)
 *
 * Guarantees that:
 * - Local user is never duplicated in peers list
 * - Avatars from either Socket.IO or LiveKit metadata are preserved
 * - Remote media stream and mic/camera states are attached correctly
 */
export function resolveMeetingPeers({
  currentUser,
  connectedUsers = [],
  roomUsers = [],
  remoteStreams = {},
  remoteMediaStates = {},
}) {
  const currentUserId = currentUser?._id ? String(currentUser._id) : null;
  const peerMap = new Map();

  // 1. Ingest Socket.IO connected users
  connectedUsers.forEach((peer) => {
    if (!peer) return;
    const peerId = peer.user?._id ? String(peer.user._id) : peer.socketId;
    if (currentUserId && peerId === currentUserId) return;

    peerMap.set(peerId, {
      id: peerId,
      socketId: peer.socketId || peerId,
      name: peer.user?.fullName || peer.user?.username || peer.user?.name || "Collaborator",
      avatar: peer.user?.avatar || peer.user?.avatarUrl || null,
      isGuest: Boolean(peer.user?.isGuest),
    });
  });

  // 2. Ingest / enrich with LiveKit room users
  roomUsers.forEach((ru) => {
    if (!ru) return;
    const ruId = String(ru.user?._id || ru.identity || ru.socketId);
    if (currentUserId && ruId === currentUserId) return;

    const existing = peerMap.get(ruId) || {
      id: ruId,
      socketId: ru.socketId || ruId,
      name: ru.user?.fullName || ru.user?.username || "Collaborator",
      avatar: ru.user?.avatar || null,
      isGuest: Boolean(ru.user?.isGuest),
    };

    // Enrich avatar if missing from Socket.IO presence
    if (!existing.avatar && ru.user?.avatar) {
      existing.avatar = ru.user.avatar;
    }
    // Enrich name if fallback
    if (
      (!existing.name || existing.name === "Collaborator") &&
      (ru.user?.fullName || ru.user?.username)
    ) {
      existing.name = ru.user.fullName || ru.user.username;
    }

    peerMap.set(ruId, existing);
  });

  // 3. Attach LiveKit streams & media states
  return Array.from(peerMap.values()).map((peer) => {
    const peerId = peer.id;
    const isInCall = roomUsers.some(
      (ru) =>
        ru.socketId === peer.socketId ||
        ru.identity === peerId ||
        String(ru.user?._id) === peerId
    );
    const stream = remoteStreams[peerId] || remoteStreams[peer.socketId];
    const mediaState = remoteMediaStates[peerId] ||
      remoteMediaStates[peer.socketId] || {
        isCameraOff: true,
        isMicMuted: true,
      };

    return {
      socketId: peer.socketId,
      name: peer.name,
      avatar: peer.avatar,
      isInCall,
      stream,
      isCameraOff: mediaState.isCameraOff,
      isMicMuted: mediaState.isMicMuted,
      isMe: false,
    };
  });
}
