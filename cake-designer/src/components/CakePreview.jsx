import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { TOPPINGS, CANDLES, SPARKLERS, findById } from "../data/cakeOptions";

function findCandleLike(id) {
  return findById(CANDLES, id) || findById(SPARKLERS, id);
}

/* ------------------------------------------------------------------ *
 * Shape geometry builder
 * ------------------------------------------------------------------ */
function toLocal(x, y) {
  return [(x / 100) * 2 - 1, (1 - y / 100) * 2 - 1];
}

function buildShape(shapeId) {
  const shape = new THREE.Shape();
  const sId = String(shapeId || "").toLowerCase();

  switch (sId) {
    case "square": {
      const s = 0.95;
      shape.moveTo(-s, -s + 0.15);
      shape.lineTo(-s, s - 0.15);
      shape.quadraticCurveTo(-s, s, -s + 0.15, s);
      shape.lineTo(s - 0.15, s);
      shape.quadraticCurveTo(s, s, s, s - 0.15);
      shape.lineTo(s, -s + 0.15);
      shape.quadraticCurveTo(s, -s, s - 0.15, -s);
      shape.lineTo(-s + 0.15, -s);
      shape.quadraticCurveTo(-s, -s, -s, -s + 0.15);
      return shape;
    }
    case "rectangle": {
      const w = 1.3, h = 0.85;
      shape.moveTo(-w, -h + 0.12);
      shape.lineTo(-w, h - 0.12);
      shape.quadraticCurveTo(-w, h, -w + 0.12, h);
      shape.lineTo(w - 0.12, h);
      shape.quadraticCurveTo(w, h, w, h - 0.12);
      shape.lineTo(w, -h + 0.12);
      shape.quadraticCurveTo(w, -h, w - 0.12, -h);
      shape.lineTo(-w + 0.12, -h);
      shape.quadraticCurveTo(-w, -h, -w, -h + 0.12);
      return shape;
    }
    case "triangle": {
      shape.moveTo(0, 1);
      shape.lineTo(0.95, -0.9);
      shape.lineTo(-0.95, -0.9);
      shape.closePath();
      return shape;
    }
    case "heart": {
      const p = (x, y) => toLocal(x, y);
      shape.moveTo(...p(50, 97));
      shape.bezierCurveTo(...p(50, 97), ...p(6, 66), ...p(6, 34));
      shape.bezierCurveTo(...p(6, 15), ...p(21, 3), ...p(37, 3));
      shape.bezierCurveTo(...p(45, 3), ...p(50, 8), ...p(50, 17));
      shape.bezierCurveTo(...p(50, 8), ...p(55, 3), ...p(63, 3));
      shape.bezierCurveTo(...p(79, 3), ...p(94, 15), ...p(94, 34));
      shape.bezierCurveTo(...p(94, 66), ...p(50, 97), ...p(50, 97));
      return shape;
    }
    case "round":
    default:
      shape.absarc(0, 0, 1, 0, Math.PI * 2, false);
      return shape;
  }
}

const extrudeSettings = (depth) => ({
  depth,
  bevelEnabled: true,
  bevelThickness: 0.035,
  bevelSize: 0.035,
  bevelSegments: 4,
  curveSegments: 48,
});

const frostingBevel = (depth) => ({
  depth,
  bevelEnabled: true,
  bevelThickness: 0.045,
  bevelSize: 0.04,
  bevelSegments: 6,
  curveSegments: 48,
});

const LAYER_HEIGHT = 0.34;
const SEAM_HEIGHT = 0.03;
const BASE_Y = 0;

/* ------------------------------------------------------------------ *
 * Single Source of Truth for Top Surface Height (topY)
 * ------------------------------------------------------------------ */
function computeTopY(cake) {
  const layerCount = cake.layers?.id || 1;
  const bodyHeight = layerCount * LAYER_HEIGHT + (layerCount - 1) * SEAM_HEIGHT;
  const hasFrosting = cake.frosting && cake.frosting.id !== "none";
  return { bodyHeight, topY: BASE_Y + bodyHeight / 2 + (hasFrosting ? 0.045 : 0.035) };
}

/* ------------------------------------------------------------------ *
 * Realistic 3D PBR Materials System
 * ------------------------------------------------------------------ */
