import React from "react";

const ClassManager = ({
  classes = [],
  selectedClass,
  onSelectClass,
  onAddClass,
  onRenameClass,
  onDeleteClass,
}) => {
  // TODO: Implement class/label management (add, rename, delete)
  return (
    <div>
      <h2>Class Manager</h2>
      {/* Class list, add/rename/delete UI */}
      <ul>
        {classes.map((cls) => (
          <li key={cls}>
            <button onClick={() => onSelectClass(cls)}>{cls}</button>
            {/* Rename/Delete buttons */}
          </li>
        ))}
      </ul>
      <button onClick={onAddClass}>Add Class</button>
    </div>
  );
};

export default ClassManager;