import React, { useState, useEffect, useRef } from "react";

// Define NPC enemy classes
class Rabbit {
    name = "Rabbit";
    damage = 5;
    health = 30;
    dealDamage(_target: any) {
        return this.damage;
    }
}
class Rat {
    name = "Rat";
    damage = 4;
    health = 35;
    dealDamage(_target: any) {
        return this.damage;
    }
}
class Squirrel {
    name = "Squirrel";
    damage = 6;
    health = 28;
    dealDamage(_target: any) {
        return this.damage;
    }
}

// Define player classes
class Warrior {
    type = "Warrior";
    damage: number;
    health: number;
    ap: number;
    maxHealth: number;
    constructor() {
        this.damage = 12;
        this.health = 140;
        this.maxHealth = 140;
        this.ap = 3; // Example starting AP
    }

    dealDamage(target: Warrior | Mage | Archer | Adventurer) {
        let dmg = this.damage;
        if (target.type === "Mage") {
            dmg = this.damage * 1.5;
        } else if (target.type === "Archer") {
            dmg = this.damage * 1.1;
        } else if (target.type === "Warrior") {
            dmg = this.damage * 0.8;
        }
        return Math.round(dmg);
    }
}

class Mage {
    type = "Mage";
    damage: number;
    health: number;
    ap: number;
    maxHealth: number;
    constructor() {
        this.damage = 14;
        this.health = 80;
        this.maxHealth = 80;
        this.ap = 4; // Example starting AP
    }

    dealDamage(target: Warrior | Mage | Archer | Adventurer) {
        let dmg = this.damage;
        if (target.type === "Warrior") {
            dmg = this.damage * 1.5;
        } else if (target.type === "Archer") {
            dmg = this.damage * 0.7;
        } else if (target.type === "Adventurer") {
            dmg = this.damage * 0.85;
        }
        return Math.round(dmg);
    }
}

class Archer {
    type = "Archer";
    damage: number;
    health: number;
    ap: number;
    maxHealth: number;
    constructor() {
        this.damage = 9;
        this.health = 90;
        this.maxHealth = 90;
        this.ap = 5; // Example starting AP
    }

    dealDamage(target: Warrior | Mage | Archer | Adventurer) {
        let dmg = this.damage;
        if (target.type === "Mage") {
            dmg = this.damage * 1.5;
        } else if (target.type === "Warrior") {
            dmg = this.damage * 0.5;
        } else if (target.type === "Archer") {
            dmg = this.damage * 0.8;
        }
        return Math.round(dmg);
    }
}

class Adventurer {
    type = "Adventurer";
    damage: number;
    health: number;
    ap: number;
    maxHealth: number;
    constructor() {
        this.damage = 10;
        this.health = 100;
        this.maxHealth = 100;
        this.ap = 4; // Example starting AP
    }

    dealDamage(_target: Warrior | Mage | Archer | Adventurer) {
        return Math.round(this.damage);
    }
}

// Player class
// Inventory item type
type InventoryItem = {
    name: string;
    count: number;
};

// Update Player class to support stackable items
class Player {
    name: string;
    playerClass: Warrior | Mage | Archer | Adventurer;
    level: number;
    xp: number;
    xpToNext: number;
    static LEVEL_CAP = 20;
    potions: number;
    inventory: InventoryItem[]; // Now an array of objects

    constructor(
        name: string,
        playerClass: Warrior | Mage | Archer | Adventurer,
        level = 0,
        xp = 0,
        xpToNext = 100,
        potions = 5,
        inventory: InventoryItem[] = [{ name: "Small Health Potion", count: 5 }]
    ) {
        this.name = name;
        // Defensive clone to avoid reference issues
        this.playerClass = Object.assign(
            Object.create(Object.getPrototypeOf(playerClass)),
            playerClass
        );
        this.level = level;
        this.xp = xp;
        this.xpToNext = xpToNext;
        this.potions = potions;
        this.inventory = inventory.slice(0, 5).map(item => ({
            name: item.name,
            count: Math.min(item.count, 20)
        }));
    }

    gainXP(amount: number) {
        if (this.level >= Player.LEVEL_CAP) return;
        this.xp += amount;
        while (this.xp >= this.xpToNext && this.level < Player.LEVEL_CAP) {
            this.xp -= this.xpToNext;
            this.level++;
            // XP curve: each level up to 5 requires (level * 100) XP
            if (this.level <= 5) {
                this.xpToNext = this.level * 100;
            }
            // You can add more XP scaling for higher levels here if desired
        }
        if (this.level >= Player.LEVEL_CAP) {
            this.xp = 0;
            this.xpToNext = 0;
        }
    }

