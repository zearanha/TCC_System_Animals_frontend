import { SelectHTMLAttributes, forwardRef } from "react";
import { Select as ChakraSelect } from "@chakra-ui/react";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <ChakraSelect
        ref={ref}
        className={className}
        borderRadius="xl"
        bg="white"
        borderColor={error ? "red.400" : "gray.300"}
        _focusVisible={{ borderColor: error ? "red.500" : "brand.600", boxShadow: "none" }}
        fontSize="sm"
        px={3}
        py={2.5}
        {...props}
      >
        {children}
      </ChakraSelect>
    );
  }
);

Select.displayName = "Select";
