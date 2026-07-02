import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';

/**
 * EXPERIMENTAL YJS INTEGRATION
 * ----------------------------
 * This is a standalone component built to demonstrate how Yjs, WebRTC, and Monaco Editor
 * are wired together to prevent race conditions during collaborative typing.
 * 
 * Note: This is currently isolated from the main workspace while we finalize
 * the UI integration, but the core CRDT logic is implemented here.
 */
export const ExperimentalYjsEditor = ({ roomId }: { roomId: string }) => {
  const editorRef = useRef<any>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // 1. Initialize the Yjs CRDT Document
    // This handles all the complex math for merging simultaneous keystrokes.
    const ydoc = new Y.Doc();

    // 2. Initialize the WebRTC Provider
    // This connects peers directly to each other using the roomId as the signaling channel.
    // It syncs the ydoc state across all connected clients.
    const provider = new WebrtcProvider(`devmeet-room-${roomId}`, ydoc, {
      signaling: ['wss://signaling.yjs.dev'] // Public signaling server for demo
    });
    providerRef.current = provider;

    // 3. Define the shared text type in the Yjs document
    const ytext = ydoc.getText('monaco-sync-text');

    // 4. Bind the Yjs text to the Monaco Editor
    // This library listens to Yjs updates and applies them to the Monaco UI,
    // and listens to Monaco keystrokes and applies them to the Yjs doc.
    const binding = new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );
    bindingRef.current = binding;
  };

  // Cleanup connections when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      providerRef.current?.destroy();
    };
  }, []);

  return (
    <div className="w-full h-full border border-gray-600 rounded-md overflow-hidden">
      <div className="bg-gray-800 text-white p-2 text-xs font-mono">
        Experimental V2 Editor (Yjs + WebRTC CRDT Mode)
      </div>
      <Editor
        height="100%"
        defaultLanguage="typescript"
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on'
        }}
      />
    </div>
  );
};

export default ExperimentalYjsEditor;
