/**
 * 敌人多样化系统
 * 实现多种敌人类型的独特外观、行为和能力
 */

class EnemyDiversitySystem {
    constructor() {
        this.enemyTypes = new Map();
        this.behaviorPatterns = new Map();
        this.specialAbilities = new Map();
        this.visualVariants = new Map();
        
        this.initializeEnemyTypes();
        this.initializeBehaviorPatterns();
        this.initializeSpecialAbilities();
        this.initializeVisualVariants();
    }
    
    // 初始化敌人类型
    initializeEnemyTypes() {
        // 基础敌人类型
        this.enemyTypes.set('grunt', {
            name: '步兵',
            health: 30,
            speed: 1.0,
            damage: 10,
            radius: 12,
            color: '#e74c3c',
            behavior: 'aggressive',
            abilities: ['basic_attack'],
            spawnWeight: 40,
            experience: 10,
            description: '最基础的敌人单位，直接冲向玩家'
        });
        
        this.enemyTypes.set('scout', {
            name: '侦察兵',
            health: 20,
            speed: 1.8,
            damage: 8,
            radius: 10,
            color: '#f39c12',
            behavior: 'hit_and_run',
            abilities: ['dash', 'evasion'],
            spawnWeight: 25,
            experience: 15,
            description: '快速移动的敌人，擅长游击战术'
        });
        
        this.enemyTypes.set('heavy', {
            name: '重装兵',
            health: 80,
            speed: 0.6,
            damage: 20,
            radius: 18,
            color: '#8e44ad',
            behavior: 'tank',
            abilities: ['armor', 'charge'],
            spawnWeight: 15,
            experience: 25,
            description: '装甲厚重的敌人，移动缓慢但伤害很高'
        });
        
        this.enemyTypes.set('sniper', {
            name: '狙击手',
            health: 25,
            speed: 0.8,
            damage: 35,
            radius: 11,
            color: '#27ae60',
            behavior: 'ranged',
            abilities: ['long_range_shot', 'stealth'],
            spawnWeight: 10,
            experience: 30,
            description: '远程攻击敌人，保持距离进行精确射击'
        });
        
        this.enemyTypes.set('bomber', {
            name: '爆破兵',
            health: 15,
            speed: 1.2,
            damage: 50,
            radius: 13,
            color: '#e67e22',
            behavior: 'suicide',
            abilities: ['explosion', 'self_destruct'],
            spawnWeight: 8,
            experience: 20,
            description: '自爆型敌人，接近玩家后引爆造成大量伤害'
        });
        
        this.enemyTypes.set('medic', {
            name: '医疗兵',
            health: 40,
            speed: 1.1,
            damage: 5,
            radius: 14,
            color: '#3498db',
            behavior: 'support',
            abilities: ['heal_allies', 'shield_boost'],
            spawnWeight: 5,
            experience: 35,
            description: '支援型敌人，为其他敌人提供治疗和增益'
        });
        
        this.enemyTypes.set('assassin', {
            name: '刺客',
            health: 35,
            speed: 1.5,
            damage: 25,
            radius: 11,
            color: '#2c3e50',
            behavior: 'stealth',
            abilities: ['invisibility', 'backstab', 'teleport'],
            spawnWeight: 7,
            experience: 40,
            description: '隐身敌人，能够瞬移到玩家身后进行偷袭'
        });
        
        this.enemyTypes.set('elite_guard', {
            name: '精英卫兵',
            health: 120,
            speed: 1.3,
            damage: 30,
            radius: 16,
            color: '#9b59b6',
            behavior: 'elite',
            abilities: ['multi_shot', 'shield_wall', 'rally'],
            spawnWeight: 3,
            experience: 60,
            description: '精英敌人，拥有多种强力技能'
        });
        
        this.enemyTypes.set('boss_minion', {
            name: 'Boss随从',
            health: 60,
            speed: 1.4,
            damage: 18,
            radius: 15,
            color: '#c0392b',
            behavior: 'boss_support',
            abilities: ['boss_link', 'power_share'],
            spawnWeight: 2,
            experience: 45,
            description: 'Boss的随从，与Boss共享部分能力'
        });
    }
    
