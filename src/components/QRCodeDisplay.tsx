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
    QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 2 }, (err) => {
      if (err) console.error(err);
    });
    QRCode.toDataURL(url, { width: 200, margin: 2 }).then(setDataUrl);
  }, [url]);

  function download() {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${menuName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    a.click();
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <canvas ref={canvasRef} className="rounded-lg border border-gray-200" />
      <div className="space-y-2">
        <p className="text-sm text-gray-500 break-all">{url}</p>
        <div className="flex gap-2">
          <button
            onClick={download}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Download PNG
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm bg-amber-100 text-amber-900 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Open Menu
          </a>
        </div>
      </div>
    </div>
  );
}
