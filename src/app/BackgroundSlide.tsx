"use client";

import { useEffect, useState } from "react";

const imagens = [
  "/images/fundo1.png",
  "/images/fundo2.png",
  "/images/fundo3.jpg",
];

export default function BackgroundSlide() {
  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % imagens.length);
    }, 6000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {imagens.map((img, index) => (
        <div
          key={img}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",

            backgroundImage: `url("${img}")`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",

            opacity: index === indiceAtual ? 1 : 0,

            transition:
              "opacity 2s ease-in-out",

            willChange: "opacity",
          }}
        />
      ))}

      {/* 
        Camada clara para manter o conteúdo
        do sistema fácil de visualizar.
      */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",

          background:
            "rgba(255, 255, 255, 0.22)",
        }}
      />
    </div>
  );
}