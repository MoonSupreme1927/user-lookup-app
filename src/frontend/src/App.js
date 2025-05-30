import Home from "./Home";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import UserDetail from "./UserDetail";

function App() {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "" });
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  // Debounced search on query change
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query);
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [query]);

  const searchUsers = async (searchTerm) => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/search?query=${searchTerm}`
      );
      setResults(response.data);
    } catch (err) {
      console.error("API call failed:", err);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (query.trim()) {
      await searchUsers(query);
    }
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      console.log(
        "process.env.REACT_APP_API_URL: ",
        process.env.REACT_APP_API_URL
      );
      await axios.post(`${process.env.REACT_APP_API_URL}/add`, newUser);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/search?query=${newUser.name}`
      );
      setResults(response.data);
      setNewUser({ name: "", email: "", phone: "" });
      setQuery(newUser.name);
    } catch (err) {
      console.error("Add user failed:", err);
      setError("Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError(null);
  };

  return (
    <>
      <div className="banner">
        User Lookup Tool
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {loading && (
        <div className="overlay">
          <div className="spinner"></div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Home
              query={query}
              setQuery={setQuery}
              results={results}
              error={error}
              loading={loading}
              newUser={newUser}
              setNewUser={setNewUser}
              darkMode={darkMode}
              handleSearch={handleSearch}
              handleAddUser={handleAddUser}
              handleClear={handleClear}
              navigate={navigate}
            />
          }
        />
        <Route path="/users/:id" element={<UserDetail />} />
      </Routes>
    </>
  );
}

export default App;
