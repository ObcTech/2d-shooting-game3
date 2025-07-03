/**
 * 学习型AI系统
 * 实现AI的学习能力，包括行为模式学习、策略适应和经验积累
 */

class LearningAISystem {
    constructor() {
        this.behaviorDatabase = this.initializeBehaviorDatabase();
        this.learningModules = this.initializeLearningModules();
        this.experienceMemory = new Map();
        this.strategyLibrary = this.initializeStrategyLibrary();
        this.adaptationRules = this.initializeAdaptationRules();
        this.learningRate = 0.1;
        this.memoryCapacity = 1000;
        this.experienceDecayRate = 0.95;
        this.confidenceThreshold = 0.7;
        this.learningEnabled = true;
        this.debugMode = false;
        this.sessionId = this.generateSessionId();
    }

    // 初始化行为数据库
    initializeBehaviorDatabase() {
        return {
            // 玩家行为模式
            playerPatterns: {
                movement: {
                    patterns: new Map(),
                    frequency: new Map(),
                    effectiveness: new Map()
                },
                combat: {
                    patterns: new Map(),
                    frequency: new Map(),
                    effectiveness: new Map()
                },
                positioning: {
                    patterns: new Map(),
                    frequency: new Map(),
                    effectiveness: new Map()
                },
                timing: {
                    patterns: new Map(),
                    frequency: new Map(),
                    effectiveness: new Map()
                }
            },
            
            // AI行为效果
            aiEffectiveness: {
                strategies: new Map(),
                formations: new Map(),
                tactics: new Map(),
                responses: new Map()
            },
            
            // 环境适应
            environmentalFactors: {
                mapAreas: new Map(),
                obstacles: new Map(),
                powerups: new Map(),
                situations: new Map()
            }
        };
    }

    // 初始化学习模块
    initializeLearningModules() {
        return {
            // 模式识别模块
            patternRecognition: {
                enabled: true,
                sensitivity: 0.8,
                minSamples: 5,
                patterns: new Map(),
                lastUpdate: 0
            },
            
            // 策略学习模块
            strategyLearning: {
                enabled: true,
                explorationRate: 0.3,
                exploitationRate: 0.7,
                strategies: new Map(),
                performance: new Map()
            },
            
            // 适应性学习模块
            adaptiveLearning: {
                enabled: true,
                adaptationSpeed: 0.2,
                stabilityThreshold: 0.1,
                adaptations: new Map(),
                history: []
            },
            
            // 预测模块
            prediction: {
                enabled: true,
                accuracy: 0.0,
                predictions: new Map(),
                validations: new Map()
            }
        };
    }

    // 初始化策略库
    initializeStrategyLibrary() {
        return {
            // 基础策略
            basic: {
                'direct_assault': {
                    description: '直接攻击',
                    effectiveness: 0.5,
                    usage: 0,
                    success: 0,
                    conditions: ['close_range', 'high_health'],
                    actions: ['move_toward_player', 'attack_continuously']
                },
                'hit_and_run': {
                    description: '游击战术',
                    effectiveness: 0.6,
                    usage: 0,
                    success: 0,
                    conditions: ['medium_range', 'low_health'],
                    actions: ['attack_and_retreat', 'use_cover']
                },
                'ambush': {
                    description: '伏击战术',
                    effectiveness: 0.7,
                    usage: 0,
                    success: 0,
                    conditions: ['hidden_position', 'player_approaching'],
                    actions: ['wait_for_opportunity', 'surprise_attack']
                }
            },
            
            // 学习到的策略
            learned: new Map(),
            
            // 组合策略
            combinations: new Map()
        };
    }

    // 初始化适应规则
    initializeAdaptationRules() {
        return {
            // 基于成功率的适应
            successRate: {
                threshold: 0.3,
                action: 'modify_strategy',
                weight: 0.8
            },
            
            // 基于玩家行为的适应
            playerBehavior: {
                threshold: 0.6,
                action: 'counter_strategy',
                weight: 0.9
            },
            
            // 基于环境的适应
            environmental: {
                threshold: 0.5,
                action: 'adapt_tactics',
                weight: 0.7
            },
            
            // 基于时间的适应
            temporal: {
                threshold: 0.4,
                action: 'evolve_behavior',
                weight: 0.6
            }
        };
    }

    // 更新学习系统
    update(gameState, enemies, player, deltaTime) {
        if (!this.learningEnabled) return;
        
        // 收集经验数据
        this.collectExperience(gameState, enemies, player, deltaTime);
        
        // 分析玩家行为
        this.analyzePlayerBehavior(player, deltaTime);
        
        // 评估AI策略效果
        this.evaluateAIStrategies(enemies, player);
        
        // 学习和适应
        this.performLearning(deltaTime);
        
        // 应用学习结果
        this.applyLearning(enemies, gameState);
        
        // 清理过期数据
        this.cleanupMemory();
    }

    // 收集经验数据
    collectExperience(gameState, enemies, player, deltaTime) {
        const currentTime = Date.now();
        const experienceId = `exp_${currentTime}_${Math.random().toString(36).substr(2, 9)}`;
        
        const experience = {
            id: experienceId,
            timestamp: currentTime,
            sessionId: this.sessionId,
            gameState: {
                wave: gameState.currentWave || 0,
                enemyCount: enemies.length,
                playerHealth: player.health / player.maxHealth,
                playerPosition: { x: player.x, y: player.y },
                gameTime: gameState.gameTime || 0
            },
            enemies: enemies.map(enemy => ({
                id: enemy.id,
                type: enemy.type,
                position: { x: enemy.x, y: enemy.y },
                health: enemy.health / enemy.maxHealth,
                state: enemy.state,
                strategy: enemy.currentStrategy,
                groupId: enemy.groupId
            })),
            events: [],
            outcomes: {},
            deltaTime: deltaTime
        };
        
        // 记录重要事件
        this.recordEvents(experience, gameState, enemies, player);
        
        // 存储经验
        this.experienceMemory.set(experienceId, experience);
        
        // 限制内存大小
        if (this.experienceMemory.size > this.memoryCapacity) {
            const oldestKey = this.experienceMemory.keys().next().value;
            this.experienceMemory.delete(oldestKey);
        }
    }

