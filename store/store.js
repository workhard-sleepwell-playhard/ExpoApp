import {compose, createStore, applyMiddleware} from 'redux';
import { thunk } from 'redux-thunk';
// Temporarily disable Redux Persist to test if this causes the window error
// import { persistStore, persistReducer } from 'redux-persist';
// import AsyncStorage from '@react-native-async-storage/async-storage';  

import { rootReducer } from './root-reducer.js';

// Temporarily disable persistence to test if this causes the window error
// const persistConfig = {
//     key: 'root',
//     storage: AsyncStorage,
//     blacklist: ['user'] // pass in the values you dont want 
//  }

// const persistedReducer = persistReducer(persistConfig, rootReducer);
const persistedReducer = rootReducer; // Use rootReducer directly without persistence

// Create middleware array - ensure all items are functions
const middleWares = [thunk]

// Add logger only in development and ensure it's a function
if (process.env.NODE_ENV !== 'production') {
  try {
    const { logger } = require('redux-logger');
    if (typeof logger === 'function') {
      middleWares.push(logger);
    }
  } catch (error) {
    console.warn('redux-logger not available:', error.message);
  }
}
// filter will get the object if he array value is true otherwise it does't return false 
// runs helper function before the actions hits reducer aka middleman 


// For React Native/Expo, we don't need Redux DevTools extension
const composeEnhancer = compose; 

// Validate middleware array - ensure all items are functions
const validMiddlewares = middleWares.filter(middleware => typeof middleware === 'function');

if (validMiddlewares.length !== middleWares.length) {
  console.warn('Some middleware were filtered out as they are not functions');
}

const composedEnhancers = composeEnhancer(applyMiddleware(...validMiddlewares)); // compose allows to pass multiple functions left to right 
//pass eveysigle middleware you have
export const store = createStore(persistedReducer, undefined, composedEnhancers) // stores defaults to persistedReducer

// Temporarily disable persistor to test if this causes the window error
// export const persistor = persistStore(store)
export const persistor = null; // No persistence for now