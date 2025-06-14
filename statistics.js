// 数据统计系统 - Statistics System
// 收集、存储和展示游戏统计数据

class StatisticsSystem {
    constructor() {
        // 游戏统计数据
        this.stats = {
            // 游戏基础统计
            totalPlayTime: 0,           // 总游戏时长（毫秒）
            totalGames: 0,              // 总游戏场次
            highestScore: 0,            // 最高分数
            longestSurvival: 0,         // 最长生存时间（毫秒）
            averageSurvival: 0,         // 平均生存时间（毫秒）
            
            // 战斗统计
            totalKills: 0,              // 总击杀数
            totalShots: 0,              // 总射击次数
            totalHits: 0,               // 总命中次数
            totalDamageDealt: 0,        // 总伤害输出
            totalDamageTaken: 0,        // 总受到伤害
            
            // 敌人击杀统计
            enemyKills: {
                basic: 0,               // 基础敌人击杀
                fast: 0,                // 快速敌人击杀
                tank: 0,                // 坦克敌人击杀
                boss: 0                 // Boss击杀
            },
            
            // 技能使用统计
            skillUsage: {
                timeSlowdown: 0,        // 时间减缓使用次数
                areaExplosion: 0,       // 范围爆炸使用次数
                invincibility: 0,       // 无敌状态使用次数
                heal: 0                 // 治疗使用次数
            },
            
            // 道具统计
            powerupsCollected: {
                health: 0,              // 生命值道具
                shield: 0,              // 护盾道具
                damage: 0,              // 伤害提升道具
                speed: 0                // 速度提升道具
            },
            
            // 关卡统计
            levelsCompleted: {
                survival: 0,            // 生存模式完成次数
                elimination: 0,         // 击杀模式完成次数
                escort: 0               // 护送模式完成次数
            },
            
            // 其他统计
            obstaclesDestroyed: 0,      // 摧毁的障碍物数量
            distanceTraveled: 0,        // 移动距离（像素）
            perfectLevels: 0,           // 完美通关次数
            maxKillStreak: 0            // 最大连击数
        };
        
        // 当前游戏会话数据
        this.currentSession = {
            startTime: 0,
            kills: 0,
            shots: 0,
            hits: 0,
            damageDealt: 0,
            damageTaken: 0,
            killStreak: 0,
            maxKillStreak: 0,
            powerupsCollected: 0,
            distanceTraveled: 0,
            lastPosition: { x: 0, y: 0 }
        };
        
        // 游戏历史记录（最近20场）
        this.gameHistory = [];
        
        // 加载保存的统计数据
        this.loadStatistics();
    }
    
    // 开始新游戏会话
    startNewSession() {
        this.currentSession = {
            startTime: Date.now(),
            kills: 0,
            shots: 0,
            hits: 0,
            damageDealt: 0,
            damageTaken: 0,
            killStreak: 0,
            maxKillStreak: 0,
            powerupsCollected: 0,
            distanceTraveled: 0,
            lastPosition: { x: 0, y: 0 }
        };
    }
    
    // 结束游戏会话
    endSession(finalScore) {
        const sessionDuration = Date.now() - this.currentSession.startTime;
        
        // 更新总体统计
        this.stats.totalPlayTime += sessionDuration;
        this.stats.totalGames++;
        this.stats.highestScore = Math.max(this.stats.highestScore, finalScore);
        this.stats.longestSurvival = Math.max(this.stats.longestSurvival, sessionDuration);
        
        // 计算平均生存时间
        this.stats.averageSurvival = this.stats.totalPlayTime / this.stats.totalGames;
        
        // 更新战斗统计
        this.stats.totalKills += this.currentSession.kills;
        this.stats.totalShots += this.currentSession.shots;
        this.stats.totalHits += this.currentSession.hits;
        this.stats.totalDamageDealt += this.currentSession.damageDealt;
        this.stats.totalDamageTaken += this.currentSession.damageTaken;
        this.stats.distanceTraveled += this.currentSession.distanceTraveled;
        this.stats.maxKillStreak = Math.max(this.stats.maxKillStreak, this.currentSession.maxKillStreak);
        
        // 添加到游戏历史
        const gameRecord = {
            date: new Date().toISOString(),
            duration: sessionDuration,
            score: finalScore,
            kills: this.currentSession.kills,
            accuracy: this.currentSession.shots > 0 ? (this.currentSession.hits / this.currentSession.shots) * 100 : 0,
            maxKillStreak: this.currentSession.maxKillStreak,
            damageDealt: this.currentSession.damageDealt,
            damageTaken: this.currentSession.damageTaken
        };
        
        this.gameHistory.unshift(gameRecord);
        
        // 只保留最近20场记录
        if (this.gameHistory.length > 20) {
            this.gameHistory = this.gameHistory.slice(0, 20);
        }
        
        // 保存统计数据
        this.saveStatistics();
    }
    
