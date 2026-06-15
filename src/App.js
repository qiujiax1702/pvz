import React, { useState, useEffect } from "react";

const PLANT_TYPES = {
  SUNFLOWER: {
    name: "Sunflower",
    cost: 50,
    image: "/img/sunflower.jpg",
    hp: 300,
  },
  PEASHOOTER: {
    name: "Peashooter",
    cost: 100,
    image: "/img/peashooter.jpg",
    hp: 300,
  },
  WALNUT: {
    name: "Walnut",
    cost: 50,
    image: "/img/walnut.jpg",
    hp: 500,
  },
  POTATOMINE: {
    name: "Potato Mine",
    cost: 25,
    image: "/img/potatomine.jpg",
    hp: 100,
  },
  CABBAGEPULT: {
    name: "Cabbagepult",
    cost: 150,
    image: "cabbagepult.png",
    hp: 300,
  },
};

export default function App() {
  const [sun, setSun] = useState(100);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [grid, setGrid] = useState(Array(45).fill(null));
  const [zombies, setZombies] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSun((prevSun) => prevSun + 25);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
      };

      setGrid(newGrid);
      setSelectedPlant(null);
    } else {
      alert("Soli insufficienti!");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Plants vs Zombies</h1>

      <div style={styles.topBar}>
        <div style={styles.sunCounter}>
          <img
            src="sun.png"
            alt="Sun"
            style={styles.sunIcon}
            onError={(e) => (e.target.style.display = "none")}
          />
          <span style={styles.sunText}>☀️ {sun}</span>
        </div>

        <div style={styles.seedChooser}>
          {Object.keys(PLANT_TYPES).map((key) => {
            return (
              <button
                key={key}
                onClick={() => setSelectedPlant(key)}
                style={{
                  ...styles.seedButton,
                  backgroundColor:
                    selectedPlant === key ? "lightgreen" : "white",
                  border:
                    selectedPlant === key
                      ? "2px solid green"
                      : "1px solid gray",
                }}
              >
                <img
                  src={PLANT_TYPES[key].image}
                  alt={PLANT_TYPES[key].name}
                  style={styles.seedImage}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div style={styles.btnText}>
                  <strong>{PLANT_TYPES[key].name}</strong>
                  <span style={styles.costText}>
                    {" "}
                    Costo: {PLANT_TYPES[key].cost}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.gameArea}>
        <div style={styles.board}>
          {grid.map((cell, index) => (
            <div
              key={index}
              onClick={() => handleCellClick(index)}
              style={styles.cell}
            >
              {cell && (
                <img
                  src={cell.image}
                  alt={cell.type}
                  style={styles.plantImage}
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
            </div>
          ))}
        </div>
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
  title: {
    marginBottom: "20px",
    color: "#81c784",
  },
  topBar: {
    display: "flex",
    flexDirection: "row", // Forza gli elementi principali a stare in riga
    alignItems: "center",
    justifyContent: "flex-start", // Allinea tutto a sinistra
    gap: "20px",
    marginBottom: "20px",
    backgroundColor: "#333",
    padding: "10px 15px",
    borderRadius: "8px",
    width: "fit-content", // La barra si allarga solo quanto serve, non prende tutta la pagina
    margin: "0 auto 20px auto", // Centra la barra sopra la griglia
  },
  sunCounter: {
    fontSize: "24px",
    fontWeight: "bold",
    backgroundColor: "#444",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "2px solid #ffd54f",
    display: "flex",
    alignItems: "center",
  },
  seedButton: {
    display: "flex",
    alignItems: "center",
    width: "110px",
    height: "60px",
    padding: "5px",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "white",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  seedChooser: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  },

  seedImage: {
    width: "40px", // Dimensione fissa per la pianta nel bottone
    height: "40px",
    objectFit: "contain",
    flexShrink: 0, // Impedisce all'immagine di rimpicciolirsi se il testo è lungo
  },
  btnSprite: {
    width: "40px",
    height: "40px",
    objectFit: "contain",
  },
  btnText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    fontSize: "14px",
    fontWeight: "bold",
  },
  costText: {
    fontSize: "12px",
    color: "#ffd54f",
  },
  cancelButton: {
    padding: "8px 12px",
    backgroundColor: "#e53935",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  gameArea: {
    position: "relative", // Essenziale per posizionare i futuri zombie sopra la griglia
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(9, 75px)",
    gridTemplateRows: "repeat(5, 75px)",
    gap: "4px",
    backgroundColor: "#1b5e20",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
  },
  cell: {
    width: "75px",
    height: "75px",
    backgroundColor: "#4caf50",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.2s",
    border: "1px solid #388e3c",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#66bb6a", // Nota: l'hover inline non funziona nativamente in React senza librerie, ma dà l'idea
    },
  },
  plantImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    width: "auto",
    height: "auto",
    objectFit: "contain",
  },
};
