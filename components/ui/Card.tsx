import { HTMLAttributes } from "react";
import { Box } from "@chakra-ui/react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Box
      className={className}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="gray.200"
      bg="white"
      p={{ base: 4, md: 5 }}
      boxShadow="0 10px 30px rgba(22, 50, 34, 0.08)"
      {...props}
    />
  );
}
