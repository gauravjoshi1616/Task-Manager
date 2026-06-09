import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Loader2, AlertCircle, ListTodo } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [actionLoading, setActionLoading] = useState(null); // track operations on specific task id

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Please verify the FastAPI service is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setError(null);
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), completed: false }),
      });
      if (!response.ok) throw new Error('Failed to add task');
      const newTask = await response.json();
      setTasks((prev) => [newTask, ...prev]);
      setNewTitle('');
    } catch (err) {
      console.error(err);
      setError('Failed to create task. Try again.');
    }
  };

  const handleToggleComplete = async (taskId, currentCompleted) => {
    setError(null);
    setActionLoading(taskId);
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const updatedTask = await response.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updatedTask : t))
      );
    } catch (err) {
      console.error(err);
      setError('Failed to update task state.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setError(null);
    setActionLoading(taskId);
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete task.');
    } finally {
      setActionLoading(null);
    }
  };

  // Compute stats
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered tasks list
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-start items-center p-4 sm:p-6 md:p-12">
      <div className="w-full max-w-2xl">
        
        {/* Header and Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30">
            <ListTodo className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Zenith Task Manager
            </h1>
            <p className="text-sm text-slate-400 font-medium">Organize your daily tasks beautifully</p>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-panel rounded-2xl p-4 flex flex-col">
            <span className="text-xs text-slate-400 font-semibold">Total Tasks</span>
            <span className="text-2xl font-bold text-white mt-1">{totalCount}</span>
          </div>
          <div className="glass-panel rounded-2xl p-4 flex flex-col">
            <span className="text-xs text-slate-400 font-semibold">Completed</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</span>
          </div>
          <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-semibold">Progress</span>
              <span className="text-xs font-semibold text-indigo-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="glass-panel rounded-2xl p-4 mb-6 flex gap-3 items-center">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newTitle.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-3 font-semibold text-sm transition-all duration-200 shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </form>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm flex-1">{error}</div>
            <button 
              onClick={fetchTasks} 
              className="text-xs bg-red-500/20 hover:bg-red-500/35 px-3 py-1.5 rounded-lg transition-colors font-medium self-center ml-2"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Main tasks container */}
        <div className="glass-panel rounded-2xl p-6 shadow-xl relative min-h-[300px]">
          
          {/* Navigation Filters */}
          <div className="flex border-b border-slate-700/50 pb-4 mb-6 gap-6">
            {['all', 'active', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`text-sm font-semibold capitalize transition-all relative pb-2 ${
                  filter === tab ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
                {filter === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full animate-fade-in" />
                )}
              </button>
            ))}
          </div>

          {/* List display */}
          {loading ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-3">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <span className="text-sm text-slate-400 font-medium">Fetching tasks...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 text-center">
              <div className="h-16 w-16 bg-slate-800/40 rounded-full flex items-center justify-center border border-slate-700/30 mb-4 text-slate-500">
                <ListTodo className="h-8 w-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-300">No tasks here</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {filter === 'all' 
                  ? 'Add your first task to get started on your daily goals.'
                  : `You have no ${filter} tasks right now.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`glass-card rounded-xl p-4 flex justify-between items-center gap-4 transition-all duration-300 hover:translate-x-1 group hover:border-slate-700/40 ${
                    task.completed ? 'opacity-65 border-emerald-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(task.id, task.completed)}
                      disabled={actionLoading === task.id}
                      className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-indigo-400 hover:bg-indigo-500/10'
                      }`}
                    >
                      {task.completed && <Check className="h-4 w-4 stroke-[3]" />}
                    </button>
                    <span
                      onClick={() => handleToggleComplete(task.id, task.completed)}
                      className={`text-sm select-none cursor-pointer truncate transition-all ${
                        task.completed 
                          ? 'line-through text-slate-500' 
                          : 'text-slate-200 group-hover:text-white font-medium'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={actionLoading === task.id}
                    title="Delete task"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
