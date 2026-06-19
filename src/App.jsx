import React, { useState, useEffect, useRef } from "react";
import { INITIAL_PLANT_TYPES, ZOMBIE_TYPES } from "./constants";
import GameBoard from "./GameBoard";

const ATTACKING_PLANTS = [
  "PEASHOOTER",
  "GATLINGPEA",
  "SNOWPEA",
  "LIGHTNINGREED",
];

export default function App() {
  const [sun, setSun] = useState(150);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [grid, setGrid] = useState(Array(45).fill(null));
  const [zombies, setZombies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [droppedSuns, setDroppedSuns] = useState([]);
  const [plantTypes, setPlantTypes] = useState(INITIAL_PLANT_TYPES);
  const [vsClicks, setVsClicks] = useState(0);
  const [cutscene, setCutscene] = useState(null);
  const [lightningBolts, setLightningBolts] = useState([]);
  const [cobAiming, setCobAiming] = useState(null);
  const [flyingCobs, setFlyingCobs] = useState([]);
  const [explosions, setExplosions] = useState([]);

  const plantTypesRef = useRef(plantTypes);
  const zombiesRef = useRef(zombies);
  const cobAimingRef = useRef(cobAiming);
  const gridRef = useRef(grid);

  useEffect(() => {
    plantTypesRef.current = plantTypes;
  }, [plantTypes]);
  useEffect(() => {
    zombiesRef.current = zombies;
  }, [zombies]);
  useEffect(() => {
    cobAimingRef.current = cobAiming;
  }, [cobAiming]);
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Passive sun income
  useEffect(() => {
    const interval = setInterval(() => setSun((prev) => prev + 25), 100);
    return () => clearInterval(interval);
  }, []);

  // Flying cobs animation loop
  useEffect(() => {
    const cobLoop = setInterval(() => {
      setFlyingCobs((prev) => {
        if (prev.length === 0) return prev;
        const next = [];
        const toExplode = [];
        for (const cob of prev) {
          if (cob.exploding) {
            const newProgress = cob.explodeProgress + 0.08;
            if (newProgress < 1)
              next.push({ ...cob, explodeProgress: newProgress });
          } else {
            const newProgress = cob.progress + 0.018;
            if (newProgress >= 1) {
              toExplode.push(cob);
              next.push({
                ...cob,
                progress: 1,
                exploding: true,
                explodeProgress: 0,
              });
            } else {
              next.push({ ...cob, progress: newProgress });
            }
          }
        }
        if (toExplode.length > 0) {
          setZombies((prevZombies) => {
            let updated = [...prevZombies];
            for (const cob of toExplode) {
              updated = updated
                .map((z) => {
                  const zombieCol = (z.x / 100) * 9;
                  const laneDiff = Math.abs(z.lane - cob.lane);
                  const colDiff = Math.abs(zombieCol - cob.targetCol);
                  if (laneDiff <= 1 && colDiff <= 1.5) {
                    return { ...z, hp: Math.max(0, z.hp - 900) };
                  }
                  return z;
                })
                .filter((z) => z.hp > 0);
            }
            return updated;
          });
        }
        return next;
      });
    }, 30);
    return () => clearInterval(cobLoop);
  }, []);

  // Normal zombie spawner
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (cutscene) return;
      const randomLane = Math.floor(Math.random() * 5);
      const keys = Object.keys(ZOMBIE_TYPES).filter(
        (k) => k !== "QIN_SHI_HUANG",
      );
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const zombieData = ZOMBIE_TYPES[randomKey];
      setZombies((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          type: randomKey,
          lane: randomLane,
          x: 100,
          hp: zombieData.hp,
          maxHp: zombieData.hp,
          speed: zombieData.speed,
          image: zombieData.image,
          damage: zombieData.damage,
          isSlowed: false,
        },
      ]);
    }, 7000);
    return () => clearInterval(spawnInterval);
  }, [cutscene]);

  // Main game loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (cutscene) return;
      setGrid((prevGrid) => {
        const nextGrid = [...prevGrid];
        const currentPlantTypes = plantTypesRef.current;
        const currentZombies = zombiesRef.current;

        for (let i = 0; i < nextGrid.length; i++) {
          if (!nextGrid[i]) continue;
          const plant = { ...nextGrid[i] };
          const lane = Math.floor(i / 9);
          const col = i % 9;
          const cellTop = 15 + lane * 85;
          const cellLeft = 15 + col * 85;

          // Potato Mine arming
          if (plant.type === "POTATOMINE") {
            if (!plant.armed) {
              plant.armTimer = (plant.armTimer || 0) + 100;
              if (plant.armTimer >= 14000) {
                plant.armed = true;
                plant.image = "/img/potato.jpg";
              }
              nextGrid[i] = plant;
            }
          }

          // Potato Mine trigger
          if (plant.type === "POTATOMINE" && plant.armed) {
            const cellStart = (col * 100) / 9;
            const cellEnd = ((col + 1) * 100) / 9;
            const target = currentZombies.find(
              (z) => z.lane === lane && z.x >= cellStart && z.x <= cellEnd,
            );
            if (target) {
              const explosionId = Date.now() + Math.random();
              setExplosions((prev) => [
                ...prev,
                { id: explosionId, lane, col },
              ]);
              setTimeout(() => {
                setExplosions((prev) =>
                  prev.filter((e) => e.id !== explosionId),
                );
              }, 500);
              setZombies((prev) =>
                prev.filter(
                  (z) =>
                    !(
                      z.lane === lane &&
                      z.x >= cellStart - 5 &&
                      z.x <= cellEnd + 5
                    ),
                ),
              );
              nextGrid[i] = null;
              continue;
            }
          }

          // Push visual timer
          if (plant.isBeingPushed) {
            plant.pushVisualTimer = (plant.pushVisualTimer || 0) + 100;
            if (plant.pushVisualTimer >= 600) {
              delete plant.isBeingPushed;
              delete plant.pushVisualTimer;
            }
            nextGrid[i] = plant;
          }

          // Squash activation
          if (
            (plant.type === "SQUASH" || plant.type === "KING_SQUASH") &&
            !plant.isJumping
          ) {
            const nextCellStartPercent = ((col + 1) / 9) * 100;
            const nextCellHalfPercent = ((col + 1.5) / 9) * 100;
            const targetZombie = currentZombies.find(
              (z) =>
                z.lane === lane &&
                z.hp > 0 &&
                z.x >= nextCellStartPercent &&
                z.x <= nextCellHalfPercent,
            );
            if (targetZombie) {
              plant.isJumping = true;
              plant.jumpOffsetX = 85;
              nextGrid[i] = plant;
              setTimeout(() => {
                setGrid((currentGrid) => {
                  const g = [...currentGrid];
                  g[i] = null;
                  return g;
                });
                if (plant.type === "KING_SQUASH") {
                  setCutscene({ lane });
                  setTimeout(() => setCutscene(null), 3500);
                  setZombies((prevZombies) =>
                    prevZombies.filter((zombie) => {
                      const zombieCol = (zombie.x / 100) * 9;
                      const inside3x3 =
                        Math.abs(zombie.lane - lane) <= 1 &&
                        Math.abs(zombieCol - (col + 1)) <= 1.5;
                      return !(inside3x3 && !ZOMBIE_TYPES[zombie.type].isBoss);
                    }),
                  );
                } else {
                  setZombies((prevZombies) =>
                    prevZombies.filter((zombie) => {
                      const zombieCol = (zombie.x / 100) * 9;
                      return !(
                        zombie.lane === lane &&
                        zombieCol >= col + 0.8 &&
                        zombieCol <= col + 1.8 &&
                        !ZOMBIE_TYPES[zombie.type].isBoss
                      );
                    }),
                  );
                }
              }, 600);
              continue;
            }
          }

          // Cob Cannon cooldown
          if (plant.type === "COBCANNON_BACK" && plant.cobState === "empty") {
            plant.cooldownTimer = (plant.cooldownTimer || 0) + 100;
            if (plant.cooldownTimer >= 30000) {
              plant.cobState = "ready";
              plant.cooldownTimer = 0;
            }
            nextGrid[i] = plant;
          }

          // Sunflower sun generation
          if (plant.type === "SUNFLOWER") {
            plant.cooldownTimer = (plant.cooldownTimer || 0) + 100;
            if (
              plant.cooldownTimer >=
              currentPlantTypes.SUNFLOWER.abilitycooldown * 1000
            ) {
              setDroppedSuns((prevSuns) => [
                ...prevSuns,
                {
                  id: Date.now() + Math.random(),
                  top: cellTop + 40,
                  left: cellLeft + 40,
                },
              ]);
              plant.cooldownTimer = 0;
            }
            nextGrid[i] = plant;
          }

          // Attacking plants
          if (ATTACKING_PLANTS.includes(plant.type)) {
            plant.cooldownTimer = (plant.cooldownTimer || 0) + 100;
            const plantConfig = currentPlantTypes[plant.type];
            const cooldownLimit = (plantConfig?.abilitycooldown || 1.5) * 1000;
            if (plant.cooldownTimer >= cooldownLimit) {
              const plantXPercent = ((col + 0.5) / 9) * 100;
              const hasTarget = currentZombies.some(
                (z) =>
                  z.hp > 0 &&
                  z.x > plantXPercent &&
                  (plant.type === "LIGHTNINGREED"
                    ? Math.abs(z.lane - lane) <= 1
                    : z.lane === lane),
              );
              if (hasTarget) {
                if (plant.type === "LIGHTNINGREED") {
                  setZombies((prevZombies) => {
                    let updated = [...prevZombies];
                    const LANE_HEIGHT_PX = 85,
                      BOARD_WIDTH_PX = 765;
                    const getDistance = (zombie, fromLane, fromXPercent) => {
                      const laneDiffPx =
                        Math.abs(zombie.lane - fromLane) * LANE_HEIGHT_PX;
                      const xDiffPx =
                        (Math.abs(zombie.x - fromXPercent) / 100) *
                        BOARD_WIDTH_PX;
                      return Math.sqrt(
                        laneDiffPx * laneDiffPx + xDiffPx * xDiffPx,
                      );
                    };
                    const firstCandidates = updated.filter(
                      (z) =>
                        z.hp > 0 &&
                        Math.abs(z.lane - lane) <= 1 &&
                        z.x > plantXPercent,
                    );
                    const firstZombie = firstCandidates.sort(
                      (a, b) =>
                        getDistance(a, lane, plantXPercent) -
                        getDistance(b, lane, plantXPercent),
                    )[0];
                    if (firstZombie) {
                      const dmg = plantConfig.damage || 15;
                      let targetsHit = [firstZombie.id];
                      let hitOrder = [firstZombie];
                      updated = updated.map((z) =>
                        z.id === firstZombie.id
                          ? { ...z, hp: Math.max(0, z.hp - dmg) }
                          : z,
                      );
                      for (let chain = 0; chain < 2; chain++) {
                        const lastTarget = updated.find(
                          (z) => z.id === targetsHit[targetsHit.length - 1],
                        );
                        if (!lastTarget) break;
                        const nearbyTargets = updated.filter(
                          (z) =>
                            z.hp > 0 &&
                            !targetsHit.includes(z.id) &&
                            Math.abs(z.lane - lastTarget.lane) <= 1 &&
                            Math.abs(z.x - lastTarget.x) <= 20,
                        );
                        const nextChainZombie = nearbyTargets.sort(
                          (a, b) =>
                            getDistance(a, lastTarget.lane, lastTarget.x) -
                            getDistance(b, lastTarget.lane, lastTarget.x),
                        )[0];
                        if (nextChainZombie) {
                          targetsHit.push(nextChainZombie.id);
                          hitOrder.push(nextChainZombie);
                          updated = updated.map((z) =>
                            z.id === nextChainZombie.id
                              ? { ...z, hp: Math.max(0, z.hp - dmg) }
                              : z,
                          );
                        } else break;
                      }
                      const boltPoints = [
                        { left: cellLeft + 42, top: cellTop + 42 },
                        ...hitOrder.map((z) => ({
                          left: (z.x / 100) * 810,
                          top: 15 + z.lane * 85 + 42,
                        })),
                      ];
                      const newBolts = [];
                      for (let p = 0; p < boltPoints.length - 1; p++) {
                        newBolts.push({
                          id: `bolt-${Date.now()}-${Math.random()}-${p}`,
                          x1: boltPoints[p].left,
                          y1: boltPoints[p].top,
                          x2: boltPoints[p + 1].left,
                          y2: boltPoints[p + 1].top,
                        });
                      }
                      setLightningBolts((prev) => [...prev, ...newBolts]);
                      const boltIds = newBolts.map((b) => b.id);
                      setTimeout(
                        () =>
                          setLightningBolts((prev) =>
                            prev.filter((b) => !boltIds.includes(b.id)),
                          ),
                        150,
                      );
                    }
                    return updated.filter((z) => z.hp > 0);
                  });
                } else {
                  const isSnow = plant.type === "SNOWPEA";
                  const isGatling = plant.type === "GATLINGPEA";
                  const spawnPea = (delay = 0) => {
                    setTimeout(() => {
                      setProjectiles((prev) => [
                        ...prev,
                        {
                          id: `proj-${Date.now()}-${Math.random()}`,
                          lane,
                          x: ((col + 0.8) / 9) * 100,
                          damage: plantConfig.damage || 20,
                          isFrozen: isSnow,
                          image: "/img/pea.png",
                        },
                      ]);
                    }, delay);
                  };
                  if (isGatling) {
                    spawnPea(0);
                    spawnPea(80);
                    spawnPea(160);
                    spawnPea(240);
                  } else spawnPea(0);
                }
                plant.cooldownTimer = 0;
              }
            }
            nextGrid[i] = plant;
          }
        }

        // Zombie movement and attack
        setZombies((prevZombies) => {
          return prevZombies
            .map((zombie) => {
              let zombieEating = false;
              let updatedZombie = { ...zombie };
              if (updatedZombie.type === "QIN_SHI_HUANG") {
                updatedZombie.lastSpecialAttack =
                  (updatedZombie.lastSpecialAttack || 0) + 100;
              }
              for (let col = 0; col < 9; col++) {
                const cellIndex = updatedZombie.lane * 9 + col;
                const plant = nextGrid[cellIndex];
                if (plant) {
                  if (
                    (plant.type === "SQUASH" || plant.type === "KING_SQUASH") &&
                    plant.isJumping
                  )
                    continue;
                  const cellLeftEdge = (col * 100) / 9;
                  const cellRightEdge = ((col + 1) * 100) / 9;
                  if (
                    updatedZombie.x >= cellLeftEdge &&
                    updatedZombie.x <= cellRightEdge
                  ) {
                    zombieEating = true;
                    if (
                      updatedZombie.type === "QIN_SHI_HUANG" &&
                      (updatedZombie.isFirstAttack === undefined ||
                        updatedZombie.isFirstAttack ||
                        updatedZombie.lastSpecialAttack >= 40000)
                    ) {
                      updatedZombie.isFirstAttack = false;
                      updatedZombie.lastSpecialAttack = 0;
                      const behindCellIndex = cellIndex - 1;
                      const hasBehindCell = col > 0;
                      const isBehindCellFree =
                        hasBehindCell && nextGrid[behindCellIndex] === null;
                      const pushedPlant = {
                        ...plant,
                        isBeingPushed: true,
                        pushVisualTimer: 0,
                      };
                      if (hasBehindCell && isBehindCellFree) {
                        nextGrid[behindCellIndex] = pushedPlant;
                        nextGrid[cellIndex] = null;
                      } else {
                        nextGrid[cellIndex] = pushedPlant;
                        setTimeout(() => {
                          setGrid((g) => {
                            const updatedGrid = [...g];
                            if (updatedGrid[cellIndex]?.isBeingPushed)
                              updatedGrid[cellIndex] = null;
                            return updatedGrid;
                          });
                        }, 200);
                      }
                    } else {
                      const damagePerTick = updatedZombie.damage / 10;
                      const damagedPlant = { ...plant };
                      if (damagedPlant.hp - damagePerTick <= 0) {
                        if (
                          damagedPlant.type === "COBCANNON_BACK" &&
                          damagedPlant.frontIndex !== undefined
                        ) {
                          nextGrid[damagedPlant.frontIndex] = null;
                        }
                        if (
                          damagedPlant.type === "COBCANNON_FRONT" &&
                          damagedPlant.backIndex !== undefined
                        ) {
                          nextGrid[damagedPlant.backIndex] = null;
                        }
                        nextGrid[cellIndex] = null;
                      } else {
                        damagedPlant.hp -= damagePerTick;
                        if (damagedPlant.type === "ACORN")
                          damagedPlant.acornCount = Math.ceil(
                            damagedPlant.hp / 50,
                          );
                        if (
                          damagedPlant.type === "COBCANNON_BACK" &&
                          damagedPlant.frontIndex !== undefined &&
                          nextGrid[damagedPlant.frontIndex]
                        ) {
                          nextGrid[damagedPlant.frontIndex] = {
                            ...nextGrid[damagedPlant.frontIndex],
                            hp: damagedPlant.hp,
                            maxHp: damagedPlant.maxHp,
                          };
                        }
                        if (
                          damagedPlant.type === "COBCANNON_FRONT" &&
                          damagedPlant.backIndex !== undefined &&
                          nextGrid[damagedPlant.backIndex]
                        ) {
                          nextGrid[damagedPlant.backIndex] = {
                            ...nextGrid[damagedPlant.backIndex],
                            hp: damagedPlant.hp,
                            maxHp: damagedPlant.maxHp,
                          };
                        }
                        nextGrid[cellIndex] = damagedPlant;
                      }
                    }
                    break;
                  }
                }
              }
              const nextX = zombieEating
                ? updatedZombie.x
                : updatedZombie.x - updatedZombie.speed;
              return { ...updatedZombie, x: nextX };
            })
            .filter((zombie) => {
              if (zombie.x <= 0) {
                alert("I zombie hanno mangiato il tuo cervello! GAME OVER");
                window.location.reload();
                return false;
              }
              return zombie.hp > 0;
            });
        });

        return nextGrid;
      });
    }, 100);
    return () => clearInterval(gameLoop);
  }, [cutscene]);

  // Projectile loop
  useEffect(() => {
    const projectileLoop = setInterval(() => {
      if (cutscene) return;
      setProjectiles((prevProjectiles) => {
        if (prevProjectiles.length === 0) return prevProjectiles;
        const survivingProjectiles = [];
        const damageMap = {};
        const freezeMap = {};
        const currentZombies = zombiesRef.current;
        const PROJECTILE_SPEED = 1.5;
        for (const proj of prevProjectiles) {
          const nextX = proj.x + PROJECTILE_SPEED;
          const hitZombie = currentZombies.find(
            (z) => z.lane === proj.lane && z.hp > 0 && nextX >= z.x,
          );
          if (hitZombie) {
            damageMap[hitZombie.id] =
              (damageMap[hitZombie.id] || 0) + proj.damage;
            if (proj.isFrozen) freezeMap[hitZombie.id] = true;
          } else if (nextX < 105) {
            survivingProjectiles.push({ ...proj, x: nextX });
          }
        }
        if (Object.keys(damageMap).length > 0) {
          setZombies((prevZombies) =>
            prevZombies
              .map((z) => {
                if (damageMap[z.id]) {
                  let updatedHp = Math.max(0, z.hp - damageMap[z.id]);
                  let updatedSpeed = z.speed;
                  if (freezeMap[z.id] && !z.isSlowed) {
                    updatedSpeed = z.speed * 0.5;
                    setTimeout(() => {
                      setZombies((curr) =>
                        curr.map((currZ) =>
                          currZ.id === z.id
                            ? {
                                ...currZ,
                                speed: ZOMBIE_TYPES[currZ.type].speed,
                                isSlowed: false,
                              }
                            : currZ,
                        ),
                      );
                    }, 4000);
                  }
                  return {
                    ...z,
                    hp: updatedHp,
                    speed: updatedSpeed,
                    isSlowed: freezeMap[z.id] ? true : z.isSlowed,
                  };
                }
                return z;
              })
              .filter((z) => z.hp > 0),
          );
        }
        return survivingProjectiles;
      });
    }, 30);
    return () => clearInterval(projectileLoop);
  }, [cutscene]);

  const handleSelectPlant = (key) => {
    if (cobAiming !== null) {
      setGrid((prevGrid) => {
        const g = [...prevGrid];
        const frontIdx = g[cobAiming]?.frontIndex;
        if (g[cobAiming]) g[cobAiming] = { ...g[cobAiming], cobState: "ready" };
        if (frontIdx !== undefined && g[frontIdx])
          g[frontIdx] = { ...g[frontIdx], cobState: "ready" };
        return g;
      });
    }
    setSelectedPlant(selectedPlant === key ? null : key);
    setCobAiming(null);
  };

  const handleVsClick = () => {
    if (plantTypes.ACORN) return;
    const nextClicks = vsClicks + 1;
    setVsClicks(nextClicks);
    if (nextClicks === 3) {
      setPlantTypes((prev) => ({
        ...prev,
        ACORN: {
          name: "Acorn",
          cost: 100,
          image: "/img/acorn.png",
          abilitycooldown: 0,
          hp: 50,
        },
      }));
      alert("Meme Attivato! Hai sbloccato l'Acorn! 🌳🐿️");
    }
  };

  const fireCobCannon = (backIndex, targetLane, targetCol) => {
    const backLane = Math.floor(backIndex / 9);
    const backCol = backIndex % 9;
    setFlyingCobs((prev) => [
      ...prev,
      {
        id: `cob-${Date.now()}-${Math.random()}`,
        originLane: backLane,
        originCol: backCol,
        lane: targetLane,
        targetCol: targetCol + 0.5,
        progress: 0,
        exploding: false,
        explodeProgress: 0,
      },
    ]);
    setGrid((prevGrid) => {
      const g = [...prevGrid];
      const back = g[backIndex];
      if (!back) return g;
      const frontIndex = back.frontIndex;
      g[backIndex] = { ...back, cobState: "empty", cooldownTimer: 0 };
      if (frontIndex !== undefined && g[frontIndex])
        g[frontIndex] = { ...g[frontIndex], cobState: "empty" };
      return g;
    });
  };

  const handleCellClick = (index) => {
    const lane = Math.floor(index / 9);
    const col = index % 9;
    const currentPlantInCell = grid[index];

    if (cobAiming !== null) {
      const backLane = Math.floor(cobAiming / 9);
      if (lane === backLane) {
        fireCobCannon(cobAiming, lane, col);
      } else {
        setGrid((prevGrid) => {
          const g = [...prevGrid];
          const frontIdx = g[cobAiming]?.frontIndex;
          if (g[cobAiming])
            g[cobAiming] = { ...g[cobAiming], cobState: "ready" };
          if (frontIdx !== undefined && g[frontIdx])
            g[frontIdx] = { ...g[frontIdx], cobState: "ready" };
          return g;
        });
      }
      setCobAiming(null);
      return;
    }

    if (!selectedPlant) {
      const cell = grid[index];
      if (cell && cell.type === "COBCANNON_BACK" && cell.cobState === "ready") {
        setCobAiming(index);
        setGrid((prevGrid) => {
          const g = [...prevGrid];
          const frontIdx = g[index]?.frontIndex;
          g[index] = { ...g[index], cobState: "aiming" };
          if (frontIdx !== undefined && g[frontIdx])
            g[frontIdx] = { ...g[frontIdx], cobState: "aiming" };
          return g;
        });
      }
      return;
    }

    if (selectedPlant === "COBCANNON") {
      if (col >= 8) {
        alert("Non c'è spazio per la parte frontale!");
        return;
      }
      const frontIndex = index + 1;
      if (grid[index] !== null || grid[frontIndex] !== null) {
        alert("Entrambe le caselle devono essere libere!");
        return;
      }
      const plantData = plantTypes.COBCANNON;
      if (sun < plantData.cost) {
        alert("Soli insufficienti!");
        return;
      }
      setSun(sun - plantData.cost);
      const newGrid = [...grid];
      newGrid[index] = {
        type: "COBCANNON_BACK",
        image: "/img/corn.jpg",
        hp: plantData.hp,
        maxHp: plantData.hp,
        cooldownTimer: 0,
        cobState: "ready",
        frontIndex,
      };
      newGrid[frontIndex] = {
        type: "COBCANNON_FRONT",
        image: "/img/corn.jpg",
        hp: plantData.hp,
        maxHp: plantData.hp,
        cobState: "ready",
        backIndex: index,
      };
      setGrid(newGrid);
      setSelectedPlant(null);
      return;
    }

    const plantData = plantTypes[selectedPlant];
    if (sun < plantData.cost) {
      alert("Soli insufficienti!");
      return;
    }
    const newGrid = [...grid];

    if (selectedPlant === "SQUASH") {
      if (currentPlantInCell !== null) return;
      setSun(sun - plantData.cost);
      const isRoyal = Math.random() < 0.001;
      if (isRoyal) {
        newGrid[index] = {
          type: "KING_SQUASH",
          image: "/img/kingsquash.png",
          hp: plantData.hp,
          maxHp: plantData.hp,
          cooldownTimer: 0,
          isGold: true,
          isGiant: true,
          isJumping: false,
          jumpOffsetX: 0,
        };
        setZombies((prev) => [
          ...prev,
          {
            id: `qin-${Date.now()}`,
            type: "QIN_SHI_HUANG",
            lane,
            x: 100,
            hp: ZOMBIE_TYPES.QIN_SHI_HUANG.hp,
            maxHp: ZOMBIE_TYPES.QIN_SHI_HUANG.hp,
            speed: ZOMBIE_TYPES.QIN_SHI_HUANG.speed,
            image: ZOMBIE_TYPES.QIN_SHI_HUANG.image,
            damage: ZOMBIE_TYPES.QIN_SHI_HUANG.damage,
            isFirstAttack: true,
            lastSpecialAttack: 0,
            isSlowed: false,
          },
        ]);
      } else {
        newGrid[index] = {
          type: "SQUASH",
          image: plantData.image,
          hp: plantData.hp,
          maxHp: plantData.hp,
          cooldownTimer: 0,
          isJumping: false,
          jumpOffsetX: 0,
        };
      }
      setGrid(newGrid);
      setSelectedPlant(null);
      return;
    }

    if (selectedPlant === "CHERRYBOMB") {
      if (currentPlantInCell !== null) return;
      setSun(sun - plantData.cost);
      newGrid[index] = {
        type: "CHERRYBOMB",
        image: plantData.image,
        hp: 1,
        maxHp: 1,
      };
      setGrid(newGrid);
      const explosionId = Date.now() + Math.random();
      setExplosions((prev) => [
        ...prev,
        { id: explosionId, lane, col, isCherry: true },
      ]);
      setTimeout(() => {
        setExplosions((prev) => prev.filter((e) => e.id !== explosionId));
      }, 700);
      setTimeout(() => {
        setZombies((prev) =>
          prev.filter((z) => {
            const zombieCol = (z.x / 100) * 9;
            return !(
              Math.abs(z.lane - lane) <= 1 && Math.abs(zombieCol - col) <= 1
            );
          }),
        );
        setGrid((g) => {
          const updated = [...g];
          updated[index] = null;
          return updated;
        });
      }, 150);
      setSelectedPlant(null);
      return;
    }

    if (selectedPlant === "POTATOMINE") {
      if (currentPlantInCell !== null) return;
      setSun(sun - plantData.cost);
      newGrid[index] = {
        type: "POTATOMINE",
        image: "/img/potato.jpg",
        hp: plantData.hp,
        maxHp: plantData.hp,
        armed: false,
        armTimer: 0,
      };
      setGrid(newGrid);
      setSelectedPlant(null);
      return;
    }

    if (selectedPlant === "ACORN") {
      if (currentPlantInCell === null) {
        setSun(sun - plantData.cost);
        newGrid[index] = {
          type: "ACORN",
          image: plantData.image,
          hp: 50,
          maxHp: 50,
          cooldownTimer: 0,
          acornCount: 1,
        };
        setGrid(newGrid);
        setSelectedPlant(null);
      } else if (currentPlantInCell.type === "ACORN") {
        const nextCount = currentPlantInCell.acornCount + 1;
        setSun(sun - plantData.cost);
        if (nextCount === 3) {
          newGrid[index] = {
            type: "OAK",
            image: "/img/oak.png",
            hp: 2000,
            maxHp: 2000,
            cooldownTimer: 0,
            isGiant: true,
          };
        } else {
          newGrid[index] = {
            ...currentPlantInCell,
            acornCount: nextCount,
            hp: currentPlantInCell.hp + 50,
            maxHp: currentPlantInCell.maxHp + 50,
          };
        }
        setGrid(newGrid);
        setSelectedPlant(null);
      }
      return;
    }

    if (currentPlantInCell !== null) return;
    setSun(sun - plantData.cost);
    newGrid[index] = {
      type: selectedPlant,
      image: plantData.image,
      hp: plantData.hp,
      maxHp: plantData.hp,
      cooldownTimer: 0,
    };
    setGrid(newGrid);
    setSelectedPlant(null);
  };

  const handleCellRightClick = (e, index) => {
    e.preventDefault();
    if (cobAiming !== null) {
      setGrid((prevGrid) => {
        const g = [...prevGrid];
        const back = g[cobAiming];
        if (!back) return g;
        const frontIdx = back.frontIndex;
        g[cobAiming] = { ...back, cobState: "ready" };
        if (frontIdx !== undefined && g[frontIdx])
          g[frontIdx] = { ...g[frontIdx], cobState: "ready" };
        return g;
      });
      setCobAiming(null);
    }
  };

  const handleCollectSun = (id, e) => {
    e.stopPropagation();
    setSun((prev) => prev + 25);
    setDroppedSuns((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        backgroundColor: "#333",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes sunPulse { 0% { transform: scale(1); } 100% { transform: scale(1.2); } }
        @keyframes oakPulse { 0% { transform: translate(-50%, -62%) scale(2.8); } 100% { transform: translate(-50%, -62%) scale(3.0); } }
        @keyframes kingSquashPulse { 0% { transform: translate(-50%, -55%) scale(2.3); filter: drop-shadow(0 0 4px gold); } 100% { transform: translate(-50%, -55%) scale(2.5); filter: drop-shadow(0 0 16px gold); } }
        @keyframes squashJump { 0% { transform: translateY(0) translateX(0) scale(1); } 40% { transform: translateY(-60px) translateX(42px) scale(1.2); } 100% { transform: translateY(0) translateX(85px) scale(0.9); } }
        @keyframes kingSquashJump { 0% { transform: translate(-50%, -55%) translateY(0) translateX(0) scale(2.4); filter: drop-shadow(0 0 4px gold); } 40% { transform: translate(-50%, -55%) translateY(-70px) translateX(42px) scale(2.7); filter: drop-shadow(0 0 15px gold); } 100% { transform: translate(-50%, -55%) translateY(0) translateX(85px) scale(2.2); filter: drop-shadow(0 0 25px gold); } }
        @keyframes goldPushGlow { 0% { background-color: rgba(255, 215, 0, 0.6); box-shadow: inset 0 0 20px gold; } 100% { background-color: transparent; box-shadow: inset 0 0 0px transparent; } }
        @keyframes cutsceneFade { 0% { opacity: 0; transform: scale(0.8); } 20% { opacity: 1; transform: scale(1); } 80% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.1); } }
        @keyframes lightningFlash { 0% { opacity: 1; } 50% { opacity: 0.9; } 100% { opacity: 0; } }
        @keyframes cobAimPulse { 0% { filter: drop-shadow(0 0 4px #ffcc00); } 100% { filter: drop-shadow(0 0 14px #ff6600); } }
        @keyframes cobExplode { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; } }
        @keyframes bombExplode { 0% { transform: translate(-50%, -50%) scale(0.3); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }
      `}</style>

      {/* Cutscene overlay */}
      {cutscene && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#222",
              padding: "30px",
              borderRadius: "15px",
              textAlign: "center",
              border: "4px solid gold",
              animation: "cutsceneFade 3.5s forwards",
            }}
          >
            <img
              src="/img/qinshi.png"
              alt="Qin Shi Huang"
              style={{ width: "150px", height: "150px", objectFit: "contain" }}
            />
            <p
              style={{
                color: "gold",
                fontSize: "20px",
                fontStyle: "italic",
                marginTop: "15px",
                maxWidth: "400px",
              }}
            >
              "A king never wavers, a king never bends, a king never relies on
              others, a king NEVER GIVES UP!"
            </p>
          </div>
        </div>
      )}

      <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
        Plants{" "}
        <span
          onClick={handleVsClick}
          style={{ cursor: "pointer", color: "#ff4444" }}
        >
          vs
        </span>{" "}
        Zombies
      </h1>

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#fbc02d",
            padding: "10px 20px",
            borderRadius: "8px",
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: "bold", color: "#000" }}>
            ☀️ {sun}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            backgroundColor: "#4e342e",
            padding: "10px",
            borderRadius: "10px",
          }}
        >
          {Object.keys(plantTypes).map((key) => {
            const isSelected = selectedPlant === key;
            const canAfford = sun >= plantTypes[key].cost;
            return (
              <button
                key={key}
                onClick={() => handleSelectPlant(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "5px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "140px",
                  textAlign: "left",
                  color: "#000",
                  backgroundColor: isSelected ? "#81c784" : "#f5f5f5",
                  border: isSelected
                    ? "3px solid #2e7d32"
                    : "2px solid #5d4037",
                  opacity: canAfford ? 1 : 0.5,
                }}
              >
                <div
                  style={{ width: "40px", height: "40px", marginRight: "5px" }}
                >
                  <img
                    src={plantTypes[key].image}
                    alt={plantTypes[key].name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.visibility = "hidden";
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                    {plantTypes[key].name}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#2e7d32",
                      fontWeight: "bold",
                    }}
                  >
                    {plantTypes[key].cost}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {selectedPlant && (
          <button
            onClick={() => setSelectedPlant(null)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Annulla
          </button>
        )}
        {cobAiming !== null && (
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: "#e65c00",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "14px",
              animation: "cobAimPulse 0.6s infinite alternate",
            }}
          >
            🌽 Seleziona il bersaglio! (Tasto destro per annullare)
          </div>
        )}
      </div>

      <GameBoard
        grid={grid}
        zombies={zombies}
        projectiles={projectiles}
        flyingCobs={flyingCobs}
        lightningBolts={lightningBolts}
        explosions={explosions}
        droppedSuns={droppedSuns}
        hoveredCell={hoveredCell}
        cobAiming={cobAiming}
        onCellClick={handleCellClick}
        onCellRightClick={handleCellRightClick}
        onCellHover={setHoveredCell}
        onCellLeave={() => setHoveredCell(null)}
        onCollectSun={handleCollectSun}
      />
    </div>
  );
}
