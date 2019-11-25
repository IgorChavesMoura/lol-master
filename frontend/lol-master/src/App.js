import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Login from './pages/Login';
import Home from './pages/Home';
import CompKillsMap from './pages/CompKillsMap';
import PlayerKillsMap from './pages/PlayerKillsMap';
 

function App() {
  return (
    <Router>
      {/* <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/users">Users</Link>
            </li>
          </ul>
        </nav> */}

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/home">
            <Home />
          </Route>
          <Route path="/compKillsMap">
            <CompKillsMap />
          </Route>
          <Route path="/playerKillsMap">
            <PlayerKillsMap />
          </Route>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      {/* </div> */}
    </Router>
  );
}

export default App;
