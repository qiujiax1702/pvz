import React, { useState, useEffect } from "react";

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
  },
  GATLINGPEA: {
    name: "Gatling Peashooter",
    cost: 225,
    image: "/img/gattling.jpg",
    abilitycooldown: 0.25,
    hp: 300,
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
  },
};

const ZOMBIE_TYPES = {
  REGULAR: {
    name: "Regular Zombie",
    hp: 200,
    speed: 0.15,
    image: "/img/zombie.png",
    damage: 8,
  },
  CONEHEAD: {
    name: "Conehead Zombie",
    hp: 400,
    speed: 0.15,
    image: "/img/zombo.jpg",
    damage: 8,
  },
  BUCKETHEAD: {
    name: "Buckethead Zombie",
    hp: 600,
    speed: 0.15,
    image: "/img/bucket.jpg",
    damage: 8,
  },
  QUARTERBACK: {
    name: "Quarterback Zombie",
    hp: 800,
    speed: 0.2,
    image: "/img/quarterback.png",
    damage: 9,
  },
  JOURNALIST: {
    name: "Journalist Zombie",
    hp: 800,
    speed: 0.15,
    image: "/img/newspaper.png",
    damage: 9,
  },
  YETI: {
    name: "Yeti",
    hp: 1500,
    speed: 0.05,
    image: "/img/yeti.jpg",
    damage: 30,
  },
};

