import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMe, useInstituicao, NOMES_PAPEL } from "@/lib/dados";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageCircle } from "lucide-react";
import {
  LayoutDashboard, Settings, BookOpen, UserPlus, ListOrdered, PenLine, Table2, FileText, Users, LogOut, TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Layout,
});

function Layout() {
  const { data: me, isLoading } = useMe();
  const { data: inst } = useInstituicao();
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) return <div className="p-10 text-muted-foreground">A carregar…</div>;

  if (!me?.aprovado) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-semibold">Conta {me?.profile?.status === "REVOGADO" ? "revogada" : "pendente"}</h1>
          <p className="mt-3 text-muted-foreground">
            {me?.profile?.status === "REVOGADO"
              ? "O seu acesso foi revogado. Contacte a Direcção."
              : "A sua conta aguarda credenciação pelo ADM ou pelo Pedagógico."}
          </p>
          <Button className="mt-6" onClick={sair}>Sair</Button>
        </div>
      </div>
    );
  }

  const links = [
    { to: "/painel", label: "Painel", icon: LayoutDashboard, show: !me.isEncarregado },
    { to: "/aproveitamento", label: "Aproveitamento", icon: TrendingUp, show: me.isEncarregado },
    { to: "/configuracoes", label: "Instituição", icon: Settings, show: me.isAdmin },
    { to: "/disciplinas", label: "Disciplinas", icon: BookOpen, show: me.isStaff },
    { to: "/alunos", label: "Cadastro de Alunos", icon: UserPlus, show: me.isStaff },
    { to: "/lista-nominal", label: "Lista Nominal", icon: ListOrdered, show: !me.isEncarregado },
    { to: "/notas", label: "Lançar Notas", icon: PenLine, show: me.isStaff || me.isProfessor || me.isCoordenador },
    { to: "/pautas", label: "Pautas", icon: Table2, show: !me.isEncarregado },
    { to: "/boletins", label: "Boletins", icon: FileText, show: !me.isEncarregado },
    { to: "/utilizadores", label: "Utilizadores", icon: Users, show: me.isStaff },
  ] as const;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-16 shrink-0 flex-col bg-sidebar text-sidebar-foreground sm:w-64 print:hidden">
        <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
          {inst?.logo_url && <img src={inst.logo_url} alt="" className="h-10 w-10 rounded bg-background object-contain p-0.5" />}
          <div className="hidden text-sm font-semibold leading-tight sm:block">{inst?.nome_escola}</div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {links.filter((l) => l.show).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent font-semibold" }}
            >
              <l.icon className="h-4 w-4 shrink-0" /> <span className="hidden sm:inline">{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-xs sm:p-4">
          <div className="hidden sm:block"><div className="font-medium">{me.profile?.nome}</div><div className="opacity-70">{me.papeis.map((p) => NOMES_PAPEL[p]).join(", ")}</div></div>
          <Button size="sm" variant="secondary" className="mt-3 w-full px-0 sm:px-3" onClick={sair} title="Sair">
            <LogOut className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}
