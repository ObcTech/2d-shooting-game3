/**
 * 动态难度调整系统
 * 根据玩家表现实时调整游戏难度，提供个性化的游戏体验
 */

class DynamicDifficultySystem {
    constructor() {
        this.playerMetrics = this.initializePlayerMetrics();
        this.difficultySettings = this.initializeDifficultySettings();
        this.adaptationRules = this.initializeAdaptationRules();
        this.performanceHistory = [];
        this.adjustmentHistory = [];
        this.currentDifficulty = 1.0; // 基础难度倍数
        this.targetDifficulty = 1.0;
        this.adjustmentRate = 0.02; // 难度调整速率
        this.evaluationInterval = 5000; // 评估间隔（毫秒）
        this.lastEvaluationTime = 0;
        this.minDifficulty = 0.3;
        this.maxDifficulty = 3.0;
        this.adaptationEnabled = true;
        this.debugMode = false;
    }

    // 初始化玩家指标
    initializePlayerMetrics() {
        return {
            // 战斗表现
            accuracy: {
                value: 0.0,
                weight: 0.25,
                target: 0.7,
                tolerance: 0.15,
                history: [],
                maxHistory: 20
            },
            survivalTime: {
                value: 0.0,
                weight: 0.2,
                target: 30000, // 30秒
                tolerance: 10000,
                history: [],
                maxHistory: 10
            },
            killRate: {
                value: 0.0,
                weight: 0.2,
                target: 2.0, // 每秒击杀数
                tolerance: 0.5,
                history: [],
                maxHistory: 15
            },
            damageReceived: {
                value: 0.0,
                weight: 0.15,
                target: 0.3, // 每秒受到伤害比例
                tolerance: 0.2,
                history: [],
                maxHistory: 15
            },
            healthManagement: {
                value: 1.0,
                weight: 0.1,
                target: 0.7, // 平均血量保持
                tolerance: 0.2,
                history: [],
                maxHistory: 20
            },
            skillUsage: {
                value: 0.0,
                weight: 0.1,
                target: 0.5, // 技能使用效率
                tolerance: 0.3,
                history: [],
                maxHistory: 15
            }
        };
    }

    // 初始化难度设置
    initializeDifficultySettings() {
        return {
            // 敌人相关
            enemySpawnRate: {
                base: 1.0,
                current: 1.0,
                min: 0.3,
                max: 2.5,
                impact: 0.8 // 对难度的影响权重
            },
            enemyHealth: {
                base: 1.0,
                current: 1.0,
                min: 0.5,
                max: 2.0,
                impact: 0.6
            },
            enemyDamage: {
                base: 1.0,
                current: 1.0,
                min: 0.4,
                max: 2.2,
                impact: 0.9
            },
            enemySpeed: {
                base: 1.0,
                current: 1.0,
                min: 0.6,
                max: 1.8,
                impact: 0.5
            },
            enemyAccuracy: {
                base: 1.0,
                current: 1.0,
                min: 0.5,
                max: 1.5,
                impact: 0.7
            },
            
            // 玩家相关
            playerDamage: {
                base: 1.0,
                current: 1.0,
                min: 0.8,
                max: 1.5,
                impact: -0.6 // 负值表示反向调整
            },
            playerSpeed: {
                base: 1.0,
                current: 1.0,
                min: 0.9,
                max: 1.3,
                impact: -0.4
            },
            
            // 环境相关
            powerupSpawnRate: {
                base: 1.0,
                current: 1.0,
                min: 0.5,
                max: 2.0,
                impact: -0.5
            },
            waveInterval: {
                base: 1.0,
                current: 1.0,
                min: 0.7,
                max: 1.5,
                impact: 0.3
            }
        };
    }

