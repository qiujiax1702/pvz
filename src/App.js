import React, { useState, useEffect, useRef } from "react";

const INITIAL_PLANT_TYPES = {
  SUNFLOWER: {
    name: "Sunflower",
    cost: 50,
    image: "/img/sunflower.jpg",
    abilitycooldown: 7,
    hp: 150,
  },
  PEASHOOTER: {
    name: "Peashooter",
    cost: 100,
    image: "/img/peashooter.jpg",
    abilitycooldown: 1.5,
    hp: 200,
    damage: 20,
  },
  WALNUT: {
    name: "Walnut",
    cost: 50,
    image: "/img/Nut.jpg",
    abilitycooldown: 0,
    hp: 700,
  },
  POTATOMINE: {
    name: "Potato Mine",
    cost: 25,
    image: "/img/potato.jpg",
    abilitycooldown: 0,
    hp: 100,
  },
  CABBAGEPULT: {
    name: "Cabbagepult",
    cost: 150,
    image: "/img/Cabbage.jpg",
    abilitycooldown: 2,
    hp: 300,
  },
  TORCHWOOD: {
    name: "Torchwood",
    cost: 125,
    image: "/img/torch.jpg",
    abilitycooldown: 0,
    hp: 300,
  },
  SQUASH: {
    name: "Squash",
    cost: 50,
    image: "/img/squash.jpg",
    abilitycooldown: 0,
    hp: 100000,
  },
  LIGHTNINGREED: {
    name: "Lightning Reed",
    cost: 125,
    image: "/img/lightning.jpg",
    abilitycooldown: 1.5,
    hp: 300,
    damage: 15,
  },
  GATLINGPEA: {
    name: "Gatling Peashooter",
    cost: 225,
    image: "/img/gattling.jpg",
    abilitycooldown: 1.2,
    hp: 300,
    damage: 20,
  },
  CHERRYBOMB: {
    name: "Cherry Bomb",
    cost: 125,
    image: "/img/cherrybomb.jpg",
    abilitycooldown: 0,
    hp: 1,
  },
  CORNLAUNCHER: {
    name: "Corn Launcher",
    cost: 350,
    image: "/img/corn.jpg",
    abilitycooldown: 20,
    hp: 400,
  },
  FUMESHROOM: {
    name: "Fume Shroom",
    cost: 150,
    image: "/img/fumeshroom.jpg",
    abilitycooldown: 1,
    hp: 300,
  },
  CACTUS: {
    name: "Cactus",
    cost: 175,
    image: "/img/cactus.jpg",
    abilitycooldown: 1,
    hp: 300,
  },
  CHOMPER: {
    name: "Chomper",
    cost: 200,
    image: "/img/chomper.jpg",
    abilitycooldown: 30,
    hp: 300,
  },
  SNOWPEA: {
    name: "Snowpea",
    cost: 200,
    image: "/img/snowpea.jpg",
    abilitycooldown: 1.5,
    hp: 200,
    damage: 20,
  },
};

const ZOMBIE_TYPES = {
  REGULAR: {
    name: "Regular Zombie",
    hp: 600,
    speed: 0.15,
    image: "/img/zombie.png",
    damage: 8,
  },
  CONEHEAD: {
    name: "Conehead Zombie",
    hp: 900,
    speed: 0.15,
    image: "/img/zombo.jpg",
    damage: 8,
  },
  BUCKETHEAD: {
    name: "Buckethead Zombie",
    hp: 1200,
    speed: 0.15,
    image: "/img/bucket.jpg",
    damage: 8,
  },
  QUARTERBACK: {
    name: "Quarterback Zombie",
    hp: 1500,
    speed: 0.2,
    image: "/img/quarterback.png",
    damage: 9,
  },
  JOURNALIST: {
    name: "Journalist Zombie",
    hp: 1800,
    speed: 0.15,
    image: "/img/newspaper.png",
    damage: 9,
  },
  YETI: {
    name: "Yeti",
    hp: 7000,
    speed: 0.05,
    image: "/img/yeti.jpg",
    damage: 30,
  },
  QIN_SHI_HUANG: {
    name: "Qin Shi Huang",
    hp: 15000,
    speed: 0.08,
    image: "/img/qinshi.png",
    damage: 25,
    isBoss: true,
  },
};

