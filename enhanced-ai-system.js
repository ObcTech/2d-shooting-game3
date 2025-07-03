/**
 * 增强的AI行为系统
 * 实现智能敌人AI、群体行为、动态难度调整和学习型AI
 */

class EnhancedAISystem {
    constructor() {
        this.aiProfiles = this.initializeAIProfiles();
        this.groupBehaviors = this.initializeGroupBehaviors();
        this.difficultyAdjuster = new DynamicDifficultyAdjuster();
        this.learningAI = new LearningAI();
        this.behaviorTrees = this.initializeBehaviorTrees();
        this.aiDebugMode = false;
    }

    // 初始化AI配置文件
    initializeAIProfiles() {
        return {
            // 基础AI类型
            aggressive: {
                name: '激进型',
                attackRange: 150,
                chaseRange: 200,
                retreatThreshold: 0.2,
                aggressionLevel: 0.9,
                teamworkLevel: 0.3,
                adaptability: 0.4
            },
            defensive: {
                name: '防御型',
                attackRange: 100,
                chaseRange: 120,
                retreatThreshold: 0.5,
                aggressionLevel: 0.3,
                teamworkLevel: 0.8,
                adaptability: 0.6
            },
            tactical: {
                name: '战术型',
                attackRange: 180,
                chaseRange: 250,
                retreatThreshold: 0.3,
                aggressionLevel: 0.6,
                teamworkLevel: 0.9,
                adaptability: 0.8
            },
            berserker: {
                name: '狂战士',
                attackRange: 80,
                chaseRange: 300,
                retreatThreshold: 0.1,
                aggressionLevel: 1.0,
                teamworkLevel: 0.1,
                adaptability: 0.2
            },
            sniper: {
                name: '狙击手',
                attackRange: 400,
                chaseRange: 450,
                retreatThreshold: 0.6,
                aggressionLevel: 0.7,
                teamworkLevel: 0.5,
                adaptability: 0.7
            },
            support: {
                name: '支援型',
                attackRange: 120,
                chaseRange: 180,
                retreatThreshold: 0.4,
                aggressionLevel: 0.4,
                teamworkLevel: 1.0,
                adaptability: 0.9
            }
        };
    }

    // 初始化群体行为
    initializeGroupBehaviors() {
        return {
            flocking: {
                name: '集群行为',
                cohesionWeight: 0.3,
                separationWeight: 0.5,
                alignmentWeight: 0.2,
                maxDistance: 100
            },
            formation: {
                name: '阵型行为',
                formations: {
                    line: { spacing: 50, angle: 0 },
                    circle: { radius: 80 },
                    wedge: { spacing: 40, angle: 30 },
                    diamond: { spacing: 60 }
                }
            },
            coordination: {
                name: '协调攻击',
                syncAttackRange: 150,
                flanking: true,
                crossfire: true
            }
        };
    }

    // 初始化行为树
    initializeBehaviorTrees() {
        return {
            basic: new BehaviorTree({
                type: 'selector',
                children: [
                    { type: 'condition', check: 'isPlayerInAttackRange', action: 'attack' },
                    { type: 'condition', check: 'isPlayerInChaseRange', action: 'chase' },
                    { type: 'action', name: 'patrol' }
                ]
            }),
            advanced: new BehaviorTree({
                type: 'selector',
                children: [
                    { type: 'condition', check: 'isLowHealth', action: 'retreat' },
                    { type: 'condition', check: 'hasAllies', action: 'coordinate' },
                    { type: 'condition', check: 'isPlayerInAttackRange', action: 'attack' },
                    { type: 'condition', check: 'isPlayerInChaseRange', action: 'chase' },
                    { type: 'action', name: 'patrol' }
                ]
            }),
            tactical: new BehaviorTree({
                type: 'selector',
                children: [
                    { type: 'condition', check: 'isLowHealth', action: 'tacticalRetreat' },
                    { type: 'condition', check: 'canFlank', action: 'flank' },
                    { type: 'condition', check: 'shouldSupport', action: 'support' },
                    { type: 'condition', check: 'isPlayerInAttackRange', action: 'tacticalAttack' },
                    { type: 'condition', check: 'isPlayerInChaseRange', action: 'tacticalChase' },
                    { type: 'action', name: 'tacticalPatrol' }
                ]
            })
        };
    }

