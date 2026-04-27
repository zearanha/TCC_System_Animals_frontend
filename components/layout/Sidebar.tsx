"use client";

import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useAuth } from "@/hooks";
import { UserRole } from "@/types";
import { Button } from "@/components/ui";

interface NavItem {
  href: string;
  label: string;
  badge: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", badge: "DB", roles: ["ADMIN"] },
  { href: "/usuarios", label: "Modulo de Usuarios", badge: "US", roles: ["ADMIN"] },
  { href: "/proprietarios", label: "Modulo de Proprietarios", badge: "PR", roles: ["ADMIN"] },
  { href: "/agentes", label: "Modulo de Agentes", badge: "AG", roles: ["ADMIN"] },
  {
    href: "/animais",
    label: "Modulo de Animais",
    badge: "AN",
    roles: ["ADMIN", "PROPRIETARIO"],
  },
  {
    href: "/ocorrencias/nova",
    label: "Registro de Ocorrencia",
    badge: "OC",
    roles: ["ADMIN", "AGENTE"],
  },
  {
    href: "/busca-codigo",
    label: "Busca por Codigo",
    badge: "ID",
    roles: ["ADMIN", "AGENTE"],
  },
  {
    href: "/notificacoes",
    label: "Notificacoes",
    badge: "NT",
    roles: ["ADMIN", "PROPRIETARIO"],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  if (!user) return null;

  const visibleItems = navItems.filter((item) => item.roles.includes(user.perfil));

  async function handleSignOut() {
    await signOut();
    onNavigate?.();
  }

  return (
    <Flex
      h="100%"
      w="100%"
      direction="column"
      minH={{ base: "calc(100vh - 2rem)", md: "100%" }}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="brand.200"
      bg="brand.900"
      p={4}
      color="brand.50"
      boxShadow="0 10px 30px rgba(22, 50, 34, 0.08)"
    >
      <Box mb={6}>
        <Text fontFamily="heading" fontSize="lg" fontWeight="semibold">
          Monitoramento Animal
        </Text>
        <Text fontSize="xs" color="brand.200">
          Painel municipal
        </Text>
      </Box>

      <VStack as="nav" spacing={1.5} align="stretch" flex="1" minH={0} overflowY="auto" pr={1}>
        {visibleItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Flex
              key={item.href}
              as={RouterLink}
              to={item.href}
              onClick={onNavigate}
              align="center"
              gap={3}
              borderRadius="xl"
              px={3}
              py={2.5}
              fontSize="sm"
              transition="background-color 0.2s ease"
              bg={active ? "brand.100" : "transparent"}
              color={active ? "brand.900" : "brand.100"}
              _hover={{ bg: active ? "brand.100" : "brand.800" }}
            >
              <Flex
                h={7}
                w={7}
                align="center"
                justify="center"
                borderRadius="full"
                fontSize="11px"
                fontWeight="bold"
                bg={active ? "brand.900" : "brand.700"}
                color={active ? "brand.50" : "brand.100"}
              >
                {item.badge}
              </Flex>
              <Box as="span" flex="1" minW={0} lineHeight="1.25">
                {item.label}
              </Box>
            </Flex>
          );
        })}
      </VStack>

      <VStack mt="auto" spacing={3} pt={5} align="stretch">
        <Box borderRadius="xl" borderWidth="1px" borderColor="brand.700" bg="rgba(46, 69, 50, 0.8)" p={3}>
          <Text fontSize="sm" fontWeight="semibold" color="brand.50">
            {user.nome}
          </Text>
          <Text fontSize="xs" color="brand.200" wordBreak="break-word">
            {user.email}
          </Text>
          <Text mt={1} fontSize="11px" textTransform="uppercase" letterSpacing="wide" color="brand.300">
            {user.perfil}
          </Text>
        </Box>

        <Button type="button" onClick={() => void handleSignOut()} className="w-full">
          <ExitToAppIcon fontSize="small" />
          <Box as="span" ml={2}>
            Sair
          </Box>
        </Button>
      </VStack>
    </Flex>
  );
}