    // 初始化适应规则
    initializeAdaptationRules() {
        return {
            // 玩家表现过好时的调整
            playerTooStrong: {
                condition: (metrics) => {
                    return metrics.accuracy.value > metrics.accuracy.target + metrics.accuracy.tolerance &&
                           metrics.killRate.value > metrics.killRate.target + metrics.killRate.tolerance &&
                           metrics.damageReceived.value < metrics.damageReceived.target - metrics.damageReceived.tolerance;
                },
                adjustments: {
                    enemySpawnRate: 0.15,
                    enemyHealth: 0.1,
                    enemyDamage: 0.12,
                    enemyAccuracy: 0.08,
                    powerupSpawnRate: -0.1
                },
                priority: 0.8,
                description: '玩家表现过强，增加难度'
            },
            
            // 玩家表现过差时的调整
            playerTooWeak: {
                condition: (metrics) => {
                    return metrics.accuracy.value < metrics.accuracy.target - metrics.accuracy.tolerance &&
                           metrics.survivalTime.value < metrics.survivalTime.target - metrics.survivalTime.tolerance;
                },
                adjustments: {
                    enemySpawnRate: -0.2,
                    enemyDamage: -0.15,
                    enemyHealth: -0.1,
                    playerDamage: 0.1,
                    powerupSpawnRate: 0.15
                },
                priority: 0.9,
                description: '玩家表现较弱，降低难度'
            },
            
            // 玩家生存能力差
            lowSurvival: {
                condition: (metrics) => {
                    return metrics.damageReceived.value > metrics.damageReceived.target + metrics.damageReceived.tolerance ||
                           metrics.healthManagement.value < metrics.healthManagement.target - metrics.healthManagement.tolerance;
                },
                adjustments: {
                    enemyDamage: -0.1,
                    enemyAccuracy: -0.08,
                    enemySpeed: -0.05,
                    powerupSpawnRate: 0.1
                },
                priority: 0.7,
                description: '提高玩家生存能力'
            },
            
            // 玩家攻击效率低
            lowOffense: {
                condition: (metrics) => {
                    return metrics.killRate.value < metrics.killRate.target - metrics.killRate.tolerance &&
                           metrics.accuracy.value < metrics.accuracy.target;
                },
                adjustments: {
                    enemyHealth: -0.08,
                    playerDamage: 0.08,
                    enemySpeed: -0.05
                },
                priority: 0.6,
                description: '提高玩家攻击效率'
            },
            
            // 游戏节奏过快
            paceTooFast: {
                condition: (metrics) => {
                    return metrics.killRate.value > metrics.killRate.target * 1.5;
                },
                adjustments: {
                    enemySpawnRate: -0.1,
                    waveInterval: 0.1,
                    enemyHealth: 0.05
                },
                priority: 0.5,
                description: '调整游戏节奏'
            },
            
            // 游戏节奏过慢
            paceTooSlow: {
                condition: (metrics) => {
                    return metrics.killRate.value < metrics.killRate.target * 0.5 &&
                           metrics.accuracy.value > metrics.accuracy.target;
                },
                adjustments: {
                    enemySpawnRate: 0.1,
                    waveInterval: -0.05,
                    enemySpeed: 0.05
                },
                priority: 0.5,
                description: '加快游戏节奏'
            }
        };
    }

    // 更新系统
    update(gameState, deltaTime) {
        if (!this.adaptationEnabled) return;
        
        const currentTime = Date.now();
        
        // 收集玩家数据
        this.collectPlayerData(gameState, deltaTime);
        
        // 定期评估和调整
        if (currentTime - this.lastEvaluationTime >= this.evaluationInterval) {
            this.evaluatePerformance();
            this.adjustDifficulty();
            this.lastEvaluationTime = currentTime;
        }
        
        // 平滑应用难度调整
        this.applySmoothAdjustments(deltaTime);
        
        // 应用难度设置到游戏
        this.applyDifficultyToGame(gameState);
    }