    // 记录事件
    recordEvents(experience, gameState, enemies, player) {
        // 记录战斗事件
        enemies.forEach(enemy => {
            if (enemy.justAttacked) {
                experience.events.push({
                    type: 'enemy_attack',
                    enemyId: enemy.id,
                    enemyType: enemy.type,
                    success: enemy.attackHit,
                    damage: enemy.lastDamageDealt || 0,
                    distance: this.calculateDistance(enemy, player)
                });
            }
            
            if (enemy.justDied) {
                experience.events.push({
                    type: 'enemy_death',
                    enemyId: enemy.id,
                    enemyType: enemy.type,
                    survivalTime: enemy.survivalTime || 0,
                    damageDealt: enemy.totalDamageDealt || 0
                });
            }
            
            if (enemy.strategyChanged) {
                experience.events.push({
                    type: 'strategy_change',
                    enemyId: enemy.id,
                    oldStrategy: enemy.previousStrategy,
                    newStrategy: enemy.currentStrategy,
                    reason: enemy.strategyChangeReason
                });
            }
        });
        
        // 记录玩家事件
        if (player.justTookDamage) {
            experience.events.push({
                type: 'player_damaged',
                damage: player.lastDamageTaken || 0,
                source: player.damageSource,
                playerHealth: player.health / player.maxHealth
            });
        }
        
        if (gameState.justKilledEnemy) {
            experience.events.push({
                type: 'player_kill',
                enemyType: gameState.lastKilledEnemyType,
                killMethod: gameState.killMethod,
                timeToKill: gameState.timeToKill
            });
        }
    }

    // 分析玩家行为
    analyzePlayerBehavior(player, deltaTime) {
        const currentTime = Date.now();
        
        // 分析移动模式
        this.analyzeMovementPattern(player, currentTime);
        
        // 分析战斗模式
        this.analyzeCombatPattern(player, currentTime);
        
        // 分析定位偏好
        this.analyzePositioningPattern(player, currentTime);
        
        // 分析时机选择
        this.analyzeTimingPattern(player, currentTime);
    }

    // 分析移动模式
    analyzeMovementPattern(player, currentTime) {
        const movementData = {
            velocity: { x: player.vx || 0, y: player.vy || 0 },
            direction: Math.atan2(player.vy || 0, player.vx || 0),
            speed: Math.sqrt((player.vx || 0) ** 2 + (player.vy || 0) ** 2),
            position: { x: player.x, y: player.y },
            timestamp: currentTime
        };
        
        // 识别移动模式
        const pattern = this.identifyMovementPattern(movementData);
        if (pattern) {
            this.updatePatternDatabase('movement', pattern, movementData);
        }
    }

    // 识别移动模式
    identifyMovementPattern(movementData) {
        const speed = movementData.speed;
        const direction = movementData.direction;
        
        // 基本移动模式
        if (speed < 0.1) {
            return 'stationary';
        } else if (speed > 5) {
            return 'fast_movement';
        }
        
        // 方向性模式
        const directionDegrees = (direction * 180 / Math.PI + 360) % 360;
        
        if (directionDegrees >= 315 || directionDegrees < 45) {
            return 'moving_right';
        } else if (directionDegrees >= 45 && directionDegrees < 135) {
            return 'moving_down';
        } else if (directionDegrees >= 135 && directionDegrees < 225) {
            return 'moving_left';
        } else {
            return 'moving_up';
        }
    }

    // 分析战斗模式
    analyzeCombatPattern(player, currentTime) {
        const combatData = {
            attacking: player.isAttacking || false,
            weaponType: player.currentWeapon || 'default',
            targetDirection: player.aimDirection || 0,
            accuracy: player.recentAccuracy || 0,
            fireRate: player.fireRate || 0,
            timestamp: currentTime
        };
        
        const pattern = this.identifyCombatPattern(combatData);
        if (pattern) {
            this.updatePatternDatabase('combat', pattern, combatData);
        }
    }
    
    // 分析定位偏好
    analyzePositioningPattern(player, currentTime) {
        const positionData = {
            x: player.x,
            y: player.y,
            distanceFromCenter: Math.sqrt((player.x - 400) ** 2 + (player.y - 300) ** 2), // 假设画布中心为400,300
            nearWalls: this.checkNearWalls(player),
            safetyLevel: this.calculateSafetyLevel(player),
            timestamp: currentTime
        };
        
        const pattern = this.identifyPositioningPattern(positionData);
        if (pattern) {
            this.updatePatternDatabase('positioning', pattern, positionData);
        }
    }
    
    // 识别定位模式
    identifyPositioningPattern(positionData) {
        const { x, y, distanceFromCenter, nearWalls, safetyLevel } = positionData;
        
        // 边缘偏好
        if (nearWalls.count >= 2) {
            return 'corner_preference';
        } else if (nearWalls.count === 1) {
            return 'wall_preference';
        }
        
        // 中心偏好
        if (distanceFromCenter < 100) {
            return 'center_preference';
        }
        
        // 安全偏好
        if (safetyLevel > 0.7) {
            return 'safety_focused';
        } else if (safetyLevel < 0.3) {
            return 'aggressive_positioning';
        }
        
        return 'balanced_positioning';
    }
    
    // 检查靠近墙壁情况
    checkNearWalls(player) {
        const wallThreshold = 50; // 距离墙壁50像素内算靠近
        const walls = {
            left: player.x < wallThreshold,
            right: player.x > (800 - wallThreshold), // 假设画布宽度800
            top: player.y < wallThreshold,
            bottom: player.y > (600 - wallThreshold) // 假设画布高度600
        };
        
        const count = Object.values(walls).filter(Boolean).length;
        return { ...walls, count };
    }
    
    // 计算安全等级
    calculateSafetyLevel(player) {
        // 基于周围敌人数量和距离计算安全等级
        // 这里简化实现，实际应该考虑更多因素
        const baseScore = 0.5;
        const distanceFromCenter = Math.sqrt((player.x - 400) ** 2 + (player.y - 300) ** 2);
        const centerBonus = Math.max(0, (200 - distanceFromCenter) / 200) * 0.3;
        
        return Math.min(1, baseScore + centerBonus);
    }
    
    // 分析时机选择
    analyzeTimingPattern(player, currentTime) {
        const timingData = {
            actionType: this.getCurrentAction(player),
            reactionTime: player.lastReactionTime || 0,
            decisionSpeed: player.decisionSpeed || 0,
            situationContext: this.analyzeSituation(player),
            timestamp: currentTime
        };
        
        const pattern = this.identifyTimingPattern(timingData);
        if (pattern) {
            this.updatePatternDatabase('timing', pattern, timingData);
        }
    }
    
    // 获取当前动作
    getCurrentAction(player) {
        if (player.isAttacking) return 'attacking';
        if (player.isMoving) return 'moving';
        if (player.isDefending) return 'defending';
        return 'idle';
    }
    
    // 分析当前情况
    analyzeSituation(player) {
        return {
            enemyCount: player.nearbyEnemies || 0,
            healthLevel: (player.health || 100) / 100,
            threatLevel: player.threatLevel || 0,
            resourceLevel: player.resources || 0
        };
    }
    
    // 识别时机模式
    identifyTimingPattern(timingData) {
        const { reactionTime, decisionSpeed, situationContext } = timingData;
        
        if (reactionTime < 200) {
            return 'quick_reflexes';
        } else if (reactionTime > 800) {
            return 'slow_reactions';
        }
        
        if (decisionSpeed > 0.8) {
            return 'decisive';
        } else if (decisionSpeed < 0.3) {
            return 'hesitant';
        }
        
        if (situationContext.threatLevel > 0.7 && reactionTime < 400) {
            return 'threat_responsive';
        }
        
        return 'balanced_timing';
    }

