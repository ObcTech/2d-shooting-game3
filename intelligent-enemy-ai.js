/**
 * 智能敌人AI系统
 * 实现高级AI决策、状态机、路径规划和战术行为
 */

class IntelligentEnemyAI {
    constructor() {
        this.aiStates = this.initializeAIStates();
        this.pathfinder = new PathfindingSystem();
        this.tacticalAnalyzer = new TacticalAnalyzer();
        this.decisionMaker = new DecisionMaker();
        this.memorySystem = new AIMemorySystem();
        this.communicationSystem = new AICommunicationSystem();
    }

    // 初始化AI状态
    initializeAIStates() {
        return {
            IDLE: {
                name: '待机',
                priority: 1,
                transitions: ['PATROL', 'ALERT', 'INVESTIGATE']
            },
            PATROL: {
                name: '巡逻',
                priority: 2,
                transitions: ['IDLE', 'ALERT', 'INVESTIGATE', 'CHASE']
            },
            ALERT: {
                name: '警戒',
                priority: 3,
                transitions: ['PATROL', 'INVESTIGATE', 'CHASE', 'COMBAT']
            },
            INVESTIGATE: {
                name: '调查',
                priority: 4,
                transitions: ['PATROL', 'ALERT', 'CHASE', 'COMBAT']
            },
            CHASE: {
                name: '追击',
                priority: 5,
                transitions: ['COMBAT', 'SEARCH', 'PATROL']
            },
            COMBAT: {
                name: '战斗',
                priority: 6,
                transitions: ['CHASE', 'RETREAT', 'FLANK', 'COVER']
            },
            RETREAT: {
                name: '撤退',
                priority: 4,
                transitions: ['COVER', 'REGROUP', 'PATROL']
            },
            FLANK: {
                name: '侧翼',
                priority: 5,
                transitions: ['COMBAT', 'CHASE', 'COVER']
            },
            COVER: {
                name: '掩护',
                priority: 4,
                transitions: ['COMBAT', 'RETREAT', 'REGROUP']
            },
            SEARCH: {
                name: '搜索',
                priority: 3,
                transitions: ['PATROL', 'CHASE', 'INVESTIGATE']
            },
            REGROUP: {
                name: '重组',
                priority: 3,
                transitions: ['PATROL', 'COMBAT', 'COVER']
            },
            SUPPORT: {
                name: '支援',
                priority: 4,
                transitions: ['COMBAT', 'COVER', 'RETREAT']
            }
        };
    }

    // 更新AI系统
    update(enemies, player, obstacles, deltaTime) {
        enemies.forEach(enemy => {
            this.updateEnemyAI(enemy, player, enemies, obstacles, deltaTime);
        });
        
        // 更新通信系统
        this.communicationSystem.update(enemies, deltaTime);
    }

    // 更新单个敌人AI
    updateEnemyAI(enemy, player, allEnemies, obstacles, deltaTime) {
        // 初始化AI状态和数据（必须在感知更新之前）
        if (!enemy.aiState || !enemy.aiData) {
            enemy.aiState = 'IDLE';
            enemy.aiData = {
                lastKnownPlayerPosition: null,
                patrolPoints: this.generatePatrolPoints(enemy),
                currentPatrolIndex: 0,
                alertLevel: 0,
                lastPlayerSighting: 0,
                memory: new Map(),
                communicationRange: 200,
                reactionTime: 500 + Math.random() * 500
            };
        }

        // 更新感知系统
        this.updatePerception(enemy, player, allEnemies, deltaTime);
        
        // 更新记忆系统
        this.memorySystem.update(enemy, player, deltaTime);
        
        // 决策制定
        const newState = this.decisionMaker.makeDecision(enemy, player, allEnemies, obstacles);
        
        // 状态转换
        if (newState !== enemy.aiState) {
            this.transitionState(enemy, newState);
        }
        
        // 执行当前状态行为
        this.executeState(enemy, player, allEnemies, obstacles, deltaTime);
        
        // 更新路径规划
        this.pathfinder.update(enemy, deltaTime);
    }

