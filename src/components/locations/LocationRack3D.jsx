import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import { MONTHS } from "../../constants/index.js";

/* ── Layout dimensions ── */
const CELL_W = 1.0;
const CELL_H = .45;
const SIDE_DEPTH = 2.65;
const SIDE_GAP = 0.10; // small gap between front & back rack sections
const BAY_GAP = 2.0; // Increased gap to allow walking between racks
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

/* ── Certificate-type color themes ── */
const CERT_THEME = {
  COLB: {
    highlight: "#1d4ed8",       // blue-700
    highlightEmit: "#1e3a8a",   // blue-900
    glow: "#1d4ed8",            // for glow mesh
    panelFrom: "rgba(29,78,216,0.9)",   // blue-700
    panelTo: "rgba(30,64,175,0.9)",     // blue-800
    btnFrom: "rgba(37,99,235,0.8)",     // blue-600
    btnTo: "rgba(29,78,216,0.8)",       // blue-700
    btnHoverFrom: "rgb(37,99,235)",
    btnHoverTo: "rgb(29,78,216)",
    glowR: 59, glowG: 130, glowB: 246, // blue-500 for CSS rgba
    badgeBg: "rgba(30,64,175,0.6)",     // re-show button
    badgeBorder: "rgba(59,130,246,0.6)",
  },
  COM: {
    highlight: "#dc2626",       // red-600
    highlightEmit: "#6b0404",   // dark red
    glow: "#a60a0a",
    panelFrom: "rgba(220,38,38,0.9)",
    panelTo: "rgba(185,28,28,0.9)",
    btnFrom: "rgba(239,68,68,0.8)",
    btnTo: "rgba(220,38,38,0.8)",
    btnHoverFrom: "rgb(239,68,68)",
    btnHoverTo: "rgb(220,38,38)",
    glowR: 239, glowG: 68, glowB: 68,
    badgeBg: "rgba(185,28,28,0.95)",
    badgeBorder: "rgba(239,68,68,0.6)",
  },
  COD: {
    highlight: "#7c3aed",       // violet-600
    highlightEmit: "#4c1d95",   // violet-900
    glow: "#7c3aed",
    panelFrom: "rgba(124,58,237,0.9)",
    panelTo: "rgba(109,40,217,0.9)",
    btnFrom: "rgba(139,92,246,0.8)",
    btnTo: "rgba(124,58,237,0.8)",
    btnHoverFrom: "rgb(139,92,246)",
    btnHoverTo: "rgb(124,58,237)",
    glowR: 139, glowG: 92, glowB: 246,
    badgeBg: "rgba(109,40,217,0.95)",
    badgeBorder: "rgba(139,92,246,0.6)",
  },
};
const DEFAULT_THEME = CERT_THEME.COM; // fallback to red

/* ── Helpers ── */
const colsForBay = (shelves) => Math.max(1, Math.ceil((shelves || []).length / 2));
const CERT_NAMES = { COLB: "Birth Certificate", COM: "Marriage Certificate", COD: "Death Certificate" };

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

/* ── Interactive cardboard box with hover glow + tooltip ── */

