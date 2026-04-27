import { ReactNode } from "react";
import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <FormControl isInvalid={Boolean(error)}>
      <FormLabel mb={1.5} fontSize="sm" fontWeight="semibold" color="brand.900">
        {label}
      </FormLabel>
      {children}
      {error ? <FormErrorMessage fontSize="xs">{error}</FormErrorMessage> : null}
    </FormControl>
  );
}