    // 更新感知系统
    updatePerception(enemy, player, allEnemies, deltaTime) {
        const distance = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        
        // 视觉感知
        const canSeePlayer = this.canSeeTarget(enemy, player, distance);
        
        if (canSeePlayer) {
            enemy.aiData.lastKnownPlayerPosition = { x: player.x, y: player.y };
            enemy.aiData.lastPlayerSighting = Date.now();
            enemy.aiData.alertLevel = Math.min(1.0, enemy.aiData.alertLevel + deltaTime / 1000);
            
            // 通知附近的敌人
            this.communicationSystem.broadcastPlayerSighting(enemy, player, allEnemies);
        } else {
            // 警戒度逐渐降低
            enemy.aiData.alertLevel = Math.max(0, enemy.aiData.alertLevel - deltaTime / 3000);
        }
        
        // 听觉感知
        this.updateAuditoryPerception(enemy, player, deltaTime);
        
        // 触觉感知（受到攻击）
        if (enemy.lastDamageTime && Date.now() - enemy.lastDamageTime < 2000) {
            enemy.aiData.alertLevel = 1.0;
            enemy.aiData.lastKnownPlayerPosition = { x: player.x, y: player.y };
        }
    }

    // 视觉检测
    canSeeTarget(enemy, target, distance) {
        // 视觉范围检查
        const visionRange = this.getVisionRange(enemy);
        if (distance > visionRange) return false;
        
        // 视野角度检查
        const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
        const facingAngle = enemy.facingAngle || 0;
        const visionAngle = Math.PI / 3; // 60度视野
        
        const angleDiff = Math.abs(angle - facingAngle);
        if (angleDiff > visionAngle && angleDiff < Math.PI * 2 - visionAngle) {
            return false;
        }
        
        // 障碍物遮挡检查（简化）
        return !this.isLineBlocked(enemy, target);
    }

    // 获取视觉范围
    getVisionRange(enemy) {
        let baseRange = 150;
        
        // 根据敌人类型调整
        switch (enemy.type) {
            case 'sniper': baseRange = 300; break;
            case 'scout': baseRange = 200; break;
            case 'heavy': baseRange = 100; break;
            default: baseRange = 150;
        }
        
        // 根据警戒级别调整 (添加安全检查)
        const alertLevel = (enemy.aiData && enemy.aiData.alertLevel !== undefined) ? enemy.aiData.alertLevel : 0;
        return baseRange * (0.7 + 0.3 * alertLevel);
    }

    // 检查视线是否被阻挡
    isLineBlocked(from, to) {
        // 简化的视线检查
        // 实际实现需要考虑障碍物
        return false;
    }

    // 更新听觉感知
    updateAuditoryPerception(enemy, player, deltaTime) {
        const distance = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        
        // 玩家移动声音
        if (player.isMoving && distance < 100) {
            enemy.aiData.alertLevel = Math.min(1.0, enemy.aiData.alertLevel + 0.1);
        }
        
        // 武器射击声音
        if (player.isShooting && distance < 200) {
            enemy.aiData.alertLevel = Math.min(1.0, enemy.aiData.alertLevel + 0.3);
            enemy.aiData.lastKnownPlayerPosition = { x: player.x, y: player.y };
        }
    }

    // 状态转换
    transitionState(enemy, newState) {
        const currentState = this.aiStates[enemy.aiState];
        const targetState = this.aiStates[newState];
        
        // 安全检查：确保当前状态和目标状态都存在
        if (!currentState) {
            console.warn(`Invalid current state: ${enemy.aiState} for enemy ${enemy.id}. Resetting to IDLE.`);
            enemy.aiState = 'IDLE';
            return;
        }
        
        if (!targetState) {
            console.warn(`Invalid target state: ${newState} for enemy ${enemy.id}`);
            return;
        }
        
        // 检查是否允许转换
        if (currentState.transitions.includes(newState)) {
            console.log(`Enemy ${enemy.id} transitioning from ${enemy.aiState} to ${newState}`);
            
            // 退出当前状态
            this.exitState(enemy, enemy.aiState);
            
            // 进入新状态
            enemy.aiState = newState;
            this.enterState(enemy, newState);
        }
    }

    // 进入状态
    enterState(enemy, state) {
        switch (state) {
            case 'PATROL':
                if (!enemy.aiData.patrolPoints || enemy.aiData.patrolPoints.length === 0) {
                    enemy.aiData.patrolPoints = this.generatePatrolPoints(enemy);
                }
                break;
                
            case 'COMBAT':
                enemy.aiData.combatStartTime = Date.now();
                break;
                
            case 'RETREAT':
                enemy.aiData.retreatTarget = this.findRetreatPosition(enemy);
                break;
                
            case 'SEARCH':
                enemy.aiData.searchPoints = this.generateSearchPoints(enemy);
                enemy.aiData.currentSearchIndex = 0;
                break;
        }
    }

    // 退出状态
    exitState(enemy, state) {
        switch (state) {
            case 'COMBAT':
                enemy.aiData.lastCombatTime = Date.now();
                break;
        }
    }