    attack(target: { playerClass: Mage | Warrior | Archer | Adventurer; name: any; }) {
        const damage = this.playerClass.dealDamage(target.playerClass);
        target.playerClass.health -= damage; // Subtract damage from target's health
        console.log(`${this.name} does ${damage} to ${target.name}`);
    }

    useItem() {
        console.log(`${this.name} used an item!`);
        // Add item usage logic here
    }

    usePotion() {
        if (this.potions > 0) {
            const maxHeal = Math.min(
                Math.floor(this.playerClass.health * 0.5),
                60
            );
            this.playerClass.health += maxHeal;
            this.potions -= 1;
            return maxHeal;
        }
        return 0;
    }
}

// Game logic as pure functions (no console.log)
function getBattleLog(
    player: Player,
    enemy: Player,
    action: string
): { logs: string[]; player: Player; enemy: Player; battleOver: boolean } {
    const logs: string[] = [];
    let battleOver = false;

    // Set miss and crit chances
    const playerMissChance = 0.15;
    const enemyMissChance = 0.15;
    const playerCritChance = 0.15;
    const enemyCritChance = 0.15;

    if (action === "1") {
        // Player attacks
        if (Math.random() < playerMissChance) {
            logs.push(`${player.name} missed!`);
        } else {
            let damage = player.playerClass.dealDamage(enemy.playerClass);
            let crit = false;
            if (Math.random() < playerCritChance) {
                damage = Math.round(damage * 1.5);
                crit = true;
            } else {
                damage = Math.round(damage);
            }
            enemy.playerClass.health -= damage;
            if (enemy.playerClass.health < 0) enemy.playerClass.health = 0;
            logs.push(
                crit
                    ? `${player.name} lands a CRITICAL HIT! Does ${damage} damage to ${enemy.name}`
                    : `${player.name} does ${damage} damage to ${enemy.name}`
            );
        }
        if (enemy.playerClass.health <= 0) {
            logs.push(`${enemy.name} has been defeated!`);
            // Award XP based on enemy type
            let xpGained = 0;
            if (enemy.name === "Rat") xpGained = 1;
            else if (enemy.name === "Rabbit") xpGained = 2;
            else if (enemy.name === "Squirrel") xpGained = 4;
            else if (
                enemy.name === "Warrior" ||
                enemy.name === "Mage" ||
                enemy.name === "Archer" ||
                enemy.name === "Adventurer"
            ) {
                xpGained = 5;
                // Double XP if player is at disadvantage
                const playerClass = player.playerClass.type;
                const enemyClass = enemy.playerClass.type;
                const disadvantage =
                    (playerClass === "Warrior" && enemyClass === "Mage") ||
                    (playerClass === "Mage" && enemyClass === "Archer") ||
                    (playerClass === "Archer" && enemyClass === "Warrior");
                if (disadvantage) xpGained *= 2;
            }
            if (xpGained > 0) {
                player.gainXP(xpGained);
                logs.push(`${player.name} gains ${xpGained} XP!`);
            }
            battleOver = true;
            return { logs, player, enemy, battleOver };
        }
        // Enemy attacks back
        if (Math.random() < enemyMissChance) {
            logs.push(`${enemy.name} missed!`);
        } else {
            let enemyDamage = enemy.playerClass.dealDamage(player.playerClass);
            let crit = false;
            if (Math.random() < enemyCritChance) {
                enemyDamage = Math.round(enemyDamage * 1.5);
                crit = true;
            } else {
                enemyDamage = Math.round(enemyDamage);
            }
            player.playerClass.health -= enemyDamage;
            if (player.playerClass.health < 0) player.playerClass.health = 0;
            logs.push(
                crit
                    ? `${enemy.name} lands a CRITICAL HIT! Does ${enemyDamage} damage to ${player.name}`
                    : `${enemy.name} does ${enemyDamage} damage to ${player.name}`
            );
        }
        if (player.playerClass.health <= 0) {
            logs.push(`${player.name} has been defeated!`);
            battleOver = true;
        }
    } else if (action === "2") {
        logs.push(`${player.name} has fled the battle!`);
        battleOver = true;
    } else if (action === "3") {
        if (player.potions > 0) {
            // Calculate heal amount: 50% of max HP, up to 60
            const maxHP = player.playerClass.maxHealth;
            const healAmount = Math.round(Math.min(Math.floor(maxHP * 0.5), 60));
            player.playerClass.health += healAmount;
            if (player.playerClass.health > maxHP) player.playerClass.health = maxHP;
            player.potions -= 1;
            logs.push(`${player.name} used a small health potion and restored ${healAmount} HP! (${player.potions} left)`);
        } else {
            logs.push(`${player.name} has no potions left!`);
        }
    } else {
        logs.push("Invalid choice. Please select 1, 2, or 3.");
    }

    return { logs, player, enemy, battleOver };
}