    // 识别战斗模式
    identifyCombatPattern(combatData) {
        if (!combatData.attacking) {
            return 'passive';
        }
        
        if (combatData.fireRate > 10) {
            return 'aggressive_rapid_fire';
        } else if (combatData.accuracy > 0.8) {
            return 'precise_shooting';
        } else if (combatData.fireRate < 3) {
            return 'conservative_shooting';
        }
        
        return 'standard_combat';
    }

    // 更新模式数据库
    updatePatternDatabase(category, pattern, data) {
        const patterns = this.behaviorDatabase.playerPatterns[category];
        
        // 更新频率
        patterns.frequency.set(pattern, (patterns.frequency.get(pattern) || 0) + 1);
        
        // 存储模式数据
        if (!patterns.patterns.has(pattern)) {
            patterns.patterns.set(pattern, []);
        }
        
        const patternData = patterns.patterns.get(pattern);
        patternData.push(data);
        
        // 限制数据量
        if (patternData.length > 50) {
            patternData.shift();
        }
    }

    // 评估AI策略效果
    evaluateAIStrategies(enemies, player) {
        enemies.forEach(enemy => {
            if (enemy.currentStrategy) {
                const strategy = enemy.currentStrategy;
                const effectiveness = this.calculateStrategyEffectiveness(enemy, player);
                
                // 更新策略效果数据
                this.updateStrategyEffectiveness(strategy, effectiveness, enemy);
            }
        });
    }

    // 计算策略效果
    calculateStrategyEffectiveness(enemy, player) {
        let effectiveness = 0;
        
        // 基于伤害输出
        const damageScore = (enemy.damageDealt || 0) / (enemy.maxDamage || 1);
        effectiveness += damageScore * 0.4;
        
        // 基于生存时间
        const survivalScore = Math.min(1, (enemy.survivalTime || 0) / 30000); // 30秒为满分
        effectiveness += survivalScore * 0.3;
        
        // 基于目标接近度
        const distance = this.calculateDistance(enemy, player);
        const proximityScore = Math.max(0, 1 - distance / 300); // 300像素为最远有效距离
        effectiveness += proximityScore * 0.2;
        
        // 基于策略执行度
        const executionScore = enemy.strategyExecutionRate || 0.5;
        effectiveness += executionScore * 0.1;
        
        return Math.min(1, effectiveness);
    }

    // 更新策略效果
    updateStrategyEffectiveness(strategyName, effectiveness, enemy) {
        const aiEffectiveness = this.behaviorDatabase.aiEffectiveness.strategies;
        
        if (!aiEffectiveness.has(strategyName)) {
            aiEffectiveness.set(strategyName, {
                totalEffectiveness: 0,
                usageCount: 0,
                averageEffectiveness: 0,
                bestEffectiveness: 0,
                worstEffectiveness: 1,
                recentEffectiveness: []
            });
        }
        
        const strategyData = aiEffectiveness.get(strategyName);
        strategyData.totalEffectiveness += effectiveness;
        strategyData.usageCount++;
        strategyData.averageEffectiveness = strategyData.totalEffectiveness / strategyData.usageCount;
        strategyData.bestEffectiveness = Math.max(strategyData.bestEffectiveness, effectiveness);
        strategyData.worstEffectiveness = Math.min(strategyData.worstEffectiveness, effectiveness);
        
        strategyData.recentEffectiveness.push(effectiveness);
        if (strategyData.recentEffectiveness.length > 20) {
            strategyData.recentEffectiveness.shift();
        }
    }

    // 执行学习
    performLearning(deltaTime) {
        // 模式识别学习
        if (this.learningModules.patternRecognition.enabled) {
            this.performPatternLearning();
        }
        
        // 策略学习
        if (this.learningModules.strategyLearning.enabled) {
            this.performStrategyLearning();
        }
        
        // 适应性学习
        if (this.learningModules.adaptiveLearning.enabled) {
            this.performAdaptiveLearning();
        }
        
        // 预测学习
        if (this.learningModules.prediction.enabled) {
            this.performPredictionLearning();
        }
    }

    // 模式识别学习
    performPatternLearning() {
        const module = this.learningModules.patternRecognition;
        
        // 分析玩家行为模式
        Object.keys(this.behaviorDatabase.playerPatterns).forEach(category => {
            const patterns = this.behaviorDatabase.playerPatterns[category];
            
            // 识别最常见的模式
            const mostFrequentPattern = this.findMostFrequentPattern(patterns.frequency);
            
            if (mostFrequentPattern && patterns.frequency.get(mostFrequentPattern) >= module.minSamples) {
                // 学习反制策略
                this.learnCounterStrategy(category, mostFrequentPattern);
            }
        });
    }

    // 找到最频繁的模式
    findMostFrequentPattern(frequencyMap) {
        let maxFrequency = 0;
        let mostFrequent = null;
        
        frequencyMap.forEach((frequency, pattern) => {
            if (frequency > maxFrequency) {
                maxFrequency = frequency;
                mostFrequent = pattern;
            }
        });
        
        return mostFrequent;
    }

    // 学习反制策略
    learnCounterStrategy(category, pattern) {
        const counterStrategies = {
            movement: {
                'stationary': 'surround_and_attack',
                'fast_movement': 'predict_and_intercept',
                'moving_right': 'flank_from_left',
                'moving_left': 'flank_from_right',
                'moving_up': 'attack_from_below',
                'moving_down': 'attack_from_above'
            },
            combat: {
                'aggressive_rapid_fire': 'use_cover_and_patience',
                'precise_shooting': 'unpredictable_movement',
                'conservative_shooting': 'aggressive_rush',
                'passive': 'force_engagement'
            }
        };
        
        const counterStrategy = counterStrategies[category]?.[pattern];
        if (counterStrategy) {
            this.addLearnedStrategy(counterStrategy, category, pattern);
        }
    }

    // 添加学习到的策略
    addLearnedStrategy(strategyName, category, targetPattern) {
        const learned = this.strategyLibrary.learned;
        
        if (!learned.has(strategyName)) {
            learned.set(strategyName, {
                name: strategyName,
                category: category,
                targetPattern: targetPattern,
                effectiveness: 0.5,
                confidence: 0.1,
                usage: 0,
                success: 0,
                learnedAt: Date.now(),
                conditions: this.generateStrategyConditions(strategyName),
                actions: this.generateStrategyActions(strategyName)
            });
            
            if (this.debugMode) {
                console.log(`Learned new strategy: ${strategyName} to counter ${targetPattern}`);
            }
        }
    }