    // 执行状态行为
    executeState(enemy, player, allEnemies, obstacles, deltaTime) {
        switch (enemy.aiState) {
            case 'IDLE':
                this.executeIdle(enemy, deltaTime);
                break;
            case 'PATROL':
                this.executePatrol(enemy, deltaTime);
                break;
            case 'ALERT':
                this.executeAlert(enemy, player, deltaTime);
                break;
            case 'INVESTIGATE':
                this.executeInvestigate(enemy, player, deltaTime);
                break;
            case 'CHASE':
                this.executeChase(enemy, player, deltaTime);
                break;
            case 'COMBAT':
                this.executeCombat(enemy, player, allEnemies, deltaTime);
                break;
            case 'RETREAT':
                this.executeRetreat(enemy, player, allEnemies, deltaTime);
                break;
            case 'FLANK':
                this.executeFlank(enemy, player, allEnemies, deltaTime);
                break;
            case 'COVER':
                this.executeCover(enemy, player, allEnemies, deltaTime);
                break;
            case 'SEARCH':
                this.executeSearch(enemy, deltaTime);
                break;
            case 'REGROUP':
                this.executeRegroup(enemy, allEnemies, deltaTime);
                break;
            case 'SUPPORT':
                this.executeSupport(enemy, allEnemies, deltaTime);
                break;
        }
    }

    // 执行待机行为
    executeIdle(enemy, deltaTime) {
        // 随机转向
        if (!enemy.aiData.idleTimer) {
            enemy.aiData.idleTimer = 2000 + Math.random() * 3000;
        }
        
        enemy.aiData.idleTimer -= deltaTime;
        
        if (enemy.aiData.idleTimer <= 0) {
            enemy.facingAngle = Math.random() * Math.PI * 2;
            enemy.aiData.idleTimer = 2000 + Math.random() * 3000;
        }
        
        enemy.vx = 0;
        enemy.vy = 0;
        enemy.animationState = 'idle';
    }

    // 执行巡逻行为
    executePatrol(enemy, deltaTime) {
        const patrolPoints = enemy.aiData.patrolPoints;
        const currentTarget = patrolPoints[enemy.aiData.currentPatrolIndex];
        
        if (!currentTarget) return;
        
        const distance = Math.sqrt(
            Math.pow(currentTarget.x - enemy.x, 2) + Math.pow(currentTarget.y - enemy.y, 2)
        );
        
        if (distance < 20) {
            // 到达巡逻点，等待一段时间后前往下一个点
            if (!enemy.aiData.patrolWaitTimer) {
                enemy.aiData.patrolWaitTimer = 1000 + Math.random() * 2000;
            }
            
            enemy.aiData.patrolWaitTimer -= deltaTime;
            
            if (enemy.aiData.patrolWaitTimer <= 0) {
                enemy.aiData.currentPatrolIndex = (enemy.aiData.currentPatrolIndex + 1) % patrolPoints.length;
                enemy.aiData.patrolWaitTimer = null;
            }
            
            enemy.vx = 0;
            enemy.vy = 0;
            enemy.animationState = 'idle';
        } else {
            // 移动到巡逻点
            const angle = Math.atan2(currentTarget.y - enemy.y, currentTarget.x - enemy.x);
            const speed = enemy.speed * 0.5; // 巡逻时速度较慢
            
            enemy.vx = Math.cos(angle) * speed;
            enemy.vy = Math.sin(angle) * speed;
            enemy.facingAngle = angle;
            enemy.animationState = 'walking';
        }
    }

    // 执行警戒行为
    executeAlert(enemy, player, deltaTime) {
        // 提高警觉，扫描周围
        if (!enemy.aiData.alertScanTimer) {
            enemy.aiData.alertScanTimer = 500;
            enemy.aiData.alertScanDirection = 1;
        }
        
        enemy.aiData.alertScanTimer -= deltaTime;
        
        if (enemy.aiData.alertScanTimer <= 0) {
            enemy.facingAngle += enemy.aiData.alertScanDirection * Math.PI / 4;
            enemy.aiData.alertScanDirection *= -1;
            enemy.aiData.alertScanTimer = 500;
        }
        
        enemy.vx = 0;
        enemy.vy = 0;
        enemy.animationState = 'alert';
    }

