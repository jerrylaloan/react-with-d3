import React from "react";
import logo from "./logo.svg";
import "./App.css";
import IndonesiaGeoChart from "./IndonesiaGeoChart";

function App() {
  return (
    <div className="App">
      <IndonesiaGeoChart width="960" height="600" />
    </div>
  );
}

export default App;
