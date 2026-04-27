import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/components/providers/AuthProvider";
import LoginPage from "@/app/login/page";
import DashboardPage from "@/app/dashboard/page";
import UsuariosPage from "@/app/usuarios/page";
import ProprietariosPage from "@/app/proprietarios/page";
import CadastroProprietarioPage from "@/app/proprietarios/novo/page";
import AgentesPage from "@/app/agentes/page";
import AnimaisPage from "@/app/animais/page";
import CadastroAnimalPage from "@/app/animais/novo/page";
import RegistroOcorrenciaPage from "@/app/ocorrencias/nova/page";
import BuscaCodigoPage from "@/app/busca-codigo/page";
import NotificacoesPage from "@/app/notificacoes/page";

export default function App() {
  return (
    <AuthProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/proprietarios" element={<ProprietariosPage />} />
          <Route path="/proprietarios/novo" element={<CadastroProprietarioPage />} />
          <Route path="/agentes" element={<AgentesPage />} />
          <Route path="/animais" element={<AnimaisPage />} />
          <Route path="/animais/novo" element={<CadastroAnimalPage />} />
          <Route path="/ocorrencias/nova" element={<RegistroOcorrenciaPage />} />
          <Route path="/busca-codigo" element={<BuscaCodigoPage />} />
          <Route path="/notificacoes" element={<NotificacoesPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppShell>
    </AuthProvider>
  );
}
