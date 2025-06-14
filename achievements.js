// 成就系统 - Achievement System
// 管理游戏成就的解锁、进度追踪和奖励发放

class AchievementSystem {
    constructor() {
        // 成就定义
        this.achievements = {
            // 击杀类成就
            newbieKiller: {
                id: 'newbieKiller',
                name: '新手杀手',
                description: '击杀10个敌人',
                type: 'kill',
                target: 10,
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 1 },
                icon: '🎯'
            },
            killingMachine: {
                id: 'killingMachine',
                name: '杀戮机器',
                description: '击杀100个敌人',
                type: 'kill',
                target: 100,
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 3 },
                icon: '⚔️'
            },
            legendaryWarrior: {
                id: 'legendaryWarrior',
                name: '传奇战士',
                description: '击杀1000个敌人',
                type: 'kill',
                target: 1000,
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 10 },
                icon: '👑'
            },
            bossTerminator: {
                id: 'bossTerminator',
                name: 'Boss终结者',
                description: '击败5个Boss',
                type: 'boss_kill',
                target: 5,
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 5 },
                icon: '💀'
            },
            perfectShooter: {
                id: 'perfectShooter',
                name: '完美射手',
                description: '连续击杀50个敌人不死亡',
                type: 'kill_streak',
                target: 50,
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 3 },
                icon: '🎯'
            },
            
            // 生存类成就
            survivalExpert: {
                id: 'survivalExpert',
                name: '生存专家',
                description: '生存5分钟',
                type: 'survival_time',
                target: 300000, // 5分钟 = 300000毫秒
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 2 },
                icon: '⏱️'
            },
            persistentWarrior: {
                id: 'persistentWarrior',
                name: '持久战士',
                description: '生存15分钟',
                type: 'survival_time',
                target: 900000, // 15分钟
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 5 },
                icon: '🛡️'
            },
            immortalLegend: {
                id: 'immortalLegend',
                name: '不朽传说',
                description: '生存30分钟',
                type: 'survival_time',
                target: 1800000, // 30分钟
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 10 },
                icon: '🌟'
            },
            ironWill: {
                id: 'ironWill',
                name: '钢铁意志',
                description: '在生命值低于20%时生存2分钟',
                type: 'low_health_survival',
                target: 120000, // 2分钟
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 3 },
                icon: '💪'
            },
            
            // 特殊条件成就
            skillMaster: {
                id: 'skillMaster',
                name: '技能大师',
                description: '使用所有主动技能各10次',
                type: 'skill_usage',
                target: 40, // 4个技能 × 10次
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 5 },
                icon: '🔮'
            },
            escortExpert: {
                id: 'escortExpert',
                name: '护送专家',
                description: '完成5次护送任务',
                type: 'escort_missions',
                target: 5,
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 3 },
                icon: '🚚'
            },
            obstacleClearer: {
                id: 'obstacleClearer',
                name: '障碍清除者',
                description: '摧毁100个可破坏障碍物',
                type: 'obstacles_destroyed',
                target: 100,
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 2 },
                icon: '💥'
            },
            collector: {
                id: 'collector',
                name: '收集狂',
                description: '拾取100个道具',
                type: 'powerups_collected',
                target: 100,
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 2 },
                icon: '📦'
            },
            perfectLevel: {
                id: 'perfectLevel',
                name: '完美关卡',
                description: '在一个关卡中不受伤害',
                type: 'no_damage_level',
                target: 1,
                progress: 0,
                unlocked: false,
                reward: { skillPoints: 5 },
                icon: '✨'
            }
        };
        
        // 成就通知队列
        this.notificationQueue = [];
        
        // 当前击杀连击数
        this.currentKillStreak = 0;
        
        // 低血量生存计时器
        this.lowHealthSurvivalTime = 0;
        this.isLowHealth = false;
        
        // 技能使用计数
        this.skillUsageCount = {
            timeSlowdown: 0,
            areaExplosion: 0,
            invincibility: 0,
            heal: 0
        };
        
        // 关卡开始时的生命值（用于完美关卡成就）
        this.levelStartHealth = 0;
        this.levelDamageTaken = false;
        
        // 加载已保存的成就数据
        this.loadAchievements();
    }
    
    // 更新成就进度
    updateProgress(type, value = 1) {
        Object.values(this.achievements).forEach(achievement => {
            if (achievement.type === type && !achievement.unlocked) {
                achievement.progress += value;
                
                // 检查是否达成成就
                if (achievement.progress >= achievement.target) {
                    this.unlockAchievement(achievement.id);
                }
            }
        });
    }
    
    // 解锁成就
    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        
        if (!achievement || achievement.unlocked) {
            return;
        }
        
        achievement.unlocked = true;
        achievement.progress = achievement.target;
        
        // 添加到通知队列
        this.notificationQueue.push({
            achievement: achievement,
            timestamp: Date.now()
        });
        
        // 发放奖励
        this.giveReward(achievement.reward);
        
        // 保存成就数据
        this.saveAchievements();
        
        console.log(`成就解锁: ${achievement.name}`);
    }
    
    // 发放奖励
    giveReward(reward) {
        if (reward.skillPoints && window.game && window.game.player && window.game.player.skillSystem) {
            window.game.player.skillSystem.addSkillPoints(reward.skillPoints);
        }
    }
    
    // 记录敌人击杀
    recordEnemyKill() {
        this.updateProgress('kill', 1);
        this.currentKillStreak++;
        
        // 更新击杀连击成就
        const perfectShooter = this.achievements.perfectShooter;
        if (!perfectShooter.unlocked) {
            perfectShooter.progress = Math.max(perfectShooter.progress, this.currentKillStreak);
            if (perfectShooter.progress >= perfectShooter.target) {
                this.unlockAchievement('perfectShooter');
            }
        }
    }
    
    // 记录Boss击杀
    recordBossKill() {
        this.updateProgress('boss_kill', 1);
        this.recordEnemyKill(); // Boss也算普通击杀
    }
    
    // 记录玩家死亡（重置击杀连击）
    recordPlayerDeath() {
        this.currentKillStreak = 0;
    }
    
    // 记录玩家受伤
    recordPlayerDamage() {
        this.currentKillStreak = 0;
        this.levelDamageTaken = true;
    }
    
    // 记录护送任务完成
    recordEscortMissionComplete() {
        this.updateProgress('escort_missions', 1);
    }
    
    // 记录障碍物摧毁
    recordObstacleDestroyed() {
        this.updateProgress('obstacles_destroyed', 1);
    }
    
    // 记录道具拾取
    recordPowerupCollected() {
        this.updateProgress('powerups_collected', 1);
    }
    
    // 记录事件（通用方法）
    recordEvent(eventType, data) {
        switch(eventType) {
            case 'kill':
                this.recordEnemyKill();
                break;
            case 'bossKill':
                this.recordBossKill();
                break;
            case 'damageTaken':
                this.recordPlayerDamage();
                break;
            case 'death':
                this.recordPlayerDeath();
                break;
            case 'escortComplete':
                this.recordEscortMissionComplete();
                break;
            case 'obstacleDestroyed':
                this.recordObstacleDestroyed();
                break;
            case 'powerupCollected':
                this.recordPowerupCollected();
                break;
            case 'skillUsed':
                this.recordSkillUsage(data);
                break;
        }
    }
    
    // 记录技能使用
    recordSkillUsage(skillName) {
        if (this.skillUsageCount.hasOwnProperty(skillName)) {
            this.skillUsageCount[skillName]++;
            
            // 计算总技能使用次数
            const totalUsage = Object.values(this.skillUsageCount).reduce((sum, count) => sum + count, 0);
            const skillMaster = this.achievements.skillMaster;
            if (!skillMaster.unlocked) {
                skillMaster.progress = totalUsage;
                if (skillMaster.progress >= skillMaster.target) {
                    this.unlockAchievement('skillMaster');
                }
            }
        }
    }
    
    // 开始新关卡
    startNewLevel(playerHealth) {
        this.levelStartHealth = playerHealth;
        this.levelDamageTaken = false;
    }
    
    // 完成关卡
    completeLevel() {
        if (!this.levelDamageTaken && !this.achievements.perfectLevel.unlocked) {
            this.unlockAchievement('perfectLevel');
        }
    }
    
    // 更新生存时间和低血量生存
    updateSurvivalTime(deltaTime, playerHealth, maxHealth) {
        // 更新生存时间成就
        Object.values(this.achievements).forEach(achievement => {
            if (achievement.type === 'survival_time' && !achievement.unlocked) {
                achievement.progress += deltaTime;
                if (achievement.progress >= achievement.target) {
                    this.unlockAchievement(achievement.id);
                }
            }
        });
        
        // 更新低血量生存成就
        const healthPercentage = playerHealth / maxHealth;
        if (healthPercentage <= 0.2) {
            if (!this.isLowHealth) {
                this.isLowHealth = true;
                this.lowHealthSurvivalTime = 0;
            }
            this.lowHealthSurvivalTime += deltaTime;
            
            const ironWill = this.achievements.ironWill;
            if (!ironWill.unlocked) {
                ironWill.progress = Math.max(ironWill.progress, this.lowHealthSurvivalTime);
                if (ironWill.progress >= ironWill.target) {
                    this.unlockAchievement('ironWill');
                }
            }
        } else {
            this.isLowHealth = false;
        }
    }
    
    // 获取成就完成百分比
    getCompletionPercentage() {
        const totalAchievements = Object.keys(this.achievements).length;
        const unlockedAchievements = Object.values(this.achievements).filter(a => a.unlocked).length;
        return Math.round((unlockedAchievements / totalAchievements) * 100);
    }
    
    // 获取未解锁成就列表
    getUnlockedAchievements() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    }
    
    // 获取进行中的成就列表
    getInProgressAchievements() {
        return Object.values(this.achievements)
            .filter(a => !a.unlocked && a.progress > 0)
            .sort((a, b) => (b.progress / b.target) - (a.progress / a.target));
    }
    
    // 保存成就数据
    saveAchievements() {
        const saveData = {
            achievements: {},
            skillUsageCount: this.skillUsageCount,
            currentKillStreak: this.currentKillStreak
        };
        
        // 只保存必要的成就数据
        Object.keys(this.achievements).forEach(id => {
            const achievement = this.achievements[id];
            saveData.achievements[id] = {
                progress: achievement.progress,
                unlocked: achievement.unlocked
            };
        });
        
        localStorage.setItem('gameAchievements', JSON.stringify(saveData));
    }
    
    // 加载成就数据
    loadAchievements() {
        const savedData = localStorage.getItem('gameAchievements');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // 恢复成就进度
                if (data.achievements) {
                    Object.keys(data.achievements).forEach(id => {
                        if (this.achievements[id]) {
                            this.achievements[id].progress = data.achievements[id].progress || 0;
                            this.achievements[id].unlocked = data.achievements[id].unlocked || false;
                        }
                    });
                }
                
                // 恢复其他数据
                if (data.skillUsageCount) {
                    this.skillUsageCount = { ...this.skillUsageCount, ...data.skillUsageCount };
                }
                
                if (data.currentKillStreak !== undefined) {
                    this.currentKillStreak = data.currentKillStreak;
                }
            } catch (e) {
                console.error('加载成就数据失败:', e);
            }
        }
    }
    
    // 重置所有成就
    resetAchievements() {
        Object.values(this.achievements).forEach(achievement => {
            achievement.progress = 0;
            achievement.unlocked = false;
        });
        
        this.skillUsageCount = {
            timeSlowdown: 0,
            areaExplosion: 0,
            invincibility: 0,
            heal: 0
        };
        
        this.currentKillStreak = 0;
        this.notificationQueue = [];
        
        this.saveAchievements();
    }
    
    // 渲染成就通知
    renderNotifications(ctx, canvas) {
        const currentTime = Date.now();
        const notificationDuration = 3000; // 3秒
        
        // 清理过期通知
        this.notificationQueue = this.notificationQueue.filter(
            notification => currentTime - notification.timestamp < notificationDuration
        );
        
        // 渲染通知
        this.notificationQueue.forEach((notification, index) => {
            const achievement = notification.achievement;
            const age = currentTime - notification.timestamp;
            const alpha = Math.max(0, 1 - (age / notificationDuration));
            
            const x = canvas.width - 320;
            const y = 50 + index * 80;
            const width = 300;
            const height = 70;
            
            // 通知背景
            ctx.fillStyle = `rgba(0, 150, 0, ${alpha * 0.9})`;
            ctx.fillRect(x, y, width, height);
            
            // 通知边框
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            
            // 成就图标
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(achievement.icon, x + 25, y + 35);
            
            // 成就文本
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('成就解锁!', x + 50, y + 20);
            
            ctx.font = '12px Arial';
            ctx.fillText(achievement.name, x + 50, y + 35);
            ctx.fillText(achievement.description, x + 50, y + 50);
            
            // 奖励信息
            if (achievement.reward.skillPoints) {
                ctx.fillText(`+${achievement.reward.skillPoints} 技能点`, x + 50, y + 65);
            }
        });
    }
    
    // 渲染成就面板
    renderPanel(ctx, canvasWidth, canvasHeight) {
        this.renderAchievementPanel(ctx, { width: canvasWidth, height: canvasHeight });
    }
    
    // 渲染成就面板
    renderAchievementPanel(ctx, canvas) {
        const panelWidth = 400;
        const panelHeight = 500;
        const x = (canvas.width - panelWidth) / 2;
        const y = (canvas.height - panelHeight) / 2;
        
        // 面板背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, panelWidth, panelHeight);
        
        // 面板边框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, panelWidth, panelHeight);
        
        // 标题
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('成就系统', x + panelWidth/2, y + 30);
        
        // 完成度
        const completionPercentage = this.getCompletionPercentage();
        ctx.font = '14px Arial';
        ctx.fillText(`完成度: ${completionPercentage}%`, x + panelWidth/2, y + 55);
        
        // 成就列表
        const achievements = Object.values(this.achievements);
        const itemHeight = 35;
        const startY = y + 80;
        
        achievements.forEach((achievement, index) => {
            const itemY = startY + index * itemHeight;
            
            if (itemY > y + panelHeight - 50) return; // 超出面板范围
            
            // 成就背景
            ctx.fillStyle = achievement.unlocked ? 'rgba(0, 150, 0, 0.3)' : 'rgba(100, 100, 100, 0.3)';
            ctx.fillRect(x + 10, itemY, panelWidth - 20, itemHeight - 2);
            
            // 成就图标
            ctx.fillStyle = achievement.unlocked ? '#FFD700' : '#888888';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(achievement.icon, x + 20, itemY + 20);
            
            // 成就名称
            ctx.fillStyle = achievement.unlocked ? '#FFFFFF' : '#CCCCCC';
            ctx.font = achievement.unlocked ? 'bold 12px Arial' : '12px Arial';
            ctx.fillText(achievement.name, x + 50, itemY + 15);
            
            // 进度
            const progressText = achievement.unlocked ? '已完成' : `${achievement.progress}/${achievement.target}`;
            ctx.font = '10px Arial';
            ctx.fillText(progressText, x + 50, itemY + 28);
            
            // 进度条
            if (!achievement.unlocked) {
                const progressBarWidth = 100;
                const progressBarHeight = 4;
                const progressBarX = x + panelWidth - 120;
                const progressBarY = itemY + 15;
                
                // 进度条背景
                ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
                
                // 进度条填充
                const progressRatio = Math.min(achievement.progress / achievement.target, 1);
                ctx.fillStyle = '#00AA00';
                ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progressRatio, progressBarHeight);
            }
        });
    }
}

// 导出成就系统类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementSystem;
}