    // 执行调查行为
    executeInvestigate(enemy, player, deltaTime) {
        if (enemy.aiData.lastKnownPlayerPosition) {
            const target = enemy.aiData.lastKnownPlayerPosition;
            const distance = Math.sqrt(
                Math.pow(target.x - enemy.x, 2) + Math.pow(target.y - enemy.y, 2)
            );
            
            if (distance < 30) {
                // 到达调查点，搜索周围
                enemy.aiData.lastKnownPlayerPosition = null;
                enemy.aiData.investigateTimer = 3000;
            } else {
                // 移动到调查点
                const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
                const speed = enemy.speed * 0.8;
                
                enemy.vx = Math.cos(angle) * speed;
                enemy.vy = Math.sin(angle) * speed;
                enemy.facingAngle = angle;
                enemy.animationState = 'running';
            }
        } else {
            // 没有调查目标，原地搜索
            if (!enemy.aiData.investigateTimer) {
                enemy.aiData.investigateTimer = 3000;
            }
            
            enemy.aiData.investigateTimer -= deltaTime;
            
            // 转向搜索
            enemy.facingAngle += deltaTime * 0.002;
            enemy.vx = 0;
            enemy.vy = 0;
            enemy.animationState = 'alert';
        }
    }

    // 执行追击行为
    executeChase(enemy, player, deltaTime) {
        const target = enemy.aiData.lastKnownPlayerPosition || player;
        const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
        const speed = enemy.speed * 1.2; // 追击时速度更快
        
        // 使用路径规划避开障碍物
        const path = this.pathfinder.findPath(enemy, target);
        
        if (path && path.length > 1) {
            const nextPoint = path[1];
            const pathAngle = Math.atan2(nextPoint.y - enemy.y, nextPoint.x - enemy.x);
            
            enemy.vx = Math.cos(pathAngle) * speed;
            enemy.vy = Math.sin(pathAngle) * speed;
            enemy.facingAngle = pathAngle;
        } else {
            enemy.vx = Math.cos(angle) * speed;
            enemy.vy = Math.sin(angle) * speed;
            enemy.facingAngle = angle;
        }
        
        enemy.animationState = 'running';
    }

    // 执行战斗行为
    executeCombat(enemy, player, allEnemies, deltaTime) {
        const distance = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        
        // 战术分析
        const tactics = this.tacticalAnalyzer.analyzeSituation(enemy, player, allEnemies);
        
        switch (tactics.recommendation) {
            case 'DIRECT_ATTACK':
                this.executeDirectAttack(enemy, player, deltaTime);
                break;
            case 'STRAFE_ATTACK':
                this.executeStrafeAttack(enemy, player, deltaTime);
                break;
            case 'COVER_ATTACK':
                this.executeCoverAttack(enemy, player, allEnemies, deltaTime);
                break;
            case 'RETREAT_ATTACK':
                this.executeRetreatAttack(enemy, player, deltaTime);
                break;
            default:
                this.executeDirectAttack(enemy, player, deltaTime);
        }
    }

    // 执行直接攻击
    executeDirectAttack(enemy, player, deltaTime) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        
        // 攻击：通过移动接近玩家来造成伤害
        if (!enemy.attackCooldown || enemy.attackCooldown <= 0) {
            // 设置攻击冷却时间
            enemy.attackCooldown = enemy.attackInterval || 1000;
        } else {
            enemy.attackCooldown -= deltaTime;
        }
        
        // 保持攻击距离
        const distance = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        
        const optimalDistance = enemy.attackRange * 0.8;
        
        if (distance > optimalDistance + 20) {
            // 靠近
            const speed = enemy.speed * 0.5;
            enemy.vx = Math.cos(angle) * speed;
            enemy.vy = Math.sin(angle) * speed;
        } else if (distance < optimalDistance - 20) {
            // 后退
            const speed = enemy.speed * 0.3;
            enemy.vx = -Math.cos(angle) * speed;
            enemy.vy = -Math.sin(angle) * speed;
        } else {
            enemy.vx = 0;
            enemy.vy = 0;
        }
        