    // 生成策略条件
    generateStrategyConditions(strategyName) {
        const conditionTemplates = {
            'surround_and_attack': ['player_stationary', 'multiple_enemies'],
            'predict_and_intercept': ['player_fast_moving', 'predictable_path'],
            'flank_from_left': ['player_moving_right', 'open_left_side'],
            'flank_from_right': ['player_moving_left', 'open_right_side'],
            'use_cover_and_patience': ['player_aggressive', 'cover_available'],
            'unpredictable_movement': ['player_precise', 'evasion_possible'],
            'aggressive_rush': ['player_passive', 'close_range_possible'],
            'force_engagement': ['player_avoiding', 'cornering_possible']
        };
        
        return conditionTemplates[strategyName] || ['default_condition'];
    }

    // 生成策略行动
    generateStrategyActions(strategyName) {
        const actionTemplates = {
            'surround_and_attack': ['coordinate_positions', 'simultaneous_attack'],
            'predict_and_intercept': ['calculate_intercept_point', 'move_to_intercept'],
            'flank_from_left': ['move_left_of_player', 'attack_from_side'],
            'flank_from_right': ['move_right_of_player', 'attack_from_side'],
            'use_cover_and_patience': ['find_cover', 'wait_for_opportunity'],
            'unpredictable_movement': ['random_movement', 'erratic_patterns'],
            'aggressive_rush': ['direct_approach', 'continuous_attack'],
            'force_engagement': ['block_escape_routes', 'pressure_player']
        };
        
        return actionTemplates[strategyName] || ['default_action'];
    }

    // 策略学习
    performStrategyLearning() {
        const module = this.learningModules.strategyLearning;
        
        // 评估现有策略
        this.behaviorDatabase.aiEffectiveness.strategies.forEach((data, strategyName) => {
            if (data.usageCount >= 5) {
                const recentAvg = this.calculateRecentAverage(data.recentEffectiveness);
                
                // 更新策略库中的效果评分
                this.updateStrategyLibraryEffectiveness(strategyName, recentAvg);
                
                // 如果策略效果差，尝试改进
                if (recentAvg < 0.3) {
                    this.improveStrategy(strategyName, data);
                }
            }
        });
        
        // 探索新策略组合
        if (Math.random() < module.explorationRate) {
            this.exploreNewStrategyCombinations();
        }
    }

    // 计算最近平均值
    calculateRecentAverage(values) {
        if (values.length === 0) return 0;
        
        const recentValues = values.slice(-5);
        return recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    }

    // 更新策略库效果
    updateStrategyLibraryEffectiveness(strategyName, effectiveness) {
        // 更新基础策略
        if (this.strategyLibrary.basic[strategyName]) {
            this.strategyLibrary.basic[strategyName].effectiveness = effectiveness;
        }
        
        // 更新学习策略
        if (this.strategyLibrary.learned.has(strategyName)) {
            const strategy = this.strategyLibrary.learned.get(strategyName);
            strategy.effectiveness = effectiveness;
            strategy.confidence = Math.min(1, strategy.confidence + 0.1);
        }
    }

    // 改进策略
    improveStrategy(strategyName, data) {
        // 分析失败原因
        const failureReasons = this.analyzeStrategyFailures(strategyName, data);
        
        // 生成改进版本
        const improvedStrategy = this.generateImprovedStrategy(strategyName, failureReasons);
        
        if (improvedStrategy) {
            this.strategyLibrary.learned.set(improvedStrategy.name, improvedStrategy);
            
            if (this.debugMode) {
                console.log(`Improved strategy: ${strategyName} -> ${improvedStrategy.name}`);
            }
        }
    }

    // 分析策略失败原因
    analyzeStrategyFailures(strategyName, data) {
        const failures = [];
        
        if (data.averageEffectiveness < 0.2) {
            failures.push('low_damage_output');
        }
        
        if (data.worstEffectiveness < 0.1) {
            failures.push('poor_execution');
        }
        
        const recentTrend = this.calculateTrend(data.recentEffectiveness);
        if (recentTrend < -0.1) {
            failures.push('declining_performance');
        }
        
        return failures;
    }

    // 计算趋势
    calculateTrend(values) {
        if (values.length < 3) return 0;
        
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        
        return secondAvg - firstAvg;
    }

    // 生成改进策略
    generateImprovedStrategy(originalName, failures) {
        const improvements = {
            'low_damage_output': '_aggressive',
            'poor_execution': '_refined',
            'declining_performance': '_adaptive'
        };
        
        const improvementSuffix = failures.map(f => improvements[f] || '').join('');
        const improvedName = originalName + improvementSuffix;
        
        return {
            name: improvedName,
            baseStrategy: originalName,
            improvements: failures,
            effectiveness: 0.5,
            confidence: 0.2,
            usage: 0,
            success: 0,
            learnedAt: Date.now(),
            conditions: this.generateImprovedConditions(originalName, failures),
            actions: this.generateImprovedActions(originalName, failures)
        };
    }

    // 生成改进条件
    generateImprovedConditions(originalName, failures) {
        const baseConditions = this.generateStrategyConditions(originalName);
        const additionalConditions = [];
        
        if (failures.includes('low_damage_output')) {
            additionalConditions.push('high_damage_opportunity');
        }
        
        if (failures.includes('poor_execution')) {
            additionalConditions.push('optimal_positioning');
        }
        
        return [...baseConditions, ...additionalConditions];
    }

    // 生成改进行动
    generateImprovedActions(originalName, failures) {
        const baseActions = this.generateStrategyActions(originalName);
        const additionalActions = [];
        
        if (failures.includes('low_damage_output')) {
            additionalActions.push('focus_fire', 'coordinate_attacks');
        }
        
        if (failures.includes('poor_execution')) {
            additionalActions.push('verify_conditions', 'adaptive_timing');
        }
        
        return [...baseActions, ...additionalActions];
    }

    // 探索新策略组合
    exploreNewStrategyCombinations() {
        const availableStrategies = [
            ...Object.keys(this.strategyLibrary.basic),
            ...Array.from(this.strategyLibrary.learned.keys())
        ];
        
        if (availableStrategies.length >= 2) {
            const strategy1 = availableStrategies[Math.floor(Math.random() * availableStrategies.length)];
            const strategy2 = availableStrategies[Math.floor(Math.random() * availableStrategies.length)];
            
            if (strategy1 !== strategy2) {
                const combinationName = `${strategy1}_${strategy2}_combo`;
                
                if (!this.strategyLibrary.combinations.has(combinationName)) {
                    this.strategyLibrary.combinations.set(combinationName, {
                        name: combinationName,
                        strategies: [strategy1, strategy2],
                        effectiveness: 0.5,
                        usage: 0,
                        success: 0,
                        createdAt: Date.now()
                    });
                    
                    if (this.debugMode) {
                        console.log(`Created new strategy combination: ${combinationName}`);
                    }
                }
            }
        }
    }