    // 初始化行为模式
    initializeBehaviorPatterns() {
        this.behaviorPatterns.set('aggressive', {
            name: '激进型',
            movePattern: 'direct_charge',
            attackPattern: 'melee_rush',
            decisionMaking: {
                aggressionLevel: 0.9,
                retreatThreshold: 0.1,
                groupCoordination: 0.3
            },
            movementModifiers: {
                speedBoostNearPlayer: 1.2,
                obstacleAvoidance: 0.5,
                pathOptimization: 0.3
            }
        });
        
        this.behaviorPatterns.set('hit_and_run', {
            name: '游击型',
            movePattern: 'circle_strafe',
            attackPattern: 'quick_strike',
            decisionMaking: {
                aggressionLevel: 0.6,
                retreatThreshold: 0.4,
                groupCoordination: 0.7
            },
            movementModifiers: {
                evasionChance: 0.3,
                attackCooldown: 0.8,
                repositionFrequency: 2.0
            }
        });
        
        this.behaviorPatterns.set('tank', {
            name: '坦克型',
            movePattern: 'steady_advance',
            attackPattern: 'heavy_strike',
            decisionMaking: {
                aggressionLevel: 0.7,
                retreatThreshold: 0.05,
                groupCoordination: 0.5
            },
            movementModifiers: {
                knockbackResistance: 0.8,
                chargeAbility: true,
                areaControl: 0.6
            }
        });
        
        this.behaviorPatterns.set('ranged', {
            name: '远程型',
            movePattern: 'maintain_distance',
            attackPattern: 'ranged_fire',
            decisionMaking: {
                aggressionLevel: 0.5,
                retreatThreshold: 0.6,
                groupCoordination: 0.4
            },
            movementModifiers: {
                optimalRange: 150,
                retreatSpeed: 1.5,
                aimAccuracy: 0.8
            }
        });
        
        this.behaviorPatterns.set('suicide', {
            name: '自爆型',
            movePattern: 'kamikaze_rush',
            attackPattern: 'self_destruct',
            decisionMaking: {
                aggressionLevel: 1.0,
                retreatThreshold: 0.0,
                groupCoordination: 0.2
            },
            movementModifiers: {
                explosionRadius: 40,
                fuseTime: 1.5,
                speedIncrease: 1.5
            }
        });
        
        this.behaviorPatterns.set('support', {
            name: '支援型',
            movePattern: 'stay_behind',
            attackPattern: 'support_abilities',
            decisionMaking: {
                aggressionLevel: 0.2,
                retreatThreshold: 0.7,
                groupCoordination: 0.9
            },
            movementModifiers: {
                healRange: 80,
                buffRange: 60,
                selfPreservation: 0.8
            }
        });
        
        this.behaviorPatterns.set('stealth', {
            name: '潜行型',
            movePattern: 'stealth_approach',
            attackPattern: 'ambush',
            decisionMaking: {
                aggressionLevel: 0.8,
                retreatThreshold: 0.3,
                groupCoordination: 0.1
            },
            movementModifiers: {
                invisibilityDuration: 3.0,
                backstabMultiplier: 2.0,
                detectionRange: 50
            }
        });
    }
    
