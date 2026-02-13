import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Billboard, Html } from "@react-three/drei";
import * as THREE from "three";

/* ── Layout dimensions ── */
const CELL_W = 1.0;
const CELL_H = .45;
const SIDE_DEPTH = 2.65;
const SIDE_GAP = 0.10; // small gap between front & back rack sections
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

function HighlightedBox({ position, size, label, info }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [w, h, d] = [size[0] * 0.90, size[1] * 0.78, size[2] * 0.88];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.35 + 0.3 * Math.sin(t * 2.5);
    if (meshRef.current) meshRef.current.material.emissiveIntensity = pulse;
    if (glowRef.current) glowRef.current.material.opacity = 0.12 + 0.08 * Math.sin(t * 2.5);
  });

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <boxGeometry args={[w * 1.12, h * 1.12, d * 1.12]} />
        <meshStandardMaterial color={C.highlight} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <mesh
        ref={meshRef}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={C.highlight} emissive={C.highlightEmit} emissiveIntensity={0.5} transparent opacity={0.92} roughness={0.25} metalness={0.1} />
      </mesh>
      {label && (
        <Billboard position={[0, h / 2 + 0.12, 0]}>
          <Text fontSize={0.12} color={C.white} anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor={C.bayLabel}>
            {`Box #${label}`}
          </Text>
        </Billboard>
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

function CelebrationSparkles({ position }) {
  const groupRef = useRef();
  const sparkles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      angle: (i / 18) * Math.PI * 2,
      radius: 0.25 + Math.random() * 0.45,
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      ySpeed: 0.15 + Math.random() * 0.25,
      color: ["#fbbf24", "#f59e0b", "#fcd34d", "#fef3c7", "#f97316"][Math.floor(Math.random() * 5)],
      size: 0.012 + Math.random() * 0.018,
    }));
  }, []);

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
        if (targetCellPos) {
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
    a.t = Math.min(a.t + delta * 2.0, 1);
    // ease in-out cubic
    const ease = a.t < 0.5 ? 4 * a.t * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 3) / 2;

    camera.position.lerpVectors(a.fromCam, a.toCam, ease);
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(a.fromTarget, a.toTarget, ease);
      controlsRef.current.update();
    }

    if (a.t >= 1) a.active = false;
  });

  return null;
}

/* ── BayUnit (now uses InteractiveBox for hover/click) ── */

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
            <HighlightedBox key={`fc-${colIdx}-${rk}`} position={pos} size={cellSize} label={highlight.box} info={highlight.info || null} />
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
            <HighlightedBox key={`bc-${colIdx}-${rk}`} position={pos} size={cellSize} label={highlight.box} info={highlight.info || null} />
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

