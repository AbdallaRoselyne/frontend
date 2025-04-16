import React from 'react';

const TaskHeader = ({ taskCount }) => {
  return (
    <div className="task-header">
      <h1>My Tasks</h1>
      <div className="stats-badge">
        <span className="count">{taskCount}</span>
        <span>{taskCount === 1 ? 'task' : 'tasks'}</span>
      </div>
    </div>
  );
};

