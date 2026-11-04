// src/tools/productivity/bulletin-board/controls/AddTask.tsx
import React, { useState } from 'react';
import { Card, IconButton } from '@/core/components/ui';
import { MdClose } from 'react-icons/md';
import { useTaskStore } from '../store/taskStore';
import { useAddTask } from './useAddTask';
import { TaskForm } from '../shared';

interface AddTaskProps {
  handleCloseWorkspace: () => void;
}

export function AddTask({ handleCloseWorkspace }: AddTaskProps): React.JSX.Element {
  const addTask = useTaskStore((state) => state.addTask);
  const { formValues, handleFieldChange, resetFormValues, isSubmitting, setIsSubmitting } = useAddTask();
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    if (!formValues.title.trim()) return;
    setIsSubmitting(true);
    setSubmitErrorMessage(null);
    try {
      await addTask({
        title: formValues.title.trim(),
        type: formValues.taskType,
        freqValue: formValues.freqValue,
        freqUnit: formValues.freqUnit,
        startDate: formValues.startDate,
        endDate: formValues.taskType === 'temporary' && formValues.endDate ? formValues.endDate : null,
        notes: formValues.notes,
      });
      resetFormValues();
      handleCloseWorkspace();
    } catch (caughtError) {
      console.error('Failed to add task:', caughtError);
      setSubmitErrorMessage('Could not save the task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 relative">
      <div className="absolute top-4 right-4">
        <IconButton size="sm" onClick={handleCloseWorkspace} ariaLabel="Close" className="text-gray-400 hover:text-gray-600">
          <MdClose size={20} />
        </IconButton>
      </div>
      
      <TaskForm
        formValues={formValues}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onClose={handleCloseWorkspace}
        isSubmitting={isSubmitting}
        submitLabel="Add Task"
        titleLabel="Add New Task"
      />
      
      {submitErrorMessage && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{submitErrorMessage}</p>
      )}
    </Card>
  );
}