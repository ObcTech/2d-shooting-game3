// 波次系统 - 关卡管理和敌人生成

class WaveSystem {
    constructor(autoStart = true) {
        this.currentWave = 1;
        this.enemiesInWave = 0;
        this.enemiesKilled = 0;
        this.waveStartTime = 0;
        this.waveDuration = 30000; // 30秒一波
        this.isWaveActive = false;
        this.waveCompleted = false;
        this.betweenWaveTime = 5000; // 波次间隔5秒
        this.lastWaveEndTime = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // 2秒生成一个敌人
        this.maxEnemiesOnScreen = 15;
        this.waveGoals = {};
        this.bossWaves = [10, 20, 30, 50]; // Boss波次
        this.autoStart = autoStart;
        
        this.initializeWaveGoals();
        
        // 自动启动第一波
        if (this.autoStart) {
            setTimeout(() => {
                this.startWave();
            }, 500); // 延迟500ms给游戏初始化时间
        }
    }
    
    initializeWaveGoals() {
        // 初始化每波的目标
        for (let wave = 1; wave <= 100; wave++) {
            this.waveGoals[wave] = {
                enemyCount: Math.min(5 + Math.floor(wave * 1.5), 30),
                timeLimit: Math.max(20000, 45000 - wave * 500), // 时间限制逐渐减少
                enemyTypes: this.getWaveEnemyTypes(wave),
                specialConditions: this.getWaveSpecialConditions(wave),
                rewards: this.getWaveRewards(wave)
            };
        }
    }
    
    getWaveEnemyTypes(wave) {
        const types = ['normal'];
        
        if (wave >= 2) types.push('fast');
        if (wave >= 4) types.push('tank');
        if (wave >= 6) types.push('ranged');
        
        // Boss波次
        if (this.bossWaves.includes(wave)) {
            types.push('simple_boss');
        }
        
        return types;
    }
    
    getWaveSpecialConditions(wave) {
        const conditions = [];
        
        // 特殊条件
        if (wave % 5 === 0) {
            conditions.push('no_damage'); // 不能受伤
        }
        
        if (wave % 7 === 0) {
            conditions.push('time_limit'); // 时间限制
        }
        
        if (wave % 3 === 0 && wave > 10) {
            conditions.push('accuracy_test'); // 精确度测试
        }
        
        return conditions;
    }
    
    getWaveRewards(wave) {
        const rewards = {
            score: wave * 100,
            experience: wave * 10
        };
        
        // 特殊奖励
        if (wave % 5 === 0) {
            rewards.skillPoint = 1;
        }
        
        if (this.bossWaves.includes(wave)) {
            rewards.score *= 3;
            rewards.experience *= 2;
            rewards.skillPoint = 2;
        }
        
        return rewards;
    }
    
    startWave() {
        console.log(`[DEBUG] startWave called - currentWave: ${this.currentWave}, isWaveActive: ${this.isWaveActive}`);
        
        if (this.isWaveActive) {
            console.log(`[DEBUG] Wave already active, returning`);
            return;
        }
        
        this.isWaveActive = true;
        this.waveCompleted = false;
        this.waveStartTime = Date.now();
        this.enemiesKilled = 0;
        this.spawnTimer = 0;
        
        const waveGoal = this.waveGoals[this.currentWave];
        this.enemiesInWave = waveGoal.enemyCount;
        this.waveDuration = waveGoal.timeLimit;
        
        console.log(`[DEBUG] Wave ${this.currentWave} started! Target: ${this.enemiesInWave} enemies, Duration: ${this.waveDuration}ms`);
        console.log(`[DEBUG] Wave goal:`, waveGoal);
    }
    