    // 收集玩家数据
    collectPlayerData(gameState, deltaTime) {
        const player = gameState.player;
        const enemies = gameState.enemies || [];
        const currentTime = Date.now();
        
        // 计算准确率
        if (gameState.shotsFired > 0) {
            const accuracy = gameState.shotsHit / gameState.shotsFired;
            this.updateMetric('accuracy', accuracy);
        }
        
        // 计算生存时间
        if (gameState.gameStartTime) {
            const survivalTime = currentTime - gameState.gameStartTime;
            this.updateMetric('survivalTime', survivalTime);
        }
        
        // 计算击杀率
        if (gameState.gameStartTime && gameState.enemiesKilled) {
            const timeElapsed = (currentTime - gameState.gameStartTime) / 1000;
            const killRate = timeElapsed > 0 ? gameState.enemiesKilled / timeElapsed : 0;
            this.updateMetric('killRate', killRate);
        }
        
        // 计算受伤率
        if (gameState.gameStartTime && gameState.damageReceived) {
            const timeElapsed = (currentTime - gameState.gameStartTime) / 1000;
            const damageRate = timeElapsed > 0 ? gameState.damageReceived / timeElapsed : 0;
            this.updateMetric('damageReceived', damageRate);
        }
        
        // 计算血量管理
        if (player && player.maxHealth) {
            const healthRatio = player.health / player.maxHealth;
            this.updateMetric('healthManagement', healthRatio);
        }
        
        // 计算技能使用效率
        if (gameState.skillsUsed && gameState.skillOpportunities) {
            const skillEfficiency = gameState.skillOpportunities > 0 ? 
                gameState.skillsUsed / gameState.skillOpportunities : 0;
            this.updateMetric('skillUsage', skillEfficiency);
        }
    }

    // 更新指标
    updateMetric(metricName, value) {
        const metric = this.playerMetrics[metricName];
        if (!metric) return;
        
        metric.value = value;
        metric.history.push({
            value: value,
            timestamp: Date.now()
        });
        
        // 限制历史记录长度
        if (metric.history.length > metric.maxHistory) {
            metric.history.shift();
        }
    }

    // 评估玩家表现
    evaluatePerformance() {
        const performance = {
            timestamp: Date.now(),
            metrics: {},
            overallScore: 0,
            difficulty: this.currentDifficulty
        };
        
        let totalWeight = 0;
        let weightedScore = 0;
        
        // 计算各项指标的表现分数
        Object.keys(this.playerMetrics).forEach(metricName => {
            const metric = this.playerMetrics[metricName];
            
            if (metric.history.length > 0) {
                // 计算最近的平均值
                const recentValues = metric.history.slice(-5).map(h => h.value);
                const avgValue = recentValues.reduce((sum, v) => sum + v, 0) / recentValues.length;
                
                // 计算表现分数（0-1，0.5为目标值）
                let score = 0.5;
                const diff = Math.abs(avgValue - metric.target);
                
                if (diff <= metric.tolerance) {
                    score = 0.5 + (1 - diff / metric.tolerance) * 0.5;
                } else {
                    score = Math.max(0, 0.5 - (diff - metric.tolerance) / metric.target * 0.5);
                }
                
                performance.metrics[metricName] = {
                    value: avgValue,
                    target: metric.target,
                    score: score,
                    weight: metric.weight
                };
                
                weightedScore += score * metric.weight;
                totalWeight += metric.weight;
            }
        });
        
        // 计算总体表现分数
        performance.overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0.5;
        
        // 添加到历史记录
        this.performanceHistory.push(performance);
        
        // 限制历史记录长度
        if (this.performanceHistory.length > 50) {
            this.performanceHistory.shift();
        }
        
        if (this.debugMode) {
            console.log('Performance Evaluation:', performance);
        }
        
        return performance;
    }

