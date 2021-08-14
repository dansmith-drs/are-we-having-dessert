import React from 'react';
import './App.css';
import Room from './features/room/Room';
import { Route, Switch } from 'react-router-dom';
import JoinRoom from './features/room/JoinRoom';
import { ConnectedRouter } from 'connected-react-router';
import { history } from './app/store';
import WebSocketProvider from './websocket';

function App() {
  return (
    <ConnectedRouter history={history}>
      <WebSocketProvider>
        <div className="App">
          <Switch>
            <Route exact path="/">
              <div>Home</div>
              <JoinRoom />
            </Route>
            <Route path="/about">
              <div>about</div>
            </Route>
            <Route path="/room/:id" children={<Room />} />
          </Switch>
        </div>
      </WebSocketProvider>
    </ConnectedRouter>
  );
}

export default App;
