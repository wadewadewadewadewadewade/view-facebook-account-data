import React, { useState, Suspense } from "react";
import { getListing, Listing, ArchiveItems } from './components/Listing';
import logo from './logo.svg';
import './App.css';

function wrapPromise(promise: Promise<ArchiveItems>) {
  let status = "pending";
  let result: ArchiveItems;
  let suspender = promise.then(
    r => {
      status = "success";
      result = r;
    },
    e => {
      status = "error";
      result = e;
    }
  );
  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    }
  };
}

const initialResource = wrapPromise(getListing())

function App() {
  const [resource] = useState(
    initialResource
  );
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
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
      <Suspense fallback={<h1>Loading listing...</h1>}>
        <Listing resource={resource} />
      </Suspense>
    </div>
  );

}

export default App;
