import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR  = join(__dirname, '../data')

// Make sure data folder exists
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

function getPath(filename) {
  return join(DATA_DIR, `${filename}.json`)
}

function read(filename) {
  const path = getPath(filename)
  if (!existsSync(path)) {
    write(filename, [])
    return []
  }
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return []
  }
}

function write(filename, data) {
  writeFileSync(getPath(filename), JSON.stringify(data, null, 2), 'utf-8')
}

// ---- Users ----
export function getUsers() {
  return read('users')
}

export function getUserByEmail(email) {
  return getUsers().find(u => u.email === email.toLowerCase()) || null
}

export function getUserById(id) {
  return getUsers().find(u => u.id === id) || null
}

export function saveUser(user) {
  const users = getUsers()
  const index = users.findIndex(u => u.id === user.id)
  if (index >= 0) {
    users[index] = user
  } else {
    users.push(user)
  }
  write('users', users)
  return user
}

// ---- Tasks ----
export function getAllTasks() {
  return read('tasks')
}

export function getTasksByUser(userId) {
  return getAllTasks().filter(t => t.userId === userId)
}

export function getTaskById(id) {
  return getAllTasks().find(t => t.id === id) || null
}

export function saveTask(task) {
  const tasks = getAllTasks()
  const index = tasks.findIndex(t => t.id === task.id)
  if (index >= 0) {
    tasks[index] = task
  } else {
    tasks.push(task)
  }
  write('tasks', tasks)
  return task
}

export function deleteTask(id) {
  const tasks = getAllTasks().filter(t => t.id !== id)
  write('tasks', tasks)
}

export function saveAllTasks(tasks) {
  write('tasks', tasks)
}

// ---- Settings ----
export function getSettings(userId) {
  const users = getUsers()
  const user  = users.find(u => u.id === userId)
  return user?.settings || getDefaultSettings()
}

export function saveSettings(userId, settings) {
  const users = getUsers()
  const index = users.findIndex(u => u.id === userId)
  if (index >= 0) {
    users[index].settings = settings
    write('users', users)
  }
  return settings
}

export function getDefaultSettings() {
  return {
    theme:           'light',
    notifications:   true,
    sounds:          true,
    weeklyReport:    true,
    focusDuration:   25,
    breakDuration:   5,
  }
}