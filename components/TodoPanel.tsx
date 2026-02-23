
import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle, ClipboardList } from 'lucide-react';
import { TodoItem } from '../types';

interface TodoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  todos: TodoItem[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

const TodoPanel: React.FC<TodoPanelProps> = ({
  isOpen,
  onClose,
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}) => {
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAddTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <ClipboardList className="mr-2 text-indigo-600" size={20} />
                Project Tasks
              </h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="relative">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </form>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center opacity-40">
                <ClipboardList size={32} className="mb-2" />
                <p className="text-sm">No tasks yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div 
                    key={todo.id}
                    className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <button 
                        onClick={() => onToggleTodo(todo.id)}
                        className={`shrink-0 transition-colors ${todo.completed ? 'text-emerald-500' : 'text-gray-300 hover:text-indigo-400'}`}
                      >
                        {todo.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                      <span className={`text-sm transition-all truncate ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                        {todo.text}
                      </span>
                    </div>
                    <button 
                      onClick={() => onDeleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TodoPanel;