    // 更新AI系统
    update(enemies, player, deltaTime) {
        // 更新动态难度
        this.difficultyAdjuster.update(player, enemies, deltaTime);
        
        // 更新学习AI
        this.learningAI.update(player, enemies, deltaTime);
        
        // 更新每个敌人的AI
        enemies.forEach(enemy => {
            this.updateEnemyAI(enemy, player, enemies, deltaTime);
        });
        
        // 更新群体行为
        this.updateGroupBehaviors(enemies, player, deltaTime);
    }

    // 更新单个敌人的AI
    updateEnemyAI(enemy, player, allEnemies, deltaTime) {
        if (!enemy.aiProfile) {
            enemy.aiProfile = this.assignAIProfile(enemy);
        }
        
        const profile = this.aiProfiles[enemy.aiProfile];
        const behaviorTree = this.behaviorTrees[enemy.behaviorTreeType || 'basic'];
        
        // 执行行为树
        const action = behaviorTree.execute(enemy, player, allEnemies);
        
        // 根据AI配置文件调整行为
        this.executeAction(enemy, action, player, allEnemies, profile, deltaTime);
        
        // 学习和适应
        if (profile.adaptability > 0.5) {
            this.learningAI.adaptBehavior(enemy, player, deltaTime);
        }
    }

    // 分配AI配置文件
    assignAIProfile(enemy) {
        const profiles = Object.keys(this.aiProfiles);
        
        // 根据敌人类型分配合适的AI配置
        switch (enemy.type) {
            case 'infantry': return 'aggressive';
            case 'scout': return 'tactical';
            case 'heavy': return 'defensive';
            case 'sniper': return 'sniper';
            case 'demolition': return 'berserker';
            case 'medic': return 'support';
            case 'assassin': return 'tactical';
            case 'elite_guard': return 'defensive';
            case 'boss_minion': return 'aggressive';
            default: return profiles[Math.floor(Math.random() * profiles.length)];
        }
    }

    // 执行AI行动
    executeAction(enemy, action, player, allEnemies, profile, deltaTime) {
        const distanceToPlayer = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        
        switch (action) {
            case 'attack':
                this.executeAttack(enemy, player, profile, deltaTime);
                break;
            case 'chase':
                this.executeChase(enemy, player, profile, deltaTime);
                break;
            case 'retreat':
                this.executeRetreat(enemy, player, profile, deltaTime);
                break;
            case 'patrol':
                this.executePatrol(enemy, profile, deltaTime);
                break;
            case 'coordinate':
                this.executeCoordination(enemy, player, allEnemies, profile, deltaTime);
                break;
            case 'flank':
                this.executeFlank(enemy, player, allEnemies, profile, deltaTime);
                break;
            case 'support':
                this.executeSupport(enemy, allEnemies, profile, deltaTime);
                break;
            case 'tacticalAttack':
                this.executeTacticalAttack(enemy, player, allEnemies, profile, deltaTime);
                break;
            case 'tacticalChase':
                this.executeTacticalChase(enemy, player, allEnemies, profile, deltaTime);
                break;
            case 'tacticalRetreat':
                this.executeTacticalRetreat(enemy, player, allEnemies, profile, deltaTime);
                break;
            case 'tacticalPatrol':
                this.executeTacticalPatrol(enemy, allEnemies, profile, deltaTime);
                break;
        }
    }

    // 执行攻击行为
    executeAttack(enemy, player, profile, deltaTime) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        
        // 攻击行为：快速移向玩家
        const distance = Math.sqrt(
            Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
        );
        
        if (distance > enemy.radius + 5) {
            // 根据激进程度调整攻击速度
            const attackSpeed = enemy.speed * (1 + profile.aggressionLevel * 0.5);
            enemy.vx = Math.cos(angle) * attackSpeed;
            enemy.vy = Math.sin(angle) * attackSpeed;
            
            // 更新位置
            enemy.x += enemy.vx * (deltaTime / 16);
            enemy.y += enemy.vy * (deltaTime / 16);
        }
        
