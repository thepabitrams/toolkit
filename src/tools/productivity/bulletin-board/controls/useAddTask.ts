// src/tools/productivity/bulletin-board/controls/useAddTask.ts
import { useCallback, useState } from 'react';
import { formatLocalDateKey } from '../lib/date';
import type { TaskFormValues } from '../shared';

interface UseAddTaskReturn {
  formValues: TaskFormValues;
  handleFieldChange: <FieldName extends keyof TaskFormValues>(
    fieldName: FieldName,
    fieldValue: TaskFormValues[FieldName]
  ) => void;
  resetFormValues: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (nextValue: boolean) => void;
}

function buildInitialFormValues(): TaskFormValues {
  return {
    title: '',
    taskType: 'temporary',
    freqValue: 1,
    freqUnit: 'day',
    startDate: formatLocalDateKey(new Date()),
    endDate: '',
    notes: '',
  };
}

export function useAddTask(): UseAddTaskReturn {
  const [formValues, setFormValues] = useState<TaskFormValues>(buildInitialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = useCallback(
    <FieldName extends keyof TaskFormValues,>(fieldName: FieldName, fieldValue: TaskFormValues[FieldName]): void => {
      setFormValues((previousFormValues) => ({ ...previousFormValues, [fieldName]: fieldValue }));
    },
    []
  );

  const resetFormValues = useCallback((): void => {
    setFormValues(buildInitialFormValues());
    setIsSubmitting(false);
  }, []);

  return { formValues, handleFieldChange, resetFormValues, isSubmitting, setIsSubmitting };
}