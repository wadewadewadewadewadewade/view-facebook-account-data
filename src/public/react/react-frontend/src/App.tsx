import React from "react";
import logo from './logo.svg';
import './App.css';

import { ListingComponent } from './components/Listing';

function App() {
  return (
    <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <ListingComponent />
    </div>
  );

}

export default App;
