// 游戏配置
const CONFIG = {
    PLAYER: {
        SPEED: 4,
        HEALTH: 100,
        SHOOT_COOLDOWN: 15,
        RADIUS: 15
    },
    ENEMY: {
        SPEED: 1.5,
        SPAWN_INTERVAL: 120,
        MIN_SPAWN_INTERVAL: 30,
        SPAWN_ACCELERATION: 0.5,
        RADIUS: 12
    },
    BULLET: {
        SPEED: 8,
        RADIUS: 3
    },
    AUDIO: {
        ENABLED: true,
        VOLUME: 0.3
    },
    WEAPONS: {
        PISTOL: {
            name: '手枪',
            damage: 1,
            cooldown: 15,
            bulletCount: 1,
            spread: 0,
            bulletSpeed: 8,
            color: '#feca57'
        },
        SHOTGUN: {
            name: '散弹枪',
            damage: 1,
            cooldown: 30,
            bulletCount: 5,
            spread: 0.3,
            bulletSpeed: 6,
            color: '#ff6b6b'
        },
        LASER: {
            name: '激光枪',
            damage: 2,
            cooldown: 8,
            bulletCount: 1,
            spread: 0,
            bulletSpeed: 12,
            color: '#00ff00'
        },
        ROCKET: {
            name: '火箭筒',
            damage: 3,
            cooldown: 60,
            bulletCount: 1,
            spread: 0,
            bulletSpeed: 5,
            color: '#ff4757',
            explosive: true,
            explosionRadius: 50
        }
    },
    POWERUPS: {
        HEALTH: {
            name: '生命包',
            color: '#2ed573',
            effect: 'heal',
            value: 30
        },
        WEAPON: {
            name: '武器升级',
            color: '#ffa502',
            effect: 'weapon'
        },
        SPEED: {
            name: '速度提升',
            color: '#3742fa',
            effect: 'speed',
            value: 1.5,
            duration: 300
        },
        SHIELD: {
            name: '护盾',
            color: '#7bed9f',
            effect: 'shield',
            duration: 180
        }
    },
    LEVELS: {
        CITY: {
            name: '城市废墟',
            backgroundColor: '#2c3e50',
            gridColor: '#34495e',
            obstacles: [
                { x: 200, y: 150, width: 80, height: 60, type: 'building' },
                { x: 400, y: 300, width: 100, height: 80, type: 'building' },
                { x: 600, y: 100, width: 60, height: 120, type: 'building' }
            ]
        },
        FOREST: {
            name: '森林环境',
            backgroundColor: '#27ae60',
            gridColor: '#2ecc71',
            obstacles: [
                { x: 150, y: 200, width: 40, height: 40, type: 'tree' },
                { x: 350, y: 150, width: 40, height: 40, type: 'tree' },
                { x: 500, y: 350, width: 40, height: 40, type: 'tree' },
                { x: 250, y: 400, width: 40, height: 40, type: 'tree' }
            ]
        },
        FACTORY: {
            name: '工厂区域',
            backgroundColor: '#7f8c8d',
            gridColor: '#95a5a6',
            obstacles: [
                { x: 300, y: 200, width: 120, height: 40, type: 'machine' },
                { x: 150, y: 350, width: 80, height: 60, type: 'machine' },
                { x: 550, y: 150, width: 60, height: 100, type: 'machine' }
            ]
        },
        DESERT: {
            name: '沙漠地带',
            backgroundColor: '#f39c12',
            gridColor: '#e67e22',
            obstacles: [
                { x: 200, y: 250, width: 60, height: 30, type: 'rock' },
                { x: 450, y: 180, width: 80, height: 40, type: 'rock' },
                { x: 350, y: 380, width: 50, height: 25, type: 'rock' }
            ]
        }
    },
    GAME_MODES: {
        SURVIVAL: {
            name: '生存模式',
            description: '坚持指定时间',
            targetTime: 180 // 3分钟
        },
        ELIMINATION: {
            name: '歼灭模式',
            description: '击败指定数量敌人',
            targetKills: 50
        },
        ESCORT: {
            name: '护送模式',
            description: '保护NPC到达目标点',
            npcHealth: 100
        }
    },
    BOSSES: {
        TANK_BOSS: {
            name: '重装坦克',
            health: 50,
            speed: 0.8,
            radius: 30,
            color: '#8e44ad',
            abilities: ['charge', 'spawn_minions'],
            damage: 30
        },
        SPEED_BOSS: {
            name: '疾风杀手',
            health: 30,
            speed: 2.5,
            radius: 20,
            color: '#e74c3c',
            abilities: ['dash', 'clone'],
            damage: 25
        },
        FINAL_BOSS: {
            name: '终极毁灭者',
            health: 100,
            speed: 1.2,
            radius: 40,
            color: '#2c3e50',
            abilities: ['laser_beam', 'missile_rain', 'shield'],
            damage: 40
        }
    }
};

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
        
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        
        this.score = 0;
        this.gameRunning = true;
        this.wave = 1;
        this.killCount = 0;
        
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = CONFIG.ENEMY.SPAWN_INTERVAL;
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
        
        // UI面板状态
        this.showSkillPanel = false;
        this.showAchievementPanel = false;
        this.showStatisticsPanel = false;
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
                this.showSkillPanel = !this.showSkillPanel;
            } else if (e.key.toLowerCase() === 'j') {
                this.showAchievementPanel = !this.showAchievementPanel;
            } else if (e.key.toLowerCase() === 'l') {
                this.showStatisticsPanel = !this.showStatisticsPanel;
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
        // 检查是否应该生成Boss
        if (this.wave >= this.bossWave && !this.bossSpawned && this.enemies.length === 0) {
            this.spawnBoss();
            return;
        }
        
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: // 上边
                x = Math.random() * this.width;
                y = -20;
                break;
            case 1: // 右边
                x = this.width + 20;
                y = Math.random() * this.height;
                break;
            case 2: // 下边
                x = Math.random() * this.width;
                y = this.height + 20;
                break;
            case 3: // 左边
                x = -20;
                y = Math.random() * this.height;
                break;
        }
        
        // 根据波次决定敌人类型
        let enemyType = 'normal';
        const rand = Math.random();
        
        if (this.wave >= 3) {
            if (rand < 0.2) enemyType = 'fast';
            else if (rand < 0.35) enemyType = 'tank';
        } else if (this.wave >= 2) {
            if (rand < 0.15) enemyType = 'fast';
        }
        
        this.enemies.push(new Enemy(x, y, enemyType));
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
        
        // 计算deltaTime
        const currentTime = performance.now();
        const deltaTime = this.lastFrameTime ? currentTime - this.lastFrameTime : 16.67;
        this.lastFrameTime = currentTime;
        
        // 更新玩家（传递deltaTime）
        this.player.update(this.keys, this.width, this.height, deltaTime);
        
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
        
        // 生成敌人
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            // 随着时间推移，敌人生成速度加快
            if (this.enemySpawnInterval > 30) {
                this.enemySpawnInterval -= 0.5;
            }
        }
        
        // 生成道具
        this.powerupSpawnTimer++;
        if (this.powerupSpawnTimer >= this.powerupSpawnInterval) {
            this.spawnPowerup();
            this.powerupSpawnTimer = 0;
        }
        
        // 更新敌人（应用时间减缓效果）
        this.enemies.forEach(enemy => {
            if (timeMultiplier < 1.0) {
                // 时间减缓时，敌人移动速度降低
                const originalSpeed = enemy.speed;
                enemy.speed *= timeMultiplier;
                enemy.update(this.player.x, this.player.y, this.obstacles);
                enemy.speed = originalSpeed;
            } else {
                enemy.update(this.player.x, this.player.y, this.obstacles);
            }
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
                
                this.enemies.push(new Enemy(minionX, minionY, 'fast'));
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
        
        // 更新道具
        this.powerups.forEach(powerup => {
            powerup.update();
        });
        
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
                        // 移除敌人
                        this.enemies.splice(j, 1);
                        
                        // 增加分数和击杀数
                        let points = 10;
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
                const damaged = this.player.takeDamage(20);
                
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
        const particleCount = Math.random() * 6 + 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = Math.random() * 4 + 2;
            this.particles.push(new Particle(x, y, angle, speed, color));
        }
    }
    
    nextWave() {
        this.wave++;
        
        // 增加敌人生成速度
        this.enemySpawnInterval = Math.max(
            CONFIG.ENEMY.MIN_SPAWN_INTERVAL,
            this.enemySpawnInterval - CONFIG.ENEMY.SPAWN_ACCELERATION * 5
        );
        
        // 显示波次信息
        this.showWaveMessage();
    }
    
    showWaveMessage() {
        // 这里可以添加波次提示的UI效果
        console.log(`第 ${this.wave} 波开始！`);
    }
    
    cleanup() {
        // 清理超出边界的子弹
        this.bullets = this.bullets.filter(bullet => 
            bullet.x >= -10 && bullet.x <= this.width + 10 &&
            bullet.y >= -10 && bullet.y <= this.height + 10
        );
        
        // 清理死亡的粒子
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        // 清理过期的道具
        this.powerups = this.powerups.filter(powerup => powerup.life > 0);
    }
    
    updateUI() {
        document.getElementById('health').textContent = Math.max(0, this.player.health);
        document.getElementById('score').textContent = this.score;
        document.getElementById('enemyCount').textContent = this.enemies.length;
        
        // 添加波次和击杀数显示
        const waveElement = document.getElementById('wave');
        const killElement = document.getElementById('kills');
        
        if (waveElement) waveElement.textContent = this.wave;
        if (killElement) killElement.textContent = this.killCount;
        
        // 显示当前武器
        const weaponElement = document.getElementById('weapon');
        if (weaponElement) {
            const weaponConfig = CONFIG.WEAPONS[this.currentWeapon];
            weaponElement.textContent = weaponConfig.name;
        }
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
        // 清空画布并绘制关卡背景
        this.drawLevelBackground();
        
        // 绘制网格背景
        this.drawGrid();
        
        // 绘制障碍物
        this.obstacles.forEach(obstacle => {
            obstacle.render(this.ctx);
        });
        
        // 绘制游戏对象
        this.player.render(this.ctx);
        
        this.enemies.forEach(enemy => {
            enemy.render(this.ctx);
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
        
        this.powerups.forEach(powerup => {
            powerup.render(this.ctx);
        });
        
        // 绘制自动瞄准线
        this.drawAutoAimLine();
        
        // 绘制武器信息
        this.drawWeaponInfo();
        
        // 绘制关卡信息
        this.drawLevelInfo();
        
        // 绘制任务目标
        this.drawMissionObjective();
        
        // 绘制高级系统UI
        this.renderAdvancedSystemsUI();
        
        // 绘制技能系统UI
        this.player.skillSystem.renderSkillUI(this.ctx, {width: this.width, height: this.height});
        
        // 绘制成就通知
        this.player.achievementSystem.renderNotifications(this.ctx, this.width, this.height);
        
        // 绘制统计系统HUD
        this.player.statisticsSystem.renderHUD(this.ctx, this.width, this.height);
        
        // 绘制面板
        if (this.showSkillPanel) {
            this.renderSkillPanel();
        }
        if (this.showAchievementPanel) {
            this.player.achievementSystem.renderPanel(this.ctx, this.width, this.height);
        }
        if (this.showStatisticsPanel) {
            this.player.statisticsSystem.renderPanel(this.ctx, this.width, this.height);
        }
    }
    
    drawLevelBackground() {
        const levelConfig = CONFIG.LEVELS[this.currentLevel];
        this.ctx.fillStyle = levelConfig.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawGrid() {
        const levelConfig = CONFIG.LEVELS[this.currentLevel];
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
        this.calculateFPS(currentTime);
        this.update();
        this.render();
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
        
        if (game) game.playSound('shoot');
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
        
        if (game) game.playSound('shoot');
    }
    
    takeDamage(damage) {
        if (this.invulnerable > 0 || this.shield.active || this.isInvincible) return false;
        
        // 应用技能系统的防御加成
        const actualDamage = Math.max(1, damage * this.skillSystem.getDamageReduction());
        
        this.health -= actualDamage;
        this.invulnerable = 60; // 1秒无敌时间
        
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
    }
    
    update() {
        // 保存轨迹
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 5) {
            this.trail.shift();
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