        enemy.facingAngle = angle;
        enemy.animationState = 'attacking';
    }

    // 执行游走攻击
    executeStrafeAttack(enemy, player, deltaTime) {
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        const strafeAngle = angle + Math.PI / 2;
        
        // 攻击
        if (!enemy.attackCooldown || enemy.attackCooldown <= 0) {
            // 设置攻击冷却时间
            enemy.attackCooldown = enemy.attackInterval || 1000;
        } else {
            enemy.attackCooldown -= deltaTime;
        }
        
        // 侧向移动
        if (!enemy.aiData.strafeDirection) {
            enemy.aiData.strafeDirection = Math.random() > 0.5 ? 1 : -1;
            enemy.aiData.strafeTimer = 2000 + Math.random() * 2000;
        }
        
        enemy.aiData.strafeTimer -= deltaTime;
        
        if (enemy.aiData.strafeTimer <= 0) {
            enemy.aiData.strafeDirection *= -1;
            enemy.aiData.strafeTimer = 2000 + Math.random() * 2000;
        }
        
        const speed = enemy.speed * 0.7;
        enemy.vx = Math.cos(strafeAngle) * speed * enemy.aiData.strafeDirection;
        enemy.vy = Math.sin(strafeAngle) * speed * enemy.aiData.strafeDirection;
        enemy.facingAngle = angle;
        enemy.animationState = 'attacking';
    }

    // 执行掩护攻击
    executeCoverAttack(enemy, player, allEnemies, deltaTime) {
        // 寻找掩护位置
        const coverPosition = this.findCoverPosition(enemy, player, allEnemies);
        
        if (coverPosition) {
            const distance = Math.sqrt(
                Math.pow(coverPosition.x - enemy.x, 2) + Math.pow(coverPosition.y - enemy.y, 2)
            );
            
            if (distance > 20) {
                // 移动到掩护位置
                const angle = Math.atan2(coverPosition.y - enemy.y, coverPosition.x - enemy.x);
                const speed = enemy.speed;
                
                enemy.vx = Math.cos(angle) * speed;
                enemy.vy = Math.sin(angle) * speed;
                enemy.facingAngle = angle;
                enemy.animationState = 'running';
            } else {
                // 在掩护位置攻击
                this.executeDirectAttack(enemy, player, deltaTime);
            }
        } else {
            // 没有掩护，直接攻击
            this.executeDirectAttack(enemy, player, deltaTime);
        }
    }

    // 执行撤退攻击
    executeRetreatAttack(enemy, player, deltaTime) {
        const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        
        // 边撤退边攻击
        if (!enemy.attackCooldown || enemy.attackCooldown <= 0) {
            // 设置攻击冷却时间（撤退时攻击频率降低）
            enemy.attackCooldown = (enemy.attackInterval || 1000) * 1.5;
        } else {
            enemy.attackCooldown -= deltaTime;
        }
        
        const speed = enemy.speed * 0.8;
        enemy.vx = Math.cos(angle) * speed;
        enemy.vy = Math.sin(angle) * speed;
        enemy.facingAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.animationState = 'retreating';
    }

    // 执行撤退行为
    executeRetreat(enemy, player, allEnemies, deltaTime) {
        const retreatTarget = enemy.aiData.retreatTarget || this.findRetreatPosition(enemy);
        
        if (retreatTarget) {
            const distance = Math.sqrt(
                Math.pow(retreatTarget.x - enemy.x, 2) + Math.pow(retreatTarget.y - enemy.y, 2)
            );
            
            if (distance > 20) {
                const angle = Math.atan2(retreatTarget.y - enemy.y, retreatTarget.x - enemy.x);
                const speed = enemy.speed * 1.3; // 撤退时速度更快
                
                enemy.vx = Math.cos(angle) * speed;
                enemy.vy = Math.sin(angle) * speed;
                enemy.facingAngle = angle;
                enemy.animationState = 'running';
            } else {
                // 到达撤退位置
                enemy.aiData.retreatTarget = null;
                enemy.vx = 0;
                enemy.vy = 0;
                enemy.animationState = 'idle';
            }
        }
    }

    // 执行侧翼行为
    executeFlank(enemy, player, allEnemies, deltaTime) {
        const flankPosition = this.calculateFlankPosition(enemy, player, allEnemies);
        
        if (flankPosition) {
            const distance = Math.sqrt(
                Math.pow(flankPosition.x - enemy.x, 2) + Math.pow(flankPosition.y - enemy.y, 2)
            );
            
            if (distance > 30) {
                const angle = Math.atan2(flankPosition.y - enemy.y, flankPosition.x - enemy.x);
                const speed = enemy.speed * 1.1;
                
                enemy.vx = Math.cos(angle) * speed;
                enemy.vy = Math.sin(angle) * speed;
                enemy.facingAngle = angle;
                enemy.animationState = 'running';
            } else {
                // 到达侧翼位置，开始攻击
                this.executeDirectAttack(enemy, player, deltaTime);
            }
        }
    }

    // 执行掩护行为
    executeCover(enemy, player, allEnemies, deltaTime) {
        const coverPosition = this.findCoverPosition(enemy, player, allEnemies);
        
        if (coverPosition) {
            const distance = Math.sqrt(
                Math.pow(coverPosition.x - enemy.x, 2) + Math.pow(coverPosition.y - enemy.y, 2)
            );
            
            if (distance > 20) {
                const angle = Math.atan2(coverPosition.y - enemy.y, coverPosition.x - enemy.x);
                const speed = enemy.speed;
                
                enemy.vx = Math.cos(angle) * speed;
                enemy.vy = Math.sin(angle) * speed;
                enemy.facingAngle = angle;
                enemy.animationState = 'running';
            } else {
                // 在掩护位置
                enemy.vx = 0;
                enemy.vy = 0;
                enemy.facingAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                enemy.animationState = 'cover';
                
                // 偶尔探头攻击
                if (!enemy.aiData.peekTimer) {
                    enemy.aiData.peekTimer = 1000 + Math.random() * 2000;
                }
                
                enemy.aiData.peekTimer -= deltaTime;
                
                if (enemy.aiData.peekTimer <= 0) {
                    if (!enemy.attackCooldown || enemy.attackCooldown <= 0) {
                        // 设置攻击冷却时间
                        enemy.attackCooldown = enemy.attackInterval || 1000;
                    }
                    enemy.aiData.peekTimer = 1000 + Math.random() * 2000;
                }
            }
        }
    }

    // 执行搜索行为
    executeSearch(enemy, deltaTime) {
        const searchPoints = enemy.aiData.searchPoints;
        
        if (!searchPoints || searchPoints.length === 0) {
            enemy.aiData.searchPoints = this.generateSearchPoints(enemy);
            enemy.aiData.currentSearchIndex = 0;
            return;
        }
        
        const currentTarget = searchPoints[enemy.aiData.currentSearchIndex];
        const distance = Math.sqrt(
            Math.pow(currentTarget.x - enemy.x, 2) + Math.pow(currentTarget.y - enemy.y, 2)
        );
        
        if (distance < 30) {
            // 到达搜索点
            enemy.aiData.currentSearchIndex++;
            
            if (enemy.aiData.currentSearchIndex >= searchPoints.length) {
                // 搜索完成
                enemy.aiData.searchPoints = null;
                enemy.aiData.currentSearchIndex = 0;
            }
            
            enemy.vx = 0;
            enemy.vy = 0;
            enemy.animationState = 'alert';
        } else {
            // 移动到搜索点
            const angle = Math.atan2(currentTarget.y - enemy.y, currentTarget.x - enemy.x);
            const speed = enemy.speed * 0.7;
            
            enemy.vx = Math.cos(angle) * speed;
            enemy.vy = Math.sin(angle) * speed;
            enemy.facingAngle = angle;
            enemy.animationState = 'walking';
        }
    }

    // 执行重组行为
    executeRegroup(enemy, allEnemies, deltaTime) {
        // 寻找最近的友军
        const nearestAlly = this.findNearestAlly(enemy, allEnemies);
        
        if (nearestAlly) {
            const distance = Math.sqrt(
                Math.pow(nearestAlly.x - enemy.x, 2) + Math.pow(nearestAlly.y - enemy.y, 2)
            );
            
            if (distance > 80) {
                const angle = Math.atan2(nearestAlly.y - enemy.y, nearestAlly.x - enemy.x);
                const speed = enemy.speed;
                
                enemy.vx = Math.cos(angle) * speed;
                enemy.vy = Math.sin(angle) * speed;
                enemy.facingAngle = angle;
                enemy.animationState = 'running';
            } else {
                // 重组完成
                enemy.vx = 0;
                enemy.vy = 0;
                enemy.animationState = 'idle';
            }
        }
    }

    // 执行支援行为
    executeSupport(enemy, allEnemies, deltaTime) {
        // 寻找需要支援的友军
        const allyNeedingSupport = this.findAllyNeedingSupport(enemy, allEnemies);
        
        if (allyNeedingSupport) {
            const distance = Math.sqrt(
                Math.pow(allyNeedingSupport.x - enemy.x, 2) + Math.pow(allyNeedingSupport.y - enemy.y, 2)
            );
            
            if (distance > 60) {
                const angle = Math.atan2(allyNeedingSupport.y - enemy.y, allyNeedingSupport.x - enemy.x);
                const speed = enemy.speed * 1.2;
                
                enemy.vx = Math.cos(angle) * speed;
                enemy.vy = Math.sin(angle) * speed;
                enemy.facingAngle = angle;
                enemy.animationState = 'running';
            } else {
                // 提供支援
                if (enemy.type === 'medic' && allyNeedingSupport.health < allyNeedingSupport.maxHealth) {
                    // 治疗
                    if (!enemy.healCooldown || enemy.healCooldown <= 0) {
                        allyNeedingSupport.health = Math.min(
                            allyNeedingSupport.maxHealth, 
                            allyNeedingSupport.health + 20
                        );
                        enemy.healCooldown = 3000;
                        enemy.animationState = 'healing';
                    } else {
                        enemy.healCooldown -= deltaTime;
                    }
                } else {
                    // 火力支援
                    enemy.animationState = 'supporting';
                }
                
                enemy.vx = 0;
                enemy.vy = 0;
            }
        }
    }

    // 辅助方法
    generatePatrolPoints(enemy) {
        const points = [];
        const numPoints = 3 + Math.floor(Math.random() * 3);
        const radius = 100 + Math.random() * 100;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            points.push({
                x: enemy.x + Math.cos(angle) * radius,
                y: enemy.y + Math.sin(angle) * radius
            });
        }
        
        return points;
    }

    generateSearchPoints(enemy) {
        const points = [];
        const lastKnown = enemy.aiData.lastKnownPlayerPosition;
        
        if (lastKnown) {
            // 在最后已知位置周围生成搜索点
            const searchRadius = 80;
            const numPoints = 4;
            
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                points.push({
                    x: lastKnown.x + Math.cos(angle) * searchRadius,
                    y: lastKnown.y + Math.sin(angle) * searchRadius
                });
            }
        }
        
        return points;
    }

    findRetreatPosition(enemy) {
        // 寻找远离玩家的安全位置
        const retreatDistance = 200;
        const candidates = [];
        
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            const x = enemy.x + Math.cos(angle) * retreatDistance;
            const y = enemy.y + Math.sin(angle) * retreatDistance;
            
            candidates.push({ x, y, angle });
        }
        
        // 选择最安全的位置
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    calculateFlankPosition(enemy, player, allEnemies) {
        // 计算侧翼攻击位置
        const playerAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        const flankAngle = playerAngle + (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2);
        const distance = 120;
        
        return {
            x: player.x + Math.cos(flankAngle) * distance,
            y: player.y + Math.sin(flankAngle) * distance
        };
    }

    findCoverPosition(enemy, player, allEnemies) {
        // 寻找掩护位置（使用其他敌人或障碍物）
        const coverCandidates = [];
        
        allEnemies.forEach(other => {
            if (other !== enemy) {
                const angle = Math.atan2(other.y - player.y, other.x - player.x);
                const coverX = other.x + Math.cos(angle) * 40;
                const coverY = other.y + Math.sin(angle) * 40;
                
                const distance = Math.sqrt(
                    Math.pow(coverX - enemy.x, 2) + Math.pow(coverY - enemy.y, 2)
                );
                
                coverCandidates.push({ x: coverX, y: coverY, distance });
            }
        });
        
        coverCandidates.sort((a, b) => a.distance - b.distance);
        return coverCandidates.length > 0 ? coverCandidates[0] : null;
    }

    findNearestAlly(enemy, allEnemies) {
        let nearest = null;
        let minDistance = Infinity;
        
        allEnemies.forEach(other => {
            if (other !== enemy) {
                const distance = Math.sqrt(
                    Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = other;
                }
            }
        });
        
        return nearest;
    }

    findAllyNeedingSupport(enemy, allEnemies) {
        const allies = allEnemies.filter(other => 
            other !== enemy && 
            (other.health < other.maxHealth * 0.5 || other.aiState === 'RETREAT')
        );
        
        if (allies.length === 0) return null;
        
        // 返回最近的需要支援的友军
        allies.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.x - enemy.x, 2) + Math.pow(a.y - enemy.y, 2));
            const distB = Math.sqrt(Math.pow(b.x - enemy.x, 2) + Math.pow(b.y - enemy.y, 2));
            return distA - distB;
        });
        
        return allies[0];
    }

    // 调试方法
    renderDebugInfo(ctx, enemies) {
        if (!this.debugMode) return;
        
        ctx.save();
        
        enemies.forEach(enemy => {
            // 绘制AI状态
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(enemy.aiState, enemy.x - 30, enemy.y - 40);
            
            // 绘制视觉范围
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, this.getVisionRange(enemy), 0, Math.PI * 2);
            ctx.stroke();
            
            // 绘制路径
            if (enemy.aiData.path && enemy.aiData.path.length > 1) {
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
                ctx.beginPath();
                ctx.moveTo(enemy.x, enemy.y);
                
                enemy.aiData.path.forEach(point => {
                    ctx.lineTo(point.x, point.y);
                });
                
                ctx.stroke();
            }
        });
        
        ctx.restore();
    }

    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}