    update(deltaTime, currentEnemies, game) {
        console.log(`[DEBUG] WaveSystem.update - isWaveActive: ${this.isWaveActive}, currentWave: ${this.currentWave}`);
        
        if (!this.isWaveActive) {
            console.log(`[DEBUG] Wave not active - currentWave: ${this.currentWave}, lastWaveEndTime: ${this.lastWaveEndTime}`);
            // 检查是否可以开始下一波（仅在非第一波时检查间隔时间）
            if (this.currentWave > 1 && Date.now() - this.lastWaveEndTime > this.betweenWaveTime) {
                console.log(`[DEBUG] Starting next wave`);
                this.startWave();
            }
            return [];
        }
        
        const newEnemies = [];
        const currentTime = Date.now();
        const waveElapsed = currentTime - this.waveStartTime;
        
        console.log(`[DEBUG] Wave active - elapsed: ${waveElapsed}ms, enemies: ${currentEnemies.length}, spawnTimer: ${this.spawnTimer}`);
        
        // 检查波次完成条件
        if (this.checkWaveCompletion(currentEnemies, waveElapsed)) {
            console.log(`[DEBUG] Wave completion detected`);
            this.completeWave(game);
            return newEnemies;
        }
        
        // 生成敌人
        this.spawnTimer += deltaTime;
        console.log(`[DEBUG] Spawn check - timer: ${this.spawnTimer}, interval: ${this.spawnInterval}, enemies: ${currentEnemies.length}/${this.maxEnemiesOnScreen}`);
        
        if (this.spawnTimer >= this.spawnInterval && currentEnemies.length < this.maxEnemiesOnScreen) {
            console.log(`[DEBUG] Attempting to spawn enemy`);
            const enemy = this.spawnEnemy();
            if (enemy) {
                console.log(`[DEBUG] Enemy spawned successfully:`, enemy);
                newEnemies.push(enemy);
                this.spawnTimer = 0;
            } else {
                console.log(`[DEBUG] Enemy spawn failed`);
            }
        }
        
        console.log(`[DEBUG] Returning ${newEnemies.length} new enemies`);
        return newEnemies;
    }
    
    checkWaveCompletion(currentEnemies, waveElapsed) {
        const waveGoal = this.waveGoals[this.currentWave];
        
        // 检查是否击杀足够敌人
        if (this.enemiesKilled >= waveGoal.enemyCount && currentEnemies.length === 0) {
            return true;
        }
        
        // 检查时间限制
        if (waveElapsed >= this.waveDuration) {
            return true;
        }
        
        return false;
    }
    
    completeWave(game) {
        this.isWaveActive = false;
        this.waveCompleted = true;
        this.lastWaveEndTime = Date.now();
        
        const waveGoal = this.waveGoals[this.currentWave];
        const success = this.enemiesKilled >= waveGoal.enemyCount;
        
        if (success) {
            this.giveRewards(game, waveGoal.rewards);
            console.log(`Wave ${this.currentWave} completed successfully!`);
            this.currentWave++;
        } else {
            console.log(`Wave ${this.currentWave} failed. Retrying...`);
        }
        
        // 检查特殊条件完成情况
        this.checkSpecialConditions(game, waveGoal.specialConditions, success);
    }
    
    giveRewards(game, rewards) {
        if (game.player) {
            // 给予分数
            if (rewards.score) {
                game.score += rewards.score;
                if (game.statisticsSystem) {
                    game.statisticsSystem.addScore(rewards.score);
                }
            }
            
            // 给予经验
            if (rewards.experience && game.player.skillSystem) {
                game.player.skillSystem.gainExperience(rewards.experience);
            }
            
            // 给予技能点
            if (rewards.skillPoint && game.player.skillSystem) {
                game.player.skillSystem.addSkillPoints(rewards.skillPoint);
            }
        }
    }
    
    checkSpecialConditions(game, conditions, waveSuccess) {
        if (!waveSuccess) return;
        
        conditions.forEach(condition => {
            switch (condition) {
                case 'no_damage':
                    if (game.player && game.player.health === game.player.maxHealth) {
                        console.log('Perfect! No damage taken bonus!');
                        this.giveRewards(game, { score: 500, experience: 50 });
                    }
                    break;
                    
                case 'time_limit':
                    const timeBonus = Math.max(0, this.waveDuration - (Date.now() - this.waveStartTime));
                    if (timeBonus > 5000) {
                        console.log('Speed bonus!');
                        this.giveRewards(game, { score: Math.floor(timeBonus / 100) });
                    }
                    break;
                    
                case 'accuracy_test':
                    if (game.statisticsSystem) {
                        const accuracy = game.statisticsSystem.getAccuracy();
                        if (accuracy > 0.8) {
                            console.log('Accuracy bonus!');
                            this.giveRewards(game, { score: 300, experience: 30 });
                        }
                    }
                    break;
            }
        });
    }
    
