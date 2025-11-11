import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control } from 'react-hook-form';

interface FormInputProps extends Omit<TextFieldProps, 'name'> {
  name: string;
  control: Control<any>;
  rules?: Record<string, any>;
  dataTestId?: string;
}

export const FormInput = ({ name, control, rules, dataTestId, ...props }: FormInputProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue=""
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          // Provide an opt-in data-test-id for e2e testing
          data-test-id={dataTestId}
          error={!!error}
          helperText={error?.message}
          fullWidth
          margin="normal"
        />
      )}
    />
  );
};
