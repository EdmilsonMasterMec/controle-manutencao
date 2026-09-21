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
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
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
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: index === indiceAtual ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          background: "rgba(11, 15, 25, 0.35)",
        }}
      />
    </div>
  );
}
