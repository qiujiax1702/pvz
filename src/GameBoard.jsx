import React, { useState, useEffect } from "react";

function useNow(interval = 100) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

const styles = {
  cell: {
    width: "85px",
    height: "85px",
    border: "1px solid #388e3c",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  plantImage: {
    width: "82px",
    height: "82px",
    objectFit: "contain",
    overflow: "visible",
  },
  acornStackContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  zombieHpBarBg: {
    width: "40px",
    height: "4px",
    backgroundColor: "#000",
    marginBottom: "2px",
  },
  zombieHpBarFg: { height: "100%", backgroundColor: "#ff0000" },
  zombieImage: { width: "70px", height: "110px", objectFit: "contain" },
  projectile: {
    position: "absolute",
    width: "34px",
    height: "34px",
    zIndex: 25,
    transform: "translateY(-50%)",
  },
  projectileImage: { width: "100%", height: "100%", objectFit: "contain" },
};

function getCobCannonImage(cell) {
  if (!cell) return "/img/corn.jpg";
  if (cell.cobState === "empty") return "/img/corn3.jpg";
  if (cell.cobState === "aiming") return "/img/corn2.png";
  return "/img/corn.jpg";
}

function PlantCell({ cell }) {
  if (!cell) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        width: "100%",
        height: "100%",
        justifyContent: cell.isGiant ? "center" : "flex-end",
      }}
    >
      {!cell.isJumping && cell.type !== "COBCANNON_FRONT" && (
        <div
          style={{
            width: "40px",
            height: "4px",
            backgroundColor: "#000",
            marginBottom: "2px",
            position: "absolute",
            top: cell.isGiant
              ? cell.type === "KING_SQUASH"
                ? "-35px"
                : "-55px"
              : "4px",
            zIndex: 25,
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: "#00ff00",
              width: `${(cell.hp / cell.maxHp) * 100}%`,
            }}
          />
        </div>
      )}

      {cell.type === "ACORN" ? (
        <div style={styles.acornStackContainer}>
          {Array.from({ length: cell.acornCount })
            .map((_, i) => i)
            .reverse()
            .map((renderIndex) => (
              <img
                key={renderIndex}
                src={cell.image}
                alt="Acorn"
                style={{
                  ...styles.plantImage,
                  position: "absolute",
                  bottom: `${renderIndex * 18}px`,
                  zIndex: 10 - renderIndex,
                }}
                onError={(e) => {
                  e.target.style.visibility = "hidden";
                }}
              />
            ))}
        </div>
      ) : cell.type === "COBCANNON_BACK" ? (
        <>
          <img
            src={getCobCannonImage(cell)}
            alt="Cob Cannon Back"
            style={{
              ...styles.plantImage,
              width: "170px",
              height: "70px",
              position: "absolute",
              left: "0px",
              top: "50%",
              transform: "translateY(-50%)",
              objectFit: "cover",
              objectPosition: "left",
              zIndex: 15,
              animation:
                cell.cobState === "aiming"
                  ? "cobAimPulse 0.6s infinite alternate"
                  : "none",
              cursor: cell.cobState === "ready" ? "pointer" : "default",
            }}
            onError={(e) => {
              e.target.style.visibility = "hidden";
            }}
          />
          {cell.cobState === "empty" && (
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                left: "2px",
                fontSize: "11px",
                color: "#ffcc00",
                fontWeight: "bold",
                zIndex: 20,
                background: "rgba(0,0,0,0.5)",
                borderRadius: "3px",
                padding: "1px 3px",
              }}
            >
              ⏳ {Math.ceil((30000 - (cell.cooldownTimer || 0)) / 1000)}s
            </div>
          )}
        </>
      ) : cell.type === "COBCANNON_FRONT" ? (
        <img
          src={getCobCannonImage(cell)}
          alt="Cob Cannon Front"
          style={{
            ...styles.plantImage,
            width: "170px",
            height: "70px",
            position: "absolute",
            right: "0px",
            top: "50%",
            transform: "translateY(-50%)",
            objectFit: "cover",
            objectPosition: "right",
            zIndex: 14,
            animation:
              cell.cobState === "aiming"
                ? "cobAimPulse 0.6s infinite alternate"
                : "none",
          }}
          onError={(e) => {
            e.target.style.visibility = "hidden";
          }}
        />
      ) : (
        <img
          src={cell.image}
          alt={cell.type}
          style={{
            ...styles.plantImage,
            position: cell.isGiant || cell.isJumping ? "absolute" : "relative",
            top: cell.isGiant ? "50%" : "auto",
            left: cell.isGiant ? "50%" : "auto",
            animation: cell.isJumping
              ? cell.type === "KING_SQUASH"
                ? "kingSquashJump 0.6s ease-in-out forwards"
                : "squashJump 0.6s ease-in-out forwards"
              : cell.type === "KING_SQUASH"
                ? "kingSquashPulse 1.2s infinite alternate ease-in-out"
                : cell.type === "OAK"
                  ? "oakPulse 1.5s infinite alternate ease-in-out"
                  : "none",
            pointerEvents: cell.isGiant ? "none" : "auto",
          }}
          onError={(e) => {
            e.target.style.visibility = "hidden";
          }}
        />
      )}
    </div>
  );
}