export default function App() {
  const [sun, setSun] = useState(150);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [grid, setGrid] = useState(Array(45).fill(null));
  const [zombies, setZombies] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const [lasers, setLasers] = useState([]); // Aggiunto per renderizzare i fulmini
  const [hoveredCell, setHoveredCell] = useState(null);
  const [droppedSuns, setDroppedSuns] = useState([]);
  const [plantTypes, setPlantTypes] = useState(INITIAL_PLANT_TYPES);
  const [vsClicks, setVsClicks] = useState(0);
  const [cutscene, setCutscene] = useState(null);

  const plantTypesRef = useRef(plantTypes);
  const zombiesRef = useRef(zombies);

  useEffect(() => {
    plantTypesRef.current = plantTypes;
  }, [plantTypes]);
  useEffect(() => {
    zombiesRef.current = zombies;
  }, [zombies]);

  // Sole passivo
  useEffect(() => {
    const interval = setInterval(() => {
      setSun((prevSun) => prevSun + 25);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Spawn dei zombie normali
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (cutscene) return;

      const randomLane = Math.floor(Math.random() * 5);
      const keys = Object.keys(ZOMBIE_TYPES).filter(
        (k) => k !== "QIN_SHI_HUANG",
      );
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const zombieData = ZOMBIE_TYPES[randomKey];

      const newZombie = {
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
      };

      setZombies((prevZombies) => [...prevZombies, newZombie]);
    }, 7000);
    return () => clearInterval(spawnInterval);
  }, [cutscene]);

  // Game Loop principale
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

          if (plant.isBeingPushed) {
            plant.pushVisualTimer = (plant.pushVisualTimer || 0) + 100;
            if (plant.pushVisualTimer >= 600) {
              delete plant.isBeingPushed;
              delete plant.pushVisualTimer;
            }
            nextGrid[i] = plant;
          }

          // LOGICA ATTIVAZIONE E SALTO SQUASH AVANTI DI UNA CASELLA
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
                  setCutscene({ lane: lane });
                  setTimeout(() => setCutscene(null), 3500);

                  setZombies((prevZombies) =>
                    prevZombies.filter((zombie) => {
                      const zombieCol = (zombie.x / 100) * 9;
                      const inside3x3 =
                        Math.abs(zombie.lane - lane) <= 1 &&
                        Math.abs(zombieCol - (col + 1)) <= 1.5;
                      if (inside3x3 && !ZOMBIE_TYPES[zombie.type].isBoss) {
                        return false;
                      }
                      return true;
                    }),
                  );
                } else {
                  setZombies((prevZombies) =>
                    prevZombies.filter((zombie) => {
                      const zombieCol = (zombie.x / 100) * 9;
                      const matchLane = zombie.lane === lane;
                      const inRange =
                        zombieCol >= col + 0.8 && zombieCol <= col + 1.8;
                      if (
                        matchLane &&
                        inRange &&
                        !ZOMBIE_TYPES[zombie.type].isBoss
                      ) {
                        return false;
                      }
                      return true;
                    }),
                  );
                }
              }, 600);
              continue;
            }
          }

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

          // LOGICA ATTACCO PIANTE
          const ATTACKING_PLANTS = [
            "PEASHOOTER",
            "GATLINGPEA",
            "SNOWPEA",
            "LIGHTNINGREED",
          ];
          if (ATTACKING_PLANTS.includes(plant.type)) {
            plant.cooldownTimer = (plant.cooldownTimer || 0) + 100;
            const plantConfig = currentPlantTypes[plant.type];
            const cooldownLimit = (plantConfig?.abilitycooldown || 1.5) * 1000;

            if (plant.cooldownTimer >= cooldownLimit) {
              const plantXPercent = ((col + 0.5) / 9) * 100;

              let hasTarget = false;
              let validLanes = [lane];

              if (plant.type === "LIGHTNINGREED") {
                // Lightning Reed vede anche la riga sopra e sotto
                validLanes = [lane - 1, lane, lane + 1];
              }

              hasTarget = currentZombies.some(
                (z) =>
                  validLanes.includes(z.lane) &&
                  z.x > plantXPercent &&
                  z.hp > 0,
              );

              if (hasTarget) {
                if (plant.type === "LIGHTNINGREED") {
                  // Logica Fulmini
                  const batchId = Date.now() + Math.random();
                  let newLasers = [];

                  setZombies((prevZombies) => {
                    let updated = [...prevZombies];
                    // Trova il primo zombie più vicino nelle 3 righe
                    const firstZombie = updated
                      .filter(
                        (z) =>
                          validLanes.includes(z.lane) &&
                          z.x > plantXPercent &&
                          z.hp > 0,
                      )
                      .sort((a, b) => a.x - b.x)[0];

                    if (firstZombie) {
                      const dmg = plantConfig.damage || 15;
                      let targetsHit = [firstZombie.id];

                      // Calcola le coordinate del laser dal Lightning Reed al primo zombie
                      const pX = 15 + col * 85 + 42.5;
                      const pY = 15 + lane * 85 + 42.5;
                      const zX1 = 15 + (firstZombie.x / 100) * 765;
                      const zY1 = 15 + firstZombie.lane * 85 + 42.5;
                      newLasers.push({
                        id: Math.random(),
                        batchId,
                        x1: pX,
                        y1: pY,
                        x2: zX1,
                        y2: zY1,
                      });

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

                        // Cerca zombie vicino (1 riga e circa 1,5 blocchi -> 16.6%)
                        const nextChainZombie = updated.find(
                          (z) =>
                            z.hp > 0 &&
                            !targetsHit.includes(z.id) &&
                            Math.abs(z.lane - lastTarget.lane) <= 1 &&
                            Math.abs(z.x - lastTarget.x) <= 16.6,
                        );

                        if (nextChainZombie) {
                          targetsHit.push(nextChainZombie.id);
                          updated = updated.map((z) =>
                            z.id === nextChainZombie.id
                              ? { ...z, hp: Math.max(0, z.hp - dmg) }
                              : z,
                          );

                          // Coordinate del rimbalzo
                          const lastZX = 15 + (lastTarget.x / 100) * 765;
                          const lastZY = 15 + lastTarget.lane * 85 + 42.5;
                          const nextZX = 15 + (nextChainZombie.x / 100) * 765;
                          const nextZY = 15 + nextChainZombie.lane * 85 + 42.5;
                          newLasers.push({
                            id: Math.random(),
                            batchId,
                            x1: lastZX,
                            y1: lastZY,
                            x2: nextZX,
                            y2: nextZY,
                          });
                        } else {
                          break;
                        }
                      }
                    }
                    return updated.filter((z) => z.hp > 0);
                  });

                  if (newLasers.length > 0) {
                    setLasers((prev) => [...prev, ...newLasers]);
                    setTimeout(() => {
                      setLasers((prev) =>
                        prev.filter((l) => l.batchId !== batchId),
                      );
                    }, 150); // Il laser svanisce dopo 150ms
                  }
                } else {
                  // Logica proiettili a scorrimento (Peashooter, Gatling Pea, Snowpea)
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
                        },
                      ]);
                    }, delay);
                  };

                  if (isGatling) {
                    spawnPea(0);
                    spawnPea(80);
                    spawnPea(160);
                    spawnPea(240);
                  } else {
                    spawnPea(0);
                  }
                }
                plant.cooldownTimer = 0;
              }
            }
            nextGrid[i] = plant;
          }
        }

        // Movimento ed attacco Zombie
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
                  ) {
                    continue;
                  }

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
                            if (
                              updatedGrid[cellIndex] &&
                              updatedGrid[cellIndex].isBeingPushed
                            ) {
                              updatedGrid[cellIndex] = null;
                            }
                            return updatedGrid;
                          });
                        }, 200);
                      }
                    } else {
                      const damagePerTick = updatedZombie.damage / 10;
                      const damagedPlant = { ...plant };

                      if (damagedPlant.hp - damagePerTick <= 0) {
                        nextGrid[cellIndex] = null;
                      } else {
                        damagedPlant.hp -= damagePerTick;
                        if (damagedPlant.type === "ACORN") {
                          damagedPlant.acornCount = Math.ceil(
                            damagedPlant.hp / 50,
                          );
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

  // Loop Proiettili e Rallentamento (Frozen)
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
            if (proj.isFrozen) {
              freezeMap[hitZombie.id] = true;
            }
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
                      setZombies((currentZombies) =>
                        currentZombies.map((currZ) =>
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
    setSelectedPlant(selectedPlant === key ? null : key);
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

  const handleCellClick = (index) => {
    if (!selectedPlant) return;
    const plantData = plantTypes[selectedPlant];

    if (sun < plantData.cost) {
      alert("Soli insufficienti!");
      return;
    }

    const currentPlantInCell = grid[index];
    const newGrid = [...grid];
    const lane = Math.floor(index / 9);

    if (selectedPlant === "SQUASH") {
      if (currentPlantInCell !== null) return;
      setSun(sun - plantData.cost);

      const isRoyal = Math.random() < 0.25;

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

        const qinBoss = {
          id: `qin-${Date.now()}`,
          type: "QIN_SHI_HUANG",
          lane: lane,
          x: 100,
          hp: ZOMBIE_TYPES.QIN_SHI_HUANG.hp,
          maxHp: ZOMBIE_TYPES.QIN_SHI_HUANG.hp,
          speed: ZOMBIE_TYPES.QIN_SHI_HUANG.speed,
          image: ZOMBIE_TYPES.QIN_SHI_HUANG.image,
          damage: ZOMBIE_TYPES.QIN_SHI_HUANG.damage,
          isFirstAttack: true,
          lastSpecialAttack: 0,
          isSlowed: false,
        };
        setZombies((prev) => [...prev, qinBoss]);
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
    } else {
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
    }
  };

  const handleCollectSun = (id, e) => {
    e.stopPropagation();
    setSun((prev) => prev + 25);
    setDroppedSuns((prevSuns) => prevSuns.filter((s) => s.id !== id));
  };

  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      backgroundColor: "#333",
      color: "#fff",
      minHeight: "100vh",
    },
    title: { textAlign: "center", marginBottom: "10px" },
    vsTrigger: { cursor: "pointer", color: "#ff4444" },
    topBar: {
      display: "flex",
      gap: "20px",
      alignItems: "center",
      marginBottom: "20px",
    },
    sunCounter: {
      backgroundColor: "#fbc02d",
      padding: "10px 20px",
      borderRadius: "8px",
    },
    sunText: { fontSize: "20px", fontWeight: "bold", color: "#000" },
    seedChooser: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      backgroundColor: "#4e342e",
      padding: "10px",
      borderRadius: "10px",
    },
    seedButton: {
      display: "flex",
      alignItems: "center",
      padding: "5px",
      borderRadius: "5px",
      cursor: "pointer",
      width: "140px",
      textAlign: "left",
      color: "#000",
    },
    seedImageContainer: { width: "40px", height: "40px", marginRight: "5px" },
    seedImage: { width: "100%", height: "100%", objectFit: "cover" },
    btnTextContainer: { display: "flex", flexDirection: "column" },
    plantName: { fontSize: "12px", fontWeight: "bold" },
    costText: { fontSize: "11px", color: "#2e7d32", fontWeight: "bold" },
    cancelButton: {
      padding: "10px 20px",
      backgroundColor: "#d32f2f",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    gameArea: { position: "relative", width: "810px", margin: "0 auto" },
    board: {
      display: "grid",
      gridTemplateColumns: "repeat(9, 85px)",
      gridTemplateRows: "repeat(5, 85px)",
      gap: "2px",
      backgroundColor: "#2e7d32",
      padding: "5px",
      borderRadius: "5px",
    },
    cell: {
      width: "85px",
      height: "85px",
      border: "1px solid #388e3c",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    plantImage: { width: "70px", height: "70px", objectFit: "contain" },
    acornStackContainer: {
      position: "relative",
      width: "70px",
      height: "70px",
    },
    droppedSun: {
      position: "absolute",
      zIndex: 30,
      cursor: "pointer",
      animation: "sunPulse 0.8s infinite alternate",
    },
    zombieHpBarBg: {
      width: "40px",
      height: "4px",
      backgroundColor: "#000",
      marginBottom: "2px",
    },
    zombieHpBarFg: { height: "100%", backgroundColor: "#ff0000" },
    zombieImage: { width: "70px", height: "110px", objectFit: "contain" },
    cutsceneOverlay: {
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
    },
    cutsceneBox: {
      backgroundColor: "#222",
      padding: "30px",
      borderRadius: "15px",
      textAlign: "center",
      border: "4px solid gold",
      animation: "cutsceneFade 3.5s forwards",
    },
    cutsceneQinImage: { width: "150px", height: "150px", objectFit: "contain" },
    cutsceneText: {
      color: "gold",
      fontSize: "20px",
      fontStyle: "italic",
      marginTop: "15px",
      maxWidth: "400px",
    },
    projectile: {
      position: "absolute",
      width: "14px",
      height: "14px",
      borderRadius: "50%",
      zIndex: 25,
      transform: "translateY(-50%)",
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes sunPulse { 0% { transform: scale(1); } 100% { transform: scale(1.2); } }
          @keyframes oakPulse { 0% { transform: translate(-50%, -62%) scale(2.8); } 100% { transform: translate(-50%, -62%) scale(3.0); } }
          @keyframes kingSquashPulse { 0% { transform: translate(-50%, -55%) scale(2.3); filter: drop-shadow(0 0 4px gold); } 100% { transform: translate(-50%, -55%) scale(2.5); filter: drop-shadow(0 0 16px gold); } }
          
          @keyframes squashJump {
            0% { transform: translateY(0) translateX(0) scale(1); }
            40% { transform: translateY(-60px) translateX(42px) scale(1.2); }
            100% { transform: translateY(0) translateX(85px) scale(0.9); }
          }
          @keyframes kingSquashJump {
            0% { transform: translate(-50%, -55%) translateY(0) translateX(0) scale(2.4); filter: drop-shadow(0 0 4px gold); }
            40% { transform: translate(-50%, -55%) translateY(-70px) translateX(42px) scale(2.7); filter: drop-shadow(0 0 15px gold); }
            100% { transform: translate(-50%, -55%) translateY(0) translateX(85px) scale(2.2); filter: drop-shadow(0 0 25px gold); }
          }

          @keyframes peaSpin { 0% { transform: translateY(-50%) rotate(0deg); } 100% { transform: translateY(-50%) rotate(360deg); } }
          @keyframes goldPushGlow { 0% { background-color: rgba(255, 215, 0, 0.6); box-shadow: inset 0 0 20px gold; } 100% { background-color: transparent; box-shadow: inset 0 0 0px transparent; } }
          @keyframes cutsceneFade { 0% { opacity: 0; transform: scale(0.8); } 20% { opacity: 1; transform: scale(1); } 80% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.1); } }
        `}
      </style>

      {cutscene && (
        <div style={styles.cutsceneOverlay}>
          <div style={styles.cutsceneBox}>
            <img
              src="/img/qinshi.png"
              alt="Qin Shi Huang"
              style={styles.cutsceneQinImage}
            />
            <p style={styles.cutsceneText}>
              "A king never wavers, a king never bends, a king never relies on
              others, a king NEVER GIVES UP!"
            </p>
          </div>
        </div>
      )}

      <h1 style={styles.title}>
        Plants{" "}
        <span onClick={handleVsClick} style={styles.vsTrigger}>
          vs
        </span>{" "}
        Zombies
      </h1>

      <div style={styles.topBar}>
        <div style={styles.sunCounter}>
          <span style={styles.sunText}>☀️ {sun}</span>
        </div>
        <div style={styles.seedChooser}>
          {Object.keys(plantTypes).map((key) => {
            const isSelected = selectedPlant === key;
            const canAfford = sun >= plantTypes[key].cost;
            return (
              <button
                key={key}
                onClick={() => handleSelectPlant(key)}
                style={{
                  ...styles.seedButton,
                  backgroundColor: isSelected ? "#81c784" : "#f5f5f5",
                  border: isSelected
                    ? "3px solid #2e7d32"
                    : "2px solid #5d4037",
                  opacity: canAfford ? 1 : 0.5,
                }}
              >
                <div style={styles.seedImageContainer}>
                  <img
                    src={plantTypes[key].image}
                    alt={plantTypes[key].name}
                    style={styles.seedImage}
                    onError={(e) => {
                      e.target.style.visibility = "hidden";
                    }}
                  />
                </div>
                <div style={styles.btnTextContainer}>
                  <span style={styles.plantName}>{plantTypes[key].name}</span>
                  <span style={styles.costText}>{plantTypes[key].cost}</span>
                </div>
              </button>
            );
          })}
        </div>
        {selectedPlant && (
          <button
            onClick={() => setSelectedPlant(null)}
            style={styles.cancelButton}
          >
            Annulla
          </button>
        )}
      </div>

      <div style={styles.gameArea}>
        <div style={styles.board}>
          {grid.map((cell, index) => {
            const cellAnimationClass =
              cell && cell.isBeingPushed
                ? { animation: "goldPushGlow 0.6s ease-out" }
                : {};

            return (
              <div
                key={index}
                onClick={() => handleCellClick(index)}
                onMouseEnter={() => setHoveredCell(index)}
                onMouseLeave={() => setHoveredCell(null)}
                style={{
                  ...styles.cell,
                  backgroundColor:
                    hoveredCell === index
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                  ...cellAnimationClass,
                }}
              >
                {cell && (
                  <div
                    style={
                      cell.type === "ACORN" ? styles.acornStackContainer : {}
                    }
                  >
                    <img
                      src={cell.image}
                      alt={cell.type}
                      style={{
                        ...styles.plantImage,
                        ...(cell.isJumping
                          ? {
                              animation:
                                cell.type === "KING_SQUASH"
                                  ? "kingSquashJump 0.6s linear"
                                  : "squashJump 0.6s linear",
                            }
                          : {}),
                        ...(cell.type === "OAK"
                          ? {
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -62%) scale(2.8)",
                              animation: "oakPulse 2s infinite alternate",
                              zIndex: 10,
                            }
                          : {}),
                        ...(cell.type === "KING_SQUASH" && !cell.isJumping
                          ? {
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -55%) scale(2.3)",
                              filter: "drop-shadow(0 0 4px gold)",
                              animation:
                                "kingSquashPulse 1.5s infinite alternate",
                              zIndex: 10,
                            }
                          : {}),
                      }}
                      onError={(e) => {
                        e.target.style.visibility = "hidden";
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Render Zombies */}
          {zombies.map((z) => (
            <div
              key={z.id}
              style={{
                position: "absolute",
                top: 15 + z.lane * 85 - 15,
                left: 15 + (z.x / 100) * 765 - 35,
                zIndex: z.isBoss ? 20 : 5,
                transition: "left 0.1s linear",
              }}
            >
              <div style={styles.zombieHpBarBg}>
                <div
                  style={{
                    ...styles.zombieHpBarFg,
                    width: `${(z.hp / z.maxHp) * 100}%`,
                  }}
                />
              </div>
              <img
                src={z.image}
                alt={z.type}
                style={{
                  ...styles.zombieImage,
                  filter: z.isSlowed
                    ? "sepia(1) hue-rotate(180deg) saturate(3)"
                    : "none",
                }}
                onError={(e) => {
                  e.target.style.visibility = "hidden";
                }}
              />
            </div>
          ))}

          {/* Render Projectiles */}
          {projectiles.map((p) => (
            <div
              key={p.id}
              style={{
                ...styles.projectile,
                top: 15 + p.lane * 85 + 42.5,
                left: 15 + (p.x / 100) * 765,
                backgroundColor: p.isFrozen ? "#00ffff" : "#76ff03",
                animation: "peaSpin 0.5s linear infinite",
              }}
            />
          ))}

          {/* RenderDroppedSuns */}
          {droppedSuns.map((s) => (
            <div
              key={s.id}
              style={{ ...styles.droppedSun, top: s.top, left: s.left }}
              onClick={(e) => handleCollectSun(s.id, e)}
            >
              <span style={{ fontSize: "30px" }}>☀️</span>
            </div>
          ))}

          {/* Render Laser Effect Lightning Reed */}
          {lasers.map((l) => {
            const dx = l.x2 - l.x1;
            const dy = l.y2 - l.y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

            return (
              <div
                key={l.id}
                style={{
                  position: "absolute",
                  top: l.y1,
                  left: l.x1,
                  width: `${length}px`,
                  height: "4px",
                  backgroundColor: "#00ffff",
                  boxShadow: "0 0 10px 2px #00ffff",
                  transformOrigin: "0 50%",
                  transform: `translateY(-50%) rotate(${angle}deg)`,
                  zIndex: 30,
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
