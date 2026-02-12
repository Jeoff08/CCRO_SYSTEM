import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Billboard } from "@react-three/drei";

/* ── Layout dimensions ── */
const CELL_W = 1.0;
const CELL_H = .45;
const SIDE_DEPTH = 2.65;
const SIDE_GAP = 0.08;
const BAY_GAP = 0.5;
const POST_W = 0.045;
const SHELF_H = 0.02;

/* ── Colors ── */
const C = {
  post: "#78716c",
  postMid: "#a8a29e",
  shelf: "#d6d3d1",
  empty: "#d1fae5",
  highlight: "#a60a0a",
  highlightEmit: "#6b0404",
  floor: "#ecfdf5",
  bayLabel: "#064e3b",
  shelfLabel: "#374151",
  rowLabel: "#6b7280",
  white: "#ffffff",
};

/* ── Helpers ── */
const colsForBay = (shelves) => Math.max(1, Math.ceil((shelves || []).length / 2));

/* ── Sub-components ── */

function Post({ position, height }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[POST_W, height, POST_W]} />
      <meshStandardMaterial color={C.post} metalness={0.65} roughness={0.3} />
    </mesh>
  );
}

function ShelfPlank({ position, width, depth }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={[width, SHELF_H, depth]} />
      <meshStandardMaterial color={C.shelf} metalness={0.35} roughness={0.55} />
    </mesh>
  );
}

function EmptyCell({ position, size }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={C.empty} transparent opacity={0.18} roughness={0.9} />
    </mesh>
  );
}