    // 适应性学习
    performAdaptiveLearning() {
        const module = this.learningModules.adaptiveLearning;
        
        // 分析当前适应状态
        const adaptationNeeded = this.assessAdaptationNeeds();
        
        if (adaptationNeeded.length > 0) {
            adaptationNeeded.forEach(adaptation => {
                this.performAdaptation(adaptation);
            });
            
            // 记录适应历史
            module.history.push({
                timestamp: Date.now(),
                adaptations: adaptationNeeded,
                reason: 'performance_optimization'
            });
            
            // 限制历史长度
            if (module.history.length > 20) {
                module.history.shift();
            }
        }
    }

    // 评估适应需求
    assessAdaptationNeeds() {
        const needs = [];
        
        // 检查策略效果
        const avgEffectiveness = this.calculateAverageStrategyEffectiveness();
        if (avgEffectiveness < 0.4) {
            needs.push({
                type: 'strategy_adjustment',
                priority: 0.8,
                target: 'increase_effectiveness'
            });
        }
        
        // 检查玩家适应
        const playerAdaptation = this.detectPlayerAdaptation();
        if (playerAdaptation > 0.7) {
            needs.push({
                type: 'counter_adaptation',
                priority: 0.9,
                target: 'surprise_player'
            });
        }
        
        // 检查环境变化
        const environmentChange = this.detectEnvironmentChange();
        if (environmentChange > 0.6) {
            needs.push({
                type: 'environment_adaptation',
                priority: 0.6,
                target: 'adapt_to_environment'
            });
        }
        
        return needs;
    }

    // 计算平均策略效果
    calculateAverageStrategyEffectiveness() {
        const strategies = this.behaviorDatabase.aiEffectiveness.strategies;
        let totalEffectiveness = 0;
        let count = 0;
        
        strategies.forEach(data => {
            if (data.usageCount > 0) {
                totalEffectiveness += data.averageEffectiveness;
                count++;
            }
        });
        
        return count > 0 ? totalEffectiveness / count : 0.5;
    }

    // 检测玩家适应
    detectPlayerAdaptation() {
        // 简化实现：检查玩家行为的一致性
        const patterns = this.behaviorDatabase.playerPatterns;
        let consistencyScore = 0;
        let patternCount = 0;
        
        Object.values(patterns).forEach(category => {
            const mostFrequent = this.findMostFrequentPattern(category.frequency);
            if (mostFrequent) {
                const frequency = category.frequency.get(mostFrequent);
                const total = Array.from(category.frequency.values()).reduce((sum, f) => sum + f, 0);
                consistencyScore += frequency / total;
                patternCount++;
            }
        });
        
        return patternCount > 0 ? consistencyScore / patternCount : 0;
    }

    // 检测环境变化
    detectEnvironmentChange() {
        // 简化实现：基于时间的变化检测
        const currentTime = Date.now();
        const recentExperiences = Array.from(this.experienceMemory.values())
            .filter(exp => currentTime - exp.timestamp < 30000); // 最近30秒
        
        if (recentExperiences.length < 5) return 0;
        
        // 检查游戏状态变化
        const waveChanges = new Set(recentExperiences.map(exp => exp.gameState.wave)).size;
        const enemyCountVariation = this.calculateVariation(
            recentExperiences.map(exp => exp.gameState.enemyCount)
        );
        
        return Math.min(1, (waveChanges / 3 + enemyCountVariation) / 2);
    }

    // 计算变异度
    calculateVariation(values) {
        if (values.length < 2) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        return mean > 0 ? stdDev / mean : 0;
    }

    // 执行适应
    performAdaptation(adaptation) {
        switch (adaptation.type) {
            case 'strategy_adjustment':
                this.adjustStrategies(adaptation);
                break;
            case 'counter_adaptation':
                this.implementCounterAdaptation(adaptation);
                break;
            case 'environment_adaptation':
                this.adaptToEnvironment(adaptation);
                break;
        }
    }

    // 调整策略
    adjustStrategies(adaptation) {
        // 提高低效策略的变异性
        this.behaviorDatabase.aiEffectiveness.strategies.forEach((data, strategyName) => {
            if (data.averageEffectiveness < 0.4) {
                this.createStrategyVariant(strategyName);
            }
        });
    }

    // 创建策略变体
    createStrategyVariant(baseName) {
        const variantName = `${baseName}_variant_${Date.now()}`;
        const baseStrategy = this.strategyLibrary.basic[baseName] || 
                           this.strategyLibrary.learned.get(baseName);
        
        if (baseStrategy) {
            const variant = {
                name: variantName,
                baseStrategy: baseName,
                effectiveness: 0.5,
                confidence: 0.1,
                usage: 0,
                success: 0,
                createdAt: Date.now(),
                conditions: this.mutateConditions(baseStrategy.conditions),
                actions: this.mutateActions(baseStrategy.actions)
            };
            
            this.strategyLibrary.learned.set(variantName, variant);
        }
    }

    // 变异条件
    mutateConditions(conditions) {
        const mutated = [...conditions];
        
        // 随机添加或修改条件
        if (Math.random() < 0.3) {
            const additionalConditions = ['high_confidence', 'low_risk', 'optimal_timing'];
            const randomCondition = additionalConditions[Math.floor(Math.random() * additionalConditions.length)];
            mutated.push(randomCondition);
        }
        
        return mutated;
    }

    // 变异行动
    mutateActions(actions) {
        const mutated = [...actions];
        
        // 随机添加或修改行动
        if (Math.random() < 0.3) {
            const additionalActions = ['verify_safety', 'coordinate_timing', 'adaptive_response'];
            const randomAction = additionalActions[Math.floor(Math.random() * additionalActions.length)];
            mutated.push(randomAction);
        }
        
        return mutated;
    }

    // 实施反适应
    implementCounterAdaptation(adaptation) {
        // 增加随机性和不可预测性
        this.learningModules.strategyLearning.explorationRate = Math.min(0.5, 
            this.learningModules.strategyLearning.explorationRate + 0.1
        );
        
        // 创建反制策略
        const playerPatterns = this.getMostFrequentPlayerPatterns();
        playerPatterns.forEach(pattern => {
            this.createCounterStrategy(pattern);
        });
    }

    // 获取最频繁的玩家模式
    getMostFrequentPlayerPatterns() {
        const patterns = [];
        
        Object.keys(this.behaviorDatabase.playerPatterns).forEach(category => {
            const mostFrequent = this.findMostFrequentPattern(
                this.behaviorDatabase.playerPatterns[category].frequency
            );
            if (mostFrequent) {
                patterns.push({ category, pattern: mostFrequent });
            }
        });
        
        return patterns;
    }

    // 创建反制策略
    createCounterStrategy(patternInfo) {
        const counterName = `counter_${patternInfo.category}_${patternInfo.pattern}_${Date.now()}`;
        
        const counterStrategy = {
            name: counterName,
            targetCategory: patternInfo.category,
            targetPattern: patternInfo.pattern,
            effectiveness: 0.5,
            confidence: 0.2,
            usage: 0,
            success: 0,
            createdAt: Date.now(),
            conditions: [`player_${patternInfo.pattern}`, 'counter_opportunity'],
            actions: this.generateCounterActions(patternInfo)
        };
        
        this.strategyLibrary.learned.set(counterName, counterStrategy);
    }