        // 设置动画状态
        enemy.animationState = 'attacking';
        enemy.facingAngle = angle;
    }

    // 执行追击行为
    executeChase(enemy, player, profile, deltaTime) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        const speed = enemy.speed * profile.aggressionLevel;
        
        enemy.vx = Math.cos(angle) * speed;
        enemy.vy = Math.sin(angle) * speed;
        
        enemy.animationState = 'running';
        enemy.facingAngle = angle;
    }

    // 执行撤退行为
    executeRetreat(enemy, player, profile, deltaTime) {
        const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        const speed = enemy.speed * 1.2; // 撤退时稍快
        
        enemy.vx = Math.cos(angle) * speed;
        enemy.vy = Math.sin(angle) * speed;
        
        enemy.animationState = 'running';
        enemy.facingAngle = angle;
    }

    // 执行巡逻行为
    executePatrol(enemy, profile, deltaTime) {
        if (!enemy.patrolTarget) {
            enemy.patrolTarget = {
                x: enemy.x + (Math.random() - 0.5) * 200,
                y: enemy.y + (Math.random() - 0.5) * 200
            };
        }
        
        const dx = enemy.patrolTarget.x - enemy.x;
        const dy = enemy.patrolTarget.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) {
            enemy.patrolTarget = null;
        } else {
            const angle = Math.atan2(dy, dx);
            const speed = enemy.speed * 0.5;
            
            enemy.vx = Math.cos(angle) * speed;
            enemy.vy = Math.sin(angle) * speed;
        }
        
        enemy.animationState = 'walking';
    }

    // 执行协调行为
    executeCoordination(enemy, player, allEnemies, profile, deltaTime) {
        const nearbyAllies = allEnemies.filter(other => 
            other !== enemy && 
            Math.sqrt(Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2)) < 150
        );
        
        if (nearbyAllies.length > 0) {
            // 协调攻击
            const shouldAttack = nearbyAllies.some(ally => ally.animationState === 'attacking');
            if (shouldAttack) {
                this.executeAttack(enemy, player, profile, deltaTime);
            } else {
                this.executeChase(enemy, player, profile, deltaTime);
            }
        } else {
            this.executeChase(enemy, player, profile, deltaTime);
        }
    }

    // 执行侧翼攻击
    executeFlank(enemy, player, allEnemies, profile, deltaTime) {
        const playerAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        const flankAngle = playerAngle + (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2);
        
        const targetX = player.x + Math.cos(flankAngle) * 100;
        const targetY = player.y + Math.sin(flankAngle) * 100;
        
        const angle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
        const speed = enemy.speed * 1.1;
        
        enemy.vx = Math.cos(angle) * speed;
        enemy.vy = Math.sin(angle) * speed;
        
        enemy.animationState = 'running';
        enemy.facingAngle = angle;
    }

    // 执行支援行为
    executeSupport(enemy, allEnemies, profile, deltaTime) {
        const injuredAllies = allEnemies.filter(other => 
            other !== enemy && 
            other.health < other.maxHealth * 0.5 &&
            Math.sqrt(Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2)) < 200
        );
        
        if (injuredAllies.length > 0) {
            const target = injuredAllies[0];
            const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
            const speed = enemy.speed;
            
            enemy.vx = Math.cos(angle) * speed;
            enemy.vy = Math.sin(angle) * speed;
            
            // 如果足够接近，提供治疗
            const distance = Math.sqrt(Math.pow(target.x - enemy.x, 2) + Math.pow(target.y - enemy.y, 2));
            if (distance < 50 && (!enemy.healCooldown || enemy.healCooldown <= 0)) {
                target.health = Math.min(target.maxHealth, target.health + 10);
                enemy.healCooldown = 2000; // 2秒冷却
                enemy.animationState = 'healing';
            } else {
                enemy.animationState = 'running';
            }
            
            if (enemy.healCooldown > 0) {
                enemy.healCooldown -= deltaTime;
            }
        } else {
            this.executePatrol(enemy, profile, deltaTime);
        }
    }

    // 执行战术攻击
    executeTacticalAttack(enemy, player, allEnemies, profile, deltaTime) {
        // 考虑掩护和最佳攻击位置
        const optimalPosition = this.findOptimalAttackPosition(enemy, player, allEnemies);
        
        if (optimalPosition) {
            const angle = Math.atan2(optimalPosition.y - enemy.y, optimalPosition.x - enemy.x);
            const distance = Math.sqrt(Math.pow(optimalPosition.x - enemy.x, 2) + Math.pow(optimalPosition.y - enemy.y, 2));
            
            if (distance > 20) {
                const speed = enemy.speed;
                enemy.vx = Math.cos(angle) * speed;
                enemy.vy = Math.sin(angle) * speed;
                enemy.animationState = 'running';
            } else {
                this.executeAttack(enemy, player, profile, deltaTime);
            }
        } else {
            this.executeAttack(enemy, player, profile, deltaTime);
        }
    }

    // 执行战术追击
    executeTacticalChase(enemy, player, allEnemies, profile, deltaTime) {
        // 预测玩家移动
        const predictedPosition = this.predictPlayerPosition(player, 1000); // 预测1秒后位置
        
        const angle = Math.atan2(predictedPosition.y - enemy.y, predictedPosition.x - enemy.x);
        const speed = enemy.speed * profile.aggressionLevel;
        
        enemy.vx = Math.cos(angle) * speed;
        enemy.vy = Math.sin(angle) * speed;
        
        enemy.animationState = 'running';
        enemy.facingAngle = angle;
    }

    // 执行战术撤退
    executeTacticalRetreat(enemy, player, allEnemies, profile, deltaTime) {
        const coverPosition = this.findNearestCover(enemy, player, allEnemies);
        
        if (coverPosition) {
            const angle = Math.atan2(coverPosition.y - enemy.y, coverPosition.x - enemy.x);
            const speed = enemy.speed * 1.3;
            
            enemy.vx = Math.cos(angle) * speed;
            enemy.vy = Math.sin(angle) * speed;
        } else {
            this.executeRetreat(enemy, player, profile, deltaTime);
        }
        
        enemy.animationState = 'running';
    }

    // 执行战术巡逻
    executeTacticalPatrol(enemy, allEnemies, profile, deltaTime) {
        // 保持与队友的战术距离
        const nearbyAllies = allEnemies.filter(other => 
            other !== enemy && 
            Math.sqrt(Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2)) < 100
        );
        
        if (nearbyAllies.length > 2) {
            // 分散
            const avgX = nearbyAllies.reduce((sum, ally) => sum + ally.x, 0) / nearbyAllies.length;
            const avgY = nearbyAllies.reduce((sum, ally) => sum + ally.y, 0) / nearbyAllies.length;
            
            const angle = Math.atan2(enemy.y - avgY, enemy.x - avgX);
            const speed = enemy.speed * 0.7;
            
            enemy.vx = Math.cos(angle) * speed;
            enemy.vy = Math.sin(angle) * speed;
        } else {
            this.executePatrol(enemy, profile, deltaTime);
        }
    }

    // 更新群体行为
    updateGroupBehaviors(enemies, player, deltaTime) {
        // 集群行为
        this.updateFlocking(enemies, deltaTime);
        
        // 阵型行为
        this.updateFormations(enemies, player, deltaTime);
        
        // 协调攻击
        this.updateCoordination(enemies, player, deltaTime);
    }

    // 更新集群行为
    updateFlocking(enemies, deltaTime) {
        const flocking = this.groupBehaviors.flocking;
        
        enemies.forEach(enemy => {
            if (enemy.aiProfile && this.aiProfiles[enemy.aiProfile].teamworkLevel > 0.5) {
                const neighbors = enemies.filter(other => 
                    other !== enemy && 
                    Math.sqrt(Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2)) < flocking.maxDistance
                );
                
                if (neighbors.length > 0) {
                    const cohesion = this.calculateCohesion(enemy, neighbors);
                    const separation = this.calculateSeparation(enemy, neighbors);
                    const alignment = this.calculateAlignment(enemy, neighbors);
                    
                    enemy.vx += cohesion.x * flocking.cohesionWeight;
                    enemy.vy += cohesion.y * flocking.cohesionWeight;
                    enemy.vx += separation.x * flocking.separationWeight;
                    enemy.vy += separation.y * flocking.separationWeight;
                    enemy.vx += alignment.x * flocking.alignmentWeight;
                    enemy.vy += alignment.y * flocking.alignmentWeight;
                }
            }
        });
    }

    // 计算聚合力
    calculateCohesion(enemy, neighbors) {
        const avgX = neighbors.reduce((sum, neighbor) => sum + neighbor.x, 0) / neighbors.length;
        const avgY = neighbors.reduce((sum, neighbor) => sum + neighbor.y, 0) / neighbors.length;
        
        return {
            x: (avgX - enemy.x) * 0.01,
            y: (avgY - enemy.y) * 0.01
        };
    }

    // 计算分离力
    calculateSeparation(enemy, neighbors) {
        let separationX = 0;
        let separationY = 0;
        
        neighbors.forEach(neighbor => {
            const dx = enemy.x - neighbor.x;
            const dy = enemy.y - neighbor.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < 50) {
                separationX += dx / distance;
                separationY += dy / distance;
            }
        });
        
        return {
            x: separationX * 0.02,
            y: separationY * 0.02
        };
    }

    // 计算对齐力
    calculateAlignment(enemy, neighbors) {
        const avgVx = neighbors.reduce((sum, neighbor) => sum + (neighbor.vx || 0), 0) / neighbors.length;
        const avgVy = neighbors.reduce((sum, neighbor) => sum + (neighbor.vy || 0), 0) / neighbors.length;
        
        return {
            x: (avgVx - (enemy.vx || 0)) * 0.01,
            y: (avgVy - (enemy.vy || 0)) * 0.01
        };
    }

    // 更新阵型
    updateFormations(enemies, player, deltaTime) {
        // 根据敌人数量和类型选择合适的阵型
        const tacticalEnemies = enemies.filter(enemy => 
            enemy.aiProfile && this.aiProfiles[enemy.aiProfile].teamworkLevel > 0.7
        );
        
        if (tacticalEnemies.length >= 3) {
            this.formWedgeFormation(tacticalEnemies, player);
        }
    }

    // 形成楔形阵型
    formWedgeFormation(enemies, player) {
        if (enemies.length < 3) return;
        
        const leader = enemies[0];
        const angle = Math.atan2(player.y - leader.y, player.x - leader.x);
        
        enemies.forEach((enemy, index) => {
            if (index === 0) return; // 领导者不需要调整
            
            const side = index % 2 === 1 ? 1 : -1;
            const row = Math.floor((index - 1) / 2) + 1;
            
            const targetX = leader.x - Math.cos(angle) * row * 40 + Math.cos(angle + Math.PI/2) * side * 30;
            const targetY = leader.y - Math.sin(angle) * row * 40 + Math.sin(angle + Math.PI/2) * side * 30;
            
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 20) {
                const formationAngle = Math.atan2(dy, dx);
                enemy.vx += Math.cos(formationAngle) * 0.5;
                enemy.vy += Math.sin(formationAngle) * 0.5;
            }
        });
    }

    // 更新协调攻击
    updateCoordination(enemies, player, deltaTime) {
        const coordination = this.groupBehaviors.coordination;
        
        // 寻找可以协调攻击的敌人组
        const attackGroups = this.findAttackGroups(enemies, player, coordination.syncAttackRange);
        
        attackGroups.forEach(group => {
            if (group.length >= 2) {
                this.coordinateGroupAttack(group, player, deltaTime);
            }
        });
    }

    // 寻找攻击组
    findAttackGroups(enemies, player, range) {
        const groups = [];
        const processed = new Set();
        
        enemies.forEach(enemy => {
            if (processed.has(enemy)) return;
            
            const distanceToPlayer = Math.sqrt(
                Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
            );
            
            if (distanceToPlayer <= range) {
                const group = [enemy];
                processed.add(enemy);
                
                enemies.forEach(other => {
                    if (other !== enemy && !processed.has(other)) {
                        const distanceToOther = Math.sqrt(
                            Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2)
                        );
                        const distanceOtherToPlayer = Math.sqrt(
                            Math.pow(other.x - player.x, 2) + Math.pow(other.y - player.y, 2)
                        );
                        
                        if (distanceToOther <= 100 && distanceOtherToPlayer <= range) {
                            group.push(other);
                            processed.add(other);
                        }
                    }
                });
                
                if (group.length >= 2) {
                    groups.push(group);
                }
            }
        });
        
        return groups;
    }

    // 协调组攻击
    coordinateGroupAttack(group, player, deltaTime) {
        // 同步攻击时机
        const readyToAttack = group.every(enemy => 
            !enemy.attackCooldown || enemy.attackCooldown <= 100
        );
        
        if (readyToAttack) {
            group.forEach(enemy => {
                enemy.coordinatedAttack = true;
                enemy.attackCooldown = 0;
            });
        } else {
            // 等待同步
            group.forEach(enemy => {
                if (!enemy.attackCooldown || enemy.attackCooldown <= 100) {
                    enemy.attackCooldown = 100; // 短暂等待
                }
            });
        }
    }

    // 辅助方法
    findOptimalAttackPosition(enemy, player, allEnemies) {
        // 寻找最佳攻击位置（考虑掩护、距离等因素）
        const candidates = [];
        const range = 100;
        
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const x = player.x + Math.cos(angle) * range;
            const y = player.y + Math.sin(angle) * range;
            
            const score = this.evaluatePosition(x, y, enemy, player, allEnemies);
            candidates.push({ x, y, score });
        }
        
        candidates.sort((a, b) => b.score - a.score);
        return candidates[0].score > 0 ? candidates[0] : null;
    }

    evaluatePosition(x, y, enemy, player, allEnemies) {
        let score = 0;
        
        // 距离玩家的距离评分
        const distanceToPlayer = Math.sqrt(Math.pow(x - player.x, 2) + Math.pow(y - player.y, 2));
        score += Math.max(0, 100 - distanceToPlayer) / 100;
        
        // 避免与其他敌人重叠
        allEnemies.forEach(other => {
            if (other !== enemy) {
                const distance = Math.sqrt(Math.pow(x - other.x, 2) + Math.pow(y - other.y, 2));
                if (distance < 50) {
                    score -= 0.5;
                }
            }
        });
        
        return score;
    }

    predictPlayerPosition(player, timeMs) {
        // 简单的线性预测
        return {
            x: player.x + (player.vx || 0) * (timeMs / 1000),
            y: player.y + (player.vy || 0) * (timeMs / 1000)
        };
    }

    findNearestCover(enemy, player, allEnemies) {
        // 寻找最近的掩护点（简化实现）
        const coverPoints = [];
        
        // 使用其他敌人作为掩护
        allEnemies.forEach(other => {
            if (other !== enemy) {
                const angle = Math.atan2(other.y - player.y, other.x - player.x);
                const coverX = other.x + Math.cos(angle) * 30;
                const coverY = other.y + Math.sin(angle) * 30;
                
                const distance = Math.sqrt(Math.pow(coverX - enemy.x, 2) + Math.pow(coverY - enemy.y, 2));
                coverPoints.push({ x: coverX, y: coverY, distance });
            }
        });
        
        coverPoints.sort((a, b) => a.distance - b.distance);
        return coverPoints.length > 0 ? coverPoints[0] : null;
    }

    // 调试和可视化
    renderDebugInfo(ctx, enemies, player) {
        if (!this.aiDebugMode) return;
        
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        
        enemies.forEach(enemy => {
            if (!enemy.aiProfile) return;
            
            const profile = this.aiProfiles[enemy.aiProfile];
            
            // 绘制攻击范围
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, profile.attackRange, 0, Math.PI * 2);
            ctx.stroke();
            
            // 绘制追击范围
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, profile.chaseRange, 0, Math.PI * 2);
            ctx.stroke();
            
            // 绘制AI状态信息
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(`${profile.name}`, enemy.x - 20, enemy.y - 30);
            ctx.fillText(`${enemy.animationState || 'idle'}`, enemy.x - 20, enemy.y - 20);
            
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        });
        
        ctx.restore();
    }

    // 设置调试模式
    setDebugMode(enabled) {
        this.aiDebugMode = enabled;
    }

    // 获取AI统计信息
    getAIStats(enemies) {
        const stats = {
            totalEnemies: enemies.length,
            aiProfiles: {},
            behaviorStates: {},
            averageTeamwork: 0
        };
        
        let totalTeamwork = 0;
        
        enemies.forEach(enemy => {
            if (enemy.aiProfile) {
                stats.aiProfiles[enemy.aiProfile] = (stats.aiProfiles[enemy.aiProfile] || 0) + 1;
                totalTeamwork += this.aiProfiles[enemy.aiProfile].teamworkLevel;
            }
            
            if (enemy.animationState) {
                stats.behaviorStates[enemy.animationState] = (stats.behaviorStates[enemy.animationState] || 0) + 1;
            }
        });
        
        stats.averageTeamwork = enemies.length > 0 ? totalTeamwork / enemies.length : 0;
        
        return stats;
    }
}

