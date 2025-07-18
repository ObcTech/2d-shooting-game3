// 游戏配置
// CONFIG现在从config.js加载

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.player = new Player(this.width / 2, this.height / 2);
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.powerups = [];
        this.obstacles = [];
        this.bosses = [];
        this.npcs = [];
        
        // 金币系统
        this.coinSystem = new CoinSystem();
        
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        
        this.score = 0;
        this.gameRunning = true;
        this.wave = 1;
        this.killCount = 0;
        
        // 旧的敌人生成逻辑已移除，现在使用WaveSystem统一管理
        this.powerupSpawnTimer = 0;
        this.powerupSpawnInterval = 600; // 10秒
        
        // 武器系统
        this.currentWeapon = 'PISTOL';
        this.availableWeapons = ['PISTOL'];
        
        // 关卡系统
        this.currentLevel = 'CITY';
        this.gameMode = 'SURVIVAL';
        this.levelStartTime = Date.now();
        this.missionComplete = false;
        this.bossSpawned = false;
        this.bossWave = 5; // 第5波出现Boss
        
        // 波次系统
        this.waveSystem = new WaveSystem(true); // 启用自动开始
        this.enemyBullets = []; // 敌人子弹数组
        
        // UI相关
        this.lastFrameTime = 0;
        
        // 初始化关卡
        this.initializeLevel();
        
        // 音效系统
        this.audioContext = null;
        this.sounds = {};
        this.initAudio();
        
        // 性能监控
        this.fps = 60;
        this.lastTime = 0;
        this.frameCount = 0;
        
        // 性能优化器
        this.performanceOptimizer = new PerformanceOptimizer();
        this.memoryMonitor = new MemoryMonitor();
        this.particleQuality = 1.0;
        this.maxParticles = 150;
        
        // UI管理器
        this.uiManager = new UIManager(this);
        window.uiManager = this.uiManager; // 全局访问
        
        // 统一UI系统
        this.unifiedUI = new UnifiedUIManager(this);
        window.unifiedUI = this.unifiedUI; // 全局访问
        
        // 初始化环境特效系统
        if (window.EnvironmentEffects) {
            this.environmentEffects = new EnvironmentEffects(this.canvas);
        }
        
        // 初始化视觉特效增强系统
        if (window.VisualEffectsEnhanced) {
            this.visualEffectsEnhanced = new VisualEffectsEnhanced(this.canvas);
            window.visualEffectsEnhanced = this.visualEffectsEnhanced; // 全局访问
        }
        
        // 初始化UI主题系统
        if (window.UIThemeSystem) {
            this.uiThemeSystem = new UIThemeSystem();
            window.uiThemeSystem = this.uiThemeSystem; // 全局访问
        }
        
        // 初始化环境美术系统
        if (window.EnvironmentArtSystem) {
            this.environmentArt = new EnvironmentArtSystem(this.canvas);
            window.environmentArt = this.environmentArt; // 全局访问
        }
        
        // 初始化角色动画系统
        if (window.AnimatedCharacterRenderer) {
            this.characterAnimation = new AnimatedCharacterRenderer();
            window.characterAnimation = this.characterAnimation; // 全局访问
        }
        
        // 初始化音效视觉联动系统
        if (window.AudioVisualSyncSystem) {
            this.audioVisualSync = window.audioVisualSync;
        }
        
        // 初始化特效编辑器
        if (window.effectsEditor) {
            this.effectsEditor = window.effectsEditor;
        }
        
        // 初始化性能监控面板
        if (window.performanceMonitor) {
            this.performanceMonitor = window.performanceMonitor;
        }
        
        // 初始化开发者控制台
        if (window.developerConsole) {
            this.developerConsole = window.developerConsole;
        }
        
        // 初始化角色视觉系统
        if (window.characterVisualSystem) {
            this.characterVisualSystem = window.characterVisualSystem;
        }
        
        // 初始化敌人多样化系统
        if (window.enemyDiversitySystem) {
            this.enemyDiversitySystem = window.enemyDiversitySystem;
        }
        
        // 初始化增强AI系统
        if (window.EnhancedAISystem) {
            this.enhancedAISystem = new EnhancedAISystem();
        }
        
        // 初始化智能敌人AI系统
        if (window.IntelligentEnemyAI) {
            this.intelligentEnemyAI = new IntelligentEnemyAI();
        }
        
        // 初始化群体行为系统
        if (window.GroupBehaviorSystem) {
            this.groupBehaviorSystem = new GroupBehaviorSystem();
        }
        
        // 初始化动态难度系统
        if (window.DynamicDifficultySystem) {
            this.dynamicDifficultySystem = new DynamicDifficultySystem();
        }
        
        // 初始化学习型AI系统
        if (window.LearningAISystem) {
            this.learningAISystem = new LearningAISystem();
        }
        
        // 初始化开发者控制台
        if (window.developerConsole) {
            this.developerConsole = window.developerConsole;
        }
        
        // 测试调试器
        this.gameTester = new GameTester(this);
        window.gameTester = this.gameTester; // 全局访问，便于调试
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    initAudio() {
        if (!CONFIG.AUDIO.ENABLED) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.warn('音频初始化失败:', e);
            CONFIG.AUDIO.ENABLED = false;
        }
    }
    
    createSounds() {
        // 创建射击音效
        this.sounds.shoot = this.createTone(800, 0.1, 'square');
        // 创建敌人死亡音效
        this.sounds.enemyDeath = this.createTone(200, 0.2, 'sawtooth');
        // 创建玩家受伤音效
        this.sounds.playerHit = this.createTone(150, 0.3, 'triangle');
    }
    
    createTone(frequency, duration, type = 'sine') {
        return () => {
            if (!this.audioContext || !CONFIG.AUDIO.ENABLED) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(CONFIG.AUDIO.VOLUME, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    initializeLevel() {
        const levelConfig = CONFIG.LEVELS[this.currentLevel];
        
        // 清空现有障碍物
        this.obstacles = [];
        
        // 创建障碍物
        if (levelConfig.obstacles) {
            levelConfig.obstacles.forEach(obstacleData => {
                this.obstacles.push(new Obstacle(
                    obstacleData.x,
                    obstacleData.y,
                    obstacleData.width,
                    obstacleData.height,
                    obstacleData.type
                ));
            });
        } else {
            // 如果没有预定义障碍物，生成一些随机障碍物
            this.generateRandomObstacles();
        }
        
        // 根据游戏模式初始化特殊对象
        if (this.gameMode === 'ESCORT') {
            this.npcs = [new NPC(100, 100, this.width - 100, this.height - 100)];
        }
        
        // 初始化金币系统 - 清空现有金币和升级站
        this.coinSystem.clear();
        this.coinSystem.upgradeStations = [];
        
        // 在地图上生成升级站
        this.generateUpgradeStations();
    }
    
    generateRandomObstacles() {
        const obstacleCount = 5 + Math.floor(Math.random() * 5); // 5-10个障碍物
        const obstacleTypes = ['wall', 'crate', 'barrel', 'rock'];
        
        for (let i = 0; i < obstacleCount; i++) {
            let x, y, width, height;
            let attempts = 0;
            let validPosition = false;
            
            // 尝试找到一个不与玩家起始位置冲突的位置
            while (!validPosition && attempts < 50) {
                x = Math.random() * (this.width - 100) + 50;
                y = Math.random() * (this.height - 100) + 50;
                width = 30 + Math.random() * 40;
                height = 30 + Math.random() * 40;
                
                // 确保不与玩家起始位置冲突
                const playerStartX = this.width / 2;
                const playerStartY = this.height / 2;
                const distanceToPlayer = Math.sqrt(
                    (x + width/2 - playerStartX) ** 2 + 
                    (y + height/2 - playerStartY) ** 2
                );
                
                if (distanceToPlayer > 100) {
                    validPosition = true;
                }
                attempts++;
            }
            
            if (validPosition) {
                const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                this.obstacles.push(new Obstacle(x, y, width, height, type));
            }
        }
    }
    
    generateUpgradeStations() {
        // 在地图上生成2-3个升级站
        const stationCount = 2 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < stationCount; i++) {
            let x, y;
            let attempts = 0;
            let validPosition = false;
            
            // 尝试找到一个合适的位置
            while (!validPosition && attempts < 50) {
                x = Math.random() * (this.width - 60) + 30;
                y = Math.random() * (this.height - 60) + 30;
                
                // 确保不与玩家起始位置冲突
                const playerStartX = this.width / 2;
                const playerStartY = this.height / 2;
                const distanceToPlayer = Math.sqrt(
                    (x - playerStartX) ** 2 + (y - playerStartY) ** 2
                );
                
                // 确保不与障碍物冲突
                let conflictsWithObstacle = false;
                for (const obstacle of this.obstacles) {
                    if (x < obstacle.x + obstacle.width + 20 &&
                        x + 30 > obstacle.x - 20 &&
                        y < obstacle.y + obstacle.height + 20 &&
                        y + 30 > obstacle.y - 20) {
                        conflictsWithObstacle = true;
                        break;
                    }
                }
                
                if (distanceToPlayer > 80 && !conflictsWithObstacle) {
                    validPosition = true;
                }
                attempts++;
            }
            
            if (validPosition) {
                this.coinSystem.addUpgradeStation(x, y);
            }
        }
    }
    
    switchLevel(newLevel) {
        this.currentLevel = newLevel;
        this.initializeLevel();
        this.wave = 1;
        this.killCount = 0;
        this.bossSpawned = false;
        this.levelStartTime = Date.now();
        this.missionComplete = false;
    }
    
    checkMissionObjective() {
        const modeConfig = CONFIG.GAME_MODES[this.gameMode];
        
        switch (this.gameMode) {
            case 'SURVIVAL':
                const elapsedTime = (Date.now() - this.levelStartTime) / 1000;
                if (elapsedTime >= modeConfig.targetTime) {
                    this.missionComplete = true;
                    this.completeMission();
                }
                break;
                
            case 'ELIMINATION':
                if (this.killCount >= modeConfig.targetKills) {
                    this.missionComplete = true;
                    this.completeMission();
                }
                break;
                
            case 'ESCORT':
                if (this.npcs.length > 0) {
                    const npc = this.npcs[0];
                    if (npc.reachedTarget) {
                        this.missionComplete = true;
                        this.completeMission();
                    }
                }
                break;
        }
    }
    
    completeMission() {
        this.score += 1000; // 任务完成奖励
        
        // 切换到下一个关卡
        const levels = Object.keys(CONFIG.LEVELS);
        const currentIndex = levels.indexOf(this.currentLevel);
        
        if (currentIndex < levels.length - 1) {
            setTimeout(() => {
                this.switchLevel(levels[currentIndex + 1]);
            }, 2000);
        } else {
            // 所有关卡完成
            this.gameRunning = false;
            alert(`恭喜！所有关卡完成！最终得分: ${this.score}`);
        }
    }

    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // 武器切换
            if (e.key >= '1' && e.key <= '4') {
                const weaponIndex = parseInt(e.key) - 1;
                if (weaponIndex < this.availableWeapons.length) {
                    this.currentWeapon = this.availableWeapons[weaponIndex];
                }
            }
            
            // 技能快捷键 (Q, E, R, T)
            if (e.key.toLowerCase() === 'q') {
                this.player.skillSystem.useSkill('dash');
            } else if (e.key.toLowerCase() === 'e') {
                this.player.skillSystem.useSkill('shield');
            } else if (e.key.toLowerCase() === 'r') {
                this.player.skillSystem.useSkill('timeSlowdown');
            } else if (e.key.toLowerCase() === 't') {
                this.player.skillSystem.useSkill('invincibility');
            }
            
            // UI面板切换
            if (e.key.toLowerCase() === 'k') {
                this.unifiedUI.togglePanel('skills');
            } else if (e.key.toLowerCase() === 'j') {
                this.unifiedUI.togglePanel('achievements');
            } else if (e.key.toLowerCase() === 'l') {
                this.unifiedUI.togglePanel('statistics');
            }
            
            // 统一UI系统快捷键
            if (e.key.toLowerCase() === 'h') {
                this.unifiedUI.toggleUI();
            } else if (e.key.toLowerCase() === 'i') {
                this.unifiedUI.togglePanel('gameInfo');
            } else if (e.key.toLowerCase() === 'c') {
                this.unifiedUI.togglePanel('controls');
            }
            
            // AI级别调整
            if (e.key === 'F2') {
                if (window.AI_LEVEL > 0) {
                    window.AI_LEVEL--;
                    const aiLevels = [
                        '基础移动',
                        '增强AI',
                        '智能AI',
                        '群体行为',
                        '动态难度',
                        '学习AI',
                        '多样化系统'
                    ];
                    console.log(`AI级别降低到: ${window.AI_LEVEL} (${aiLevels[window.AI_LEVEL]})`);
                }
            } else if (e.key === 'F3') {
                if (window.AI_LEVEL < 6) {
                    window.AI_LEVEL++;
                    const aiLevels = [
                        '基础移动',
                        '增强AI',
                        '智能AI',
                        '群体行为',
                        '动态难度',
                        '学习AI',
                        '多样化系统'
                    ];
                    console.log(`AI级别提升到: ${window.AI_LEVEL} (${aiLevels[window.AI_LEVEL]})`);
                }
            }
            
            // 技能升级快捷键 (Shift + 数字)
            if (e.shiftKey && e.key >= '1' && e.key <= '8') {
                const skillIndex = parseInt(e.key) - 1;
                const skillNames = ['rapidFire', 'multiShot', 'damageBoost', 'healthBoost', 'speedBoost', 'shield', 'dash', 'timeSlowdown'];
                if (skillIndex < skillNames.length) {
                    this.player.skillSystem.upgradeSkill(skillNames[skillIndex]);
                }
            }
            
            // 音频上下文需要用户交互才能启动
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // 鼠标事件（保留用于UI交互）
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        // 防止右键菜单
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    spawnEnemy() {
        // 这个方法现在由WaveSystem统一管理，不再直接调用
        // 保留方法以防其他地方有调用，但实际生成逻辑已移至update()中的waveSystem.update()
        console.log('[DEBUG] spawnEnemy called - now handled by WaveSystem in update() method');
        
        // 检查是否应该生成Boss（保留原有逻辑作为备用）
        if (this.wave >= this.bossWave && !this.bossSpawned && this.enemies.length === 0) {
            this.spawnBoss();
            return;
        }
    }
    
    spawnBoss() {
        const bossTypes = Object.keys(CONFIG.BOSSES);
        let bossType;
        
        // 根据波次选择Boss类型
        if (this.wave >= 15) {
            bossType = 'FINAL_BOSS';
        } else if (this.wave >= 10) {
            bossType = 'SPEED_BOSS';
        } else {
            bossType = 'TANK_BOSS';
        }
        
        const x = this.width / 2;
        const y = -50;
        
        this.bosses.push(new Boss(x, y, bossType));
        this.bossSpawned = true;
        
        // 显示Boss出现提示
        console.log(`Boss ${CONFIG.BOSSES[bossType].name} 出现！`);
    }
    
    spawnPowerup() {
        const x = Math.random() * (this.width - 60) + 30;
        const y = Math.random() * (this.height - 60) + 30;
        
        const powerupTypes = Object.keys(CONFIG.POWERUPS);
        const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        this.powerups.push(new Powerup(x, y, randomType));
    }
    
    update() {
        if (!this.gameRunning) return;

        // 清理无效的敌人对象
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy || typeof enemy.update !== 'function') {
                console.warn('[DEBUG] Removing invalid enemy from array:', enemy);
                return false;
            }
            return true;
        });

        // 计算deltaTime
        const currentTime = performance.now();
        const deltaTime = this.lastFrameTime ? currentTime - this.lastFrameTime : 16.67;
        this.lastFrameTime = currentTime;
        
        // 更新玩家（传递deltaTime）
        this.player.update(this.keys, this.width, this.height, deltaTime);
        
        // 更新角色视觉系统
        if (this.characterVisualSystem) {
            this.characterVisualSystem.updatePlayer(this.player, deltaTime);
        }
        
        // 检查技能效果对玩家的影响
        if (this.player.skillSystem.hasActiveSkill('invincibility')) {
            this.player.isInvincible = true;
        } else {
            this.player.isInvincible = false;
        }
        
        // 检查时间减缓效果
        const timeMultiplier = this.player.skillSystem.hasActiveSkill('timeSlowdown') ? 0.3 : 1.0;
        
        // 自动瞄准和射击
        if (this.enemies.length > 0) {
            const nearestEnemy = this.findNearestEnemy();
            if (nearestEnemy) {
                this.player.autoShoot(nearestEnemy.x, nearestEnemy.y, this.bullets, this);
            }
        }
        
        // 敌人生成现在由WaveSystem统一管理
        console.log(`[DEBUG] Calling waveSystem.update`);
        const newEnemies = this.waveSystem.update(deltaTime, this.enemies, this);
        console.log(`[DEBUG] WaveSystem returned ${newEnemies.length} new enemies`);
        
        // 添加新生成的敌人到游戏中
        newEnemies.forEach(enemy => {
            console.log(`[DEBUG] Adding enemy to game:`, enemy);
            if (enemy && typeof enemy.update === 'function') {
                this.enemies.push(enemy);
            } else {
                console.warn('[DEBUG] Skipping invalid enemy:', enemy);
            }
        });
        
        // 生成道具
        this.powerupSpawnTimer++;
        if (this.powerupSpawnTimer >= this.powerupSpawnInterval) {
            this.spawnPowerup();
            this.powerupSpawnTimer = 0;
        }
        
        // AI控制级别 (0=基础移动, 1=增强AI, 2=智能AI, 3=群体行为, 4=动态难度, 5=学习AI, 6=多样化系统)
        window.AI_LEVEL = window.AI_LEVEL || 0; // 从最基础开始
        
        // 更新敌人（渐进式AI系统）
        this.enemies.forEach(enemy => {
            // 检查敌人对象是否有效
            if (!enemy || typeof enemy.update !== 'function') {
                console.warn('Invalid enemy object found:', enemy);
                return;
            }
            
            // 标记敌人已被更新，避免重复处理
            if (enemy.updatedThisFrame) {
                return;
            }
            enemy.updatedThisFrame = true;
            
            // 基础移动逻辑（AI_LEVEL >= 0）
            if (timeMultiplier < 1.0) {
                const originalSpeed = enemy.speed;
                enemy.speed *= timeMultiplier;
                enemy.update(this.player.x, this.player.y, this.obstacles, deltaTime);
                enemy.speed = originalSpeed;
            } else {
                enemy.update(this.player.x, this.player.y, this.obstacles, deltaTime);
            }
            
            // 收集敌人子弹
            if (enemy.bullets && enemy.bullets.length > 0) {
                this.enemyBullets.push(...enemy.bullets);
                enemy.bullets = [];
            }
        });
        
        // 清除敌人的更新标记，为下一帧准备
        this.enemies.forEach(enemy => {
            if (enemy && typeof enemy === 'object') {
                enemy.updatedThisFrame = false;
            }
        });
        
        // 渐进式AI系统启用
        if (window.AI_LEVEL >= 1 && this.enhancedAISystem) {
            // 增强AI系统
            this.enhancedAISystem.update(this.enemies, this.player, deltaTime);
        }
        
        if (window.AI_LEVEL >= 2 && this.intelligentEnemyAI) {
            // 智能敌人AI系统
            this.intelligentEnemyAI.update(this.enemies, this.player, deltaTime);
        }
        
        if (window.AI_LEVEL >= 3 && this.groupBehaviorSystem) {
            // 群体行为系统
            this.groupBehaviorSystem.update(this.enemies, this.player, deltaTime);
        }
        
        if (window.AI_LEVEL >= 4 && this.dynamicDifficultySystem) {
            // 动态难度系统
            this.dynamicDifficultySystem.update(this, this.player, deltaTime);
        }
        
        if (window.AI_LEVEL >= 5 && this.learningAISystem) {
            // 学习型AI系统
            this.learningAISystem.update(this, this.enemies, this.player, deltaTime);
        }
        
        if (window.AI_LEVEL >= 6 && this.enemyDiversitySystem) {
            // 敌人多样化系统（最高级）
            this.enemies.forEach(enemy => {
                if (!enemy.diversityUpdated) {
                    if (timeMultiplier < 1.0) {
                        const adjustedDeltaTime = deltaTime * timeMultiplier;
                        this.enemyDiversitySystem.updateEnemyAI(
                            enemy, this.player, adjustedDeltaTime, this.obstacles, this.enemies
                        );
                    } else {
                        this.enemyDiversitySystem.updateEnemyAI(
                            enemy, this.player, deltaTime, this.obstacles, this.enemies
                        );
                    }
                    enemy.diversityUpdated = true;
                    
                    // 处理自爆敌人
                    if (enemy.selfDestructTriggered && Date.now() >= enemy.selfDestructTime) {
                        this.createExplosion(enemy.x, enemy.y, 40, enemy.damage);
                        const index = this.enemies.indexOf(enemy);
                        if (index > -1) {
                            this.enemies.splice(index, 1);
                        }
                    }
                }
            });
            
            // 清除多样化系统更新标记
            this.enemies.forEach(enemy => {
                if (enemy && typeof enemy === 'object') {
                    enemy.diversityUpdated = false;
                }
            });
        }
        
        // 更新敌人子弹
        this.enemyBullets.forEach(bullet => {
            bullet.update();
        });
        
        // 更新Boss（应用时间减缓效果）
        this.bosses.forEach(boss => {
            if (timeMultiplier < 1.0) {
                const originalSpeed = boss.speed;
                boss.speed *= timeMultiplier;
                boss.update(this.player, this.obstacles);
                boss.speed = originalSpeed;
            } else {
                boss.update(this.player, this.obstacles);
            }
            
            // 检查Boss是否需要生成小怪
            if (boss.shouldSpawnMinion()) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 50;
                const minionX = boss.x + Math.cos(angle) * distance;
                const minionY = boss.y + Math.sin(angle) * distance;
                
                const minion = new Enemy(minionX, minionY, 'fast');
                if (minion && typeof minion.update === 'function') {
                    this.enemies.push(minion);
                } else {
                    console.warn('[DEBUG] Failed to create boss minion');
                }
            }
        });
        
        // 更新NPC
        this.npcs.forEach(npc => {
            npc.update(this.player, this.enemies, this.obstacles);
        });
        
        // 更新子弹（玩家子弹不受时间减缓影响）
        this.bullets.forEach(bullet => {
            bullet.update();
        });
        
        // 更新粒子效果
        this.particles.forEach(particle => {
            particle.update();
        });
        
        // 更新增强粒子系统
        if (window.enhancedParticles) {
            window.enhancedParticles.update(deltaTime);
        }
        
        // 更新屏幕震动
        if (window.screenShake) {
            window.screenShake.update(deltaTime);
        }
        
        // 更新伤害数字
        if (window.damageNumbers) {
            window.damageNumbers.update(deltaTime);
        }
        
        // 更新环境特效
        if (this.environmentEffects) {
            this.environmentEffects.update(deltaTime);
        }
        
        // 更新道具
        this.powerups.forEach(powerup => {
            powerup.update();
        });
        
        // 更新金币系统
        this.coinSystem.update(this.player);
        
        // 碰撞检测
        this.checkCollisions();
        
        // 检查任务目标
        this.checkMissionObjective();
        
        // 清理超出边界的对象
        this.cleanup();
        
        // 更新UI
        this.updateUI();
    }
    
    checkCollisions() {
        // 子弹与障碍物碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let obstacle of this.obstacles) {
                if (this.isCollidingWithRect(bullet, obstacle)) {
                    // 创建撞击特效
                    if (window.weaponEffects) {
                        window.weaponEffects.createImpact(bullet.x, bullet.y, bullet.weaponType);
                    }
                    this.bullets.splice(i, 1);
                    this.createExplosion(bullet.x, bullet.y, '#95a5a6');
                    break;
                }
            }
        }
        
        // 子弹与敌人碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.isColliding(bullet, enemy)) {
                    // 创建撞击特效
                    if (window.weaponEffects) {
                        window.weaponEffects.createImpact(bullet.x, bullet.y, bullet.weaponType);
                    }
                    
                    // 显示伤害数字
                    if (window.damageNumbers) {
                        window.damageNumbers.show(enemy.x, enemy.y, bullet.damage);
                    }
                    
                    // 屏幕震动
                    if (window.screenShake) {
                        window.screenShake.shake(2, 100);
                    }
                    
                    // 创建爆炸粒子效果
                    this.createExplosion(enemy.x, enemy.y, '#ff6b6b');
                    
                    // 播放敌人死亡音效
                    this.playSound('enemyDeath');
                    
                    // 移除子弹
                    this.bullets.splice(i, 1);
                    
                    // 敌人受伤
                    enemy.health -= bullet.damage;
                    
                    // 爆炸武器效果
                    if (bullet.explosive) {
                        this.createExplosiveEffect(bullet.x, bullet.y, bullet.explosionRadius);
                    }
                    
                    if (enemy.health <= 0) {
                        // 通知波次系统敌人被击杀
                        this.waveSystem.onEnemyKilled(enemy);
                        
                        // 敌人死亡时掉落金币
                        const coinCount = 1 + Math.floor(Math.random() * 3); // 掉落1-3个金币
                        console.log(`敌人死亡，准备掉落 ${coinCount} 个金币，位置: (${enemy.x}, ${enemy.y})`);
                        for (let k = 0; k < coinCount; k++) {
                            const offsetX = (Math.random() - 0.5) * 40;
                            const offsetY = (Math.random() - 0.5) * 40;
                            this.coinSystem.dropCoin(enemy.x + offsetX, enemy.y + offsetY);
                            console.log(`掉落金币 ${k+1}/${coinCount}，位置: (${enemy.x + offsetX}, ${enemy.y + offsetY})`);
                        }
                        console.log(`当前金币总数: ${this.coinSystem.coins.length}`);
                        
                        // 移除敌人
                        this.enemies.splice(j, 1);
                        
                        // 增加分数和击杀数
                        let points = enemy.scoreValue || 10;
                        if (enemy.type === 'fast') points = 15;
                        else if (enemy.type === 'tank') points = 25;
                        
                        this.score += points * this.wave;
                        this.killCount++;
                        
                        // 记录统计和成就
                        this.player.statisticsSystem.recordKill(enemy.type);
                        this.player.statisticsSystem.recordHit();
                        this.player.achievementSystem.recordEvent('kill', enemy.type);
                        
                        // 给予技能点数
                        this.player.skillSystem.addSkillPoints(1);
                    } else {
                        // 记录命中但未击杀
                        this.player.statisticsSystem.recordHit();
                        this.player.statisticsSystem.recordDamageDealt(bullet.damage);
                    }
                    
                    // 检查是否进入下一波
                    if (this.killCount % 10 === 0 && !this.bossSpawned) {
                        this.nextWave();
                    }
                    
                    break;
                }
            }
        }
        
        // 子弹与Boss碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.bosses.length - 1; j >= 0; j--) {
                const boss = this.bosses[j];
                if (this.isColliding(bullet, boss)) {
                    this.createExplosion(boss.x, boss.y, '#8e44ad');
                    this.playSound('enemyDeath');
                    
                    this.bullets.splice(i, 1);
                    boss.takeDamage(bullet.damage);
                    
                    if (bullet.explosive) {
                        this.createExplosiveEffect(bullet.x, bullet.y, bullet.explosionRadius);
                    }
                    
                    if (boss.health <= 0) {
                        this.bosses.splice(j, 1);
                        this.score += 500 * this.wave;
                        this.killCount += 10;
                        this.bossSpawned = false;
                        
                        // 记录Boss击杀统计和成就
                        this.player.statisticsSystem.recordKill('boss');
                        this.player.statisticsSystem.recordHit();
                        this.player.achievementSystem.recordEvent('bossKill', boss.type);
                        
                        // Boss击杀给予更多技能点数
                        this.player.skillSystem.addSkillPoints(5);
                        
                        this.nextWave();
                    } else {
                        // 记录对Boss的伤害
                        this.player.statisticsSystem.recordHit();
                        this.player.statisticsSystem.recordDamageDealt(bullet.damage);
                    }
                    
                    break;
                }
            }
        }
        
        // 敌人与玩家碰撞
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.isColliding(this.player, enemy)) {
                const damaged = this.player.takeDamage(enemy.damage || 20);
                
                if (damaged) {
                    this.enemies.splice(i, 1);
                    
                    // 创建受伤粒子效果
                    this.createExplosion(this.player.x, this.player.y, '#4ecdc4');
                    
                    // 播放玩家受伤音效
                    this.playSound('playerHit');
                    
                    if (this.player.health <= 0) {
                        this.gameOver();
                    }
                }
            }
        }
        
        // 敌人子弹与玩家碰撞
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            if (this.isColliding(this.player, bullet)) {
                const damaged = this.player.takeDamage(bullet.damage || 10);
                
                if (damaged) {
                    // 移除子弹
                    this.enemyBullets.splice(i, 1);
                    
                    // 创建受伤粒子效果
                    this.createExplosion(this.player.x, this.player.y, '#4ecdc4');
                    
                    // 播放玩家受伤音效
                    this.playSound('playerHit');
                    
                    // 记录统计
                    this.player.statisticsSystem.recordDamageTaken(bullet.damage || 10);
                    
                    if (this.player.health <= 0) {
                        this.gameOver();
                    }
                }
            }
        }
        
        // Boss与玩家碰撞
        for (let i = this.bosses.length - 1; i >= 0; i--) {
            const boss = this.bosses[i];
            if (this.isColliding(this.player, boss)) {
                const damaged = this.player.takeDamage(boss.damage);
                
                if (damaged) {
                    // 创建受伤粒子效果
                    this.createExplosion(this.player.x, this.player.y, '#4ecdc4');
                    this.playSound('playerHit');
                    
                    if (this.player.health <= 0) {
                        this.gameOver();
                    }
                }
            }
        }
        
        // 敌人与NPC碰撞（护送模式）
        if (this.gameMode === 'ESCORT' && this.npcs.length > 0) {
            const npc = this.npcs[0];
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                if (this.isColliding(npc, enemy)) {
                    npc.takeDamage(20);
                    this.enemies.splice(i, 1);
                    
                    this.createExplosion(npc.x, npc.y, '#ffa502');
                    
                    if (npc.health <= 0) {
                        this.npcs = [];
                        this.gameOver();
                    }
                }
            }
        }
        
        // 玩家与道具碰撞
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            if (this.isColliding(this.player, powerup)) {
                this.collectPowerup(powerup);
                this.powerups.splice(i, 1);
            }
        }
    }
    
    isCollidingWithRect(circle, rect) {
        // 圆形与矩形碰撞检测
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        
        return (dx * dx + dy * dy) <= (circle.radius * circle.radius);
    }
    
    isColliding(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.radius + obj2.radius);
    }
    
    collectPowerup(powerup) {
        const config = CONFIG.POWERUPS[powerup.type];
        
        switch (config.effect) {
            case 'heal':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + config.value);
                break;
            case 'weapon':
                this.unlockNextWeapon();
                break;
            case 'speed':
                this.player.applySpeedBoost(config.value, config.duration);
                break;
            case 'shield':
                this.player.applyShield(config.duration);
                break;
        }
        
        // 创建收集效果
        this.createExplosion(powerup.x, powerup.y, config.color);
        this.score += 50;
    }
    
    unlockNextWeapon() {
        const weaponOrder = ['PISTOL', 'SHOTGUN', 'LASER', 'ROCKET'];
        const currentIndex = weaponOrder.indexOf(this.currentWeapon);
        
        if (currentIndex < weaponOrder.length - 1) {
            const nextWeapon = weaponOrder[currentIndex + 1];
            if (!this.availableWeapons.includes(nextWeapon)) {
                this.availableWeapons.push(nextWeapon);
                this.currentWeapon = nextWeapon;
            }
        }
    }
    
    createExplosiveEffect(x, y, radius) {
        // 对范围内的敌人造成伤害
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
                enemy.health -= 2;
                if (enemy.health <= 0) {
                    this.enemies.splice(i, 1);
                    this.score += 10 * this.wave;
                    this.killCount++;
                }
            }
        }
        
        // 创建爆炸视觉效果
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = Math.random() * 6 + 3;
            this.particles.push(new Particle(x, y, angle, speed, '#ff4757'));
        }
    }
    
    createExplosion(x, y, color = '#ff6b6b') {
        // 使用增强粒子系统创建爆炸效果
        if (window.enhancedParticles) {
            window.enhancedParticles.createExplosion(x, y, {
                color: color,
                particleCount: 12,
                intensity: 1.0
            });
        } else {
            // 回退到原始粒子系统
            const baseParticleCount = Math.random() * 6 + 8;
            const particleCount = Math.floor(baseParticleCount * this.particleQuality);
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
                const speed = Math.random() * 4 + 2;
                this.particles.push(new Particle(x, y, angle, speed, color));
            }
        }
        
        // 添加爆炸光效
        if (this.visualEffectsEnhanced) {
            this.visualEffectsEnhanced.addExplosionLight(x, y, color);
        }
    }
    
    nextWave() {
        this.wave++;
        
        // 敌人生成速度现在由WaveSystem管理
        
        // 显示波次信息
        this.showWaveMessage();
    }
    
    showWaveMessage() {
        // 这里可以添加波次提示的UI效果
        console.log(`第 ${this.wave} 波开始！`);
    }
    
    cleanup() {
        // 使用优化的清理方法，限制每帧清理数量以避免卡顿
        this.bullets = optimizedFilter(this.bullets, bullet => 
            bullet.x >= -10 && bullet.x <= this.width + 10 &&
            bullet.y >= -10 && bullet.y <= this.height + 10, 15
        );
        
        this.enemyBullets = optimizedFilter(this.enemyBullets, bullet => 
            bullet.x >= -50 && bullet.x <= this.width + 50 &&
            bullet.y >= -50 && bullet.y <= this.height + 50, 15
        );
        
        // 限制粒子数量以提高性能
        if (this.particles.length > this.maxParticles) {
            this.particles = this.particles.slice(-this.maxParticles);
        }
        this.particles = optimizedFilter(this.particles, particle => particle.life > 0, 20);
        
        this.powerups = optimizedFilter(this.powerups, powerup => powerup.life > 0, 5);
        
        // 检查内存使用情况
        if (this.memoryMonitor.checkMemory()) {
            // 强制清理更多对象
            this.forceCleanup();
        }
    }
    
    forceCleanup() {
        // 强制清理，减少对象数量
        this.particles = this.particles.slice(-Math.floor(this.maxParticles * 0.7));
        
        // 清理远距离的敌人子弹
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            const dist = Math.sqrt(
                Math.pow(bullet.x - this.player.x, 2) + 
                Math.pow(bullet.y - this.player.y, 2)
            );
            return dist < 400; // 只保留400像素范围内的子弹
        });
    }
    
    updateUI() {
        // 同步波次系统的波次到游戏波次
        this.wave = this.waveSystem.currentWave;
        
        // 更新统一UI系统的游戏信息
        if (this.unifiedUI) {
            this.unifiedUI.updateGameInfo({
                health: Math.max(0, this.player.health),
                score: this.score,
                wave: this.wave,
                kills: this.killCount,
                weapon: CONFIG.WEAPONS[this.currentWeapon].name,
                enemyCount: this.enemies.length
            });
        }
        
        // 武器信息已通过统一UI系统更新
    }
    
    calculateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // 结束统计会话
        this.player.statisticsSystem.endSession();
        
        // 显示最终统计
        const stats = this.player.statisticsSystem.getSessionSummary();
        const message = `游戏结束！\n最终得分: ${this.score}\n生存时间: ${stats.survivalTime}\n击杀数: ${stats.kills}\n命中率: ${stats.accuracy}%`;
        
        alert(message);
        location.reload();
    }
    
    render() {
        // 应用屏幕震动效果
        this.ctx.save();
        if (window.screenShake) {
            const shake = window.screenShake.getOffset();
            this.ctx.translate(shake.x, shake.y);
        }
        
        // 渲染环境美术系统背景
        if (this.environmentArt) {
            this.environmentArt.render();
        } else {
            // 清空画布并绘制关卡背景
            this.drawLevelBackground();
            
            // 绘制网格背景
            this.drawGrid();
        }
        
        // 绘制障碍物
        this.obstacles.forEach(obstacle => {
            obstacle.render(this.ctx);
        });
        
        // 绘制玩家（使用新的角色视觉系统）
        if (this.characterVisualSystem) {
            // 使用角色视觉系统渲染玩家
            this.characterVisualSystem.renderPlayer(this.ctx, this.player);
            
            // 渲染装备视觉效果
            if (this.player.currentWeapon) {
                this.characterVisualSystem.renderEquipment(this.ctx, this.player, this.player.currentWeapon);
            }
            
            // 渲染状态指示器
            this.characterVisualSystem.renderStatusIndicators(this.ctx, this.player);
        } else if (this.characterAnimation) {
            // 回退到旧的角色动画系统
            const animationData = this.characterAnimation.updateAnimation(16.67);
            this.characterAnimation.renderCharacter(
                this.ctx, 
                this.player.x, 
                this.player.y, 
                this.player.radius, 
                '#4CAF50', 
                animationData
            );
        } else {
            // 回退到基础渲染
            this.player.render(this.ctx);
        }
        
        // 绘制敌人（使用新的角色视觉系统和敌人多样化系统）
        this.enemies.forEach(enemy => {
            if (this.enemyDiversitySystem && this.characterVisualSystem) {
                // 使用敌人多样化系统渲染
                this.enemyDiversitySystem.renderEnemy(this.ctx, enemy);
                
                // 渲染精灵动画
                if (enemy.animationState && enemy.animationStartTime) {
                    const frameIndex = this.characterVisualSystem.getAnimationFrame(
                        enemy.type + '_' + enemy.animationState, 
                        enemy.animationStartTime
                    );
                    this.characterVisualSystem.renderSpriteAnimation(
                        this.ctx, enemy, enemy.type + '_' + enemy.animationState, frameIndex
                    );
                }
                
                // 渲染状态指示器
                this.characterVisualSystem.renderStatusIndicators(this.ctx, enemy);
                
                // 渲染AI可视化（如果启用调试模式）
                if (this.developerConsole && this.developerConsole.debugMode) {
                    if (enemy.aiState === 'attack') {
                        this.characterVisualSystem.renderAIVisualization(
                            this.ctx, enemy, 'attack_warning', {}
                        );
                    }
                    if (enemy.detectionRange) {
                        this.characterVisualSystem.renderAIVisualization(
                            this.ctx, enemy, 'detection_range', { range: enemy.detectionRange }
                        );
                    }
                }
            } else if (this.characterAnimation) {
                // 回退到原有的角色动画系统
                this.characterAnimation.renderCharacter(
                    this.ctx, 
                    enemy.x, 
                    enemy.y, 
                    enemy.radius, 
                    enemy.color || '#FF5722', 
                    null
                );
            } else {
                // 回退到基础渲染
                enemy.render(this.ctx);
            }
        });
        
        // 绘制敌人子弹
        this.enemyBullets.forEach(bullet => {
            bullet.render(this.ctx);
        });
        
        this.bosses.forEach(boss => {
            boss.render(this.ctx);
        });
        
        this.npcs.forEach(npc => {
            npc.render(this.ctx);
        });
        
        this.bullets.forEach(bullet => {
            bullet.render(this.ctx);
        });
        
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
        
        // 渲染增强粒子效果
        if (window.enhancedParticles) {
            window.enhancedParticles.render(this.ctx);
        }
        
        // 渲染伤害数字
        if (window.damageNumbers) {
            window.damageNumbers.render(this.ctx);
        }
        
        this.powerups.forEach(powerup => {
            powerup.render(this.ctx);
        });
        
        // 渲染金币系统
        this.coinSystem.render(this.ctx);
        
        // 绘制自动瞄准线
        this.drawAutoAimLine();
        
        // 绘制武器信息
        this.drawWeaponInfo();
        
        // 绘制关卡信息
        this.drawLevelInfo();
        
        // 绘制任务目标
        this.drawMissionObjective();
        
        // 使用统一UI系统渲染所有UI组件
        this.unifiedUI.render(this.ctx);
        
        // 保留成就通知（动态显示）
        this.player.achievementSystem.renderNotifications(this.ctx, this.width, this.height);
        
        // 渲染UI改进功能
        this.uiManager.renderDebugInfo(this.ctx, this);
        this.uiManager.renderFPS(this.ctx, this.fps);
        
        // 渲染音效视觉联动效果
        if (this.audioVisualSync) {
            this.audioVisualSync.renderAudioVisualization(this.ctx, this.canvas);
        }
        
        // 应用视觉特效增强系统的后处理效果
        if (this.visualEffectsEnhanced) {
            this.visualEffectsEnhanced.applyPostProcessing(this.ctx, this.canvas);
        }
        
        // 渲染AI系统调试信息
        if (this.developerConsole && this.developerConsole.debugMode) {
            let debugY = 10;
            
            // 渲染增强AI系统调试信息
            if (this.enhancedAISystem) {
                this.enhancedAISystem.renderDebugInfo(this.ctx, 10, debugY);
                debugY += 120;
            }
            
            // 渲染智能敌人AI系统调试信息
            if (this.intelligentEnemyAI) {
                this.intelligentEnemyAI.renderDebugInfo(this.ctx, 10, debugY);
                debugY += 120;
            }
            
            // 渲染群体行为系统调试信息
            if (this.groupBehaviorSystem) {
                this.groupBehaviorSystem.renderDebugInfo(this.ctx, 10, debugY);
                debugY += 120;
            }
            
            // 渲染动态难度系统调试信息
            if (this.dynamicDifficultySystem) {
                this.dynamicDifficultySystem.renderDebugInfo(this.ctx, 10, debugY);
                debugY += 120;
            }
            
            // 渲染学习型AI系统调试信息
            if (this.learningAISystem) {
                this.learningAISystem.renderDebugInfo(this.ctx, 10, debugY);
            }
        }
        
        // 恢复画布状态（屏幕震动效果）
        this.ctx.restore();
    }
    
    drawLevelBackground() {
        const levelConfig = CONFIG.LEVELS[this.currentLevel];
        this.ctx.fillStyle = levelConfig.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawGrid() {
        const levelConfig = CONFIG.LEVELS[this.currentLevel];
        
        // 使用环境特效系统渲染增强网格
        if (this.environmentEffects) {
            this.environmentEffects.renderEnhancedGrid(levelConfig);
            this.environmentEffects.renderBackgroundParticles();
        } else {
            // 回退到基础网格
            this.ctx.strokeStyle = levelConfig.gridColor;
            this.ctx.lineWidth = 1;
            
            for (let x = 0; x < this.width; x += 50) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.height);
                this.ctx.stroke();
            }
            
            for (let y = 0; y < this.height; y += 50) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.width, y);
                this.ctx.stroke();
            }
        }
    }
    
    drawLevelInfo() {
        const levelConfig = CONFIG.LEVELS[this.currentLevel];
        
        // 绘制关卡信息背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.width - 220, 10, 200, 60);
        
        // 绘制关卡名称
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`关卡: ${levelConfig.name}`, this.width - 210, 30);
        
        // 绘制游戏模式
        const modeConfig = CONFIG.GAME_MODES[this.gameMode];
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`模式: ${modeConfig.name}`, this.width - 210, 50);
    }
    
    drawMissionObjective() {
        const modeConfig = CONFIG.GAME_MODES[this.gameMode];
        
        // 绘制任务目标背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.width - 220, 80, 200, 80);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('任务目标:', this.width - 210, 100);
        
        let progressText = '';
        
        switch (this.gameMode) {
            case 'SURVIVAL':
                const elapsedTime = Math.floor((Date.now() - this.levelStartTime) / 1000);
                const remainingTime = Math.max(0, modeConfig.targetTime - elapsedTime);
                progressText = `生存时间: ${remainingTime}s`;
                break;
                
            case 'ELIMINATION':
                const remaining = Math.max(0, modeConfig.targetKills - this.killCount);
                progressText = `剩余击杀: ${remaining}`;
                break;
                
            case 'ESCORT':
                if (this.npcs.length > 0) {
                    const npc = this.npcs[0];
                    const progress = Math.floor(npc.getProgress() * 100);
                    progressText = `护送进度: ${progress}%`;
                } else {
                    progressText = 'NPC已死亡';
                }
                break;
        }
        
        this.ctx.fillText(progressText, this.width - 210, 120);
        
        // Boss血量条
        if (this.bosses.length > 0) {
            const boss = this.bosses[0];
            this.ctx.fillText('Boss血量:', this.width - 210, 140);
            
            const barWidth = 180;
            const barHeight = 8;
            const healthPercent = boss.health / boss.maxHealth;
            
            // 背景条
            this.ctx.fillStyle = '#ff4757';
            this.ctx.fillRect(this.width - 210, 145, barWidth, barHeight);
            
            // 血量条
            this.ctx.fillStyle = '#2ed573';
            this.ctx.fillRect(this.width - 210, 145, barWidth * healthPercent, barHeight);
        }
    }
    
    findNearestEnemy() {
        let nearest = null;
        let minDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        });
        
        return nearest;
    }
    
    drawAutoAimLine() {
        if (!this.gameRunning || this.enemies.length === 0) return;
        
        const nearestEnemy = this.findNearestEnemy();
        if (!nearestEnemy) return;
        
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x, this.player.y);
        this.ctx.lineTo(nearestEnemy.x, nearestEnemy.y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // 绘制目标标记
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(nearestEnemy.x, nearestEnemy.y, nearestEnemy.radius + 5, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawWeaponInfo() {
        const weaponConfig = CONFIG.WEAPONS[this.currentWeapon];
        
        // 绘制武器列表
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, this.height - 120, 200, 100);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('武器 (1-4切换):', 20, this.height - 100);
        
        for (let i = 0; i < this.availableWeapons.length; i++) {
            const weapon = this.availableWeapons[i];
            const config = CONFIG.WEAPONS[weapon];
            const isActive = weapon === this.currentWeapon;
            
            this.ctx.fillStyle = isActive ? '#feca57' : '#ffffff';
            this.ctx.fillText(`${i + 1}. ${config.name}`, 20, this.height - 80 + i * 15);
        }
    }
    
    renderAdvancedSystemsUI() {
        // 绘制控制提示
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 300, 120);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('技能快捷键:', 20, 30);
        this.ctx.fillText('Q - 冲刺  E - 护盾  R - 时间减缓  T - 无敌', 20, 45);
        this.ctx.fillText('面板切换:', 20, 65);
        this.ctx.fillText('K - 技能面板  J - 成就面板  L - 统计面板', 20, 80);
        this.ctx.fillText('技能升级:', 20, 100);
        this.ctx.fillText('Shift + 1-8 升级对应技能', 20, 115);
        
        // 显示技能点数
        this.ctx.fillStyle = '#feca57';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`技能点数: ${this.player.skillSystem.skillPoints}`, this.width - 150, 30);
        
        // 显示波次信息
        this.waveSystem.renderWaveInfo(this.ctx, this.width - 250, 50);
        
        // 显示波次目标（在右下角）
        this.waveSystem.renderWaveGoals(this.ctx, this.width - 300, this.height - 150);
    }
    
    renderSkillPanel() {
        // 绘制技能面板背景
        const panelWidth = 600;
        const panelHeight = 400;
        const panelX = (this.width - panelWidth) / 2;
        const panelY = (this.height - panelHeight) / 2;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        this.ctx.strokeStyle = '#feca57';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // 标题
        this.ctx.fillStyle = '#feca57';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('技能系统 (按K关闭)', panelX + 20, panelY + 30);
        
        // 技能点数
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`可用技能点数: ${this.player.skillSystem.skillPoints}`, panelX + 20, panelY + 60);
        
        // 绘制技能列表
        const skills = this.player.skillSystem.passiveSkills || {};
        const skillNames = Object.keys(skills);
        let yOffset = 90;
        
        skillNames.forEach((skillName, index) => {
            const skill = skills[skillName];
            const x = panelX + 20 + (index % 2) * 280;
            const y = panelY + yOffset + Math.floor(index / 2) * 60;
            
            // 技能名称和等级
            this.ctx.fillStyle = skill.level > 0 ? '#2ed573' : '#95a5a6';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`${skill.name} (Lv.${skill.level}/${skill.maxLevel})`, x, y);
            
            // 技能描述
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(skill.description, x, y + 15);
            
            // 升级提示
            if (skill.level < skill.maxLevel) {
                this.ctx.fillStyle = '#feca57';
                this.ctx.fillText(`Shift+${index + 1} 升级 (消耗: ${skill.cost}点)`, x, y + 30);
            }
        });
    }
    
    gameLoop(currentTime = 0) {
        const frameStartTime = performance.now();
        
        this.calculateFPS(currentTime);
        
        // 计算deltaTime
        const deltaTime = this.lastFrameTime ? currentTime - this.lastFrameTime : 16.67;
        
        this.update();
        
        // 更新视觉特效增强系统
        if (this.visualEffectsEnhanced) {
            this.visualEffectsEnhanced.update(deltaTime);
        }
        
        // 更新环境美术系统
        if (this.environmentArt) {
            this.environmentArt.update(deltaTime);
        }
        
        // 更新角色动画系统
        if (this.characterAnimation) {
            this.characterAnimation.updateAnimation(deltaTime);
        }
        
        // 更新音效视觉联动系统
        if (this.audioVisualSync) {
            this.audioVisualSync.update(deltaTime);
        }
        
        this.render();
        
        // 性能监控和优化
        const frameTime = performance.now() - frameStartTime;
        this.performanceOptimizer.updateMetrics(frameTime);
        
        // 每60帧进行一次性能调整
        if (this.frameCount % 60 === 0) {
            this.performanceOptimizer.adjustQuality(this);
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.PLAYER.RADIUS;
        this.speed = CONFIG.PLAYER.SPEED;
        this.baseSpeed = CONFIG.PLAYER.SPEED;
        this.health = CONFIG.PLAYER.HEALTH;
        this.maxHealth = CONFIG.PLAYER.HEALTH;
        this.shootCooldown = 0;
        this.invulnerable = 0; // 无敌时间
        this.isInvincible = false; // 技能无敌状态
        
        // 金币系统
        this.coins = 0;
        this.baseAttackPower = 1; // 基础攻击力
        
        // 状态效果
        this.speedBoost = { active: false, multiplier: 1, duration: 0 };
        this.shield = { active: false, duration: 0 };
        
        // 集成高级系统
        this.skillSystem = new SkillSystem(this);
        this.achievementSystem = new AchievementSystem();
        this.statisticsSystem = new StatisticsSystem();
        
        // 开始新的统计会话
        this.statisticsSystem.startNewSession();
        
        // 设置初始最大生命值
        this.updateMaxHealth();
    }
    
    update(keys, canvasWidth, canvasHeight, deltaTime = 16.67) {
        // 更新技能系统（可能影响时间流逝）
        const adjustedDeltaTime = this.skillSystem.update(deltaTime);
        
        // 应用技能系统的速度加成
        const currentSpeed = this.baseSpeed * this.skillSystem.getSpeedMultiplier();
        if (this.speedBoost.active) {
            this.speed = currentSpeed * this.speedBoost.multiplier;
        } else {
            this.speed = currentSpeed;
        }
        
        // 移动
        let moveX = 0, moveY = 0;
        if (keys['w'] || keys['arrowup']) moveY -= this.speed;
        if (keys['s'] || keys['arrowdown']) moveY += this.speed;
        if (keys['a'] || keys['arrowleft']) moveX -= this.speed;
        if (keys['d'] || keys['arrowright']) moveX += this.speed;
        
        // 对角线移动速度修正
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707; // 1/√2
            moveY *= 0.707;
        }
        
        // 触发移动或待机动画
        if (window.game && window.game.characterAnimation) {
            if (moveX !== 0 || moveY !== 0) {
                // 正在移动
                if (window.game.characterAnimation.getCurrentState() !== 'move') {
                    window.game.characterAnimation.changeState('move', 'player');
                }
            } else {
                // 静止状态
                if (window.game.characterAnimation.getCurrentState() !== 'idle') {
                    window.game.characterAnimation.changeState('idle', 'player');
                }
            }
        }
        
        this.x += moveX;
        this.y += moveY;
        
        // 更新统计系统的位置追踪
        this.statisticsSystem.updatePlayerPosition(this.x, this.y);
        
        // 边界检测
        this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
        
        // 应用技能系统的射击速度加成
        const fireRateMultiplier = this.skillSystem.getFireRateMultiplier();
        const baseCooldown = 10;
        const adjustedCooldown = Math.max(1, Math.round(baseCooldown / fireRateMultiplier));
        
        // 更新射击冷却和无敌时间
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.invulnerable > 0) this.invulnerable--;
        
        // 更新状态效果
        this.updateStatusEffects();
        
        // 更新成就系统的生存时间
        this.achievementSystem.updateSurvivalTime(adjustedDeltaTime, this.health, this.maxHealth);
        
        // 更新统计系统的生存时间
        // 注意：这里不需要调用特定方法，因为统计系统会在游戏结束时计算总时间
    }
    
    // 更新最大生命值（基于技能）
    updateMaxHealth() {
        this.maxHealth = this.skillSystem.getMaxHealth();
        // 如果当前生命值超过新的最大值，调整当前生命值
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }
    
    shoot(targetX, targetY, bullets, game) {
        if (this.shootCooldown > 0) return;
        
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const angle = Math.atan2(dy, dx);
        
        // 应用技能系统的射击速度加成
        const fireRateMultiplier = this.skillSystem.getFireRateMultiplier();
        const baseCooldown = 10;
        const adjustedCooldown = Math.max(1, Math.round(baseCooldown / fireRateMultiplier));
        
        // 创建子弹并应用伤害加成
        const bullet = new Bullet(this.x, this.y, angle);
        bullet.damage *= this.skillSystem.getDamageMultiplier();
        bullets.push(bullet);
        
        this.shootCooldown = adjustedCooldown;
        
        // 记录射击统计
        this.statisticsSystem.recordShot();
        
        // 检查多重射击技能
        if (this.skillSystem.hasSkill('multiShot') && this.skillSystem.skills.multiShot.level > 0) {
            const extraBullets = this.skillSystem.skills.multiShot.level;
            const angleSpread = 0.3; // 弧度
            
            for (let i = 1; i <= extraBullets; i++) {
                const offsetAngle = angle + (i % 2 === 1 ? angleSpread : -angleSpread) * Math.ceil(i / 2);
                const extraBullet = new Bullet(this.x, this.y, offsetAngle);
                extraBullet.damage *= this.skillSystem.getDamageMultiplier();
                bullets.push(extraBullet);
                this.statisticsSystem.recordShot();
            }
        }
        
        if (game) {
            game.playSound('shoot');
            // 添加枪口闪光效果
            if (game.visualEffectsEnhanced) {
                game.visualEffectsEnhanced.addMuzzleFlash(this.x, this.y, angle, game.currentWeapon);
            }
            // 触发射击动画
            if (game.characterAnimation) {
                game.characterAnimation.playAnimation('player_shoot');
            }
        }
    }
    
    autoShoot(targetX, targetY, bullets, game) {
        if (this.shootCooldown > 0) return;
        
        const weaponConfig = CONFIG.WEAPONS[game.currentWeapon];
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const baseAngle = Math.atan2(dy, dx);
        
        // 根据武器类型发射子弹
        for (let i = 0; i < weaponConfig.bulletCount; i++) {
            let angle = baseAngle;
            
            // 散弹枪的散射效果
            if (weaponConfig.spread > 0) {
                const spreadRange = weaponConfig.spread;
                angle += (Math.random() - 0.5) * spreadRange;
            }
            
            const bullet = new Bullet(this.x, this.y, angle, game.currentWeapon);
            bullets.push(bullet);
        }
        
        this.shootCooldown = weaponConfig.cooldown;
        
        if (game) {
            game.playSound('shoot');
            // 添加枪口闪光效果
            if (game.visualEffectsEnhanced) {
                game.visualEffectsEnhanced.addMuzzleFlash(this.x, this.y, baseAngle, game.currentWeapon);
            }
            // 触发射击动画
            if (game.characterAnimation) {
                game.characterAnimation.playAnimation('player_shoot');
            }
        }
    }
    
    takeDamage(damage) {
        if (this.invulnerable > 0 || this.shield.active || this.isInvincible) return false;
        
        // 应用技能系统的防御加成
        const actualDamage = Math.max(1, damage * this.skillSystem.getDamageReduction());
        
        this.health -= actualDamage;
        this.invulnerable = 60; // 1秒无敌时间
        
        // 添加受伤视觉特效
        if (window.game && window.game.visualEffectsEnhanced) {
            // 屏幕震动
            window.game.visualEffectsEnhanced.addScreenShake(actualDamage * 2, 200);
            // 红色伤害滤镜
            window.game.visualEffectsEnhanced.addColorFilter('damage', 300);
        }
        
        // 触发受伤动画
        if (window.game && window.game.characterAnimation) {
            window.game.characterAnimation.playAnimation('player_hurt');
        }
        
        // 记录伤害统计
        this.statisticsSystem.recordDamageTaken(actualDamage);
        
        // 记录成就系统事件
        this.achievementSystem.recordEvent('damageTaken', actualDamage);
        
        // 检查是否死亡
        if (this.health <= 0) {
            this.achievementSystem.recordEvent('death');
            this.statisticsSystem.recordDeath();
        }
        
        return true;
    }
    
    updateStatusEffects() {
        // 更新速度提升
        if (this.speedBoost.active) {
            this.speedBoost.duration--;
            if (this.speedBoost.duration <= 0) {
                this.speedBoost.active = false;
                this.speed = this.baseSpeed;
            }
        }
        
        // 更新护盾
        if (this.shield.active) {
            this.shield.duration--;
            if (this.shield.duration <= 0) {
                this.shield.active = false;
            }
        }
    }
    
    applySpeedBoost(multiplier, duration) {
        this.speedBoost = { active: true, multiplier, duration };
        this.speed = this.baseSpeed * multiplier;
    }
    
    applyShield(duration) {
        this.shield = { active: true, duration };
    }
    
    render(ctx) {
        // 无敌时闪烁效果
        const alpha = (this.invulnerable > 0 && Math.floor(this.invulnerable / 5) % 2) || this.isInvincible ? 0.5 : 1.0;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 绘制技能效果
        this.skillSystem.renderEffects(ctx, this.x, this.y, this.radius);
        
        // 绘制护盾效果
        if (this.shield.active) {
            ctx.strokeStyle = '#7bed9f';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // 绘制玩家
        let playerColor = '#4ecdc4';
        if (this.speedBoost.active) {
            playerColor = '#3742fa'; // 速度提升时变蓝
        }
        if (this.isInvincible) {
            playerColor = '#ffd700'; // 无敌时变金色
        }
        
        ctx.fillStyle = playerColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制玩家边框
        ctx.strokeStyle = '#45b7aa';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制方向指示器
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y - this.radius + 5);
        ctx.stroke();
        
        ctx.restore();
        
        // 绘制生命值条
        const barWidth = 30;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        // 背景条
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth, barHeight);
        
        // 生命值条
        ctx.fillStyle = healthPercent > 0.3 ? '#2ed573' : '#ff6b6b';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth * healthPercent, barHeight);
        
        // 生命值条边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth, barHeight);
    }
}

class Enemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.ENEMY.RADIUS;
        this.speed = CONFIG.ENEMY.SPEED;
        this.health = 1;
        this.type = type;
        this.angle = 0;
        this.animationFrame = 0;
        
        // 根据类型调整属性
        if (type === 'fast') {
            this.speed *= 1.5;
            this.radius *= 0.8;
        } else if (type === 'tank') {
            this.speed *= 0.7;
            this.radius *= 1.3;
            this.health = 2;
        }
    }
    
    update(playerX, playerY, obstacles = []) {
        // 向玩家移动
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let moveX = 0;
        let moveY = 0;
        
        if (distance > 0) {
            moveX = (dx / distance) * this.speed;
            moveY = (dy / distance) * this.speed;
        }
        
        // 避开障碍物
        obstacles.forEach(obstacle => {
            if (obstacle.destroyed) return;
            
            const obstacleDistance = this.getDistanceToObstacle(obstacle);
            if (obstacleDistance < this.radius + 10) {
                // 计算避开方向
                const avoidX = this.x - (obstacle.x + obstacle.width / 2);
                const avoidY = this.y - (obstacle.y + obstacle.height / 2);
                const avoidDistance = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
                
                if (avoidDistance > 0) {
                    moveX += (avoidX / avoidDistance) * this.speed * 0.5;
                    moveY += (avoidY / avoidDistance) * this.speed * 0.5;
                }
            }
        });
        
        this.x += moveX;
        this.y += moveY;
        this.angle = Math.atan2(moveY, moveX);
        
        this.animationFrame++;
    }
    
    getDistanceToObstacle(obstacle) {
        // 计算圆形到矩形的最短距离
        const closestX = Math.max(obstacle.x, Math.min(this.x, obstacle.x + obstacle.width));
        const closestY = Math.max(obstacle.y, Math.min(this.y, obstacle.y + obstacle.height));
        
        const dx = this.x - closestX;
        const dy = this.y - closestY;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // 根据类型绘制不同颜色
        let fillColor = '#ff6b6b';
        let strokeColor = '#ee5a52';
        
        if (this.type === 'fast') {
            fillColor = '#ff9f43';
            strokeColor = '#ff7675';
        } else if (this.type === 'tank') {
            fillColor = '#6c5ce7';
            strokeColor = '#5f3dc4';
        }
        
        // 绘制敌人主体
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制敌人边框
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制方向指示器
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.radius - 3, 0);
        ctx.stroke();
        
        // 绘制眼睛（带动画效果）
        const eyeOffset = Math.sin(this.animationFrame * 0.1) * 0.5;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -3 + eyeOffset, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -3 + eyeOffset, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // 绘制生命值（如果大于1）
        if (this.health > 1) {
            const barWidth = this.radius * 1.5;
            const barHeight = 3;
            
            ctx.fillStyle = '#ff4757';
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth, barHeight);
            
            ctx.fillStyle = '#2ed573';
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth * (this.health / 2), barHeight);
        }
    }
}