    // 生成反制行动
    generateCounterActions(patternInfo) {
        const counterActions = {
            movement: {
                'stationary': ['surround_player', 'coordinated_attack'],
                'fast_movement': ['predict_path', 'intercept_movement'],
                'moving_right': ['attack_from_left', 'force_direction_change'],
                'moving_left': ['attack_from_right', 'force_direction_change']
            },
            combat: {
                'aggressive_rapid_fire': ['use_cover', 'patient_approach'],
                'precise_shooting': ['erratic_movement', 'close_distance'],
                'conservative_shooting': ['aggressive_pressure', 'force_engagement']
            }
        };
        
        return counterActions[patternInfo.category]?.[patternInfo.pattern] || ['adaptive_response'];
    }

    // 适应环境
    adaptToEnvironment(adaptation) {
        // 根据当前环境调整行为参数
        const recentExperiences = Array.from(this.experienceMemory.values()).slice(-10);
        
        if (recentExperiences.length > 0) {
            const avgEnemyCount = recentExperiences.reduce((sum, exp) => 
                sum + exp.gameState.enemyCount, 0
            ) / recentExperiences.length;
            
            // 根据敌人数量调整策略偏好
            if (avgEnemyCount > 5) {
                // 多敌人环境，偏好群体策略
                this.adjustStrategyWeights('group', 1.2);
            } else {
                // 少敌人环境，偏好个体策略
                this.adjustStrategyWeights('individual', 1.2);
            }
        }
    }

    // 调整策略权重
    adjustStrategyWeights(type, multiplier) {
        const groupStrategies = ['surround_and_attack', 'coordinated_attack', 'formation_attack'];
        const individualStrategies = ['direct_assault', 'hit_and_run', 'ambush'];
        
        const targetStrategies = type === 'group' ? groupStrategies : individualStrategies;
        
        targetStrategies.forEach(strategyName => {
            if (this.strategyLibrary.basic[strategyName]) {
                this.strategyLibrary.basic[strategyName].effectiveness *= multiplier;
            }
            
            if (this.strategyLibrary.learned.has(strategyName)) {
                const strategy = this.strategyLibrary.learned.get(strategyName);
                strategy.effectiveness *= multiplier;
            }
        });
    }

    // 预测学习
    performPredictionLearning() {
        // 简化实现：基于历史数据预测玩家行为
        const predictions = this.generatePlayerBehaviorPredictions();
        
        // 验证之前的预测
        this.validatePreviousPredictions();
        
        // 存储新预测
        predictions.forEach(prediction => {
            this.learningModules.prediction.predictions.set(prediction.id, prediction);
        });
    }

    // 生成玩家行为预测
    generatePlayerBehaviorPredictions() {
        const predictions = [];
        const currentTime = Date.now();
        
        // 基于移动模式预测
        const movementPatterns = this.behaviorDatabase.playerPatterns.movement;
        const mostLikelyMovement = this.findMostFrequentPattern(movementPatterns.frequency);
        
        if (mostLikelyMovement) {
            predictions.push({
                id: `movement_${currentTime}`,
                type: 'movement',
                prediction: mostLikelyMovement,
                confidence: this.calculatePredictionConfidence(movementPatterns, mostLikelyMovement),
                timestamp: currentTime,
                validationTime: currentTime + 5000 // 5秒后验证
            });
        }
        
        return predictions;
    }

    // 计算预测置信度
    calculatePredictionConfidence(patterns, prediction) {
        const frequency = patterns.frequency.get(prediction) || 0;
        const totalFrequency = Array.from(patterns.frequency.values()).reduce((sum, f) => sum + f, 0);
        
        return totalFrequency > 0 ? frequency / totalFrequency : 0;
    }

    // 验证之前的预测
    validatePreviousPredictions() {
        const currentTime = Date.now();
        const predictions = this.learningModules.prediction.predictions;
        const validations = this.learningModules.prediction.validations;
        
        predictions.forEach((prediction, id) => {
            if (currentTime >= prediction.validationTime && !validations.has(id)) {
                const accuracy = this.validatePrediction(prediction);
                
                validations.set(id, {
                    predictionId: id,
                    accuracy: accuracy,
                    validatedAt: currentTime
                });
                
                // 更新预测模块准确率
                this.updatePredictionAccuracy(accuracy);
                
                // 清理已验证的预测
                predictions.delete(id);
            }
        });
    }

    // 验证预测
    validatePrediction(prediction) {
        // 简化实现：检查最近的行为是否匹配预测
        const recentPatterns = this.getRecentPlayerPatterns(prediction.type);
        
        if (recentPatterns.includes(prediction.prediction)) {
            return 1.0; // 完全正确
        } else {
            return 0.0; // 完全错误
        }
    }

    // 获取最近的玩家模式
    getRecentPlayerPatterns(type) {
        const patterns = this.behaviorDatabase.playerPatterns[type];
        if (!patterns || !patterns.patterns) return [];
        
        const recentPatterns = [];
        patterns.patterns.forEach((patternData, patternName) => {
            const recentData = patternData.filter(data => 
                Date.now() - data.timestamp < 5000
            );
            
            if (recentData.length > 0) {
                recentPatterns.push(patternName);
            }
        });
        
        return recentPatterns;
    }

    // 更新预测准确率
    updatePredictionAccuracy(accuracy) {
        const module = this.learningModules.prediction;
        
        // 使用指数移动平均更新准确率
        const alpha = 0.1;
        module.accuracy = module.accuracy * (1 - alpha) + accuracy * alpha;
    }

    // 应用学习结果
    applyLearning(enemies, gameState) {
        enemies.forEach(enemy => {
            // 应用学习到的策略
            this.applyLearnedStrategies(enemy, gameState);
            
            // 应用预测结果
            this.applyPredictions(enemy, gameState);
            
            // 应用适应性调整
            this.applyAdaptations(enemy, gameState);
        });
    }

    // 应用学习策略
    applyLearnedStrategies(enemy, gameState) {
        // 选择最适合的学习策略
        const bestStrategy = this.selectBestLearnedStrategy(enemy, gameState);
        
        if (bestStrategy && bestStrategy.confidence > this.confidenceThreshold) {
            enemy.learnedStrategy = bestStrategy.name;
            enemy.strategyConditions = bestStrategy.conditions;
            enemy.strategyActions = bestStrategy.actions;
            
            // 更新使用统计
            bestStrategy.usage++;
        }
    }

    // 选择最佳学习策略
    selectBestLearnedStrategy(enemy, gameState) {
        let bestStrategy = null;
        let bestScore = 0;
        
        this.strategyLibrary.learned.forEach(strategy => {
            const score = this.calculateStrategyScore(strategy, enemy, gameState);
            
            if (score > bestScore) {
                bestScore = score;
                bestStrategy = strategy;
            }
        });
        
        return bestStrategy;
    }