function WalkingPerson({ targetCellPos, startPos }) {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const carriedLadderRef = useRef();
  const placedLadderRef = useRef();
  const torsoRef = useRef();

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
    const baseOffset = h * Math.tan(LADDER_LEAN);
    const climbTarget = Math.max(0, h - 0.76 * PERSON_SCALE + 0.05);
    const climbZShift = climbTarget * Math.tan(LADDER_LEAN);
    return { length, baseOffset, climbTarget, climbZShift };
  }, [needsLadder, targetCellPos]);

  const standPos = useMemo(
    () => {
      const outerFace = SIDE_GAP / 2 + SIDE_DEPTH;
      const bendForward = needsBend ? 0.33 * Math.sin(bendAngle) * PERSON_SCALE : 0;
      const zOff = ladderInfo ? ladderInfo.baseOffset : (0.30 + bendForward * 0.9);
      const standZ = outerFace + zOff;
      return [
        targetCellPos[0],
        0,
        isFront ? standZ : -standZ,
      ];
    },
    [targetCellPos, isFront, ladderInfo, needsBend, bendAngle]
  );

  const faceAngle = isFront ? 0 : Math.PI;
  const zShiftSign = isFront ? -1 : 1;

  const anim = useRef({ phase: "idle", t: 0, wp: 0 });

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const a = anim.current;
    a.t += delta;
    const clk = state.clock.elapsedTime;

    if (a.phase === "idle") {
      g.position.set(startPos[0], 0, startPos[2]);
      const dx = standPos[0] - startPos[0];
      const dz = standPos[2] - startPos[2];
      g.rotation.y = Math.atan2(dx, dz) + Math.PI;
      if (a.t > 0.35) { a.phase = "walk"; a.t = 0; }
      return;
    }

    if (a.phase === "walk") {
      const dx = standPos[0] - startPos[0];
      const dz = standPos[2] - startPos[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      a.wp = Math.min(a.wp + (1.8 * delta) / Math.max(dist, 0.01), 1);
      const p = a.wp;
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      g.position.set(
        startPos[0] + dx * ease,
        Math.abs(Math.sin(clk * 12)) * 0.012,
        startPos[2] + dz * ease
      );
      g.rotation.y = Math.atan2(dx, dz) + Math.PI;

      const sw = Math.sin(clk * 12) * 0.55;
      if (leftLegRef.current) leftLegRef.current.rotation.x = sw;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -sw;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -sw * 0.4;
      if (rightArmRef.current) rightArmRef.current.rotation.x = needsLadder ? 0.45 : sw * 0.4;

      if (p >= 1) {
        a.phase = "turn";
        a.t = 0;
        g.position.y = 0;
        [leftLegRef, rightLegRef, leftArmRef, rightArmRef].forEach((r) => {
          if (r.current) r.current.rotation.x = 0;
        });
      }
      return;
    }

    if (a.phase === "turn") {
      if (a.turnFrom == null) {
        const dx = standPos[0] - startPos[0];
        const dz = standPos[2] - startPos[2];
        a.turnFrom = Math.atan2(dx, dz) + Math.PI;
      }
      const p = Math.min(a.t / 0.4, 1);
      const ease = 1 - Math.pow(1 - p, 2);
      let diff = faceAngle - a.turnFrom;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      g.rotation.y = a.turnFrom + diff * ease;
      if (p >= 1) {
        g.rotation.y = faceAngle;
        a.turnFrom = null;
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
      if (!info) { a.phase = "reach"; a.t = 0; return; }
      const dur = 1.0 + info.climbTarget * 0.6;
      const p = Math.min(a.t / dur, 1);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      g.position.y = info.climbTarget * ease;
      g.position.z = standPos[2] + zShiftSign * info.climbZShift * ease;
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
      }
      return;
    }

    if (a.phase === "reach") {
      if (carriedLadderRef.current) carriedLadderRef.current.visible = false;
      if (torsoRef.current) torsoRef.current.rotation.x = 0;
      const p = Math.min(a.t / 0.8, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const armWorldY = g.position.y + 0.76 * PERSON_SCALE;
      const vDiff = targetCellPos[1] - armWorldY;
      const hDist = 0.35;
      const pointAngle = (Math.PI / 2) + Math.atan2(vDiff, hDist);
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
      const baseY = needsLadder && ladderInfo ? ladderInfo.climbTarget : 0;
      g.position.y = baseY + Math.sin(clk * 2) * 0.004;
      if (needsBend && torsoRef.current) {
        torsoRef.current.rotation.x = -bendAngle;
      }
    }
  });

  return (
    <>
      <group ref={groupRef} position={startPos} scale={[PERSON_SCALE, PERSON_SCALE, PERSON_SCALE]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <circleGeometry args={[0.12, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.15} />
        </mesh>

        <group ref={leftLegRef} position={[-0.04, 0.42, 0]}>
          <mesh position={[0, -0.19, 0]} castShadow>
            <boxGeometry args={[0.055, 0.37, 0.055]} />
            <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.385, 0.012]} castShadow>
            <boxGeometry args={[0.06, 0.04, 0.085]} />
            <meshStandardMaterial color="#44403c" roughness={0.8} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.04, 0.42, 0]}>
          <mesh position={[0, -0.19, 0]} castShadow>
            <boxGeometry args={[0.055, 0.37, 0.055]} />
            <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.385, 0.012]} castShadow>
            <boxGeometry args={[0.06, 0.04, 0.085]} />
            <meshStandardMaterial color="#44403c" roughness={0.8} />
          </mesh>
        </group>

        <group ref={torsoRef} position={[0, 0.43, 0]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <sphereGeometry args={[0.07, 16, 12]} />
            <meshStandardMaterial color="#FDBCB4" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.505, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.085, 0.05, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.10, 0.10, 0.015, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0.17, 0]} castShadow>
            <boxGeometry args={[0.16, 0.34, 0.09]} />
            <meshStandardMaterial color="#0ea5e9" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.00, 0]} castShadow>
            <boxGeometry args={[0.165, 0.03, 0.092]} />
            <meshStandardMaterial color="#78716c" roughness={0.5} metalness={0.3} />
          </mesh>

          <group ref={leftArmRef} position={[-0.11, 0.33, 0]}>
            <mesh position={[0, -0.13, 0]} castShadow>
              <boxGeometry args={[0.045, 0.24, 0.045]} />
              <meshStandardMaterial color="#0ea5e9" roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.26, 0]} castShadow>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color="#FDBCB4" roughness={0.8} />
            </mesh>
          </group>
          <group ref={rightArmRef} position={[0.11, 0.33, 0]}>
            <mesh position={[0, -0.13, 0]} castShadow>
              <boxGeometry args={[0.045, 0.24, 0.045]} />
              <meshStandardMaterial color="#0ea5e9" roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.26, 0]} castShadow>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color="#FDBCB4" roughness={0.8} />
            </mesh>
          </group>

          {needsLadder && ladderInfo && (
            <group ref={carriedLadderRef} position={[0.14, -0.23, -0.03]} rotation={[0.08, 0, -0.1]}>
              <LadderMesh height={ladderInfo.length * 0.38} />
            </group>
          )}
        </group>
      </group>

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

