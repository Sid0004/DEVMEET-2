'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Editor from '@monaco-editor/react';

import styles from './workspace.module.css';
import { API_BASE_URL, apiRequest } from '../../lib/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCredentials, logout } from '@/redux/features/authSlice';

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
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
  const [code, setCode] = useState('// Welcome to DevMeet Workspace. Collaborators will sync in real time.\n');
  const [language, setLanguage] = useState('TypeScript');
  const [files, setFiles] = useState<Array<{ name: string; content: string; language: string }>>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [roomName, setRoomName] = useState('DevMeet Session');
  const [roomUsers, setRoomUsers] = useState<Array<{ socketId: string; user: any }>>([]);
  const [messages, setMessages] = useState<Array<{ sender: any; text: string; timestamp: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Media States
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ [socketId: string]: MediaStream }>({});
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<{ stdout: string; stderr: string; error?: string } | null>(null);
  const [isJoinedCall, setIsJoinedCall] = useState(false);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const isRemoteChange = useRef(false);
  const peerConnections = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const candidateQueue = useRef<{ [socketId: string]: RTCIceCandidateInit[] }>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Ensure client mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle clicking outside the profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch current user if state is empty (e.g. on direct page refresh)
  useEffect(() => {
    if (!isMounted) return;

    const fetchUser = async () => {
      try {
        const response: any = await apiRequest('/api/v1/users/current-user');
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
        const response: any = await apiRequest(`/api/v1/rooms/${roomId}`);
        if (response?.data) {
          setRoomName(response.data.roomName);
          setLanguage(response.data.primaryLanguage || 'TypeScript');
          if (response.data.code) {
            setCode(response.data.code);
          }
          
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

    // 2. Emit Join Room
    socket.emit('join-room', { roomId, user });

    // 3. Handle Socket Events
    socket.on('room-state', async ({ code: existingCode, language: roomLang, files: roomFiles, messages: existingMessages }) => {
      if (roomFiles && roomFiles.length > 0) {
        isRemoteChange.current = true;
        setFiles(roomFiles);
      } else {
        const lang = roomLang || 'TypeScript';
        const ext = lang.toLowerCase() === 'python' ? 'py' : 'ts';
        const fallbackFiles = [{
          name: `main.${ext}`,
          content: existingCode || '// Welcome to DevMeet Workspace. Collaborators will sync in real time.\n',
          language: lang
        }];
        isRemoteChange.current = true;
        setFiles(fallbackFiles);
      }
      if (roomLang) {
        setLanguage(roomLang);
      }
      if (existingMessages) {
        setMessages(existingMessages);
      }
    });

    socket.on('files-update', ({ files: updatedFiles, activeFileIndex: updatedIndex }) => {
      isRemoteChange.current = true;
      if (updatedFiles) {
        setFiles(updatedFiles);
      }
      if (updatedIndex !== undefined) {
        setActiveFileIndex(updatedIndex);
      }
    });

    socket.on('call-state', ({ users }) => {
      // Filter out duplicate user IDs, usernames, emails or own socket
      const filtered = users.filter((u: any) => 
        u.user?._id !== user?._id && 
        u.user?.username !== user?.username &&
        u.user?.email !== user?.email
      );
      setRoomUsers(filtered);

      // Initiate WebRTC connection to each user actively in the call
      filtered.forEach(async (peer: { socketId: string; user: any }) => {
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
        } catch (err) {
          console.error('Error creating offer:', err);
        }
      });
    });

    socket.on('user-joined-call', ({ socketId, user: joinedUser }) => {
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

    socket.on('user-left-call', ({ socketId }) => {
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

    socket.on('webrtc-signal', async ({ senderSocketId, signal }) => {
      if (!localStreamRef.current) return; // Ignore signals if we are not in call
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
          await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc-signal', {
            targetSocketId: senderSocketId,
            signal: { type: 'answer', answer }
          });

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
            await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
            
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
        if (pc && pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        } else {
          if (!candidateQueue.current[senderSocketId]) {
            candidateQueue.current[senderSocketId] = [];
          }
          candidateQueue.current[senderSocketId].push(signal.candidate);
        }
      }
    });

    socket.on('code-update', ({ code: updatedCode }) => {
      isRemoteChange.current = true;
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

    socket.on('receive-message', (chatMsg) => {
      setMessages((prev) => [...prev, chatMsg]);
    });

    socket.on('user-disconnected', ({ socketId }) => {
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
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    if (value !== undefined && files[activeFileIndex]) {
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
    }
  };

  const handleTabSelect = (index: number) => {
    isRemoteChange.current = true;
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

    isRemoteChange.current = true;
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

    isRemoteChange.current = true;
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

    isRemoteChange.current = true;
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

  // Start Video Call
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      setIsJoinedCall(true);

      if (socketRef.current) {
        socketRef.current.emit('join-call');
      }
    } catch (err) {
      console.error('Failed to access camera/microphone:', err);
      alert('Could not access camera or microphone. Please check permissions and try again.');
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
    setIsMicMuted(false);
    setIsCameraOff(false);
  };

  // Toggle Mic
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicMuted(!isMicMuted);
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
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
      const response: any = await apiRequest('/api/v1/rooms/run', {
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
    } catch (err: any) {
      setConsoleOutput({ stdout: '', stderr: '', error: `Execution Error: ${err.message || err}` });
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/v1/users/logout', { method: 'POST' });
      dispatch(logout());
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(logout());
      router.push('/');
    }
  };

  if (!isMounted) {
    return (
      <div className={styles.layout} style={{ justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
        Loading workspace...
      </div>
    );
  }

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
            {roomUsers.length > 0 && (
              <div className={styles.collaborators}>
                <div className={styles.avatarStack}>
                  {roomUsers.map((peer, i) => (
                    <div 
                      key={peer.socketId} 
                      className={styles.avatar} 
                      style={{ 
                        backgroundColor: i % 2 === 0 ? 'var(--color-secondary)' : 'var(--color-primary)',
                        marginLeft: i === 0 ? '0' : '-0.5rem'
                      }}
                      title={peer.user?.fullName || peer.user?.username || 'Peer'}
                    >
                      {(peer.user?.fullName || peer.user?.username || 'P')[0].toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {roomUsers.length > 0 && <div className={styles.divider}></div>}

            {/* Profile Dropdown */}
            <div className={styles.profileContainer} ref={profileDropdownRef}>
              <button 
                className={styles.profileCircle}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                title="User Options"
              >
                {(user?.fullName || user?.username || 'U')[0].toUpperCase()}
              </button>

              {isProfileOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.profileHeader}>
                    <p className={styles.profileName}>{user?.fullName || user?.username || 'DevMeet User'}</p>
                    <p className={styles.profileEmail}>{user?.email || ''}</p>
                  </div>
                  <div className={styles.profileDivider}></div>
                  <Link href="/dashboard" className={styles.profileItem} onClick={() => setIsProfileOpen(false)}>
                    <span className="material-symbols-outlined">dashboard</span>
                    <span>Dashboard</span>
                  </Link>
                  <button onClick={handleLogout} className={styles.profileItemBtn}>
                    <span className="material-symbols-outlined">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
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

          {/* Video & Chat Collaborative Panel */}
          <aside className={styles.collabPanel}>
            {/* Video Feeds Section */}
            {!isJoinedCall ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem 1.5rem',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '0.75rem',
                margin: '0.75rem',
                textAlign: 'center',
                border: '1px dashed rgba(255, 255, 255, 0.15)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-outline)', marginBottom: '1rem' }}>
                  videocam_off
                </span>
                <h4 className="font-editorial italic" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                  Ready to connect?
                </h4>
                <p className="font-body" style={{ fontSize: '0.75rem', color: 'var(--color-outline-variant)', lineHeight: '1.4', maxWidth: '240px', marginBottom: '1.5rem' }}>
                  Join the room video call to pair program and share screens with your team.
                </p>
                <button
                  onClick={startCall}
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    color: 'var(--color-on-secondary)',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '0.625rem 1.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontFamily: 'var(--font-space-grotesk)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>videocam</span>
                  Join Video Call
                </button>
              </div>
            ) : (
              <div className={styles.videoGrid}>
                {/* Local Stream */}
                <div className={`${styles.videoBox} ${styles.videoBoxLocal}`}>
                  {localStream && !isCameraOff ? (
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
                      <div className={styles.videoPlaceholderAvatar}>
                        {(user?.fullName || user?.username || 'You')[0].toUpperCase()}
                      </div>
                    </div>
                  )}
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
                  <div className={styles.videoLabelLocal}>
                    <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>
                      {isMicMuted ? 'mic_off' : 'mic'}
                    </span>
                    You
                  </div>
                </div>

                {/* Remote Streams */}
                {roomUsers.map((peer) => {
                  const stream = remoteStreams[peer.socketId];
                  return (
                    <div key={peer.socketId} className={styles.videoBox}>
                      {stream ? (
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
                          <div className={styles.videoPlaceholderAvatar}>
                            {(peer.user?.fullName || peer.user?.username || 'P')[0].toUpperCase()}
                          </div>
                        </div>
                      )}
                      <div className={styles.videoLabel}>
                        <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>mic</span>
                        {peer.user?.fullName || peer.user?.username || 'Peer'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
