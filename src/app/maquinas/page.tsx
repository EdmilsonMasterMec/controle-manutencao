const imprimirQrCode = (equipamento: Equipamento) => {
  const qrElement = document.getElementById(
    `qr-code-${equipamento.id}`
  );

  if (!qrElement) {
    alert("QR Code não encontrado.");
    return;
  }

  const qrSvg = qrElement.outerHTML;

  const janela = window.open(
    "",
    "_blank",
    "width=700,height=800"
  );

  if (!janela) {
    alert(
      "Não foi possível abrir a janela de impressão. Verifique se o navegador bloqueou o pop-up."
    );
    return;
  }

  janela.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />

        <title>Identificação de manutenção</title>

        <style>
          @page {
            size: A4;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100%;
            font-family: Arial, Helvetica, sans-serif;
            background: white;
          }

          .pagina {
            width: 100%;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 45px;
          }

          .etiqueta {
            width: 320px;
            min-height: 360px;
            border: 2px solid #222;
            border-radius: 18px;
            padding: 30px 25px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            background: #ffffff;
          }

          .titulo {
            width: 100%;
            text-align: center;
            font-size: 22px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 30px;
          }

          .qr {
            width: 220px;
            height: 220px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .qr svg {
            width: 220px !important;
            height: 220px !important;
            display: block;
          }

          @media print {
            html,
            body {
              width: 100%;
              height: 100%;
              background: white;
            }

            .pagina {
              min-height: 100vh;
              padding-top: 45px;
            }

            .etiqueta {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>

      <body>
        <div class="pagina">
          <div class="etiqueta">

            <div class="titulo">
              Identificação de manutenção
            </div>

            <div class="qr">
              ${qrSvg}
            </div>

          </div>
        </div>

        <script>
          window.onload = function () {
            setTimeout(function () {
              window.print();
            }, 300);
          };

          window.onafterprint = function () {
            setTimeout(function () {
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);

  janela.document.close();
};