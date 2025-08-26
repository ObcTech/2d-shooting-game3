// 无限地图生成器
class InfiniteMapGenerator {
    constructor(seed = 12345) {
        this.seed = seed;
        this.chunkSize = 512;
        this.loadRadius = 3;
        this.chunks = new Map();
        this.biomes = {
            forest: { color: '#228B22', enemyTypes: ['goblin', 'wolf'], resources: ['wood', 'herbs'] },
            desert: { color: '#F4A460', enemyTypes: ['scorpion', 'bandit'], resources: ['sand', 'cactus'] },
            snow: { color: '#F0F8FF', enemyTypes: ['yeti', 'ice_wolf'], resources: ['ice', 'crystal'] },
            volcano: { color: '#FF4500', enemyTypes: ['fire_elemental', 'lava_beast'], resources: ['obsidian', 'sulfur'] },
            ocean: { color: '#4682B4', enemyTypes: ['sea_monster', 'pirate'], resources: ['fish', 'pearl'] }
        };
        this.landmarks = ['ruins', 'temple', 'mine', 'boss_lair', 'treasure_chest'];
        
        // 简单的伪随机数生成器
        this.random = this.createRandom(seed);
    }
    
    createRandom(seed) {
        let m = 0x80000000; // 2**31
        let a = 1103515245;
        let c = 12345;
        let state = seed;
        
        return function() {
            state = (a * state + c) % m;
            return state / (m - 1);
        };
    }
    
    // 柏林噪声简化版本
    noise(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    }
    
    // 获取生物群系
    getBiome(x, y) {
        const noiseValue = this.noise(x * 0.01, y * 0.01);
        const biomeNames = Object.keys(this.biomes);
        const index = Math.floor((noiseValue + 1) * 0.5 * biomeNames.length);
        return biomeNames[Math.max(0, Math.min(index, biomeNames.length - 1))];
    }
    
    // 生成区块
    generateChunk(chunkX, chunkY) {
        const chunkKey = `${chunkX},${chunkY}`;
        if (this.chunks.has(chunkKey)) {
            return this.chunks.get(chunkKey);
        }
        
        const worldX = chunkX * this.chunkSize;
        const worldY = chunkY * this.chunkSize;
        
        // 确定主要生物群系
        const biome = this.getBiome(worldX, worldY);
        const biomeData = this.biomes[biome];
        
        // 生成地形特征
        const terrain = [];
        const entities = [];
        const resources = [];
        const landmarks = [];
        
        // 生成地形点
        for (let i = 0; i < 20; i++) {
            terrain.push({
                x: worldX + this.random() * this.chunkSize,
                y: worldY + this.random() * this.chunkSize,
                type: 'terrain',
                biome: biome
            });
        }
        
        // 生成敌人
        const enemyCount = Math.floor(this.random() * 5) + 2;
        for (let i = 0; i < enemyCount; i++) {
            const enemyType = biomeData.enemyTypes[Math.floor(this.random() * biomeData.enemyTypes.length)];
            entities.push({
                x: worldX + this.random() * this.chunkSize,
                y: worldY + this.random() * this.chunkSize,
                type: 'enemy',
                subtype: enemyType,
                level: Math.max(1, Math.floor(Math.sqrt(chunkX * chunkX + chunkY * chunkY)) + Math.floor(this.random() * 3))
            });
        }
        
        // 生成资源
        const resourceCount = Math.floor(this.random() * 8) + 3;
        for (let i = 0; i < resourceCount; i++) {
            const resourceType = biomeData.resources[Math.floor(this.random() * biomeData.resources.length)];
            resources.push({
                x: worldX + this.random() * this.chunkSize,
                y: worldY + this.random() * this.chunkSize,
                type: resourceType,
                amount: Math.floor(this.random() * 10) + 5
            });
        }
        
        // 生成地标（低概率）
        if (this.random() < 0.3) {
            const landmarkType = this.landmarks[Math.floor(this.random() * this.landmarks.length)];
            landmarks.push({
                x: worldX + this.chunkSize * 0.5,
                y: worldY + this.chunkSize * 0.5,
                type: landmarkType,
                discovered: false
            });
        }
        
        const chunk = {
            x: chunkX,
            y: chunkY,
            worldX: worldX,
            worldY: worldY,
            biome: biome,
            terrain: terrain,
            entities: entities,
            resources: resources,
            landmarks: landmarks,
            generated: true,
            lastAccessed: Date.now()
        };
        
        this.chunks.set(chunkKey, chunk);
        return chunk;
    }
    
    // 获取玩家周围的区块
    getChunksAroundPlayer(playerX, playerY) {
        const playerChunkX = Math.floor(playerX / this.chunkSize);
        const playerChunkY = Math.floor(playerY / this.chunkSize);
        
        const loadedChunks = [];
        
        for (let x = playerChunkX - this.loadRadius; x <= playerChunkX + this.loadRadius; x++) {
            for (let y = playerChunkY - this.loadRadius; y <= playerChunkY + this.loadRadius; y++) {
                const chunk = this.generateChunk(x, y);
                loadedChunks.push(chunk);
            }
        }
        
        // 清理远距离区块
        this.cleanupDistantChunks(playerChunkX, playerChunkY);
        
        return loadedChunks;
    }
    
    // 清理远距离区块
    cleanupDistantChunks(playerChunkX, playerChunkY) {
        const maxDistance = this.loadRadius + 2;
        const chunksToRemove = [];
        
        for (const [key, chunk] of this.chunks) {
            const distance = Math.max(
                Math.abs(chunk.x - playerChunkX),
                Math.abs(chunk.y - playerChunkY)
            );
            
            if (distance > maxDistance) {
                chunksToRemove.push(key);
            }
        }
        
        chunksToRemove.forEach(key => {
            this.chunks.delete(key);
        });
    }
    
    // 获取指定位置的生物群系信息
    getBiomeAt(x, y) {
        const biome = this.getBiome(x, y);
        return this.biomes[biome];
    }
    
    // 获取指定区块
    getChunk(chunkX, chunkY) {
        const chunkKey = `${chunkX},${chunkY}`;
        return this.chunks.get(chunkKey) || null;
    }

    // 获取指定世界坐标所在的区块
    getChunkAt(worldX, worldY) {
        const chunkX = Math.floor(worldX / this.chunkSize);
        const chunkY = Math.floor(worldY / this.chunkSize);
        return this.getChunk(chunkX, chunkY);
    }

    // 卸载指定区块
    unloadChunk(chunkX, chunkY) {
        const chunkKey = `${chunkX},${chunkY}`;
        if (this.chunks.has(chunkKey)) {
            this.chunks.delete(chunkKey);
            return true;
        }
        return false;
    }

    // 获取地图统计信息
    getMapStats() {
        return {
            loadedChunks: this.chunks.size,
            totalBiomes: Object.keys(this.biomes).length,
            chunkSize: this.chunkSize,
            loadRadius: this.loadRadius
        };
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.InfiniteMapGenerator = InfiniteMapGenerator;
}