// 行为树节点类
class BehaviorTree {
    constructor(config) {
        this.root = config;
    }

    execute(enemy, player, allEnemies) {
        return this.executeNode(this.root, enemy, player, allEnemies);
    }

    executeNode(node, enemy, player, allEnemies) {
        switch (node.type) {
            case 'selector':
                for (const child of node.children) {
                    const result = this.executeNode(child, enemy, player, allEnemies);
                    if (result) return result;
                }
                return null;
                
            case 'sequence':
                for (const child of node.children) {
                    const result = this.executeNode(child, enemy, player, allEnemies);
                    if (!result) return null;
                }
                return node.children[node.children.length - 1].action;
                
            case 'condition':
                if (this.checkCondition(node.check, enemy, player, allEnemies)) {
                    return node.action;
                }
                return null;
                
            case 'action':
                return node.name;
                
            default:
                return null;
        }
    }

    checkCondition(condition, enemy, player, allEnemies) {
        const distance = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        
        switch (condition) {
            case 'isPlayerInAttackRange':
                const attackRange = enemy.aiProfile ? 
                    window.enhancedAISystem?.aiProfiles[enemy.aiProfile]?.attackRange || 100 : 100;
                return distance <= attackRange;
                
            case 'isPlayerInChaseRange':
                const chaseRange = enemy.aiProfile ? 
                    window.enhancedAISystem?.aiProfiles[enemy.aiProfile]?.chaseRange || 150 : 150;
                return distance <= chaseRange;
                
            case 'isLowHealth':
                const threshold = enemy.aiProfile ? 
                    window.enhancedAISystem?.aiProfiles[enemy.aiProfile]?.retreatThreshold || 0.3 : 0.3;
                return (enemy.health / enemy.maxHealth) <= threshold;
                
            case 'hasAllies':
                return allEnemies.filter(other => 
                    other !== enemy && 
                    Math.sqrt(Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2)) < 150
                ).length > 0;
                
            case 'canFlank':
                return allEnemies.filter(other => 
                    other !== enemy && 
                    Math.sqrt(Math.pow(other.x - player.x, 2) + Math.pow(other.y - player.y, 2)) < 200
                ).length >= 2;
                
            case 'shouldSupport':
                return allEnemies.some(other => 
                    other !== enemy && 
                    other.health < other.maxHealth * 0.5 &&
                    Math.sqrt(Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2)) < 200
                );
                
