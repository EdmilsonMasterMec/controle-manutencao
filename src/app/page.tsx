"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Truck,
  Wrench,
  Users,
  Activity,
  ArrowRight,
  CircleAlert,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Equipamento = {
  id: number;
  nome: string;
  modelo?: string;
  fabricante?: string;
  horimetro?: string;
  status?: string;
};

type Manutencao = {
  id: number;
  equipamento_id?: number | null;
  status?: string;
  tipo?: string;
  data?: string;
};

export default function Home() {
  const [equipamentos, setEquipamentos] =
    useState<Equipamento[]>([]);

  const [manutencoes, setManutencoes] =
    useState<Manutencao[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    setCarregando(true);

    const [equipamentosResult, manutencoesResult] =
      await Promise.all([
        supabase
          .from("equipamentos")
          .select(
            "id,nome,modelo,fabricante,horimetro,status"
          )
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("manutencoes")
          .select(
            "id,equipamento_id,status,tipo,data"
          )
          .order("id", {
            ascending: false,
          }),
      ]);

    if (!equipamentosResult.error) {
      setEquipamentos(
        (equipamentosResult.data ||
          []) as Equipamento[]
      );
    }

    if (!manutencoesResult.error) {
      setManutencoes(
        (manutencoesResult.data ||
          []) as Manutencao[]
      );
    }

    setCarregando(false);
  }

  const totalMaquinas =
    equipamentos.length;

  const maquinasOperando =
    equipamentos.filter(
      (item) =>
        item.status === "Operando"
    ).length;

  const maquinasManutencao =
    equipamentos.filter(
      (item) =>
        item.status ===
        "Em Manutenção"
    ).length;

  const maquinasParadas =
    equipamentos.filter(
      (item) =>
        item.status === "Parada"
    ).length;

  const manutencoesAbertas =
    manutencoes.filter(
      (item) =>
        item.status !== "Concluída"
    ).length;

  function statusClasse(status?: string) {
    if (status === "Operando") {
      return "dashboard-status verde";
    }

    if (status === "Em Manutenção") {
      return "dashboard-status amarelo";
    }

    return "dashboard-status vermelho";
  }

  return (
    <div className="dashboard-page">

      {/* CABEÇALHO */}
      <div className="dashboard-heading">

        <div>
          <div className="dashboard-overline">
            <Activity size={15} />
            SISTEMA DE GESTÃO
          </div>

          <h1>
            Controle de Manutenção
          </h1>

          <p>
            Acompanhe sua frota,
            manutenção e equipe em
            um único lugar.
          </p>
        </div>

        <Link
          href="/maquinas"
          className="dashboard-main-button"
        >
          <Truck size={18} />
          Equipamentos
          <ArrowRight size={17} />
        </Link>

      </div>

      {/* INDICADORES */}
      <div className="dashboard-cards">

        {/* TOTAL */}
        <Link
          href="/maquinas?filtro=total"
          className="dashboard-card"
        >

          <div className="dashboard-card-icon azul">
            <Truck size={22} />
          </div>

          <div>
            <span>
              Total de equipamentos
            </span>

            <strong>
              {carregando
                ? "—"
                : totalMaquinas}
            </strong>
          </div>

        </Link>

        {/* OPERANDO */}
        <Link
          href="/maquinas?filtro=operando"
          className="dashboard-card"
        >

          <div className="dashboard-card-icon verde">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>
              Operando
            </span>

            <strong>
              {carregando
                ? "—"
                : maquinasOperando}
            </strong>
          </div>

        </Link>

        {/* EM MANUTENÇÃO */}
        <Link
          href="/maquinas?filtro=manutencao"
          className="dashboard-card"
        >

          <div className="dashboard-card-icon amarelo">
            <Wrench size={22} />
          </div>

          <div>
            <span>
              Em manutenção
            </span>

            <strong>
              {carregando
                ? "—"
                : maquinasManutencao}
            </strong>
          </div>

        </Link>

        {/* MANUTENÇÕES ABERTAS */}
        <Link
          href="/maquinas?filtro=abertas"
          className="dashboard-card"
        >

          <div className="dashboard-card-icon vermelho">
            <CircleAlert size={22} />
          </div>

          <div>
            <span>
              Manutenções abertas
            </span>

            <strong>
              {carregando
                ? "—"
                : manutencoesAbertas}
            </strong>
          </div>

        </Link>

      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="dashboard-layout">

        {/* EQUIPAMENTOS */}
        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Equipamentos
              </h2>

              <p>
                Situação atual da frota
              </p>
            </div>

            <Link
              href="/maquinas"
              className="dashboard-link"
            >
              Ver todos
              <ArrowRight size={15} />
            </Link>

          </div>

          {carregando ? (
            <div className="dashboard-empty">
              Carregando equipamentos...
            </div>
          ) : equipamentos.length === 0 ? (
            <div className="dashboard-empty">

              <Truck size={34} />

              <strong>
                Nenhum equipamento
              </strong>

              <span>
                Cadastre seu primeiro
                equipamento para começar.
              </span>

              <Link
                href="/maquinas"
                className="dashboard-empty-button"
              >
                Cadastrar equipamento
              </Link>

            </div>
          ) : (
            <div className="dashboard-machine-list">

              {equipamentos
                .slice(0, 6)
                .map((maquina) => (

                  <Link
                    href={`/maquinas?id=${maquina.id}`}
                    key={maquina.id}
                    className="dashboard-machine"
                  >

                    <div className="dashboard-machine-icon">
                      <Truck size={20} />
                    </div>

                    <div className="dashboard-machine-info">

                      <strong>
                        {maquina.nome}
                      </strong>

                      <span>
                        {maquina.fabricante || ""}
                        {" "}
                        {maquina.modelo || ""}
                      </span>

                    </div>

                    <div className="dashboard-machine-right">

                      <span
                        className={statusClasse(
                          maquina.status
                        )}
                      >
                       