import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — J. ZYMAR" },
      { name: "description", content: "Acesso ao sistema de gestão pedagógica." },
      { property: "og:title", content: "Entrar — J. ZYMAR" },
      { property: "og:description", content: "Acesso ao sistema de gestão pedagógica." },
    ],
  }),
  component: AuthPage,
});

const registoSchema = z.object({
  nome: z.string().trim().min(3, "Nome demasiado curto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  senha: z.string().min(8, "A palavra-passe deve ter pelo menos 8 caracteres").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("professor");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setLoading(false);
    if (error) return void toast.error("Email ou palavra-passe incorrectos.");
    navigate({ to: "/painel" });
  }

  async function registar(e: React.FormEvent) {
    e.preventDefault();
    const p = registoSchema.safeParse({ nome, email, senha });
    if (!p.success) return void toast.error(p.error.issues[0]?.message);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: p.data.email,
      password: p.data.senha,
      options: { emailRedirectTo: window.location.origin + "/painel", data: { nome: p.data.nome, cargo } },
    });
    setLoading(false);
    if (error) return void toast.error(error.message);
    toast.success("Registo feito. Confirme o seu email e aguarde a credenciação.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Gestão Pedagógica</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="entrar">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entrar">Entrar</TabsTrigger>
              <TabsTrigger value="registar">Registar</TabsTrigger>
            </TabsList>
            <TabsContent value="entrar">
              <form onSubmit={entrar} className="mt-4 space-y-4">
                <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label>Palavra-passe</Label><Input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
                <Button className="w-full" disabled={loading}>Entrar</Button>
              </form>
            </TabsContent>
            <TabsContent value="registar">
              <form onSubmit={registar} className="mt-4 space-y-4">
                <div><Label>Nome completo</Label><Input required value={nome} onChange={(e) => setNome(e.target.value)} /></div>
                <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label>Palavra-passe</Label><Input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
                <div>
                  <Label>Cargo pretendido</Label>
                  <Select value={cargo} onValueChange={setCargo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="professor">Professor</SelectItem>
                      <SelectItem value="coordenador">Coordenador</SelectItem>
                      <SelectItem value="pedagogico">Pedagógico</SelectItem>
                      <SelectItem value="encarregado">Encarregado de Educação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" disabled={loading}>Criar conta</Button>
                <p className="text-center text-xs text-muted-foreground">A conta fica pendente até ser credenciada pelo ADM ou Pedagógico.</p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
