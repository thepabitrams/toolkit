// src/tools/productivity/bulletin-board/view/tasks/Edit.tsx
import React, { useState } from 'react';
import { Card } from '@/core/components/ui';
import { Container } from '@/core/components/ui/Container';
import { Overlay } from '@/core/components/ui/Overlay';
import { TaskForm, type TaskFormValues } from '../../shared';
import type { Task } from '../../store/taskStore';

interface EditProps {
  isOpen: boolean;
  onClose: () => void;
  task: Pick<Task, 'id' | 'title' | 'type' | 'freqValue' | 'freqUnit' | 'startDate' | 'endDate' | 'notes'>;
  onSave: (taskId: string, taskPatch: Partial<Task>) => Promise<void>;
}

function buildInitialFormValues(task: EditProps['task']): TaskFormValues {
  return {
    title: task.title,
    taskType: task.type,
    freqValue: task.freqValue,
    freqUnit: task.freqUnit,
    startDate: task.startDate,
    endDate: task.endDate ?? '',
    notes: task.notes ?? '',
  };
}

export function Edit({ isOpen, onClose, task, onSave }: EditProps): React.JSX.Element {
  const [formValues, setFormValues] = useState<TaskFormValues>(() => buildInitialFormValues(task));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  const handleFieldChange = <FieldName extends keyof TaskFormValues,>(
    fieldName: FieldName,
    fieldValue: TaskFormValues[FieldName]
  ): void => {
    setFormValues((previousFormValues) => ({ ...previousFormValues, [fieldName]: fieldValue }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formValues.title.trim()) return;
    setIsSubmitting(true);
    setSubmitErrorMessage(null);
    try {
      await onSave(task.id, {
        title: formValues.title.trim(),
        type: formValues.taskType,
        freqValue: formValues.freqValue,
        freqUnit: formValues.freqUnit,
        startDate: formValues.startDate,
        endDate: formValues.taskType === 'temporary' && formValues.endDate ? formValues.endDate : null,
        notes: formValues.notes,
      });
      onClose();
    } catch (caughtError) {
      console.error('Failed to save task:', caughtError);
      setSubmitErrorMessage('Could not save the task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Overlay isOpen={isOpen} onClose={onClose}>
      <Container className="px-0 max-w-2xl mx-auto py-8">
        <Card className="p-6 shadow-xl">
          <TaskForm
            formValues={formValues}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            onClose={onClose}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
            titleLabel="Edit Task"
          />
          {submitErrorMessage && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{submitErrorMessage}</p>
          )}
        </Card>
      </Container>
    </Overlay>
  );
}