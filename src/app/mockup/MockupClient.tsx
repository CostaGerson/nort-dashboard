'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  PECAS,
  CORES,
  COTAS,
  getShirtSrc,
  type PecaKey,
  type CotaKey,
} from '@/lib/mockup/constants';

// ---------- TIPOS ----------
type StampType = 'image' | 'text';

interface Stamp {
  id: number;
  type: StampType;
  name: string;
  // image stamps
  image?: HTMLImageElement;
  processed?: HTMLImageElement;
  removeBg?: boolean;
  tolerance?: number;
  fileSize?: number;
  // text stamps
  text?: string;
  textColor?: string;
  fontSize?: number;
  // posição comum
  x: number; // 0..1
  y: number; // 0..1
  scale: number;
  _bbox?: { x: number; y: number; w: number; h: number };
}

interface CotasState {
  'cota-peito': boolean;
  'cota-costas': boolean;
  'cota-manga': boolean;
}

// ---------- COMPONENT ----------
export default function MockupClient() {
  // estado principal
  const [peca, setPeca] = useState<PecaKey>('camiseta');
  const [color, setColor] = useState<string>('branco');
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textFontSize, setTextFontSize] = useState(22);
  const [textStampId, setTextStampId] = useState<number | null>(null);
  const [cotasAtivas, setCotasAtivas] = useState<CotasState>({
    'cota-peito': false,
    'cota-costas': false,
    'cota-manga': false,
  });
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stampIdCounter = useRef(0);
  const shirtCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const cotaCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const draggedStampId = useRef<number | null>(null);
  const stampsRef = useRef<Stamp[]>([]); // espelho mutável pra evitar recriação
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // espelho mutável: o canvas precisa ler o estado mais recente em handlers
  useEffect(() => {
    stampsRef.current = stamps;
  }, [stamps]);

  // ---------- TOAST ----------
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // ---------- PRELOAD ----------
  // recarrega imagens quando troca de peça
  useEffect(() => {
    let cancelled = false;
    const cache = shirtCache.current;
    // limpa cache do conjunto antigo (evita confusão entre peças)
    cache.clear();

    let loaded = 0;
    const total = CORES.length;
    CORES.forEach((c) => {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        cache.set(c.key, img);
        loaded++;
        if (c.key === color) {
          fitToScreen();
          render();
        } else if (loaded === total) {
          render();
        }
      };
      img.onerror = () => {
        loaded++;
      };
      img.src = getShirtSrc(peca, c.key);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peca]);

  // preload das cotas uma vez
  useEffect(() => {
    const cache = cotaCache.current;
    (Object.keys(COTAS) as CotaKey[]).forEach((key) => {
      const img = new Image();
      img.onload = () => {
        cache.set(key, img);
        render();
      };
      img.src = COTAS[key];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-render quando qualquer parte do estado relevante muda
  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, stamps, selectedId, cotasAtivas, zoom, peca]);

  // resize → re-fit
  useEffect(() => {
    const onResize = () => fitToScreen();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, peca]);

  // ---------- ZOOM ----------
  const applyZoom = useCallback(
    (z: number) => {
      const shirt = shirtCache.current.get(color);
      if (!shirt) return;
      const wrap = stageWrapRef.current;
      if (!wrap) return;
      wrap.style.width = shirt.width * z + 'px';
      wrap.style.height = shirt.height * z + 'px';
    },
    [color]
  );

  const setZoomClamped = useCallback(
    (z: number) => {
      const next = Math.max(0.1, Math.min(5, z));
      setZoom(next);
      applyZoom(next);
    },
    [applyZoom]
  );

  const zoomBy = useCallback(
    (factor: number) => {
      setZoomClamped(zoom * factor);
    },
    [zoom, setZoomClamped]
  );

  const fitToScreen = useCallback(() => {
    const shirt = shirtCache.current.get(color);
    if (!shirt) return;
    const scrollEl = canvasScrollRef.current;
    if (!scrollEl) return;
    const padding = 48;
    const availW = scrollEl.clientWidth - padding;
    const availH = scrollEl.clientHeight - padding;
    const scaleW = availW / shirt.width;
    const scaleH = availH / shirt.height;
    const fit = Math.min(scaleW, scaleH, 1.5);
    setFitZoom(fit);
    setZoomClamped(fit);
  }, [color, setZoomClamped]);

  // ---------- RENDER ----------
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const shirt = shirtCache.current.get(color);
    if (!shirt) return;

    canvas.width = shirt.width;
    canvas.height = shirt.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(shirt, 0, 0);

    applyZoom(zoom);

    const list = stampsRef.current;
    list.forEach((stamp) => {
      if (stamp.type === 'image') {
        drawImageStamp(ctx, stamp, canvas.width, canvas.height);
      } else if (stamp.type === 'text') {
        drawTextStamp(ctx, stamp, canvas.width);
      }
      if (stamp.id === selectedId && stamp._bbox) {
        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(
          stamp._bbox.x - 4,
          stamp._bbox.y - 4,
          stamp._bbox.w + 8,
          stamp._bbox.h + 8
        );
        ctx.restore();
      }
    });

    // cotas em cima de tudo
    (Object.keys(cotasAtivas) as CotaKey[]).forEach((key) => {
      if (cotasAtivas[key]) {
        const cotaImg = cotaCache.current.get(key);
        if (cotaImg) {
          ctx.drawImage(cotaImg, 0, 0, canvas.width, canvas.height);
        }
      }
    });
  }, [color, selectedId, cotasAtivas, zoom, applyZoom]);

  function drawImageStamp(
    ctx: CanvasRenderingContext2D,
    stamp: Stamp,
    canvasW: number,
    canvasH: number
  ) {
    if (!stamp.processed) return;
    const baseW = canvasW * 0.18 * stamp.scale;
    const ratio = stamp.processed.height / stamp.processed.width;
    const w = baseW;
    const h = baseW * ratio;
    const x = canvasW * stamp.x - w / 2;
    const y = canvasH * stamp.y - h / 2;
    ctx.drawImage(stamp.processed, x, y, w, h);
    stamp._bbox = { x, y, w, h };
  }

  function drawTextStamp(
    ctx: CanvasRenderingContext2D,
    stamp: Stamp,
    canvasW: number
  ) {
    if (!stamp.text || !stamp.text.trim()) {
      stamp._bbox = undefined;
      return;
    }
    const fontPx = (stamp.fontSize ?? 22) * (canvasW / 1400);
    ctx.save();
    ctx.font = `600 ${fontPx}px Inter, -apple-system, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const metrics = ctx.measureText(stamp.text);
    const textW = metrics.width;
    const textH = fontPx * 1.2;
    const canvasH = ctx.canvas.height;
    const x = canvasW * stamp.x - textW / 2;
    const y = canvasH * stamp.y;

    if (stamp.textColor === '#ffffff') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
    } else {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 4;
    }
    ctx.fillStyle = stamp.textColor ?? '#000000';
    ctx.fillText(stamp.text, x, y);
    ctx.restore();

    stamp._bbox = {
      x: x - 4,
      y: y - textH / 2,
      w: textW + 8,
      h: textH,
    };
  }

  // ---------- BG REMOVAL ----------
  function processStamp(stamp: Stamp): HTMLImageElement | null {
    if (!stamp.image) return null;
    if (!stamp.removeBg) return stamp.image;

    const c = document.createElement('canvas');
    c.width = stamp.image.width;
    c.height = stamp.image.height;
    const ctx = c.getContext('2d');
    if (!ctx) return stamp.image;
    ctx.drawImage(stamp.image, 0, 0);
    const imgData = ctx.getImageData(0, 0, c.width, c.height);
    const d = imgData.data;
    const w = c.width;
    const h = c.height;

    const samples: number[][] = [];
    [
      [0, 0],
      [w - 1, 0],
      [0, h - 1],
      [w - 1, h - 1],
    ].forEach(([x, y]) => {
      const i = (y * w + x) * 4;
      samples.push([d[i], d[i + 1], d[i + 2]]);
    });
    [
      [Math.floor(w / 2), 0],
      [w - 1, Math.floor(h / 2)],
      [Math.floor(w / 2), h - 1],
      [0, Math.floor(h / 2)],
    ].forEach(([x, y]) => {
      const i = (y * w + x) * 4;
      samples.push([d[i], d[i + 1], d[i + 2]]);
    });
    const bgR = Math.round(samples.reduce((s, v) => s + v[0], 0) / samples.length);
    const bgG = Math.round(samples.reduce((s, v) => s + v[1], 0) / samples.length);
    const bgB = Math.round(samples.reduce((s, v) => s + v[2], 0) / samples.length);
    const tol = stamp.tolerance ?? 40;

    for (let i = 0; i < d.length; i += 4) {
      const dr = d[i] - bgR;
      const dg = d[i + 1] - bgG;
      const db = d[i + 2] - bgB;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist < tol) {
        d[i + 3] = 0;
      } else if (dist < tol * 1.4) {
        d[i + 3] = Math.round(((dist - tol) / (tol * 0.4)) * 255);
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const processed = new Image();
    processed.src = c.toDataURL();
    return processed;
  }

  // ---------- LOAD FILE ----------
  function loadStampFile(file: File) {
    if (!file.type.startsWith('image/')) {
      showToast('Arquivo não é imagem');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        stampIdCounter.current++;
        const isFirst =
          stampsRef.current.filter((s) => s.type === 'image').length === 0;
        const newStamp: Stamp = {
          id: stampIdCounter.current,
          type: 'image',
          name: file.name.replace(/\.[^.]+$/, '').slice(0, 30),
          image: img,
          processed: img,
          x: isFirst ? 0.27 : 0.73,
          y: 0.42,
          scale: 0.6,
          removeBg: false,
          tolerance: 40,
          fileSize: file.size,
        };
        setStamps((prev) => [...prev, newStamp]);
        setSelectedId(newStamp.id);
        showToast(`"${newStamp.name}" adicionada`);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ---------- TEXT STAMP SYNC ----------
  useEffect(() => {
    // limpa stamp de texto se input vazio
    if (!text.trim()) {
      if (textStampId !== null) {
        setStamps((prev) => prev.filter((s) => s.id !== textStampId));
        if (selectedId === textStampId) setSelectedId(null);
        setTextStampId(null);
      }
      return;
    }
    if (textStampId === null) {
      stampIdCounter.current++;
      const newId = stampIdCounter.current;
      const ts: Stamp = {
        id: newId,
        type: 'text',
        name: 'Texto: ' + text.slice(0, 22),
        text,
        textColor,
        fontSize: textFontSize,
        x: 0.5,
        y: 0.85,
        scale: 1,
      };
      setTextStampId(newId);
      setStamps((prev) => [...prev, ts]);
    } else {
      setStamps((prev) =>
        prev.map((s) =>
          s.id === textStampId
            ? {
                ...s,
                text,
                textColor,
                fontSize: textFontSize,
                name: 'Texto: ' + text.slice(0, 22),
              }
            : s
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, textColor, textFontSize]);

  // ---------- SELECT / DELETE ----------
  function selectStamp(id: number) {
    setSelectedId(id);
  }

  function deleteStamp(id: number) {
    const wasText = stampsRef.current.find((s) => s.id === id)?.type === 'text';
    setStamps((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (wasText) {
      setTextStampId(null);
      setText('');
    }
  }

  // ---------- TOGGLE REMOVE BG ----------
  function toggleRemoveBg() {
    const stamp = stampsRef.current.find((s) => s.id === selectedId);
    if (!stamp || stamp.type !== 'image') return;
    const newVal = !stamp.removeBg;
    setStamps((prev) =>
      prev.map((s) => {
        if (s.id !== stamp.id) return s;
        const next = { ...s, removeBg: newVal };
        next.processed = processStamp(next) ?? s.image;
        return next;
      })
    );
  }

  function changeTolerance(value: number) {
    const stamp = stampsRef.current.find((s) => s.id === selectedId);
    if (!stamp || stamp.type !== 'image') return;
    setStamps((prev) =>
      prev.map((s) => {
        if (s.id !== stamp.id) return s;
        const next = { ...s, tolerance: value };
        if (next.removeBg) next.processed = processStamp(next) ?? s.image;
        return next;
      })
    );
  }

  function changeScale(value: number) {
    const stamp = stampsRef.current.find((s) => s.id === selectedId);
    if (!stamp) return;
    setStamps((prev) =>
      prev.map((s) => (s.id === stamp.id ? { ...s, scale: value / 100 } : s))
    );
  }

  // ---------- DRAG NO STAGE ----------
  function getStageCoords(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * sx,
      y: (clientY - rect.top) * sy,
    };
  }

  function findStampAt(x: number, y: number): Stamp | null {
    const list = stampsRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const s = list[i];
      if (!s._bbox) continue;
      const b = s._bbox;
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return s;
    }
    return null;
  }

  function onStageDown(e: React.MouseEvent | React.TouchEvent) {
    const point =
      'touches' in e
        ? { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }
        : { clientX: e.clientX, clientY: e.clientY };
    const p = getStageCoords(point.clientX, point.clientY);
    const stamp = findStampAt(p.x, p.y);
    if (stamp) {
      if (selectedId !== stamp.id) selectStamp(stamp.id);
      dragging.current = true;
      draggedStampId.current = stamp.id;
      const canvas = canvasRef.current!;
      dragOffset.current = {
        x: p.x - canvas.width * stamp.x,
        y: p.y - canvas.height * stamp.y,
      };
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }

  // mousemove/mouseup vinculados a window pra não perder durante drag
  useEffect(() => {
    function onWinMove(e: MouseEvent | TouchEvent) {
      if (!dragging.current || draggedStampId.current === null) return;
      const isTouch = 'touches' in e;
      if (isTouch) {
        const t = (e as TouchEvent).touches[0];
        if (!t) return;
        e.preventDefault();
        applyDrag(t.clientX, t.clientY);
      } else {
        const m = e as MouseEvent;
        applyDrag(m.clientX, m.clientY);
      }
    }
    function onWinUp() {
      if (dragging.current) {
        dragging.current = false;
        draggedStampId.current = null;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
      }
    }
    function applyDrag(clientX: number, clientY: number) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const p = getStageCoords(clientX, clientY);
      const id = draggedStampId.current;
      if (id === null) return;
      setStamps((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          let nx = (p.x - dragOffset.current.x) / canvas.width;
          let ny = (p.y - dragOffset.current.y) / canvas.height;
          nx = Math.max(0.04, Math.min(0.96, nx));
          ny = Math.max(0.04, Math.min(0.96, ny));
          return { ...s, x: nx, y: ny };
        })
      );
    }

    window.addEventListener('mousemove', onWinMove);
    window.addEventListener('mouseup', onWinUp);
    window.addEventListener('touchmove', onWinMove, { passive: false });
    window.addEventListener('touchend', onWinUp);
    return () => {
      window.removeEventListener('mousemove', onWinMove);
      window.removeEventListener('mouseup', onWinUp);
      window.removeEventListener('touchmove', onWinMove);
      window.removeEventListener('touchend', onWinUp);
    };
  }, []);

  function onStageHover(e: React.MouseEvent) {
    if (dragging.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const p = getStageCoords(e.clientX, e.clientY);
    const stamp = findStampAt(p.x, p.y);
    canvas.style.cursor = stamp ? 'grab' : 'default';
  }

  // ---------- DOWNLOAD ----------
  function downloadMockup() {
    const prevSelected = selectedId;
    setSelectedId(null);
    // o render automático vai limpar a seleção; dá 1 frame e baixa
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      link.download = `mockup-${peca}-${color}-${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setSelectedId(prevSelected);
      showToast('Mockup baixado');
    }, 50);
  }

  // ---------- RESET ----------
  function resetAll() {
    if (
      stampsRef.current.length > 0 &&
      !confirm('Limpar todas as estampas e texto?')
    ) {
      return;
    }
    setStamps([]);
    setSelectedId(null);
    setTextStampId(null);
    setText('');
    showToast('Mockup limpo');
  }

  // ---------- KEYBOARD SHORTCUTS ----------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomBy(1.25);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomBy(0.8);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        fitToScreen();
      } else if (e.key === 'Delete' && selectedId !== null) {
        const tag = (document.activeElement?.tagName ?? '').toUpperCase();
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          deleteStamp(selectedId);
          showToast('Removido');
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, zoomBy, fitToScreen]);

  // ---------- CTRL+WHEEL ZOOM ----------
  useEffect(() => {
    const el = canvasScrollRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoomBy(e.deltaY < 0 ? 1.1 : 0.9);
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomBy]);

  // ---------- DERIVADOS ----------
  const selectedStamp = stamps.find((s) => s.id === selectedId);
  const imageStamps = stamps.filter((s) => s.type === 'image');
  const pecaInfo = PECAS.find((p) => p.key === peca)!;

  // ---------- UI ----------
  return (
    <div className="mockup-studio">
      <style jsx global>{`
        .mockup-studio,
        .mockup-studio * {
          box-sizing: border-box;
        }
        .mockup-studio {
          --oxford: #0c2342;
          --steel: #3d6799;
          --ice: #f1f6fe;
          --azure: #3b82f6;
          --slate: #3e5066;
          --orange: #ee6500;
          --bg: var(--ice);
          --panel: #ffffff;
          --canvas-bg: #e6edf7;
          --line: #dde6f1;
          --line-2: #c5d3e3;
          --ink: var(--oxford);
          --ink-2: var(--slate);
          --ink-3: #7a8aa0;
          --hover: #f7faff;
          --shadow: 0 1px 3px rgba(12, 35, 66, 0.06),
            0 1px 2px rgba(12, 35, 66, 0.04);
          --shadow-md: 0 4px 16px rgba(12, 35, 66, 0.08);
          --shadow-lg: 0 8px 32px rgba(12, 35, 66, 0.1);
          position: fixed;
          inset: 0;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          display: grid;
          grid-template-rows: 60px 1fr;
          z-index: 50;
        }
        .ms-header {
          background: var(--oxford);
          color: var(--ice);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .ms-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .ms-back {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .ms-back:hover {
          background: rgba(255, 255, 255, 0.06);
          color: white;
        }
        .ms-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .ms-brand-name {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .ms-brand-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.55);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
        }
        .ms-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .ms-btn {
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          border: none;
          border-radius: 6px;
          padding: 9px 14px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
        }
        .ms-btn-primary {
          background: var(--orange);
          color: white;
          box-shadow: 0 1px 2px rgba(238, 101, 0, 0.3);
        }
        .ms-btn-primary:hover {
          background: #d65900;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(238, 101, 0, 0.35);
        }
        .ms-btn-ghost {
          background: transparent;
          color: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .ms-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.06);
          color: white;
          border-color: rgba(255, 255, 255, 0.25);
        }
        .ms-main {
          display: grid;
          grid-template-columns: 340px 1fr;
          background: var(--bg);
          overflow: hidden;
          min-height: 0;
        }
        .ms-sidebar {
          background: var(--panel);
          border-right: 1px solid var(--line);
          overflow-y: auto;
          overflow-x: hidden;
        }
        .ms-section {
          padding: 18px 22px;
          border-bottom: 1px solid var(--line);
        }
        .ms-section-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--steel);
          font-weight: 600;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ms-section-title::before {
          content: '';
          width: 4px;
          height: 4px;
          background: var(--orange);
          border-radius: 50%;
        }
        .ms-peca-group {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
        }
        .ms-peca-btn {
          background: var(--panel);
          border: 1.5px solid var(--line);
          border-radius: 6px;
          padding: 9px 6px;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          color: var(--ink-2);
          transition: all 0.15s ease;
          position: relative;
        }
        .ms-peca-btn:hover {
          border-color: var(--line-2);
        }
        .ms-peca-btn.active {
          border-color: var(--oxford);
          background: var(--oxford);
          color: white;
        }
        .ms-peca-btn .dot {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--orange);
        }
        .ms-warn-prov {
          margin-top: 10px;
          padding: 8px 10px;
          background: #fff7e6;
          border: 1px solid #ffd591;
          border-radius: 6px;
          font-size: 10.5px;
          line-height: 1.4;
          color: #8a5400;
        }
        .ms-colors {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }
        .ms-color-swatch {
          aspect-ratio: 1;
          border-radius: 7px;
          cursor: pointer;
          border: 2px solid var(--line);
          position: relative;
          transition: all 0.15s ease;
        }
        .ms-color-swatch:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow);
        }
        .ms-color-swatch.active {
          border-color: var(--oxford);
          box-shadow: 0 0 0 2px rgba(12, 35, 66, 0.1);
        }
        .ms-color-swatch.active::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 14px;
          height: 2px;
          background: var(--oxford);
          border-radius: 2px;
        }
        .ms-color-swatch-label {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
          font-size: 9.5px;
          color: var(--ink-3);
          white-space: nowrap;
          font-weight: 500;
        }
        .ms-color-swatch.active .ms-color-swatch-label {
          color: var(--ink);
          font-weight: 600;
        }
        .ms-colors-wrap {
          padding-bottom: 24px;
        }
        .ms-add-stamp-btn {
          width: 100%;
          background: var(--hover);
          border: 1.5px dashed var(--line-2);
          border-radius: 7px;
          padding: 11px;
          cursor: pointer;
          color: var(--steel);
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 500;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }
        .ms-add-stamp-btn:hover {
          background: #e8f1ff;
          border-color: var(--azure);
          color: var(--azure);
        }
        .ms-add-stamp-btn.dragover {
          background: #dbeafe;
          border-color: var(--orange);
          color: var(--orange);
        }
        .ms-stamp-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 10px;
        }
        .ms-stamp-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--hover);
          border: 1.5px solid var(--line);
          border-radius: 6px;
          padding: 8px 10px;
          cursor: pointer;
          transition: all 0.12s ease;
        }
        .ms-stamp-item:hover {
          border-color: var(--line-2);
        }
        .ms-stamp-item.selected {
          border-color: var(--azure);
          background: #eff6ff;
        }
        .ms-stamp-thumb {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          background: white;
          border: 1px solid var(--line);
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          flex-shrink: 0;
        }
        .ms-stamp-meta {
          flex: 1;
          min-width: 0;
        }
        .ms-stamp-name {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ms-stamp-info {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9.5px;
          color: var(--ink-3);
          margin-top: 2px;
        }
        .ms-stamp-actions {
          display: flex;
          gap: 2px;
        }
        .ms-icon-btn {
          background: transparent;
          border: none;
          color: var(--ink-3);
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          display: flex;
          transition: all 0.12s ease;
        }
        .ms-icon-btn:hover {
          color: var(--ink);
          background: rgba(12, 35, 66, 0.06);
        }
        .ms-icon-btn.danger:hover {
          color: #dc2626;
          background: #fee2e2;
        }
        .ms-stamp-controls {
          background: #eff6ff;
          border: 1.5px solid #bfdbfe;
          border-radius: 7px;
          padding: 12px;
          margin-top: 10px;
        }
        .ms-stamp-controls-header {
          font-size: 11px;
          font-weight: 600;
          color: var(--azure);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ms-stamp-controls-header::before {
          content: '';
          width: 8px;
          height: 8px;
          background: var(--azure);
          border-radius: 50%;
          animation: ms-pulse 1.6s ease-in-out infinite;
        }
        @keyframes ms-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .ms-toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }
        .ms-toggle-row + .ms-toggle-row,
        .ms-slider-row + .ms-slider-row,
        .ms-toggle-row + .ms-slider-row,
        .ms-slider-row + .ms-toggle-row {
          border-top: 1px solid #dbeafe;
        }
        .ms-toggle-label {
          font-size: 12.5px;
          color: var(--ink);
          font-weight: 500;
        }
        .ms-toggle-hint {
          font-size: 10.5px;
          color: var(--ink-2);
          margin-top: 1px;
        }
        .ms-switch {
          width: 32px;
          height: 18px;
          background: var(--line-2);
          border-radius: 999px;
          position: relative;
          cursor: pointer;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .ms-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 14px;
          height: 14px;
          background: white;
          border-radius: 50%;
          transition: transform 0.15s;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        .ms-switch.on {
          background: var(--azure);
        }
        .ms-switch.on::after {
          transform: translateX(14px);
        }
        .ms-cota-warning {
          margin-top: 12px;
          padding: 10px 12px;
          background: #fff7e6;
          border: 1px solid #ffd591;
          border-radius: 6px;
          font-size: 10.5px;
          line-height: 1.4;
          color: #8a5400;
        }
        .ms-slider-row {
          padding: 8px 0;
        }
        .ms-slider-row label {
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
          color: var(--ink-2);
          margin-bottom: 6px;
          font-weight: 500;
        }
        .ms-slider-row label span:last-child {
          font-family: 'JetBrains Mono', monospace;
          color: var(--ink);
          font-weight: 600;
        }
        .mockup-studio input[type='range'] {
          width: 100%;
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: #cfdbeb;
          border-radius: 999px;
          outline: none;
        }
        .mockup-studio input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--azure);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .mockup-studio input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: var(--azure);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .ms-text-input {
          width: 100%;
          border: 1.5px solid var(--line);
          border-radius: 6px;
          padding: 9px 12px;
          font-family: inherit;
          font-size: 13px;
          color: var(--ink);
          transition: border-color 0.15s;
          background: var(--hover);
        }
        .ms-text-input:focus {
          outline: none;
          border-color: var(--azure);
          background: white;
        }
        .ms-text-input::placeholder {
          color: var(--ink-3);
        }
        .ms-color-toggle-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 6px;
        }
        .ms-color-toggle-btn {
          background: var(--panel);
          border: 1.5px solid var(--line);
          border-radius: 6px;
          padding: 8px 10px;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          color: var(--ink-2);
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .ms-color-toggle-btn:hover {
          border-color: var(--line-2);
        }
        .ms-color-toggle-btn.active {
          border-color: var(--oxford);
          background: var(--oxford);
          color: white;
        }
        .ms-color-toggle-btn .ms-cs-swatch {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid currentColor;
        }
        .ms-view {
          position: relative;
          background: var(--canvas-bg);
          background-image: radial-gradient(
              circle at 25% 25%,
              rgba(61, 103, 153, 0.04) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 75% 75%,
              rgba(238, 101, 0, 0.03) 0%,
              transparent 50%
            );
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .ms-view::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(
              to right,
              rgba(12, 35, 66, 0.04) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(12, 35, 66, 0.04) 1px,
              transparent 1px
            );
          background-size: 40px 40px;
          pointer-events: none;
        }
        .ms-canvas-scroll {
          flex: 1;
          overflow: auto;
          position: relative;
          z-index: 1;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ms-stage-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .ms-stage {
          display: block;
          width: 100%;
          height: 100%;
          background: var(--ice);
          box-shadow: var(--shadow-lg);
          border-radius: 4px;
          cursor: default;
        }
        .ms-zoom-bar {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--panel);
          border-radius: 8px;
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 4px;
          z-index: 10;
          border: 1px solid var(--line);
        }
        .ms-zoom-btn {
          background: transparent;
          border: none;
          width: 30px;
          height: 30px;
          cursor: pointer;
          color: var(--ink-2);
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.12s;
        }
        .ms-zoom-btn:hover {
          background: var(--hover);
          color: var(--ink);
        }
        .ms-zoom-level {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--ink);
          font-weight: 600;
          min-width: 48px;
          text-align: center;
          cursor: pointer;
          padding: 0 4px;
        }
        .ms-zoom-divider {
          width: 1px;
          height: 18px;
          background: var(--line);
          margin: 0 2px;
        }
        .ms-empty-hint {
          position: absolute;
          bottom: 70px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 12.5px;
          color: var(--ink-2);
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          gap: 8px;
          pointer-events: none;
          transition: opacity 0.2s;
          font-weight: 500;
          z-index: 10;
        }
        .ms-empty-hint.hidden {
          opacity: 0;
        }
        .ms-empty-hint svg {
          color: var(--orange);
        }
        .ms-toast {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(-80px);
          background: var(--oxford);
          color: white;
          padding: 10px 18px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: var(--shadow-lg);
          transition: transform 0.3s ease;
          z-index: 1000;
          pointer-events: none;
        }
        .ms-toast.show {
          transform: translateX(-50%) translateY(0);
        }
        @media (max-width: 800px) {
          .ms-main {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 50vh;
          }
          .ms-sidebar {
            border-right: none;
            border-top: 1px solid var(--line);
            order: 2;
          }
          .ms-view {
            order: 1;
          }
          .ms-section {
            padding: 14px 16px;
          }
          .ms-header {
            padding: 0 16px;
          }
          .ms-brand-tag {
            display: none;
          }
        }
      `}</style>

      <header className="ms-header">
        <div className="ms-brand">
          <Link href="/" className="ms-back" title="Voltar ao dashboard">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Dashboard
          </Link>
          <div className="ms-brand-text">
            <span className="ms-brand-name">Mockup Studio</span>
            <span className="ms-brand-tag">Nort Sports · v0.3</span>
          </div>
        </div>
        <div className="ms-actions">
          <button className="ms-btn ms-btn-ghost" onClick={resetAll}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Limpar tudo
          </button>
          <button className="ms-btn ms-btn-primary" onClick={downloadMockup}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Baixar mockup
          </button>
        </div>
      </header>

      <main className="ms-main">
        <aside className="ms-sidebar">
          <div className="ms-section">
            <div className="ms-section-title">Tipo de peça</div>
            <div className="ms-peca-group">
              {PECAS.map((p) => (
                <button
                  key={p.key}
                  className={'ms-peca-btn' + (peca === p.key ? ' active' : '')}
                  onClick={() => setPeca(p.key)}
                  title={p.provisorio ? 'Imagens provisórias (mesma camiseta)' : ''}
                >
                  {p.nome}
                  {p.provisorio && <span className="dot" />}
                </button>
              ))}
            </div>
            {pecaInfo.provisorio && (
              <div className="ms-warn-prov">
                ⚠ Imagens de {pecaInfo.nome.toLowerCase()} ainda são as mesmas da camiseta (provisórias).
              </div>
            )}
          </div>

          <div className="ms-section">
            <div className="ms-section-title">Cor da peça</div>
            <div className="ms-colors-wrap">
              <div className="ms-colors">
                {CORES.map((c) => (
                  <div
                    key={c.key}
                    className={
                      'ms-color-swatch' + (color === c.key ? ' active' : '')
                    }
                    style={{
                      background: c.hex,
                      boxShadow:
                        c.key === 'branco'
                          ? 'inset 0 0 0 1px rgba(0,0,0,0.06)'
                          : undefined,
                    }}
                    title={c.nome}
                    onClick={() => setColor(c.key)}
                  >
                    <span className="ms-color-swatch-label">{c.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ms-section">
            <div className="ms-section-title">
              Estampas
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9.5px',
                  color: 'var(--ink-3)',
                }}
              >
                {imageStamps.length}{' '}
                {imageStamps.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <div className="ms-stamp-list">
              {imageStamps.map((stamp) => (
                <div
                  key={stamp.id}
                  className={
                    'ms-stamp-item' +
                    (stamp.id === selectedId ? ' selected' : '')
                  }
                  onClick={() => selectStamp(stamp.id)}
                >
                  <div
                    className="ms-stamp-thumb"
                    style={{
                      backgroundImage: `url('${stamp.processed?.src ?? ''}')`,
                    }}
                  />
                  <div className="ms-stamp-meta">
                    <div className="ms-stamp-name">{stamp.name}</div>
                    <div className="ms-stamp-info">
                      {Math.round(stamp.scale * 100)}% ·{' '}
                      {((stamp.fileSize ?? 0) / 1024).toFixed(0)}kb
                      {stamp.removeBg ? ' · sem fundo' : ''}
                    </div>
                  </div>
                  <div className="ms-stamp-actions">
                    <button
                      className="ms-icon-btn danger"
                      title="Excluir"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStamp(stamp.id);
                        showToast(`"${stamp.name}" removida`);
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              className={'ms-add-stamp-btn' + (isDragOver ? ' dragover' : '')}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                Array.from(e.dataTransfer.files)
                  .filter((f) => f.type.startsWith('image/'))
                  .forEach((f) => loadStampFile(f));
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Adicionar estampa
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{
                position: 'absolute',
                width: 0,
                height: 0,
                opacity: 0,
                pointerEvents: 'none',
              }}
              onChange={(e) => {
                Array.from(e.target.files ?? []).forEach((f) =>
                  loadStampFile(f)
                );
                e.target.value = '';
              }}
            />

            {selectedStamp && selectedStamp.type === 'image' && (
              <div className="ms-stamp-controls">
                <div className="ms-stamp-controls-header">
                  Editando: {selectedStamp.name}
                </div>
                <div className="ms-slider-row">
                  <label>
                    <span>Tamanho</span>
                    <span>{Math.round(selectedStamp.scale * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={250}
                    value={Math.round(selectedStamp.scale * 100)}
                    onChange={(e) => changeScale(Number(e.target.value))}
                  />
                </div>
                <div className="ms-toggle-row">
                  <div>
                    <div className="ms-toggle-label">Remover fundo</div>
                    <div className="ms-toggle-hint">Detecta cor do fundo</div>
                  </div>
                  <div
                    className={
                      'ms-switch' + (selectedStamp.removeBg ? ' on' : '')
                    }
                    onClick={toggleRemoveBg}
                  />
                </div>
                {selectedStamp.removeBg && (
                  <div className="ms-slider-row">
                    <label>
                      <span>Sensibilidade</span>
                      <span>{selectedStamp.tolerance}</span>
                    </label>
                    <input
                      type="range"
                      min={5}
                      max={120}
                      value={selectedStamp.tolerance}
                      onChange={(e) =>
                        changeTolerance(Number(e.target.value))
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="ms-section">
            <div className="ms-section-title">Texto na peça</div>
            <input
              className="ms-text-input"
              type="text"
              placeholder='Ex: "Estampa frente 8cm × 8cm"'
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="ms-color-toggle-group">
              {[
                { val: '#000000', label: 'Preto', bg: '#000' },
                { val: '#ffffff', label: 'Branco', bg: '#fff' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  className={
                    'ms-color-toggle-btn' +
                    (textColor === opt.val ? ' active' : '')
                  }
                  onClick={() => setTextColor(opt.val)}
                >
                  <span
                    className="ms-cs-swatch"
                    style={{ background: opt.bg }}
                  />{' '}
                  {opt.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <div className="ms-slider-row" style={{ padding: '6px 0 0' }}>
                <label>
                  <span>Tamanho do texto</span>
                  <span>{textFontSize}</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={textFontSize}
                  onChange={(e) => setTextFontSize(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="ms-section">
            <div className="ms-section-title">Cotas de posição</div>
            {(
              [
                { key: 'cota-peito', label: 'cota-peito', hint: 'Sobreposição na frente' },
                { key: 'cota-costas', label: 'cota-costas', hint: 'Sobreposição nas costas' },
                { key: 'cota-manga', label: 'cota-manga', hint: 'Sobreposição na manga' },
              ] as { key: CotaKey; label: string; hint: string }[]
            ).map((row) => (
              <div key={row.key} className="ms-toggle-row">
                <div>
                  <div className="ms-toggle-label">{row.label}</div>
                  <div className="ms-toggle-hint">{row.hint}</div>
                </div>
                <div
                  className={'ms-switch' + (cotasAtivas[row.key] ? ' on' : '')}
                  onClick={() =>
                    setCotasAtivas((prev) => ({
                      ...prev,
                      [row.key]: !prev[row.key],
                    }))
                  }
                />
              </div>
            ))}
            <div className="ms-cota-warning">
              ⚠ Posicionamento aproximado. Pode haver variação de ~1 cm conforme malha e estampa.
            </div>
          </div>
        </aside>

        <div className="ms-view">
          <div className="ms-canvas-scroll" ref={canvasScrollRef}>
            <div className="ms-stage-wrap" ref={stageWrapRef}>
              <canvas
                ref={canvasRef}
                className="ms-stage"
                onMouseDown={onStageDown}
                onMouseMove={onStageHover}
                onTouchStart={onStageDown}
              />
            </div>
          </div>
          {stamps.length === 0 && (
            <div className="ms-empty-hint">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Adicione uma estampa ou texto para começar
            </div>
          )}
          <div className="ms-zoom-bar">
            <button
              className="ms-zoom-btn"
              onClick={() => zoomBy(0.8)}
              title="Diminuir zoom (Ctrl + -)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span
              className="ms-zoom-level"
              onClick={() => setZoomClamped(fitZoom)}
              title="Clique para reset"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="ms-zoom-btn"
              onClick={() => zoomBy(1.25)}
              title="Aumentar zoom (Ctrl + +)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div className="ms-zoom-divider" />
            <button
              className="ms-zoom-btn"
              onClick={fitToScreen}
              title="Ajustar à tela"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7V3h4M21 7V3h-4M3 17v4h4M21 17v4h-4" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      <div className={'ms-toast' + (toast ? ' show' : '')}>{toast}</div>
    </div>
  );
}
