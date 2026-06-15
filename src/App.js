import React, { useState, useEffect } from "react";

const PLANT_TYPES = {
  SUNFLOWER: {
    name: "Sunflower",
    cost: 50,
    image: "/img/sunflower.jpg",
    abilitycooldown: 10,
    hp: 300,
  },
  PEASHOOTER: {
    name: "Peashooter",
    cost: 100,
    image: "/img/peashooter.jpg",
    abilitycooldown: 1,
    hp: 300,
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
};

const ZOMBIE_TYPES = {
  REGULAR: {
    name: "Regular Zombie",
    hp: 200,
    speed: 0.2,
    image: "/img/zombie.png",
    damage: 5,
  },
  CONEHEAD: {
    name: "Conehead Zombie",
    hp: 400,
    speed: 0.2,
    image: "/img/zombo.jpg",
    damage: 5,
  },
  BUCKETHEAD: {
    name: "Buckethead Zombie",
    hp: 600,
    speed: 0.2,
    image: "/img/bucket.jpg",
    damage: 5,
  },
  QUARTERBACK: {
    name: "Quarterback Zombie",
    hp: 800,
    speed: 0.3,
    image: "/img/quarterback.png",
    damage: 6,
  },
  JOURNALIST: {
    name: "Journalist Zombie",
    hp: 800,
    speed: 0.25,
    image: "/img/newspaper.png",
    damage: 7,
  },
};

export default function App() {
  const [sun, setSun] = useState(150);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [grid, setGrid] = useState(Array(45).fill(null));
  const [zombies, setZombies] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [droppedSuns, setDroppedSuns] = useState([]);

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

  // Game Loop principale
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGrid((prevGrid) => {
        // Cloniamo l'array di base
        const nextGrid = [...prevGrid];

        // Gestione dei Girasoli
        for (let i = 0; i < nextGrid.length; i++) {
          if (nextGrid[i] && nextGrid[i].type === "SUNFLOWER") {
            // Fix Mutazione: Clona l'oggetto pianta prima di modificarlo
            const plant = { ...nextGrid[i] };
            plant.cooldownTimer = (plant.cooldownTimer || 0) + 100;

            const targetCooldown = PLANT_TYPES.SUNFLOWER.abilitycooldown * 1000;

            if (plant.cooldownTimer >= targetCooldown) {
              const lane = Math.floor(i / 9);
              const col = i % 9;

              // Calcolo corretto considerando: padding board (15px) + dimensione cella (80px) + gap (5px)
              const cellTop = 15 + lane * (80 + 5);
              const cellLeft = 15 + col * (80 + 5);

              const newSun = {
                id: Date.now() + Math.random(),
                // Centriamo il sole nella cella (80px / 2 = 40)
                top: cellTop + 40,
                left: cellLeft + 40,
              };

              setDroppedSuns((prevSuns) => [...prevSuns, newSun]);
              plant.cooldownTimer = 0;
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

                    // Fix Mutazione: Clona la pianta colpita
                    const damagedPlant = { ...plant };
                    if (damagedPlant.hp - damagePerTick <= 0) {
                      nextGrid[cellIndex] = null;
                    } else {
                      damagedPlant.hp -= damagePerTick;
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
              return true;
            });
        });

        return nextGrid;
      });
    }, 100);

    return () => clearInterval(gameLoop);
  }, []);

  const handleSelectPlant = (key) => {
    if (selectedPlant === key) {
      setSelectedPlant(null);
    } else {
      setSelectedPlant(key);
    }
  };

  const handleCellClick = (index) => {
    if (!selectedPlant || grid[index] != null) return;
    const plantData = PLANT_TYPES[selectedPlant];

    if (sun >= plantData.cost) {
      setSun(sun - plantData.cost);

      const newGrid = [...grid];
      newGrid[index] = {
        type: selectedPlant,
        image: plantData.image,
        hp: plantData.hp,
        maxHp: plantData.hp,
        cooldownTimer: 0,
      };

      setGrid(newGrid);
      setSelectedPlant(null);
    } else {
      alert("Soli insufficienti!");
    }
  };

  const handleCollectSun = (id, e) => {
    e.stopPropagation(); // Previene il click sulla cella sottostante
    setSun((prev) => prev + 25);
    setDroppedSuns((prevSuns) => prevSuns.filter((s) => s.id !== id));
  };

  return (
    <div style={styles.container}>
      {/* Iniezione dei Keyframes CSS per far pulsare i soli */}
      <style>
        {`
          @keyframes sunPulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            100% { transform: translate(-50%, -50%) scale(1.2); }
          }
        `}
      </style>

      <h1 style={styles.title}>Plants vs Zombies</h1>

      <div style={styles.topBar}>
        <div style={styles.sunCounter}>
          <span style={styles.sunText}>☀️ {sun}</span>
        </div>

        <div style={styles.seedChooser}>
          {Object.keys(PLANT_TYPES).map((key) => {
            const isSelected = selectedPlant === key;
            const canAfford = sun >= PLANT_TYPES[key].cost;

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
                    src={PLANT_TYPES[key].image}
                    alt={PLANT_TYPES[key].name}
                    style={styles.seedImage}
                    onError={(e) => {
                      e.target.style.visibility = "hidden";
                    }}
                  />
                </div>
                <div style={styles.btnTextContainer}>
                  <span style={styles.plantName}>{PLANT_TYPES[key].name}</span>
                  <span style={styles.costText}>{PLANT_TYPES[key].cost}</span>
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
              }}
            >
              {cell ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "4px",
                      backgroundColor: "#000",
                      marginBottom: "2px",
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
                  <img
                    src={cell.image}
                    alt={cell.type}
                    style={styles.plantImage}
                    onError={(e) => {
                      e.target.style.visibility = "hidden";
                    }}
                  />
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

        {/* Render dei soli */}
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
            ☀️
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
  title: { marginBottom: "20px", color: "#81c784" },
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
  plantImage: { maxWidth: "90%", maxHeight: "90%", objectFit: "contain" },
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