    // 计算策略分数
    calculateStrategyScore(strategy, enemy, gameState) {
        let score = strategy.effectiveness * strategy.confidence;
        
        // 根据条件匹配度调整分数
        const conditionMatch = this.evaluateStrategyConditions(strategy.conditions, enemy, gameState);
        score *= conditionMatch;
        
        // 根据最近成功率调整分数
        if (strategy.usage > 0) {
            const successRate = strategy.success / strategy.usage;
            score *= (0.5 + successRate * 0.5);
        }
        
        return score;
    }

    // 评估策略条件
    evaluateStrategyConditions(conditions, enemy, gameState) {
        let matchCount = 0;
        
        conditions.forEach(condition => {
            if (this.checkCondition(condition, enemy, gameState)) {
                matchCount++;
            }
        });
        
        return conditions.length > 0 ? matchCount / conditions.length : 0;
    }

    // 检查条件
    checkCondition(condition, enemy, gameState) {
        const player = gameState.player;
        
        switch (condition) {
            case 'close_range':
                return this.calculateDistance(enemy, player) < 100;
            case 'medium_range':
                const distance = this.calculateDistance(enemy, player);
                return distance >= 100 && distance < 200;
            case 'high_health':
                return enemy.health / enemy.maxHealth > 0.7;
            case 'low_health':
                return enemy.health / enemy.maxHealth < 0.3;
            case 'player_stationary':
                return Math.abs(player.vx || 0) + Math.abs(player.vy || 0) < 1;
            case 'player_fast_moving':
                return Math.abs(player.vx || 0) + Math.abs(player.vy || 0) > 5;
            default:
                return Math.random() < 0.5; // 未知条件随机判断
        }
    }

    // 应用预测
    applyPredictions(enemy, gameState) {
        const predictions = this.learningModules.prediction.predictions;
        
        predictions.forEach(prediction => {
            if (prediction.confidence > 0.7) {
                // 根据预测调整敌人行为
                this.adjustEnemyBehaviorBasedOnPrediction(enemy, prediction);
            }
        });
    }

    // 根据预测调整敌人行为
    adjustEnemyBehaviorBasedOnPrediction(enemy, prediction) {
        switch (prediction.type) {
            case 'movement':
                enemy.predictedPlayerMovement = prediction.prediction;
                break;
            case 'combat':
                enemy.predictedPlayerCombat = prediction.prediction;
                break;
        }
    }

    // 应用适应
    applyAdaptations(enemy, gameState) {
        const adaptations = this.learningModules.adaptiveLearning.adaptations;
        
        adaptations.forEach((adaptation, adaptationId) => {
            if (adaptation.active) {
                this.applyAdaptationToEnemy(enemy, adaptation);
            }
        });
    }

    // 对敌人应用适应
    applyAdaptationToEnemy(enemy, adaptation) {
        switch (adaptation.type) {
            case 'increased_aggression':
                enemy.aggressionMultiplier = (enemy.aggressionMultiplier || 1) * 1.2;
                break;
            case 'improved_accuracy':
                enemy.accuracyMultiplier = (enemy.accuracyMultiplier || 1) * 1.1;
                break;
            case 'enhanced_coordination':
                enemy.coordinationBonus = true;
                break;
        }
    }

    // 清理内存
    cleanupMemory() {
        const currentTime = Date.now();
        const maxAge = 300000; // 5分钟
        
        // 清理过期经验
        this.experienceMemory.forEach((experience, id) => {
            if (currentTime - experience.timestamp > maxAge) {
                this.experienceMemory.delete(id);
            }
        });
        
        // 清理过期预测
        const predictions = this.learningModules.prediction.predictions;
        predictions.forEach((prediction, id) => {
            if (currentTime - prediction.timestamp > maxAge) {
                predictions.delete(id);
            }
        });
        
        // 应用经验衰减
        this.applyExperienceDecay();
    }

    // 应用经验衰减
    applyExperienceDecay() {
        // 衰减策略效果
        this.behaviorDatabase.aiEffectiveness.strategies.forEach(data => {
            data.averageEffectiveness *= this.experienceDecayRate;
        });
        
        // 衰减模式频率
        Object.values(this.behaviorDatabase.playerPatterns).forEach(category => {
            category.frequency.forEach((frequency, pattern) => {
                category.frequency.set(pattern, frequency * this.experienceDecayRate);
            });
        });
    }

    // 辅助方法
    calculateDistance(obj1, obj2) {
        return Math.sqrt(
            Math.pow(obj1.x - obj2.x, 2) + 
            Math.pow(obj1.y - obj2.y, 2)
        );
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 获取学习统计
    getLearningStats() {
        return {
            experienceCount: this.experienceMemory.size,
            learnedStrategies: this.strategyLibrary.learned.size,
            strategyCombinations: this.strategyLibrary.combinations.size,
            predictionAccuracy: this.learningModules.prediction.accuracy,
            sessionId: this.sessionId,
            learningRate: this.learningRate,
            memoryUsage: `${this.experienceMemory.size}/${this.memoryCapacity}`,
            modules: Object.keys(this.learningModules).reduce((stats, moduleName) => {
                const module = this.learningModules[moduleName];
                stats[moduleName] = {
                    enabled: module.enabled,
                    dataCount: module.patterns?.size || module.strategies?.size || 0
                };
                return stats;
            }, {})
        };
    }

    // 设置学习参数
    setLearningRate(rate) {
        this.learningRate = Math.max(0.01, Math.min(1.0, rate));
    }

    setMemoryCapacity(capacity) {
        this.memoryCapacity = Math.max(100, capacity);
    }

    setConfidenceThreshold(threshold) {
        this.confidenceThreshold = Math.max(0.1, Math.min(1.0, threshold));
    }

    // 启用/禁用学习
    setLearningEnabled(enabled) {
        this.learningEnabled = enabled;
    }

    // 重置学习系统
    reset() {
        this.experienceMemory.clear();
        this.strategyLibrary.learned.clear();
        this.strategyLibrary.combinations.clear();
        
        Object.values(this.learningModules).forEach(module => {
            if (module.patterns) module.patterns.clear();
            if (module.strategies) module.strategies.clear();
            if (module.predictions) module.predictions.clear();
            if (module.validations) module.validations.clear();
            if (module.adaptations) module.adaptations.clear();
            if (module.history) module.history.length = 0;
        });
        
        this.behaviorDatabase = this.initializeBehaviorDatabase();
        this.sessionId = this.generateSessionId();
        
        console.log('Learning AI System reset');
    }

    // 设置调试模式
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    // 渲染调试信息
    renderDebugInfo(ctx, x = 10, y = 450) {
        if (!this.debugMode) return;
        
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, 350, 200);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        
        let currentY = y + 15;
        
        ctx.fillText('Learning AI System', x + 10, currentY);
        currentY += 15;
        
        const stats = this.getLearningStats();
        
        ctx.fillText(`Experiences: ${stats.experienceCount}`, x + 10, currentY);
        currentY += 12;
        
        ctx.fillText(`Learned Strategies: ${stats.learnedStrategies}`, x + 10, currentY);
        currentY += 12;
        
        ctx.fillText(`Prediction Accuracy: ${(stats.predictionAccuracy * 100).toFixed(1)}%`, x + 10, currentY);
        currentY += 12;
        
        ctx.fillText(`Memory Usage: ${stats.memoryUsage}`, x + 10, currentY);
        currentY += 12;
        
        ctx.fillText(`Learning Rate: ${this.learningRate}`, x + 10, currentY);
        currentY += 12;
        
        ctx.fillText(`Session: ${stats.sessionId.substr(-8)}`, x + 10, currentY);
        currentY += 12;
        
        // 显示模块状态
        Object.keys(stats.modules).forEach(moduleName => {
            const module = stats.modules[moduleName];
            const status = module.enabled ? '✓' : '✗';
            ctx.fillText(`${status} ${moduleName}: ${module.dataCount}`, x + 10, currentY);
            currentY += 12;
        });
        
        ctx.restore();
    }