    // 记录射击
    recordShot() {
        this.currentSession.shots++;
    }
    
    // 记录命中
    recordHit(damage = 0) {
        this.currentSession.hits++;
        this.currentSession.damageDealt += damage;
    }
    
    // 记录击杀
    recordKill(enemyType = 'basic') {
        this.currentSession.kills++;
        this.currentSession.killStreak++;
        this.currentSession.maxKillStreak = Math.max(this.currentSession.maxKillStreak, this.currentSession.killStreak);
        
        // 更新敌人类型击杀统计
        if (this.stats.enemyKills.hasOwnProperty(enemyType)) {
            this.stats.enemyKills[enemyType]++;
        }
    }
    
    // 记录玩家受伤
    recordPlayerDamage(damage) {
        this.currentSession.damageTaken += damage;
        this.currentSession.killStreak = 0; // 重置连击
    }
    
    // 记录伤害输出
    recordDamageDealt(damage) {
        this.currentSession.damageDealt += damage;
    }
    
    // 记录受到伤害
    recordDamageTaken(damage) {
        this.currentSession.damageTaken += damage;
        this.currentSession.killStreak = 0; // 重置连击
    }
    
    // 记录技能使用
    recordSkillUsage(skillName) {
        if (this.stats.skillUsage.hasOwnProperty(skillName)) {
            this.stats.skillUsage[skillName]++;
        }
    }
    
    // 记录道具拾取
    recordPowerupCollected(powerupType) {
        this.currentSession.powerupsCollected++;
        
        if (this.stats.powerupsCollected.hasOwnProperty(powerupType)) {
            this.stats.powerupsCollected[powerupType]++;
        }
    }
    
    // 记录关卡完成
    recordLevelCompleted(levelType) {
        if (this.stats.levelsCompleted.hasOwnProperty(levelType)) {
            this.stats.levelsCompleted[levelType]++;
        }
    }
    
    // 记录障碍物摧毁
    recordObstacleDestroyed() {
        this.stats.obstaclesDestroyed++;
    }
    
    // 记录完美通关
    recordPerfectLevel() {
        this.stats.perfectLevels++;
    }
    
    // 更新玩家位置（计算移动距离）
    updatePlayerPosition(x, y) {
        if (this.currentSession.lastPosition.x !== 0 || this.currentSession.lastPosition.y !== 0) {
            const distance = Math.sqrt(
                Math.pow(x - this.currentSession.lastPosition.x, 2) + 
                Math.pow(y - this.currentSession.lastPosition.y, 2)
            );
            this.currentSession.distanceTraveled += distance;
        }
        
        this.currentSession.lastPosition = { x, y };
    }
    
    // 获取射击精度
    getAccuracy() {
        return this.stats.totalShots > 0 ? (this.stats.totalHits / this.stats.totalShots) * 100 : 0;
    }
    
    // 获取当前会话精度
    getCurrentSessionAccuracy() {
        return this.currentSession.shots > 0 ? (this.currentSession.hits / this.currentSession.shots) * 100 : 0;
    }
    
