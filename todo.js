const STORAGE_KEY = 'focus-list.tasks.v1';
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const empty = document.querySelector('#empty-state');
const count = document.querySelector('#task-count');
const ring = document.querySelector('#progress-ring');
const value = document.querySelector('#progress-value');
let filter = 'all';
let tasks = readTasks();

function readTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.filter(task => task && task.id && typeof task.text === 'string') : [];
  } catch { return []; }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function visibleTasks() { return filter === 'active' ? tasks.filter(t => !t.completed) : filter === 'completed' ? tasks.filter(t => t.completed) : tasks; }
function render() {
  list.replaceChildren();
  visibleTasks().forEach(task => {
    const item = document.createElement('li');
    item.className = `task${task.completed ? ' completed' : ''}`;
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = task.completed; checkbox.setAttribute('aria-label', `Mark ${task.text} complete`);
    const label = document.createElement('label'); label.textContent = task.text;
    const remove = document.createElement('button'); remove.className = 'delete'; remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `Delete ${task.text}`);
    checkbox.addEventListener('change', () => { task.completed = checkbox.checked; save(); render(); });
    remove.addEventListener('click', () => { tasks = tasks.filter(t => t.id !== task.id); save(); render(); });
    item.append(checkbox, label, remove); list.append(item);
  });
  const remaining = tasks.filter(t => !t.completed).length;
  const completed = tasks.length - remaining;
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  count.textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} left`;
  value.textContent = `${percent}%`; ring.style.setProperty('--progress', `${percent}%`); ring.setAttribute('aria-label', `${percent} percent complete`);
  empty.hidden = visibleTasks().length > 0;
}
form.addEventListener('submit', event => { event.preventDefault(); const text = input.value.trim(); if (!text) return; tasks.unshift({ id: `${Date.now()}-${Math.random()}`, text, completed: false }); input.value = ''; save(); render(); input.focus(); });
document.querySelector('#clear-completed').addEventListener('click', () => { tasks = tasks.filter(t => !t.completed); save(); render(); });
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === button)); render(); }));
render();