// Add class info map
const classInfo: Record<string, { name: string; description: string; stats: string }> = {
    "1": {
        name: "Warrior",
        description: "A strong melee fighter with high health and average damage. Deals less damage to Mages.",
        stats: "Health: 140, Damage: 12, AP: 3",
    },
    "2": {
        name: "Mage",
        description: "A spellcaster with high damage against Warriors but lower health.",
        stats: "Health: 80, Damage: 14, AP: 4",
    },
    "3": {
        name: "Archer",
        description: "A ranged attacker with balanced stats and extra damage to Mages.",
        stats: "Health: 90, Damage: 9, AP: 5",
    },
    "4": {
        name: "Adventurer",
        description: "A balanced explorer with regular damage to all classes.",
        stats: "Health: 100, Damage: 10, AP: 4",
    },
};

// Title screen scrolling logic
const TITLE_SCROLL_TEXT = [
    "███████╗ █████╗ ███╗   ██╗████████╗ █████╗ ███╗   ██╗████████╗██╗   ██╗",
    "██╔════╝██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗████╗  ██║╚══██╔══╝╚██╗ ██╔╝",
    "█████╗  ███████║██╔██╗ ██║   ██║   ███████║██╔██╗ ██║   ██║    ╚████╔╝ ",
    "██╔══╝  ██╔══██║██║╚██╗██║   ██║   ██╔══██║██║╚██╗██║   ██║     ╚██╔╝  ",
    "██║     ██║  ██║██║ ╚████║   ██║   ██║  ██║██║ ╚████║   ██║      ██║   ",
    "╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝      ╚═╝   ",
    "",
    "        Welcome to Fantasy Battle (MS-DOS Style)        ",
    "",
    "Defeat your enemy in a turn-based fantasy duel.",
    "Choose your class and use your wits to win!",
    "",
    "           © 2025 Landover Labs",
];

const TITLE_SCROLL_SPEED = 250; // ms per line (slower)
const FLASH_SPEED = 600; // ms

// Main App component

