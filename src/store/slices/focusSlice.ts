import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FocusMode = "work" | "break";

interface FocusState {
  isActive: boolean;
  isPaused: boolean;
  mode: FocusMode;
  timeLeft: number; // in seconds
  duration: number; // in minutes (initial setting)
  taskTitle: string | null;
  taskId: string | null; // Optional link to a specific task
}

const initialState: FocusState = {
  isActive: false,
  isPaused: false,
  mode: "work",
  timeLeft: 25 * 60,
  duration: 25,
  taskTitle: null,
  taskId: null,
};

const focusSlice = createSlice({
  name: "focus",
  initialState,
  reducers: {
    startFocus: (
      state,
      action: PayloadAction<{
        durationMinutes: number;
        taskTitle?: string;
        taskId?: string;
      }>,
    ) => {
      state.isActive = true;
      state.isPaused = false;
      state.mode = "work";
      state.duration = action.payload.durationMinutes;
      state.timeLeft = action.payload.durationMinutes * 60;
      state.taskTitle = action.payload.taskTitle || null;
      state.taskId = action.payload.taskId || null;
    },
    pauseFocus: (state) => {
      state.isPaused = true;
    },
    resumeFocus: (state) => {
      state.isPaused = false;
    },
    stopFocus: (state) => {
      state.isActive = false;
      state.isPaused = false;
      state.taskTitle = null;
      state.taskId = null;
      state.mode = "work"; // Reset to work
    },
    tick: (state) => {
      if (state.isActive && !state.isPaused && state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
    },
    setMode: (state, action: PayloadAction<FocusMode>) => {
      state.mode = action.payload;
      // Auto-set time based on mode standard defaults
      state.duration = action.payload === "work" ? 25 : 5;
      state.timeLeft = state.duration * 60;
    },
  },
});

export const { startFocus, pauseFocus, resumeFocus, stopFocus, tick, setMode } =
  focusSlice.actions;
export default focusSlice.reducer;