    // 初始化特殊能力
    initializeSpecialAbilities() {
        this.specialAbilities.set('dash', {
            name: '冲刺',
            type: 'movement',
            cooldown: 3000,
            duration: 500,
            effect: {
                speedMultiplier: 3.0,
                invulnerable: true,
                trailEffect: true
            },
            visual: {
                color: '#f39c12',
                particles: 'speed_lines',
                sound: 'dash_sound'
            }
        });
        
        this.specialAbilities.set('charge', {
            name: '冲锋',
            type: 'attack',
            cooldown: 5000,
            chargeTime: 1500,
            effect: {
                damageMultiplier: 2.5,
                knockback: 30,
                stunDuration: 1000
            },
            visual: {
                color: '#8e44ad',
                particles: 'charge_dust',
                sound: 'charge_roar'
            }
        });
        
        this.specialAbilities.set('long_range_shot', {
            name: '远程射击',
            type: 'ranged_attack',
            cooldown: 4000,
            aimTime: 2000,
            effect: {
                range: 300,
                damage: 35,
                piercing: true
            },
            visual: {
                color: '#27ae60',
                particles: 'laser_sight',
                sound: 'sniper_shot'
            }
        });
        
        this.specialAbilities.set('explosion', {
            name: '爆炸',
            type: 'area_attack',
            cooldown: 0,
            fuseTime: 1500,
            effect: {
                radius: 40,
                damage: 50,
                selfDestruct: true
            },
            visual: {
                color: '#e67e22',
                particles: 'explosion',
                sound: 'bomb_explosion'
            }
        });
        
        this.specialAbilities.set('heal_allies', {
            name: '治疗盟友',
            type: 'support',
            cooldown: 6000,
            duration: 3000,
            effect: {
                healAmount: 20,
                healRange: 80,
                healOverTime: true
            },
            visual: {
                color: '#3498db',
                particles: 'healing_aura',
                sound: 'heal_sound'
            }
        });
        
        this.specialAbilities.set('invisibility', {
            name: '隐身',
            type: 'stealth',
            cooldown: 8000,
            duration: 3000,
            effect: {
                alpha: 0.2,
                detectionReduction: 0.7,
                speedBonus: 1.3
            },
            visual: {
                color: '#2c3e50',
                particles: 'stealth_shimmer',
                sound: 'stealth_activate'
            }
        });
        
        this.specialAbilities.set('teleport', {
            name: '瞬移',
            type: 'movement',
            cooldown: 7000,
            castTime: 500,
            effect: {
                range: 100,
                instantaneous: true,
                behindPlayer: true
            },
            visual: {
                color: '#9b59b6',
                particles: 'teleport_portal',
                sound: 'teleport_sound'
            }
        });
        
        this.specialAbilities.set('multi_shot', {
            name: '多重射击',
            type: 'ranged_attack',
            cooldown: 6000,
            duration: 2000,
            effect: {
                bulletCount: 5,
                spreadAngle: 45,
                damage: 15
            },
            visual: {
                color: '#e74c3c',
                particles: 'muzzle_flash',
                sound: 'rapid_fire'
            }
        });
    }
    
    // 初始化视觉变体
    initializeVisualVariants() {
        this.visualVariants.set('grunt_variants', [
            { color: '#e74c3c', size: 1.0, pattern: 'solid' },
            { color: '#c0392b', size: 1.1, pattern: 'striped' },
            { color: '#a93226', size: 0.9, pattern: 'dotted' }
        ]);
        
        this.visualVariants.set('scout_variants', [
            { color: '#f39c12', size: 1.0, pattern: 'solid', trail: true },
            { color: '#e67e22', size: 0.8, pattern: 'gradient', trail: true },
            { color: '#d35400', size: 1.2, pattern: 'flame', trail: true }
        ]);
        
        this.visualVariants.set('heavy_variants', [
            { color: '#8e44ad', size: 1.0, pattern: 'armor_plated' },
            { color: '#7d3c98', size: 1.2, pattern: 'spiked' },
            { color: '#6c3483', size: 1.1, pattern: 'reinforced' }
        ]);
    }
    
    // 创建敌人实例
    createEnemy(type, x, y, level = 1) {
        const enemyData = this.enemyTypes.get(type);
        if (!enemyData) {
            console.warn(`未知的敌人类型: ${type}，回退到EnemyFactory`);
            // 回退到EnemyFactory
            if (typeof EnemyFactory !== 'undefined') {
                return EnemyFactory.createEnemy('normal', x, y);
            }
            return null;
        }
        
        // 映射到现有的敌人类型
        let mappedType = 'normal';
        switch(type) {
            case 'grunt':
            case 'normal':
                mappedType = 'normal';
                break;
            case 'scout':
                mappedType = 'fast';
                break;
            case 'heavy':
                mappedType = 'tank';
                break;
            case 'sniper':
                mappedType = 'ranged';
                break;
            case 'elite_guard':
            case 'boss_minion':
                mappedType = 'simple_boss';
                break;
            default:
                mappedType = 'normal';
        }
        
        // 使用EnemyFactory创建真正的敌人实例
        if (typeof EnemyFactory !== 'undefined') {
            const enemy = EnemyFactory.createEnemy(mappedType, x, y);
            if (enemy) {
                // 应用多样化系统的属性调整
                const levelMultiplier = 1 + (level - 1) * 0.3;
                enemy.maxHealth = Math.floor(enemy.maxHealth * levelMultiplier);
                enemy.health = enemy.maxHealth;
                enemy.damage = Math.floor(enemy.damage * levelMultiplier);
                enemy.diversityType = type; // 记录原始类型
                enemy.diversityLevel = level;
                
                // 设置视觉变体
                enemy.visualVariant = this.getRandomVisualVariant(type);
                
                console.log(`[DEBUG] EnemyDiversitySystem created ${type} -> ${mappedType} enemy:`, enemy);
                console.log(`[DEBUG] Visual variant:`, enemy.visualVariant);
                return enemy;
            }
        }
        
        console.warn('EnemyFactory不可用，无法创建敌人');
        return null;
    }
    
