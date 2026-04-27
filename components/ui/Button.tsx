"use client";

import { ButtonHTMLAttributes } from "react";
import { Button as ChakraButton, Spinner } from "@chakra-ui/react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, object> = {
  primary: {
    bg: "brand.600",
    color: "white",
    _hover: { bg: "brand.700" }
  },
  secondary: {
    bg: "accent.100",
    color: "accent.800",
    _hover: { bg: "accent.200" }
  },
  ghost: {
    bg: "transparent",
    color: "brand.700",
    _hover: { bg: "brand.50" }
  },
  danger: {
    bg: "red.600",
    color: "white",
    _hover: { bg: "red.700" }
  }
};

export function Button({
  children,
  className,
  variant = "primary",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <ChakraButton
      className={className}
      borderRadius="xl"
      px={4}
      py={2.5}
      fontSize="sm"
      fontWeight="semibold"
      transition="background-color 0.2s ease"
      isDisabled={disabled || isLoading}
      sx={variantStyles[variant]}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          Carregando...
        </>
      ) : (
        children
      )}
    </ChakraButton>
  );
}