    spawnEnemy() {
        console.log(`[DEBUG] spawnEnemy called - enemiesKilled: ${this.enemiesKilled}, target: ${this.waveGoals[this.currentWave].enemyCount}`);
        
        if (this.enemiesKilled >= this.waveGoals[this.currentWave].enemyCount) {
            console.log(`[DEBUG] Already spawned enough enemies for this wave`);
            return null; // 已经生成足够的敌人
        }
        
        const waveGoal = this.waveGoals[this.currentWave];
        const enemyTypes = waveGoal.enemyTypes;
        
        console.log(`[DEBUG] Wave goal:`, waveGoal);
        console.log(`[DEBUG] Available enemy types:`, enemyTypes);
        
        // 选择敌人类型
        let enemyType;
        if (this.bossWaves.includes(this.currentWave) && this.enemiesKilled === waveGoal.enemyCount - 1) {
            // 最后一个敌人是Boss
            enemyType = 'simple_boss';
            console.log(`[DEBUG] Spawning boss enemy`);
        } else {
            // 优先使用敌人多样化系统的随机类型选择
            if (window.enemyDiversitySystem) {
                enemyType = window.enemyDiversitySystem.getRandomEnemyType();
                console.log(`[DEBUG] Selected enemy type from diversity system: ${enemyType}`);
            } else {
                // 回退到原有逻辑
                enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                console.log(`[DEBUG] Selected enemy type from wave config: ${enemyType}`);
            }
        }
        
        // 生成位置
        const spawnPosition = this.getSpawnPosition();
        console.log(`[DEBUG] Spawn position:`, spawnPosition);
        
        // 优先使用敌人多样化系统创建敌人
        if (window.enemyDiversitySystem) {
            const enemy = window.enemyDiversitySystem.createEnemy(
                enemyType, 
                spawnPosition.x, 
                spawnPosition.y, 
                this.currentWave
            );
            console.log(`[DEBUG] Enemy created with diversity system:`, enemy);
            return enemy;
        }
        
        // 回退到敌人工厂
        console.log(`[DEBUG] EnemyFactory available:`, typeof EnemyFactory !== 'undefined');
        if (typeof EnemyFactory !== 'undefined') {
            const enemy = EnemyFactory.createEnemy(enemyType, spawnPosition.x, spawnPosition.y);
            console.log(`[DEBUG] Enemy created with factory:`, enemy);
            return enemy;
        }
        
        console.log(`[DEBUG] No enemy creation system available, returning null`);
        return null;
    }
    
    getSpawnPosition() {
        const canvas = document.getElementById('gameCanvas');
        const canvasWidth = canvas ? canvas.width : 800;
        const canvasHeight = canvas ? canvas.height : 600;
        
        const margin = 50;
        const side = Math.floor(Math.random() * 4);
        
        switch (side) {
            case 0: // 上边
                return { x: Math.random() * canvasWidth, y: -margin };
            case 1: // 右边
                return { x: canvasWidth + margin, y: Math.random() * canvasHeight };
            case 2: // 下边
                return { x: Math.random() * canvasWidth, y: canvasHeight + margin };
            case 3: // 左边
                return { x: -margin, y: Math.random() * canvasHeight };
            default:
                return { x: -margin, y: Math.random() * canvasHeight };
        }
    }
    
    onEnemyKilled(enemy) {
        this.enemiesKilled++;
        
        // 记录击杀统计
        if (typeof game !== 'undefined' && game.statisticsSystem) {
            game.statisticsSystem.recordEnemyKill(enemy.type);
        }
    }
    
