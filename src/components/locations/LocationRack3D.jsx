import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Billboard } from "@react-three/drei";

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

/* ── Realistic cardboard box for every shelf cell ── */

function CardboardBox({ position, size }) {
  const [w, h, d] = [size[0] * 0.90, size[1] * 0.78, size[2] * 0.88];
  return (
    <group position={position}>
      {/* Box body */}
      <mesh castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#c4a47a" roughness={0.88} metalness={0.0} />
      </mesh>
      {/* Lid seam (dark line at the top) */}
      <mesh position={[0, h * 0.48, 0]}>
        <boxGeometry args={[w * 1.005, 0.006, d * 1.005]} />
        <meshStandardMaterial color="#9a7d55" roughness={0.7} />
      </mesh>
      {/* Front label sticker */}
      <mesh position={[0, h * 0.05, d / 2 + 0.001]}>
        <planeGeometry args={[w * 0.45, h * 0.35]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.95} />
      </mesh>
    </group>
  );
}

/* ── Highlighted box – static pulsing marker in the shelf (person pulls it out) ── */

function HighlightedBox({ position, size, label }) {
  const meshRef = useRef();
  const glowRef = useRef();
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
      <mesh ref={meshRef} castShadow>
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

      {/* Front cells – realistic boxes */}
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
            <HighlightedBox key={`fc-${colIdx}-${rk}`} position={pos} size={cellSize} label={highlight.box} />
          ) : (
            <CardboardBox key={`fc-${colIdx}-${rk}`} position={pos} size={cellSize} />
          );
        });
      })}

      {/* Back cells – realistic boxes */}
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
            <HighlightedBox key={`bc-${colIdx}-${rk}`} position={pos} size={cellSize} label={highlight.box} />
          ) : (
            <CardboardBox key={`bc-${colIdx}-${rk}`} position={pos} size={cellSize} />
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
const RACK_FRONT_Z = SIDE_DEPTH + SIDE_GAP / 2; // outer front edge ≈ 2.69
const LADDER_LEAN = 0.28; // ~16° from vertical – more visible lean
const LADDER_THRESHOLD = 1.55; // cell Y above this triggers ladder (rows 5-6)
const BEND_THRESHOLD = 0.9;   // cell Y below this → person bends over (rows 1-2)

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

  /* How far to bend – more for lower boxes */
  const bendAngle = useMemo(() => {
    if (!needsBend) return 0;
    const boxH = targetCellPos[1];
    return Math.min(1.3, Math.max(0, (BEND_THRESHOLD - boxH) / BEND_THRESHOLD * 1.8));
  }, [needsBend, targetCellPos]);

  /* Ladder geometry calculations */
  const ladderInfo = useMemo(() => {
    if (!needsLadder) return null;
    const h = targetCellPos[1];
    const length = h / Math.cos(LADDER_LEAN) + 0.15;
    const baseOffset = h * Math.tan(LADDER_LEAN);
    const climbTarget = Math.max(0, h - 0.76 * PERSON_SCALE + 0.05);
    const climbZShift = climbTarget * Math.tan(LADDER_LEAN);
    return { length, baseOffset, climbTarget, climbZShift };
  }, [needsLadder, targetCellPos]);

  /* Where the person stops – outside the rack's open shelf face */
  const standPos = useMemo(
    () => {
      const outerFace = SIDE_GAP / 2 + SIDE_DEPTH; // outer face of the shelf section
      /* Stand further back when bending so there's visible space between the person and the rack */
      const bendForward = needsBend ? 0.33 * Math.sin(bendAngle) * PERSON_SCALE : 0;
      const zOff = ladderInfo ? ladderInfo.baseOffset : (0.30 + bendForward * 0.9);
      const standZ = outerFace + zOff; // outside the rack
      return [
        targetCellPos[0],
        0,
        isFront ? standZ : -standZ,
      ];
    },
    [targetCellPos, isFront, ladderInfo, needsBend, bendAngle]
  );

  /* Person faces INTO the shelf from outside the rack */
  const faceAngle = isFront ? 0 : Math.PI; // face -Z for front shelf (inward), +Z for back shelf
  const zShiftSign = isFront ? -1 : 1;     // climb toward the shelf (inward)

  const anim = useRef({ phase: "idle", t: 0, wp: 0 });

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const a = anim.current;
    a.t += delta;
    const clk = state.clock.elapsedTime;

    /* ---- idle ---- */
    if (a.phase === "idle") {
      g.position.set(startPos[0], 0, startPos[2]);
      const dx = standPos[0] - startPos[0];
      const dz = standPos[2] - startPos[2];
      g.rotation.y = Math.atan2(dx, dz) + Math.PI;
      if (a.t > 0.35) { a.phase = "walk"; a.t = 0; }
      return;
    }

    /* ---- walk ---- */
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
      /* When carrying ladder, right arm stays raised forward to hold it */
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

    /* ---- turn to face the shelf/box ---- */
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

    /* ---- bend over and reach for low boxes ---- */
    if (a.phase === "bendReach") {
      const p = Math.min(a.t / 1.0, 1);
      const ease = 1 - Math.pow(1 - p, 3);

      /* Tilt torso forward at the waist (negative rotation.x = forward in person's local space) */
      if (torsoRef.current) {
        torsoRef.current.rotation.x = -bendAngle * ease;
      }

      /* Arms reach forward-down from the bent torso toward the box */
      const armTarget = 0.6 + bendAngle * 0.2;
      if (leftArmRef.current) leftArmRef.current.rotation.x = armTarget * ease;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armTarget * ease;

      /* Slight knee bend for a natural posture */
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0.15 * ease;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.15 * ease;

      if (p >= 1) { a.phase = "done"; a.t = 0; }
      return;
    }

    /* ---- place ladder against rack ---- */
    if (a.phase === "placeLadder") {
      const p = Math.min(a.t / 0.7, 1);
      const ease = 1 - Math.pow(1 - p, 2);

      /* Hide carried ladder, show placed ladder tilting into position */
      if (carriedLadderRef.current) carriedLadderRef.current.visible = (p < 0.15);
      if (placedLadderRef.current) {
        placedLadderRef.current.visible = (p >= 0.15);
        const tgtAngle = isFront ? -LADDER_LEAN : LADDER_LEAN;
        placedLadderRef.current.rotation.x = tgtAngle * ease;
      }

      /* Person's arms simulate pushing the ladder forward (positive = toward shelf) */
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

    /* ---- climb the ladder ---- */
    if (a.phase === "climb") {
      if (carriedLadderRef.current) carriedLadderRef.current.visible = false;
      const info = ladderInfo;
      if (!info) { a.phase = "reach"; a.t = 0; return; }
      const dur = 1.0 + info.climbTarget * 0.6;
      const p = Math.min(a.t / dur, 1);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      /* Move person up (and slightly toward rack along ladder lean) */
      g.position.y = info.climbTarget * ease;
      g.position.z = standPos[2] + zShiftSign * info.climbZShift * ease;

      /* Smooth arm ease-in from placeLadder (0) to climbing grip (+0.85 = forward) */
      const armEaseIn = Math.min(1, a.t / 0.3);
      const baseArm = 0.85 * armEaseIn;

      /* Stepping motion */
      if (p < 1) {
        const step = Math.sin(clk * 8) * 0.35;
        if (leftLegRef.current) leftLegRef.current.rotation.x = step;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -step;
      }
      /* Arms gripping ladder rungs, alternating with smooth ease-in */
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

    /* ---- reach both arms forward into the shelf toward the box ---- */
    if (a.phase === "reach") {
      if (carriedLadderRef.current) carriedLadderRef.current.visible = false;
      if (torsoRef.current) torsoRef.current.rotation.x = 0; // ensure upright
      const p = Math.min(a.t / 0.8, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const armWorldY = g.position.y + 0.76 * PERSON_SCALE;
      const vDiff = targetCellPos[1] - armWorldY;
      /* Distance from person to shelf outer face */
      const hDist = 0.35;
      /*
       * Positive rotation.x = arm swings forward (toward the shelf).
       * π/2 = horizontal forward, add atan2 to tilt toward the box.
       */
      const pointAngle = (Math.PI / 2) + Math.atan2(vDiff, hDist);
      /*
       * On a ladder the person is already at box height – use natural
       * pointing angle so arms aim directly at the box.
       * From the ground, clamp so arms always extend forward into the shelf
       * (prevents limp arms for low rows).
       */
      const finalAngle = needsLadder
        ? Math.max(pointAngle, Math.PI * 0.35)
        : Math.max(pointAngle, Math.PI * 0.45);

      const fromR = needsLadder ? 0.85 : 0;
      const fromL = needsLadder ? 0.85 : 0;
      /* Both arms reach equally forward into the shelf */
      if (rightArmRef.current) rightArmRef.current.rotation.x = fromR + (finalAngle - fromR) * ease;
      if (leftArmRef.current) leftArmRef.current.rotation.x = fromL + (finalAngle - fromL) * ease;
      if (p >= 1) { a.phase = "done"; a.t = 0; }
      return;
    }

    /* ---- done (gentle idle sway, maintain posture) ---- */
    if (a.phase === "done") {
      const baseY = needsLadder && ladderInfo ? ladderInfo.climbTarget : 0;
      g.position.y = baseY + Math.sin(clk * 2) * 0.004;
      /* Maintain bend posture for low-box retrieval */
      if (needsBend && torsoRef.current) {
        torsoRef.current.rotation.x = -bendAngle;
      }
    }
  });

  return (
    <>
      <group ref={groupRef} position={startPos} scale={[PERSON_SCALE, PERSON_SCALE, PERSON_SCALE]}>
        {/* Contact shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <circleGeometry args={[0.12, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.15} />
        </mesh>

        {/* Left leg */}
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
        {/* Right leg */}
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

        {/* ── Upper body (torso group) – pivots at waist Y=0.43 for bending ── */}
        <group ref={torsoRef} position={[0, 0.43, 0]}>
          {/* Head */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <sphereGeometry args={[0.07, 16, 12]} />
            <meshStandardMaterial color="#FDBCB4" roughness={0.8} />
          </mesh>
          {/* Hard hat – dome */}
          <mesh position={[0, 0.505, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.085, 0.05, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.15} />
          </mesh>
          {/* Hard hat – brim */}
          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.10, 0.10, 0.015, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.15} />
          </mesh>

          {/* Body / shirt */}
          <mesh position={[0, 0.17, 0]} castShadow>
            <boxGeometry args={[0.16, 0.34, 0.09]} />
            <meshStandardMaterial color="#0ea5e9" roughness={0.55} />
          </mesh>
          {/* Belt */}
          <mesh position={[0, 0.00, 0]} castShadow>
            <boxGeometry args={[0.165, 0.03, 0.092]} />
            <meshStandardMaterial color="#78716c" roughness={0.5} metalness={0.3} />
          </mesh>

          {/* Left arm */}
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
          {/* Right arm */}
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

          {/* Carried ladder (visible while walking to shelf) */}
          {needsLadder && ladderInfo && (
            <group ref={carriedLadderRef} position={[0.14, -0.23, -0.03]} rotation={[0.08, 0, -0.1]}>
              <LadderMesh height={ladderInfo.length * 0.38} />
            </group>
          )}
        </group>
      </group>

      {/* Placed ladder in world coordinates (leaning against rack) */}
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

/* ── Scene (all racks + environment) ── */

function RackScene({ shelfLettersByBay, rowLabels, highlight }) {
  /* Bays sorted descending so from the front view they read right-to-left ascending (B-1 on the right) */
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

  /* ── Compute highlighted cell world position for walking person ── */
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

  /* Person always starts from the front of the rack and walks toward the target */
  const personStartPos = useMemo(() => {
    if (!targetCellWorldPos) return null;
    const outerFace = SIDE_GAP / 2 + SIDE_DEPTH;
    /* Start slightly off-center so the walk has a natural diagonal path */
    const startX = targetCellWorldPos[0] <= totalW / 2
      ? targetCellWorldPos[0] - 1.5
      : targetCellWorldPos[0] + 1.5;
    return [startX, 0, outerFace + 3.0]; // always from the front (+Z side)
  }, [targetCellWorldPos, totalW]);

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

      {/* Walking person retrieval animation */}
      {targetCellWorldPos && personStartPos && hlInfo && (
        <WalkingPerson
          key={`person-${hlInfo.bay}-${hlInfo.shelfIndex}-${hlInfo.row}-${hlInfo.box}`}
          targetCellPos={targetCellWorldPos}
          startPos={personStartPos}
        />
      )}

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
