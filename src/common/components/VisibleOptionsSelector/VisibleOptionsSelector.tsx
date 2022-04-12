import { FC, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { OperationOption } from '../DataTable/DataTableFilters';

export const VisibleOptionsSelector: FC<{
  value: string;
  onChange: (value: string) => void;
  options?: OperationOption[];
}> = ({ value, onChange, options }) => {
  return (
    <Form>
      {options
        ? options.map(option => (
            <Form.Check
              key={option.operationLabel}
              name='radioBtn'
              type='radio'
              label={option.operationLabel}
              checked={value === option.operationLabel}
              onClick={() => onChange(option.operationLabel)}
            />
          ))
        : null}
    </Form>
  );
};