class Bullet {
    constructor(x, y, angle, weaponType = 'PISTOL') {
        this.x = x;
        this.y = y;
        this.weaponType = weaponType;
        const weaponConfig = CONFIG.WEAPONS[weaponType];
        
        this.radius = CONFIG.BULLET.RADIUS;
        this.speed = weaponConfig.bulletSpeed;
        this.damage = weaponConfig.damage;
        this.color = weaponConfig.color;
        this.explosive = weaponConfig.explosive || false;
        this.explosionRadius = weaponConfig.explosionRadius || 0;
        
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.trail = [];
        this.life = 0;
        
        // 创建武器特效
        if (window.weaponEffects) {
            window.weaponEffects.createMuzzleFlash(x, y, angle, weaponType);
        }
    }
    
    update() {
        // 保存轨迹
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) {
            this.trail.shift();
        }
        
        // 创建轨迹特效
        if (window.weaponEffects && this.life % 2 === 0) {
            window.weaponEffects.createTrail(this.x, this.y, this.weaponType);
        }
        
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
    }
    
    render(ctx) {
        // 绘制轨迹
        if (this.trail.length > 1) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            
            for (let i = 0; i < this.trail.length - 1; i++) {
                const alpha = (i + 1) / this.trail.length * 0.5;
                ctx.globalAlpha = alpha;
                
                ctx.beginPath();
                ctx.moveTo(this.trail[i].x, this.trail[i].y);
                ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
                ctx.stroke();
            }
            
            ctx.globalAlpha = 1;
        }
        
        // 绘制子弹主体
        const glowIntensity = Math.sin(this.life * 0.3) * 0.3 + 0.7;
        
        // 外发光
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8 * glowIntensity;
        
        // 火箭弹特殊效果
        if (this.weaponType === 'ROCKET') {
            ctx.shadowBlur = 15 * glowIntensity;
            // 绘制火箭尾焰
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(this.x - this.vx * 0.3, this.y - this.vy * 0.3, this.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 内核
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, angle, speed, color = '#ff6b6b') {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = Math.random() * 20 + 20;
        this.maxLife = this.life;
        this.size = Math.random() * 4 + 2;
        this.color = color;
        this.gravity = 0.1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.vy += this.gravity;
        this.life--;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        const size = this.size * alpha;
        
        // 解析颜色
        let r, g, b;
        if (this.color === '#ff6b6b') {
            r = 255; g = 107; b = 107;
        } else if (this.color === '#4ecdc4') {
            r = 78; g = 205; b = 196;
        } else {
            r = 255; g = 255; b = 255;
        }
        
        // 外发光
        ctx.shadowColor = this.color;
        ctx.shadowBlur = size * 2;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 15;
        this.life = 600; // 10秒生命周期
        this.maxLife = this.life;
        this.animationFrame = 0;
        this.config = CONFIG.POWERUPS[type];
    }
    
    update() {
        this.life--;
        this.animationFrame++;
        
        // 轻微的浮动效果
        this.y += Math.sin(this.animationFrame * 0.1) * 0.2;
    }
    
    render(ctx) {
        const alpha = this.life < 120 ? (this.life % 20 < 10 ? 0.5 : 1) : 1; // 即将消失时闪烁
        const scale = 1 + Math.sin(this.animationFrame * 0.15) * 0.1; // 脉动效果
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);
        
        // 外发光
        ctx.shadowColor = this.config.color;
        ctx.shadowBlur = 15;
        
        // 绘制道具主体
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制图标
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let icon = '?';
        switch (this.type) {
            case 'HEALTH': icon = '+'; break;
            case 'WEAPON': icon = '⚡'; break;
            case 'SPEED': icon = '→'; break;
            case 'SHIELD': icon = '🛡'; break;
        }
        
        ctx.fillText(icon, 0, 0);
        
        // 绘制边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new Game();
});