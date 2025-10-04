import { combineReducers, createStore } from "redux";
import schedulerReducer from "./slices/schedulerSlice";

const rootReducer = combineReducers({
  scheduler: schedulerReducer,
});

export const store = createStore(rootReducer);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  ;(window as any).__APP_STORE__ = store;
}
