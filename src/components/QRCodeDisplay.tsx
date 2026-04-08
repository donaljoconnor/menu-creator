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
    <div className="flex items-start gap-6">
      <div className="bg-lift border border-rim rounded-xl p-3 shrink-0">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>
      <div className="flex flex-col gap-3 pt-1">
        <p className="text-xs text-dust font-mono break-all leading-relaxed">{url}</p>
        <div className="flex gap-2">
          <button
            onClick={download}
            className="text-xs bg-lift border border-rim text-ash hover:border-ash hover:text-parchment px-3 py-1.5 rounded-lg transition-colors duration-150"
          >
            Download PNG
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs bg-gold text-ink font-semibold hover:bg-gilt px-3 py-1.5 rounded-lg transition-colors duration-150"
          >
            Open Menu ↗
          </a>
        </div>
      </div>
    </div>
  );
}
