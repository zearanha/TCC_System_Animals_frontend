import { Text, VStack } from "@chakra-ui/react";
import { Card } from "./Card";

interface StatCardProps {
  title: string;
  value: number;
  hint: string;
}

export function StatCard({ title, value, hint }: StatCardProps) {
  return (
    <Card>
      <VStack align="start" spacing={3}>
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          {title}
        </Text>
        <Text fontFamily="heading" fontSize="4xl" fontWeight="semibold" color="brand.900">
          {value}
        </Text>
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="brand.600">
          {hint}
        </Text>
      </VStack>
    </Card>
  );
}
