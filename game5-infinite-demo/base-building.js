// 基地建设系统
class BaseBuildingSystem {
    constructor() {
        this.basePosition = { x: 0, y: 0 };
        this.buildings = new Map();
        this.resources = {
            wood: 100,
            stone: 50,
            metal: 20,
            energy: 0,
            food: 30
        };
        
        // 建筑类型定义
        this.buildingTypes = {
            headquarters: {
                name: '指挥中心',
                cost: { wood: 0, stone: 0, metal: 0 },
                size: { width: 3, height: 3 },
                maxLevel: 10,
                description: '基地的核心建筑，提供基础功能',
                effects: {
                    storageCapacity: 100,
                    defenseBonus: 10
                }
            },
            resourceGenerator: {
                name: '资源生产器',
                cost: { wood: 50, stone: 30, metal: 10 },
                size: { width: 2, height: 2 },
                maxLevel: 5,
                description: '自动生产各种资源',
                effects: {
                    woodPerSecond: 2,
                    stonePerSecond: 1,
                    metalPerSecond: 0.5
                }
            },
            workshop: {
                name: '工作坊',
                cost: { wood: 80, stone: 40, metal: 20 },
                size: { width: 2, height: 2 },
                maxLevel: 5,
                description: '制作装备和道具',
                effects: {
                    craftingSpeed: 1.5,
                    qualityBonus: 0.1
                }
            },
            laboratory: {
                name: '研究实验室',
                cost: { wood: 60, stone: 80, metal: 40 },
                size: { width: 2, height: 2 },
                maxLevel: 5,
                description: '研究新技术和升级',
                effects: {
                    researchSpeed: 1.0,
                    techUnlock: true
                }
            },
            barracks: {
                name: '兵营',
                cost: { wood: 100, stone: 60, metal: 30 },
                size: { width: 3, height: 2 },
                maxLevel: 5,
                description: '训练和升级角色能力',
                effects: {
                    trainingSpeed: 1.0,
                    experienceBonus: 0.2
                }
            },
            warehouse: {
                name: '仓库',
                cost: { wood: 40, stone: 60, metal: 10 },
                size: { width: 2, height: 2 },
                maxLevel: 10,
                description: '增加资源存储容量',
                effects: {
                    storageCapacity: 200
                }
            },
            powerPlant: {
                name: '发电厂',
                cost: { wood: 30, stone: 50, metal: 80 },
                size: { width: 2, height: 2 },
                maxLevel: 5,
                description: '生产能源供应其他建筑',
                effects: {
                    energyPerSecond: 5
                }
            },
            defenseWall: {
                name: '防御墙',
                cost: { wood: 20, stone: 40, metal: 5 },
                size: { width: 1, height: 1 },
                maxLevel: 5,
                description: '提供基地防御',
                effects: {
                    defenseBonus: 5,
                    health: 100
                }
            },
            turret: {
                name: '防御炮塔',
                cost: { wood: 30, stone: 20, metal: 50 },
                size: { width: 1, height: 1 },
                maxLevel: 5,
                description: '自动攻击敌人',
                effects: {
                    damage: 25,
                    range: 150,
                    fireRate: 1.0
                }
            },
            farm: {
                name: '农场',
                cost: { wood: 60, stone: 20, metal: 5 },
                size: { width: 3, height: 3 },
                maxLevel: 5,
                description: '生产食物资源',
                effects: {
                    foodPerSecond: 3
                }
            }
        };
        
        // 基地网格系统
        this.gridSize = 32;
        this.baseGrid = new Array(50).fill(null).map(() => new Array(50).fill(null));
        this.gridOffset = { x: 25, y: 25 }; // 中心偏移
        
        // 初始化指挥中心
        this.buildBuilding('headquarters', 0, 0);
        
        // 资源生产计时器
        this.lastResourceUpdate = Date.now();
    }
    
