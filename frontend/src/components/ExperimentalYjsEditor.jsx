import React, { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";

export const ExperimentalYjsEditor = ({ roomId }) => {
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // 1. Initialize the Yjs CRDT Document
    // This handles all the complex math for merging simultaneous keystrokes.
    const ydoc = new Y.Doc();

    // 2. Initialize the WebRTC Provider
    // This connects peers directly to each other using the roomId as the signaling channel.
    // It syncs the ydoc state across all connected clients.
    const provider = new WebrtcProvider(`devmeet-room-${roomId}`, ydoc, {
      signaling: ["wss://signaling.yjs.dev"], // Public signaling server for demo
    });
    providerRef.current = provider;

    // 3. Define the shared text type in the Yjs document
    const ytext = ydoc.getText("monaco-sync-text");

    // 4. Bind the Yjs text to the Monaco Editor
    // This library listens to Yjs updates and applies them to the Monaco UI,
    // and listens to Monaco keystrokes and applies them to the Yjs doc.
    const binding = new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness,
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
          wordWrap: "on",
        }}
      />
    </div>
  );
};

export default ExperimentalYjsEditor;
