import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";

const AppContext = createContext(null);
const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const defaultSettings = {
  theme: "dark",
  notifications: true,
  sounds: true,
  weeklyReport: true,
  focusDuration: 25,
  breakDuration: 5,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        tasks: action.payload.tasks,
        settings: action.payload.settings || defaultSettings,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        tasks: [],
        settings: defaultSettings,
        searchQuery: "",
      };
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "ADD_TASK":
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };
    case "OPEN_MODAL":
      return {
        ...state,
        activeModal: action.payload.modal,
        editingTask: action.payload.task || null,
      };
    case "CLOSE_MODAL":
      return { ...state, activeModal: null, editingTask: null };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

function getToken() {
  return localStorage.getItem("tf_token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    isAuthenticated: !!getToken(),
    user: JSON.parse(localStorage.getItem("tf_user") || "null"),
    tasks: [],
    settings: defaultSettings,
    sidebarCollapsed: false,
    activeModal: null,
    editingTask: null,
    searchQuery: "",
  });

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      state.settings?.theme || "dark",
    );
  }, [state.settings?.theme]);

  // ✅ FIX: Stable function reference with useCallback so consumers can
  //    safely include it in useEffect dependency arrays without causing
  //    infinite loops or stale closures.
  const loadTasks = useCallback(async () => {
    try {
      console.log("[loadTasks] fetching tasks...");
      const res = await fetch(`${API}/tasks?_=${Date.now()}`, {
        // ✅ timestamp busts browser cache
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) dispatch({ type: "SET_TASKS", payload: data.tasks });
    } catch (err) {
      console.error("Load tasks failed:", err);
    }
  }, []); // API, authHeaders, and dispatch are all stable — no deps needed

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API}/settings`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) dispatch({ type: "UPDATE_SETTINGS", payload: data.settings });
    } catch (err) {
      console.error("Load settings failed:", err);
    }
  }, []);

  // Load tasks + settings when authenticated
  useEffect(() => {
    if (state.isAuthenticated && getToken()) {
      loadTasks();
      loadSettings();
    }
  }, [state.isAuthenticated, loadTasks, loadSettings]);

  // Reload tasks when window gets focus (navigating back to tab)
  useEffect(() => {
    function onFocus() {
      if (state.isAuthenticated && getToken()) {
        loadTasks();
      }
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [state.isAuthenticated, loadTasks]);

  // ---- Auth ----
  async function signup({ name, email, password }) {
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Cannot connect to server. Is the backend running?",
      };
    }
  }

  async function login({ email, password }) {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      localStorage.setItem("tf_token", data.token);
      localStorage.setItem("tf_user", JSON.stringify(data.user));

      const tasksRes = await fetch(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const tasksData = await tasksRes.json();
      const setRes = await fetch(`${API}/settings`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const setData = await setRes.json();

      dispatch({
        type: "LOGIN",
        payload: {
          user: data.user,
          tasks: tasksData.tasks || [],
          settings: setData.settings || defaultSettings,
        },
      });
      return { success: true };
    } catch {
      return {
        success: false,
        error: "Cannot connect to server. Is the backend running?",
      };
    }
  }

  function logout() {
    localStorage.removeItem("tf_token");
    localStorage.removeItem("tf_user");
    dispatch({ type: "LOGOUT" });
  }

  // ---- Tasks ----
  async function addTask(taskData) {
    try {
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (res.ok) dispatch({ type: "ADD_TASK", payload: data.task });
    } catch (err) {
      console.error("Add task failed:", err);
    }
  }

  async function updateTask(task) {
    try {
      const res = await fetch(`${API}/tasks/${task.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(task),
      });
      const data = await res.json();
      if (res.ok) dispatch({ type: "UPDATE_TASK", payload: data.task });
    } catch (err) {
      console.error("Update task failed:", err);
    }
  }

  async function deleteTask(id) {
    try {
      await fetch(`${API}/tasks/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      dispatch({ type: "DELETE_TASK", payload: id });
    } catch (err) {
      console.error("Delete task failed:", err);
    }
  }

  async function toggleTask(id) {
    try {
      const res = await fetch(`${API}/tasks/${id}/toggle`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) dispatch({ type: "TOGGLE_TASK", payload: data.task });
    } catch (err) {
      console.error("Toggle task failed:", err);
    }
  }

  // ---- Settings ----
  async function updateSettings(newSettings) {
    dispatch({ type: "UPDATE_SETTINGS", payload: newSettings });
    try {
      await fetch(`${API}/settings`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(newSettings),
      });
    } catch (err) {
      console.error("Save settings failed:", err);
    }
  }

  const openModal = (m, t = null) =>
    dispatch({ type: "OPEN_MODAL", payload: { modal: m, task: t } });
  const closeModal = () => dispatch({ type: "CLOSE_MODAL" });
  const toggleSidebar = () => dispatch({ type: "TOGGLE_SIDEBAR" });
  const setSearch = (q) => dispatch({ type: "SET_SEARCH", payload: q });
  const updateUser = (d) => dispatch({ type: "UPDATE_USER", payload: d });

  return (
    <AppContext.Provider
      value={{
        ...state,
        signup,
        login,
        logout,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        openModal,
        closeModal,
        toggleSidebar,
        updateSettings,
        setSearch,
        updateUser,
        loadTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
