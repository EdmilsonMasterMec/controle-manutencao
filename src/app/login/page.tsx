"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      // Busca o usuário na tabela que criamos no Supabase
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        setErro("E-mail não encontrado no sistema.");
        setCarregando(false);
        return;
      }

      if (data.status !== "Ativo") {
        setErro("Esta conta está bloqueada ou inativa.");
        setCarregando(false);
        return;
      }

      // Salva o usuário logado no navegador e redireciona para o painel
      localStorage.setItem("usuarioLogado", JSON.stringify(data));
      router.push("/");
    } catch (err) {
      setErro("Ocorreu um erro ao tentar fazer login.");
      setCarregando(false);
    }
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "#08111f",
      padding: "20px" 
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        background: "#111827", 
        padding: "40px 30px", 
        borderRadius: "16px", 
        border: "1px solid rgba(255,255,255,0.08)", 
        boxShadow: "0 15px 35px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#ffb000", fontSize: "22px", fontWeight: "700", marginBottom: "6px" }}>⚙️ Robert Engenharia</h2>
          <p style={{ color: "#9ca3af", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Painel de Manutenção</p>
        </div>

        {erro && (
          <div style={{ background: "rgba(255, 119, 119, 0.15)", border: "1px solid rgba(255, 119, 119, 0.3)", color: "#ff7777", padding: "12px", borderRadius: "8px", fontSize: "13px", textAlign: "center" }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", color: "#9ca3af", fontSize: "13px", marginBottom: "6px", fontWeight: "600" }}>E-mail de Acesso</label>
            <input 
              type="email" 
              placeholder="Digite seu e-mail..." 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: "100%", padding: "12px 14px", background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", outline: "none", fontSize: "14px" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={carregando}
            style={{ width: "100%", padding: "13px", background: "#ffb000", color: "#000", fontWeight: "700", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "15px", marginTop: "10px", transition: "0.2s" }}
          >
            {carregando ? "Entrando..." : "Entrar no Sistema"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <span style={{ color: "#6b7280", fontSize: "12px" }}>Dica: Use <strong style={{ color: "#9ca3af" }}>admin@robertengenharia.com</strong></span>
        </div>
      </div>
    </div>
  );
}