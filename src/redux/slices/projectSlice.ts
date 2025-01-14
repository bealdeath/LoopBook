// File: src/redux/slices/projectSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Project {
  id: string;
  name: string;
  description: string;
}

interface ProjectState {
  data: Project[];
}

const initialState: ProjectState = {
  data: [],
};

export const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    addProject: (state, action: PayloadAction<Project>) => {
      state.data.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<{ id: string; changes: Partial<Project> }>) => {
      const index = state.data.findIndex((p) => p.id === action.payload.id);
      if (index >= 0) {
        state.data[index] = { ...state.data[index], ...action.payload.changes };
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((p) => p.id !== action.payload);
    },
  },
});

export const { addProject, updateProject, deleteProject } = projectSlice.actions;
export default projectSlice.reducer;
