// only an example layout for you to memorize and replicate // 

import { combineReducers } from 'redux'
import { homeReducer } from './home/home.reducer.js'
import { taskReducer } from './task/task.reducer.js'
import { trackingReducer } from './tracking/tracking.reducer.js'
import { leaderboardsReducer } from './leaderboards/leaderboards.reducer.js'
import { profileReducer } from './profile/profile.reducer.js'
import { moreReducer } from './more/more.reducer.js'

export const rootReducer = combineReducers({
    home: homeReducer,
    task: taskReducer,
    tracking: trackingReducer,
    leaderboards: leaderboardsReducer,
    profile: profileReducer,
    more: moreReducer,
})