    // 调整难度
    adjustDifficulty() {
        if (this.performanceHistory.length === 0) return;
        
        const latestPerformance = this.performanceHistory[this.performanceHistory.length - 1];
        const appliedRules = [];
        
        // 检查所有适应规则
        Object.keys(this.adaptationRules).forEach(ruleName => {
            const rule = this.adaptationRules[ruleName];
            
            if (rule.condition(this.playerMetrics)) {
                appliedRules.push({
                    name: ruleName,
                    rule: rule,
                    priority: rule.priority
                });
            }
        });
        
        // 按优先级排序
        appliedRules.sort((a, b) => b.priority - a.priority);
        
        // 应用规则调整
        const adjustments = {};
        appliedRules.forEach(({ name, rule }) => {
            Object.keys(rule.adjustments).forEach(setting => {
                if (!adjustments[setting]) {
                    adjustments[setting] = 0;
                }
                adjustments[setting] += rule.adjustments[setting] * rule.priority;
            });
            
            if (this.debugMode) {
                console.log(`Applied rule: ${name} - ${rule.description}`);
            }
        });
        
        // 应用调整到难度设置
        Object.keys(adjustments).forEach(settingName => {
            const setting = this.difficultySettings[settingName];
            if (setting) {
                const adjustment = adjustments[settingName] * this.adjustmentRate;
                setting.current = Math.max(
                    setting.min,
                    Math.min(setting.max, setting.current + adjustment)
                );
            }
        });
        
        // 计算新的目标难度
        this.calculateTargetDifficulty();
        
        // 记录调整历史
        this.adjustmentHistory.push({
            timestamp: Date.now(),
            appliedRules: appliedRules.map(r => r.name),
            adjustments: adjustments,
            targetDifficulty: this.targetDifficulty,
            performance: latestPerformance.overallScore
        });
        
        // 限制调整历史长度
        if (this.adjustmentHistory.length > 30) {
            this.adjustmentHistory.shift();
        }
    }

    // 计算目标难度
    calculateTargetDifficulty() {
        let difficultySum = 0;
        let totalImpact = 0;
        
        Object.keys(this.difficultySettings).forEach(settingName => {
            const setting = this.difficultySettings[settingName];
            const normalizedValue = (setting.current - setting.base) / (setting.max - setting.min);
            const impact = Math.abs(setting.impact);
            
            difficultySum += normalizedValue * impact * Math.sign(setting.impact);
            totalImpact += impact;
        });
        
        const difficultyOffset = totalImpact > 0 ? difficultySum / totalImpact : 0;
        this.targetDifficulty = Math.max(
            this.minDifficulty,
            Math.min(this.maxDifficulty, 1.0 + difficultyOffset)
        );
    }

    // 平滑应用难度调整
    applySmoothAdjustments(deltaTime) {
        const adjustmentSpeed = 0.001 * deltaTime; // 每秒调整速度
        
        if (Math.abs(this.currentDifficulty - this.targetDifficulty) > 0.01) {
            if (this.currentDifficulty < this.targetDifficulty) {
                this.currentDifficulty = Math.min(
                    this.targetDifficulty,
                    this.currentDifficulty + adjustmentSpeed
                );
            } else {
                this.currentDifficulty = Math.max(
                    this.targetDifficulty,
                    this.currentDifficulty - adjustmentSpeed
                );
            }
        }
    }

    // 应用难度设置到游戏
    applyDifficultyToGame(gameState) {
        // 应用到敌人系统
        if (gameState.waveSystem) {
            gameState.waveSystem.difficultyMultiplier = {
                spawnRate: this.difficultySettings.enemySpawnRate.current,
                health: this.difficultySettings.enemyHealth.current,
                damage: this.difficultySettings.enemyDamage.current,
                speed: this.difficultySettings.enemySpeed.current,
                accuracy: this.difficultySettings.enemyAccuracy.current,
                waveInterval: this.difficultySettings.waveInterval.current
            };
        }
        
        // 应用到玩家系统
        if (gameState.player) {
            gameState.player.difficultyMultiplier = {
                damage: this.difficultySettings.playerDamage.current,
                speed: this.difficultySettings.playerSpeed.current
            };
        }
        
        // 应用到道具系统
        if (gameState.powerupSystem) {
            gameState.powerupSystem.difficultyMultiplier = {
                spawnRate: this.difficultySettings.powerupSpawnRate.current
            };
        }
        
        // 应用到敌人多样化系统
        if (gameState.enemyDiversitySystem) {
            gameState.enemyDiversitySystem.setDifficultyMultiplier({
                health: this.difficultySettings.enemyHealth.current,
                damage: this.difficultySettings.enemyDamage.current,
                speed: this.difficultySettings.enemySpeed.current,
                accuracy: this.difficultySettings.enemyAccuracy.current
            });
        }
    }

