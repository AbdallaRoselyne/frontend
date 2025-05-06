import React from "react";

const CalendarEventModal = ({ selectedTask, closeTaskDetails, isCreating, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState({
    title: '',
    department: '',
    project: '',
    requestedName: '',
    hours: 1,
    start: new Date(),
    end: new Date(new Date().setHours(new Date().getHours() + 1))
  });

  React.useEffect(() => {
    if (selectedTask && !isCreating) {
      setFormData({
        title: selectedTask.title,
        department: selectedTask.department,
        project: selectedTask.project,
        requestedName: selectedTask.requestedName,
        hours: selectedTask.hours,
        start: selectedTask.start,
        end: selectedTask.end
      });
    } else if (isCreating) {
      setFormData({
        title: '',
        department: '',
        project: '',
        requestedName: '',
        hours: 1,
        start: new Date(),
        end: new Date(new Date().setHours(new Date().getHours() + 1))
      });
    }
  }, [selectedTask, isCreating]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (e, field) => {
    const time = e.target.value;
    const [hours, minutes] = time.split(':');
    const newDate = new Date(formData[field]);
    newDate.setHours(parseInt(hours, 10));
    newDate.setMinutes(parseInt(minutes, 10));
    
    setFormData(prev => ({ 
      ...prev, 
      [field]: newDate,
      hours: field === 'start' ? 
        (prev.end.getTime() - newDate.getTime()) / (1000 * 60 * 60) : 
        (newDate.getTime() - prev.start.getTime()) / (1000 * 60 * 60)
    }));
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const start = new Date(formData.start);
    const end = new Date(formData.end);
    
    start.setFullYear(date.getFullYear());
    start.setMonth(date.getMonth());
    start.setDate(date.getDate());
    
    end.setFullYear(date.getFullYear());
    end.setMonth(date.getMonth());
    end.setDate(date.getDate());
    
    setFormData(prev => ({ 
      ...prev, 
      start, 
      end 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      title: formData.title || 'New Event',
      department: formData.department || 'General',
      extendedProps: {
        ...formData,
        hours: formData.hours
      }
    });
  };

  if (!selectedTask && !isCreating) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-[#818181]">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-[#a8499c]">
            {isCreating ? 'Create New Event' : selectedTask.title}
          </h2>
          <button
            onClick={isCreating ? onCancel : closeTaskDetails}
            className="text-[#818181] hover:text-[#a8499c] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {isCreating ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#818181] mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border border-[#818181] rounded-lg focus:ring-[#a8499c] focus:border-[#a8499c]"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#818181] mb-1">Date</label>
                <input
                  type="date"
                  value={formData.start.toISOString().split('T')[0]}
                  onChange={handleDateChange}
                  className="w-full p-2 border border-[#818181] rounded-lg focus:ring-[#a8499c] focus:border-[#a8499c]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#818181] mb-1">Duration (hours)</label>
                <input
                  type="number"
                  name="hours"
                  min="0.5"
                  step="0.5"
                  value={formData.hours}
                  onChange={handleChange}
                  className="w-full p-2 border border-[#818181] rounded-lg focus:ring-[#a8499c] focus:border-[#a8499c]"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#818181] mb-1">Start Time</label>
                <input
                  type="time"
                  value={formData.start.toTimeString().substring(0, 5)}
                  onChange={(e) => handleTimeChange(e, 'start')}
                  className="w-full p-2 border border-[#818181] rounded-lg focus:ring-[#a8499c] focus:border-[#a8499c]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#818181] mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.end.toTimeString().substring(0, 5)}
                  onChange={(e) => handleTimeChange(e, 'end')}
                  className="w-full p-2 border border-[#818181] rounded-lg focus:ring-[#a8499c] focus:border-[#a8499c]"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-[#818181] mb-1">Assignee</label>
                <input
                  type="text"
                  name="requestedName"
                  value={formData.requestedName}
                  onChange={handleChange}
                  className="w-full p-2 border border-[#818181] rounded-lg focus:ring-[#a8499c] focus:border-[#a8499c]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#818181] mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full p-2 border border-[#818181] rounded-lg focus:ring-[#a8499c] focus:border-[#a8499c]"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="LEED">LEED</option>
                  <option value="BIM">BIM</option>
                  <option value="MEP">MEP</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#818181] mb-1">Project</label>
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="w-full p-2 border border-[#818181] rounded-lg focus:ring-[#a8499c] focus:border-[#a8499c]"
              />
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-[#818181] bg-opacity-10 text-[#818181] px-4 py-2 rounded-lg hover:bg-opacity-20 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#a8499c] text-white px-4 py-2 rounded-lg hover:bg-[#8a3a7f] transition-colors font-medium"
              >
                Save Event
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-6 p-4 bg-[#f8f8f8] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#818181]">Time</span>
                <span className="text-sm font-semibold">
                  {formatTime(selectedTask.start)} - {formatTime(selectedTask.end)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#818181]">Date</span>
                <span className="text-sm font-semibold">{formatDate(selectedTask.start)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-[#818181]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#818181]">Assignee</p>
                  <p className="text-sm">{selectedTask.requestedName}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-[#818181]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H5a1 1 0 010-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#818181]">Project</p>
                  <p className="text-sm">{selectedTask.project}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-[#818181]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H5a1 1 0 010-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#818181]">Department</p>
                  <p className="text-sm">{selectedTask.department}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-[#818181]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#818181]">Duration</p>
                  <p className="text-sm">{selectedTask.hours} hours</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={closeTaskDetails}
                className="flex-1 bg-[#818181] bg-opacity-10 text-[#818181] px-4 py-2 rounded-lg hover:bg-opacity-20 transition-colors font-medium"
              >
                Close
              </button>
              <button className="flex-1 bg-[#a8499c] text-white px-4 py-2 rounded-lg hover:bg-[#8a3a7f] transition-colors font-medium">
                View Details
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarEventModal;