// 第五期无限地图养成类游戏主类
class InfiniteGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // 游戏状态
        this.gameState = 'playing'; // playing, paused, menu
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // 摄像机系统
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            zoom: 1,
            smoothing: 0.1
        };
        
        // 玩家
        this.player = {
            x: 0,
            y: 0,
            width: 32,
            height: 32,
            speed: 150,
            health: 100,
            maxHealth: 100,
            direction: 0,
            isMoving: false,
            inventory: [],
            currentChunk: { x: 0, y: 0 }
        };
        
        // 输入系统
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            worldX: 0,
            worldY: 0,
            isDown: false
        };
        
        // 初始化系统
        this.initializeSystems();
        this.setupEventListeners();
        
        // 开始游戏循环
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);
        
        console.log('无限地图养成类游戏初始化完成');
    }
    
    // 初始化各个系统
    initializeSystems() {
        // 配置管理器
        this.configManager = new ConfigManager();
        
        // 性能优化系统
        this.performanceOptimizer = new PerformanceOptimization();
        
        // 粒子系统
        this.particleSystem = new EnhancedParticleSystem();
        
        // 无限地图生成器
        this.mapGenerator = new InfiniteMapGenerator();
        
        // 角色养成系统
        this.characterProgression = new CharacterProgression();
        
        // 基地建设系统
        this.baseBuildingSystem = new BaseBuildingSystem();
        
        // 任务系统
        this.questSystem = new QuestSystem();
        
        // 游戏实体
        this.entities = {
            enemies: [],
            resources: [],
            npcs: [],
            projectiles: []
        };
        
        // UI状态
        this.ui = {
            showInventory: false,
            showCharacterPanel: false,
            showBasePanel: false,
            showQuestPanel: false,
            selectedBuilding: null,
            buildMode: false,
            selectedBuildingType: null
        };
        
        // 初始化任务
        this.questSystem.initializeStartingQuests();
        
        // 生成初始区块
        this.generateInitialChunks();
    }
    
    // 生成初始区块
    generateInitialChunks() {
        const renderDistance = 2;
        for (let x = -renderDistance; x <= renderDistance; x++) {
            for (let y = -renderDistance; y <= renderDistance; y++) {
                this.mapGenerator.generateChunk(x, y);
            }
        }
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 键盘事件
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.handleKeyPress(e.code);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 鼠标事件
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.updateMouseWorldPosition();
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.isDown = true;
            this.handleMouseClick(e.button);
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.mouse.isDown = false;
        });
        
        // 防止右键菜单
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    // 处理按键
    handleKeyPress(keyCode) {
        switch (keyCode) {
            case 'KeyI':
                this.ui.showInventory = !this.ui.showInventory;
                break;
            case 'KeyC':
                this.ui.showCharacterPanel = !this.ui.showCharacterPanel;
                break;
            case 'KeyB':
                this.ui.showBasePanel = !this.ui.showBasePanel;
                break;
            case 'KeyQ':
                this.ui.showQuestPanel = !this.ui.showQuestPanel;
                break;
            case 'KeyG':
                this.ui.buildMode = !this.ui.buildMode;
                break;
            case 'Escape':
                this.ui.buildMode = false;
                this.ui.selectedBuildingType = null;
                break;
        }
    }
    
    // 处理鼠标点击
    handleMouseClick(button) {
        if (button === 0) { // 左键
            if (this.ui.buildMode && this.ui.selectedBuildingType) {
                this.handleBuildingPlacement();
            } else {
                this.handleWorldInteraction();
            }
        } else if (button === 2) { // 右键
            this.handleRightClick();
        }
    }
    
    // 处理建筑放置
    handleBuildingPlacement() {
        const gridPos = this.baseBuildingSystem.worldToGrid(this.mouse.worldX, this.mouse.worldY);
        const building = this.baseBuildingSystem.buildBuilding(
            this.ui.selectedBuildingType,
            gridPos.x,
            gridPos.y
        );
        
        if (building) {
            this.questSystem.updateQuestProgress('build', this.ui.selectedBuildingType);
            this.ui.buildMode = false;
            this.ui.selectedBuildingType = null;
        }
    }
    
    // 处理世界交互
    handleWorldInteraction() {
        // 检查是否点击了资源
        for (let i = this.entities.resources.length - 1; i >= 0; i--) {
            const resource = this.entities.resources[i];
            if (this.isPointInRect(this.mouse.worldX, this.mouse.worldY, resource)) {
                this.collectResource(resource, i);
                break;
            }
        }
    }
    
    // 处理右键点击
    handleRightClick() {
        // 检查是否点击了建筑
        const gridPos = this.baseBuildingSystem.worldToGrid(this.mouse.worldX, this.mouse.worldY);
        const building = this.baseBuildingSystem.getBuildingAt(gridPos.x, gridPos.y);
        
        if (building) {
            this.ui.selectedBuilding = building;
        }
    }
    
    // 收集资源
    collectResource(resource, index) {
        // 添加到基地资源
        if (this.baseBuildingSystem.resources[resource.type] !== undefined) {
            const amount = Math.floor(resource.amount * this.characterProgression.attributes.resourceEfficiency);
            this.baseBuildingSystem.resources[resource.type] += amount;
            
            // 更新任务进度
            this.questSystem.updateQuestProgress('collect', resource.type, amount);
            
            // 添加经验
            this.characterProgression.addExperience(resource.experience || 5);
            
            // 创建收集特效
            this.particleSystem.createEffect('collect', resource.x, resource.y);
            
            // 移除资源
            this.entities.resources.splice(index, 1);
        }
    }
    
    // 更新鼠标世界坐标
    updateMouseWorldPosition() {
        this.mouse.worldX = this.mouse.x + this.camera.x;
        this.mouse.worldY = this.mouse.y + this.camera.y;
    }
    
    // 检查点是否在矩形内
    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }
    
    // 游戏主循环
    gameLoop(currentTime) {
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (this.gameState === 'playing') {
            this.update(this.deltaTime);
        }
        
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }
    
    // 更新游戏逻辑
    update(deltaTime) {
        // 更新玩家
        this.updatePlayer(deltaTime);
        
        // 更新摄像机
        this.updateCamera(deltaTime);
        
        // 更新地图生成
        this.updateMapGeneration();
        
        // 更新基地系统
        this.baseBuildingSystem.updateResourceProduction();
        
        // 更新粒子系统
        this.particleSystem.update(deltaTime);
        
        // 更新实体
        this.updateEntities(deltaTime);
        
        // 性能监控
        this.performanceOptimizer.update(deltaTime);
    }
    
    // 更新玩家
    updatePlayer(deltaTime) {
        let moveX = 0;
        let moveY = 0;
        
        // 处理移动输入
        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;
        
        // 标准化移动向量
        if (moveX !== 0 || moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
            
            this.player.isMoving = true;
            this.player.direction = Math.atan2(moveY, moveX);
        } else {
            this.player.isMoving = false;
        }
        
        // 应用移动
        const speed = this.characterProgression.attributes.moveSpeed;
        this.player.x += moveX * speed * deltaTime;
        this.player.y += moveY * speed * deltaTime;
        
        // 更新玩家所在区块
        const chunkSize = this.mapGenerator.chunkSize;
        const newChunkX = Math.floor(this.player.x / chunkSize);
        const newChunkY = Math.floor(this.player.y / chunkSize);
        
        if (newChunkX !== this.player.currentChunk.x || newChunkY !== this.player.currentChunk.y) {
            this.player.currentChunk = { x: newChunkX, y: newChunkY };
        }
    }
    
    // 更新摄像机
    updateCamera(deltaTime) {
        // 摄像机跟随玩家
        this.camera.targetX = this.player.x - this.width / 2;
        this.camera.targetY = this.player.y - this.height / 2;
        
        // 平滑移动
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
    }
    
    // 更新地图生成
    updateMapGeneration() {
        const renderDistance = 2;
        const chunkX = this.player.currentChunk.x;
        const chunkY = this.player.currentChunk.y;
        
        // 生成周围的区块
        for (let x = chunkX - renderDistance; x <= chunkX + renderDistance; x++) {
            for (let y = chunkY - renderDistance; y <= chunkY + renderDistance; y++) {
                if (!this.mapGenerator.chunks.has(`${x},${y}`)) {
                    const chunk = this.mapGenerator.generateChunk(x, y);
                    this.addChunkEntities(chunk);
                }
            }
        }
        
        // 清理远距离区块
        const cleanupDistance = 4;
        for (const [key, chunk] of this.mapGenerator.chunks.entries()) {
            const [x, y] = key.split(',').map(Number);
            const distance = Math.max(Math.abs(x - chunkX), Math.abs(y - chunkY));
            
            if (distance > cleanupDistance) {
                this.mapGenerator.unloadChunk(x, y);
                this.removeChunkEntities(chunk);
            }
        }
    }
    
    // 添加区块实体
    addChunkEntities(chunk) {
        // 添加资源
        if (chunk.resources && Array.isArray(chunk.resources)) {
            for (const resource of chunk.resources) {
                this.entities.resources.push({
                    x: resource.x,
                    y: resource.y,
                    width: 16,
                    height: 16,
                    type: resource.type,
                    amount: resource.amount,
                    experience: 5
                });
            }
        }
        
        // 添加敌人（从 chunk.entities 中筛选敌人类型）
        if (chunk.entities && Array.isArray(chunk.entities)) {
            for (const entity of chunk.entities) {
                if (entity.type === 'enemy') {
                    this.entities.enemies.push({
                        x: entity.x,
                        y: entity.y,
                        width: 24,
                        height: 24,
                        type: entity.subtype,
                        health: entity.level * 20,
                        maxHealth: entity.level * 20,
                        damage: entity.level * 5,
                        speed: 50 + entity.level * 10,
                        lastAttack: 0,
                        level: entity.level
                    });
                }
            }
        }
    }
    
    // 移除区块实体
    removeChunkEntities(chunk) {
        // 移除该区块的实体
        const chunkBounds = {
            left: chunk.x * this.mapGenerator.chunkSize,
            right: (chunk.x + 1) * this.mapGenerator.chunkSize,
            top: chunk.y * this.mapGenerator.chunkSize,
            bottom: (chunk.y + 1) * this.mapGenerator.chunkSize
        };
        
        this.entities.resources = this.entities.resources.filter(resource => 
            resource.x < chunkBounds.left || resource.x >= chunkBounds.right ||
            resource.y < chunkBounds.top || resource.y >= chunkBounds.bottom
        );
        
        this.entities.enemies = this.entities.enemies.filter(enemy => 
            enemy.x < chunkBounds.left || enemy.x >= chunkBounds.right ||
            enemy.y < chunkBounds.top || enemy.y >= chunkBounds.bottom
        );
    }
    
    // 更新实体
    updateEntities(deltaTime) {
        // 更新敌人
        for (let i = this.entities.enemies.length - 1; i >= 0; i--) {
            const enemy = this.entities.enemies[i];
            this.updateEnemy(enemy, deltaTime);
            
            if (enemy.health <= 0) {
                this.questSystem.updateQuestProgress('kill', enemy.type);
                this.characterProgression.addExperience(enemy.experience || 10);
                this.entities.enemies.splice(i, 1);
            }
        }
    }
    
    // 更新敌人
    updateEnemy(enemy, deltaTime) {
        // 简单的AI：向玩家移动
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0 && distance < 200) {
            const moveX = (dx / distance) * enemy.speed * deltaTime;
            const moveY = (dy / distance) * enemy.speed * deltaTime;
            
            enemy.x += moveX;
            enemy.y += moveY;
        }
    }
    
    // 渲染游戏
    render() {
        // 清空画布
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 保存画布状态
        this.ctx.save();
        
        // 应用摄像机变换
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // 渲染地图
        this.renderMap();
        
        // 渲染基地建筑
        this.renderBuildings();
        
        // 渲染实体
        this.renderEntities();
        
        // 渲染玩家
        this.renderPlayer();
        
        // 渲染粒子效果
        this.particleSystem.render(this.ctx);
        
        // 渲染建造模式
        if (this.ui.buildMode) {
            this.renderBuildMode();
        }
        
        // 恢复画布状态
        this.ctx.restore();
        
        // 渲染UI
        this.renderUI();
    }
    
    // 渲染地图
    renderMap() {
        const renderDistance = 3;
        const chunkX = this.player.currentChunk.x;
        const chunkY = this.player.currentChunk.y;
        
        for (let x = chunkX - renderDistance; x <= chunkX + renderDistance; x++) {
            for (let y = chunkY - renderDistance; y <= chunkY + renderDistance; y++) {
                const chunk = this.mapGenerator.getChunk(x, y);
                if (chunk) {
                    this.renderChunk(chunk);
                }
            }
        }
    }
    
    // 渲染区块
    renderChunk(chunk) {
        const chunkSize = this.mapGenerator.chunkSize;
        const startX = chunk.x * chunkSize;
        const startY = chunk.y * chunkSize;
        
        // 渲染地形背景
        this.ctx.fillStyle = this.getBiomeColor(chunk.biome);
        this.ctx.fillRect(startX, startY, chunkSize, chunkSize);
        
        // 渲染地形特征
        for (const feature of chunk.terrain) {
            this.ctx.fillStyle = this.getTerrainColor(feature.type);
            this.ctx.fillRect(feature.x, feature.y, feature.width, feature.height);
        }
    }
    
    // 获取生物群系颜色
    getBiomeColor(biome) {
        const colors = {
            forest: '#228B22',
            desert: '#F4A460',
            snow: '#F0F8FF',
            volcano: '#8B0000',
            ocean: '#4682B4'
        };
        return colors[biome] || '#228B22';
    }
    
    // 获取地形颜色
    getTerrainColor(type) {
        const colors = {
            rock: '#696969',
            water: '#4169E1',
            lava: '#FF4500',
            ice: '#B0E0E6'
        };
        return colors[type] || '#696969';
    }
    
    // 渲染建筑
    renderBuildings() {
        for (const building of this.baseBuildingSystem.buildings.values()) {
            this.ctx.fillStyle = '#8B4513';
            this.ctx.fillRect(
                building.worldX,
                building.worldY,
                this.baseBuildingSystem.gridSize,
                this.baseBuildingSystem.gridSize
            );
            
            // 渲染建筑名称
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                building.type,
                building.worldX + this.baseBuildingSystem.gridSize / 2,
                building.worldY + this.baseBuildingSystem.gridSize / 2
            );
        }
    }
    
    // 渲染实体
    renderEntities() {
        // 渲染资源
        for (const resource of this.entities.resources) {
            this.ctx.fillStyle = this.getResourceColor(resource.type);
            this.ctx.fillRect(resource.x, resource.y, resource.width, resource.height);
        }
        
        // 渲染敌人
        for (const enemy of this.entities.enemies) {
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // 渲染血条
            const healthPercent = enemy.health / enemy.maxHealth;
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
            this.ctx.fillStyle = '#00FF00';
            this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
        }
    }
    
    // 获取资源颜色
    getResourceColor(type) {
        const colors = {
            wood: '#8B4513',
            stone: '#708090',
            metal: '#C0C0C0',
            food: '#FFD700'
        };
        return colors[type] || '#8B4513';
    }
    
    // 渲染玩家
    renderPlayer() {
        this.ctx.fillStyle = '#0000FF';
        this.ctx.fillRect(
            this.player.x - this.player.width / 2,
            this.player.y - this.player.height / 2,
            this.player.width,
            this.player.height
        );
    }
    
    // 渲染建造模式
    renderBuildMode() {
        if (this.ui.selectedBuildingType) {
            const gridPos = this.baseBuildingSystem.worldToGrid(this.mouse.worldX, this.mouse.worldY);
            const worldPos = this.baseBuildingSystem.gridToWorld(gridPos.x, gridPos.y);
            
            const canBuild = this.baseBuildingSystem.canBuildAt(
                this.ui.selectedBuildingType,
                gridPos.x,
                gridPos.y
            );
            
            this.ctx.fillStyle = canBuild ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
            this.ctx.fillRect(
                worldPos.x,
                worldPos.y,
                this.baseBuildingSystem.gridSize,
                this.baseBuildingSystem.gridSize
            );
        }
    }
    
    // 渲染UI
    renderUI() {
        // 渲染资源信息
        this.renderResourcePanel();
        
        // 渲染角色信息
        this.renderCharacterInfo();
        
        // 渲染任务面板
        if (this.ui.showQuestPanel) {
            this.renderQuestPanel();
        }
        
        // 渲染建造面板
        if (this.ui.showBasePanel) {
            this.renderBuildingPanel();
        }
        
        // 渲染帮助信息
        this.renderHelpInfo();
    }
    
    // 渲染资源面板
    renderResourcePanel() {
        const x = 10;
        const y = 10;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, 200, 120);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        let offsetY = 0;
        for (const [resource, amount] of Object.entries(this.baseBuildingSystem.resources)) {
            this.ctx.fillText(
                `${resource}: ${Math.floor(amount)}`,
                x + 10,
                y + 25 + offsetY
            );
            offsetY += 20;
        }
    }
    
    // 渲染角色信息
    renderCharacterInfo() {
        const x = this.width - 220;
        const y = 10;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, 210, 100);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        const charData = this.characterProgression.getCharacterData();
        
        this.ctx.fillText(`等级: ${charData.level}`, x + 10, y + 25);
        this.ctx.fillText(`经验: ${charData.experience}/${charData.experienceRequired}`, x + 10, y + 45);
        this.ctx.fillText(`战力: ${charData.powerLevel}`, x + 10, y + 65);
        this.ctx.fillText(`属性点: ${charData.attributePoints}`, x + 10, y + 85);
    }
    
    // 渲染任务面板
    renderQuestPanel() {
        const x = 50;
        const y = 150;
        const width = 400;
        const height = 300;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x, y, width, height);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('任务列表', x + 10, y + 25);
        
        const activeQuests = this.questSystem.getActiveQuests();
        let offsetY = 50;
        
        for (const quest of activeQuests.slice(0, 8)) {
            this.ctx.font = '14px Arial';
            this.ctx.fillText(quest.title, x + 10, y + offsetY);
            
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#CCCCCC';
            this.ctx.fillText(quest.description, x + 10, y + offsetY + 15);
            
            // 渲染进度条
            const progress = this.questSystem.getQuestProgress(quest.id);
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(x + 10, y + offsetY + 20, 200, 8);
            this.ctx.fillStyle = '#00FF00';
            this.ctx.fillRect(x + 10, y + offsetY + 20, 200 * (progress / 100), 8);
            
            this.ctx.fillStyle = '#FFFFFF';
            offsetY += 45;
        }
    }
    
    // 渲染建造面板
    renderBuildingPanel() {
        const x = this.width - 250;
        const y = 120;
        const width = 240;
        const height = 400;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x, y, width, height);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('建筑列表', x + 10, y + 25);
        
        let offsetY = 50;
        for (const [buildingType, buildingDef] of Object.entries(this.baseBuildingSystem.buildingTypes)) {
            if (buildingType === 'headquarters') continue;
            
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = this.ui.selectedBuildingType === buildingType ? '#FFFF00' : '#FFFFFF';
            this.ctx.fillText(buildingDef.name, x + 10, y + offsetY);
            
            offsetY += 25;
            
            if (offsetY > height - 50) break;
        }
    }
    
    // 渲染帮助信息
    renderHelpInfo() {
        const x = 10;
        const y = this.height - 120;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, 300, 110);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        
        const helpText = [
            'WASD - 移动',
            'I - 背包',
            'C - 角色面板',
            'B - 建造面板',
            'Q - 任务面板',
            'G - 建造模式',
            'ESC - 取消'
        ];
        
        for (let i = 0; i < helpText.length; i++) {
            this.ctx.fillText(helpText[i], x + 10, y + 20 + i * 15);
        }
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.InfiniteGame = InfiniteGame;
}