export default function GameBoard({
  grid,
  zombies,
  projectiles,
  flyingCobs,
  lightningBolts,
  explosions,
  sonicWaves,
  goldTiles,
  droppedSuns,
  hoveredCell,
  cobAiming,
  onCellClick,
  onCellRightClick,
  onCellHover,
  onCellLeave,
  onCollectSun,
}) {
  return (
    <div style={{ position: "relative", width: "810px", margin: "0 auto" }}>
      {/* Board grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 85px)",
          gridTemplateRows: "repeat(5, 85px)",
          gap: "2px",
          backgroundColor: "#2e7d32",
          padding: "5px",
          borderRadius: "5px",
        }}
      >
        {grid.map((cell, index) => {
          const lane = Math.floor(index / 9);
          const isAimingTarget =
            cobAiming !== null && lane === Math.floor(cobAiming / 9);
          const cellAnimStyle = cell?.isBeingPushed
            ? { animation: "goldPushGlow 0.6s ease-out" }
            : {};
          let cellBg = hoveredCell === index ? "#66bb6a" : "#4caf50";
          if (isAimingTarget)
            cellBg = hoveredCell === index ? "#ffe066" : "#ffd633";

          return (
            <div
              key={index}
              onClick={() => onCellClick(index)}
              onContextMenu={(e) => onCellRightClick(e, index)}
              onMouseEnter={() => onCellHover(index)}
              onMouseLeave={onCellLeave}
              style={{
                ...styles.cell,
                backgroundColor: cellBg,
                position: "relative",
                overflow: "visible",
                zIndex: cell?.isJumping ? 50 : "auto",
                cursor: isAimingTarget ? "crosshair" : "pointer",
                ...cellAnimStyle,
              }}
            >
              <PlantCell cell={cell} />
            </div>
          );
        })}
      </div>

      {/* Explosions */}
      {explosions.map((exp) => (
        <div
          key={exp.id}
          style={{
            position: "absolute",
            left: `${15 + exp.col * 85 + 42}px`,
            top: `${15 + exp.lane * 85 + 42}px`,
            width: exp.isCherry ? "250px" : "120px",
            height: exp.isCherry ? "250px" : "120px",
            transform: "translate(-50%, -50%)",
            zIndex: 60,
            pointerEvents: "none",
            animation: "bombExplode 0.7s forwards",
          }}
        >
          <img
            src={
              exp.isCherry
                ? "/img/cherry_explosion.png"
                : "/img/mine_explosion.png"
            }
            alt="Explosion"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      ))}

      {/* Projectiles */}
      {projectiles.map((proj) => (
        <div
          key={proj.id}
          style={{
            ...styles.projectile,
            top: `${15 + proj.lane * 85 + 42}px`,
            left: `${proj.x}%`,
            filter: proj.isFrozen
              ? "hue-rotate(170deg) saturate(0) brightness(1.1) drop-shadow(0 0 8px #ADD8E6)"
              : "none",
          }}
        >
          <img
            src={proj.image || "/img/pea.png"}
            alt="pea"
            style={styles.projectileImage}
            onError={(e) => {
              e.target.style.visibility = "hidden";
            }}
          />
        </div>
      ))}

      {/* Flying Cob Cannons */}
      {flyingCobs.map((cob) => {
        if (cob.exploding) {
          const landX = (cob.targetCol / 9) * 810;
          const landY = 15 + cob.lane * 85 + 42;
          return (
            <div
              key={cob.id}
              style={{
                position: "absolute",
                left: `${landX}px`,
                top: `${landY}px`,
                width: "80px",
                height: "80px",
                transform: "translate(-50%, -50%)",
                zIndex: 45,
                animation: "cobExplode 0.5s ease-out forwards",
                pointerEvents: "none",
              }}
            >
              <img
                src="/img/pannocchia2.png"
                alt="explosion"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => {
                  e.target.style.visibility = "hidden";
                }}
              />
            </div>
          );
        }
        const t = cob.progress;
        const startX = ((cob.originCol + 1.5) / 9) * 810;
        const endX = (cob.targetCol / 9) * 810;
        const currentX = startX + (endX - startX) * t;
        const startY = 15 + cob.originLane * 85 + 42;
        const endY = 15 + cob.lane * 85 + 42;
        const midY = Math.min(startY, endY) - 120;
        const arcY =
          (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
        const rotation =
          Math.atan2((endY - midY) * t, (endX - startX) / 9) * (180 / Math.PI);
        return (
          <div
            key={cob.id}
            style={{
              position: "absolute",
              left: `${currentX}px`,
              top: `${arcY}px`,
              width: "80px",
              height: "80px",
              transform: `translate(-50%, -50%) rotate(${rotation + 45}deg)`,
              zIndex: 40,
              pointerEvents: "none",
              filter:
                "drop-shadow(0 0 8px rgba(255,220,100,0.8)) drop-shadow(2px 4px 8px rgba(0,0,0,0.5))",
            }}
          >
            <img
              src="/img/pannocchia.png"
              alt="cob"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => {
                e.target.style.visibility = "hidden";
              }}
            />
          </div>
        );
      })}

      {/* Lightning bolts */}
      {lightningBolts.map((bolt) => {
        const dx = bolt.x2 - bolt.x1,
          dy = bolt.y2 - bolt.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <div
            key={bolt.id}
            style={{
              position: "absolute",
              left: `${bolt.x1}px`,
              top: `${bolt.y1}px`,
              width: `${length}px`,
              height: "2px",
              background: "linear-gradient(90deg, #ffffff, #9be7ff, #ffffff)",
              boxShadow: "0 0 2px #ffffff, 0 0 6px #9be7ff, 0 0 12px #42a5f5",
              borderRadius: "1px",
              transform: `rotate(${angle}deg)`,
              transformOrigin: "0 50%",
              zIndex: 40,
              animation: "lightningFlash 0.15s ease-out forwards",
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Sonic Waves (Oak Tree) - concentric expanding rings */}
      {(sonicWaves || []).map((wave) => {
        const STEP = 87;
        const PADDING = 5;
        const originX = PADDING + wave.col * STEP + STEP;
        const originY = PADDING + wave.lane * STEP + STEP / 2;
        const ringIdx = wave.ring || 0;
        const maxW = STEP * 5;
        const maxH = STEP * 1.5;
        const colors = ["#FFD700", "#FFFF00", "#FFF176"];
        const strokeW = [6, 5, 4];
        const opacities = [1.0, 0.9, 0.75];
        return (
          <svg
            key={wave.id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "810px",
              height: "510px",
              pointerEvents: "none",
              zIndex: 20,
            }}
          >
            <defs>
              <filter
                id={`ringGlow-${wave.id}`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={`M ${originX} ${originY} Q ${originX + maxW * 0.45} ${originY - maxH * 0.5}, ${originX + maxW} ${originY - maxH}`}
              stroke={colors[ringIdx]}
              strokeWidth={strokeW[ringIdx]}
              fill="none"
              strokeOpacity={opacities[ringIdx]}
              filter={`url(#ringGlow-${wave.id})`}
              style={{
                animation: "sonicRingExpand 1s ease-out forwards",
                transformOrigin: `${originX}px ${originY}px`,
              }}
            />
            <path
              d={`M ${originX} ${originY} Q ${originX + maxW * 0.45} ${originY + maxH * 0.5}, ${originX + maxW} ${originY + maxH}`}
              stroke={colors[ringIdx]}
              strokeWidth={strokeW[ringIdx]}
              fill="none"
              strokeOpacity={opacities[ringIdx]}
              filter={`url(#ringGlow-${wave.id})`}
              style={{
                animation: "sonicRingExpand 1s ease-out forwards",
                transformOrigin: `${originX}px ${originY}px`,
              }}
            />
            <path
              d={`M ${originX + maxW} ${originY - maxH} Q ${originX + maxW * 1.08} ${originY}, ${originX + maxW} ${originY + maxH}`}
              stroke={ringIdx === 0 ? "#FFFFFF" : colors[ringIdx]}
              strokeWidth={strokeW[ringIdx] - 1}
              fill="none"
              strokeOpacity={opacities[ringIdx] * 0.95}
              filter={`url(#ringGlow-${wave.id})`}
              style={{
                animation: "sonicRingExpand 1s ease-out forwards",
                transformOrigin: `${originX}px ${originY}px`,
              }}
            />
            {ringIdx === 0 && (
              <circle
                cx={originX}
                cy={originY}
                r={10}
                fill="#FFFFFF"
                opacity={0.95}
                filter={`url(#ringGlow-${wave.id})`}
                style={{ animation: "sonicRingExpand 1s ease-out forwards" }}
              />
            )}
          </svg>
        );
      })}

      {/* Gold Tiles (Bling Yeti) */}
      {(goldTiles || []).map((tile) => {
        const CELL = 85;
        const STEP = 87;
        const PADDING = 5;
        const tileCol = tile.index % 9;
        const tileLane = Math.floor(tile.index / 9);
        const left = PADDING + tileCol * STEP;
        const top = PADDING + tileLane * STEP;
        return (
          <div
            key={tile.id}
            style={{
              position: "absolute",
              left: `${left}px`,
              top: `${top}px`,
              width: `${CELL}px`,
              height: `${CELL}px`,
              backgroundColor: "rgba(255, 215, 0, 0.35)",
              border: "2px solid #FFD700",
              boxShadow:
                "inset 0 0 15px rgba(255,215,0,0.5), 0 0 8px rgba(255,215,0,0.4)",
              pointerEvents: "none",
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              animation: "goldTilePulse 1s ease-in-out infinite alternate",
            }}
          >
            💰
          </div>
        );
      })}

      {/* Dropped suns */}
      {droppedSuns.map((sunItem) => (
        <div
          key={sunItem.id}
          onClick={(e) => onCollectSun(sunItem.id, e)}
          style={{
            position: "absolute",
            zIndex: 30,
            cursor: "pointer",
            animation: "sunPulse 0.8s infinite alternate",
            top: `${sunItem.top}px`,
            left: `${sunItem.left}px`,
            fontSize: "30px",
          }}
        >
          ☀️
        </div>
      ))}

      {/* Zombies */}
      {zombies.map((zombie) => (
        <div
          key={zombie.id}
          style={{
            position: "absolute",
            top: `${15 + zombie.lane * 85}px`,
            left: `${zombie.x}%`,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 20,
            marginTop: "-30px",
          }}
        >
          <div style={styles.zombieHpBarBg}>
            <div
              style={{
                ...styles.zombieHpBarFg,
                width: `${(zombie.hp / zombie.maxHp) * 100}%`,
              }}
            />
          </div>
          <img
            src={zombie.image}
            alt={zombie.type}
            style={{
              ...styles.zombieImage,
              filter: zombie.isSlowed
                ? "hue-rotate(180deg) saturate(1.8) brightness(1.2)"
                : "none",
            }}
            onError={(e) => {
              e.target.style.visibility = "hidden";
            }}
          />
        </div>
      ))}
    </div>
  );
}
