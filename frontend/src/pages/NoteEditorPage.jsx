import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

export default function NoteEditorPage() {
  const { id } = useParams();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [activeUsers, setActiveUsers] = useState(0);
  const socketRef = useRef(null);
  const lastSavedRef = useRef(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/notes/${id}`);
        setContent(res.data.content);
        setTitle(res.data.title);
        setUpdatedAt(new Date(res.data.updatedAt).toLocaleString());
      } catch (error) {
        console.error(error);
      }
    };
    fetchNote();

    socketRef.current = io(process.env.REACT_APP_SOCKET_URL, { transports: ["websocket"] });

    socketRef.current.emit("join_note", id);

    socketRef.current.on("initial_data", (data) => {
      setContent(data.content);
      setTitle(data.title);
      setUpdatedAt(new Date(data.updatedAt).toLocaleString());
    });

    socketRef.current.on("note_update", (data) => {
      setContent(data.content);
      setUpdatedAt(new Date(data.updatedAt).toLocaleString());
    });

    socketRef.current.on("title_update", (data) => {
      setTitle(data.title);
    });

    socketRef.current.on("active_users", (count) => {
      setActiveUsers(count);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    socketRef.current.emit("note_update", {
      noteId: id,
      content: newContent
    });
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    socketRef.current.emit("title_update", {
      noteId: id,
      title: newTitle
    });
    axios.put(`${process.env.REACT_APP_BACKEND_URL}/notes/${id}`, {
      title: newTitle
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", width: "100%" }}
      />
      <div>Active Collaborators: {activeUsers}</div>
      <div>Last Updated: {updatedAt}</div>
      {lastSavedRef.current && (
        <div>Last Saved: {new Date(lastSavedRef.current).toLocaleString()}</div>
      )}
      <textarea
        value={content}
        onChange={handleContentChange}
        style={{ width: "100%", height: "300px", padding: "10px" }}
      />
    </div>
  );
}