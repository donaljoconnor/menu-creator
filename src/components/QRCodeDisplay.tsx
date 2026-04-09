"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface Props {
  url: string;
  menuName: string;
}

export default function QRCodeDisplay({ url, menuName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(
      canvasRef.current,
      url,
      {
        width: 180,
        margin: 2,
        color: { dark: "#EDE6D8", light: "#161210" },
      },
      (err) => {
        if (err) console.error(err);
      }
    );
    QRCode.toDataURL(url, {
      width: 180,
      margin: 2,
      color: { dark: "#EDE6D8", light: "#161210" },
    }).then(setDataUrl);
  }, [url]);

  function download() {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${menuName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  }

  return (
    <div className="flex flex-col items-start gap-6 sm:flex-row">
      <div className="bg-lift border-rim shrink-0 rounded-xl border p-3">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>
      <div className="flex w-full flex-col gap-3 pt-1">
        <p className="text-dust font-mono text-xs leading-relaxed break-all">{url}</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={download}
            className="bg-lift border-rim text-ash hover:border-ash hover:text-parchment rounded-lg border px-3 py-1.5 text-xs transition-colors duration-150"
          >
            Download PNG
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="bg-gold text-ink hover:bg-gilt rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150"
          >
            Open Menu ↗
          </a>
        </div>
      </div>
    </div>
  );
}