            default:
                return false;
        }
    }
}

// 动态难度调整器
class DynamicDifficultyAdjuster {
    constructor() {
        this.playerPerformance = {
            accuracy: 0,
            survivalTime: 0,
            killRate: 0,
            damageReceived: 0
        };
        this.difficultyLevel = 1.0;
        this.adjustmentInterval = 10000; // 10秒调整一次
        this.lastAdjustment = 0;
    }

    update(player, enemies, deltaTime) {
        this.updatePlayerPerformance(player, enemies, deltaTime);
        
        if (Date.now() - this.lastAdjustment > this.adjustmentInterval) {
            this.adjustDifficulty();
            this.lastAdjustment = Date.now();
        }
    }

    updatePlayerPerformance(player, enemies, deltaTime) {
        // 更新玩家表现数据
        this.playerPerformance.survivalTime += deltaTime;
        
        // 这里需要从游戏系统获取更多数据
        // 简化实现
    }

    adjustDifficulty() {
        const performance = this.calculatePerformanceScore();
        
        if (performance > 0.8) {
            this.difficultyLevel = Math.min(2.0, this.difficultyLevel + 0.1);
        } else if (performance < 0.4) {
            this.difficultyLevel = Math.max(0.5, this.difficultyLevel - 0.1);
        }
        
        console.log(`Difficulty adjusted to: ${this.difficultyLevel.toFixed(2)}`);
    }

    calculatePerformanceScore() {
        // 简化的性能评分
        return Math.random(); // 实际实现需要基于真实数据
    }

    getDifficultyMultiplier() {
        return this.difficultyLevel;
    }
}

// 学习型AI
class LearningAI {
    constructor() {
        this.playerBehaviorPattern = {
            movementPatterns: [],
            attackPatterns: [],
            preferredPositions: []
        };
        this.adaptations = new Map();
    }

    update(player, enemies, deltaTime) {
        this.analyzePlayerBehavior(player, deltaTime);
        this.updateAdaptations(enemies, deltaTime);
    }

    analyzePlayerBehavior(player, deltaTime) {
        // 分析玩家行为模式
        // 简化实现
    }

    adaptBehavior(enemy, player, deltaTime) {
        // 根据学习到的模式调整AI行为
        // 简化实现
    }

    updateAdaptations(enemies, deltaTime) {
        // 更新AI适应性
        // 简化实现
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.EnhancedAISystem = EnhancedAISystem;
    window.BehaviorTree = BehaviorTree;
    window.DynamicDifficultyAdjuster = DynamicDifficultyAdjuster;
    window.LearningAI = LearningAI;
}