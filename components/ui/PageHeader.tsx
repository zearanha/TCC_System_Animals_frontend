import { Text, VStack } from "@chakra-ui/react";

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <VStack align="start" spacing={1}>
      <Text as="h1" fontFamily="heading" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="semibold" color="brand.900">
        {title}
      </Text>
      <Text fontSize={{ base: "sm", md: "md" }} color="gray.600">
        {description}
      </Text>
    </VStack>
  );
}
