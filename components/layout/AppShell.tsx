"use client";

import { useEffect, useState } from "react";
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
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { canAccessPath, getDefaultRouteForRole, isPublicPath } from "@/lib/access";
import { useAuth } from "@/hooks";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { loading, isAuthenticated, user } = useAuth();
  const publicPath = isPublicPath(pathname);
  const hasAccess = user ? canAccessPath(user.perfil, pathname) : false;

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      if (!publicPath) navigate("/login", { replace: true });
      return;
    }

    if (!user) return;

    const fallback = getDefaultRouteForRole(user.perfil);

    if (publicPath) {
      navigate(fallback, { replace: true });
      return;
    }

    if (!canAccessPath(user.perfil, pathname)) {
      navigate(fallback, { replace: true });
    }
  }, [loading, isAuthenticated, user, publicPath, pathname, navigate]);

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

  if (!isAuthenticated) {
    if (publicPath) return <>{children}</>;
    return null;
  }

  if (!user) return null;

  if (publicPath || !hasAccess) {
    return null;
  }

  return (
    <Box minH="100vh" px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
      <Flex mx="auto" maxW="1120px" minH="calc(100vh - 2rem)" gap={{ base: 4, md: 6 }}>
        <Box display={{ base: "none", md: "block" }} w="320px" flexShrink={0}>
          <Sidebar />
        </Box>

        <Box
          flex="1"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="gray.200"
          bg="rgba(255, 255, 255, 0.75)"
          p={{ base: 4, md: 6 }}
          boxShadow="0 10px 30px rgba(22, 50, 34, 0.08)"
          backdropFilter="blur(6px)"
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

          <Box minH="70vh">{children}</Box>
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
