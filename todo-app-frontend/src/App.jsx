import { useEffect, useState } from 'react'
import './App.css'

const BASE_API = import.meta.env.VITE_BASE_API

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  function fetchTasks() {
    fetch(`${BASE_API}/api/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
  }

  function handleAddTask(e) {
    e.preventDefault()
    if (!title.trim()) return

    fetch(`${BASE_API}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
      .then((res) => res.json())
      .then(() => {
        setTitle('')
        fetchTasks()
      })
  }

  function handleToggleTask(task) {
    fetch(`${BASE_API}/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: !task.isCompleted }),
    }).then(() => fetchTasks())
  }

  function handleDeleteTask(id) {
    fetch(`${BASE_API}/api/tasks/${id}`, {
      method: 'DELETE',
    }).then(() => fetchTasks())
  }

  return (
    <div className="todo-app">
      <h1>Todo App</h1>

      <form onSubmit={handleAddTask}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập task mới..."
        />
        <button type="submit">Thêm</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => handleToggleTask(task)}
            />
            <span className={task.isCompleted ? 'completed' : ''}>
              {task.title}
            </span>
            <button type="button" onClick={() => handleDeleteTask(task.id)}>
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