function useCakeMaterials(cake) {
  return useMemo(() => {
    const flavorColor = cake.flavor?.color || "#F7E7C1";
    const fondantColor = cake.fondant && cake.fondant.id !== "none" ? cake.fondant.color : null;

    const sponge = new THREE.MeshStandardMaterial({
      color: fondantColor || flavorColor,
      roughness: fondantColor ? 0.35 : 0.85,
      metalness: 0.04,
    });

    const seam = new THREE.MeshStandardMaterial({
      color: cake.frosting ? (cake.frosting.swatch !== "transparent" ? cake.frosting.swatch : "#EBD6A0") : cake.flavor?.crumb || "#EBD6A0",
      roughness: 0.6,
    });

    let frostingMat = null;
    if (cake.frosting && cake.frosting.id !== "none") {
      const isGlossy = cake.frosting.finish === "glossy";
      const swatch = cake.frosting.swatch || "#FFFDF4";

      frostingMat = new THREE.MeshPhysicalMaterial({
        color: swatch,
        roughness: isGlossy ? 0.08 : 0.85,
        metalness: 0,
        clearcoat: isGlossy ? 1.0 : 0.0,
        clearcoatRoughness: isGlossy ? 0.02 : 0.0,
        sheen: isGlossy ? 0.0 : 0.35,
        sheenRoughness: 0.8,
        sheenColor: new THREE.Color(swatch),
        ior: isGlossy ? 1.5 : 1.4,
        reflectivity: isGlossy ? 1.0 : 0.1,
      });
    }

    return { sponge, seam, frostingMat };
  }, [cake.flavor, cake.fondant, cake.frosting]);
}

/* ------------------------------------------------------------------ *
 * Generative drip strand for glossy mirror glaze
 * ------------------------------------------------------------------ */
function Drip({ position, length, radius, sway, material }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(sway * 0.4, -length * 0.4, 0),
      new THREE.Vector3(sway, -length * 0.75, 0),
      new THREE.Vector3(sway * 0.6, -length, 0),
    ]);
    return new THREE.TubeGeometry(curve, 12, radius, 6, false);
  }, [length, radius, sway]);

  return <mesh position={position} geometry={geometry} material={material} castShadow />;
}

/* ------------------------------------------------------------------ *
 * 3D Cake Body Component
 * ------------------------------------------------------------------ */
