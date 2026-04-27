"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Text,
} from "@chakra-ui/react";
import { Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { canAccessPath, getDefaultRouteForRole, isPublicPath } from "@/lib/access";
import { useAuth } from "@/hooks";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { loading, isAuthenticated, user } = useAuth();
  const publicPath = isPublicPath(pathname);

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" px={4}>
        <Box
          borderRadius="xl"
          borderWidth="1px"
          borderColor="gray.200"
          bg="white"
          px={4}
          py={3}
          fontSize="sm"
          color="gray.600"
          boxShadow="0 10px 30px rgba(22, 50, 34, 0.08)"
        >
          Carregando sessao...
        </Box>
      </Flex>
    );
  }

  if (!isAuthenticated || !user) {
    if (publicPath) return <>{children}</>;
    return <Navigate to="/login" replace />;
  }

  const fallback = getDefaultRouteForRole(user.perfil);

  if (publicPath) {
    return <Navigate to={fallback} replace />;
  }

  if (!canAccessPath(user.perfil, pathname)) {
    return <Navigate to={fallback} replace />;
  }

  return (
    <Box minH="100vh" w="100%" overflowX="hidden">
      <Flex w="100%" minH="100vh" gap={{ base: 0, md: 4 }} direction={{ base: "column", md: "row" }} align="stretch">
        <Box display={{ base: "none", md: "block" }} w="320px" flexShrink={0} p={4} pr={0}>
          <Sidebar />
        </Box>

        <Box
          flex="1"
          minW="0"
          bg="transparent"
          p={{ base: 3, md: 6 }}
        >
          <Flex mb={4} align="center" justify="space-between" display={{ base: "flex", md: "none" }}>
            <Button
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
              bg="white"
              fontSize="sm"
              fontWeight="semibold"
              onClick={() => setOpen((current) => !current)}
            >
              Menu
            </Button>
            <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="brand.700">
              Painel Municipal
            </Text>
          </Flex>

          <Box minH="70vh" minW={0}>
            {children}
          </Box>
        </Box>
      </Flex>

      <Drawer isOpen={open} placement="left" onClose={() => setOpen(false)} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="transparent" boxShadow="none">
          <DrawerBody p={4}>
            <Sidebar onNavigate={() => setOpen(false)} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