// 路径规划系统
class PathfindingSystem {
    constructor() {
        this.gridSize = 20;
        this.obstacles = [];
    }

    findPath(from, to) {
        // 简化的A*路径规划
        // 实际实现需要更复杂的算法
        return [from, to];
    }

    update(enemy, deltaTime) {
        // 更新路径规划
    }
}

// 战术分析器
class TacticalAnalyzer {
    analyzeSituation(enemy, player, allEnemies) {
        const distance = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        
        const healthRatio = enemy.health / enemy.maxHealth;
        const nearbyAllies = allEnemies.filter(other => 
            other !== enemy && 
            Math.sqrt(Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2)) < 150
        ).length;
        
        // 简化的战术决策
        if (healthRatio < 0.3) {
            return { recommendation: 'RETREAT_ATTACK' };
        } else if (nearbyAllies >= 2) {
            return { recommendation: 'COVER_ATTACK' };
        } else if (distance > 100) {
            return { recommendation: 'DIRECT_ATTACK' };
        } else {
            return { recommendation: 'STRAFE_ATTACK' };
        }
    }
}

// 决策制定器
class DecisionMaker {
    makeDecision(enemy, player, allEnemies, obstacles) {
        const distance = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        
        const canSeePlayer = enemy.aiData.lastPlayerSighting && 
            (Date.now() - enemy.aiData.lastPlayerSighting) < 5000;
        
        const healthRatio = enemy.health / enemy.maxHealth;
        const alertLevel = enemy.aiData.alertLevel;
        
        // 决策逻辑
        if (healthRatio < 0.2) {
            return 'RETREAT';
        }
        
        if (canSeePlayer && distance < 150) {
            return 'COMBAT';
        }
        
        if (canSeePlayer && distance < 300) {
            return 'CHASE';
        }
        
        if (alertLevel > 0.7) {
            return 'INVESTIGATE';
        }
        
        if (alertLevel > 0.3) {
            return 'ALERT';
        }
        
        if (enemy.aiState === 'PATROL') {
            return 'PATROL';
        }
        
        return 'IDLE';
    }
}