function HighlightCell({ position, size, label }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.35 + 0.3 * Math.sin(t * 2.5);
    if (meshRef.current) meshRef.current.material.emissiveIntensity = pulse;
    if (glowRef.current) glowRef.current.material.opacity = 0.12 + 0.08 * Math.sin(t * 2.5);
  });

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <boxGeometry args={[size[0] * 1.1, size[1] * 1.1, size[2] * 1.1]} />
        <meshStandardMaterial color={C.highlight} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={C.highlight}
          emissive={C.highlightEmit}
          emissiveIntensity={0.5}
          transparent
          opacity={0.92}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      {label && (
        <Billboard>
          <Text
            fontSize={0.12}
            color={C.white}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.008}
            outlineColor={C.bayLabel}
          >
            {label}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function BayUnit({ bayNum, shelves, rowLabels, rowKeys, xOff, highlight, showRowLabels }) {
  const numRows = rowKeys.length;
  const cols = colsForBay(shelves);
  const rackW = cols * CELL_W;
  const rackH = numRows * CELL_H;
  const rackD = SIDE_DEPTH * 2 + SIDE_GAP;
  const cx = xOff + rackW / 2;

  const front = shelves.slice(0, cols);
  const back = shelves.slice(cols, cols * 2);
  const cellSize = [CELL_W * 0.88, CELL_H * 0.72, SIDE_DEPTH * 0.88];

  const cornerPosts = [
    [xOff + POST_W / 2, rackH / 2, -rackD / 2 + POST_W / 2],
    [xOff + rackW - POST_W / 2, rackH / 2, -rackD / 2 + POST_W / 2],
    [xOff + POST_W / 2, rackH / 2, rackD / 2 - POST_W / 2],
    [xOff + rackW - POST_W / 2, rackH / 2, rackD / 2 - POST_W / 2],
  ];

  return (
    <group>
      {/* Bay label */}
      <Billboard position={[cx, rackH + SHELF_H + 0.2, 0]}>
        <Text fontSize={0.2} color={C.bayLabel} anchorX="center" fontWeight="bold">
          {`B-${bayNum}`}
        </Text>
      </Billboard>

      {/* Corner posts */}
      {cornerPosts.map((pos, i) => (
        <Post key={`cp-${i}`} position={pos} height={rackH + SHELF_H} />
      ))}

      {/* Middle divider posts for multi-column bays */}
      {cols > 1 &&
        Array.from({ length: cols - 1 }, (_, i) => {
          const px = xOff + (i + 1) * CELL_W;
          return (
            <React.Fragment key={`mp-${i}`}>
              <Post position={[px, rackH / 2, rackD / 2 - POST_W / 2]} height={rackH + SHELF_H} />
              <Post position={[px, rackH / 2, -rackD / 2 + POST_W / 2]} height={rackH + SHELF_H} />
            </React.Fragment>
          );
        })}

      {/* Shelf planks (bottom + between rows + top) */}
      {Array.from({ length: numRows + 1 }, (_, i) => (
        <ShelfPlank key={`sp-${i}`} position={[cx, i * CELL_H, 0]} width={rackW} depth={rackD} />
      ))}

      {/* Cross braces on sides for realism */}
      <mesh position={[xOff + POST_W / 2, rackH / 2, 0]} castShadow>
        <boxGeometry args={[POST_W * 0.6, rackH, POST_W * 0.6]} />
        <meshStandardMaterial color={C.postMid} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[xOff + rackW - POST_W / 2, rackH / 2, 0]} castShadow>
        <boxGeometry args={[POST_W * 0.6, rackH, POST_W * 0.6]} />
        <meshStandardMaterial color={C.postMid} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Front cells */}
      {front.map((_, colIdx) => {
        const si = colIdx;
        return rowKeys.map((rk, ri) => {
          const pos = [
            xOff + colIdx * CELL_W + CELL_W / 2,
            ri * CELL_H + CELL_H / 2,
            SIDE_GAP / 2 + SIDE_DEPTH / 2,
          ];
          const match = highlight && highlight.bay === bayNum && highlight.shelfIndex === si && highlight.row === rk;
          return match ? (
            <HighlightCell key={`fc-${colIdx}-${rk}`} position={pos} size={cellSize} label={`Box #${highlight.box}`} />
          ) : (
            <EmptyCell key={`fc-${colIdx}-${rk}`} position={pos} size={cellSize} />
          );
        });
      })}

      {/* Back cells */}
      {back.map((_, colIdx) => {
        const si = cols + colIdx;
        return rowKeys.map((rk, ri) => {
          const pos = [
            xOff + colIdx * CELL_W + CELL_W / 2,
            ri * CELL_H + CELL_H / 2,
            -(SIDE_GAP / 2 + SIDE_DEPTH / 2),
          ];
          const match = highlight && highlight.bay === bayNum && highlight.shelfIndex === si && highlight.row === rk;
          return match ? (
            <HighlightCell key={`bc-${colIdx}-${rk}`} position={pos} size={cellSize} label={`Box #${highlight.box}`} />
          ) : (
            <EmptyCell key={`bc-${colIdx}-${rk}`} position={pos} size={cellSize} />
          );
        });
      })}

      {/* Front shelf-side labels */}
      {front.map((lbl, colIdx) => (
        <Billboard key={`fsl-${colIdx}`} position={[xOff + colIdx * CELL_W + CELL_W / 2, -0.16, SIDE_GAP / 2 + SIDE_DEPTH / 2]}>
          <Text fontSize={0.11} color={C.shelfLabel} anchorX="center">{lbl}</Text>
        </Billboard>
      ))}

      {/* Back shelf-side labels */}
      {back.map((lbl, colIdx) => (
        <Billboard key={`bsl-${colIdx}`} position={[xOff + colIdx * CELL_W + CELL_W / 2, -0.16, -(SIDE_GAP / 2 + SIDE_DEPTH / 2)]}>
          <Text fontSize={0.11} color={C.shelfLabel} anchorX="center">{lbl}</Text>
        </Billboard>
      ))}

      {/* Row labels (shown on first bay only) */}
      {showRowLabels &&
        rowKeys.map((rk, ri) => (
          <Billboard key={`rl-${rk}`} position={[xOff - 0.22, ri * CELL_H + CELL_H / 2, rackD / 2]}>
            <Text fontSize={0.1} color={C.rowLabel} anchorX="right" anchorY="middle">
              {rowLabels[rk]}
            </Text>
          </Billboard>
        ))}
    </group>
  );
}

/* ── Scene (all racks + environment) ── */

