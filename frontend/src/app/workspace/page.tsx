'use client';

import React, { useState, useEffect, useLayoutEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Editor from '@monaco-editor/react';

import styles from './workspace.module.css';
import { API_BASE_URL, apiRequest } from '../../lib/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCredentials, User } from '@/redux/features/authSlice';
import ProfileDropdown from '../components/ProfileDropdown';

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

interface WorkspaceFile {
  name: string;
  content: string;
  language: string;
}

interface ChatMessage {
  sender: User | null;
  text: string;
  timestamp: string;
}

interface CallUser {
  socketId: string;
  user: User;
}

interface RoomStatePayload {
  code?: string;
  language?: string;
  files?: WorkspaceFile[];
  messages?: ChatMessage[];
  users?: CallUser[];
}

interface FilesUpdatePayload {
  files?: WorkspaceFile[];
  activeFileIndex?: number;
}

interface WebRTCSignalPayload {
  senderSocketId: string;
  signal: {
    type: 'offer' | 'answer' | 'candidate';
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
  };
}

interface RoomFetchResponse {
  data: {
    roomName: string;
    primaryLanguage?: string;
    code?: string;
    files?: WorkspaceFile[];
  };
}

const createDummyVideoTrack = (): MediaStreamTrack | null => {
  if (typeof window === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const stream = (canvas as any).captureStream ? (canvas as any).captureStream(1) : new MediaStream();
  return stream.getVideoTracks()[0] || null;
};

const createDummyAudioTrack = (): MediaStreamTrack | null => {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    oscillator.connect(dst);
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    if (track) {
      track.enabled = false;
    }
    return track || null;
  } catch (e) {
    return null;
  }
};

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className={styles.layout} style={{ justifyContent: 'center', alignItems: 'center', color: '#fff' }}>Loading workspace...</div>}>
      <WorkspaceContent />
    </Suspense>
  );
}

function WorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // States
  const [isMounted, setIsMounted] = useState(false);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [roomName, setRoomName] = useState('DevMeet Session');
  const [roomUsers, setRoomUsers] = useState<CallUser[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<CallUser[]>([]);
  const [remoteMediaStates, setRemoteMediaStates] = useState<{ [socketId: string]: { isCameraOff: boolean; isMicMuted: boolean } }>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  
  // Media States
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ [socketId: string]: MediaStream }>({});
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<{ stdout: string; stderr: string; error?: string } | null>(null);
  const [isJoinedCall, setIsJoinedCall] = useState(false);

  // Resizer States
  const [collabWidth, setCollabWidth] = useState(380);
  const [videoHeight, setVideoHeight] = useState(160);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const chatEndRef = useRef<HTMLDivElement>(null);
  const candidateQueue = useRef<{ [socketId: string]: RTCIceCandidateInit[] }>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const isJoinedCallRef = useRef(false);
  const isCameraOffRef = useRef(true);
  const isMicMutedRef = useRef(true);

  // Resizer drag event handlers
  const handleWidthResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = collabWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    // Disable pointer events on editor canvas during resize to prevent iframe focus theft
    const editorCanvas = document.querySelector(`.${styles.codeCanvas}`) as HTMLElement;
    if (editorCanvas) {
      editorCanvas.style.pointerEvents = 'none';
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const newWidth = Math.max(260, Math.min(600, startWidth + deltaX));
      setCollabWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (editorCanvas) {
        editorCanvas.style.pointerEvents = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleHeightResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = videoHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    // Disable pointer events on editor canvas during resize to prevent iframe focus theft
    const editorCanvas = document.querySelector(`.${styles.codeCanvas}`) as HTMLElement;
    if (editorCanvas) {
      editorCanvas.style.pointerEvents = 'none';
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(120, Math.min(500, startHeight + deltaY));
      setVideoHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (editorCanvas) {
        editorCanvas.style.pointerEvents = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Lock body scroll on workspace page before first paint to prevent layout shift
  useLayoutEffect(() => {
    document.documentElement.classList.add('workspace-active');
    document.body.classList.add('workspace-active');
    return () => {
      document.documentElement.classList.remove('workspace-active');
      document.body.classList.remove('workspace-active');
    };
  }, []);

  // Ensure client mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Keep isJoinedCallRef in sync
  useEffect(() => {
    isJoinedCallRef.current = isJoinedCall;
  }, [isJoinedCall]);

  useEffect(() => {
    isCameraOffRef.current = isCameraOff;
  }, [isCameraOff]);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  // On mount, initialize localStream with dummy tracks
  useEffect(() => {
    if (!isMounted) return;
    
    const dummyVideo = createDummyVideoTrack();
    const dummyAudio = createDummyAudioTrack();
    const tracks: MediaStreamTrack[] = [];
    if (dummyVideo) tracks.push(dummyVideo);
    if (dummyAudio) tracks.push(dummyAudio);
    
    if (tracks.length > 0) {
      const stream = new MediaStream(tracks);
      setLocalStream(stream);
      localStreamRef.current = stream;
    }
    
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [isMounted]);

  // Fetch current user if state is empty (e.g. on direct page refresh)
  useEffect(() => {
    if (!isMounted) return;

    const fetchUser = async () => {
      try {
        const response = await apiRequest<{ data: User }>('/api/v1/users/current-user');
        if (response?.data) {
          dispatch(setCredentials({ user: response.data }));
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        router.push('/login');
      }
    };

    if (!user) {
      fetchUser();
    }
  }, [user, dispatch, router, isMounted]);

  // Fetch Room Info
  useEffect(() => {
    if (!isMounted || !roomId) return;

    const fetchRoom = async () => {
      try {
        const response = await apiRequest<RoomFetchResponse>(`/api/v1/rooms/${roomId}`);
        if (response?.data) {
          setRoomName(response.data.roomName);
          
          let roomFiles = response.data.files || [];
          if (roomFiles.length === 0) {
            const lang = response.data.primaryLanguage || 'TypeScript';
            const ext = lang.toLowerCase() === 'python' ? 'py' : 'ts';
            roomFiles = [{
              name: `main.${ext}`,
              content: response.data.code || '// Welcome to DevMeet Workspace. Collaborators will sync in real time.\n',
              language: lang
            }];
          }
          setFiles(roomFiles);
          setActiveFileIndex(0);
        }
      } catch (err) {
        console.error('Failed to fetch room info:', err);
      }
    };

    fetchRoom();
  }, [roomId, isMounted]);

  // Initialize Socket.IO & Code Collaboration & Call Listeners
  useEffect(() => {
    if (!isMounted || !user || !roomId) return;

    // 1. Setup Socket.IO connection
    const socket = io(API_BASE_URL, {
      withCredentials: true
    });
    socketRef.current = socket;

    // 2. Emit Join Room & Join Call
    socket.emit('join-room', { roomId, user });
    setIsJoinedCall(true);
    socket.emit('join-call');

    // 3. Handle Socket Events
    socket.on('room-state', async ({ code: existingCode, language: roomLang, files: roomFiles, messages: existingMessages, users: roomUsersList }: RoomStatePayload) => {
      if (roomFiles && roomFiles.length > 0) {
        setFiles(roomFiles);
      } else {
        const lang = roomLang || 'TypeScript';
        const ext = lang.toLowerCase() === 'python' ? 'py' : 'ts';
        const fallbackFiles = [{
          name: `main.${ext}`,
          content: existingCode || '// Welcome to DevMeet Workspace. Collaborators will sync in real time.\n',
          language: lang
        }];
        setFiles(fallbackFiles);
      }
      if (existingMessages) {
        setMessages(existingMessages);
      }
      if (roomUsersList) {
        const filtered = roomUsersList.filter((u: CallUser) => 
          u.user?._id !== user?._id && 
          u.user?.username !== user?.username &&
          u.user?.email !== user?.email
        );
        setConnectedUsers(filtered);
      }
    });

    socket.on('user-joined', ({ socketId, user: joinedUser }: { socketId: string; user: User }) => {
      console.log('User joined room:', joinedUser.username);
      setConnectedUsers((prev) => {
        const filtered = prev.filter((u) => 
          u.user?._id !== joinedUser._id && 
          u.user?.username !== joinedUser.username &&
          u.user?.email !== joinedUser.email &&
          u.socketId !== socketId
        );
        return [...filtered, { socketId, user: joinedUser }];
      });
    });

    socket.on('files-update', ({ files: updatedFiles, activeFileIndex: updatedIndex }: FilesUpdatePayload) => {
      if (updatedFiles) {
        setFiles(updatedFiles);
      }
      if (updatedIndex !== undefined) {
        setActiveFileIndex(updatedIndex);
      }
    });

    socket.on('call-state', ({ users }: { users: CallUser[] }) => {
      // Filter out duplicate user IDs, usernames, emails or own socket
      const filtered = users.filter((u: CallUser) => 
        u.user?._id !== user?._id && 
        u.user?.username !== user?.username &&
        u.user?.email !== user?.email
      );
      setRoomUsers(filtered);
 
      // Initiate WebRTC connection to each user actively in the call
      filtered.forEach(async (peer: CallUser) => {
        const targetSocketId = peer.socketId;
        const pc = new RTCPeerConnection(rtcConfig);
        peerConnections.current[targetSocketId] = pc;
 
        // Add our local tracks
        const activeStream = localStreamRef.current;
        if (activeStream) {
          activeStream.getTracks().forEach((track) => {
            pc.addTrack(track, activeStream);
          });
        }
 
        // Handle Ice Candidate
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('webrtc-signal', {
              targetSocketId,
              signal: { type: 'candidate', candidate: event.candidate }
            });
          }
        };
 
        // Handle Remote Track
        pc.ontrack = (event) => {
          const remoteStream = event.streams[0] || new MediaStream([event.track]);
          setRemoteStreams((prev) => ({
            ...prev,
            [targetSocketId]: remoteStream
          }));
        };
 
        // Create offer
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc-signal', {
            targetSocketId,
            signal: { type: 'offer', offer }
          });
          // Send media state to the peer
          socket.emit('webrtc-signal', {
            targetSocketId,
            signal: {
              type: 'media-state',
              isCameraOff: isCameraOffRef.current,
              isMicMuted: isMicMutedRef.current
            }
          });
        } catch (err) {
          console.error('Error creating offer:', err);
        }
      });
    });

    socket.on('user-joined-call', ({ socketId, user: joinedUser }: { socketId: string; user: User }) => {
      console.log('User joined call:', joinedUser.username);
      // Filter out duplicate user ID, username, email or socket ID
      setRoomUsers((prev) => {
        const filtered = prev.filter((u) => 
          u.user?._id !== joinedUser._id && 
          u.user?.username !== joinedUser.username &&
          u.user?.email !== joinedUser.email &&
          u.socketId !== socketId
        );
        return [...filtered, { socketId, user: joinedUser }];
      });
    });

    socket.on('user-left-call', ({ socketId }: { socketId: string }) => {
      console.log('User left call:', socketId);
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
      }
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
      setRoomUsers((prev) => prev.filter((u) => u.socketId !== socketId));
    });

    socket.on('webrtc-signal', async ({ senderSocketId, signal }: WebRTCSignalPayload & { signal: any }) => {
      if (!isJoinedCallRef.current) return; // Ignore signals if we are not in call
      
      if (signal.type === 'media-state') {
        setRemoteMediaStates((prev) => ({
          ...prev,
          [senderSocketId]: {
            isCameraOff: signal.isCameraOff,
            isMicMuted: signal.isMicMuted
          }
        }));
        return;
      }

      let pc = peerConnections.current[senderSocketId];

      if (signal.type === 'offer') {
        if (!pc) {
          pc = new RTCPeerConnection(rtcConfig);
          peerConnections.current[senderSocketId] = pc;

          const activeStream = localStreamRef.current;
          if (activeStream) {
            activeStream.getTracks().forEach((track) => {
              pc.addTrack(track, activeStream);
            });
          }

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit('webrtc-signal', {
                targetSocketId: senderSocketId,
                signal: { type: 'candidate', candidate: event.candidate }
              });
            }
          };

          pc.ontrack = (event) => {
            const remoteStream = event.streams[0] || new MediaStream([event.track]);
            setRemoteStreams((prev) => ({
              ...prev,
              [senderSocketId]: remoteStream
            }));
          };
        }

        try {
          if (signal.offer) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc-signal', {
              targetSocketId: senderSocketId,
              signal: { type: 'answer', answer }
            });
            // Send our media state to the peer
            socket.emit('webrtc-signal', {
              targetSocketId: senderSocketId,
              signal: {
                type: 'media-state',
                isCameraOff: isCameraOffRef.current,
                isMicMuted: isMicMutedRef.current
              }
            });
          }

          // Process queued candidates
          const queued = candidateQueue.current[senderSocketId];
          if (queued) {
            for (const cand of queued) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand));
              } catch (e) {
                console.error('Error adding queued candidate:', e);
              }
            }
            delete candidateQueue.current[senderSocketId];
          }
        } catch (err) {
          console.error('Error handling offer:', err);
        }

      } else if (signal.type === 'answer') {
        if (pc) {
          try {
            if (signal.answer) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
            }
            
            // Process queued candidates
            const queued = candidateQueue.current[senderSocketId];
            if (queued) {
              for (const cand of queued) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(cand));
                } catch (e) {
                  console.error('Error adding queued candidate:', e);
                }
              }
              delete candidateQueue.current[senderSocketId];
            }
          } catch (err) {
            console.error('Error setting remote description:', err);
          }
        }
      } else if (signal.type === 'candidate') {
        if (pc && pc.remoteDescription && signal.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        } else if (signal.candidate) {
          if (!candidateQueue.current[senderSocketId]) {
            candidateQueue.current[senderSocketId] = [];
          }
          candidateQueue.current[senderSocketId].push(signal.candidate);
        }
      }
    });

    socket.on('code-update', ({ code: updatedCode }: { code?: string }) => {
      setFiles((prevFiles) => {
        if (prevFiles.length === 0) return prevFiles;
        return prevFiles.map((file, idx) => {
          if (idx === 0) {
            return { ...file, content: updatedCode || '' };
          }
          return file;
        });
      });
    });

    socket.on('receive-message', (chatMsg: ChatMessage) => {
      setMessages((prev) => [...prev, chatMsg]);
    });

    socket.on('user-disconnected', ({ socketId }: { socketId: string }) => {
      console.log('User disconnected:', socketId);
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
      }
      setRemoteStreams((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
      setRoomUsers((prev) => prev.filter((u) => u.socketId !== socketId));
      setConnectedUsers((prev) => prev.filter((u) => u.socketId !== socketId));
    });

    // Cleanup on unmount
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      Object.keys(peerConnections.current).forEach((id) => {
        peerConnections.current[id].close();
      });
      peerConnections.current = {};
    };
  }, [isMounted, user, roomId]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Code change emission
  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    const activeFile = files[activeFileIndex];
    if (!activeFile) return;

    // Direct content-comparison check to prevent cycles
    if (value === activeFile.content) {
      return;
    }

    const updated = files.map((file, idx) => {
      if (idx === activeFileIndex) {
        return { ...file, content: value };
      }
      return file;
    });
    setFiles(updated);
    if (socketRef.current) {
      socketRef.current.emit('files-change', { files: updated, activeFileIndex });
    }
  };

  const handleTabSelect = (index: number) => {
    setActiveFileIndex(index);
    if (socketRef.current) {
      socketRef.current.emit('files-change', { files, activeFileIndex: index });
    }
  };

  const handleCreateFile = (fileName: string) => {
    if (!fileName.trim()) return;
    
    if (files.some(f => f.name.toLowerCase() === fileName.trim().toLowerCase())) {
      alert('File already exists!');
      return;
    }

    const ext = fileName.split('.').pop()?.toLowerCase();
    let lang = 'TypeScript';
    if (ext === 'py') lang = 'Python';
    else if (ext === 'js' || ext === 'jsx') lang = 'JavaScript';
    else if (ext === 'rs') lang = 'Rust';
    else if (ext === 'go') lang = 'Go';

    const newFile = {
      name: fileName.trim(),
      content: '',
      language: lang
    };

    const updatedFiles = [...files, newFile];
    const newIndex = updatedFiles.length - 1;

    setFiles(updatedFiles);
    setActiveFileIndex(newIndex);
    setIsCreatingFile(false);
    setNewFileName('');

    if (socketRef.current) {
      socketRef.current.emit('files-change', { files: updatedFiles, activeFileIndex: newIndex });
    }
  };

  const handleDeleteFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    
    if (files.length <= 1) {
      alert('Cannot delete the only remaining file!');
      return;
    }

    const updatedFiles = files.filter((_, idx) => idx !== index);
    
    let newIndex = activeFileIndex;
    if (activeFileIndex >= updatedFiles.length) {
      newIndex = updatedFiles.length - 1;
    } else if (activeFileIndex === index) {
      newIndex = Math.max(0, index - 1);
    } else if (activeFileIndex > index) {
      newIndex = activeFileIndex - 1;
    }

    setFiles(updatedFiles);
    setActiveFileIndex(newIndex);

    if (socketRef.current) {
      socketRef.current.emit('files-change', { files: updatedFiles, activeFileIndex: newIndex });
    }
  };

  const handleLanguageChange = (newLang: string) => {
    if (files.length === 0) return;

    const activeFile = files[activeFileIndex];
    if (!activeFile) return;

    let ext = 'ts';
    if (newLang.toLowerCase() === 'python') ext = 'py';
    else if (newLang.toLowerCase() === 'javascript') ext = 'js';
    else if (newLang.toLowerCase() === 'rust') ext = 'rs';
    else if (newLang.toLowerCase() === 'go') ext = 'go';

    const nameParts = activeFile.name.split('.');
    if (nameParts.length > 1) {
      nameParts[nameParts.length - 1] = ext;
    } else {
      nameParts.push(ext);
    }
    const newName = nameParts.join('.');

    const updatedFiles = files.map((file, idx) => {
      if (idx === activeFileIndex) {
        return {
          ...file,
          name: newName,
          language: newLang
        };
      }
      return file;
    });

    setFiles(updatedFiles);

    if (socketRef.current) {
      socketRef.current.emit('files-change', { files: updatedFiles, activeFileIndex });
    }
  };

  // Chat message emission
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;

    socketRef.current.emit('send-message', { message: chatInput.trim() });
    setChatInput('');
  };

  const broadcastMediaState = (cameraOff: boolean, micMuted: boolean) => {
    Object.keys(peerConnections.current).forEach((socketId) => {
      if (socketRef.current) {
        socketRef.current.emit('webrtc-signal', {
          targetSocketId: socketId,
          signal: {
            type: 'media-state',
            isCameraOff: cameraOff,
            isMicMuted: micMuted
          }
        });
      }
    });
  };

  const acquireLocalStream = async (requestVideo: boolean, requestAudio: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: requestVideo,
        audio: requestAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      });
      setLocalStream(stream);
      localStreamRef.current = stream;

      // Update state track indicators
      setIsCameraOff(!requestVideo);
      setIsMicMuted(!requestAudio);

      // Disable tracks if they are supposed to start disabled
      if (!requestVideo) {
        stream.getVideoTracks().forEach(t => t.enabled = false);
      }
      if (!requestAudio) {
        stream.getAudioTracks().forEach(t => t.enabled = false);
      }

      // Add tracks to all active RTCPeerConnections
      Object.keys(peerConnections.current).forEach(async (socketId) => {
        const pc = peerConnections.current[socketId];
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Renegotiate: create new offer and send to remote peer
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (socketRef.current) {
            socketRef.current.emit('webrtc-signal', {
              targetSocketId: socketId,
              signal: { type: 'offer', offer }
            });
          }
        } catch (negotiateErr) {
          console.error('Error renegotiating track addition:', negotiateErr);
        }
      });

      // Broadcast state to all peers
      broadcastMediaState(!requestVideo, !requestAudio);
    } catch (err) {
      console.error('Failed to access camera/microphone:', err);
      alert('Could not access camera or microphone. Please check permissions and try again.');
    }
  };

  // Start Video Call
  const startCall = async () => {
    await acquireLocalStream(true, true);
    setIsJoinedCall(true);
    if (socketRef.current) {
      socketRef.current.emit('join-call');
    }
  };

  // Leave Video Call
  const leaveCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    localStreamRef.current = null;
    setIsJoinedCall(false);

    if (socketRef.current) {
      socketRef.current.emit('leave-call');
    }

    Object.keys(peerConnections.current).forEach((id) => {
      peerConnections.current[id].close();
      delete peerConnections.current[id];
    });

    setRemoteStreams({});
    setRoomUsers([]);
    setIsMicMuted(true);
    setIsCameraOff(true);
  };

  // Toggle Mic
  const toggleMic = async () => {
    if (localStream) {
      const nextMuted = !isMicMuted;
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
      setIsMicMuted(nextMuted);
      broadcastMediaState(isCameraOff, nextMuted);
    } else {
      await acquireLocalStream(!isCameraOff, true);
    }
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (localStream) {
      const nextCameraOff = !isCameraOff;
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !nextCameraOff;
      });
      setIsCameraOff(nextCameraOff);
      broadcastMediaState(nextCameraOff, isMicMuted);
    } else {
      await acquireLocalStream(true, !isMicMuted);
    }
  };

  // Code runner
  const handleRunCode = async () => {
    const activeFile = files[activeFileIndex];
    if (!activeFile) return;

    setIsRunningCode(true);
    setIsConsoleOpen(true);
    setConsoleOutput({ stdout: 'Running code on local sandbox server...', stderr: '' });
    try {
      interface RunCodeResponse {
        data: {
          stdout?: string;
          stderr?: string;
          exitCode: number;
        };
      }
      const response = await apiRequest<RunCodeResponse>('/api/v1/rooms/run', {
        method: 'POST',
        body: JSON.stringify({ 
          code: activeFile.content, 
          language: activeFile.language 
        })
      });
      const output = response?.data;
      if (output) {
        setConsoleOutput({
          stdout: output.stdout || '',
          stderr: output.stderr || '',
          error: output.exitCode !== 0 ? `Process exited with code ${output.exitCode}` : undefined
        });
      } else {
        setConsoleOutput({ stdout: '', stderr: 'Failed to execute code: invalid response format' });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setConsoleOutput({ stdout: '', stderr: '', error: `Execution Error: ${errorMsg}` });
    } finally {
      setIsRunningCode(false);
    }
  };


  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          {!isSidebarCollapsed ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <h1 className="font-editorial italic" style={{ margin: 0 }}>DevMeet</h1>
                <p className={styles.activeSessionText} style={{ margin: 0 }}>Active Session</p>
              </div>
              <button 
                onClick={() => setIsSidebarCollapsed(true)} 
                className={styles.sidebarToggleBtn}
                title="Collapse Sidebar"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <h1 className="font-editorial italic" style={{ fontSize: '1.25rem', margin: 0 }}>D</h1>
              <button 
                onClick={() => setIsSidebarCollapsed(false)} 
                className={styles.sidebarToggleBtn}
                title="Expand Sidebar"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>
        <nav className={styles.navMenu}>
          <a href="#" className={styles.navItemActive} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}>
            <span className="material-symbols-outlined">code</span>
            {!isSidebarCollapsed && <span className="font-tech">Editor</span>}
          </a>
        </nav>
        <div className={styles.sidebarFooter}>
          {!isSidebarCollapsed ? (
            <div style={{ textAlign: 'center', opacity: 0.4, padding: '1rem' }}>
              <span className="font-tech" style={{ fontSize: '0.625rem', letterSpacing: '0.1em' }}>DEVMEET V1.0</span>
            </div>
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.4, padding: '0.5rem 0' }}>
              <span className="font-tech" style={{ fontSize: '0.625rem' }}>V1</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace Canvas */}
      <main className={`${styles.mainCanvas} ${isSidebarCollapsed ? styles.mainCanvasSidebarCollapsed : ''}`}>
        {/* Top Toolbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div className={styles.fileInfo}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: 'var(--color-secondary)' }}>meeting_room</span>
              <span className="font-editorial italic" style={{ color: 'var(--color-on-surface)', fontSize: '1.125rem' }}>
                {roomName}
              </span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.toolbarActions}>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(roomId || '');
                  alert('Room ID copied to clipboard!');
                }} 
                className={styles.toolbarBtn}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginRight: '0.375rem' }}>content_copy</span>
                <span className="font-tech uppercase">Copy Code: {roomId}</span>
              </button>
            </div>
          </div>
          <div className={styles.topbarRight}>
            {connectedUsers.length > 0 && (
              <div className={styles.collaborators}>
                <div className={styles.avatarStack}>
                  {connectedUsers.map((peer, i) => {
                    const isInCall = roomUsers.some((ru) => ru.socketId === peer.socketId || ru.user?._id === peer.user?._id);
                    return (
                      <div 
                        key={peer.socketId} 
                        className={styles.avatar} 
                        style={{ 
                          backgroundColor: i % 2 === 0 ? 'var(--color-secondary)' : 'var(--color-primary)',
                          marginLeft: i === 0 ? '0' : '-0.5rem',
                          position: 'relative',
                          border: isInCall ? '2px solid #4ade80' : '2px solid var(--color-surface-container-lowest)'
                        }}
                        title={`${peer.user?.fullName || peer.user?.username || 'Peer'}${isInCall ? ' (In Call)' : ' (In Workspace)'}`}
                      >
                        {(peer.user?.fullName || peer.user?.username || 'P')[0].toUpperCase()}
                        {isInCall && (
                          <span 
                            style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-2px',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#4ade80',
                              border: '1px solid var(--color-surface-container-lowest)',
                              boxShadow: '0 0 4px #4ade80'
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {connectedUsers.length > 0 && <div className={styles.divider}></div>}

            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>
        </header>

        {/* Editor & Video Panel Split */}
        <div className={styles.workspaceSplit}>
          {/* Code Editor Section */}
          <section className={styles.editorPanel}>
            <div className={styles.fileTree}>
              <div className={styles.fileTreeHeader}>
                <h3 className="font-tech uppercase">
                  Workspace
                </h3>
                <button 
                  onClick={() => setIsCreatingFile(true)}
                  className={styles.addFileBtn}
                  title="Add File"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>add</span>
                </button>
              </div>

              {isCreatingFile && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateFile(newFileName);
                  }}
                  className={styles.createFileInputForm}
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="filename.ts..."
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className={styles.createFileInput}
                    onBlur={() => {
                      if (!newFileName.trim()) {
                        setIsCreatingFile(false);
                      }
                    }}
                  />
                </form>
              )}

              <ul className={styles.fileList}>
                {files.map((file, idx) => (
                  <li 
                    key={idx}
                    className={idx === activeFileIndex ? styles.fileItemActive : styles.fileItem}
                    onClick={() => handleTabSelect(idx)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>description</span>
                    <span className={styles.fileNameText}>{file.name}</span>
                    {files.length > 1 && (
                      <span 
                        className={`material-symbols-outlined ${styles.fileDeleteBtn}`}
                        onClick={(e) => handleDeleteFile(e, idx)}
                      >
                        close
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.codeCanvas}>
              {/* Tab Bar */}
              <div className={styles.tabBar}>
                <div className={styles.tabsContainer}>
                  {files.map((file, idx) => (
                    <div 
                      key={idx} 
                      className={idx === activeFileIndex ? styles.tabActive : styles.tab}
                      onClick={() => handleTabSelect(idx)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>description</span>
                      <span>{file.name}</span>
                      {files.length > 1 && (
                        <span 
                          className={`material-symbols-outlined ${styles.tabCloseBtn}`}
                          onClick={(e) => handleDeleteFile(e, idx)}
                        >
                          close
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Language Dropdown */}
                <div className={styles.languageSelectorContainer}>
                  <select 
                    value={files[activeFileIndex]?.language || 'TypeScript'}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className={styles.languageSelect}
                  >
                    <option value="TypeScript">TypeScript</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="Rust">Rust</option>
                    <option value="Go">Go</option>
                  </select>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <Editor
                  height="100%"
                  language={files[activeFileIndex]?.language.toLowerCase() || 'typescript'}
                  theme="vs-dark"
                  value={files[activeFileIndex]?.content || ''}
                  onChange={handleEditorChange}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    fontFamily: 'var(--font-geist-mono), monospace',
                    cursorBlinking: 'smooth',
                    padding: { top: 16 }
                  }}
                />
              </div>

              {/* Collapsible Console Output drawer */}
              {isConsoleOpen && (
                <div className={styles.consoleDrawer}>
                  <div className={styles.consoleHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={styles.consoleTitle}>CONSOLE OUTPUT</span>
                      <button
                        onClick={handleRunCode}
                        disabled={isRunningCode}
                        style={{
                          backgroundColor: 'var(--color-secondary)',
                          color: 'var(--color-on-secondary)',
                          border: 'none',
                          borderRadius: '0.25rem',
                          padding: '0.125rem 0.5rem',
                          fontSize: '0.6875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontFamily: 'var(--font-space-grotesk)'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>play_arrow</span>
                        Run Code
                      </button>
                    </div>
                    <button 
                      onClick={() => setIsConsoleOpen(false)}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.05rem' }}>close</span>
                    </button>
                  </div>
                  <div className={styles.consoleOutputArea}>
                    {!consoleOutput && 'Click "Run Code" to execute.'}
                    {consoleOutput && (
                      <>
                        {consoleOutput.stdout && (
                          <div style={{ color: '#a3efff' }}>{consoleOutput.stdout}</div>
                        )}
                        {consoleOutput.stderr && (
                          <div style={{ color: '#ff7b72', marginTop: '0.25rem' }}>{consoleOutput.stderr}</div>
                        )}
                        {consoleOutput.error && (
                          <div style={{ color: '#ff7b72', fontWeight: 'bold', marginTop: '0.25rem' }}>{consoleOutput.error}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.statusBar}>
                <div className={styles.statusLeft}>
                  <span className={styles.statusDot}></span>
                  <span style={{ cursor: 'pointer' }} onClick={() => setIsConsoleOpen(!isConsoleOpen)}>
                    {isConsoleOpen ? 'Hide Console' : 'Show Console'}
                  </span>
                  <span>Connected</span>
                  <span>{files[activeFileIndex]?.language || 'TypeScript'}</span>
                </div>
                <div className={styles.statusRight}>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className={styles.statusRunBtn}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', marginRight: '0.25rem' }}>play_arrow</span>
                    {isRunningCode ? 'Running...' : 'Run Code'}
                  </button>
                  <span>UTF-8</span>
                  <span>Room: {roomId}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Width Resizer Handle */}
          <div 
            className={styles.widthResizer} 
            onMouseDown={handleWidthResizeMouseDown}
          />

          {/* Video & Chat Collaborative Panel */}
          <aside className={styles.collabPanel} style={{ width: `${collabWidth}px` }}>
            {/* Video Feeds Section */}
            <div 
              className={styles.videoGrid}
              style={{ height: `${videoHeight}px`, maxHeight: `${videoHeight}px` }}
            >
              {/* Local Stream */}
              <div className={`${styles.videoBox} ${styles.videoBoxLocal}`} style={{ border: isJoinedCall ? '1px solid rgba(255,255,255,0.1)' : '1px dashed rgba(255,255,255,0.2)' }}>
                {isJoinedCall && localStream && !isCameraOff ? (
                  <video
                    ref={(el) => {
                      if (el && el.srcObject !== localStream) {
                        el.srcObject = localStream;
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                  />
                ) : (
                  <div className={styles.videoPlaceholder}>
                    <div className={styles.videoPlaceholderAvatar} style={{ border: isJoinedCall ? '2px solid #4ade80' : '2px dashed rgba(255,255,255,0.3)' }}>
                      {(user?.fullName || user?.username || 'You')[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-outline-variant)', marginTop: '0.25rem', fontFamily: 'var(--font-space-grotesk)' }}>
                      {isJoinedCall ? 'Camera Off' : 'Not in Call'}
                    </span>
                    {!isJoinedCall && (
                      <button
                        onClick={startCall}
                        style={{
                          marginTop: '0.5rem',
                          backgroundColor: 'var(--color-secondary)',
                          color: 'var(--color-on-secondary)',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontFamily: 'var(--font-space-grotesk)'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '0.75rem' }}>videocam</span>
                        Join Call
                      </button>
                    )}
                  </div>
                )}
                {isJoinedCall && (
                  <div className={styles.videoControls}>
                    <button 
                      onClick={toggleMic} 
                      className={`${styles.controlBtn} ${isMicMuted ? styles.controlBtnActive : ''}`}
                      title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.05rem' }}>
                        {isMicMuted ? 'mic_off' : 'mic'}
                      </span>
                    </button>
                    <button 
                      onClick={toggleCamera} 
                      className={`${styles.controlBtn} ${isCameraOff ? styles.controlBtnActive : ''}`}
                      title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.05rem' }}>
                        {isCameraOff ? 'videocam_off' : 'videocam'}
                      </span>
                    </button>
                    <button 
                      onClick={leaveCall} 
                      style={{
                        width: '1.75rem',
                        height: '1.75rem',
                        borderRadius: '0.375rem',
                        backgroundColor: '#ff4d4f',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s ease'
                      }}
                      title="Leave Video Call"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.05rem' }}>
                        call_end
                      </span>
                    </button>
                  </div>
                )}
                <div className={styles.videoLabelLocal}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
                    {isJoinedCall ? (isMicMuted ? 'mic_off' : 'mic') : 'videocam_off'}
                  </span>
                  You
                </div>
              </div>

              {/* Remote Streams */}
              {connectedUsers.map((peer) => {
                const isInCall = roomUsers.some((ru) => ru.socketId === peer.socketId || ru.user?._id === peer.user?._id);
                const stream = remoteStreams[peer.socketId];
                const mediaState = remoteMediaStates[peer.socketId] || { isCameraOff: true, isMicMuted: true };
                const showVideo = isInCall && stream && !mediaState.isCameraOff;
                return (
                  <div key={peer.socketId} className={styles.videoBox} style={{ border: isInCall ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                    {showVideo ? (
                      <video
                        ref={(el) => {
                          if (el && el.srcObject !== stream) {
                            el.srcObject = stream;
                          }
                        }}
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <div className={styles.videoPlaceholder}>
                        <div 
                          className={styles.videoPlaceholderAvatar}
                          style={{ border: isInCall ? '2px solid #4ade80' : '2px solid rgba(255,255,255,0.1)' }}
                        >
                          {(peer.user?.fullName || peer.user?.username || 'P')[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.625rem', color: 'var(--color-outline-variant)', marginTop: '0.25rem', fontFamily: 'var(--font-space-grotesk)' }}>
                          {isInCall ? (mediaState.isCameraOff ? 'Camera Off' : 'Active') : 'In Room'}
                        </span>
                      </div>
                    )}
                    <div className={styles.videoLabel}>
                      <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
                        {isInCall ? (mediaState.isMicMuted ? 'mic_off' : 'mic') : 'meeting_room'}
                      </span>
                      {peer.user?.fullName || peer.user?.username || 'Peer'}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Height Resizer Handle */}
            <div 
              className={styles.heightResizer}
              onMouseDown={handleHeightResizeMouseDown}
            />

            {/* Chat Interface */}
            <div className={styles.chatSection}>
              <div className={styles.chatHeader}>
                <h4 className="font-tech uppercase" style={{ fontSize: '0.6875rem', letterSpacing: '0.1em' }}>Team Chat</h4>
                {messages.length > 0 && (
                  <span className={styles.chatBadge}>{messages.length} msg</span>
                )}
              </div>

              <div className={styles.chatMessages}>
                {messages.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-outline-variant)', textAlign: 'center', marginTop: '2rem' }}>
                    No messages yet. Send a message to start chatting!
                  </p>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender?._id === user?._id;
                    return (
                      <div key={index} className={isMe ? styles.msgLocal : styles.msgRemote}>
                        <p className={styles.msgMeta}>
                          {isMe ? 'You' : msg.sender?.fullName || msg.sender?.username || 'Peer'} • {msg.timestamp}
                        </p>
                        <div className={isMe ? styles.msgBubbleLocal : styles.msgBubbleRemote}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className={styles.chatInputContainer}>
                <input 
                  type="text" 
                  placeholder="Send a message..." 
                  className={styles.chatInput}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className={styles.chatSendBtn}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>send</span>
                </button>
              </form>
            </div>
          </aside>
        </div>

        {/* Floating AI Action Button */}
        <Link href="/dashboard" className={styles.fabBtn}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>auto_awesome</span>
        </Link>
      </main>
    </div>
  );
}