    // 检查位置是否可以建造
    canBuildAt(buildingType, gridX, gridY) {
        const building = this.buildingTypes[buildingType];
        if (!building) return false;
        
        const { width, height } = building.size;
        
        // 检查边界
        if (gridX < 0 || gridY < 0 || 
            gridX + width > this.baseGrid.length || 
            gridY + height > this.baseGrid[0].length) {
            return false;
        }
        
        // 检查占用
        for (let x = gridX; x < gridX + width; x++) {
            for (let y = gridY; y < gridY + height; y++) {
                if (this.baseGrid[x][y] !== null) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // 检查资源是否足够
    canAfford(cost) {
        for (const [resource, amount] of Object.entries(cost)) {
            if (this.resources[resource] < amount) {
                return false;
            }
        }
        return true;
    }
    
    // 建造建筑
    buildBuilding(buildingType, gridX, gridY) {
        const buildingDef = this.buildingTypes[buildingType];
        if (!buildingDef) return false;
        
        if (!this.canBuildAt(buildingType, gridX, gridY)) {
            return false;
        }
        
        if (!this.canAfford(buildingDef.cost)) {
            return false;
        }
        
        // 扣除资源
        for (const [resource, amount] of Object.entries(buildingDef.cost)) {
            this.resources[resource] -= amount;
        }
        
        // 创建建筑实例
        const building = {
            id: Date.now() + Math.random(),
            type: buildingType,
            level: 1,
            gridX: gridX,
            gridY: gridY,
            worldX: (gridX - this.gridOffset.x) * this.gridSize,
            worldY: (gridY - this.gridOffset.y) * this.gridSize,
            health: buildingDef.effects.health || 100,
            maxHealth: buildingDef.effects.health || 100,
            constructionTime: 0,
            isConstructed: true,
            lastProduction: Date.now()
        };
        
        // 占用网格
        const { width, height } = buildingDef.size;
        for (let x = gridX; x < gridX + width; x++) {
            for (let y = gridY; y < gridY + height; y++) {
                this.baseGrid[x][y] = building.id;
            }
        }
        
        this.buildings.set(building.id, building);
        return building;
    }
    
    // 升级建筑
    upgradeBuilding(buildingId) {
        const building = this.buildings.get(buildingId);
        if (!building) return false;
        
        const buildingDef = this.buildingTypes[building.type];
        if (building.level >= buildingDef.maxLevel) return false;
        
        // 计算升级成本
        const upgradeCost = {};
        for (const [resource, baseCost] of Object.entries(buildingDef.cost)) {
            upgradeCost[resource] = Math.floor(baseCost * Math.pow(1.5, building.level));
        }
        
        if (!this.canAfford(upgradeCost)) return false;
        
        // 扣除资源
        for (const [resource, amount] of Object.entries(upgradeCost)) {
            this.resources[resource] -= amount;
        }
        
        building.level++;
        return true;
    }
    
    // 拆除建筑
    demolishBuilding(buildingId) {
        const building = this.buildings.get(buildingId);
        if (!building || building.type === 'headquarters') return false;
        
        const buildingDef = this.buildingTypes[building.type];
        const { width, height } = buildingDef.size;
        
        // 清空网格
        for (let x = building.gridX; x < building.gridX + width; x++) {
            for (let y = building.gridY; y < building.gridY + height; y++) {
                this.baseGrid[x][y] = null;
            }
        }
        
        // 返还部分资源
        for (const [resource, amount] of Object.entries(buildingDef.cost)) {
            this.resources[resource] += Math.floor(amount * 0.5);
        }
        
        this.buildings.delete(buildingId);
        return true;
    }
    
    // 更新资源生产
    updateResourceProduction() {
        const now = Date.now();
        const deltaTime = (now - this.lastResourceUpdate) / 1000;
        
        for (const building of this.buildings.values()) {
            if (!building.isConstructed) continue;
            
            const buildingDef = this.buildingTypes[building.type];
            const effects = buildingDef.effects;
            const levelMultiplier = building.level;
            
            // 资源生产
            if (effects.woodPerSecond) {
                this.resources.wood += effects.woodPerSecond * levelMultiplier * deltaTime;
            }
            if (effects.stonePerSecond) {
                this.resources.stone += effects.stonePerSecond * levelMultiplier * deltaTime;
            }
            if (effects.metalPerSecond) {
                this.resources.metal += effects.metalPerSecond * levelMultiplier * deltaTime;
            }
            if (effects.energyPerSecond) {
                this.resources.energy += effects.energyPerSecond * levelMultiplier * deltaTime;
            }
            if (effects.foodPerSecond) {
                this.resources.food += effects.foodPerSecond * levelMultiplier * deltaTime;
            }
        }
        
        // 限制资源上限
        const maxStorage = this.getMaxStorage();
        for (const resource in this.resources) {
            if (resource !== 'energy') {
                this.resources[resource] = Math.min(this.resources[resource], maxStorage);
            }
        }
        
        this.lastResourceUpdate = now;
    }
    
    // 获取最大存储容量
    getMaxStorage() {
        let capacity = 500; // 基础容量
        
        for (const building of this.buildings.values()) {
            const buildingDef = this.buildingTypes[building.type];
            if (buildingDef.effects.storageCapacity) {
                capacity += buildingDef.effects.storageCapacity * building.level;
            }
        }
        
        return capacity;
    }
    
    // 获取基地防御力
    getDefenseBonus() {
        let defense = 0;
        
        for (const building of this.buildings.values()) {
            const buildingDef = this.buildingTypes[building.type];
            if (buildingDef.effects.defenseBonus) {
                defense += buildingDef.effects.defenseBonus * building.level;
            }
        }
        
        return defense;
    }
    
    // 获取防御炮塔
    getDefenseTurrets() {
        const turrets = [];
        
        for (const building of this.buildings.values()) {
            if (building.type === 'turret' && building.isConstructed) {
                const buildingDef = this.buildingTypes[building.type];
                turrets.push({
                    x: building.worldX,
                    y: building.worldY,
                    damage: buildingDef.effects.damage * building.level,
                    range: buildingDef.effects.range,
                    fireRate: buildingDef.effects.fireRate,
                    lastFire: 0
                });
            }
        }
        
        return turrets;
    }
    
    // 世界坐标转网格坐标
    worldToGrid(worldX, worldY) {
        return {
            x: Math.floor(worldX / this.gridSize) + this.gridOffset.x,
            y: Math.floor(worldY / this.gridSize) + this.gridOffset.y
        };
    }
    
    // 网格坐标转世界坐标
    gridToWorld(gridX, gridY) {
        return {
            x: (gridX - this.gridOffset.x) * this.gridSize,
            y: (gridY - this.gridOffset.y) * this.gridSize
        };
    }
    
    // 获取建筑信息
    getBuildingAt(gridX, gridY) {
        if (gridX < 0 || gridY < 0 || 
            gridX >= this.baseGrid.length || 
            gridY >= this.baseGrid[0].length) {
            return null;
        }
        
        const buildingId = this.baseGrid[gridX][gridY];
        return buildingId ? this.buildings.get(buildingId) : null;
    }
    
    // 获取基地统计信息
    getBaseStats() {
        const stats = {
            totalBuildings: this.buildings.size,
            buildingsByType: {},
            totalDefense: this.getDefenseBonus(),
            maxStorage: this.getMaxStorage(),
            resourceProduction: {
                wood: 0,
                stone: 0,
                metal: 0,
                energy: 0,
                food: 0
            }
        };
        
        for (const building of this.buildings.values()) {
            const type = building.type;
            stats.buildingsByType[type] = (stats.buildingsByType[type] || 0) + 1;
            
            const buildingDef = this.buildingTypes[type];
            const effects = buildingDef.effects;
            const levelMultiplier = building.level;
            
            if (effects.woodPerSecond) {
                stats.resourceProduction.wood += effects.woodPerSecond * levelMultiplier;
            }
            if (effects.stonePerSecond) {
                stats.resourceProduction.stone += effects.stonePerSecond * levelMultiplier;
            }
            if (effects.metalPerSecond) {
                stats.resourceProduction.metal += effects.metalPerSecond * levelMultiplier;
            }
            if (effects.energyPerSecond) {
                stats.resourceProduction.energy += effects.energyPerSecond * levelMultiplier;
            }
            if (effects.foodPerSecond) {
                stats.resourceProduction.food += effects.foodPerSecond * levelMultiplier;
            }
        }
        
        return stats;
    }
    
    // 保存基地数据
    saveData() {
        return {
            basePosition: this.basePosition,
            buildings: Array.from(this.buildings.entries()),
            resources: this.resources,
            baseGrid: this.baseGrid
        };
    }
    
    // 加载基地数据
    loadData(data) {
        if (data) {
            this.basePosition = data.basePosition || { x: 0, y: 0 };
            this.resources = { ...this.resources, ...data.resources };
            
            if (data.buildings) {
                this.buildings = new Map(data.buildings);
            }
            
            if (data.baseGrid) {
                this.baseGrid = data.baseGrid;
            }
        }
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.BaseBuildingSystem = BaseBuildingSystem;
}