const App: React.FC = () => {
    const [step, setStep] = useState<"name" | "class" | "battle" | "end">("name");
    const [name, setName] = useState("");
    const [classChoice, setClassChoice] = useState<"1" | "2" | "3" | "4" | "">("");
    const [player, setPlayer] = useState<Player | null>(null);
    const [enemy, setEnemy] = useState<Player | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [battleOver, setBattleOver] = useState(false);
    const [showTitle, setShowTitle] = useState(true); // <-- controls title screen
    const [scrollIndex, setScrollIndex] = useState(0);
    const [flash, setFlash] = useState(true);

    // Add this state to manage item selection prompt
    const [showItemPrompt, setShowItemPrompt] = useState(false);
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);

    // Responsive style for MS-DOS style window
    const containerStyle: React.CSSProperties = {
        background: "#000",
        color: "#0f0",
        fontFamily: "Consolas, 'Courier New', monospace",
        border: "4px double #0f0",
        borderRadius: "8px",
        width: "60vw",
        maxWidth: 600,
        minHeight: 400,
        padding: "24px",
        boxSizing: "border-box",
        boxShadow: "0 0 24px #0f04",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: "auto",
        overflow: "hidden",
    };

    const mobileStyle: React.CSSProperties = {
        width: "98vw",
        minHeight: "100vh",
        borderRadius: 0,
        maxWidth: "100vw",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        overflow: "hidden",
    };

    // Merge styles for responsiveness
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 600);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Force landscape orientation on mobile
    useEffect(() => {
        if (isMobile) {
            // Try to lock orientation if supported
            // @ts-ignore
            if (screen.orientation && screen.orientation.lock) {
                // @ts-ignore
                screen.orientation.lock("landscape").catch(() => {});
            }
            document.body.style.transform = "";
            document.body.style.width = "100vw";
            document.body.style.height = "100vh";
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.transform = "";
            document.body.style.width = "";
            document.body.style.height = "";
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.transform = "";
            document.body.style.width = "";
            document.body.style.height = "";
            document.body.style.overflow = "";
        };
    }, [isMobile]);

    // Title screen scrolling logic
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showTitle) return;
        if (scrollIndex < TITLE_SCROLL_TEXT.length) {
            const timeout = setTimeout(() => setScrollIndex(i => i + 1), TITLE_SCROLL_SPEED);
            return () => clearTimeout(timeout);
        }
    }, [scrollIndex, showTitle]);

    useEffect(() => {
        if (!showTitle) return;
        if (scrollIndex >= TITLE_SCROLL_TEXT.length) {
            const interval = setInterval(() => setFlash(f => !f), FLASH_SPEED);
            return () => clearInterval(interval);
        }
    }, [scrollIndex, showTitle]);

    // Scroll to bottom as new lines appear
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [scrollIndex]);

    const handleTitleContinue = () => {
        if (scrollIndex >= TITLE_SCROLL_TEXT.length) {
            setShowTitle(false);
        }
    };

    // Handlers
    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) setStep("class");
    };

    // Weighted enemy class selection function
    function getWeightedEnemyClass(playerClassType: string) {
        // Set base probabilities as percentages (must sum to 100)
        const probabilities: { [key: string]: number } = {
            Warrior: 5,
            Mage: 5,
            Archer: 5,
            Adventurer: 5,
            Rabbit: 9,
            Squirrel: 15,
            Rat: 60,
        };

        // Determine which class the player is weakest to
        let weakestClass: string | null = null;
        if (playerClassType === "Warrior") weakestClass = "Mage";
        else if (playerClassType === "Mage") weakestClass = "Archer";
        else if (playerClassType === "Archer") weakestClass = "Warrior";
        else if (playerClassType === "Adventurer") weakestClass = null;

        // Set weakest class probability to 1% if applicable
        if (weakestClass && probabilities[weakestClass] !== undefined) {
            probabilities[weakestClass] = 1;
        }

        // Set player's class probability to lowest (1%) if not already set as weakest
        if (probabilities[playerClassType] !== undefined && playerClassType !== weakestClass) {
            probabilities[playerClassType] = 1;
        }

        // Ensure Adventurer is always 5%
        probabilities["Adventurer"] = 5;

        // Build weighted list based on percentages
        const weightedList: string[] = [];
        for (const [className, percent] of Object.entries(probabilities)) {
            for (let i = 0; i < percent; i++) {
                weightedList.push(className);
            }
        }

        // Pick a random class name
        const chosenClassName = weightedList[Math.floor(Math.random() * weightedList.length)];

        // Map class name to class constructor
        const classMap: { [key: string]: any } = {
            Warrior,
            Mage,
            Archer,
            Adventurer,
            Rabbit,
            Rat,
            Squirrel,
        };

        return classMap[chosenClassName];
    }

    const handleClassSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (classChoice) {
            let playerClass;
            if (classChoice === "1") playerClass = new Warrior();
            else if (classChoice === "2") playerClass = new Mage();
            else if (classChoice === "3") playerClass = new Archer();
            else playerClass = new Adventurer();
            const newPlayer = new Player(name, playerClass);

            // Use .type instead of constructor.name
            const EnemyClass = getWeightedEnemyClass(playerClass.type);
            const enemyInstance: any = new EnemyClass();
            const enemyName = enemyInstance.type || enemyInstance.name || "Enemy";
            const prefix =
                enemyInstance.type === "Archer" ||
                enemyInstance.type === "Mage" ||
                enemyInstance.type === "Adventurer" ||
                enemyInstance.type === "Warrior"
                    ? "Dark"
                    : "Wild";
            const newEnemy = new Player(enemyName, enemyInstance);

            setPlayer(newPlayer);
            setEnemy(newEnemy);
            setLogs([
                `A ${prefix} ${enemyName} appears!`,
                `Battle Start!`,
                `${newPlayer.name} vs ${newEnemy.name}`,
                `Enemy health: ${newEnemy.playerClass.health}`,
            ]);
            setStep("battle");
        }
    };

    // Update handleAction for "Use Item" to show prompt
    const handleAction = (action: string) => {
        if (!player || !enemy || battleOver) return;
        if (action === "3") {
            setShowItemPrompt(true);
            setSelectedItemIndex(0);
            return;
        }
        const { logs: newLogs, player: updatedPlayer, enemy: updatedEnemy, battleOver: over } = getBattleLog(
            player,
            enemy,
            action
        );
        setPlayer(new Player(
            updatedPlayer.name,
            Object.assign(
                Object.create(Object.getPrototypeOf(updatedPlayer.playerClass)),
                updatedPlayer.playerClass
            ),
            updatedPlayer.level,
            updatedPlayer.xp,
            updatedPlayer.xpToNext,
            updatedPlayer.potions,
            updatedPlayer.inventory // <-- Add this!
        ));
        setEnemy(new Player(
            updatedEnemy.name,
            Object.assign(
                Object.create(Object.getPrototypeOf(updatedEnemy.playerClass)),
                updatedEnemy.playerClass
            ),
            updatedEnemy.level,
            updatedEnemy.xp,
            updatedEnemy.xpToNext
        ));
        setLogs((prev) => [
            ...prev,
            "",
            ...newLogs,
            `Enemy health: ${updatedEnemy.playerClass.health}`
        ]);
        if (over) {
            setBattleOver(true);
            setStep("end");
        }
    };

    // Update handleUseSelectedItem so using an item counts as a turn
    const handleUseSelectedItem = () => {
        if (!player || !enemy) return;
        // Clone inventory and item to avoid mutating state directly
        const inventoryCopy = player.inventory.map(item => ({ ...item }));
        const itemObj = inventoryCopy[selectedItemIndex];
        let logsToAdd: string[] = [];
        let battleOver = false;

        if (itemObj && itemObj.name === "Small Health Potion" && itemObj.count > 0) {
            const maxHP = player.playerClass.maxHealth;
            const intendedHeal = Math.round(Math.min(Math.floor(maxHP * 0.5), 70));
            const missingHP = maxHP - player.playerClass.health;
            const healAmount = Math.max(0, Math.min(intendedHeal, missingHP));

            // Create a new playerClass instance and set health
            let newPlayerClass;
            if (player.playerClass.type === "Warrior") {
                newPlayerClass = new Warrior();
            } else if (player.playerClass.type === "Mage") {
                newPlayerClass = new Mage();
            } else if (player.playerClass.type === "Archer") {
                newPlayerClass = new Archer();
            } else {
                newPlayerClass = new Adventurer();
            }
            // Copy over current health, then heal
            newPlayerClass.health = Math.min(player.playerClass.health + healAmount, maxHP);
            newPlayerClass.ap = player.playerClass.ap;
            newPlayerClass.maxHealth = maxHP;

            if (healAmount > 0) {
                logsToAdd.push(`${player.name} used a small health potion and restored ${healAmount} HP!`);
            } else {
                logsToAdd.push(`${player.name} used a small health potion, but was already at full health! The potion was wasted.`);
            }
            itemObj.count -= 1;
            if (itemObj.count === 0) {
                inventoryCopy.splice(selectedItemIndex, 1);
            }
            // Enemy gets a turn after using an item
            if (enemy.playerClass.health > 0 && newPlayerClass.health > 0) {
                const enemyMissChance = 0.15;
                const enemyCritChance = 0.15;
                if (Math.random() < enemyMissChance) {
                    logsToAdd.push(`${enemy.name} missed!`);
                } else {
                    let enemyDamage = enemy.playerClass.dealDamage(newPlayerClass);
                    let crit = false;
                    if (Math.random() < enemyCritChance) {
                        enemyDamage = Math.round(enemyDamage * 1.5);
                        crit = true;
                    } else {
                        enemyDamage = Math.round(enemyDamage);
                    }
                    newPlayerClass.health -= enemyDamage;
                    if (newPlayerClass.health < 0) newPlayerClass.health = 0;
                    logsToAdd.push(
                        crit
                            ? `${enemy.name} lands a CRITICAL HIT! Does ${enemyDamage} damage to ${player.name}`
                            : `${enemy.name} does ${enemyDamage} damage to ${player.name}`
                    );
                    if (newPlayerClass.health <= 0) {
                        logsToAdd.push(`${player.name} has been defeated!`);
                        battleOver = true;
                    }
                }
            }
            setPlayer(new Player(
                player.name,
                newPlayerClass,
                player.level,
                player.xp,
                player.xpToNext,
                player.potions,
                inventoryCopy
            ));
        } else if (itemObj && itemObj.count > 0) {
            logsToAdd.push(`${player.name} used ${itemObj.name}!`);
            itemObj.count -= 1;
            if (itemObj.count === 0) {
                inventoryCopy.splice(selectedItemIndex, 1);
            }
            setPlayer(new Player(
                player.name,
                Object.assign(
                    Object.create(Object.getPrototypeOf(player.playerClass)),
                    player.playerClass
                ),
                player.level,
                player.xp,
                player.xpToNext,
                player.potions,
                inventoryCopy
            ));
        } else {
            logsToAdd.push(`${player.name} has no usable item in that slot!`);
        }

        setLogs(prev => [...prev, ...logsToAdd]);
        setShowItemPrompt(false);
        if (battleOver) {
            setBattleOver(true);
            setStep("end");
        }
    };

    const handleRestart = () => {
        setStep("name");
        setName("");
        setClassChoice("");
        setPlayer(null);
        setEnemy(null);
        setLogs([]);
        setBattleOver(false);
    };

    const handleKeepAdventuring = () => {
        if (!player) return;
        const EnemyClass = getWeightedEnemyClass(player.playerClass.type);
        const enemyInstance: any = new EnemyClass();
        const enemyName = enemyInstance.type || enemyInstance.name || "Enemy";
        const prefix =
            enemyInstance.type === "Archer" ||
            enemyInstance.type === "Mage" ||
            enemyInstance.type === "Adventurer" ||
            enemyInstance.type === "Warrior"
                ? "Dark"
                : "Wild";
        // Do NOT reset player inventory or potions here!
        // Only create a new enemy, keep the same player instance
        const newEnemy = new Player(
            enemyName,
            enemyInstance
        );

        setEnemy(newEnemy);
        setLogs([
            `A ${prefix} ${enemyName} appears!`,
            `Battle Start!`,
            `${player.name} vs ${newEnemy.name}`,
            `Enemy health: ${newEnemy.playerClass.health}`,
        ]);
        setBattleOver(false);
        setStep("battle");
    };

    // Battle log ref for scrolling
    const battleLogRef = useRef<HTMLDivElement>(null);

    // Automatically scroll battle log to bottom when logs or step change
    useEffect(() => {
        if (battleLogRef.current) {
            battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
        }
    }, [logs, step]);

    // Helper to render player stats bar
    function renderPlayerStats(player: Player | null) {
        if (!player) return null;
        return (
            <div
                style={{
                    width: "100%",
                    background: "#111",
                    borderBottom: "2px solid #0f0",
                    color: "#0f0",
                    fontFamily: "inherit",
                    fontSize: "1em",
                    padding: "8px 0 6px 0",
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "center",
                    gap: 32,
                    letterSpacing: "1px",
                }}
            >
                <span>
                    <strong>{player.name}</strong>
                </span>
                <span>
                    Class: <strong>{player.playerClass.type}</strong>
                </span>
                <span>
                    Level: <strong>{player.level}</strong>
                </span>
                <span>
                    XP: <strong>{player.xp}{player.level < Player.LEVEL_CAP ? ` / ${player.xpToNext}` : ""}</strong>
                </span>
                <span>
                    Health: <strong>{player.playerClass.health}/{player.playerClass.maxHealth}</strong>
                </span>
                <span>
                    AP: <strong>{player.playerClass.ap}</strong>
                </span>
            </div>
        );
    }

    // --- RENDER ---
    if (showTitle) {
        // Pad empty lines at the top for bottom-to-top scroll effect
        const padLines = TITLE_SCROLL_TEXT.length - scrollIndex;
        const linesToShow = [
            ...Array(Math.max(0, padLines)).fill(""),
            ...TITLE_SCROLL_TEXT.slice(0, scrollIndex)
        ];

        return (
            <div
                style={isMobile ? { ...containerStyle, ...mobileStyle } : containerStyle}
                onClick={handleTitleContinue}
                tabIndex={0}
                onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") handleTitleContinue();
                }}
            >
                <div
                    ref={scrollRef}
                    style={{
                        width: "100%",
                        height: 220,
                        maxHeight: "40vh",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        marginBottom: 24,
                        fontSize:
                            isMobile
                                ? window.innerWidth <= 320
                                    ? "0.089em" // 0.2975em reduced by 70%
                                    : window.innerWidth < 360
                                        ? "0.089em" // 0.2975em reduced by 70%
                                        : window.innerWidth < 400
                                            ? "0.236em" // 0.2625em reduced by an additional 10%
                                            : "0.2625em" // 50% smaller than original
                                : "0.2975em",
                        letterSpacing: "1.5px",
                        userSelect: "none",
                        lineHeight: 1.25,
                        textShadow: "0 0 3px #0f0, 0 0 6px #0f0",
                        fontFamily: "Consolas, 'Courier New', monospace",
                        whiteSpace: "pre", // preserve ASCII art spacing
                    }}
                >
                    {linesToShow.map((line, idx) => (
                        <div key={idx} style={{ width: "100%", textAlign: "center" }}>{line}</div>
                    ))}
                </div>
                {scrollIndex >= TITLE_SCROLL_TEXT.length && (
                    <div
                        style={{
                            color: flash ? "#0f0" : "#000",
                            fontWeight: "bold",
                            fontSize: "1.1em",
                            marginTop: 16,
                            letterSpacing: "2px",
                            textShadow: "0 0 8px #0f0",
                            cursor: "pointer",
                            animation: "none",
                        }}
                    >
                        Click to continue
                    </div>
                )}
            </div>
        );
    }

    // Only show name/class/battle/end screens after title screen is dismissed
    return (
        <div style={isMobile ? { ...containerStyle, ...mobileStyle } : containerStyle}>
            {/* Player stats bar at the top */}
            {renderPlayerStats(player)}
            <h2 style={{ color: "#0f0", marginBottom: 16, fontFamily: "inherit" }}>Fantasy Battle (MS-DOS Style)</h2>
            {step === "name" && (
                <form onSubmit={handleNameSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <label>
                        Enter your name:{" "}
                        <input
                            style={{
                                background: "#111",
                                color: "#0f0",
                                border: "1px solid #0f0",
                                fontFamily: "inherit",
                                padding: "4px 8px",
                                marginLeft: 8,
                            }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </label>
                    <button
                        type="submit"
                        style={{
                            marginLeft: 12,
                            background: "#222",
                            color: "#0f0",
                            border: "1px solid #0f0",
                            fontFamily: "inherit",
                            padding: "4px 12px",
                            cursor: "pointer",
                            marginTop: 12,
                        }}
                    >
                        OK
                    </button>
                </form>
            )}
            {step === "class" && (
                <div style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: isMobile ? "center" : "flex-start",
                    alignItems: isMobile ? "center" : "flex-start"
                }}>
                    {/* Info Window */}
                    <div
                        style={{
                            minWidth: 180,
                            maxWidth: 220,
                            background: "#111",
                            border: "2px solid #0f0",
                            borderRadius: 6,
                            color: "#0f0",
                            fontFamily: "inherit",
                            padding: "12px",
                            marginRight: isMobile ? 0 : 24,
                            marginBottom: isMobile ? 16 : 0,
                            fontSize: "0.97em",
                            alignSelf: isMobile ? "center" : "flex-start",
                        }}
                    >
                        {classChoice && classInfo[classChoice] ? (
                            <>
                                <div style={{ fontWeight: "bold", marginBottom: 6 }}>{classInfo[classChoice].name}</div>
                                <div style={{ marginBottom: 8 }}>{classInfo[classChoice].description}</div>
                                <div style={{ fontStyle: "italic" }}>{classInfo[classChoice].stats}</div>
                            </>
                        ) : (
                            <div>Select a class to see info</div>
                        )}
                    </div>
                    {/* Class selection form */}
                    <form
                        onSubmit={handleClassSubmit}
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <div>Choose your class:</div>
                        <div style={{ marginTop: 8 }}>
                            <label>
                                <input
                                    type="radio"
                                    name="class"
                                    value="1"
                                    checked={classChoice === "1"}
                                    onChange={() => setClassChoice("1")}
                                />{" "}
                                Warrior
                            </label>
                            <label style={{ marginLeft: 16 }}>
                                <input
                                    type="radio"
                                    name="class"
                                    value="2"
                                    checked={classChoice === "2"}
                                    onChange={() => setClassChoice("2")}
                                />{" "}
                                Mage
                            </label>
                            <label style={{ marginLeft: 16 }}>
                                <input
                                    type="radio"
                                    name="class"
                                    value="3"
                                    checked={classChoice === "3"}
                                    onChange={() => setClassChoice("3")}
                                />{" "}
                                Archer
                            </label>
                            <label style={{ marginLeft: 16 }}>
                                <input
                                    type="radio"
                                    name="class"
                                    value="4"
                                    checked={classChoice === "4"}
                                    onChange={() => setClassChoice("4")}
                                />{" "}
                                Adventurer
                            </label>
                        </div>
                        <button
                            type="submit"
                            style={{
                                marginLeft: 16,
                                background: "#222",
                                color: "#0f0",
                                border: "1px solid #0f0",
                                fontFamily: "inherit",
                                padding: "4px 12px",
                                cursor: "pointer",
                                marginTop: 12,
                            }}
                        >
                            OK
                        </button>
                    </form>
                </div>
            )}
            {step === "battle" && player && enemy && (
                <>
                    <div
                        ref={battleLogRef}
                        style={{
                            width: "100%",
                            minHeight: 200,
                            background: "#111",
                            border: "1px solid #0f0",
                            padding: "12px",
                            margin: "16px 0",
                            overflowY: "auto",
                            fontSize: "1.1em",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <div>
                            <strong>{player.name}</strong> | Health: {player.playerClass.health} | AP: {player.playerClass.ap}
                        </div>
                        <div>
                            <strong>{enemy.name}</strong> | Health: {enemy.playerClass.health} | AP: {enemy.playerClass.ap}
                        </div>
                        <hr style={{ borderColor: "#0f0", width: "100%", margin: "8px 0" }} />
                        {logs.map((log, idx) => (
                            <div key={idx}>{log}</div>
                        ))}
                    </div>
                    <div style={{ width: "100%", textAlign: "center", display: "flex", justifyContent: "center", gap: 8 }}>
                        <button
                            onClick={() => handleAction("1")}
                            style={{
                                background: "#222",
                                color: "#0f0",
                                border: "1px solid #0f0",
                                fontFamily: "inherit",
                                padding: "4px 12px",
                                cursor: "pointer",
                            }}
                        >
                            Attack
                        </button>
                        <button
                            onClick={() => handleAction("2")}
                            style={{
                                background: "#222",
                                color: "#0f0",
                                border: "1px solid #0f0",
                                fontFamily: "inherit",
                                padding: "4px 12px",
                                cursor: "pointer",
                            }}
                        >
                            Flee
                        </button>
                        <button
                            onClick={() => handleAction("3")}
                            style={{
                                background: "#222",
                                color: "#0f0",
                                border: "1px solid #0f0",
                                fontFamily: "inherit",
                                padding: "4px 12px",
                                cursor: "pointer",
                            }}
                        >
                            Use Item
                        </button>
                    </div>
                </>
            )}
            {step === "end" && (
                <div style={{ width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div
                        style={{
                            background: "#111",
                            border: "1px solid #0f0",
                            padding: "12px",
                            margin: "16px 0",
                            width: "100%",
                        }}
                    >
                        {logs.slice(-6).map((log, idx) => (
                            <div key={idx}>{log}</div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <button
                            onClick={handleKeepAdventuring}
                            style={{
                                background: "#222",
                                color: "#0f0",
                                border: "1px solid #0f0",
                                fontFamily: "inherit",
                                padding: "4px 12px",
                                cursor: "pointer",
                            }}
                        >
                            Keep Adventuring
                        </button>
                        <button
                            onClick={handleRestart}
                            style={{
                                background: "#222",
                                color: "#0f0",
                                border: "1px solid #0f0",
                                fontFamily: "inherit",
                                padding: "4px 12px",
                                cursor: "pointer",
                            }}
                        >
                            Restart
                        </button>
                    </div>
                </div>
            )}
            {/* In your battle UI, add this modal/prompt for item selection: */}
            {showItemPrompt && player && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.85)",
                        color: "#0f0",
                        zIndex: 10000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            background: "#111",
                            border: "2px solid #0f0",
                            borderRadius: 8,
                            padding: 24,
                            minWidth: 260,
                            textAlign: "center",
                        }}
                    >
                        <div style={{ marginBottom: 12, fontWeight: "bold" }}>Choose an item to use:</div>
                        <select
                            value={selectedItemIndex}
                            onChange={e => setSelectedItemIndex(Number(e.target.value))}
                            style={{
                                background: "#222",
                                color: "#0f0",
                                border: "1px solid #0f0",
                                fontFamily: "inherit",
                                padding: "4px 8px",
                                marginBottom: 16,
                                width: "90%",
                            }}
                        >
                            {player.inventory.map((item, idx) => (
                                <option key={idx} value={idx}>
                                    {item.name} (x{item.count})
                                </option>
                            ))}
                        </select>
                        <div style={{ marginTop: 12 }}>
                            <button
                                onClick={handleUseSelectedItem}
                                style={{
                                    background: "#222",
                                    color: "#0f0",
                                    border: "1px solid #0f0",
                                    fontFamily: "inherit",
                                    padding: "4px 12px",
                                    cursor: "pointer",
                                    marginRight: 8,
                                }}
                            >
                                Use Item
                            </button>
                            <button
                                onClick={() => setShowItemPrompt(false)}
                                style={{
                                    background: "#222",
                                    color: "#0f0",
                                    border: "1px solid #0f0",
                                    fontFamily: "inherit",
                                    padding: "4px 12px",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;