'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  PECAS,
  CORES,
  COTAS,
  COR_PADRAO,
  BACKGROUND_SRC,
  MARCA_SRC,
  MARCA_OPACIDADE,
  getPeca,
  type PecaKey,
  type CotaKey,
} from '@/lib/mockup/constants';

// ---------- TIPOS ----------
type StampType = 'image' | 'text';

interface Stamp {
  id: number;
  type: StampType;
  name: string;
  image?: HTMLImageElement;
  processed?: HTMLImageElement;
  removeBg?: boolean;
  tolerance?: number;
  fileSize?: number;
  text?: string;
  textColor?: string;
  fontSize?: number;
  x: number;
  y: number;
  scale: number;
  _bbox?: { x: number; y: number; w: number; h: number };
}

interface CotasState {
  'cota-peito': boolean;
  'cota-costas': boolean;
  'cota-manga': boolean;
}

// dimensão base dos assets (todos exportados nessa resolução)
const BASE_W = 2005;
const BASE_H = 1294;

export default function MockupClient() {
  const [peca, setPeca] = useState<PecaKey>('camiseta');
  const [cor, setCor] = useState<string>(COR_PADRAO);
  const [hexInput, setHexInput] = useState<string>(COR_PADRAO);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textFontSize, setTextFontSize] = useState(40);
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
  const [assetsReady, setAssetsReady] = useState(false);

  // refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stampIdCounter = useRef(0);
  const stampsRef = useRef<Stamp[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // caches de imagem
  const sombraCache = useRef<Map<PecaKey, HTMLImageElement>>(new Map());
  const mascaraCache = useRef<Map<PecaKey, HTMLImageElement>>(new Map());
  const corCanvasCache = useRef<HTMLCanvasElement | null>(null); // peça colorida pronta
  const cotaCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const bgImg = useRef<HTMLImageElement | null>(null);
  const marcaImg = useRef<HTMLImageElement | null>(null);

  // drag
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const draggedStampId = useRef<number | null>(null);

  useEffect(() => {
    stampsRef.current = stamps;
  }, [stamps]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // ---------- PRELOAD GERAL (overlays + cotas) ----------
  useEffect(() => {
    const bg = new Image();
    bg.onload = () => {
      bgImg.current = bg;
      render();
    };
    bg.src = BACKGROUND_SRC;

    const marca = new Image();
    marca.onload = () => {
      marcaImg.current = marca;
      render();
    };
    marca.src = MARCA_SRC;

    (Object.keys(COTAS) as CotaKey[]).forEach((key) => {
      const img = new Image();
      img.onload = () => {
        cotaCache.current.set(key, img);
        render();
      };
      img.src = COTAS[key];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- PRELOAD DA PEÇA (sombra + máscara) ----------
  useEffect(() => {
    const info = getPeca(peca);
    let loadedS = sombraCache.current.has(peca);
    let loadedM = mascaraCache.current.has(peca);

    const tryReady = () => {
      if (loadedS && loadedM) {
        rebuildCorCanvas();
        setAssetsReady(true);
        fitToScreen();
        render();
      }
    };

    if (!loadedS) {
      const s = new Image();
      s.onload = () => {
        sombraCache.current.set(peca, s);
        loadedS = true;
        tryReady();
      };
      s.src = info.sombra;
    }
    if (!loadedM) {
      const m = new Image();
      m.onload = () => {
        mascaraCache.current.set(peca, m);
        loadedM = true;
        tryReady();
      };
      m.src = info.mascara;
    }
    tryReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peca]);

  // ---------- MONTA A PEÇA COLORIDA (cor + máscara + sombra hard-light) ----------
  // Resultado fica num canvas offscreen 2005x1294 reusado em tela e download.
  const rebuildCorCanvas = useCallback(() => {
    const sombra = sombraCache.current.get(peca);
    const mascara = mascaraCache.current.get(peca);
    if (!sombra || !mascara) return;

    const c = corCanvasCache.current ?? document.createElement('canvas');
    c.width = BASE_W;
    c.height = BASE_H;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, BASE_W, BASE_H);

    // 1) preenche a cor sólida recortada pela máscara
    const tmp = document.createElement('canvas');
    tmp.width = BASE_W;
    tmp.height = BASE_H;
    const tctx = tmp.getContext('2d')!;
    tctx.drawImage(mascara, 0, 0, BASE_W, BASE_H);
    tctx.globalCompositeOperation = 'source-in';
    tctx.fillStyle = cor;
    tctx.fillRect(0, 0, BASE_W, BASE_H);
    ctx.drawImage(tmp, 0, 0);

    // 2) aplica a sombra em hard-light, recortada pela mesma máscara
    const sh = document.createElement('canvas');
    sh.width = BASE_W;
    sh.height = BASE_H;
    const shctx = sh.getContext('2d')!;
    shctx.drawImage(sombra, 0, 0, BASE_W, BASE_H); // sombra já tem alfa da máscara
    ctx.globalCompositeOperation = 'hard-light';
    ctx.drawImage(sh, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    corCanvasCache.current = c;
  }, [peca, cor]);

  // rebuild quando cor muda
  useEffect(() => {
    if (assetsReady) {
      rebuildCorCanvas();
      render();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cor]);

  // re-render em mudanças
  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamps, selectedId, cotasAtivas, zoom, peca, assetsReady]);

  useEffect(() => {
    const onResize = () => fitToScreen();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peca]);

  // ---------- ZOOM ----------
  const applyZoom = useCallback((z: number) => {
    const wrap = stageWrapRef.current;
    if (!wrap) return;
    wrap.style.width = BASE_W * z + 'px';
    wrap.style.height = BASE_H * z + 'px';
  }, []);

  const setZoomClamped = useCallback(
    (z: number) => {
      const next = Math.max(0.1, Math.min(5, z));
      setZoom(next);
      applyZoom(next);
    },
    [applyZoom]
  );

  const zoomBy = useCallback(
    (factor: number) => setZoomClamped(zoom * factor),
    [zoom, setZoomClamped]
  );

  const fitToScreen = useCallback(() => {
    const scrollEl = canvasScrollRef.current;
    if (!scrollEl) return;
    const padding = 48;
    const availW = scrollEl.clientWidth - padding;
    const availH = scrollEl.clientHeight - padding;
    const fit = Math.min(availW / BASE_W, availH / BASE_H, 1.2);
    setFitZoom(fit);
    setZoomClamped(fit);
  }, [setZoomClamped]);

  // ---------- RENDER ----------
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = BASE_W;
    canvas.height = BASE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, BASE_W, BASE_H);

    // 1) background Meridian
    if (bgImg.current) {
      ctx.drawImage(bgImg.current, 0, 0, BASE_W, BASE_H);
    } else {
      ctx.fillStyle = '#46566e';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
    }

    // 2) peça colorida
    if (corCanvasCache.current) {
      ctx.drawImage(corCanvasCache.current, 0, 0);
    }

    applyZoom(zoom);

    // 3) estampas e texto
    const list = stampsRef.current;
    list.forEach((stamp) => {
      if (stamp.type === 'image') {
        drawImageStamp(ctx, stamp);
      } else {
        drawTextStamp(ctx, stamp);
      }
      if (stamp.id === selectedId && stamp._bbox) {
        ctx.save();
        ctx.strokeStyle = '#ee6500';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 8]);
        ctx.strokeRect(
          stamp._bbox.x - 5,
          stamp._bbox.y - 5,
          stamp._bbox.w + 10,
          stamp._bbox.h + 10
        );
        ctx.restore();
      }
    });

    // 4) cotas
    (Object.keys(cotasAtivas) as CotaKey[]).forEach((key) => {
      if (cotasAtivas[key]) {
        const cotaImg = cotaCache.current.get(key);
        if (cotaImg) ctx.drawImage(cotaImg, 0, 0, BASE_W, BASE_H);
      }
    });

    // 5) marca d'água por cima de tudo
    if (marcaImg.current) {
      ctx.save();
      ctx.globalAlpha = MARCA_OPACIDADE;
      ctx.drawImage(marcaImg.current, 0, 0, BASE_W, BASE_H);
      ctx.restore();
    }
  }, [selectedId, cotasAtivas, zoom, applyZoom]);

  function drawImageStamp(ctx: CanvasRenderingContext2D, stamp: Stamp) {
    if (!stamp.processed) return;
    const baseW = BASE_W * 0.18 * stamp.scale;
    const ratio = stamp.processed.height / stamp.processed.width;
    const w = baseW;
    const h = baseW * ratio;
    const x = BASE_W * stamp.x - w / 2;
    const y = BASE_H * stamp.y - h / 2;
    ctx.drawImage(stamp.processed, x, y, w, h);
    stamp._bbox = { x, y, w, h };
  }

  function drawTextStamp(ctx: CanvasRenderingContext2D, stamp: Stamp) {
    if (!stamp.text || !stamp.text.trim()) {
      stamp._bbox = undefined;
      return;
    }
    const fontPx = (stamp.fontSize ?? 40) * (BASE_W / 1400);
    ctx.save();
    ctx.font = `600 ${fontPx}px Inter, -apple-system, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const metrics = ctx.measureText(stamp.text);
    const textW = metrics.width;
    const textH = fontPx * 1.2;
    const x = BASE_W * stamp.x - textW / 2;
    const y = BASE_H * stamp.y;
    if (stamp.textColor === '#ffffff') {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 5;
    } else {
      ctx.shadowColor = 'rgba(255,255,255,0.4)';
      ctx.shadowBlur = 5;
    }
    ctx.fillStyle = stamp.textColor ?? '#000000';
    ctx.fillText(stamp.text, x, y);
    ctx.restore();
    stamp._bbox = { x: x - 5, y: y - textH / 2, w: textW + 10, h: textH };
  }

  // ---------- BG REMOVAL (estampa) ----------
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
      if (dist < tol) d[i + 3] = 0;
      else if (dist < tol * 1.4)
        d[i + 3] = Math.round(((dist - tol) / (tol * 0.4)) * 255);
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

  // ---------- TEXTO ----------
  useEffect(() => {
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
      setTextStampId(newId);
      setStamps((prev) => [
        ...prev,
        {
          id: newId,
          type: 'text',
          name: 'Texto: ' + text.slice(0, 22),
          text,
          textColor,
          fontSize: textFontSize,
          x: 0.5,
          y: 0.85,
          scale: 1,
        },
      ]);
    } else {
      setStamps((prev) =>
        prev.map((s) =>
          s.id === textStampId
            ? { ...s, text, textColor, fontSize: textFontSize, name: 'Texto: ' + text.slice(0, 22) }
            : s
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, textColor, textFontSize]);

  // ---------- AÇÕES DE ESTAMPA ----------
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

  // ---------- DRAG ----------
  function getStageCoords(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * BASE_W,
      y: ((clientY - rect.top) / rect.height) * BASE_H,
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
      dragOffset.current = {
        x: p.x - BASE_W * stamp.x,
        y: p.y - BASE_H * stamp.y,
      };
      if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
      e.preventDefault();
    }
  }
  useEffect(() => {
    function onWinMove(e: MouseEvent | TouchEvent) {
      if (!dragging.current || draggedStampId.current === null) return;
      if ('touches' in e) {
        const t = (e as TouchEvent).touches[0];
        if (!t) return;
        e.preventDefault();
        applyDrag(t.clientX, t.clientY);
      } else {
        applyDrag((e as MouseEvent).clientX, (e as MouseEvent).clientY);
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
      const p = getStageCoords(clientX, clientY);
      const id = draggedStampId.current;
      if (id === null) return;
      setStamps((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          let nx = (p.x - dragOffset.current.x) / BASE_W;
          let ny = (p.y - dragOffset.current.y) / BASE_H;
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
    canvas.style.cursor = findStampAt(p.x, p.y) ? 'grab' : 'default';
  }

  // ---------- DOWNLOAD ----------
  function downloadMockup() {
    const prev = selectedId;
    setSelectedId(null);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      link.download = `mockup-${peca}-${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setSelectedId(prev);
      showToast('Mockup baixado');
    }, 60);
  }

  // ---------- RESET ----------
  function resetAll() {
    if (stampsRef.current.length > 0 && !confirm('Limpar todas as estampas e texto?'))
      return;
    setStamps([]);
    setSelectedId(null);
    setTextStampId(null);
    setText('');
    showToast('Mockup limpo');
  }

  // ---------- COR ----------
  function aplicarCor(c: string) {
    setCor(c);
    setHexInput(c.toUpperCase());
  }

  // ---------- KEYBOARD ----------
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
          --shadow: 0 1px 3px rgba(12, 35, 66, 0.06), 0 1px 2px rgba(12, 35, 66, 0.04);
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
        .ms-brand { display: flex; align-items: center; gap: 14px; }
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
        .ms-back:hover { background: rgba(255, 255, 255, 0.06); color: white; }
        .ms-brand-text { display: flex; flex-direction: column; line-height: 1.2; }
        .ms-brand-name { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; }
        .ms-brand-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.55);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 500;
        }
        .ms-actions { display: flex; gap: 8px; align-items: center; }
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
        .ms-section { padding: 18px 22px; border-bottom: 1px solid var(--line); }
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
        .ms-peca-group { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
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
        }
        .ms-peca-btn:hover { border-color: var(--line-2); }
        .ms-peca-btn.active { border-color: var(--oxford); background: var(--oxford); color: white; }

        .ms-cor-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .ms-cor-picker {
          width: 48px;
          height: 48px;
          border: 2px solid var(--line);
          border-radius: 10px;
          cursor: pointer;
          background: none;
          padding: 0;
          flex-shrink: 0;
        }
        .ms-cor-picker::-webkit-color-swatch { border: none; border-radius: 8px; }
        .ms-cor-picker::-moz-color-swatch { border: none; border-radius: 8px; }
        .ms-hex {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          background: var(--hover);
          padding: 10px 12px;
          border-radius: 8px;
          border: 1.5px solid var(--line);
          width: 100%;
          color: var(--ink);
          text-transform: uppercase;
        }
        .ms-hex:focus { outline: none; border-color: var(--azure); background: white; }
        .ms-swatches { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .ms-swatch {
          aspect-ratio: 1;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid var(--line);
          position: relative;
          transition: all 0.15s ease;
        }
        .ms-swatch:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
        .ms-swatch.active { border-color: var(--oxford); box-shadow: 0 0 0 2px rgba(12, 35, 66, 0.12); }
        .ms-swatch-label {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 7px;
          font-size: 9px;
          color: var(--ink-3);
          white-space: nowrap;
          font-weight: 500;
        }
        .ms-swatch.active .ms-swatch-label { color: var(--ink); font-weight: 600; }
        .ms-swatches-wrap { padding-bottom: 22px; }

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
        .ms-add-stamp-btn:hover { background: #e8f1ff; border-color: var(--azure); color: var(--azure); }
        .ms-add-stamp-btn.dragover { background: #dbeafe; border-color: var(--orange); color: var(--orange); }
        .ms-stamp-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
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
        .ms-stamp-item:hover { border-color: var(--line-2); }
        .ms-stamp-item.selected { border-color: var(--azure); background: #eff6ff; }
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
        .ms-stamp-meta { flex: 1; min-width: 0; }
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
        .ms-icon-btn.danger:hover { color: #dc2626; background: #fee2e2; }
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
        }
        .ms-toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
        .ms-toggle-label { font-size: 12.5px; color: var(--ink); font-weight: 500; }
        .ms-toggle-hint { font-size: 10.5px; color: var(--ink-2); margin-top: 1px; }
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
        .ms-switch.on { background: var(--azure); }
        .ms-switch.on::after { transform: translateX(14px); }
        .ms-slider-row { padding: 8px 0; }
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
        .ms-text-input:focus { outline: none; border-color: var(--azure); background: white; }
        .ms-color-toggle-group { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 6px; }
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
        .ms-color-toggle-btn.active { border-color: var(--oxford); background: var(--oxford); color: white; }
        .ms-cs-swatch { width: 12px; height: 12px; border-radius: 50%; border: 1px solid currentColor; }
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
        .ms-view {
          position: relative;
          background: var(--canvas-bg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
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
        .ms-stage-wrap { position: relative; flex-shrink: 0; }
        .ms-stage {
          display: block;
          width: 100%;
          height: 100%;
          box-shadow: var(--shadow-lg);
          border-radius: 8px;
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
        .ms-zoom-btn:hover { background: var(--hover); color: var(--ink); }
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
        .ms-zoom-divider { width: 1px; height: 18px; background: var(--line); margin: 0 2px; }
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
          font-weight: 500;
          z-index: 10;
        }
        .ms-empty-hint svg { color: var(--orange); }
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
        .ms-toast.show { transform: translateX(-50%) translateY(0); }
        @media (max-width: 800px) {
          .ms-main { grid-template-columns: 1fr; grid-template-rows: 1fr 50vh; }
          .ms-sidebar { border-right: none; border-top: 1px solid var(--line); order: 2; }
          .ms-view { order: 1; }
          .ms-section { padding: 14px 16px; }
          .ms-header { padding: 0 16px; }
          .ms-brand-tag { display: none; }
        }
      `}</style>

      <header className="ms-header">
        <div className="ms-brand">
          <Link href="/" className="ms-back" title="Voltar ao dashboard">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Dashboard
          </Link>
          <div className="ms-brand-text">
            <span className="ms-brand-name">Mockup Studio</span>
            <span className="ms-brand-tag">Nort Sports · v0.4</span>
          </div>
        </div>
        <div className="ms-actions">
          <button className="ms-btn ms-btn-ghost" onClick={resetAll}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Limpar tudo
          </button>
          <button className="ms-btn ms-btn-primary" onClick={downloadMockup}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
                >
                  {p.nome}
                </button>
              ))}
            </div>
          </div>

          <div className="ms-section">
            <div className="ms-section-title">Cor da peça</div>
            <div className="ms-cor-row">
              <input
                type="color"
                className="ms-cor-picker"
                value={cor}
                onChange={(e) => aplicarCor(e.target.value)}
                title="Escolher cor livre"
              />
              <input
                className="ms-hex"
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onBlur={() => {
                  let v = hexInput.trim();
                  if (!v.startsWith('#')) v = '#' + v;
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) aplicarCor(v);
                  else setHexInput(cor.toUpperCase());
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
              />
            </div>
            <div className="ms-swatches-wrap">
              <div className="ms-swatches">
                {CORES.map((c) => (
                  <div
                    key={c.key}
                    className={'ms-swatch' + (cor.toLowerCase() === c.hex.toLowerCase() ? ' active' : '')}
                    style={{
                      background: c.hex,
                      boxShadow: c.key === 'branco' ? 'inset 0 0 0 1px rgba(0,0,0,0.08)' : undefined,
                    }}
                    title={c.nome}
                    onClick={() => aplicarCor(c.hex)}
                  >
                    <span className="ms-swatch-label">{c.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ms-section">
            <div className="ms-section-title">
              Estampas
              <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: '9.5px', color: 'var(--ink-3)' }}>
                {imageStamps.length} {imageStamps.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <div className="ms-stamp-list">
              {imageStamps.map((stamp) => (
                <div
                  key={stamp.id}
                  className={'ms-stamp-item' + (stamp.id === selectedId ? ' selected' : '')}
                  onClick={() => selectStamp(stamp.id)}
                >
                  <div className="ms-stamp-thumb" style={{ backgroundImage: `url('${stamp.processed?.src ?? ''}')` }} />
                  <div className="ms-stamp-meta">
                    <div className="ms-stamp-name">{stamp.name}</div>
                    <div className="ms-stamp-info">
                      {Math.round(stamp.scale * 100)}% · {((stamp.fileSize ?? 0) / 1024).toFixed(0)}kb
                      {stamp.removeBg ? ' · sem fundo' : ''}
                    </div>
                  </div>
                  <button
                    className="ms-icon-btn danger"
                    title="Excluir"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStamp(stamp.id);
                      showToast(`"${stamp.name}" removida`);
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Adicionar estampa
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
              onChange={(e) => {
                Array.from(e.target.files ?? []).forEach((f) => loadStampFile(f));
                e.target.value = '';
              }}
            />

            {selectedStamp && selectedStamp.type === 'image' && (
              <div className="ms-stamp-controls">
                <div className="ms-stamp-controls-header">Editando: {selectedStamp.name}</div>
                <div className="ms-slider-row">
                  <label>
                    <span>Tamanho</span>
                    <span>{Math.round(selectedStamp.scale * 100)}%</span>
                  </label>
                  <input type="range" min={10} max={250} value={Math.round(selectedStamp.scale * 100)} onChange={(e) => changeScale(Number(e.target.value))} />
                </div>
                <div className="ms-toggle-row">
                  <div>
                    <div className="ms-toggle-label">Remover fundo</div>
                    <div className="ms-toggle-hint">Detecta cor do fundo</div>
                  </div>
                  <div className={'ms-switch' + (selectedStamp.removeBg ? ' on' : '')} onClick={toggleRemoveBg} />
                </div>
                {selectedStamp.removeBg && (
                  <div className="ms-slider-row">
                    <label>
                      <span>Sensibilidade</span>
                      <span>{selectedStamp.tolerance}</span>
                    </label>
                    <input type="range" min={5} max={120} value={selectedStamp.tolerance} onChange={(e) => changeTolerance(Number(e.target.value))} />
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
              placeholder='Ex: "Nort Sports"'
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="ms-color-toggle-group">
              {[
                { val: '#000000', label: 'Preto', bg: '#000' },
                { val: '#ffffff', label: 'Branco', bg: '#fff' },
              ].map((opt) => (
                <button key={opt.val} className={'ms-color-toggle-btn' + (textColor === opt.val ? ' active' : '')} onClick={() => setTextColor(opt.val)}>
                  <span className="ms-cs-swatch" style={{ background: opt.bg }} /> {opt.label}
                </button>
              ))}
            </div>
            <div className="ms-slider-row" style={{ padding: '8px 0 0' }}>
              <label>
                <span>Tamanho do texto</span>
                <span>{textFontSize}</span>
              </label>
              <input type="range" min={16} max={120} value={textFontSize} onChange={(e) => setTextFontSize(Number(e.target.value))} />
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
                  onClick={() => setCotasAtivas((prev) => ({ ...prev, [row.key]: !prev[row.key] }))}
                />
              </div>
            ))}
            <div className="ms-cota-warning">⚠ Posicionamento aproximado. Pode haver variação de ~1 cm conforme malha e estampa.</div>
          </div>
        </aside>

        <div className="ms-view">
          <div className="ms-canvas-scroll" ref={canvasScrollRef}>
            <div className="ms-stage-wrap" ref={stageWrapRef}>
              <canvas ref={canvasRef} className="ms-stage" onMouseDown={onStageDown} onMouseMove={onStageHover} onTouchStart={onStageDown} />
            </div>
          </div>
          {stamps.length === 0 && (
            <div className="ms-empty-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Adicione uma estampa ou texto para começar
            </div>
          )}
          <div className="ms-zoom-bar">
            <button className="ms-zoom-btn" onClick={() => zoomBy(0.8)} title="Diminuir zoom (Ctrl -)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="ms-zoom-level" onClick={() => setZoomClamped(fitZoom)} title="Reset">{Math.round(zoom * 100)}%</span>
            <button className="ms-zoom-btn" onClick={() => zoomBy(1.25)} title="Aumentar zoom (Ctrl +)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div className="ms-zoom-divider" />
            <button className="ms-zoom-btn" onClick={fitToScreen} title="Ajustar à tela">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