    // 获取当前难度信息
    getDifficultyInfo() {
        return {
            current: this.currentDifficulty,
            target: this.targetDifficulty,
            settings: Object.keys(this.difficultySettings).reduce((info, key) => {
                const setting = this.difficultySettings[key];
                info[key] = {
                    current: setting.current,
                    base: setting.base,
                    min: setting.min,
                    max: setting.max,
                    deviation: ((setting.current - setting.base) / setting.base * 100).toFixed(1) + '%'
                };
                return info;
            }, {}),
            metrics: Object.keys(this.playerMetrics).reduce((info, key) => {
                const metric = this.playerMetrics[key];
                info[key] = {
                    current: metric.value,
                    target: metric.target,
                    performance: metric.value / metric.target
                };
                return info;
            }, {})
        };
    }

    // 获取性能历史
    getPerformanceHistory(count = 10) {
        return this.performanceHistory.slice(-count);
    }

    // 获取调整历史
    getAdjustmentHistory(count = 10) {
        return this.adjustmentHistory.slice(-count);
    }

    // 重置系统
    reset() {
        // 重置指标
        Object.keys(this.playerMetrics).forEach(key => {
            this.playerMetrics[key].value = 0;
            this.playerMetrics[key].history = [];
        });
        
        // 重置难度设置
        Object.keys(this.difficultySettings).forEach(key => {
            this.difficultySettings[key].current = this.difficultySettings[key].base;
        });
        
        // 重置难度
        this.currentDifficulty = 1.0;
        this.targetDifficulty = 1.0;
        
        // 清空历史
        this.performanceHistory = [];
        this.adjustmentHistory = [];
        
        this.lastEvaluationTime = 0;
        
        console.log('Dynamic Difficulty System reset');
    }

    // 设置难度范围
    setDifficultyRange(min, max) {
        this.minDifficulty = Math.max(0.1, min);
        this.maxDifficulty = Math.min(5.0, max);
        
        // 确保当前难度在范围内
        this.currentDifficulty = Math.max(
            this.minDifficulty,
            Math.min(this.maxDifficulty, this.currentDifficulty)
        );
        
        this.targetDifficulty = Math.max(
            this.minDifficulty,
            Math.min(this.maxDifficulty, this.targetDifficulty)
        );
    }

    // 设置调整速率
    setAdjustmentRate(rate) {
        this.adjustmentRate = Math.max(0.001, Math.min(0.1, rate));
    }

    // 设置评估间隔
    setEvaluationInterval(interval) {
        this.evaluationInterval = Math.max(1000, interval);
    }

    // 启用/禁用适应
    setAdaptationEnabled(enabled) {
        this.adaptationEnabled = enabled;
        
        if (!enabled) {
            // 重置到基础难度
            Object.keys(this.difficultySettings).forEach(key => {
                this.difficultySettings[key].current = this.difficultySettings[key].base;
            });
            this.targetDifficulty = 1.0;
        }
    }

    // 手动设置难度
    setManualDifficulty(difficulty) {
        this.adaptationEnabled = false;
        this.currentDifficulty = Math.max(
            this.minDifficulty,
            Math.min(this.maxDifficulty, difficulty)
        );
        this.targetDifficulty = this.currentDifficulty;
        
        // 按比例调整所有设置
        Object.keys(this.difficultySettings).forEach(key => {
            const setting = this.difficultySettings[key];
            const range = setting.max - setting.min;
            const offset = (difficulty - 1.0) * range * 0.5;
            
            setting.current = Math.max(
                setting.min,
                Math.min(setting.max, setting.base + offset)
            );
        });
    }

