import React, { useState, Suspense } from "react";
import { getListing, Listing, wrapPromise, dummydata } from './components/Listing';
import logo from './logo.svg';
import './App.css';

//const initialResource = wrapPromise(getListing())
const initialResource = wrapPromise(dummydata)

function App() {
  const [resource] = useState(
    initialResource
  );
  return (
    <div className="App">
      <Suspense fallback={
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Loading...
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      }>
        <Listing {...resource} />
      </Suspense>
    </div>
  );

}

export default App;