function InteractiveBox({ position, size, bayNum, shelfLabel, rowLabel }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [w, h, d] = [size[0] * 0.90, size[1] * 0.78, size[2] * 0.88];

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  }, []);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    setClicked(true);
    setTimeout(() => setClicked(false), 250);
  }, []);

  return (
    <group position={position}>
      {/* Main box body */}
      <mesh
        castShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={clicked ? "#b8e6c8" : hovered ? "#d4a574" : "#c4a47a"}
          roughness={hovered ? 0.7 : 0.88}
          metalness={0.0}
          emissive={clicked ? "#10b981" : hovered ? "#8a6420" : "#000000"}
          emissiveIntensity={clicked ? 0.35 : hovered ? 0.15 : 0}
        />
      </mesh>
      {/* Lid seam */}
      <mesh position={[0, h * 0.48, 0]}>
        <boxGeometry args={[w * 1.005, 0.006, d * 1.005]} />
        <meshStandardMaterial color={hovered ? "#b49060" : "#9a7d55"} roughness={0.7} />
      </mesh>
      {/* Front label sticker */}
      <mesh position={[0, h * 0.05, d / 2 + 0.001]}>
        <planeGeometry args={[w * 0.45, h * 0.35]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.95} />
      </mesh>
      {/* Hover tooltip */}
      {hovered && (
        <Html
          position={[0, h / 2 + 0.18, 0]}
          center
          distanceFactor={5}
          style={{ pointerEvents: "none", zIndex: 50 }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(10px)",
              borderRadius: 10,
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 600,
              color: "#1f2937",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
              whiteSpace: "nowrap",
              textAlign: "center",
              lineHeight: 1.5,
              animation: "fadeIn 0.15s ease-out",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#065f46", fontWeight: 700 }}>B-{bayNum}</span>
              <span style={{ color: "#d1d5db" }}>|</span>
              <span style={{ color: "#92400e" }}>Shelf {shelfLabel}</span>
              <span style={{ color: "#d1d5db" }}>|</span>
              <span style={{ color: "#374151" }}>{rowLabel}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── Highlighted box – pulsing marker with enhanced tooltip ── */

function HighlightedBox({ position, size, label, info, theme }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [w, h, d] = [size[0] * 0.90, size[1] * 0.78, size[2] * 0.88];
  const t = theme || DEFAULT_THEME;

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const pulse = 0.35 + 0.3 * Math.sin(elapsed * 2.5);
    if (meshRef.current) meshRef.current.material.emissiveIntensity = pulse;
    if (glowRef.current) glowRef.current.material.opacity = 0.12 + 0.08 * Math.sin(elapsed * 2.5);
  });

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <boxGeometry args={[w * 1.12, h * 1.12, d * 1.12]} />
        <meshStandardMaterial color={t.highlight} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <mesh
        ref={meshRef}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={t.highlight} emissive={t.highlightEmit} emissiveIntensity={0.5} transparent opacity={0.92} roughness={0.25} metalness={0.1} />
      </mesh>
      {label && (
        <>
          {/* Number printed on the front face of the box */}
          <Text
            position={[0, 0, d / 2 + 0.002]}
            fontSize={Math.min(w * 0.32, h * 0.38)}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={0.006}
            outlineColor="#000000"
          >
            {`#${label}`}
          </Text>
          {/* Number printed on the back face of the box */}
          <group position={[0, 0, -d / 2 - 0.002]} rotation={[0, Math.PI, 0]}>
            <Text
              fontSize={Math.min(w * 0.32, h * 0.38)}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              outlineWidth={0.006}
              outlineColor="#000000"
            >
              {`#${label}`}
            </Text>
          </group>
        </>
      )}
      {/* Detailed info tooltip on hover */}
      {hovered && info && (
        <Html
          position={[0, h / 2 + 0.35, 0]}
          center
          distanceFactor={4}
          style={{ pointerEvents: "none", zIndex: 60 }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(240,253,244,0.98))",
              backdropFilter: "blur(12px)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 11,
              color: "#1f2937",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15), 0 0 0 1px rgba(5,150,105,0.2)",
              whiteSpace: "nowrap",
              textAlign: "left",
              lineHeight: 1.6,
              minWidth: 160,
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <div style={{ fontWeight: 800, color: "#065f46", fontSize: 12, marginBottom: 4 }}>
              {CERT_NAMES[info.certificateType] || info.certificateType}
            </div>
            {info.year && (
              <div style={{ color: "#374151" }}>
                Year: <strong>{info.year}{info.yearTo && info.yearTo !== info.year ? `–${info.yearTo}` : ""}</strong>
              </div>
            )}
            {info.registryRange && (
              <div style={{ color: "#374151" }}>
                Registry: <strong>{info.registryRange}</strong>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── Celebration sparkles floating around highlighted box ── */

function CelebrationSparkles({ position, theme }) {
  const groupRef = useRef();
  const t = theme || DEFAULT_THEME;
  const sparkles = useMemo(() => {
    // Pick sparkle palette based on cert theme color
    const palettes = {
      COLB: ["#60a5fa", "#3b82f6", "#93c5fd", "#dbeafe", "#2563eb"],
      COD: ["#a78bfa", "#8b5cf6", "#c4b5fd", "#ede9fe", "#7c3aed"],
    };
    const defaultPalette = ["#fbbf24", "#f59e0b", "#fcd34d", "#fef3c7", "#f97316"];
    // Determine palette from highlight color
    const pal = t.highlight === "#1d4ed8" ? palettes.COLB : t.highlight === "#7c3aed" ? palettes.COD : defaultPalette;
    return Array.from({ length: 18 }, (_, i) => ({
      angle: (i / 18) * Math.PI * 2,
      radius: 0.25 + Math.random() * 0.45,
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      ySpeed: 0.15 + Math.random() * 0.25,
      color: pal[Math.floor(Math.random() * 5)],
      size: 0.012 + Math.random() * 0.018,
    }));
  }, [t]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((mesh, i) => {
      const s = sparkles[i];
      const lt = t + s.phase;
      mesh.position.set(
        Math.cos(lt * s.speed) * s.radius,
        (lt * s.ySpeed) % 1.8 - 0.2,
        Math.sin(lt * s.speed) * s.radius,
      );
      mesh.material.opacity = 0.35 + 0.65 * Math.abs(Math.sin(lt * 3));
      const sc = 0.7 + 0.5 * Math.sin(lt * 4);
      mesh.scale.set(sc, sc, sc);
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {sparkles.map((s, i) => (
        <mesh key={i}>
          <sphereGeometry args={[s.size, 6, 6]} />
          <meshStandardMaterial
            color={s.color}
            emissive={s.color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.7}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Smooth camera controller for view presets ── */

function SmoothCamera({ viewCmd, targetCellPos, totalW, totalH, controlsRef }) {
  const { camera } = useThree();
  const animRef = useRef({ active: false, t: 0 });
  const lastCmdId = useRef(null);

  useEffect(() => {
    if (!viewCmd || viewCmd.id === lastCmdId.current) return;
    lastCmdId.current = viewCmd.id;

    // Validate inputs
    if (isNaN(totalW) || isNaN(totalH) || !isFinite(totalW) || !isFinite(totalH)) return;

    let toCam, toTarget;
    const center = new THREE.Vector3(totalW / 2, totalH / 2, 0);

    switch (viewCmd.type) {
      case "front":
        toCam = new THREE.Vector3(totalW / 2, totalH / 2 + 0.5, totalW * 0.7 + 7);
        toTarget = center.clone();
        break;
      case "top":
        toCam = new THREE.Vector3(totalW / 2, Math.max(totalH * 4, 6), 0.01);
        toTarget = center.clone();
        break;
      case "side":
        toCam = new THREE.Vector3(totalW + 5, totalH / 2 + 0.5, 0);
        toTarget = center.clone();
        break;
      case "focus":
        if (targetCellPos && Array.isArray(targetCellPos) && targetCellPos.length >= 3) {
          // Validate targetCellPos values
          if (isNaN(targetCellPos[0]) || isNaN(targetCellPos[1]) || isNaN(targetCellPos[2])) {
            return;
          }
          const zDir = targetCellPos[2] > 0 ? 1 : -1;
          toCam = new THREE.Vector3(
            targetCellPos[0] + 1.2,
            targetCellPos[1] + 0.8,
            targetCellPos[2] + zDir * 3.0
          );
          toTarget = new THREE.Vector3(targetCellPos[0], targetCellPos[1], targetCellPos[2]);
        } else {
          return;
        }
        break;
      case "reset":
        toCam = new THREE.Vector3(totalW / 2, totalH + 2.5, totalW * 0.9 + 4);
        toTarget = center.clone();
        break;
      default:
        return;
    }

    // Validate camera positions
    if (!toCam || !toTarget) return;
    if (isNaN(toCam.x) || isNaN(toCam.y) || isNaN(toCam.z)) return;
    if (isNaN(toTarget.x) || isNaN(toTarget.y) || isNaN(toTarget.z)) return;

    animRef.current = {
      active: true,
      fromCam: camera.position.clone(),
      toCam,
      fromTarget: controlsRef.current ? controlsRef.current.target.clone() : center.clone(),
      toTarget,
      t: 0,
    };
  }, [viewCmd, targetCellPos, totalW, totalH, controlsRef, camera]);

  useFrame((_, delta) => {
    const a = animRef.current;
    if (!a.active) return;
    
    // Validate delta
    if (!delta || isNaN(delta) || !isFinite(delta) || delta <= 0) return;
    
    a.t = Math.min(a.t + delta * 2.0, 1);
    // ease in-out cubic
    const ease = a.t < 0.5 ? 4 * a.t * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 3) / 2;

    // Validate vectors before lerping
    if (a.fromCam && a.toCam && 
        !isNaN(a.fromCam.x) && !isNaN(a.toCam.x) &&
        !isNaN(a.fromCam.y) && !isNaN(a.toCam.y) &&
        !isNaN(a.fromCam.z) && !isNaN(a.toCam.z)) {
      camera.position.lerpVectors(a.fromCam, a.toCam, ease);
    }
    
    if (controlsRef.current && a.fromTarget && a.toTarget &&
        !isNaN(a.fromTarget.x) && !isNaN(a.toTarget.x) &&
        !isNaN(a.fromTarget.y) && !isNaN(a.toTarget.y) &&
        !isNaN(a.fromTarget.z) && !isNaN(a.toTarget.z)) {
      controlsRef.current.target.lerpVectors(a.fromTarget, a.toTarget, ease);
      controlsRef.current.update();
    }

    if (a.t >= 1) a.active = false;
  });

  return null;
}

/* ── BayUnit (now uses InteractiveBox for hover/click) ── */

function BayUnit({ bayNum, shelves, rowLabels, rowKeys, xOff, highlight, showRowLabels, certTheme }) {
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
      <Billboard position={[cx, rackH + SHELF_H + 0.35, 0]}>
        <Text fontSize={0.2} color={C.bayLabel} anchorX="center" fontWeight="bold">
          {`B-${bayNum}`}
        </Text>
      </Billboard>

      {/* Front shelf labels at top */}
      {front.map((lbl, colIdx) => (
        <Billboard key={`fsl-top-${colIdx}`} position={[xOff + colIdx * CELL_W + CELL_W / 2, rackH + SHELF_H + 0.12, SIDE_GAP / 2 + SIDE_DEPTH / 2]}>
          <Text fontSize={0.1} color={C.shelfLabel} anchorX="center" fontWeight="bold">{lbl}</Text>
        </Billboard>
      ))}

      {/* Back shelf labels at top */}
      {back.map((lbl, colIdx) => (
        <Billboard key={`bsl-top-${colIdx}`} position={[xOff + colIdx * CELL_W + CELL_W / 2, rackH + SHELF_H + 0.12, -(SIDE_GAP / 2 + SIDE_DEPTH / 2)]}>
          <Text fontSize={0.1} color={C.shelfLabel} anchorX="center" fontWeight="bold">{lbl}</Text>
        </Billboard>
      ))}

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

      {/* Front cells – interactive boxes */}
      {front.map((shelfLbl, colIdx) => {
        const si = colIdx;
        return rowKeys.map((rk, ri) => {
          const pos = [
            xOff + colIdx * CELL_W + CELL_W / 2,
            ri * CELL_H + CELL_H / 2,
            SIDE_GAP / 2 + SIDE_DEPTH / 2,
          ];
          const match = highlight && highlight.bay === bayNum && highlight.shelfIndex === si && highlight.row === rk;
          return match ? (
            <HighlightedBox key={`fc-${colIdx}-${rk}`} position={pos} size={cellSize} label={highlight.box} info={highlight.info || null} theme={certTheme} />
          ) : (
            <InteractiveBox key={`fc-${colIdx}-${rk}`} position={pos} size={cellSize} bayNum={bayNum} shelfLabel={shelfLbl} rowLabel={rowLabels[rk]} />
          );
        });
      })}

      {/* Back cells – interactive boxes */}
      {back.map((shelfLbl, colIdx) => {
        const si = cols + colIdx;
        return rowKeys.map((rk, ri) => {
          const pos = [
            xOff + colIdx * CELL_W + CELL_W / 2,
            ri * CELL_H + CELL_H / 2,
            -(SIDE_GAP / 2 + SIDE_DEPTH / 2),
          ];
          const match = highlight && highlight.bay === bayNum && highlight.shelfIndex === si && highlight.row === rk;
          return match ? (
            <HighlightedBox key={`bc-${colIdx}-${rk}`} position={pos} size={cellSize} label={highlight.box} info={highlight.info || null} theme={certTheme} />
          ) : (
            <InteractiveBox key={`bc-${colIdx}-${rk}`} position={pos} size={cellSize} bayNum={bayNum} shelfLabel={shelfLbl} rowLabel={rowLabels[rk]} />
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

/* ── Ladder mesh ── */

function LadderMesh({ height }) {
  const rungCount = Math.max(2, Math.floor(height / 0.16));
  const rungSpacing = height / (rungCount + 1);
  const w = 0.22;
  const rail = 0.018;
  return (
    <group>
      <mesh position={[-w / 2, height / 2, 0]} castShadow>
        <boxGeometry args={[rail, height, rail]} />
        <meshStandardMaterial color="#92400e" roughness={0.6} />
      </mesh>
      <mesh position={[w / 2, height / 2, 0]} castShadow>
        <boxGeometry args={[rail, height, rail]} />
        <meshStandardMaterial color="#92400e" roughness={0.6} />
      </mesh>
      {Array.from({ length: rungCount }, (_, i) => (
        <mesh key={i} position={[0, (i + 1) * rungSpacing, 0]} castShadow>
          <boxGeometry args={[w, rail * 0.7, rail]} />
          <meshStandardMaterial color="#b45309" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Walking Person with retrieval animation ── */

const PERSON_SCALE = 1.6;
const RACK_FRONT_Z = SIDE_DEPTH + SIDE_GAP / 2;
const LADDER_LEAN = 0.28;
const LADDER_THRESHOLD = 1.55;
const BEND_THRESHOLD = 0.9;

function WalkingPerson({ targetCellPos, startPos, waypoints, onArrived }) {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const carriedLadderRef = useRef();
  const placedLadderRef = useRef();
  const torsoRef = useRef();
  const leftFootRef = useRef();
  const rightFootRef = useRef();
  const headRef = useRef();

  const isFront = targetCellPos[2] > 0;
  const needsLadder = targetCellPos[1] > LADDER_THRESHOLD;
  const needsBend = !needsLadder && targetCellPos[1] < BEND_THRESHOLD;

  const bendAngle = useMemo(() => {
    if (!needsBend) return 0;
    const boxH = targetCellPos[1];
    return Math.min(1.3, Math.max(0, (BEND_THRESHOLD - boxH) / BEND_THRESHOLD * 1.8));
  }, [needsBend, targetCellPos]);

  const ladderInfo = useMemo(() => {
    if (!needsLadder) return null;
    const h = targetCellPos[1];
    const length = h / Math.cos(LADDER_LEAN) + 0.15;
    
    // Calculate base offset with additional clearance for higher rows
    // Higher rows need more clearance to prevent ladder from bumping into shelf
    const baseOffset = h * Math.tan(LADDER_LEAN);
    
    // Add minimum clearance distance to prevent ladder top from hitting shelf structure
    // For higher rows (row 5+), increase clearance significantly
    const minClearance = 0.25; // Minimum clearance from rack
    const heightBasedClearance = h > 2.0 ? (h - 2.0) * 0.15 : 0; // Extra clearance for very high rows
    const totalClearance = minClearance + heightBasedClearance;
    
    // Adjust base offset to ensure ladder top doesn't hit the shelf
    const adjustedBaseOffset = Math.max(baseOffset, totalClearance);
    
    const climbTarget = Math.max(0, h - 0.76 * PERSON_SCALE + 0.05);
    const climbZShift = climbTarget * Math.tan(LADDER_LEAN);
    return { length, baseOffset: adjustedBaseOffset, climbTarget, climbZShift };
  }, [needsLadder, targetCellPos]);

  const standPos = useMemo(
    () => {
      const outerFace = SIDE_GAP / 2 + SIDE_DEPTH;
      const bendForward = needsBend ? 0.33 * Math.sin(bendAngle) * PERSON_SCALE : 0;
      
      // Dynamic distance based on box height - lower boxes = closer to rack
      let baseDistance;
      if (ladderInfo) {
        // High boxes use ladder offset
        // For very high rows (row 5+), use more of the offset to prevent ladder from hitting shelf
        const boxHeight = targetCellPos[1];
        if (boxHeight > 2.0) {
          // Very high rows - use full offset to ensure ladder clearance
          baseDistance = ladderInfo.baseOffset;
        } else {
          // Medium-high rows - use reduced offset but still ensure clearance
          baseDistance = ladderInfo.baseOffset * 0.85;
        }
      } else {
        const boxHeight = targetCellPos[1];
        // Calculate distance based on box height
        // Lower boxes (closer to floor) = person stands closer
        if (boxHeight < 0.5) {
          // Very low boxes - stand very close
          baseDistance = 0.15;
        } else if (boxHeight < BEND_THRESHOLD) {
          // Low boxes (bending range) - stand closer
          // Interpolate between 0.15 (at Y=0) and 0.45 (at Y=BEND_THRESHOLD)
          const t = boxHeight / BEND_THRESHOLD;
          baseDistance = 0.15 + (0.45 - 0.15) * t;
        } else if (boxHeight < LADDER_THRESHOLD) {
          // Middle boxes - stand at medium distance
          // Interpolate between 0.45 (at Y=BEND_THRESHOLD) and 0.75 (at Y=LADDER_THRESHOLD)
          const t = (boxHeight - BEND_THRESHOLD) / (LADDER_THRESHOLD - BEND_THRESHOLD);
          baseDistance = 0.45 + (0.75 - 0.45) * t;
        } else {
          // Shouldn't reach here (would use ladder), but fallback
          baseDistance = 0.8;
        }
        // Add bend forward adjustment for low boxes
        baseDistance += bendForward * 0.9;
      }
      
      const standZ = outerFace + baseDistance;
      return [
        targetCellPos[0],
        0,
        isFront ? standZ : -standZ,
      ];
    },
    [targetCellPos, isFront, ladderInfo, needsBend, bendAngle]
  );

  /* ── Build the full walk path: start → waypoints → standPos ── */
  const walkPath = useMemo(() => {
    // Validate inputs
    if (!startPos || !Array.isArray(startPos) || startPos.length < 3) return [];
    if (!standPos || !Array.isArray(standPos) || standPos.length < 3) return [];
    
    const path = [startPos];
    if (waypoints && Array.isArray(waypoints)) {
      // Filter out invalid waypoints
      const validWaypoints = waypoints.filter(wp => wp && Array.isArray(wp) && wp.length >= 3);
      path.push(...validWaypoints);
    }
    path.push(standPos);
    return path;
  }, [startPos, waypoints, standPos]);

  // Calculate angle to face the box directly
  const faceAngle = useMemo(() => {
    if (!targetCellPos || !Array.isArray(targetCellPos) || targetCellPos.length < 3) return 0;
    if (!standPos || !Array.isArray(standPos) || standPos.length < 3) return 0;
    
    const dx = targetCellPos[0] - standPos[0];
    const dz = targetCellPos[2] - standPos[2];
    
    // Validate values
    if (isNaN(dx) || isNaN(dz) || !isFinite(dx) || !isFinite(dz)) return 0;
    
    const angle = Math.atan2(dx, dz) + Math.PI;
    return isNaN(angle) || !isFinite(angle) ? 0 : angle;
  }, [targetCellPos, standPos]);
  const zShiftSign = isFront ? -1 : 1;

  // segIdx tracks which segment of the path we're currently on
  const anim = useRef({ phase: "idle", t: 0, wp: 0, segIdx: 0, arrivedFired: false });
  const smoothRot = useRef(0);
  const smoothPos = useRef([startPos[0], 0, startPos[2]]);

  // Reset animation when target changes
  useEffect(() => {
    // Validate inputs before resetting
    if (!startPos || !Array.isArray(startPos) || startPos.length < 3) return;
    if (!walkPath || walkPath.length < 2) return;
    
    anim.current = { phase: "idle", t: 0, wp: 0, segIdx: 0, arrivedFired: false, hipBob: 0 };
    smoothPos.current = [startPos[0], 0, startPos[2]];
    if (groupRef.current) {
      groupRef.current.position.set(startPos[0], 0, startPos[2]);
      if (walkPath.length > 1) {
        const nextPt = walkPath[1];
        if (nextPt && Array.isArray(nextPt) && nextPt.length >= 3) {
          const dx = nextPt[0] - startPos[0];
          const dz = nextPt[2] - startPos[2];
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist > 0.001) {
            smoothRot.current = Math.atan2(dx, dz) + Math.PI;
            groupRef.current.rotation.y = smoothRot.current;
          }
        }
      }
    }
  }, [targetCellPos[0], targetCellPos[1], targetCellPos[2], startPos[0], startPos[1], startPos[2]]);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    
    // Validate delta to prevent glitches from invalid frame times
    if (!delta || isNaN(delta) || !isFinite(delta) || delta <= 0 || delta > 1) {
      // Skip frame if delta is invalid (cap at 1 second max)
      return;
    }
    
    const a = anim.current;
    a.t += delta;
    const clk = state.clock.elapsedTime;

    /* ── Realistic walk cycle helper ── */
    const applyWalkCycle = (time, speed) => {
      const cycle = time * speed;
      const legSwing = Math.sin(cycle) * 0.45;
      const armSwing = Math.sin(cycle) * 0.3;
      const hipBob = Math.abs(Math.sin(cycle)) * 0.008;
      const shoulderTilt = Math.sin(cycle) * 0.04;

      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
      if (leftFootRef.current) leftFootRef.current.rotation.x = Math.max(0, -legSwing) * 0.5;
      if (rightFootRef.current) rightFootRef.current.rotation.x = Math.max(0, legSwing) * 0.5;
      if (leftArmRef.current) leftArmRef.current.rotation.x = needsLadder ? 0.45 : -armSwing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = needsLadder ? 0.45 : armSwing;
      if (headRef.current) headRef.current.rotation.x = Math.sin(cycle * 2) * 0.015;
      // Store hip bob separately to avoid conflicts
      a.hipBob = hipBob;
      if (torsoRef.current) torsoRef.current.rotation.z = shoulderTilt;
    };

    /* ── Helper: reset all limbs to rest ── */
    const resetLimbs = () => {
      [leftLegRef, rightLegRef, leftArmRef, rightArmRef].forEach((r) => {
        if (r.current) r.current.rotation.x = 0;
      });
      if (leftFootRef.current) leftFootRef.current.rotation.x = 0;
      if (rightFootRef.current) rightFootRef.current.rotation.x = 0;
      if (torsoRef.current) torsoRef.current.rotation.z = 0;
      if (headRef.current) headRef.current.rotation.x = 0;
    };

    if (a.phase === "idle") {
      // Safety check for valid path
      if (!walkPath || walkPath.length < 2) return;
      if (!startPos || !Array.isArray(startPos) || startPos.length < 3) return;
      
      smoothPos.current = [startPos[0], 0, startPos[2]];
      g.position.set(smoothPos.current[0], smoothPos.current[1], smoothPos.current[2]);
      // Face towards first waypoint / standPos
      const nextPt = walkPath[1];
      if (nextPt && Array.isArray(nextPt) && nextPt.length >= 3) {
        const dx = nextPt[0] - startPos[0];
        const dz = nextPt[2] - startPos[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.001) {
          smoothRot.current = Math.atan2(dx, dz) + Math.PI;
          g.rotation.y = smoothRot.current;
        }
      }
      if (a.t > 0.35) { a.phase = "walk"; a.t = 0; a.wp = 0; a.segIdx = 0; a.hipBob = 0; }
      return;
    }

    if (a.phase === "walk") {
      // Safety check for valid path
      if (!walkPath || walkPath.length < 2) {
        a.phase = "turn";
        a.t = 0;
        return;
      }
      
      const seg = a.segIdx;
      if (seg >= walkPath.length - 1) {
        // Safety check: if we're past the last segment, transition to turn
        a.phase = "turn";
        a.t = 0;
        smoothPos.current[1] = 0;
        g.position.y = 0;
        resetLimbs();
        if (!a.arrivedFired && onArrived) { a.arrivedFired = true; onArrived(); }
        return;
      }

      const from = walkPath[seg];
      const to = walkPath[seg + 1];
      if (!from || !Array.isArray(from) || from.length < 3 || 
          !to || !Array.isArray(to) || to.length < 3) {
        a.phase = "turn";
        a.t = 0;
        return;
      }

      const dx = to[0] - from[0];
      const dz = to[2] - from[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      // Skip very short segments to avoid glitching
      if (dist < 0.01 && seg + 1 < walkPath.length - 1) {
        a.segIdx += 1;
        a.wp = 0;
        return;
      }

      const walkSpeed = 2.2;
      a.wp = Math.min(a.wp + (walkSpeed * delta) / Math.max(dist, 0.01), 1);
      const p = a.wp;

      // Smooth easing per segment
      const isFirstSeg = seg === 0;
      const isLastSeg = seg === walkPath.length - 2;
      let ease;
      if (isFirstSeg && isLastSeg) {
        // Only one segment – full ease in/out
        ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      } else if (isFirstSeg) {
        // Ease in at start
        ease = p < 0.3 ? (p / 0.3) * (p / 0.3) * 0.3 : 0.3 + (p - 0.3) / 0.7 * 0.7;
      } else if (isLastSeg) {
        // Ease out at end
        ease = p < 0.7 ? p / 0.7 * 0.7 : 0.7 + (1 - Math.pow(1 - (p - 0.7) / 0.3, 2)) * 0.3;
      } else {
        // Middle segments – linear
        ease = p;
      }

      applyWalkCycle(clk, 10);

      // Calculate target position
      const targetX = from[0] + dx * ease;
      const targetZ = from[2] + dz * ease;
      const targetY = (a.hipBob || 0);

      // Smooth position interpolation to prevent glitching
      const posLerpSpeed = 15.0; // Higher = faster, smoother interpolation
      const lerpFactor = Math.min(1, posLerpSpeed * delta);
      smoothPos.current[0] += (targetX - smoothPos.current[0]) * lerpFactor;
      smoothPos.current[1] = targetY; // Y follows hip bob directly
      smoothPos.current[2] += (targetZ - smoothPos.current[2]) * lerpFactor;

      // Validate position values to prevent NaN
      if (isNaN(smoothPos.current[0]) || isNaN(smoothPos.current[2])) {
        smoothPos.current[0] = targetX;
        smoothPos.current[2] = targetZ;
      }

      g.position.set(smoothPos.current[0], smoothPos.current[1], smoothPos.current[2]);

      // Calculate target rotation (only if there's meaningful movement)
      if (dist > 0.001) {
        const targetRot = Math.atan2(dx, dz) + Math.PI;
        
        // Normalize angle difference for smooth rotation
        let rotDiff = targetRot - smoothRot.current;
        if (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        if (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        
        // Smooth rotation interpolation
        const rotLerpSpeed = 8.0; // Rotation smoothing speed
        smoothRot.current += rotDiff * Math.min(1, rotLerpSpeed * delta);
        
        // Validate rotation to prevent NaN
        if (isNaN(smoothRot.current)) {
          smoothRot.current = targetRot;
        }
      }
      g.rotation.y = smoothRot.current;

      if (p >= 1) {
        // Move to next segment or finish walking
        if (seg + 1 < walkPath.length - 1) {
          a.segIdx += 1;
          a.wp = 0;
          // Snap to exact position at waypoint to prevent drift
          smoothPos.current = [to[0], 0, to[2]];
        } else {
          a.phase = "turn";
          a.t = 0;
          smoothPos.current[1] = 0;
          g.position.y = 0;
          resetLimbs();
          if (!a.arrivedFired && onArrived) { a.arrivedFired = true; onArrived(); }
        }
      }
      return;
    }

    if (a.phase === "turn") {
      // Validate faceAngle
      if (isNaN(faceAngle) || !isFinite(faceAngle)) {
        // Fallback to current rotation if faceAngle is invalid
        a.phase = needsLadder ? "placeLadder" : needsBend ? "bendReach" : "reach";
        a.t = 0;
        return;
      }
      
      if (a.turnFrom == null) {
        // Use current rotation as starting point for smooth transition
        a.turnFrom = smoothRot.current;
        // Validate turnFrom
        if (isNaN(a.turnFrom) || !isFinite(a.turnFrom)) {
          a.turnFrom = faceAngle;
        }
      }
      const p = Math.min(a.t / 0.4, 1);
      const ease = 1 - Math.pow(1 - p, 2);
      let diff = faceAngle - a.turnFrom;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      
      // Smooth rotation interpolation
      smoothRot.current = a.turnFrom + diff * ease;
      // Validate rotation
      if (isNaN(smoothRot.current) || !isFinite(smoothRot.current)) {
        smoothRot.current = faceAngle;
      }
      g.rotation.y = smoothRot.current;
      
      // Small weight shift during turn
      if (torsoRef.current) torsoRef.current.rotation.z = Math.sin(p * Math.PI) * 0.03;
      if (p >= 1) {
        smoothRot.current = faceAngle;
        g.rotation.y = faceAngle;
        a.turnFrom = null;
        if (torsoRef.current) torsoRef.current.rotation.z = 0;
        a.phase = needsLadder ? "placeLadder" : needsBend ? "bendReach" : "reach";
        a.t = 0;
      }
      return;
    }

    if (a.phase === "bendReach") {
      const p = Math.min(a.t / 1.0, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      if (torsoRef.current) {
        torsoRef.current.rotation.x = -bendAngle * ease;
      }
      const armTarget = 0.6 + bendAngle * 0.2;
      if (leftArmRef.current) leftArmRef.current.rotation.x = armTarget * ease;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armTarget * ease;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0.15 * ease;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.15 * ease;
      if (p >= 1) { a.phase = "done"; a.t = 0; }
      return;
    }

    if (a.phase === "placeLadder") {
      const p = Math.min(a.t / 0.7, 1);
      const ease = 1 - Math.pow(1 - p, 2);
      if (carriedLadderRef.current) carriedLadderRef.current.visible = (p < 0.15);
      if (placedLadderRef.current) {
        placedLadderRef.current.visible = (p >= 0.15);
        const tgtAngle = isFront ? -LADDER_LEAN : LADDER_LEAN;
        placedLadderRef.current.rotation.x = tgtAngle * ease;
      }
      const armPush = (Math.PI * 0.35) * (p < 0.5 ? p * 2 : 2 - p * 2);
      if (leftArmRef.current) leftArmRef.current.rotation.x = armPush;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armPush;
      if (p >= 1) {
        a.phase = "climb";
        a.t = 0;
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
      }
      return;
    }

    if (a.phase === "climb") {
      if (carriedLadderRef.current) carriedLadderRef.current.visible = false;
      const info = ladderInfo;
      if (!info || !standPos || !Array.isArray(standPos) || standPos.length < 3) { 
        a.phase = "reach"; 
        a.t = 0; 
        return; 
      }
      
      // Validate ladder info values
      if (isNaN(info.climbTarget) || isNaN(info.climbZShift)) {
        a.phase = "reach";
        a.t = 0;
        return;
      }
      
      const dur = 1.0 + info.climbTarget * 0.6;
      if (dur <= 0) {
        a.phase = "reach";
        a.t = 0;
        return;
      }
      
      const p = Math.min(a.t / dur, 1);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      
      // Smooth position interpolation for climbing
      const targetY = info.climbTarget * ease;
      const targetZ = standPos[2] + zShiftSign * info.climbZShift * ease;
      const climbLerpSpeed = 12.0;
      smoothPos.current[1] += (targetY - smoothPos.current[1]) * Math.min(1, climbLerpSpeed * delta);
      smoothPos.current[2] += (targetZ - smoothPos.current[2]) * Math.min(1, climbLerpSpeed * delta);
      
      // Validate position values
      if (isNaN(smoothPos.current[1]) || isNaN(smoothPos.current[2])) {
        smoothPos.current[1] = targetY;
        smoothPos.current[2] = targetZ;
      }
      
      g.position.set(smoothPos.current[0], smoothPos.current[1], smoothPos.current[2]);
      
      const armEaseIn = Math.min(1, a.t / 0.3);
      const baseArm = 0.85 * armEaseIn;
      if (p < 1) {
        const step = Math.sin(clk * 8) * 0.35;
        if (leftLegRef.current) leftLegRef.current.rotation.x = step;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -step;
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = p < 1 ? baseArm + Math.sin(clk * 8 + Math.PI) * 0.15 * armEaseIn : 0.85;
      if (rightArmRef.current) rightArmRef.current.rotation.x = p < 1 ? baseArm + Math.sin(clk * 8) * 0.15 * armEaseIn : 0.85;
      if (p >= 1) {
        a.phase = "reach";
        a.t = 0;
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        // Snap to final position to prevent drift
        smoothPos.current[1] = info.climbTarget;
        smoothPos.current[2] = standPos[2] + zShiftSign * info.climbZShift;
      }
      return;
    }

    if (a.phase === "reach") {
      if (carriedLadderRef.current) carriedLadderRef.current.visible = false;
      if (torsoRef.current) torsoRef.current.rotation.x = 0;
      
      // Validate targetCellPos
      if (!targetCellPos || !Array.isArray(targetCellPos) || targetCellPos.length < 3) {
        a.phase = "done";
        a.t = 0;
        return;
      }
      
      const p = Math.min(a.t / 0.8, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const armWorldY = g.position.y + 0.76 * PERSON_SCALE;
      const vDiff = targetCellPos[1] - armWorldY;
      const hDist = 0.35;
      const pointAngle = (Math.PI / 2) + Math.atan2(vDiff, hDist);
      
      // Validate angle
      if (isNaN(pointAngle) || !isFinite(pointAngle)) {
        a.phase = "done";
        a.t = 0;
        return;
      }
      
      const finalAngle = needsLadder
        ? Math.max(pointAngle, Math.PI * 0.35)
        : Math.max(pointAngle, Math.PI * 0.45);
      const fromR = needsLadder ? 0.85 : 0;
      const fromL = needsLadder ? 0.85 : 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = fromR + (finalAngle - fromR) * ease;
      if (leftArmRef.current) leftArmRef.current.rotation.x = fromL + (finalAngle - fromL) * ease;
      if (p >= 1) { a.phase = "done"; a.t = 0; }
      return;
    }

    if (a.phase === "done") {
      const baseY = needsLadder && ladderInfo && !isNaN(ladderInfo.climbTarget) 
        ? ladderInfo.climbTarget 
        : 0;
      const targetY = baseY + Math.sin(clk * 2) * 0.004;
      // Smooth Y position for idle breathing animation
      smoothPos.current[1] += (targetY - smoothPos.current[1]) * Math.min(1, 8.0 * delta);
      
      // Validate position values
      if (isNaN(smoothPos.current[0]) || isNaN(smoothPos.current[1]) || isNaN(smoothPos.current[2])) {
        smoothPos.current[0] = g.position.x || 0;
        smoothPos.current[1] = targetY;
        smoothPos.current[2] = g.position.z || 0;
      }
      
      g.position.set(smoothPos.current[0], smoothPos.current[1], smoothPos.current[2]);
      if (needsBend && torsoRef.current && !isNaN(bendAngle)) {
        torsoRef.current.rotation.x = -bendAngle;
      }
    }
  });

  /* ── Person color palette ── */
  const HAIR = "#8B4513";         // brown hair
  const SKIN = "#FDBCB4";         // skin tone
  const JACKET = "#2C5282";       // blue work jacket/shirt
  const JACKET_LAPEL = "#2C5282"; // same as jacket (no lapel for casual)
  const SHIRT = "#4A90E2";        // light blue shirt
  const TIE = "#2C5282";          // blue (no tie for casual)
  const PANTS = "#D4A574";         // khaki/tan pants
  const SHOES = "#654321";         // brown shoes

  return (
    <>
      <group ref={groupRef} position={startPos} scale={[PERSON_SCALE, PERSON_SCALE, PERSON_SCALE]}>
        {/* Shadow on floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <circleGeometry args={[0.12, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.18} />
        </mesh>

        {/* ── Left leg ── */}
        <group ref={leftLegRef} position={[-0.04, 0.42, 0]}>
          {/* Upper leg (thigh) */}
          <mesh position={[0, -0.10, 0]} castShadow>
            <boxGeometry args={[0.058, 0.20, 0.058]} />
            <meshStandardMaterial color={PANTS} roughness={0.75} />
          </mesh>
          {/* Lower leg (shin) */}
          <mesh position={[0, -0.26, 0]} castShadow>
            <boxGeometry args={[0.052, 0.16, 0.052]} />
            <meshStandardMaterial color={PANTS} roughness={0.75} />
          </mesh>
          {/* Shoe */}
          <group ref={leftFootRef} position={[0, -0.36, 0]}>
            <mesh position={[0, -0.015, 0.018]} castShadow>
              <boxGeometry args={[0.062, 0.035, 0.095]} />
              <meshStandardMaterial color={SHOES} roughness={0.3} metalness={0.15} />
            </mesh>
            {/* Shoe sole */}
            <mesh position={[0, -0.032, 0.018]}>
              <boxGeometry args={[0.065, 0.008, 0.098]} />
              <meshStandardMaterial color="#333" roughness={0.9} />
            </mesh>
          </group>
        </group>

        {/* ── Right leg ── */}
        <group ref={rightLegRef} position={[0.04, 0.42, 0]}>
          <mesh position={[0, -0.10, 0]} castShadow>
            <boxGeometry args={[0.058, 0.20, 0.058]} />
            <meshStandardMaterial color={PANTS} roughness={0.75} />
          </mesh>
          <mesh position={[0, -0.26, 0]} castShadow>
            <boxGeometry args={[0.052, 0.16, 0.052]} />
            <meshStandardMaterial color={PANTS} roughness={0.75} />
          </mesh>
          <group ref={rightFootRef} position={[0, -0.36, 0]}>
            <mesh position={[0, -0.015, 0.018]} castShadow>
              <boxGeometry args={[0.062, 0.035, 0.095]} />
              <meshStandardMaterial color={SHOES} roughness={0.3} metalness={0.15} />
            </mesh>
            <mesh position={[0, -0.032, 0.018]}>
              <boxGeometry args={[0.065, 0.008, 0.098]} />
              <meshStandardMaterial color="#333" roughness={0.9} />
            </mesh>
          </group>
        </group>

        {/* ── Upper body (torso group) ── */}
        <group ref={torsoRef} position={[0, 0.43, 0]}>

          {/* ── Head ── */}
          <group ref={headRef} position={[0, 0.45, 0]}>
            {/* Head / face */}
            <mesh castShadow>
              <sphereGeometry args={[0.072, 16, 12]} />
              <meshStandardMaterial color={SKIN} roughness={0.8} />
            </mesh>
            {/* Ears */}
            <mesh position={[-0.072, -0.01, 0]} castShadow>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshStandardMaterial color={SKIN} roughness={0.8} />
            </mesh>
            <mesh position={[0.072, -0.01, 0]} castShadow>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshStandardMaterial color={SKIN} roughness={0.8} />
            </mesh>
            {/* Neck */}
            <mesh position={[0, -0.065, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.028, 0.04, 8]} />
              <meshStandardMaterial color={SKIN} roughness={0.8} />
            </mesh>
          </group>

          {/* ── Casual work shirt ── */}
          {/* Main shirt body */}
          <mesh position={[0, 0.19, 0]} castShadow>
            <boxGeometry args={[0.17, 0.30, 0.095]} />
            <meshStandardMaterial color={JACKET} roughness={0.7} metalness={0.0} />
          </mesh>
          {/* Shirt shoulders */}
          <mesh position={[0, 0.30, 0]} castShadow>
            <boxGeometry args={[0.20, 0.06, 0.098]} />
            <meshStandardMaterial color={JACKET} roughness={0.7} metalness={0.0} />
          </mesh>
          {/* Shirt collar visible at front */}
          <mesh position={[0, 0.24, 0.048]}>
            <planeGeometry args={[0.06, 0.18]} />
            <meshStandardMaterial color={SHIRT} roughness={0.7} />
          </mesh>
          {/* Belt line */}
          <mesh position={[0, 0.04, 0]} castShadow>
            <boxGeometry args={[0.172, 0.022, 0.097]} />
            <meshStandardMaterial color="#8B7355" roughness={0.5} metalness={0.1} />
          </mesh>
          {/* Belt buckle */}
          <mesh position={[0, 0.04, 0.05]}>
            <boxGeometry args={[0.02, 0.018, 0.005]} />
            <meshStandardMaterial color="#B8860B" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Shirt buttons */}
          <mesh position={[0, 0.16, 0.049]}>
            <sphereGeometry args={[0.005, 6, 6]} />
            <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.10, 0.049]}>
            <sphereGeometry args={[0.005, 6, 6]} />
            <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Shirt pocket */}
          <mesh position={[-0.05, 0.25, 0.049]}>
            <planeGeometry args={[0.03, 0.04]} />
            <meshStandardMaterial color={JACKET} roughness={0.7} />
          </mesh>

          {/* ── Left arm ── */}
          <group ref={leftArmRef} position={[-0.115, 0.30, 0]}>
            {/* Upper arm (shirt sleeve) */}
            <mesh position={[0, -0.09, 0]} castShadow>
              <boxGeometry args={[0.048, 0.16, 0.048]} />
              <meshStandardMaterial color={JACKET} roughness={0.7} metalness={0.0} />
            </mesh>
            {/* Lower arm (shirt sleeve) */}
            <mesh position={[0, -0.20, 0]} castShadow>
              <boxGeometry args={[0.042, 0.10, 0.042]} />
              <meshStandardMaterial color={JACKET} roughness={0.7} metalness={0.0} />
            </mesh>
            {/* Shirt cuff visible */}
            <mesh position={[0, -0.245, 0]} castShadow>
              <boxGeometry args={[0.044, 0.012, 0.044]} />
              <meshStandardMaterial color={SHIRT} roughness={0.6} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -0.27, 0]} castShadow>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshStandardMaterial color={SKIN} roughness={0.8} />
            </mesh>
          </group>

          {/* ── Right arm ── */}
          <group ref={rightArmRef} position={[0.115, 0.30, 0]}>
            <mesh position={[0, -0.09, 0]} castShadow>
              <boxGeometry args={[0.048, 0.16, 0.048]} />
              <meshStandardMaterial color={JACKET} roughness={0.7} metalness={0.0} />
            </mesh>
            <mesh position={[0, -0.20, 0]} castShadow>
              <boxGeometry args={[0.042, 0.10, 0.042]} />
              <meshStandardMaterial color={JACKET} roughness={0.7} metalness={0.0} />
            </mesh>
            <mesh position={[0, -0.245, 0]} castShadow>
              <boxGeometry args={[0.044, 0.012, 0.044]} />
              <meshStandardMaterial color={SHIRT} roughness={0.6} />
            </mesh>
            <mesh position={[0, -0.27, 0]} castShadow>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshStandardMaterial color={SKIN} roughness={0.8} />
            </mesh>
          </group>

          {/* Carried ladder (when walking to rack) */}
          {needsLadder && ladderInfo && (
            <group ref={carriedLadderRef} position={[0.14, -0.23, -0.03]} rotation={[0.08, 0, -0.1]}>
              <LadderMesh height={ladderInfo.length * 0.38} />
            </group>
          )}
        </group>
      </group>

      {/* Placed ladder */}
      {needsLadder && ladderInfo && (
        <group
          ref={placedLadderRef}
          position={standPos}
          rotation={[0, 0, 0]}
          visible={false}
        >
          <LadderMesh height={ladderInfo.length} />
        </group>
      )}
    </>
  );
}

/* ── Realistic Office Room Environment ── */

function OfficeRoom({ totalW, totalH, totalD }) {
  const pad = 5;
  const roomW = totalW + pad * 2;
  const roomD = totalD + 16;
  const roomH = Math.max(totalH + 1.8, 4.5);
  const cx = totalW / 2;

  const wallColor = "#f0ece4";
  const wallColor2 = "#ede8df";
  const trimColor = "#8b7d6b";
  const ceilColor = "#fafaf8";
  const tileColor = "#d4cfc6";

  const lightCount = Math.max(2, Math.ceil(roomW / 3.5));

  return (
    <group>
      {/* Tiled floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.008, 0]} receiveShadow>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color={tileColor} roughness={0.82} metalness={0.02} />
      </mesh>
      <gridHelper
        args={[Math.max(roomW, roomD), Math.floor(Math.max(roomW, roomD) / 0.6), "#bdb8ad", "#c8c3b9"]}
        position={[cx, -0.006, 0]}
      />

      {/* Back wall (-Z) */}
      <mesh position={[cx, roomH / 2, -roomD / 2]}>
        <planeGeometry args={[roomW, roomH]} />
        <meshStandardMaterial color={wallColor} roughness={0.92} />
      </mesh>
      <mesh position={[cx, 0.06, -roomD / 2 + 0.013]}>
        <boxGeometry args={[roomW, 0.12, 0.025]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>

      {/* Left wall */}
      <mesh position={[cx - roomW / 2, roomH / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[roomD, roomH]} />
        <meshStandardMaterial color={wallColor2} roughness={0.92} />
      </mesh>
      <mesh position={[cx - roomW / 2 + 0.013, 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[roomD, 0.12, 0.025]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>

      {/* Right wall */}
      <mesh position={[cx + roomW / 2, roomH / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[roomD, roomH]} />
        <meshStandardMaterial color={wallColor2} roughness={0.92} />
      </mesh>
      <mesh position={[cx + roomW / 2 - 0.013, 0.06, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[roomD, 0.12, 0.025]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>

      {/* Ceiling panel */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, roomH, 0]}>
        <planeGeometry args={[roomW, roomD]} />
        <meshStandardMaterial color={ceilColor} roughness={0.95} />
      </mesh>

      {/* Ceiling fluorescent light fixtures */}
      {Array.from({ length: lightCount }, (_, i) => {
        const lx = cx - roomW / 2 + roomW / (lightCount + 1) * (i + 1);
        return (
          <group key={`cfl-${i}`} position={[lx, roomH - 0.025, 0]}>
            <mesh>
              <boxGeometry args={[1.2, 0.045, 0.32]} />
              <meshStandardMaterial color="#e2e2e2" metalness={0.3} roughness={0.4} />
            </mesh>
            <mesh position={[0, -0.026, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.1, 0.26]} />
              <meshStandardMaterial color="#ffffff" emissive="#fffde8" emissiveIntensity={0.5} />
            </mesh>
          </group>
        );
      })}
      <pointLight position={[cx - roomW / 4, roomH - 0.15, 0]} intensity={0.25} distance={roomH * 2.5} color="#fff8e7" />
      <pointLight position={[cx + roomW / 4, roomH - 0.15, 0]} intensity={0.25} distance={roomH * 2.5} color="#fff8e7" />

      {/* Windows on the left wall */}
      {[0.3, 0.65].map((frac, i) => {
        const wz = -roomD / 2 + roomD * frac;
        const wx = cx - roomW / 2 + 0.025;
        const wy = roomH * 0.55;
        return (
          <group key={`win-${i}`} position={[wx, wy, wz]} rotation={[0, Math.PI / 2, 0]}>
            <mesh>
              <boxGeometry args={[1.5, 1.3, 0.06]} />
              <meshStandardMaterial color={trimColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.015]}>
              <planeGeometry args={[1.35, 1.15]} />
              <meshStandardMaterial color="#c8e8ff" transparent opacity={0.3} roughness={0.1} metalness={0.15} />
            </mesh>
            <mesh position={[0, 0, 0.035]}>
              <boxGeometry args={[0.03, 1.2, 0.02]} />
              <meshStandardMaterial color={trimColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.035]}>
              <boxGeometry args={[1.4, 0.03, 0.02]} />
              <meshStandardMaterial color={trimColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.68, 0.04]}>
              <boxGeometry args={[1.55, 0.04, 0.1]} />
              <meshStandardMaterial color="#d4cfc6" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      <directionalLight position={[cx - roomW / 2 - 3, roomH * 0.8, -roomD * 0.1]} intensity={0.35} color="#fff8e0" />

      {/* Clock on the back wall */}
      <group position={[cx, roomH * 0.82, -roomD / 2 + 0.025]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 32]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.22, 0.018, 8, 32]} />
          <meshStandardMaterial color="#5a5a5a" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.024, 0.04]} rotation={[0, 0, -0.8]}>
          <boxGeometry args={[0.015, 0.12, 0.005]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0, 0.024, 0.03]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.01, 0.16, 0.005]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>

      {/* Bulletin board on the back wall */}
      <group position={[cx + roomW / 5, roomH * 0.6, -roomD / 2 + 0.02]}>
        <mesh>
          <boxGeometry args={[1.0, 0.7, 0.035]} />
          <meshStandardMaterial color="#c49a6c" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.019]}>
          <planeGeometry args={[0.9, 0.6]} />
          <meshStandardMaterial color="#c8a86e" roughness={0.95} />
        </mesh>
        <mesh position={[-0.18, 0.08, 0.022]}>
          <planeGeometry args={[0.22, 0.3]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        <mesh position={[0.2, -0.06, 0.022]}>
          <planeGeometry args={[0.2, 0.24]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.9} />
        </mesh>
        <mesh position={[0.05, 0.16, 0.022]}>
          <planeGeometry args={[0.15, 0.12]} />
          <meshStandardMaterial color="#dbeafe" roughness={0.9} />
        </mesh>
      </group>

      {/* "RECORDS ROOM" sign */}
      <Billboard position={[cx, roomH * 0.92, -roomD / 2 + 0.05]}>
        <Text fontSize={0.22} color="#374151" anchorX="center" fontWeight="bold" letterSpacing={0.12}>
          RECORDS ROOM
        </Text>
      </Billboard>

      {/* Fire extinguisher on the right wall */}
      <group position={[cx + roomW / 2 - 0.06, 0.65, totalD / 2 + 1.5]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <cylinderGeometry args={[0.065, 0.065, 0.42, 12]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.025, 0.038, 0.08, 8]} />
          <meshStandardMaterial color="#555" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[0.2, 0.06, 0.02]} />
          <meshStandardMaterial color="#888" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>

      {/* Desk area with monitor & chair */}
      <group position={[cx + roomW / 2 - 2, 0, totalD / 2 + 4]}>
        <mesh position={[0, 0.73, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.045, 0.65]} />
          <meshStandardMaterial color="#92610a" roughness={0.55} metalness={0.05} />
        </mesh>
        {[[-0.6, 0.365, -0.28], [0.6, 0.365, -0.28], [-0.6, 0.365, 0.28], [0.6, 0.365, 0.28]].map((p, i) => (
          <mesh key={`dleg-${i}`} position={p} castShadow>
            <boxGeometry args={[0.04, 0.73, 0.04]} />
            <meshStandardMaterial color="#6b5210" roughness={0.6} />
          </mesh>
        ))}
        <mesh position={[0.3, 0.48, -0.3]}>
          <boxGeometry args={[0.55, 0.48, 0.03]} />
          <meshStandardMaterial color="#7a540e" roughness={0.6} />
        </mesh>
        {[0.58, 0.42].map((y, i) => (
          <mesh key={`dh-${i}`} position={[0.3, y, -0.318]}>
            <boxGeometry args={[0.12, 0.015, 0.015]} />
            <meshStandardMaterial color="#b8a080" metalness={0.3} roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 1.06, -0.12]} castShadow>
          <boxGeometry args={[0.55, 0.38, 0.025]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.06, -0.106]}>
          <planeGeometry args={[0.49, 0.32]} />
          <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.12} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.84, -0.12]}>
          <boxGeometry args={[0.06, 0.1, 0.04]} />
          <meshStandardMaterial color="#333" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.77, -0.12]}>
          <boxGeometry args={[0.2, 0.018, 0.14]} />
          <meshStandardMaterial color="#333" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.765, 0.1]}>
          <boxGeometry args={[0.36, 0.012, 0.13]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.6} />
        </mesh>
        <mesh position={[0.3, 0.762, 0.1]}>
          <boxGeometry args={[0.05, 0.018, 0.08]} />
          <meshStandardMaterial color="#333" roughness={0.4} />
        </mesh>
        <group position={[-0.5, 0.8, 0.15]}>
          <mesh>
            <cylinderGeometry args={[0.035, 0.03, 0.08, 12]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
          </mesh>
          <mesh position={[0.045, 0, 0]}>
            <torusGeometry args={[0.022, 0.006, 6, 12, Math.PI]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
          </mesh>
        </group>
        <group position={[0, 0, 0.5]}>
          <mesh position={[0, 0.44, 0]}>
            <boxGeometry args={[0.42, 0.055, 0.4]} />
            <meshStandardMaterial color="#1f2937" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.68, -0.18]}>
            <boxGeometry args={[0.4, 0.44, 0.04]} />
            <meshStandardMaterial color="#1f2937" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.23, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.38, 8]} />
            <meshStandardMaterial color="#555" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.025, 5]} />
            <meshStandardMaterial color="#555" metalness={0.5} roughness={0.3} />
          </mesh>
          {Array.from({ length: 5 }, (_, i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <mesh key={`cw-${i}`} position={[Math.cos(a) * 0.18, 0.015, Math.sin(a) * 0.18]}>
                <sphereGeometry args={[0.018, 6, 6]} />
                <meshStandardMaterial color="#444" metalness={0.4} roughness={0.4} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* Potted plant near the left wall */}
      <group position={[cx - roomW / 2 + 0.65, 0, totalD / 2 + 4]}>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.13, 0.1, 0.32, 12]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 12]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.22, 6]} />
          <meshStandardMaterial color="#65a30d" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.58, 0]}>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
        <mesh position={[0.1, 0.72, 0.05]}>
          <sphereGeometry args={[0.13, 8, 6]} />
          <meshStandardMaterial color="#22c55e" roughness={0.8} />
        </mesh>
        <mesh position={[-0.08, 0.68, -0.05]}>
          <sphereGeometry args={[0.11, 8, 6]} />
          <meshStandardMaterial color="#15803d" roughness={0.8} />
        </mesh>
      </group>

      {/* Filing cabinet near the back wall */}
      <group position={[cx - roomW / 4, 0, -roomD / 2 + 0.35]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <boxGeometry args={[0.5, 1.3, 0.55]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.4} roughness={0.35} />
        </mesh>
        {[0.28, 0.6, 0.92].map((y, i) => (
          <React.Fragment key={`fc-${i}`}>
            <mesh position={[0, y, 0.28]}>
              <boxGeometry args={[0.44, 0.005, 0.01]} />
              <meshStandardMaterial color="#6b7280" />
            </mesh>
            <mesh position={[0, y + 0.1, 0.29]}>
              <boxGeometry args={[0.1, 0.02, 0.02]} />
              <meshStandardMaterial color="#d1d5db" metalness={0.5} roughness={0.3} />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* Water cooler near the right wall */}
      <group position={[cx + roomW / 2 - 0.5, 0, -totalD / 2 - 1.5]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.32, 0.7, 0.32]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.5} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.92, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.5, 12]} />
          <meshStandardMaterial color="#93c5fd" transparent opacity={0.45} roughness={0.1} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.65, 0.17]}>
          <boxGeometry args={[0.06, 0.04, 0.04]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.4} roughness={0.3} />
        </mesh>
      </group>

      {/* Door on the right wall */}
      <group position={[cx + roomW / 3.5, 0, roomD / 2 - 0.6]} rotation={[0, 0, 0]}>
        <mesh position={[-0.58, 1.1, 0]}>
          <boxGeometry args={[0.06, 2.2, 0.12]} />
          <meshStandardMaterial color={trimColor} roughness={0.5} />
        </mesh>
        <mesh position={[0.58, 1.1, 0]}>
          <boxGeometry args={[0.06, 2.2, 0.12]} />
          <meshStandardMaterial color={trimColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.22, 0]}>
          <boxGeometry args={[1.22, 0.06, 0.12]} />
          <meshStandardMaterial color={trimColor} roughness={0.5} />
        </mesh>
        <group position={[-0.55, 0, 0]} rotation={[0, 0.3, 0]}>
          <mesh position={[0.52, 1.08, 0]}>
            <boxGeometry args={[1.02, 2.12, 0.06]} />
            <meshStandardMaterial color="#a67c52" roughness={0.5} />
          </mesh>
          {[0.55, 1.43].map((y, i) => (
            <mesh key={`dp-${i}`} position={[0.52, y, -0.035]}>
              <boxGeometry args={[0.72, 0.62, 0.008]} />
              <meshStandardMaterial color="#b8905e" roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[0.94, 0.98, -0.04]}>
            <sphereGeometry args={[0.032, 8, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ── Scene (all racks + environment + interactivity) ── */

function RackScene({ shelfLettersByBay, rowLabels, highlight, viewCmd, onPersonArrived }) {
  const controlsRef = useRef();

  const bays = useMemo(
    () =>
      Object.keys(shelfLettersByBay || {})
        .map(Number)
        .filter((k) => !Number.isNaN(k))
        .sort((a, b) => b - a),
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
    return { bay: highlight.bay, shelfIndex: highlight.shelf - 1, row: highlight.row, box: highlight.box, info: highlight.info || null };
  }, [highlight]);

  const certTheme = useMemo(() => {
    const certType = highlight?.info?.certificateType;
    return (certType && CERT_THEME[certType]) || DEFAULT_THEME;
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

  const targetCellWorldPos = useMemo(() => {
    if (!hlInfo || layout.length === 0) return null;
    const bayItem = layout.find((l) => l.bay === hlInfo.bay);
    if (!bayItem) return null;
    const shelves = shelfLettersByBay[hlInfo.bay] || [];
    const cols = colsForBay(shelves);
    const si = hlInfo.shelfIndex;
    const isFront = si < cols;
    const colIdx = isFront ? si : si - cols;
    const ri = rowKeys.indexOf(hlInfo.row);
    if (ri < 0) return null;
    return [
      bayItem.off + colIdx * CELL_W + CELL_W / 2,
      ri * CELL_H + CELL_H / 2,
      isFront ? (SIDE_GAP / 2 + SIDE_DEPTH / 2) : -(SIDE_GAP / 2 + SIDE_DEPTH / 2),
    ];
  }, [hlInfo, layout, shelfLettersByBay, rowKeys]);

  // Calculate chair position (where person starts)
  const chairPos = useMemo(() => {
    const pad = 5;
    const roomW = totalW + pad * 2;
    const cx = totalW / 2;
    const deskX = cx + roomW / 2 - 2; // Desk group X position
    const chairZ = totalD / 2 + 4.5; // Chair is at [0, 0, 0.5] relative to desk, desk is at totalD/2 + 4
    return [deskX, 0, chairZ];
  }, [totalW, totalD]);

  const personStartPos = useMemo(() => {
    if (!targetCellWorldPos) return null;
    // Person always starts from the chair position
    return chairPos;
  }, [targetCellWorldPos, chairPos]);

  /* Accurate shortest path algorithm: finds the most direct route to the target */
  const personWaypoints = useMemo(() => {
    if (!targetCellWorldPos || !Array.isArray(targetCellWorldPos) || targetCellWorldPos.length < 3) return null;
    if (!personStartPos || !Array.isArray(personStartPos) || personStartPos.length < 3) return null;
    if (!layout || !Array.isArray(layout) || layout.length === 0) return null;
    
    // Validate values
    if (isNaN(targetCellWorldPos[0]) || isNaN(targetCellWorldPos[1]) || isNaN(targetCellWorldPos[2])) return null;
    if (isNaN(personStartPos[0]) || isNaN(personStartPos[1]) || isNaN(personStartPos[2])) return null;
    
    const outerFace = SIDE_GAP / 2 + SIDE_DEPTH;
    // Dynamic margin based on box height - lower boxes allow closer approach
    // This matches the standPos logic but is slightly larger for safe pathfinding
    const boxHeight = targetCellWorldPos[1];
    if (isNaN(boxHeight) || !isFinite(boxHeight)) return null;
    let margin;
    if (boxHeight < 0.5) {
      // Very low boxes - allow closer approach
      margin = 0.25; // slightly larger than standPos (0.15) for safety
    } else if (boxHeight < BEND_THRESHOLD) {
      // Low boxes - interpolate between 0.25 and 0.55
      const t = boxHeight / BEND_THRESHOLD;
      margin = 0.25 + (0.55 - 0.25) * t;
    } else if (boxHeight < LADDER_THRESHOLD) {
      // Middle boxes - interpolate between 0.55 and 0.85
      const t = (boxHeight - BEND_THRESHOLD) / (LADDER_THRESHOLD - BEND_THRESHOLD);
      margin = 0.55 + (0.85 - 0.55) * t;
    } else {
      // High boxes - use reduced margin
      margin = 0.9;
    }
    const personRadius = 0.15; // approximate person radius for collision detection
    const safeDistance = margin + personRadius; // minimum safe distance from rack edges
    const targetX = targetCellWorldPos[0];
    const targetZ = targetCellWorldPos[2];
    const startX = personStartPos[0];
    const startZ = personStartPos[2];
    
    const isTargetFront = targetZ > 0;
    const isStartFront = startZ > 0;
    
    // Helper function to calculate 2D Euclidean distance
    const dist2D = (x1, z1, x2, z2) => {
      const dx = x2 - x1;
      const dz = z2 - z1;
      return Math.sqrt(dx * dx + dz * dz);
    };
    
    // Helper function to check if a point is too close to any rack (collision detection)
    const isPointTooCloseToRack = (x, z) => {
      const rackDepth = SIDE_DEPTH * 2 + SIDE_GAP;
      const rackHalfDepth = rackDepth / 2;
      
      for (const bay of layout) {
        const bayLeft = bay.off;
        const bayRight = bay.off + bay.w;
        
        // Check if point is within rack's X bounds (with safety margin)
        if (x >= bayLeft - safeDistance && x <= bayRight + safeDistance) {
          // Check if point is within rack's Z bounds (front or back face)
          const frontFaceZ = outerFace;
          const backFaceZ = -outerFace;
          
          // Check if too close to front face
          if (z > 0 && z < frontFaceZ + safeDistance && z > frontFaceZ - rackHalfDepth - safeDistance) {
            return true;
          }
          // Check if too close to back face
          if (z < 0 && z > backFaceZ - safeDistance && z < backFaceZ + rackHalfDepth + safeDistance) {
            return true;
          }
        }
      }
      return false;
    };
    
    // Helper function to adjust waypoint to safe distance from racks
    const adjustWaypointForSafety = (x, z) => {
      // Validate inputs
      if (isNaN(x) || isNaN(z) || !isFinite(x) || !isFinite(z)) {
        return [0, 0, 0];
      }
      
      let adjustedX = x;
      let adjustedZ = z;
      const rackDepth = SIDE_DEPTH * 2 + SIDE_GAP;
      const rackHalfDepth = rackDepth / 2;
      
      for (const bay of layout) {
        if (!bay || isNaN(bay.off) || isNaN(bay.w)) continue;
        
        const bayLeft = bay.off;
        const bayRight = bay.off + bay.w;
        
        // Adjust X if too close to rack horizontally
        if (x >= bayLeft - safeDistance && x <= bayRight + safeDistance) {
          // Push away from the nearest rack edge
          const distToLeft = Math.abs(x - bayLeft);
          const distToRight = Math.abs(x - bayRight);
          if (distToLeft < safeDistance) {
            adjustedX = bayLeft - safeDistance;
          } else if (distToRight < safeDistance) {
            adjustedX = bayRight + safeDistance;
          }
        }
        
        // Adjust Z if too close to rack depth-wise
        const frontFaceZ = outerFace;
        const backFaceZ = -outerFace;
        
        if (z > 0) {
          // Front side - ensure safe distance
          if (z < frontFaceZ + safeDistance && z > frontFaceZ - rackHalfDepth - safeDistance) {
            adjustedZ = frontFaceZ + safeDistance;
          }
        } else {
          // Back side - ensure safe distance
          if (z > backFaceZ - safeDistance && z < backFaceZ + rackHalfDepth + safeDistance) {
            adjustedZ = backFaceZ - safeDistance;
          }
        }
      }
      
      // Validate output
      if (isNaN(adjustedX) || isNaN(adjustedZ) || !isFinite(adjustedX) || !isFinite(adjustedZ)) {
        return [x, 0, z]; // Return original if adjustment failed
      }
      
      return [adjustedX, 0, adjustedZ];
    };
    
    // If start and target are on the same side, check if direct path is possible
    const sameSide = isStartFront === isTargetFront;
    let needsWaypoints = !sameSide; // Different sides always need waypoints
    
    if (sameSide) {
      // Check if there's a direct path (no obstacles between start and target)
      const minX = Math.min(startX, targetX);
      const maxX = Math.max(startX, targetX);
      
      // Check if any rack blocks the direct path
      let pathBlocked = false;
      for (const bay of layout) {
        const bayLeft = bay.off;
        const bayRight = bay.off + bay.w;
        // If rack overlaps with the path horizontally, it blocks
        if (bayLeft < maxX && bayRight > minX) {
          pathBlocked = true;
          break;
        }
      }
      
      // If path is clear, verify the direct path doesn't go through any racks
      if (!pathBlocked) {
        // Additional safety check: ensure start and target positions are safe from racks
        if (!isPointTooCloseToRack(startX, startZ) && !isPointTooCloseToRack(targetX, targetZ)) {
          return null; // Direct path is safe, no waypoints needed
        }
        // If positions are too close, we need waypoints after all
        pathBlocked = true;
      }
      
      // Path is blocked, will need to calculate waypoints
      needsWaypoints = true;
    }
    
    // Find gaps between racks (spaces where person can walk through)
    const gaps = [];
    for (let i = 0; i < layout.length - 1; i++) {
      const leftBay = layout[i];
      const rightBay = layout[i + 1];
      const gapStart = leftBay.off + leftBay.w;
      const gapEnd = rightBay.off;
      const gapWidth = gapEnd - gapStart;
      
      if (gapWidth >= 1.0) { // Only consider gaps wide enough to walk through
        gaps.push({
          start: gapStart,
          end: gapEnd,
          width: gapWidth,
        });
      }
    }
    
    // Calculate all possible paths
    const paths = [];
    
    // Option 1: Go around left end
    const leftEndX = -margin;
    const leftFrontZ = outerFace + margin;
    const leftBackZ = -(outerFace + margin);
    
    let leftPathDist = 0;
    let leftWaypoints = [];
    
    if (sameSide) {
      // Same side: go around left end but stay on same side
      const sideZ = isStartFront ? leftFrontZ : leftBackZ;
      // Ensure waypoint is safe distance from racks
      const safeWaypoint = adjustWaypointForSafety(leftEndX, sideZ);
      leftPathDist = dist2D(startX, startZ, safeWaypoint[0], safeWaypoint[2]);
      leftWaypoints.push(safeWaypoint);
      leftPathDist += dist2D(safeWaypoint[0], safeWaypoint[2], targetX, targetZ);
    } else if (isStartFront) {
      // Start on front, go to left end on front, then cross to back
      const safeWaypoint1 = adjustWaypointForSafety(leftEndX, leftFrontZ);
      const safeWaypoint2 = adjustWaypointForSafety(leftEndX, leftBackZ);
      leftPathDist = dist2D(startX, startZ, safeWaypoint1[0], safeWaypoint1[2]);
      leftWaypoints.push(safeWaypoint1);
      leftPathDist += dist2D(safeWaypoint1[0], safeWaypoint1[2], safeWaypoint2[0], safeWaypoint2[2]);
      leftWaypoints.push(safeWaypoint2);
      leftPathDist += dist2D(safeWaypoint2[0], safeWaypoint2[2], targetX, targetZ);
    } else {
      // Start on back, go to left end on back, then cross to front
      const safeWaypoint1 = adjustWaypointForSafety(leftEndX, leftBackZ);
      const safeWaypoint2 = adjustWaypointForSafety(leftEndX, leftFrontZ);
      leftPathDist = dist2D(startX, startZ, safeWaypoint1[0], safeWaypoint1[2]);
      leftWaypoints.push(safeWaypoint1);
      leftPathDist += dist2D(safeWaypoint1[0], safeWaypoint1[2], safeWaypoint2[0], safeWaypoint2[2]);
      leftWaypoints.push(safeWaypoint2);
      leftPathDist += dist2D(safeWaypoint2[0], safeWaypoint2[2], targetX, targetZ);
    }
    
    paths.push({
      waypoints: leftWaypoints,
      distance: leftPathDist,
    });
    
    // Option 2: Go around right end
    const rightEndX = totalW + margin;
    const rightFrontZ = outerFace + margin;
    const rightBackZ = -(outerFace + margin);
    
    let rightPathDist = 0;
    let rightWaypoints = [];
    
    if (sameSide) {
      // Same side: go around right end but stay on same side
      const sideZ = isStartFront ? rightFrontZ : rightBackZ;
      const safeWaypoint = adjustWaypointForSafety(rightEndX, sideZ);
      rightPathDist = dist2D(startX, startZ, safeWaypoint[0], safeWaypoint[2]);
      rightWaypoints.push(safeWaypoint);
      rightPathDist += dist2D(safeWaypoint[0], safeWaypoint[2], targetX, targetZ);
    } else if (isStartFront) {
      // Start on front, go to right end on front, then cross to back
      const safeWaypoint1 = adjustWaypointForSafety(rightEndX, rightFrontZ);
      const safeWaypoint2 = adjustWaypointForSafety(rightEndX, rightBackZ);
      rightPathDist = dist2D(startX, startZ, safeWaypoint1[0], safeWaypoint1[2]);
      rightWaypoints.push(safeWaypoint1);
      rightPathDist += dist2D(safeWaypoint1[0], safeWaypoint1[2], safeWaypoint2[0], safeWaypoint2[2]);
      rightWaypoints.push(safeWaypoint2);
      rightPathDist += dist2D(safeWaypoint2[0], safeWaypoint2[2], targetX, targetZ);
    } else {
      // Start on back, go to right end on back, then cross to front
      const safeWaypoint1 = adjustWaypointForSafety(rightEndX, rightBackZ);
      const safeWaypoint2 = adjustWaypointForSafety(rightEndX, rightFrontZ);
      rightPathDist = dist2D(startX, startZ, safeWaypoint1[0], safeWaypoint1[2]);
      rightWaypoints.push(safeWaypoint1);
      rightPathDist += dist2D(safeWaypoint1[0], safeWaypoint1[2], safeWaypoint2[0], safeWaypoint2[2]);
      rightWaypoints.push(safeWaypoint2);
      rightPathDist += dist2D(safeWaypoint2[0], safeWaypoint2[2], targetX, targetZ);
    }
    
    paths.push({
      waypoints: rightWaypoints,
      distance: rightPathDist,
    });
    
    // Option 3: Walk through gaps between racks
    gaps.forEach((gap) => {
      // Find the optimal crossing point within the gap
      // Use the X coordinate closest to the line between start and target
      const gapMinX = gap.start;
      const gapMaxX = gap.end;
      
      // Calculate the X where the line from start to target would cross the gap
      let optimalX = gap.start + gap.width / 2; // Default to midpoint
      
      if (Math.abs(targetZ - startZ) > 0.01) {
        // Calculate where the line from start to target intersects the gap's Z level
        const slope = (targetX - startX) / (targetZ - startZ);
        const currentZ = isStartFront ? outerFace + margin : -(outerFace + margin);
        const interceptX = startX + slope * (currentZ - startZ);
        
        // Clamp to gap bounds
        optimalX = Math.max(gapMinX, Math.min(gapMaxX, interceptX));
      } else {
        // Same Z level, use the X closest to the target
        optimalX = Math.max(gapMinX, Math.min(gapMaxX, targetX));
      }
      
      const gapFrontZ = outerFace + margin;
      const gapBackZ = -(outerFace + margin);
      
      let gapPathDist = 0;
      let gapWaypoints = [];
      
      if (sameSide) {
        // Same side: go through gap but stay on same side
        const sideZ = isStartFront ? gapFrontZ : gapBackZ;
        const safeWaypoint = adjustWaypointForSafety(optimalX, sideZ);
        gapPathDist = dist2D(startX, startZ, safeWaypoint[0], safeWaypoint[2]);
        gapWaypoints.push(safeWaypoint);
        gapPathDist += dist2D(safeWaypoint[0], safeWaypoint[2], targetX, targetZ);
      } else if (isStartFront) {
        // Start on front, go to gap on front, then cross to back
        const safeWaypoint1 = adjustWaypointForSafety(optimalX, gapFrontZ);
        const safeWaypoint2 = adjustWaypointForSafety(optimalX, gapBackZ);
        gapPathDist = dist2D(startX, startZ, safeWaypoint1[0], safeWaypoint1[2]);
        gapWaypoints.push(safeWaypoint1);
        gapPathDist += dist2D(safeWaypoint1[0], safeWaypoint1[2], safeWaypoint2[0], safeWaypoint2[2]);
        gapWaypoints.push(safeWaypoint2);
        gapPathDist += dist2D(safeWaypoint2[0], safeWaypoint2[2], targetX, targetZ);
      } else {
        // Start on back, go to gap on back, then cross to front
        const safeWaypoint1 = adjustWaypointForSafety(optimalX, gapBackZ);
        const safeWaypoint2 = adjustWaypointForSafety(optimalX, gapFrontZ);
        gapPathDist = dist2D(startX, startZ, safeWaypoint1[0], safeWaypoint1[2]);
        gapWaypoints.push(safeWaypoint1);
        gapPathDist += dist2D(safeWaypoint1[0], safeWaypoint1[2], safeWaypoint2[0], safeWaypoint2[2]);
        gapWaypoints.push(safeWaypoint2);
        gapPathDist += dist2D(safeWaypoint2[0], safeWaypoint2[2], targetX, targetZ);
      }
      
      paths.push({
        waypoints: gapWaypoints,
        distance: gapPathDist,
      });
    });
    
    // Find the shortest path
    if (paths.length === 0) return null;
    
    // Filter out invalid paths
    const validPaths = paths.filter(path => 
      path && 
      path.waypoints && 
      Array.isArray(path.waypoints) &&
      path.distance !== undefined &&
      !isNaN(path.distance) &&
      isFinite(path.distance) &&
      path.distance >= 0
    );
    
    if (validPaths.length === 0) return null;
    
    const shortestPath = validPaths.reduce((min, path) => 
      path.distance < min.distance ? path : min
    );
    
    // Validate waypoints before returning
    if (!shortestPath.waypoints || !Array.isArray(shortestPath.waypoints)) return null;
    
    // Filter out invalid waypoints
    const validWaypoints = shortestPath.waypoints.filter(wp => 
      wp && 
      Array.isArray(wp) && 
      wp.length >= 3 &&
      !isNaN(wp[0]) && !isNaN(wp[2]) &&
      isFinite(wp[0]) && isFinite(wp[2])
    );
    
    return validWaypoints.length > 0 ? validWaypoints : null;
  }, [targetCellWorldPos, personStartPos, totalW, layout]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.45} color="#fff8f0" />
      <directionalLight position={[totalW * 0.8, totalH * 3, totalW * 0.6]} intensity={0.6} castShadow shadow-mapSize={[1024, 1024]} color="#fff8e7" />
      <directionalLight position={[-totalW * 0.3, totalH * 2, -totalW * 0.4]} intensity={0.2} color="#e8f0ff" />
      <hemisphereLight skyColor="#f0f0ff" groundColor="#d4cfc6" intensity={0.25} />

      {/* Office room environment */}
      <OfficeRoom totalW={totalW} totalH={totalH} totalD={totalD} />

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
          certTheme={certTheme}
        />
      ))}

      {/* "Front" / "Back" orientation labels */}
      <Billboard position={[totalW / 2, -0.35, totalD / 2 + 0.6]}>
        <Text fontSize={0.14} color="#9ca3af" anchorX="center">Front (S-A / S-C)</Text>
      </Billboard>
      <Billboard position={[totalW / 2, -0.35, -(totalD / 2 + 0.6)]}>
        <Text fontSize={0.14} color="#9ca3af" anchorX="center">Back (S-B / S-D)</Text>
      </Billboard>

      {/* Celebration sparkles around highlighted box */}
      {targetCellWorldPos && hlInfo && (
        <CelebrationSparkles position={targetCellWorldPos} theme={certTheme} />
      )}

      {/* Walking person retrieval animation */}
      {targetCellWorldPos && personStartPos && hlInfo && (
        <WalkingPerson
          key={`person-${hlInfo.bay}-${hlInfo.shelfIndex}-${hlInfo.row}-${hlInfo.box}`}
          targetCellPos={targetCellWorldPos}
          startPos={personStartPos}
          waypoints={personWaypoints}
          onArrived={onPersonArrived}
        />
      )}

      {/* Smooth camera controller */}
      <SmoothCamera
        viewCmd={viewCmd}
        targetCellPos={targetCellWorldPos}
        totalW={totalW}
        totalH={totalH}
        controlsRef={controlsRef}
      />

      {/* Orbit controls */}
      <OrbitControls
        ref={controlsRef}
        target={[totalW / 2, totalH / 2, 0]}
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI * 0.88}
        minDistance={1.5}
        maxDistance={totalW * 3 + 18}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

/* ── SVG Icon components for buttons ── */

const IconFront = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
  </svg>
);
const IconTop = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M12 3v18M3 12h18" />
    <circle cx="12" cy="12" r="8" />
  </svg>
);
const IconSide = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M9 3l-6 6v12h18V9l-6-6H9z" />
    <path d="M9 3v6H3" />
  </svg>
);
const IconFocus = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <circle cx="12" cy="12" r="3" />
    <path d="M3 12h3m12 0h3M12 3v3m0 12v3" />
    <circle cx="12" cy="12" r="8" strokeDasharray="4 2" />
  </svg>
);
const IconReset = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);
const IconFullscreen = ({ active }) => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    {active ? (
      <>
        <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
      </>
    ) : (
      <>
        <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
      </>
    )}
  </svg>
);

/* ── Main export ── */

export default function LocationRack3D({ shelfLettersByBay, rowLabels, highlight, className = "", style = {} }) {
  const containerRef = useRef(null);
  const [viewCmd, setViewCmd] = useState(null);
  const [activeView, setActiveView] = useState("default");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [personArrived, setPersonArrived] = useState(false);

  /* Reset personArrived when highlight changes (new search) */
  const highlightKey = highlight ? `${highlight.bay}-${highlight.shelf}-${highlight.row}-${highlight.box}` : null;
  useEffect(() => {
    setPersonArrived(false);
  }, [highlightKey]);

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

  /* Fullscreen handling */
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  /* Reset cursor on unmount */
  useEffect(() => {
    return () => { document.body.style.cursor = "auto"; };
  }, []);

  /* Camera command helper – also tracks active view for panel positioning */
  const sendViewCmd = useCallback((type) => {
    setViewCmd({ type, id: Date.now() });
    setActiveView(type === "reset" ? "default" : type);
    setShowInfo(true); // re-show info when switching views
  }, []);

  /* Highlight info for the overlay panel */
  const hlInfo = highlight?.info || null;
  const certTheme = useMemo(() => {
    const certType = hlInfo?.certificateType;
    return (certType && CERT_THEME[certType]) || DEFAULT_THEME;
  }, [hlInfo]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-stone-100 to-stone-200 border-2 border-stone-300/60 shadow-inner ${className}`}
      style={{ height: isFullscreen ? "100vh" : 460, ...style }}
    >
      {/* Inject keyframe animations – glow color matches certificate type */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 18px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes slideInSide { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(${certTheme.glowR},${certTheme.glowG},${certTheme.glowB},0.25), 0 0 40px rgba(${certTheme.glowR},${certTheme.glowG},${certTheme.glowB},0.08), inset 0 0 20px rgba(${certTheme.glowR},${certTheme.glowG},${certTheme.glowB},0.05); }
          50% { box-shadow: 0 0 25px rgba(${certTheme.glowR},${certTheme.glowG},${certTheme.glowB},0.45), 0 0 60px rgba(${certTheme.glowR},${certTheme.glowG},${certTheme.glowB},0.15), inset 0 0 30px rgba(${certTheme.glowR},${certTheme.glowG},${certTheme.glowB},0.08); }
        }
        @keyframes panelPop {
          0%   { opacity: 0; transform: translateX(-60px) scale(0.7) rotateY(12deg); filter: blur(8px); }
          30%  { opacity: 0.6; transform: translateX(12px) scale(1.04) rotateY(-2deg); filter: blur(1px); }
          50%  { opacity: 1; transform: translateX(-5px) scale(1.01) rotateY(0.5deg); filter: blur(0); }
          70%  { transform: translateX(2px) scale(1) rotateY(0); }
          85%  { transform: translateX(-1px) scale(1); }
          100% { opacity: 1; transform: translateX(0) scale(1) rotateY(0); filter: blur(0); }
        }
        @keyframes panelCellReveal {
          0%   { opacity: 0; transform: translateY(10px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes panelShine {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes minimizePop {
          0%   { opacity: 0; transform: scale(0.5); filter: blur(4px); }
          60%  { opacity: 1; transform: scale(1.1); filter: blur(0); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <Canvas
        shadows
        camera={{
          position: [totalW / 2, totalH + 2.5, totalW * 0.9 + 4],
          fov: 46,
          near: 0.1,
          far: 300,
        }}
        gl={{ antialias: true }}
      >
        <RackScene
          shelfLettersByBay={shelfLettersByBay}
          rowLabels={rowLabels}
          highlight={highlight}
          viewCmd={viewCmd}
          onPersonArrived={() => setPersonArrived(true)}
        />
      </Canvas>

      {/* ── Camera View Preset Buttons ── */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {[
          { type: "front", label: "Front", Icon: IconFront },
          { type: "top", label: "Top", Icon: IconTop },
          { type: "side", label: "Side", Icon: IconSide },
          ...(highlight ? [{ type: "focus", label: "Focus", Icon: IconFocus }] : []),
          { type: "reset", label: "Reset", Icon: IconReset },
        ].map(({ type, label, Icon }) => {
          const isActive = (type === "reset" && activeView === "default") || activeView === type;
          return (
            <button
              key={type}
              onClick={() => sendViewCmd(type)}
              title={`${label} View`}
              className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all duration-200 backdrop-blur-sm border active:scale-95 ${
                isActive
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-200/50"
                  : "bg-white/80 text-gray-600 hover:bg-white hover:text-emerald-700 hover:shadow-md border-gray-200/60 hover:border-emerald-300"
              }`}
            >
              <Icon />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Fullscreen Toggle ── */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-emerald-700 hover:shadow-md border border-gray-200/60 hover:border-emerald-300 active:scale-95"
      >
        <IconFullscreen active={isFullscreen} />
        <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Expand"}</span>
      </button>

      {/* ── Left-aligned Horizontal Document Info Panel (appears when person arrives) ── */}
      {highlight && hlInfo && showInfo && personArrived && (() => {
        const certName = CERT_NAMES[hlInfo.certificateType] || hlInfo.certificateType;
        const yearText = hlInfo.year ? `${hlInfo.year}${hlInfo.yearTo && hlInfo.yearTo !== hlInfo.year ? `–${hlInfo.yearTo}` : ""}` : "—";
        const monthText = hlInfo.monthIndex != null
          ? (hlInfo.monthIndexTo != null && hlInfo.monthIndexTo !== hlInfo.monthIndex
              ? `${MONTHS[hlInfo.monthIndex]}–${MONTHS[hlInfo.monthIndexTo]}`
              : MONTHS[hlInfo.monthIndex])
          : null;

        return (
          <div
            key={activeView}
            className="absolute z-20 left-4 top-12"
            style={{
              animation: "panelPop 0.7s cubic-bezier(.16,1,.3,1) forwards",
              perspective: "800px",
            }}
          >
            {/* Shine overlay on entrance */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 16, overflow: "hidden", pointerEvents: "none", zIndex: 2,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.18) 55%, transparent 60%)",
                backgroundSize: "200% 100%",
                animation: "panelShine 1.2s 0.5s ease-out forwards",
                backgroundPosition: "-200% 0",
              }} />
            </div>
            <div
              className="flex flex-row items-stretch rounded-2xl overflow-hidden shadow-2xl border border-white/20"
              style={{
                animation: "pulseGlow 2.5s 0.7s ease-in-out infinite",
                backdropFilter: "blur(16px) saturate(1.4)",
                WebkitBackdropFilter: "blur(16px) saturate(1.4)",
                background: "rgba(15, 23, 42, 0.55)",
              }}
            >
              {/* ── Title badge ── */}
              <div
                className="px-5 py-4 flex items-center gap-2.5 shrink-0"
                style={{
                  background: `linear-gradient(to bottom, ${certTheme.panelFrom}, ${certTheme.panelTo})`,
                  animation: "panelCellReveal 0.4s 0.15s cubic-bezier(.16,1,.3,1) both",
                }}
              >
                <svg className="w-6 h-6 text-white shrink-0 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="text-sm font-extrabold text-white tracking-widest whitespace-nowrap drop-shadow">FOUND</span>
              </div>

              {/* ── Certificate type ── */}
              <div
                className="px-5 py-3 border-r border-white/10 hover:bg-emerald-500/20 transition-all duration-200 cursor-default group flex flex-col justify-center"
                style={{ animation: "panelCellReveal 0.4s 0.25s cubic-bezier(.16,1,.3,1) both" }}
              >
                <div className="text-[10px] uppercase tracking-wider text-gray-300 group-hover:text-emerald-300 transition-colors font-semibold leading-none mb-1">Certificate</div>
                <div className="text-base font-bold text-white group-hover:text-emerald-200 transition-colors whitespace-nowrap leading-tight drop-shadow-sm">{certName}</div>
              </div>

              {/* ── Year ── */}
              {hlInfo.year && (
                <div
                  className="px-5 py-3 border-r border-white/10 hover:bg-amber-500/20 transition-all duration-200 cursor-default group flex flex-col justify-center"
                  style={{ animation: "panelCellReveal 0.4s 0.35s cubic-bezier(.16,1,.3,1) both" }}
                >
                  <div className="text-[10px] uppercase tracking-wider text-gray-300 group-hover:text-amber-300 transition-colors font-semibold leading-none mb-1">Year</div>
                  <div className="text-base font-bold text-white group-hover:text-amber-200 transition-colors whitespace-nowrap leading-tight drop-shadow-sm">{yearText}</div>
                </div>
              )}

              {/* ── Month ── */}
              {monthText && (
                <div
                  className="px-5 py-3 border-r border-white/10 hover:bg-pink-500/20 transition-all duration-200 cursor-default group flex flex-col justify-center"
                  style={{ animation: "panelCellReveal 0.4s 0.4s cubic-bezier(.16,1,.3,1) both" }}
                >
                  <div className="text-[10px] uppercase tracking-wider text-gray-300 group-hover:text-pink-300 transition-colors font-semibold leading-none mb-1">Month</div>
                  <div className="text-base font-bold text-white group-hover:text-pink-200 transition-colors whitespace-nowrap leading-tight drop-shadow-sm">{monthText}</div>
                </div>
              )}

              {/* ── Registry ── */}
              {hlInfo.registryRange && (
                <div
                  className="px-5 py-3 border-r border-white/10 hover:bg-blue-500/20 transition-all duration-200 cursor-default group flex flex-col justify-center"
                  style={{ animation: "panelCellReveal 0.4s 0.5s cubic-bezier(.16,1,.3,1) both" }}
                >
                  <div className="text-[10px] uppercase tracking-wider text-gray-300 group-hover:text-blue-300 transition-colors font-semibold leading-none mb-1">Registry</div>
                  <div className="text-base font-bold text-white group-hover:text-blue-200 transition-colors whitespace-nowrap leading-tight drop-shadow-sm">{hlInfo.registryRange}</div>
                </div>
              )}

              {/* ── Location ── */}
              <div
                className="px-5 py-3 border-r border-white/10 hover:bg-teal-500/20 transition-all duration-200 cursor-default group flex flex-col justify-center"
                style={{ animation: "panelCellReveal 0.4s 0.6s cubic-bezier(.16,1,.3,1) both" }}
              >
                <div className="text-[10px] uppercase tracking-wider text-gray-300 group-hover:text-teal-300 transition-colors font-semibold leading-none mb-1">Location</div>
                <div className="text-base font-bold whitespace-nowrap leading-tight drop-shadow-sm">
                  <span className="text-emerald-300">B-{highlight.bay}</span>
                  <span className="text-white/30 mx-1">·</span>
                  <span className="text-amber-300">{shelfLettersByBay?.[highlight.bay]?.[highlight.shelf - 1] || `S-${highlight.shelf}`}</span>
                  <span className="text-white/30 mx-1">·</span>
                  <span className="text-gray-200">{rowLabels?.[highlight.row] || `R-${highlight.row}`}</span>
                  <span className="text-white/30 mx-1">·</span>
                  <span style={{ color: certTheme.highlight === "#1d4ed8" ? "#93c5fd" : certTheme.highlight === "#7c3aed" ? "#c4b5fd" : "#fca5a5" }}>Box #{highlight.box}</span>
                </div>
              </div>

              {/* ── Zoom action button ── */}
              <button
                onClick={() => sendViewCmd("focus")}
                className="px-5 py-3 flex items-center gap-2 transition-all duration-200 active:scale-95 group shrink-0"
                style={{
                  background: `linear-gradient(to bottom, ${certTheme.btnFrom}, ${certTheme.btnTo})`,
                  animation: "panelCellReveal 0.4s 0.7s cubic-bezier(.16,1,.3,1) both",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `linear-gradient(to bottom, ${certTheme.btnHoverFrom}, ${certTheme.btnHoverTo})`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `linear-gradient(to bottom, ${certTheme.btnFrom}, ${certTheme.btnTo})`; }}
                title="Zoom to box"
              >
                <IconFocus />
                <span className="text-sm font-bold text-white group-hover:tracking-wider transition-all whitespace-nowrap drop-shadow">Zoom</span>
              </button>

              {/* ── Minimize ── */}
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-3 flex items-center justify-center hover:bg-amber-500/25 transition-all duration-200 active:scale-90 group shrink-0 border-l border-white/10"
                style={{ animation: "panelCellReveal 0.4s 0.75s cubic-bezier(.16,1,.3,1) both" }}
                title="Minimize panel"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-300 transition-colors drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path d="M5 12h14" />
                </svg>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Minimized panel pill – stays at same top-left position */}
      {highlight && hlInfo && !showInfo && personArrived && (
        <button
          onClick={() => setShowInfo(true)}
          title="Show document info"
          className="absolute z-20 left-4 top-12 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-bold text-xs transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          style={{
            animation: "minimizePop 0.4s cubic-bezier(.16,1,.3,1), pulseGlow 2.5s 0.4s ease-in-out infinite",
            backdropFilter: "blur(16px) saturate(1.4)",
            WebkitBackdropFilter: "blur(16px) saturate(1.4)",
            background: `linear-gradient(135deg, ${certTheme.panelFrom}, rgba(15, 23, 42, 0.7))`,
          }}
        >
          <svg className="w-5 h-5 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="tracking-widest drop-shadow">FOUND</span>
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] text-gray-500 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm border border-gray-100">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
        Drag to rotate · Scroll to zoom · Right-click to pan · Hover boxes for info
      </div>
    </div>
  );
}
