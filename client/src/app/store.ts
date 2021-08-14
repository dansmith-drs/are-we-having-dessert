import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
} from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import roomReducer from '../features/room/roomSlice';
import { createBrowserHistory, History } from 'history';
import { connectRouter, routerMiddleware } from 'connected-react-router';
// import createSocketIoMiddleware from 'redux-socket.io';
// import io from 'socket.io-client';
// let socket = io('http://localhost:3000');
// let socketIoMiddleware = createSocketIoMiddleware(socket, 'server/');

export const history: History<unknown> = createBrowserHistory();

// export const store = function configureStore(preloadedState) {
//   const store = createStore(
//     createRootReducer(history),
//     preloadedState,
//     applyMiddleware(routerMiddleware(history))
//   );
//   return store;
// };

const rootReducer = combineReducers({
  room: roomReducer,
  router: connectRouter(history),
  counter: counterReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(routerMiddleware(history)),
});

// export const store = configureStore({
//   reducer: {
//     counter: counterReducer,
//     room: roomReducer,
//   },
// });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;
// export type RootState = ReturnType<typeof store.getState>;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