    // 获取平均每分钟击杀数
    getKillsPerMinute() {
        const totalMinutes = this.stats.totalPlayTime / 60000;
        return totalMinutes > 0 ? this.stats.totalKills / totalMinutes : 0;
    }
    
    // 获取格式化的游戏时长
    getFormattedPlayTime() {
        return this.formatTime(this.stats.totalPlayTime);
    }
    
    // 获取格式化的最长生存时间
    getFormattedLongestSurvival() {
        return this.formatTime(this.stats.longestSurvival);
    }
    
    // 格式化时间
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}时${minutes % 60}分${seconds % 60}秒`;
        } else if (minutes > 0) {
            return `${minutes}分${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }
    
    // 获取统计摘要
    getStatsSummary() {
        return {
            totalGames: this.stats.totalGames,
            totalPlayTime: this.getFormattedPlayTime(),
            highestScore: this.stats.highestScore,
            longestSurvival: this.getFormattedLongestSurvival(),
            totalKills: this.stats.totalKills,
            accuracy: Math.round(this.getAccuracy() * 100) / 100,
            killsPerMinute: Math.round(this.getKillsPerMinute() * 100) / 100,
            maxKillStreak: this.stats.maxKillStreak
        };
    }
    
    // 保存统计数据
    saveStatistics() {
        const saveData = {
            stats: this.stats,
            gameHistory: this.gameHistory
        };
        
        localStorage.setItem('gameStatistics', JSON.stringify(saveData));
    }
    
    // 加载统计数据
    loadStatistics() {
        const savedData = localStorage.getItem('gameStatistics');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                if (data.stats) {
                    // 合并统计数据，保留默认值
                    this.stats = { ...this.stats, ...data.stats };
                }
                
                if (data.gameHistory) {
                    this.gameHistory = data.gameHistory;
                }
            } catch (e) {
                console.error('加载统计数据失败:', e);
            }
        }
    }
    
    // 重置统计数据
    resetStatistics() {
        this.stats = {
            totalPlayTime: 0,
            totalGames: 0,
            highestScore: 0,
            longestSurvival: 0,
            averageSurvival: 0,
            totalKills: 0,
            totalShots: 0,
            totalHits: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            enemyKills: { basic: 0, fast: 0, tank: 0, boss: 0 },
            skillUsage: { timeSlowdown: 0, areaExplosion: 0, invincibility: 0, heal: 0 },
            powerupsCollected: { health: 0, shield: 0, damage: 0, speed: 0 },
            levelsCompleted: { survival: 0, elimination: 0, escort: 0 },
            obstaclesDestroyed: 0,
            distanceTraveled: 0,
            perfectLevels: 0,
            maxKillStreak: 0
        };
        
        this.gameHistory = [];
        this.saveStatistics();
    }
    
    // 导出统计数据
    exportStatistics() {
        const exportData = {
            stats: this.stats,
            gameHistory: this.gameHistory,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `game_statistics_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
    
    // 渲染统计面板
    renderPanel(ctx, canvasWidth, canvasHeight) {
        this.renderStatisticsPanel(ctx, { width: canvasWidth, height: canvasHeight });
    }
    
    // 渲染统计面板
    renderStatisticsPanel(ctx, canvas) {
        const panelWidth = 600;
        const panelHeight = 500;
        const x = (canvas.width - panelWidth) / 2;
        const y = (canvas.height - panelHeight) / 2;
        
        // 面板背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(x, y, panelWidth, panelHeight);
        
        // 面板边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, panelWidth, panelHeight);
        
        // 标题
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏统计', x + panelWidth/2, y + 35);
        
        // 统计内容
        const stats = this.getStatsSummary();
        const leftColumnX = x + 30;
        const rightColumnX = x + panelWidth/2 + 30;
        let currentY = y + 70;
        const lineHeight = 25;
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        // 左列 - 基础统计
        ctx.fillStyle = '#FFD700';
        ctx.fillText('基础统计', leftColumnX, currentY);
        currentY += lineHeight;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`游戏场次: ${stats.totalGames}`, leftColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`总游戏时长: ${stats.totalPlayTime}`, leftColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`最高分数: ${stats.highestScore}`, leftColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`最长生存: ${stats.longestSurvival}`, leftColumnX, currentY);
        currentY += lineHeight + 10;
        
        // 战斗统计
        ctx.fillStyle = '#FFD700';
        ctx.fillText('战斗统计', leftColumnX, currentY);
        currentY += lineHeight;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`总击杀数: ${stats.totalKills}`, leftColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`射击精度: ${stats.accuracy}%`, leftColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`每分钟击杀: ${stats.killsPerMinute}`, leftColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`最大连击: ${stats.maxKillStreak}`, leftColumnX, currentY);
        
        // 右列 - 敌人击杀统计
        currentY = y + 70;
        ctx.fillStyle = '#FFD700';
        ctx.fillText('敌人击杀', rightColumnX, currentY);
        currentY += lineHeight;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`基础敌人: ${this.stats.enemyKills.basic}`, rightColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`快速敌人: ${this.stats.enemyKills.fast}`, rightColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`坦克敌人: ${this.stats.enemyKills.tank}`, rightColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`Boss击杀: ${this.stats.enemyKills.boss}`, rightColumnX, currentY);
        currentY += lineHeight + 10;
        
        // 技能使用统计
        ctx.fillStyle = '#FFD700';
        ctx.fillText('技能使用', rightColumnX, currentY);
        currentY += lineHeight;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`时间减缓: ${this.stats.skillUsage.timeSlowdown}`, rightColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`范围爆炸: ${this.stats.skillUsage.areaExplosion}`, rightColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`无敌状态: ${this.stats.skillUsage.invincibility}`, rightColumnX, currentY);
        currentY += lineHeight;
        ctx.fillText(`治疗技能: ${this.stats.skillUsage.heal}`, rightColumnX, currentY);
        
        // 底部按钮区域
        const buttonY = y + panelHeight - 60;
        const buttonWidth = 120;
        const buttonHeight = 30;
        const buttonSpacing = 20;
        
        // 重置按钮
        const resetButtonX = x + 30;
        ctx.fillStyle = 'rgba(200, 50, 50, 0.8)';
        ctx.fillRect(resetButtonX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(resetButtonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('重置统计', resetButtonX + buttonWidth/2, buttonY + buttonHeight/2 + 4);
        
        // 导出按钮
        const exportButtonX = resetButtonX + buttonWidth + buttonSpacing;
        ctx.fillStyle = 'rgba(50, 150, 50, 0.8)';
        ctx.fillRect(exportButtonX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(exportButtonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('导出数据', exportButtonX + buttonWidth/2, buttonY + buttonHeight/2 + 4);
    }
    
    // 渲染实时统计HUD
    renderHUD(ctx, canvas) {
        const hudX = canvas.width - 200;
        const hudY = 10;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(hudX, hudY, 190, 120);
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(hudX, hudY, 190, 120);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        let y = hudY + 20;
        ctx.fillText(`当前击杀: ${this.currentSession.kills}`, hudX + 10, y);
        y += 15;
        ctx.fillText(`连击数: ${this.currentSession.killStreak}`, hudX + 10, y);
        y += 15;
        ctx.fillText(`精度: ${Math.round(this.getCurrentSessionAccuracy())}%`, hudX + 10, y);
        y += 15;
        ctx.fillText(`伤害输出: ${Math.round(this.currentSession.damageDealt)}`, hudX + 10, y);
        y += 15;
        ctx.fillText(`受到伤害: ${Math.round(this.currentSession.damageTaken)}`, hudX + 10, y);
        y += 15;
        
        const sessionTime = Date.now() - this.currentSession.startTime;
        ctx.fillText(`游戏时长: ${this.formatTime(sessionTime)}`, hudX + 10, y);
    }
}

// 导出统计系统类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatisticsSystem;
}