import { InputHTMLAttributes, forwardRef } from "react";
import { Input as ChakraInput } from "@chakra-ui/react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <ChakraInput
        ref={ref}
        className={className}
        borderRadius="xl"
        bg="white"
        borderColor={error ? "red.400" : "gray.300"}
        _focusVisible={{ borderColor: error ? "red.500" : "brand.600", boxShadow: "none" }}
        _placeholder={{ color: "gray.400" }}
        fontSize="sm"
        px={3}
        py={2.5}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
