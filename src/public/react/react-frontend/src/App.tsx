import React, { Suspense, lazy } from "react";
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

const ListingComponent = lazy(() => import('./components/Listing'));

function App() {
  return (
    <div className="App">
      <Router>
        <Link to="/">Home</Link>
        <Suspense fallback={
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
          </header>}>
          <Route exact path="/" component={ListingComponent} />
        </Suspense>
      </Router>
    </div>
  );

}

export default App;