    // 获取随机视觉变体
    getRandomVisualVariant(type) {
        const variants = this.visualVariants.get(type + '_variants');
        if (!variants || variants.length === 0) {
            return { color: this.enemyTypes.get(type).color, size: 1.0, pattern: 'solid' };
        }
        
        return variants[Math.floor(Math.random() * variants.length)];
    }
    
    // 更新敌人AI
    updateEnemyAI(enemy, player, deltaTime, obstacles, otherEnemies) {
        const behaviorData = this.behaviorPatterns.get(enemy.behavior);
        if (!behaviorData) return;
        
        // 更新AI状态
        this.updateAIState(enemy, player, behaviorData);
        
        // 执行移动模式
        this.executeMovementPattern(enemy, player, behaviorData, obstacles, deltaTime);
        
        // 执行攻击模式
        this.executeAttackPattern(enemy, player, behaviorData, deltaTime);
        
        // 更新特殊能力
        this.updateAbilities(enemy, player, otherEnemies, deltaTime);
        
        // 更新状态效果
        this.updateStatusEffects(enemy, deltaTime);
    }
    
    // 更新AI状态
    updateAIState(enemy, player, behaviorData) {
        const distanceToPlayer = Math.sqrt(
            Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
        );
        
        const healthPercentage = enemy.health / enemy.maxHealth;
        
        // 根据行为模式和当前状况决定AI状态
        if (healthPercentage < behaviorData.decisionMaking.retreatThreshold) {
            enemy.aiState = 'retreat';
        } else if (distanceToPlayer < 50) {
            enemy.aiState = 'attack';
        } else if (distanceToPlayer < 150) {
            enemy.aiState = 'approach';
        } else {
            enemy.aiState = 'patrol';
        }
        
        // 记录玩家位置用于预测
        enemy.lastPlayerPosition = { x: player.x, y: player.y };
    }
    
    // 执行移动模式
    executeMovementPattern(enemy, player, behaviorData, obstacles, deltaTime) {
        const pattern = behaviorData.movePattern;
        
        switch (pattern) {
            case 'direct_charge':
                this.moveDirectCharge(enemy, player, deltaTime);
                break;
            case 'circle_strafe':
                this.moveCircleStrafe(enemy, player, deltaTime);
                break;
            case 'steady_advance':
                this.moveSteadyAdvance(enemy, player, obstacles, deltaTime);
                break;
            case 'maintain_distance':
                this.moveMaintainDistance(enemy, player, behaviorData.movementModifiers.optimalRange, deltaTime);
                break;
            case 'kamikaze_rush':
                this.moveKamikazeRush(enemy, player, deltaTime);
                break;
            case 'stay_behind':
                this.moveStayBehind(enemy, player, deltaTime);
                break;
            case 'stealth_approach':
                this.moveStealthApproach(enemy, player, deltaTime);
                break;
        }
    }
    