function CakeBody({ cake, materials, topY }) {
  const shapeId = (cake.shape?.id || cake.shape?.label || "round").toLowerCase();
  const layerCount = cake.layers?.id || 1;
  const shape = useMemo(() => buildShape(shapeId), [shapeId]);

  const layerHeight = LAYER_HEIGHT;
  const seamHeight = SEAM_HEIGHT;
  const totalHeight = layerCount * layerHeight + (layerCount - 1) * seamHeight;
  let currY = -totalHeight / 2;

  const hasFrosting = materials.frostingMat !== null;
  const activeMaterial = hasFrosting ? materials.frostingMat : materials.sponge;

  const pieces = [];
  for (let i = 0; i < layerCount; i++) {
    pieces.push(
      <mesh
        key={`layer-${i}`}
        geometry={new THREE.ExtrudeGeometry(shape, hasFrosting ? frostingBevel(layerHeight) : extrudeSettings(layerHeight))}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, currY, 0]}
        material={activeMaterial}
        castShadow
        receiveShadow
      />
    );
    currY += layerHeight;
    if (i < layerCount - 1) {
      pieces.push(
        <mesh
          key={`seam-${i}`}
          geometry={new THREE.ExtrudeGeometry(shape, hasFrosting ? frostingBevel(seamHeight) : extrudeSettings(seamHeight))}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, currY, 0]}
          material={hasFrosting ? materials.frostingMat : materials.seam}
          receiveShadow
        />
      );
      currY += seamHeight;
    }
  }

  const isGlossy = cake.frosting?.finish === "glossy";

  const drips = useMemo(() => {
    if (!isGlossy || !shape) return [];
    const count = 14 + Math.floor(Math.random() * 4);
    let perimeter = [];
    try {
      perimeter = shape.getSpacedPoints ? shape.getSpacedPoints(200) : [];
    } catch {
      perimeter = [];
    }
    if (!perimeter || perimeter.length === 0) return [];

    const totalPts = perimeter.length;
    return Array.from({ length: count }).map((_, i) => {
      const idx = Math.floor(((i + Math.random() * 0.8) / count) * totalPts) % totalPts;
      const pt = perimeter[idx];
      const scale = 0.97;
      return {
        pos: [pt.x * scale, totalHeight / 2, -pt.y * scale],
        length: 0.12 + Math.random() * 0.18,
        radius: 0.014 + Math.random() * 0.008,
        sway: (Math.random() - 0.5) * 0.05,
      };
    });
  }, [isGlossy, shape, totalHeight]);

  return (
    <group>
      {pieces}
      {isGlossy &&
        drips.map((d, i) => <Drip key={`drip-${i}`} position={d.pos} length={d.length} radius={d.radius} sway={d.sway} material={materials.frostingMat} />)}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * World <-> Percentage Surface Mapping
 * ------------------------------------------------------------------ */
function pctToWorld(x, y, topY) {
  const wx = ((x - 50) / 50) * 0.92;
  const wz = ((y - 50) / 50) * 0.92;
  return [wx, topY, wz];
}

function worldToPct(point) {
  const rawX = (point.x / 0.92) * 50 + 50;
  const rawY = (point.z / 0.92) * 50 + 50;
  
  const dx = rawX - 50;
  const dy = rawY - 50;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = 44;
  if (dist > maxR) {
    const scale = maxR / dist;
    return { x: 50 + dx * scale, y: 50 + dy * scale };
  }
  return { x: rawX, y: rawY };
}

/* ------------------------------------------------------------------ *
 * Realistic Procedural 3D Topping Models
 * ------------------------------------------------------------------ */

// Single procedural 3D strawberry with seeds & leaf calyx
function StrawberryMesh({ scale = 1, rotation = [0, 0, 0] }) {
  return (
    <group scale={scale} rotation={rotation}>
      <mesh position={[0, 0.05, 0]} scale={[1, 1.35, 1]} castShadow>
        <sphereGeometry args={[0.048, 16, 16]} />
        <meshStandardMaterial color="#D92B3A" roughness={0.4} metalness={0.05} />
      </mesh>
      <group position={[0, 0.105, 0]}>
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <mesh key={i} rotation={[0.2, (deg * Math.PI) / 180, 0]} position={[0, 0, 0]}>
            <coneGeometry args={[0.018, 0.035, 3]} />
            <meshStandardMaterial color="#38761D" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function StrawberryTopping({ selected, onPointerDown }) {
  return (
    <group onPointerDown={onPointerDown}>
      <StrawberryMesh scale={1.0} rotation={[0.1, 0.4, -0.1]} />
      <group position={[0.045, 0, 0.02]}>
        <StrawberryMesh scale={0.85} rotation={[-0.15, -0.6, 0.2]} />
      </group>
      <group position={[-0.04, 0, -0.03]}>
        <StrawberryMesh scale={0.9} rotation={[0.2, 1.2, -0.1]} />
      </group>
      {selected && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.09, 0.11, 32]} />
          <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function BerriesTopping({ selected, onPointerDown }) {
  const berries = useMemo(() => [
    { pos: [0, 0.03, 0], r: 0.034, rot: [0.1, 0, 0.2] },
    { pos: [0.035, 0.026, 0.02], r: 0.028, rot: [-0.2, 0.5, 0] },
    { pos: [-0.032, 0.028, -0.02], r: 0.03, rot: [0.3, -0.4, 0.1] },
    { pos: [0.015, 0.027, -0.035], r: 0.027, rot: [0, 1.1, -0.2] },
    { pos: [-0.02, 0.029, 0.03], r: 0.031, rot: [-0.1, -0.8, 0] },
  ], []);

  return (
    <group onPointerDown={onPointerDown}>
      {berries.map((b, i) => (
        <group key={i} position={b.pos} rotation={b.rot}>
          <mesh castShadow>
            <sphereGeometry args={[b.r, 16, 16]} />
            <meshStandardMaterial color="#2B2D42" roughness={0.38} metalness={0.05} />
          </mesh>
          <mesh position={[0, b.r * 0.9, 0]}>
            <cylinderGeometry args={[b.r * 0.35, b.r * 0.2, b.r * 0.2, 6]} />
            <meshStandardMaterial color="#1B1C28" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {selected && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.1, 32]} />
          <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function ChocolateTopping({ selected, onPointerDown }) {
  return (
    <group onPointerDown={onPointerDown}>
      <group rotation={[0.2, 0.4, 0.1]} position={[-0.02, 0.025, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.05, 0.035]} />
          <meshStandardMaterial color="#3B2219" roughness={0.35} metalness={0.05} />
        </mesh>
      </group>
      <group rotation={[-0.3, -0.8, 0.2]} position={[0.03, 0.03, -0.01]}>
        <mesh castShadow>
          <boxGeometry args={[0.06, 0.045, 0.03]} />
          <meshStandardMaterial color="#2E1B13" roughness={0.3} metalness={0.05} />
        </mesh>
      </group>
      {selected && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.1, 32]} />
          <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function generateSprinklePoint(shapeId) {
  const sId = String(shapeId || "round").toLowerCase();
  switch (sId) {
    case "square": {
      const px = (Math.random() - 0.5) * 1.72;
      const pz = (Math.random() - 0.5) * 1.72;
      return [px, pz];
    }
    case "rectangle": {
      const px = (Math.random() - 0.5) * 2.36;
      const pz = (Math.random() - 0.5) * 1.52;
      return [px, pz];
    }
    case "triangle": {
      const r1 = Math.sqrt(Math.random());
      const r2 = Math.random();
      const x2d = (1 - r1) * 0 + (r1 * (1 - r2)) * 0.84 + (r1 * r2) * (-0.84);
      const y2d = (1 - r1) * 0.88 + (r1 * (1 - r2)) * (-0.82) + (r1 * r2) * (-0.82);
      return [x2d, -y2d];
    }
    case "heart": {
      for (let attempt = 0; attempt < 50; attempt++) {
        const x = (Math.random() - 0.5) * 1.7;
        const y = Math.random() * 1.8 - 0.9;
        if (y <= 0.0) {
          const maxW = (0.84 * (y + 0.88)) / 0.88;
          if (y >= -0.88 && Math.abs(x) <= maxW) return [x, -y];
        } else {
          const dLeft = (x + 0.42) ** 2 + (y - 0.45) ** 2;
          const dRight = (x - 0.42) ** 2 + (y - 0.45) ** 2;
          if (dLeft <= 0.44 ** 2 || dRight <= 0.44 ** 2) return [x, -y];
        }
      }
      return [0, 0];
    }
    case "round":
    default: {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.85;
      return [Math.cos(angle) * r, Math.sin(angle) * r];
    }
  }
}

function SprinklesTopping({ colors, shapeId }) {
  const bits = useMemo(() => {
    const palette = colors?.length ? colors : ["#E8547B", "#4FA8E0", "#F5C93F", "#6FCB6F", "#B876D9", "#FF9F1C"];
    const count = 180;
    return Array.from({ length: count }).map((_, i) => {
      const [px, pz] = generateSprinklePoint(shapeId);
      return {
        pos: [px, 0.008 + Math.random() * 0.006, pz],
        rot: [Math.random() * 0.3, Math.random() * Math.PI * 2, Math.random() * 0.3],
        color: palette[i % palette.length],
        length: 0.022 + Math.random() * 0.012,
      };
    });
  }, [colors, shapeId]);

  return (
    <group>
      {bits.map((b, i) => (
        <mesh key={i} position={b.pos} rotation={b.rot} castShadow>
          <cylinderGeometry args={[0.004, 0.004, b.length, 6]} />
          <meshStandardMaterial color={b.color} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

function DomeTopping({ color, selected, onPointerDown }) {
  return (
    <group onPointerDown={onPointerDown}>
      <mesh position={[0, 0.028, 0]} scale={[1, 0.65, 1]} castShadow>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshPhysicalMaterial color={color || "#F5A72B"} roughness={0.1} clearcoat={1.0} clearcoatRoughness={0.05} />
      </mesh>
      {selected && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.1, 32]} />
          <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function Topping3D({ type, color, colors, shapeId, position, selected, onPointerDown }) {
  let body;
  switch (type) {
    case "strawberry":
      body = <StrawberryTopping selected={selected} onPointerDown={onPointerDown} />;
      break;
    case "berries":
      body = <BerriesTopping selected={selected} onPointerDown={onPointerDown} />;
      break;
    case "bar":
      body = <ChocolateTopping selected={selected} onPointerDown={onPointerDown} />;
      break;
    case "dome":
      body = <DomeTopping color={color} selected={selected} onPointerDown={onPointerDown} />;
      break;
    case "sprinkles":
    default:
      body = <SprinklesTopping colors={colors} shapeId={shapeId} />;
      break;
  }

  return <group position={position}>{body}</group>;
}

/* ------------------------------------------------------------------ *
 * Unique 3D Candle Models (Classic, Golden Curly, Silver Curly, Sparkler)
 * ------------------------------------------------------------------ */

function Flame({ position, isSparkler }) {
  const flameRef = useRef();
  const lightRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const flicker = isSparkler
      ? 0.75 + Math.sin(t * 35) * 0.35 + Math.random() * 0.2
      : 0.9 + Math.sin(t * 9) * 0.12;
    if (flameRef.current) flameRef.current.scale.set(flicker, flicker, flicker);
    if (lightRef.current) lightRef.current.intensity = (isSparkler ? 1.3 : 0.85) * flicker;
  });

  return (
    <group position={position}>
      <mesh ref={flameRef}>
        <coneGeometry args={[isSparkler ? 0.035 : 0.028, isSparkler ? 0.09 : 0.075, 12]} />
        <meshBasicMaterial color={isSparkler ? "#FFEA79" : "#FFA500"} />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 0.02, 0]}
        color={isSparkler ? "#FFD700" : "#FF9000"}
        intensity={0.9}
        distance={1.2}
      />
    </group>
  );
}

function ClassicCandle({ color = "#FDFAF3", stripeColor = "#D94A4A", selected, onPointerDown }) {
  const bodyRadius = 0.04;
  const bodyHeight = 0.42;
  const wickHeight = 0.04;

  return (
    <group onPointerDown={onPointerDown}>
      <mesh position={[0, bodyHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 20]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} />
      </mesh>
      <mesh position={[0, bodyHeight * 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[bodyRadius + 0.002, 0.005, 8, 24]} />
        <meshStandardMaterial color={stripeColor} roughness={0.4} />
      </mesh>
      <mesh position={[0, bodyHeight * 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[bodyRadius + 0.002, 0.005, 8, 24]} />
        <meshStandardMaterial color={stripeColor} roughness={0.4} />
      </mesh>
      <mesh position={[0, bodyHeight + wickHeight / 2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, wickHeight, 8]} />
        <meshStandardMaterial color="#3A2B20" />
      </mesh>
      <Flame position={[0, bodyHeight + wickHeight + 0.035, 0]} isSparkler={false} />
      {selected && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[bodyRadius + 0.04, bodyRadius + 0.08, 32]} />
          <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function CurlyCandle({ isGold = true, selected, onPointerDown }) {
  const height = 0.44;
  const tubeRadius = 0.022;

  const curve = useMemo(() => {
    const points = [];
    const turns = 2.5;
    const r = 0.045;
    const count = 48;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 2 * turns;
      const x = Math.cos(angle) * r * (1 - t * 0.2);
      const z = Math.sin(angle) * r * (1 - t * 0.2);
      const y = t * height;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
  }, [height]);

  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 48, tubeRadius, 10, false), [curve, tubeRadius]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isGold ? "#D4AF37" : "#E2E8F0",
      metalness: isGold ? 0.9 : 0.95,
      roughness: isGold ? 0.2 : 0.15,
    });
  }, [isGold]);

  const topPoint = curve.getPoint(1);

  return (
    <group onPointerDown={onPointerDown}>
      <mesh geometry={geometry} material={material} castShadow />
      <mesh position={[topPoint.x, topPoint.y + 0.02, topPoint.z]}>
        <cylinderGeometry args={[0.005, 0.005, 0.035, 8]} />
        <meshStandardMaterial color="#3A2B20" />
      </mesh>
      <Flame position={[topPoint.x, topPoint.y + 0.055, topPoint.z]} isSparkler={false} />
      {selected && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.11, 32]} />
          <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function SparklerCandle({ selected, onPointerDown }) {
  const wireHeight = 0.25;
  const sparklerHeight = 0.22;

  return (
    <group onPointerDown={onPointerDown}>
      <mesh position={[0, wireHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, wireHeight, 8]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, wireHeight + sparklerHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, sparklerHeight, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.85} />
      </mesh>
      <Flame position={[0, wireHeight + sparklerHeight + 0.03, 0]} isSparkler={true} />
      {selected && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.06, 0.09, 32]} />
          <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function Candle3D({ candleId, position, selected, onPointerDown, options }) {
  const candlesList = options?.candles || CANDLES;
  const sparklersList = options?.sparklers || SPARKLERS;
  const def = findById(candlesList, candleId) || findById(sparklersList, candleId) || findById(CANDLES, candleId) || findById(SPARKLERS, candleId);

  const localId = String(def?.localId || def?.id || candleId || "").toLowerCase();
  const label = String(def?.label || "").toLowerCase();
  let model;

  if (localId.includes("sparkler") || label.includes("sparkler")) {
    model = <SparklerCandle selected={selected} onPointerDown={onPointerDown} />;
  } else if (localId.includes("curly-silver") || label.includes("silver")) {
    model = <CurlyCandle isGold={false} selected={selected} onPointerDown={onPointerDown} />;
  } else if (localId.includes("curly-gold") || localId.includes("curly") || label.includes("curly") || label.includes("gold")) {
    model = <CurlyCandle isGold={true} selected={selected} onPointerDown={onPointerDown} />;
  } else {
    model = <ClassicCandle selected={selected} onPointerDown={onPointerDown} />;
  }

  return <group position={position}>{model}</group>;
}

/* ------------------------------------------------------------------ *
 * 3D Dynamic Text Writing Layer
 * ------------------------------------------------------------------ */
function TextDecal({ text, color, x, y, rotation, topY, onPointerDown, selected }) {
  const textColor = color || "#7A2E42";
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.font = "600 52px Inter, sans-serif";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [text, textColor]);

  const [wx, , wz] = pctToWorld(x, y, topY);
  const textY = topY + 0.015;

  return (
    <group position={[wx, textY, wz]} rotation={[-Math.PI / 2, 0, (rotation * Math.PI) / 180]}>
      <mesh onPointerDown={onPointerDown}>
        <planeGeometry args={[1.3, 0.32]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
      </mesh>

      {selected && (
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[1.36, 0.38]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}

function FreehandDecal({ paths, color, topY }) {
  const strokeColor = color || "#7A2E42";
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    paths.forEach((path) => {
      ctx.beginPath();
      path.forEach((p, i) => {
        const px = (p.x / 100) * canvas.width;
        const py = (p.y / 100) * canvas.height;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [paths, strokeColor]);

  return (
    <mesh position={[0, topY + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.0, 2.0]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * Invisible Interaction Plane for Raycasting & Dragging
 * ------------------------------------------------------------------ */
function InteractionPlane({ topY, onPointerDown, onPointerMove, onPointerUp, onClick }) {
  return (
    <mesh
      position={[0, topY, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onClick={onClick}
      visible={false}
    >
      <planeGeometry args={[6, 6]} />
      <meshBasicMaterial />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * Main 3D Scene Component
 * ------------------------------------------------------------------ */
function Scene({
  cake,
  options,
  armedTopping,
  onPlaceArmed,
  drawMode,
  onAddPath,
  onMoveTopping,
  onMoveCandle,
  onMoveText,
}) {
  const materials = useCakeMaterials(cake);
  const { bodyHeight, topY } = computeTopY(cake);

  const [drag, setDrag] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);

  function handlePlaneDown(e) {
    if (drawMode) {
      e.stopPropagation();
      setDrawing(true);
      setCurrentPath([worldToPct(e.point)]);
    }
  }

  function handlePlaneMove(e) {
    if (drag) {
      const { x, y } = worldToPct(e.point);
      if (drag.kind === "topping") onMoveTopping(drag.index, x, y);
      if (drag.kind === "candle") onMoveCandle(drag.index, x, y);
      if (drag.kind === "text") onMoveText(x, y);
      return;
    }
    if (drawMode && drawing) {
      setCurrentPath((p) => [...p, worldToPct(e.point)]);
    }
  }

  function handlePlaneUp() {
    if (drag) {
      setDrag(null);
      return;
    }
    if (drawing) {
      setDrawing(false);
      if (currentPath.length > 1) onAddPath(currentPath);
      setCurrentPath([]);
    }
  }

  function handlePlaneClick(e) {
    if (armedTopping && !drawMode) {
      const { x, y } = worldToPct(e.point);
      onPlaceArmed(x, y);
    }
  }

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 2]} intensity={1.0} castShadow shadow-mapSize={[2048, 2048]} shadow-radius={6} />
      <directionalLight position={[-3, 3, -2]} intensity={0.35} />
      <Environment preset="apartment" />

      {/* Plate */}
      <mesh position={[0, -bodyHeight / 2 - 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.5, 0.08, 48]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>

      {/* Ground contact shadow */}
      <ContactShadows position={[0, -bodyHeight / 2 - 0.101, 0]} opacity={0.45} scale={4} blur={2.4} far={1.6} />

      {/* 3D Cake Body Component */}
      <CakeBody cake={cake} materials={materials} topY={topY} />

      {/* 3D Procedural Toppings -- pinned directly on top of the cake (topY) */}
      {cake.toppings.map((t, i) => {
        const def = (options?.toppings && findById(options.toppings, t.toppingId)) || findById(TOPPINGS, t.toppingId);
        if (!def) return null;
        const [wx, , wz] = pctToWorld(t.x, t.y, topY);
        return (
          <Topping3D
            key={`topping-${i}`}
            type={def.geometry}
            color={def.color}
            colors={def.colors}
            shapeId={cake.shape?.id || cake.shape?.label || "round"}
            position={[wx, topY, wz]}
            selected={drag?.kind === "topping" && drag?.index === i}
            onPointerDown={(e) => {
              e.stopPropagation();
              setDrag({ kind: "topping", index: i });
            }}
          />
        );
      })}

      {/* 3D Candles & Sparklers -- pinned directly on top of the cake (topY) */}
      {cake.candles.map((c, i) => {
        const [wx, , wz] = pctToWorld(c.x, c.y ?? 50, topY);
        return (
          <Candle3D
            key={`candle-${i}`}
            candleId={c.candleId}
            options={options}
            position={[wx, topY, wz]}
            selected={drag?.kind === "candle" && drag?.index === i}
            onPointerDown={(e) => {
              e.stopPropagation();
              setDrag({ kind: "candle", index: i });
            }}
          />
        );
      })}

      {/* Dynamic Text Writing Layer */}
      {cake.text?.value && (
        <TextDecal
          text={cake.text.value}
          color={cake.text.color}
          x={cake.text.x ?? 50}
          y={cake.text.y ?? 50}
          rotation={cake.text.rotation || 0}
          topY={topY}
          selected={drag?.kind === "text"}
          onPointerDown={(e) => {
            e.stopPropagation();
            setDrag({ kind: "text" });
          }}
        />
      )}

      {/* Freehand Sketches */}
      {cake.text?.freehandPaths?.length > 0 && (
        <FreehandDecal paths={cake.text.freehandPaths} color={cake.text.color} topY={topY} />
      )}

      {/* Invisible Interaction Surface Plane */}
      <InteractionPlane
        topY={topY}
        onPointerDown={handlePlaneDown}
        onPointerMove={handlePlaneMove}
        onPointerUp={handlePlaneUp}
        onClick={handlePlaneClick}
      />
    </>
  );
}

export default function CakePreview({
  cake,
  options,
  previewMode = false,
  onPlaceArmed,
  armedTopping,
  drawMode,
  onAddPath,
  onMoveTopping,
  onMoveCandle,
  onMoveText,
}) {
  const isRect = cake.shape?.id === "rectangle";

  return (
    <div className="flex flex-col items-center select-none">
      <div className={`relative ${isRect ? "w-80 sm:w-96" : "w-72 sm:w-80"} aspect-square`}>
        <Canvas
          shadows="soft"
          camera={{ position: [3.2, 2.9, 3.5], fov: 35 }}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
        >
          <Scene
            cake={cake}
            options={options}
            armedTopping={armedTopping}
            onPlaceArmed={onPlaceArmed || (() => {})}
            drawMode={drawMode}
            onAddPath={onAddPath || (() => {})}
            onMoveTopping={onMoveTopping || (() => {})}
            onMoveCandle={onMoveCandle || (() => {})}
            onMoveText={onMoveText || (() => {})}
          />
          <OrbitControls
            enablePan={false}
            minDistance={2.2}
            maxDistance={6}
            maxPolarAngle={Math.PI / 2.05}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      {!previewMode && (
        <p className="text-xs text-ink-soft mt-2 font-body text-center">
          Drag to orbit &middot; Tap or drag toppings, candles &amp; text to position on cake
        </p>
      )}
    </div>
  );
}