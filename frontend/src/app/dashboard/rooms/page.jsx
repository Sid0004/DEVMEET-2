"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderCode, Trash2, Search, Filter } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function RoomsPage() {
  const router = useRouter();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiRequest("/api/v1/rooms/history", {
          method: "GET",
        });
        if (response.data) setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch meeting history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDeleteRoom = async (roomId) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await apiRequest(`/api/v1/rooms/${roomId}/delete`, { method: "DELETE" });
      setHistory((prev) => prev.filter((room) => room.roomId !== roomId));
    } catch (error) {
      alert("Failed to delete room.");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light mb-2">All Workspaces</h1>
          <p className="text-gray-400 font-light">
            Search, filter, and manage all your past and active coding
            environments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search workspaces..."
              className="bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 w-64 transition-colors"
            />
          </div>
          <button className="p-2 bg-[#111] border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-gray-500 font-light">
          Loading workspaces...
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-[#111] border border-white/5 rounded-2xl">
          <FolderCode className="w-12 h-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium mb-1">No workspaces found</h3>
          <p className="text-gray-500 font-light text-sm">
            Create an instant room from the Overview page to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((room) => (
            <div
              key={room._id}
              className="group flex items-center justify-between p-5 bg-[#111] border border-white/5 rounded-xl hover:border-blue-500/50 hover:bg-[#161616] transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <FolderCode className="w-5 h-5 text-blue-400" />
                </div>

                <div>
                  <h4 className="text-base font-medium text-white mb-1 flex items-center gap-2">
                    {room.roomName}
                    {room.status === "active" && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">
                      {room.roomId}
                    </span>
                    <span>{room.primaryLanguage}</span>
                    <span className="text-gray-600">•</span>
                    <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                    {room.status === "ended" && (
                      <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded">
                        Ended
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDeleteRoom(room.roomId)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete Workspace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {room.status !== "ended" && (
                  <button
                    onClick={() =>
                      router.push(`/workspace?room=${room.roomId}`)
                    }
                    className="px-4 py-2 border border-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Enter Room
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