// AI记忆系统
class AIMemorySystem {
    update(enemy, player, deltaTime) {
        // 更新AI记忆
        if (!enemy.aiData.memory) {
            enemy.aiData.memory = new Map();
        }
        
        // 记录玩家位置
        if (enemy.aiData.lastPlayerSighting && 
            (Date.now() - enemy.aiData.lastPlayerSighting) < 1000) {
            enemy.aiData.memory.set('lastPlayerPosition', {
                x: player.x,
                y: player.y,
                timestamp: Date.now()
            });
        }
    }
}

// AI通信系统
class AICommunicationSystem {
    constructor() {
        this.messages = [];
    }

    update(enemies, deltaTime) {
        // 处理通信消息
        this.messages = this.messages.filter(msg => 
            Date.now() - msg.timestamp < 5000
        );
    }

    broadcastPlayerSighting(sender, player, allEnemies) {
        const message = {
            type: 'PLAYER_SIGHTING',
            sender: sender,
            playerPosition: { x: player.x, y: player.y },
            timestamp: Date.now()
        };
        
        // 通知范围内的敌人
        allEnemies.forEach(enemy => {
            if (enemy !== sender) {
                const distance = Math.sqrt(
                    Math.pow(enemy.x - sender.x, 2) + Math.pow(enemy.y - sender.y, 2)
                );
                
                if (distance < sender.aiData.communicationRange) {
                    this.receiveMessage(enemy, message);
                }
            }
        });
    }

    receiveMessage(enemy, message) {
        // 确保aiData已初始化
        if (!enemy.aiData) {
            enemy.aiData = {
                lastKnownPlayerPosition: null,
                patrolPoints: [],
                currentPatrolIndex: 0,
                alertLevel: 0,
                lastPlayerSighting: 0,
                memory: new Map(),
                communicationRange: 200,
                reactionTime: 500 + Math.random() * 500
            };
        }
        
        switch (message.type) {
            case 'PLAYER_SIGHTING':
                enemy.aiData.lastKnownPlayerPosition = message.playerPosition;
                enemy.aiData.alertLevel = Math.min(1.0, enemy.aiData.alertLevel + 0.5);
                break;
        }
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.IntelligentEnemyAI = IntelligentEnemyAI;
    window.PathfindingSystem = PathfindingSystem;
    window.TacticalAnalyzer = TacticalAnalyzer;
    window.DecisionMaker = DecisionMaker;
    window.AIMemorySystem = AIMemorySystem;
    window.AICommunicationSystem = AICommunicationSystem;
}