export default function App() {
  const [sun, setSun] = useState(150);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [grid, setGrid] = useState(Array(45).fill(null));
  const [zombies, setZombies] = useState([]);
  const [projectiles, setProjectiles] = useState([]); // Stato per i proiettili
  const [hoveredCell, setHoveredCell] = useState(null);
  const [droppedSuns, setDroppedSuns] = useState([]);

  const [plantTypes, setPlantTypes] = useState(INITIAL_PLANT_TYPES);
  const [vsClicks, setVsClicks] = useState(0);

  // Sole passivo dal cielo
  useEffect(() => {
    const interval = setInterval(() => {
      setSun((prevSun) => prevSun + 25);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Spawn dei zombie
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      const randomLane = Math.floor(Math.random() * 5);
      const keys = Object.keys(ZOMBIE_TYPES);
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
      };

      setZombies((prevZombies) => [...prevZombies, newZombie]);
    }, 7000);
    return () => clearInterval(spawnInterval);
  }, []);

  // Game Loop principale (Gestione piante, spari e zombie)
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGrid((prevGrid) => {
        const nextGrid = [...prevGrid];

        // Gestione abilità delle Piante (Girasoli e Peashooter)
        for (let i = 0; i < nextGrid.length; i++) {
          if (!nextGrid[i]) continue;

          const plant = { ...nextGrid[i] };
          const lane = Math.floor(i / 9);
          const col = i % 9;

          // Calcolo coordinate cella per posizionamento grafico
          const cellTop = 15 + lane * (80 + 5);
          const cellLeft = 15 + col * (80 + 5);

          // 1. Girasole
          if (plant.type === "SUNFLOWER") {
            plant.cooldownTimer = (plant.cooldownTimer || 0) + 100;
            const targetCooldown = plantTypes.SUNFLOWER.abilitycooldown * 1000;

            if (plant.cooldownTimer >= targetCooldown) {
              const newSun = {
                id: Date.now() + Math.random(),
                top: cellTop + 40,
                left: cellLeft + 40,
              };
              setDroppedSuns((prevSuns) => [...prevSuns, newSun]);
              plant.cooldownTimer = 0;
            }
            nextGrid[i] = plant;
          }

          // 2. Peashooter (Spara solo se ci sono zombie nella stessa corsia, davanti alla pianta)
          if (plant.type === "PEASHOOTER") {
            plant.cooldownTimer = (plant.cooldownTimer || 0) + 100;
            const targetCooldown = plantTypes.PEASHOOTER.abilitycooldown * 1000;

            if (plant.cooldownTimer >= targetCooldown) {
              // Posizione percentuale della pianta lungo la corsia (stessa scala usata per gli zombie e i proiettili)
              const plantXPercent = ((col + 0.5) / 9) * 100;
              const zombieInLane = zombies.some(
                (z) => z.lane === lane && z.x > plantXPercent && z.hp > 0,
              );

              if (zombieInLane) {
                const newProjectile = {
                  id: `proj-${Date.now()}-${Math.random()}`,
                  lane: lane,
                  // Stessa scala percentuale usata da zombie.x: 0 = bordo sinistro, 100 = bordo destro della board
                  x: ((col + 0.8) / 9) * 100,
                  damage: plantTypes.PEASHOOTER.damage,
                };
                setProjectiles((prev) => [...prev, newProjectile]);
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

              for (let col = 0; col < 9; col++) {
                const cellIndex = zombie.lane * 9 + col;
                const plant = nextGrid[cellIndex];

                if (plant) {
                  const cellLeftEdge = (col * 100) / 9;
                  const cellRightEdge = ((col + 1) * 100) / 9;

                  if (zombie.x >= cellLeftEdge && zombie.x <= cellRightEdge) {
                    zombieEating = true;
                    const damagePerTick = zombie.damage / 10;
                    const damagedPlant = { ...plant };

                    if (damagedPlant.hp - damagePerTick <= 0) {
                      nextGrid[cellIndex] = null;
                    } else {
                      damagedPlant.hp -= damagePerTick;

                      if (damagedPlant.type === "ACORN") {
                        const expectedCount = Math.ceil(damagedPlant.hp / 50);
                        if (expectedCount < damagedPlant.acornCount) {
                          damagedPlant.acornCount = expectedCount;
                        }
                      }
                      nextGrid[cellIndex] = damagedPlant;
                    }
                    break;
                  }
                }
              }

              const nextX = zombieEating ? zombie.x : zombie.x - zombie.speed;
              return { ...zombie, x: nextX };
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
  }, [plantTypes, zombies]);

  // Loop separato ad alta frequenza per il movimento dei proiettili e le collisioni.
  // Logica riscritta per evitare l'aggiornamento annidato setZombies-dentro-setProjectiles:
  // ora leggiamo zombies e projectiles come "snapshot" coerenti dello stesso tick,
  // calcoliamo TUTTE le collisioni in un unico passaggio puro, e poi applichiamo
  // un solo setProjectiles e un solo setZombies. Questo elimina la race condition
  // della variabile `hit` catturata per chiusura e i danni doppi/mancati.
  useEffect(() => {
    const projectileLoop = setInterval(() => {
      setProjectiles((prevProjectiles) => {
        if (prevProjectiles.length === 0) return prevProjectiles;

        // Mappa danno-da-applicare per id zombie, accumulata in questo tick
        const damageByZombieId = new Map();
        const survivingProjectiles = [];

        setZombies((currentZombies) => {
          // Indicizziamo gli zombie vivi per corsia, ordinati dal più vicino (x minore) al più lontano,
          // così un proiettile colpisce sempre il primo zombie utile che incontra sul suo cammino.
          const zombiesByLane = new Map();
          for (const z of currentZombies) {
            if (z.hp <= 0) continue;
            if (!zombiesByLane.has(z.lane)) zombiesByLane.set(z.lane, []);
            zombiesByLane.get(z.lane).push(z);
          }
          for (const list of zombiesByLane.values()) {
            list.sort((a, b) => a.x - b.x);
          }

          // Teniamo traccia di quanto danno "già pianificato" ha ogni zombie in questo tick,
          // così se un proiettile lo considera già abbattuto (hp pianificato <= 0) lo saltiamo
          // e passiamo al prossimo target nella stessa corsia.
          const plannedDamage = new Map();

          const PROJECTILE_SPEED = 1.5; // stessa velocità percentuale di prima
          const HIT_RADIUS = 3; // percentuale: distanza entro cui consideriamo "colpito"

          for (const proj of prevProjectiles) {
            const newX = proj.x + PROJECTILE_SPEED;
            const candidates = zombiesByLane.get(proj.lane) || [];

            let hitZombie = null;
            for (const z of candidates) {
              const alreadyPlanned = plannedDamage.get(z.id) || 0;
              const effectiveHp = z.hp - alreadyPlanned;
              if (effectiveHp <= 0) continue; // questo zombie morirà già per altri colpi pianificati

              // Il proiettile colpisce se ha raggiunto o superato la posizione dello zombie
              if (newX >= z.x - HIT_RADIUS) {
                hitZombie = z;
                break;
              }
            }

            if (hitZombie) {
              const prevDamage = damageByZombieId.get(hitZombie.id) || 0;
              damageByZombieId.set(hitZombie.id, prevDamage + proj.damage);
              plannedDamage.set(
                hitZombie.id,
                (plannedDamage.get(hitZombie.id) || 0) + proj.damage,
              );
              // proiettile consumato, non sopravvive al tick
            } else if (newX < 105) {
              survivingProjectiles.push({ ...proj, x: newX });
            }
            // se newX >= 105 e non ha colpito nulla, il proiettile esce semplicemente di scena
          }

          if (damageByZombieId.size === 0) {
            return currentZombies; // nessuna modifica, evitiamo un re-render inutile
          }

          return currentZombies.map((z) => {
            const dmg = damageByZombieId.get(z.id);
            if (!dmg) return z;
            return { ...z, hp: z.hp - dmg };
          });
        });

        return survivingProjectiles;
      });
    }, 30);

    return () => clearInterval(projectileLoop);
  }, []);

  const handleSelectPlant = (key) => {
    if (selectedPlant === key) {
      setSelectedPlant(null);
    } else {
      setSelectedPlant(key);
    }
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

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes sunPulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            100% { transform: translate(-50%, -50%) scale(1.2); }
          }
          @keyframes oakPulse {
            0% { transform: translate(-50%, -62%) scale(3); }
            100% { transform: translate(-50%, -62%) scale(3.15); }
          }
          @keyframes peaSpin {
            0% { transform: translateY(-50%) rotate(0deg); }
            100% { transform: translateY(-50%) rotate(360deg); }
          }
        `}
      </style>

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
          {grid.map((cell, index) => (
            <div
              key={index}
              onClick={() => handleCellClick(index)}
              onMouseEnter={() => setHoveredCell(index)}
              onMouseLeave={() => setHoveredCell(null)}
              style={{
                ...styles.cell,
                backgroundColor: hoveredCell === index ? "#66bb6a" : "#4caf50",
                position: "relative",
                overflow: "visible",
              }}
            >
              {cell ? (
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
                  <div
                    style={{
                      width: "40px",
                      height: "4px",
                      backgroundColor: "#000",
                      marginBottom: "2px",
                      position: "absolute",
                      top: cell.isGiant ? "-55px" : "4px",
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

                  {cell.type === "ACORN" ? (
                    <div style={styles.acornStackContainer}>
                      {Array.from({ length: cell.acornCount })
                        .map((_, i) => i)
                        .reverse()
                        .map((renderIndex) => {
                          return (
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
                          );
                        })}
                    </div>
                  ) : (
                    <img
                      src={cell.image}
                      alt={cell.type}
                      style={{
                        ...styles.plantImage,
                        position: cell.isGiant ? "absolute" : "relative",
                        top: cell.isGiant ? "50%" : "auto",
                        left: cell.isGiant ? "50%" : "auto",
                        animation: cell.isGiant
                          ? "oakPulse 1.5s infinite alternate ease-in-out"
                          : "none",
                        transform: cell.isGiant
                          ? "translate(-50%, -62%) scale(3)"
                          : "none",
                        zIndex: cell.isGiant ? 20 : 2,
                        transformOrigin: "center center",
                      }}
                      onError={(e) => {
                        e.target.style.visibility = "hidden";
                      }}
                    />
                  )}
                </div>
              ) : (
                selectedPlant &&
                hoveredCell === index && (
                  <span style={{ opacity: 0.4, fontSize: "24px" }}>🌱</span>
                )
              )}
            </div>
          ))}
        </div>

        {/* Render dei Soli */}
        {droppedSuns.map((sunItem) => (
          <div
            key={sunItem.id}
            onClick={(e) => handleCollectSun(sunItem.id, e)}
            style={{
              ...styles.droppedSun,
              top: `${sunItem.top}px`,
              left: `${sunItem.left}px`,
            }}
          >
            <img
              src="/img/sun.png"
              alt="Sole"
              style={{ width: "40px", height: "40px" }}
            />
          </div>
        ))}

        {/* Render dei Proiettili (Peas) del Peashooter */}
        {projectiles.map((proj) => (
          <div
            key={proj.id}
            style={{
              position: "absolute",
              top: `${proj.lane * 85 + 15 + 40}px`, // Centrato verticalmente nella corsia
              left: `${proj.x}%`,
              width: "40px",
              height: "40px",
              zIndex: 15,
              animation: "peaSpin 0.5s linear infinite",
              transition: "left 0.03s linear",
            }}
          >
            <img
              src="/img/pea.png"
              alt="Pea"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => {
                // Se manca l'immagine viene renderizzata una sfera verde stilizzata CSS
                e.target.style.display = "none";
                if (!e.target.parentNode.querySelector(".pea-fallback")) {
                  const div = document.createElement("div");
                  div.className = "pea-fallback";
                  div.style.width = "16px";
                  div.style.height = "16px";
                  div.style.backgroundColor = "#4caf50";
                  div.style.borderRadius = "50%";
                  div.style.boxShadow = "0 0 6px #81c784";
                  e.target.parentNode.appendChild(div);
                }
              }}
            />
          </div>
        ))}

        {zombies.map((zombie) => (
          <div
            key={zombie.id}
            style={{
              position: "absolute",
              top: `${zombie.lane * 85 + 15 - 45}px`,
              left: `${zombie.x}%`,
              transform: "translateX(-50%)",
              transition: "left 0.1s linear",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "127.5px",
              justifyContent: "flex-end",
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
              style={styles.zombieImage}
              onError={(e) => {
                e.target.style.display = "none";
                if (!e.target.parentNode.querySelector(".zombie-fallback")) {
                  const span = document.createElement("span");
                  span.className = "zombie-fallback";
                  span.style.fontSize = "65px";
                  span.style.lineHeight = "1";
                  span.innerText = "🧟";
                  e.target.parentNode.appendChild(span);
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Gli stili (const styles = { ... }) rimangono invariati rispetto al tuo codice originale
const styles = {
  container: {
    padding: "20px",
    fontFamily: '"Segoe UI", Roboto, sans-serif',
    backgroundColor: "#1a1a1a",
    color: "#fff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: { marginBottom: "20px", color: "#81c784", userSelect: "none" },
  vsTrigger: {
    cursor: "pointer",
    color: "#ffeb3b",
    padding: "0 5px",
    borderRadius: "4px",
    transition: "background 0.2s",
  },
  topBar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
    backgroundColor: "#333",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    margin: "0 auto 20px auto",
    width: "fit-content",
  },
  sunCounter: {
    fontSize: "24px",
    fontWeight: "bold",
    backgroundColor: "#444",
    padding: "15px 20px",
    borderRadius: "8px",
    border: "2px solid #ffd54f",
    display: "flex",
    alignItems: "center",
    color: "#ffd54f",
  },
  seedChooser: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
  },
  seedButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "85px",
    height: "95px",
    padding: "5px",
    borderRadius: "4px",
    cursor: "pointer",
    boxSizing: "border-box",
    justifyContent: "space-between",
    color: "#000",
  },
  seedImageContainer: {
    height: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  seedImage: { maxHeight: "40px", maxWidth: "70px", objectFit: "contain" },
  btnTextContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#d7ccc8",
    borderRadius: "2px",
    padding: "2px 0",
  },
  plantName: {
    fontSize: "10px",
    fontWeight: "bold",
    textAlign: "center",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%",
  },
  costText: { fontSize: "12px", fontWeight: "bold", color: "#2e7d32" },
  cancelButton: {
    padding: "10px 15px",
    backgroundColor: "#d32f2f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  gameArea: { position: "relative", width: "fit-content" },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(9, 80px)",
    gridTemplateRows: "repeat(5, 80px)",
    gap: "5px",
    backgroundColor: "#5d4037",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 12px 24px rgba(0,0,0,0.6)",
  },
  cell: {
    width: "80px",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "1px solid #388e3c",
    borderRadius: "4px",
  },
  plantImage: {
    maxWidth: "90%",
    maxHeight: "90%",
    objectFit: "contain",
    transition: "transform 0.3s ease",
  },
  acornStackContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  zombieHpBarBg: {
    width: "45px",
    height: "6px",
    backgroundColor: "#c62828",
    borderRadius: "2px",
    marginBottom: "4px",
    overflow: "hidden",
  },
  zombieHpBarFg: {
    height: "100%",
    backgroundColor: "#2e7d32",
    transition: "width 0.2s",
  },
  zombieImage: { width: "85px", height: "120px", objectFit: "contain" },
  droppedSun: {
    position: "absolute",
    fontSize: "36px",
    cursor: "pointer",
    zIndex: 20,
    animation: "sunPulse 1s infinite alternate ease-in-out",
    userSelect: "none",
    filter: "drop-shadow(0px 0px 8px #ffd54f)",
  },
};
