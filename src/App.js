import "./App.css";
import Dashboard from "./Pages/Dashboard/Dashboard";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";

let url;

console.log(window.location.href)


export { url };

function App() {

  return (
    <>
      <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          {(document.body.style = "background:  #bbdcff")}
          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
