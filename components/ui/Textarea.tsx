import { TextareaHTMLAttributes, forwardRef } from "react";
import { Textarea as ChakraTextarea } from "@chakra-ui/react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <ChakraTextarea
        ref={ref}
        className={className}
        minH="112px"
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

Textarea.displayName = "Textarea";
