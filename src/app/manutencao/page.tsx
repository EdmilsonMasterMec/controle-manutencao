
"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

import {
  carregarMaquinas,
  salvarMaquinas,
  Maquina,
  HistoricoManutencao,
  FotoServico,
} from "../../lib/store";
