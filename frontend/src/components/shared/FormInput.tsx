import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control } from 'react-hook-form';

interface FormInputProps extends Omit<TextFieldProps, 'name'> {
  name: string;
  control: Control<any>;
  rules?: Record<string, any>;
}

export const FormInput = ({ name, control, rules, ...props }: FormInputProps) => {
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
          error={!!error}
          helperText={error?.message}
          fullWidth
          margin="normal"
        />
      )}
    />
  );
};