    // 直接冲锋移动
    moveDirectCharge(enemy, player, deltaTime) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const speed = enemy.speed * 60 * deltaTime;
            enemy.x += (dx / distance) * speed;
            enemy.y += (dy / distance) * speed;
        }
    }
    
    // 环绕移动
    moveCircleStrafe(enemy, player, deltaTime) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // 计算切线方向
            const tangentX = -dy / distance;
            const tangentY = dx / distance;
            
            // 混合径向和切线运动
            const radialWeight = distance > 80 ? 0.7 : 0.3;
            const tangentWeight = 1 - radialWeight;
            
            const moveX = (dx / distance) * radialWeight + tangentX * tangentWeight;
            const moveY = (dy / distance) * radialWeight + tangentY * tangentWeight;
            
            const speed = enemy.speed * 60 * deltaTime;
            enemy.x += moveX * speed;
            enemy.y += moveY * speed;
        }
    }
    
    // 稳步推进
    moveSteadyAdvance(enemy, player, obstacles, deltaTime) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const speed = enemy.speed * 60 * deltaTime * 0.8; // 较慢的移动
            enemy.x += (dx / distance) * speed;
            enemy.y += (dy / distance) * speed;
        }
    }
    
    // 保持距离
    moveMaintainDistance(enemy, player, optimalRange, deltaTime) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            let moveDirection = 1;
            if (distance < optimalRange) {
                moveDirection = -1; // 远离玩家
            } else if (distance > optimalRange * 1.5) {
                moveDirection = 1; // 接近玩家
            } else {
                return; // 在理想范围内，不移动
            }
            
            const speed = enemy.speed * 60 * deltaTime;
            enemy.x += (dx / distance) * speed * moveDirection;
            enemy.y += (dy / distance) * speed * moveDirection;
        }
    }
    
    // 自杀式冲锋
    moveKamikazeRush(enemy, player, deltaTime) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // 越接近玩家速度越快
            const speedMultiplier = Math.max(1, 3 - distance / 50);
            const speed = enemy.speed * 60 * deltaTime * speedMultiplier;
            enemy.x += (dx / distance) * speed;
            enemy.y += (dy / distance) * speed;
        }
    }
    
    // 待在后方
    moveStayBehind(enemy, player, deltaTime) {
        // 简单实现：远离玩家
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100 && distance > 0) {
            const speed = enemy.speed * 60 * deltaTime;
            enemy.x -= (dx / distance) * speed;
            enemy.y -= (dy / distance) * speed;
        }
    }
    
    // 潜行接近
    moveStealthApproach(enemy, player, deltaTime) {
        if (enemy.statusEffects.has('invisibility')) {
            // 隐身时快速接近
            this.moveDirectCharge(enemy, player, deltaTime);
        } else {
            // 非隐身时谨慎移动
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 60 && distance > 0) {
                const speed = enemy.speed * 60 * deltaTime * 0.5;
                enemy.x += (dx / distance) * speed;
                enemy.y += (dy / distance) * speed;
            }
        }
    }
    
    // 执行攻击模式
    executeAttackPattern(enemy, player, behaviorData, deltaTime) {
        const pattern = behaviorData.attackPattern;
        const distanceToPlayer = Math.sqrt(
            Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
        );
        
        switch (pattern) {
            case 'melee_rush':
                if (distanceToPlayer < enemy.radius + 20) {
                    this.performMeleeAttack(enemy, player);
                }
                break;
            case 'ranged_fire':
                if (distanceToPlayer < 200 && distanceToPlayer > 50) {
                    this.performRangedAttack(enemy, player);
                }
                break;
            case 'self_destruct':
                if (distanceToPlayer < 30) {
                    this.triggerSelfDestruct(enemy);
                }
                break;
        }
    }
    
    // 执行近战攻击
    performMeleeAttack(enemy, player) {
        const now = Date.now();
        const lastAttack = enemy.lastAbilityUse.get('basic_attack') || 0;
        
        if (now - lastAttack > 1000) { // 1秒攻击间隔
            // 造成伤害
            if (window.game && window.game.player) {
                window.game.player.takeDamage(enemy.damage);
            }
            
            enemy.lastAbilityUse.set('basic_attack', now);
            enemy.animationState = 'attack';
            enemy.animationStartTime = now;
        }
    }
    
    // 执行远程攻击
    performRangedAttack(enemy, player) {
        const now = Date.now();
        const lastAttack = enemy.lastAbilityUse.get('ranged_attack') || 0;
        
        if (now - lastAttack > 2000) { // 2秒攻击间隔
            // 创建子弹
            if (window.game && window.game.enemyBullets) {
                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                const bullet = {
                    x: enemy.x,
                    y: enemy.y,
                    vx: Math.cos(angle) * 150,
                    vy: Math.sin(angle) * 150,
                    damage: enemy.damage,
                    radius: 3,
                    color: enemy.color,
                    lifetime: 3000,
                    createdAt: now
                };
                window.game.enemyBullets.push(bullet);
            }
            
            enemy.lastAbilityUse.set('ranged_attack', now);
            enemy.animationState = 'shoot';
            enemy.animationStartTime = now;
        }
    }
    
    // 触发自爆
    triggerSelfDestruct(enemy) {
        const now = Date.now();
        if (!enemy.selfDestructTriggered) {
            enemy.selfDestructTriggered = true;
            enemy.selfDestructTime = now + 1500; // 1.5秒后爆炸
            enemy.animationState = 'self_destruct';
            enemy.animationStartTime = now;
        }
    }
    
    // 更新特殊能力
    updateAbilities(enemy, player, otherEnemies, deltaTime) {
        const now = Date.now();
        
        enemy.abilities.forEach(abilityName => {
            const ability = this.specialAbilities.get(abilityName);
            if (!ability) return;
            
            const lastUse = enemy.lastAbilityUse.get(abilityName) || 0;
            if (now - lastUse > ability.cooldown) {
                // 检查是否应该使用这个能力
                if (this.shouldUseAbility(enemy, player, ability, otherEnemies)) {
                    this.activateAbility(enemy, player, ability, otherEnemies);
                    enemy.lastAbilityUse.set(abilityName, now);
                }
            }
        });
    }
    
    // 判断是否应该使用能力
    shouldUseAbility(enemy, player, ability, otherEnemies) {
        const distanceToPlayer = Math.sqrt(
            Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
        );
        
        switch (ability.type) {
            case 'movement':
                return distanceToPlayer > 100 || enemy.health < enemy.maxHealth * 0.3;
            case 'attack':
                return distanceToPlayer < 80;
            case 'ranged_attack':
                return distanceToPlayer > 50 && distanceToPlayer < 200;
            case 'support':
                return otherEnemies.some(other => 
                    other !== enemy && 
                    other.health < other.maxHealth * 0.5 &&
                    Math.sqrt(Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2)) < 80
                );
            case 'stealth':
                return distanceToPlayer > 80 && !enemy.statusEffects.has('invisibility');
            default:
                return Math.random() < 0.1; // 10%概率随机使用
        }
    }
    
    // 激活能力
    activateAbility(enemy, player, ability, otherEnemies) {
        const now = Date.now();
        
        switch (ability.name) {
            case '冲刺':
                enemy.statusEffects.set('dash', {
                    endTime: now + ability.duration,
                    speedMultiplier: ability.effect.speedMultiplier
                });
                break;
                
            case '治疗盟友':
                otherEnemies.forEach(other => {
                    const distance = Math.sqrt(
                        Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2)
                    );
                    if (distance < ability.effect.healRange) {
                        other.health = Math.min(other.maxHealth, other.health + ability.effect.healAmount);
                    }
                });
                break;
                
            case '隐身':
                enemy.statusEffects.set('invisibility', {
                    endTime: now + ability.duration,
                    alpha: ability.effect.alpha
                });
                break;
                
            case '瞬移':
                // 瞬移到玩家身后
                const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
                enemy.x = player.x + Math.cos(angle) * 40;
                enemy.y = player.y + Math.sin(angle) * 40;
                break;
        }
        
        // 设置动画状态
        enemy.animationState = ability.name.toLowerCase().replace(' ', '_');
        enemy.animationStartTime = now;
    }
    
    // 更新状态效果
    updateStatusEffects(enemy, deltaTime) {
        const now = Date.now();
        const effectsToRemove = [];
        
        enemy.statusEffects.forEach((effect, name) => {
            if (now > effect.endTime) {
                effectsToRemove.push(name);
            }
        });
        
        effectsToRemove.forEach(name => {
            enemy.statusEffects.delete(name);
        });
    }
    
    // 渲染敌人
    renderEnemy(ctx, enemy) {
        if (!enemy.isAlive) return;
        
        ctx.save();
        
        // 应用视觉效果
        const variant = enemy.visualVariant || { color: enemy.color || '#e74c3c', size: 1.0, pattern: 'solid' };
        let alpha = 1.0;
        
        if (enemy.statusEffects.has('invisibility')) {
            alpha = enemy.statusEffects.get('invisibility').alpha;
        }
        
        ctx.globalAlpha = alpha;
        ctx.translate(enemy.x, enemy.y);
        ctx.scale(variant.size, variant.size);
        
        // 绘制主体
        this.renderEnemyBody(ctx, enemy, variant);
        
        // 绘制状态效果
        this.renderEnemyStatusEffects(ctx, enemy);
        
        // 绘制生命值条
        this.renderEnemyHealthBar(ctx, enemy);
        
        ctx.restore();
    }
    
    // 渲染敌人主体
    renderEnemyBody(ctx, enemy, variant) {
        const radius = enemy.radius;
        
        // 主体颜色
        ctx.fillStyle = variant.color;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 根据模式绘制不同图案
        switch (variant.pattern) {
            case 'striped':
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                for (let i = -radius; i < radius; i += 6) {
                    ctx.beginPath();
                    ctx.moveTo(i, -radius);
                    ctx.lineTo(i, radius);
                    ctx.stroke();
                }
                break;
                
            case 'dotted':
                ctx.fillStyle = '#fff';
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const x = Math.cos(angle) * radius * 0.6;
                    const y = Math.sin(angle) * radius * 0.6;
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'armor_plated':
                ctx.strokeStyle = '#34495e';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(0, 0, radius - 5, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
        
        // 绘制眼睛或其他特征
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.15, 0, Math.PI * 2);
        ctx.arc(radius * 0.3, -radius * 0.3, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.08, 0, Math.PI * 2);
        ctx.arc(radius * 0.3, -radius * 0.3, radius * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 渲染敌人状态效果
    renderEnemyStatusEffects(ctx, enemy) {
        // 渲染各种状态效果的视觉指示
        if (enemy.statusEffects.has('dash')) {
            // 冲刺轨迹
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(0, 0, enemy.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        if (enemy.selfDestructTriggered) {
            // 自爆警告
            const timeLeft = enemy.selfDestructTime - Date.now();
            const intensity = 1 - (timeLeft / 1500);
            
            ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.5})`;
            ctx.beginPath();
            ctx.arc(0, 0, enemy.radius + 10 * intensity, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 渲染敌人生命值条
    renderEnemyHealthBar(ctx, enemy) {
        const barWidth = enemy.radius * 2;
        const barHeight = 4;
        const y = -enemy.radius - 10;
        
        // 背景
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-barWidth / 2, y, barWidth, barHeight);
        
        // 生命值
        const healthPercentage = enemy.health / enemy.maxHealth;
        const healthColor = healthPercentage > 0.6 ? '#27ae60' : 
                           healthPercentage > 0.3 ? '#f39c12' : '#e74c3c';
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(-barWidth / 2, y, barWidth * healthPercentage, barHeight);
        
        // 边框
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1;
        ctx.strokeRect(-barWidth / 2, y, barWidth, barHeight);
    }
    
    // 获取敌人类型信息
    getEnemyTypeInfo(type) {
        return this.enemyTypes.get(type);
    }
    
    // 获取所有敌人类型
    getAllEnemyTypes() {
        return Array.from(this.enemyTypes.keys());
    }
    
    // 根据权重随机选择敌人类型
    getRandomEnemyType() {
        const types = Array.from(this.enemyTypes.entries());
        const totalWeight = types.reduce((sum, [_, data]) => sum + data.spawnWeight, 0);
        
        let random = Math.random() * totalWeight;
        
        for (const [type, data] of types) {
            random -= data.spawnWeight;
            if (random <= 0) {
                return type;
            }
        }
        
        return 'grunt'; // 默认返回基础敌人
    }
    
    // 设置难度倍数（用于动态难度调整）
    setDifficultyMultiplier(multipliers) {
        if (!multipliers || typeof multipliers !== 'object') {
            console.warn('EnemyDiversitySystem.setDifficultyMultiplier: Invalid multipliers object');
            return;
        }
        
        // 存储难度倍数
        this.difficultyMultipliers = {
            health: multipliers.health || 1.0,
            damage: multipliers.damage || 1.0,
            speed: multipliers.speed || 1.0,
            accuracy: multipliers.accuracy || 1.0
        };
        
        // 应用难度倍数到所有敌人类型
        for (const [type, data] of this.enemyTypes.entries()) {
            // 保存原始数据（如果还没有保存）
            if (!data.originalStats) {
                data.originalStats = {
                    health: data.health,
                    damage: data.damage,
                    speed: data.speed
                };
            }
            
            // 应用倍数
            data.health = Math.round(data.originalStats.health * this.difficultyMultipliers.health);
            data.damage = Math.round(data.originalStats.damage * this.difficultyMultipliers.damage);
            data.speed = data.originalStats.speed * this.difficultyMultipliers.speed;
        }
        
        console.log('敌人难度倍数已更新:', this.difficultyMultipliers);
    }
    
    // 获取当前难度倍数
    getDifficultyMultipliers() {
        return this.difficultyMultipliers || {
            health: 1.0,
            damage: 1.0,
            speed: 1.0,
            accuracy: 1.0
        };
    }
    
    // 重置难度倍数
    resetDifficultyMultipliers() {
        this.setDifficultyMultiplier({
            health: 1.0,
            damage: 1.0,
            speed: 1.0,
            accuracy: 1.0
        });
    }
}

// 创建全局实例
window.enemyDiversitySystem = new EnemyDiversitySystem();

console.log('敌人多样化系统已加载 - 支持9种不同类型的敌人');