    getWaveProgress() {
        if (!this.isWaveActive) {
            return {
                wave: this.currentWave,
                progress: 0,
                timeRemaining: Math.max(0, this.betweenWaveTime - (Date.now() - this.lastWaveEndTime)),
                status: 'waiting'
            };
        }
        
        const waveGoal = this.waveGoals[this.currentWave];
        const progress = this.enemiesKilled / waveGoal.enemyCount;
        const timeElapsed = Date.now() - this.waveStartTime;
        const timeRemaining = Math.max(0, this.waveDuration - timeElapsed);
        
        return {
            wave: this.currentWave,
            progress: progress,
            enemiesKilled: this.enemiesKilled,
            enemiesTotal: waveGoal.enemyCount,
            timeRemaining: timeRemaining,
            status: 'active'
        };
    }
    
    getWaveInfo(waveNumber = null) {
        const wave = waveNumber || this.currentWave;
        return this.waveGoals[wave] || null;
    }
    
    reset() {
        this.currentWave = 1;
        this.enemiesInWave = 0;
        this.enemiesKilled = 0;
        this.waveStartTime = 0;
        this.isWaveActive = false;
        this.waveCompleted = false;
        this.lastWaveEndTime = 0;
        this.spawnTimer = 0;
    }
    
    // 渲染波次信息
    renderWaveInfo(ctx, x, y) {
        const progress = this.getWaveProgress();
        
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        
        // 波次信息
        ctx.fillText(`Wave: ${progress.wave}`, x, y);
        
        if (progress.status === 'active') {
            // 进度条
            const barWidth = 200;
            const barHeight = 8;
            const barY = y + 10;
            
            // 背景
            ctx.fillStyle = '#2d3436';
            ctx.fillRect(x, barY, barWidth, barHeight);
            
            // 进度
            ctx.fillStyle = '#00b894';
            ctx.fillRect(x, barY, barWidth * progress.progress, barHeight);
            
            // 边框
            ctx.strokeStyle = '#636e72';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, barY, barWidth, barHeight);
            
            // 文字信息
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText(`${progress.enemiesKilled}/${progress.enemiesTotal}`, x, barY + 25);
            
            // 时间
            const timeSeconds = Math.ceil(progress.timeRemaining / 1000);
            ctx.fillText(`Time: ${timeSeconds}s`, x + 100, barY + 25);
        } else {
            // 等待下一波
            ctx.fillStyle = '#fdcb6e';
            ctx.font = '12px Arial';
            const waitTime = Math.ceil(progress.timeRemaining / 1000);
            ctx.fillText(`Next wave in: ${waitTime}s`, x, y + 20);
        }
        
        ctx.restore();
    }
    
    // 渲染波次目标
    renderWaveGoals(ctx, x, y) {
        const waveInfo = this.getWaveInfo();
        if (!waveInfo) return;
        
        ctx.save();
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        
        ctx.fillText('Wave Goals:', x, y);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#ddd';
        
        let offsetY = 20;
        
        // 敌人数量目标
        ctx.fillText(`• Eliminate ${waveInfo.enemyCount} enemies`, x, y + offsetY);
        offsetY += 15;
        
        // 特殊条件
        if (waveInfo.specialConditions.length > 0) {
            waveInfo.specialConditions.forEach(condition => {
                let conditionText = '';
                switch (condition) {
                    case 'no_damage':
                        conditionText = '• Bonus: Take no damage';
                        break;
                    case 'time_limit':
                        conditionText = '• Bonus: Complete quickly';
                        break;
                    case 'accuracy_test':
                        conditionText = '• Bonus: 80%+ accuracy';
                        break;
                }
                
                if (conditionText) {
                    ctx.fillStyle = '#fdcb6e';
                    ctx.fillText(conditionText, x, y + offsetY);
                    ctx.fillStyle = '#ddd';
                    offsetY += 15;
                }
            });
        }
        
        // 奖励
        ctx.fillStyle = '#00b894';
        ctx.fillText(`Rewards: ${waveInfo.rewards.score} points`, x, y + offsetY);
        if (waveInfo.rewards.skillPoint) {
            offsetY += 15;
            ctx.fillText(`+ ${waveInfo.rewards.skillPoint} skill point(s)`, x, y + offsetY);
        }
        
        ctx.restore();
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WaveSystem };
}