    // 导出学习数据
    exportLearningData() {
        return {
            version: '1.0',
            timestamp: Date.now(),
            sessionId: this.sessionId,
            behaviorDatabase: {
                playerPatterns: this.serializePatterns(this.behaviorDatabase.playerPatterns),
                aiEffectiveness: this.serializeEffectiveness(this.behaviorDatabase.aiEffectiveness)
            },
            strategyLibrary: {
                learned: Array.from(this.strategyLibrary.learned.entries()),
                combinations: Array.from(this.strategyLibrary.combinations.entries())
            },
            learningModules: this.serializeLearningModules(),
            settings: {
                learningRate: this.learningRate,
                memoryCapacity: this.memoryCapacity,
                confidenceThreshold: this.confidenceThreshold,
                experienceDecayRate: this.experienceDecayRate
            }
        };
    }

    // 序列化模式数据
    serializePatterns(patterns) {
        const serialized = {};
        
        Object.keys(patterns).forEach(category => {
            serialized[category] = {
                frequency: Array.from(patterns[category].frequency.entries()),
                effectiveness: Array.from(patterns[category].effectiveness.entries())
            };
        });
        
        return serialized;
    }

    // 序列化效果数据
    serializeEffectiveness(effectiveness) {
        return {
            strategies: Array.from(effectiveness.strategies.entries()),
            formations: Array.from(effectiveness.formations.entries()),
            tactics: Array.from(effectiveness.tactics.entries()),
            responses: Array.from(effectiveness.responses.entries())
        };
    }

    // 序列化学习模块
    serializeLearningModules() {
        const serialized = {};
        
        Object.keys(this.learningModules).forEach(moduleName => {
            const module = this.learningModules[moduleName];
            serialized[moduleName] = {
                enabled: module.enabled,
                patterns: module.patterns ? Array.from(module.patterns.entries()) : [],
                strategies: module.strategies ? Array.from(module.strategies.entries()) : [],
                predictions: module.predictions ? Array.from(module.predictions.entries()) : [],
                validations: module.validations ? Array.from(module.validations.entries()) : [],
                adaptations: module.adaptations ? Array.from(module.adaptations.entries()) : [],
                history: module.history || [],
                accuracy: module.accuracy || 0
            };
        });
        
        return serialized;
    }

    // 导入学习数据
    importLearningData(data) {
        try {
            if (data.version !== '1.0') {
                console.warn('Learning data version mismatch');
                return false;
            }
            
            // 导入行为数据库
            if (data.behaviorDatabase) {
                this.deserializePatterns(data.behaviorDatabase.playerPatterns);
                this.deserializeEffectiveness(data.behaviorDatabase.aiEffectiveness);
            }
            
            // 导入策略库
            if (data.strategyLibrary) {
                this.strategyLibrary.learned = new Map(data.strategyLibrary.learned);
                this.strategyLibrary.combinations = new Map(data.strategyLibrary.combinations);
            }
            
            // 导入学习模块
            if (data.learningModules) {
                this.deserializeLearningModules(data.learningModules);
            }
            
            // 导入设置
            if (data.settings) {
                this.learningRate = data.settings.learningRate || this.learningRate;
                this.memoryCapacity = data.settings.memoryCapacity || this.memoryCapacity;
                this.confidenceThreshold = data.settings.confidenceThreshold || this.confidenceThreshold;
                this.experienceDecayRate = data.settings.experienceDecayRate || this.experienceDecayRate;
            }
            
            console.log('Learning data imported successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to import learning data:', error);
            return false;
        }
    }

    // 反序列化模式数据
    deserializePatterns(patternsData) {
        Object.keys(patternsData).forEach(category => {
            if (this.behaviorDatabase.playerPatterns[category]) {
                this.behaviorDatabase.playerPatterns[category].frequency = 
                    new Map(patternsData[category].frequency);
                this.behaviorDatabase.playerPatterns[category].effectiveness = 
                    new Map(patternsData[category].effectiveness);
            }
        });
    }

    // 反序列化效果数据
    deserializeEffectiveness(effectivenessData) {
        this.behaviorDatabase.aiEffectiveness.strategies = new Map(effectivenessData.strategies);
        this.behaviorDatabase.aiEffectiveness.formations = new Map(effectivenessData.formations);
        this.behaviorDatabase.aiEffectiveness.tactics = new Map(effectivenessData.tactics);
        this.behaviorDatabase.aiEffectiveness.responses = new Map(effectivenessData.responses);
    }

    // 反序列化学习模块
    deserializeLearningModules(modulesData) {
        Object.keys(modulesData).forEach(moduleName => {
            if (this.learningModules[moduleName]) {
                const moduleData = modulesData[moduleName];
                const module = this.learningModules[moduleName];
                
                module.enabled = moduleData.enabled;
                
                if (moduleData.patterns) {
                    module.patterns = new Map(moduleData.patterns);
                }
                
                if (moduleData.strategies) {
                    module.strategies = new Map(moduleData.strategies);
                }
                
                if (moduleData.predictions) {
                    module.predictions = new Map(moduleData.predictions);
                }
                
                if (moduleData.validations) {
                    module.validations = new Map(moduleData.validations);
                }
                
                if (moduleData.adaptations) {
                    module.adaptations = new Map(moduleData.adaptations);
                }
                
                if (moduleData.history) {
                    module.history = moduleData.history;
                }
                
                if (moduleData.accuracy !== undefined) {
                    module.accuracy = moduleData.accuracy;
                }
            }
        });
    }
}

// 导出学习型AI系统
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningAISystem;
} else if (typeof window !== 'undefined') {
    window.LearningAISystem = LearningAISystem;
}