function RackScene({ shelfLettersByBay, rowLabels, highlight, viewCmd }) {
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

  const personStartPos = useMemo(() => {
    if (!targetCellWorldPos) return null;
    const outerFace = SIDE_GAP / 2 + SIDE_DEPTH;
    const startX = targetCellWorldPos[0] <= totalW / 2
      ? targetCellWorldPos[0] - 1.5
      : targetCellWorldPos[0] + 1.5;
    return [startX, 0, outerFace + 3.0];
  }, [targetCellWorldPos, totalW]);

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
        <CelebrationSparkles position={targetCellWorldPos} />
      )}

      {/* Walking person retrieval animation */}
      {targetCellWorldPos && personStartPos && hlInfo && (
        <WalkingPerson
          key={`person-${hlInfo.bay}-${hlInfo.shelfIndex}-${hlInfo.row}-${hlInfo.box}`}
          targetCellPos={targetCellWorldPos}
          startPos={personStartPos}
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

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-stone-100 to-stone-200 border-2 border-stone-300/60 shadow-inner ${className}`}
      style={{ height: isFullscreen ? "100vh" : 460, ...style }}
    >
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, 18px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes slideInSide { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 15px rgba(239,68,68,0.25), 0 0 40px rgba(239,68,68,0.08), inset 0 0 20px rgba(239,68,68,0.05); } 50% { box-shadow: 0 0 25px rgba(239,68,68,0.45), 0 0 60px rgba(239,68,68,0.15), inset 0 0 30px rgba(239,68,68,0.08); } }
        @keyframes panelPop { 0% { opacity: 0; transform: translate(-50%,-50%) scale(0.85); filter: blur(4px); } 60% { opacity: 1; transform: translate(-50%,-50%) scale(1.02); filter: blur(0); } 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); filter: blur(0); } }
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

      {/* ── Horizontal Document Info Panel – always centered ── */}
      {highlight && hlInfo && showInfo && (() => {
        const certName = CERT_NAMES[hlInfo.certificateType] || hlInfo.certificateType;
        const yearText = hlInfo.year ? `${hlInfo.year}${hlInfo.yearTo && hlInfo.yearTo !== hlInfo.year ? `–${hlInfo.yearTo}` : ""}` : "—";

        return (
          <div
            key={activeView}
            className="absolute z-20 left-1/2 top-1/2"
            style={{
              transform: "translate(-50%, -50%)",
              animation: "panelPop 0.35s cubic-bezier(.22,1,.36,1)",
            }}
          >
            <div
              className="flex flex-row items-stretch rounded-2xl overflow-hidden shadow-2xl border border-white/20"
              style={{
                animation: "pulseGlow 2.5s ease-in-out infinite",
                backdropFilter: "blur(16px) saturate(1.4)",
                WebkitBackdropFilter: "blur(16px) saturate(1.4)",
                background: "rgba(15, 23, 42, 0.55)",
              }}
            >
              {/* ── Title badge ── */}
              <div className="bg-gradient-to-b from-red-600/90 to-red-700/90 px-5 py-4 flex items-center gap-2.5 shrink-0">
                <svg className="w-6 h-6 text-white shrink-0 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="text-sm font-extrabold text-white tracking-widest whitespace-nowrap drop-shadow">FOUND</span>
              </div>

              {/* ── Certificate type ── */}
              <div className="px-5 py-3 border-r border-white/10 hover:bg-emerald-500/20 transition-all duration-200 cursor-default group flex flex-col justify-center">
                <div className="text-[10px] uppercase tracking-wider text-gray-300 group-hover:text-emerald-300 transition-colors font-semibold leading-none mb-1">Certificate</div>
                <div className="text-base font-bold text-white group-hover:text-emerald-200 transition-colors whitespace-nowrap leading-tight drop-shadow-sm">{certName}</div>
              </div>

              {/* ── Year ── */}
              {hlInfo.year && (
                <div className="px-5 py-3 border-r border-white/10 hover:bg-amber-500/20 transition-all duration-200 cursor-default group flex flex-col justify-center">
                  <div className="text-[10px] uppercase tracking-wider text-gray-300 group-hover:text-amber-300 transition-colors font-semibold leading-none mb-1">Year</div>
                  <div className="text-base font-bold text-white group-hover:text-amber-200 transition-colors whitespace-nowrap leading-tight drop-shadow-sm">{yearText}</div>
                </div>
              )}

              {/* ── Registry ── */}
              {hlInfo.registryRange && (
                <div className="px-5 py-3 border-r border-white/10 hover:bg-blue-500/20 transition-all duration-200 cursor-default group flex flex-col justify-center">
                  <div className="text-[10px] uppercase tracking-wider text-gray-300 group-hover:text-blue-300 transition-colors font-semibold leading-none mb-1">Registry</div>
                  <div className="text-base font-bold text-white group-hover:text-blue-200 transition-colors whitespace-nowrap leading-tight drop-shadow-sm">{hlInfo.registryRange}</div>
                </div>
              )}

              {/* ── Location ── */}
              <div className="px-5 py-3 border-r border-white/10 hover:bg-teal-500/20 transition-all duration-200 cursor-default group flex flex-col justify-center">
                <div className="text-[10px] uppercase tracking-wider text-gray-300 group-hover:text-teal-300 transition-colors font-semibold leading-none mb-1">Location</div>
                <div className="text-base font-bold whitespace-nowrap leading-tight drop-shadow-sm">
                  <span className="text-emerald-300">B-{highlight.bay}</span>
                  <span className="text-white/30 mx-1">·</span>
                  <span className="text-amber-300">S-{highlight.shelf}</span>
                  <span className="text-white/30 mx-1">·</span>
                  <span className="text-gray-200">R-{highlight.row}</span>
                  <span className="text-white/30 mx-1">·</span>
                  <span className="text-red-300">Box #{highlight.box}</span>
                </div>
              </div>

              {/* ── Zoom action button ── */}
              <button
                onClick={() => sendViewCmd("focus")}
                className="bg-gradient-to-b from-red-500/80 to-red-600/80 px-5 py-3 flex items-center gap-2 hover:from-red-500 hover:to-red-600 transition-all duration-200 active:scale-95 group shrink-0"
                title="Zoom to box"
              >
                <IconFocus />
                <span className="text-sm font-bold text-white group-hover:tracking-wider transition-all whitespace-nowrap drop-shadow">Zoom</span>
              </button>

              {/* ── Close ── */}
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-3 flex items-center justify-center hover:bg-red-500/25 transition-all duration-200 active:scale-90 group shrink-0 border-l border-white/10"
                title="Hide panel"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })()}

      {/* Re-show info panel button (when dismissed) */}
      {highlight && hlInfo && !showInfo && (
        <button
          onClick={() => setShowInfo(true)}
          title="Show document info"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-full transition-all duration-200 bg-red-500/95 backdrop-blur-sm text-white hover:bg-red-600 hover:shadow-lg hover:scale-105 border border-red-400/60 active:scale-95 z-20"
          style={{ animation: "pulseGlow 2s ease-in-out infinite" }}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          Show Document Info
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