function RackScene({ shelfLettersByBay, rowLabels, highlight }) {
  const bays = useMemo(
    () =>
      Object.keys(shelfLettersByBay || {})
        .map(Number)
        .filter((k) => !Number.isNaN(k))
        .sort((a, b) => a - b),
    [shelfLettersByBay]
  );

  const rowKeys = useMemo(
    () =>
      Object.keys(rowLabels || {})
        .map(Number)
        .filter((k) => !Number.isNaN(k))
        .sort((a, b) => a - b),
    [rowLabels]
  );

  const hlInfo = useMemo(() => {
    if (!highlight) return null;
    return { bay: highlight.bay, shelfIndex: highlight.shelf - 1, row: highlight.row, box: highlight.box };
  }, [highlight]);

  const layout = useMemo(() => {
    let x = 0;
    return bays.map((bay) => {
      const w = colsForBay(shelfLettersByBay[bay]) * CELL_W;
      const off = x;
      x += w + BAY_GAP;
      return { bay, off, w };
    });
  }, [bays, shelfLettersByBay]);

  const totalW = layout.length ? layout[layout.length - 1].off + layout[layout.length - 1].w : 6;
  const totalH = rowKeys.length * CELL_H;
  const totalD = SIDE_DEPTH * 2 + SIDE_GAP;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[totalW * 0.8, totalH * 3, totalW * 0.6]} intensity={0.75} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-totalW * 0.3, totalH * 2, -totalW * 0.4]} intensity={0.25} />
      <hemisphereLight groundColor="#d1fae5" intensity={0.3} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[totalW / 2, -0.005, 0]} receiveShadow>
        <planeGeometry args={[totalW + 4, totalD + 5]} />
        <meshStandardMaterial color={C.floor} roughness={0.9} />
      </mesh>

      {/* Subtle floor grid lines */}
      <gridHelper args={[Math.max(totalW + 4, totalD + 5), 20, "#d1d5db", "#e5e7eb"]} position={[totalW / 2, -0.003, 0]} />

      {/* Bay racks */}
      {layout.map(({ bay, off }, idx) => (
        <BayUnit
          key={bay}
          bayNum={bay}
          shelves={shelfLettersByBay[bay] || []}
          rowLabels={rowLabels}
          rowKeys={rowKeys}
          xOff={off}
          highlight={hlInfo}
          showRowLabels={idx === 0}
        />
      ))}

      {/* "Front" / "Back" orientation labels */}
      <Billboard position={[totalW / 2, -0.35, totalD / 2 + 0.6]}>
        <Text fontSize={0.14} color="#9ca3af" anchorX="center">Front (S-A / S-C)</Text>
      </Billboard>
      <Billboard position={[totalW / 2, -0.35, -(totalD / 2 + 0.6)]}>
        <Text fontSize={0.14} color="#9ca3af" anchorX="center">Back (S-B / S-D)</Text>
      </Billboard>

      {/* Orbit controls */}
      <OrbitControls
        target={[totalW / 2, totalH / 2, 0]}
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI * 0.85}
        minDistance={1.5}
        maxDistance={totalW * 2.5 + 10}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

/* ── Main export ── */

export default function LocationRack3D({ shelfLettersByBay, rowLabels, highlight, className = "", style = {} }) {
  const bays = Object.keys(shelfLettersByBay || {})
    .map(Number)
    .filter((k) => !Number.isNaN(k));
  const rowKeys = Object.keys(rowLabels || {})
    .map(Number)
    .filter((k) => !Number.isNaN(k));

  let totalW = 0;
  for (const bay of bays) {
    totalW += colsForBay(shelfLettersByBay[bay]) * CELL_W + BAY_GAP;
  }
  const totalH = rowKeys.length * CELL_H;

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-50/80 to-white border-2 border-emerald-200/60 shadow-inner ${className}`}
      style={{ height: 420, ...style }}
    >
      <Canvas
        shadows
        camera={{
          position: [totalW / 2, totalH + 1.8, totalW * 0.72],
          fov: 42,
          near: 0.1,
          far: 200,
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <RackScene shelfLettersByBay={shelfLettersByBay} rowLabels={rowLabels} highlight={highlight} />
      </Canvas>

      {/* Controls hint */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] text-gray-500 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm border border-gray-100">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
        Drag to rotate · Scroll to zoom · Right-click to pan
      </div>
    </div>
  );
}