    // 设置调试模式
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    // 渲染调试信息
    renderDebugInfo(ctx, x = 10, y = 10) {
        if (!this.debugMode) return;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, 300, 400);
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        
        let currentY = y + 20;
        
        // 难度信息
        ctx.fillText(`Difficulty: ${this.currentDifficulty.toFixed(2)} → ${this.targetDifficulty.toFixed(2)}`, x + 10, currentY);
        currentY += 20;
        
        ctx.fillText('Settings:', x + 10, currentY);
        currentY += 15;
        
        // 显示主要设置
        const mainSettings = ['enemySpawnRate', 'enemyHealth', 'enemyDamage', 'playerDamage'];
        mainSettings.forEach(settingName => {
            const setting = this.difficultySettings[settingName];
            if (setting) {
                const deviation = ((setting.current - setting.base) / setting.base * 100).toFixed(0);
                ctx.fillStyle = deviation > 0 ? '#ff6666' : deviation < 0 ? '#66ff66' : 'white';
                ctx.fillText(`  ${settingName}: ${setting.current.toFixed(2)} (${deviation}%)`, x + 10, currentY);
                currentY += 15;
            }
        });
        
        ctx.fillStyle = 'white';
        currentY += 10;
        ctx.fillText('Metrics:', x + 10, currentY);
        currentY += 15;
        
        // 显示指标
        Object.keys(this.playerMetrics).forEach(metricName => {
            const metric = this.playerMetrics[metricName];
            const performance = metric.target > 0 ? (metric.value / metric.target * 100).toFixed(0) : '0';
            
            ctx.fillStyle = metric.value > metric.target ? '#66ff66' : 
                           metric.value < metric.target * 0.7 ? '#ff6666' : 'yellow';
            ctx.fillText(`  ${metricName}: ${performance}%`, x + 10, currentY);
            currentY += 15;
        });
        
        // 显示最近的调整
        if (this.adjustmentHistory.length > 0) {
            currentY += 10;
            ctx.fillStyle = 'white';
            ctx.fillText('Recent Adjustments:', x + 10, currentY);
            currentY += 15;
            
            const recentAdjustments = this.adjustmentHistory.slice(-3);
            recentAdjustments.forEach(adjustment => {
                ctx.fillStyle = '#cccccc';
                ctx.font = '12px Arial';
                adjustment.appliedRules.forEach(rule => {
                    ctx.fillText(`  ${rule}`, x + 10, currentY);
                    currentY += 12;
                });
            });
        }
        
        ctx.restore();
    }

    // 导出数据用于分析
    exportData() {
        return {
            currentDifficulty: this.currentDifficulty,
            targetDifficulty: this.targetDifficulty,
            settings: this.difficultySettings,
            metrics: this.playerMetrics,
            performanceHistory: this.performanceHistory,
            adjustmentHistory: this.adjustmentHistory,
            timestamp: Date.now()
        };
    }

    // 导入数据
    importData(data) {
        if (data.currentDifficulty !== undefined) {
            this.currentDifficulty = data.currentDifficulty;
        }
        if (data.targetDifficulty !== undefined) {
            this.targetDifficulty = data.targetDifficulty;
        }
        if (data.settings) {
            Object.keys(data.settings).forEach(key => {
                if (this.difficultySettings[key]) {
                    this.difficultySettings[key].current = data.settings[key].current;
                }
            });
        }
        if (data.performanceHistory) {
            this.performanceHistory = data.performanceHistory;
        }
        if (data.adjustmentHistory) {
            this.adjustmentHistory = data.adjustmentHistory;
        }
        
        console.log('Dynamic Difficulty System data imported');
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.DynamicDifficultySystem = DynamicDifficultySystem;
}