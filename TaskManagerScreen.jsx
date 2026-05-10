import React, { useState, useEffect } from 'react';
import { getActiveProject, addTaskToProject, updateTask, deleteTask, parseCSV } from './store.js';

const FILTERS = ['All', 'Pending', 'In Progress', 'In Review', 'Done', 'Urgent'];
const PRIORITIES = ['Urgent', 'High', 'Medium', 'Low'];
const STATUS_OPTIONS = ['Pending', 'In Progress', 'In Review', 'Done'];

function formatDue(date) {
  if (!date) return 'No date';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function dueColor(date) {
  if (!date) return 'var(--text-muted)';
  const diff = (new Date(date).getTime() - Date.now()) / 86400000;
  if (diff < 0) return '#E24B4A';
  if (diff <= 2) return '#BA7517';
  return 'var(--text)';
}

export default function TaskManagerScreen({ addToast, forceUpdate }) {
  const project = getActiveProject();
  const members = project?.members || [];
  const [tab, setTab] = useState('all');
  const [filter, setFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [manual, setManual] = useState({ taskName: '', description: '', assignedTo: members[0]?.name || '', dueDate: '', priority: 'Medium', status: 'Pending', storyPoints: 3 });
  const [csvRows, setCsvRows] = useState([]);
  const [csvError, setCsvError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setManual(m => ({ ...m, assignedTo: members[0]?.name || '' }));
  }, [project?.id, members.length]);

  if (!project) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        No active project selected.
      </div>
    );
  }

  const tasks = (project.tasks || []).filter(task => {
    if (filter === 'All') return true;
    if (filter === 'Urgent') return task.priority === 'Urgent';
    return task.status === filter;
  });

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditData({ ...task });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateTask(project.id, editingId, {
      name: editData.name,
      description: editData.description,
      assignedTo: editData.assignedTo,
      dueDate: editData.dueDate,
      priority: editData.priority,
      status: editData.status,
      storyPoints: Number(editData.storyPoints) || 1,
    });
    setEditingId(null);
    addToast('success', 'Task updated!');
    forceUpdate?.();
  };

  const deleteRow = (taskId) => {
    if (!window.confirm('Delete?')) return;
    deleteTask(project.id, taskId);
    addToast('success', 'Task deleted');
    forceUpdate?.();
  };

  const submitManual = () => {
    if (!manual.taskName.trim() || !manual.assignedTo.trim()) return;
    addTaskToProject(project.id, {
      name: manual.taskName.trim(),
      description: manual.description.trim(),
      assignedTo: manual.assignedTo,
      dueDate: manual.dueDate,
      priority: manual.priority,
      status: manual.status,
      storyPoints: Number(manual.storyPoints) || 1,
    });
    addToast('success', `Task assigned to ${manual.assignedTo}!`);
    setManual({ taskName: '', description: '', assignedTo: members[0]?.name || '', dueDate: '', priority: 'Medium', status: 'Pending', storyPoints: 3 });
    forceUpdate?.();
  };

  const downloadTemplate = () => {
    const csv = 'task_name,assigned_to,due_date,priority,status,story_points,description\nFix login bug,Priya Sharma,2026-05-15,High,Pending,5,Description here\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'task-template.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvError('Please upload a .csv file');
      return;
    }
    const text = await file.text();
    const rows = parseCSV(text).map(row => {
      const assigned = row.assigned_to?.trim();
      const matched = members.some(m => m.name.toLowerCase() === assigned?.toLowerCase());
      return { ...row, unmatched: !!assigned && !matched, valid: row.task_name && assigned && row.due_date };
    });
    if (!rows.length) {
      setCsvError('No rows found in CSV');
      return;
    }
    setCsvRows(rows);
    setCsvError('');
    setShowPreview(true);
  };

  const importCsv = () => {
    const validRows = csvRows.filter(r => r.valid && !r.unmatched);
    validRows.forEach(r => {
      addTaskToProject(project.id, {
        name: r.task_name.trim(),
        description: r.description?.trim() || '',
        assignedTo: r.assigned_to.trim(),
        dueDate: r.due_date,
        priority: PRIORITIES.includes(r.priority) ? r.priority : 'Medium',
        status: STATUS_OPTIONS.includes(r.status) ? r.status : 'Pending',
        storyPoints: Number(r.story_points) || 1,
      });
    });
    addToast('success', `${validRows.length} tasks imported!`);
    setShowPreview(false);
    setCsvRows([]);
    forceUpdate?.();
  };

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>Task Manager</h1>
          <div style={{ color: 'var(--text-muted)', marginTop: 6 }}>{project.name} · {project.sprintName || 'Sprint 1'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', 'assign'].map(key => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: '10px 18px', borderRadius: 12, border: '1px solid var(--border)', background: tab === key ? 'rgba(83,74,183,0.1)' : 'transparent', color: tab === key ? 'var(--primary)' : 'var(--text)', cursor: 'pointer' }}>
              {key === 'all' ? 'All Tasks' : 'Assign Tasks'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'all' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
            {FILTERS.map(item => (
              <button key={item} onClick={() => setFilter(item)} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid var(--border)', background: filter === item ? 'rgba(83,74,183,0.12)' : 'transparent', color: filter === item ? 'var(--primary)' : 'var(--text)', cursor: 'pointer' }}>{item}</button>
            ))}
          </div>
          {tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, borderRadius: 24, background: 'var(--surface)', border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 32, marginBottom: 18 }}>📭</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No tasks yet</div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Add your first task or import from a CSV to get started.</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => setTab('assign')} style={{ padding: '12px 18px', borderRadius: 12, border: 'none', background: '#534AB7', color: 'white', cursor: 'pointer' }}>Add Task</button>
                <button onClick={downloadTemplate} style={{ padding: '12px 18px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>Upload CSV</button>
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: 12 }}>
                    <th style={{ padding: '12px 14px' }}>Task</th>
                    <th style={{ padding: '12px 14px' }}>Assigned To</th>
                    <th style={{ padding: '12px 14px' }}>Due Date</th>
                    <th style={{ padding: '12px 14px' }}>Priority</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Points</th>
                    <th style={{ padding: '12px 14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => {
                    const isEditing = editingId === task.id;
                    return (
                      <tr key={task.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                          {isEditing ? (
                            <input value={editData.name || ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 10, border: '0.5px solid var(--border)', fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--text)' }} />
                          ) : <div style={{ fontWeight: 600 }}>{task.name}</div>}
                        </td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>
                          {isEditing ? (
                            <select value={editData.assignedTo || ''} onChange={e => setEditData(d => ({ ...d, assignedTo: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                              {members.map(m => <option key={m.userId} value={m.name}>{m.name}</option>)}
                            </select>
                          ) : task.assignedTo}
                        </td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top', color: dueColor(task.dueDate) }}>{isEditing ? (
                          <input type="date" value={editData.dueDate || ''} onChange={e => setEditData(d => ({ ...d, dueDate: e.target.value }))} style={{ padding: 8, borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
                        ) : formatDue(task.dueDate)}</td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>{isEditing ? (
                          <select value={editData.priority || 'Medium'} onChange={e => setEditData(d => ({ ...d, priority: e.target.value }))} style={{ padding: 8, borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        ) : <span style={{ padding: '6px 10px', borderRadius: 999, background: task.priority === 'Urgent' ? '#FFE7E5' : '#F2F0FF', color: task.priority === 'Urgent' ? '#E24B4A' : '#534AB7', fontSize: 12, fontWeight: 700 }}>{task.priority}</span>}</td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>{isEditing ? (
                          <select value={editData.status || 'Pending'} onChange={e => setEditData(d => ({ ...d, status: e.target.value }))} style={{ padding: 8, borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : task.status}</td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top' }}>{isEditing ? (
                          <input type="number" min="1" max="21" value={editData.storyPoints || 1} onChange={e => setEditData(d => ({ ...d, storyPoints: e.target.value }))} style={{ width: 80, padding: 8, borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
                        ) : task.storyPoints}</td>
                        <td style={{ padding: '12px 14px', verticalAlign: 'top', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {isEditing ? (
                            <button onClick={saveEdit} style={{ border: 'none', borderRadius: 10, padding: '8px 10px', background: '#1D9E75', color: 'white', cursor: 'pointer' }}>Save</button>
                          ) : (
                            <button onClick={() => startEdit(task)} style={{ border: 'none', borderRadius: 10, padding: '8px 10px', background: '#534AB7', color: 'white', cursor: 'pointer' }}>Edit</button>
                          )}
                          <button onClick={() => deleteRow(task.id)} style={{ border: 'none', borderRadius: 10, padding: '8px 10px', background: '#F5F0FF', color: '#E24B4A', cursor: 'pointer' }}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'assign' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 20, marginTop: 12 }}>
          <div style={{ borderRadius: 24, border: '0.5px solid var(--border)', padding: 24, background: 'var(--surface)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Add Task Manually</div>
            <div style={{ display: 'grid', gap: 14 }}>
              <input value={manual.taskName} onChange={e => setManual(m => ({ ...m, taskName: e.target.value }))} placeholder="Task name"
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
              <textarea value={manual.description} onChange={e => setManual(m => ({ ...m, description: e.target.value }))} placeholder="Description"
                style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 12, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical' }} />
              <select value={manual.assignedTo} onChange={e => setManual(m => ({ ...m, assignedTo: e.target.value }))}
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                {members.map(m => <option key={m.userId} value={m.name}>{m.name}</option>)}
              </select>
              <input type="date" value={manual.dueDate} onChange={e => setManual(m => ({ ...m, dueDate: e.target.value }))}
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
              <select value={manual.priority} onChange={e => setManual(m => ({ ...m, priority: e.target.value }))}
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={manual.status} onChange={e => setManual(m => ({ ...m, status: e.target.value }))}
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="number" min="1" max="21" value={manual.storyPoints} onChange={e => setManual(m => ({ ...m, storyPoints: Number(e.target.value) }))} placeholder="Story points"
                style={{ width: '100%', padding: 12, borderRadius: 12, border: '0.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
              <button onClick={submitManual} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: '#534AB7', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Assign task</button>
            </div>
          </div>
          <div style={{ borderRadius: 24, border: '0.5px solid var(--border)', padding: 24, background: 'var(--surface)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Bulk Import via CSV</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ border: '1px dashed var(--border)', borderRadius: 20, padding: 28, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>☁️</div>
                <div>Upload a CSV file with task rows.</div>
                <div style={{ marginTop: 12 }}>
                  <label style={{ color: '#534AB7', cursor: 'pointer', fontWeight: 700 }}>
                    Select CSV file
                    <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <button onClick={downloadTemplate} style={{ border: 'none', background: 'transparent', color: '#534AB7', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>Download CSV Template</button>
              {csvError && <div style={{ color: '#E24B4A', fontSize: 13 }}>{csvError}</div>}
              {csvRows.length > 0 && !showPreview && (
                <button onClick={() => setShowPreview(true)} style={{ padding: 12, borderRadius: 14, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}>Preview {csvRows.length} rows</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,12,24,0.55)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 980, maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface)', borderRadius: 24, padding: 24, position: 'relative' }}>
            <button onClick={() => setShowPreview(false)} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>CSV Preview</h2>
            <div style={{ marginTop: 14, marginBottom: 20, color: 'var(--text-muted)' }}>Verify rows before importing. Unmatched members are highlighted.</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: 12 }}>
                    {['Task', 'Assigned To', 'Due Date', 'Priority', 'Status', 'Points', 'Description'].map(col => (
                      <th key={col} style={{ padding: '12px 14px' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.map((row, index) => (
                    <tr key={index} style={{ borderTop: '1px solid var(--border)', background: row.unmatched ? 'rgba(255, 213, 128, 0.18)' : 'transparent' }}>
                      <td style={{ padding: '12px 14px' }}>{row.task_name || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>{row.assigned_to || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>{row.due_date || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>{row.priority || 'Medium'}</td>
                      <td style={{ padding: '12px 14px' }}>{row.status || 'Pending'}</td>
                      <td style={{ padding: '12px 14px' }}>{row.story_points || '1'}</td>
                      <td style={{ padding: '12px 14px' }}>{row.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
              <div style={{ color: '#BA7517', fontSize: 13 }}>
                {csvRows.filter(r => r.unmatched).length > 0 ? `${csvRows.filter(r => r.unmatched).length} unmatched name(s)` : 'All rows look good'}
              </div>
              <button onClick={importCsv} style={{ padding: '12px 18px', borderRadius: 14, border: 'none', background: '#534AB7', color: 'white', cursor: 'pointer' }}>
                Import {csvRows.filter(r => r.valid && !r.unmatched).length} Tasks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
