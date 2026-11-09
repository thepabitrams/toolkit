// src/tools/productivity/bulletin-board/shared/TaskForm.tsx
import React from 'react';
import { Button, Input, Textarea, Select, DatePicker } from '@/core/components/ui';

export interface TaskFormValues {
  title: string;
  taskType: 'permanent' | 'temporary';
  freqValue: number;
  freqUnit: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string | null;
  notes: string;
}

interface TaskFormProps {
  formValues: TaskFormValues;
  onFieldChange: <FieldName extends keyof TaskFormValues>(
    fieldName: FieldName,
    fieldValue: TaskFormValues[FieldName]
  ) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting?: boolean;
  submitLabel: string;
  titleLabel: string;
}

const taskTypeOptions = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'temporary', label: 'Temporary' },
];

const frequencyUnitOptions = [
  { value: 'day', label: 'Days' },
  { value: 'week', label: 'Weeks' },
  { value: 'month', label: 'Months' },
];

const uniformControlContainerClassName =
  'h-10 w-full [&_input]:h-10 [&_button]:h-10 [&_select]:h-10 [&_input]:box-border [&_button]:box-border [&_select]:box-border';

export function TaskForm({
  formValues,
  onFieldChange,
  onSubmit,
  onClose,
  isSubmitting = false,
  submitLabel,
  titleLabel,
}: TaskFormProps): React.JSX.Element {
  const { title, taskType, freqValue, freqUnit, startDate, endDate, notes } = formValues;

  const handleFormKeyDown = (keyboardEvent: React.KeyboardEvent<HTMLDivElement>): void => {
    if (keyboardEvent.key === 'Enter' && title.trim()) {
      keyboardEvent.preventDefault();
      onSubmit();
    }
    if (keyboardEvent.key === 'Escape') onClose();
  };

  const formLabelClassName = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

  return (
    <div className="space-y-6" onKeyDown={handleFormKeyDown}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{titleLabel}</h2>

      <div>
        <label className={formLabelClassName}>Title</label>
        <Input
          placeholder="Enter task title..."
          value={title}
          onChange={(changeEvent) => onFieldChange('title', changeEvent.target.value)}
          autoFocus
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
        <div>
          <label className={formLabelClassName}>Card Type</label>
          <div className={uniformControlContainerClassName}>
            <Select
              selectOptions={taskTypeOptions}
              selectedValue={taskType}
              onValueChange={(nextValue) =>
                onFieldChange('taskType', nextValue as 'permanent' | 'temporary')
              }
              className="w-full h-10"
            />
          </div>
        </div>

        <div>
          <label className={formLabelClassName}>Frequency</label>
          <div className="flex items-center gap-3 h-10">
            <div className="h-10 w-24 shrink-0 [&_input]:h-10 [&_input]:box-border">
              <Input
                type="number"
                min="1"
                value={freqValue}
                onChange={(changeEvent) =>
                  onFieldChange('freqValue', parseInt(changeEvent.target.value, 10) || 1)
                }
                className="w-full h-10"
              />
            </div>
            <div className={`${uniformControlContainerClassName} flex-1`}>
              <Select
                selectOptions={frequencyUnitOptions}
                selectedValue={freqUnit}
                onValueChange={(nextValue) =>
                  onFieldChange('freqUnit', nextValue as 'day' | 'week' | 'month')
                }
                className="w-full h-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
        <div>
          <label className={formLabelClassName}>Start Date</label>
          <div className={uniformControlContainerClassName}>
            <DatePicker
              value={startDate}
              onChange={(nextDate) => onFieldChange('startDate', nextDate)}
            />
          </div>
        </div>

        <div>
          <label className={formLabelClassName}>End Date</label>
          {taskType === 'temporary' ? (
            <div className={uniformControlContainerClassName}>
              <DatePicker
                value={endDate ?? ''}
                onChange={(nextDate) => onFieldChange('endDate', nextDate)}
                minDate={startDate}
              />
            </div>
          ) : (
            <div className="h-10 w-full box-border border border-gray-200 dark:border-gray-700 rounded-lg px-3 flex items-center bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500">
              Permanent – no end date
            </div>
          )}
        </div>
      </div>

      <div>
        <label className={formLabelClassName}>Notes (optional)</label>
        <Textarea
          placeholder="Add notes..."
          value={notes}
          onChange={(changeEvent) => onFieldChange('notes', changeEvent.target.value)}
          rows={3}
          className="w-full"
        />
      </div>

      <div className="pt-2">
        <Button variant="primary" onClick={onSubmit} disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </div>
  );
}