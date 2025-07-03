/**
 * 群体行为系统
 * 实现敌人的集群行为、协调攻击、阵型变换和群体智能
 */

class GroupBehaviorSystem {
    constructor() {
        this.groups = new Map();
        this.formations = this.initializeFormations();
        this.coordinationRules = this.initializeCoordinationRules();
        this.flockingParameters = this.initializeFlockingParameters();
        this.groupCounter = 0;
        this.maxGroupSize = 8;
        this.minGroupSize = 2;
        this.groupFormationDistance = 150;
    }

    // 初始化阵型配置
    initializeFormations() {
        return {
            line: {
                name: '一字阵',
                positions: (count) => {
                    const positions = [];
                    const spacing = 50;
                    const startX = -(count - 1) * spacing / 2;
                    
                    for (let i = 0; i < count; i++) {
                        positions.push({
                            x: startX + i * spacing,
                            y: 0,
                            role: i === 0 ? 'leader' : 'follower'
                        });
                    }
                    return positions;
                },
                effectiveness: 0.7,
                mobility: 0.8
            },
            wedge: {
                name: '楔形阵',
                positions: (count) => {
                    const positions = [];
                    positions.push({ x: 0, y: 0, role: 'leader' });
                    
                    for (let i = 1; i < count; i++) {
                        const row = Math.floor((i - 1) / 2) + 1;
                        const side = (i - 1) % 2 === 0 ? -1 : 1;
                        
                        positions.push({
                            x: side * row * 30,
                            y: -row * 40,
                            role: 'follower'
                        });
                    }
                    return positions;
                },
                effectiveness: 0.9,
                mobility: 0.6
            },
            circle: {
                name: '环形阵',
                positions: (count) => {
                    const positions = [];
                    const radius = Math.max(40, count * 8);
                    
                    for (let i = 0; i < count; i++) {
                        const angle = (i / count) * Math.PI * 2;
                        positions.push({
                            x: Math.cos(angle) * radius,
                            y: Math.sin(angle) * radius,
                            role: i === 0 ? 'leader' : 'follower'
                        });
                    }
                    return positions;
                },
                effectiveness: 0.8,
                mobility: 0.5
            },
            diamond: {
                name: '菱形阵',
                positions: (count) => {
                    const positions = [];
                    
                    if (count >= 1) positions.push({ x: 0, y: -60, role: 'leader' }); // 前锋
                    if (count >= 2) positions.push({ x: -40, y: 0, role: 'follower' }); // 左翼
                    if (count >= 3) positions.push({ x: 40, y: 0, role: 'follower' }); // 右翼
                    if (count >= 4) positions.push({ x: 0, y: 60, role: 'follower' }); // 后卫
                    
                    // 填充剩余位置
                    for (let i = 4; i < count; i++) {
                        const angle = (i - 4) / (count - 4) * Math.PI * 2;
                        positions.push({
                            x: Math.cos(angle) * 30,
                            y: Math.sin(angle) * 30,
                            role: 'support'
                        });
                    }
                    
                    return positions;
                },
                effectiveness: 0.85,
                mobility: 0.7
            },
            phalanx: {
                name: '方阵',
                positions: (count) => {
                    const positions = [];
                    const rows = Math.ceil(Math.sqrt(count));
                    const cols = Math.ceil(count / rows);
                    const spacing = 45;
                    
                    for (let i = 0; i < count; i++) {
                        const row = Math.floor(i / cols);
                        const col = i % cols;
                        
                        positions.push({
                            x: (col - (cols - 1) / 2) * spacing,
                            y: (row - (rows - 1) / 2) * spacing,
                            role: row === 0 && col === Math.floor(cols / 2) ? 'leader' : 'follower'
                        });
                    }
                    
                    return positions;
                },
                effectiveness: 0.95,
                mobility: 0.3
            }
        };
    }

    // 初始化协调规则
    initializeCoordinationRules() {
        return {
            synchronizedAttack: {
                name: '同步攻击',
                condition: (group) => group.members.length >= 3,
                execute: (group, target) => this.executeSynchronizedAttack(group, target)
            },
            flanking: {
                name: '包抄战术',
                condition: (group) => group.members.length >= 4,
                execute: (group, target) => this.executeFlankingManeuver(group, target)
            },
            coverAndAdvance: {
                name: '掩护前进',
                condition: (group) => group.members.length >= 2,
                execute: (group, target) => this.executeCoverAndAdvance(group, target)
            },
            suppressiveFire: {
                name: '压制射击',
                condition: (group) => group.members.some(m => m.type === 'sniper' || m.type === 'heavy'),
                execute: (group, target) => this.executeSuppressiveFire(group, target)
            },
            tacticalRetreat: {
                name: '战术撤退',
                condition: (group) => group.averageHealth < 0.4,
                execute: (group, target) => this.executeTacticalRetreat(group, target)
            }
        };
    }

    // 初始化集群参数
    initializeFlockingParameters() {
        return {
            cohesion: {
                weight: 0.3,
                radius: 100,
                strength: 0.02
            },
            separation: {
                weight: 0.5,
                radius: 50,
                strength: 0.05
            },
            alignment: {
                weight: 0.2,
                radius: 80,
                strength: 0.03
            },
            avoidance: {
                weight: 0.8,
                radius: 30,
                strength: 0.1
            }
        };
    }

    // 更新群体行为系统
    update(enemies, player, obstacles, deltaTime) {
        // 更新现有群体
        this.updateExistingGroups(enemies, player, deltaTime);
        
        // 形成新群体
        this.formNewGroups(enemies);
        
        // 解散无效群体
        this.disbandInvalidGroups();
        
        // 执行群体行为
        this.executeGroupBehaviors(player, obstacles, deltaTime);
    }

    // 更新现有群体
    updateExistingGroups(enemies, player, deltaTime) {
        this.groups.forEach((group, groupId) => {
            // 移除死亡或距离过远的成员
            group.members = group.members.filter(member => {
                if (!member.health || member.health <= 0) return false;
                
                const distanceToGroup = this.getAverageDistanceToGroup(member, group);
                return distanceToGroup < this.groupFormationDistance * 2;
            });
            
            // 更新群体状态
            this.updateGroupState(group, player, deltaTime);
            
            // 更新群体统计
            this.updateGroupStats(group);
        });
    }

    // 形成新群体
    formNewGroups(enemies) {
        const ungroupedEnemies = enemies.filter(enemy => !this.isInGroup(enemy));
        
        ungroupedEnemies.forEach(enemy => {
            const nearbyEnemies = this.findNearbyEnemies(enemy, ungroupedEnemies, this.groupFormationDistance);
            
            if (nearbyEnemies.length >= this.minGroupSize - 1) {
                const groupMembers = [enemy, ...nearbyEnemies.slice(0, this.maxGroupSize - 1)];
                this.createGroup(groupMembers);
            }
        });
    }

    // 创建群体
    createGroup(members) {
        const groupId = `group_${this.groupCounter++}`;
        const leader = this.selectGroupLeader(members);
        
        const group = {
            id: groupId,
            members: members,
            leader: leader,
            formation: this.selectOptimalFormation(members),
            state: 'FORMING',
            target: null,
            coordination: null,
            createdTime: Date.now(),
            lastUpdate: Date.now(),
            centerX: 0,
            centerY: 0,
            averageHealth: 1.0,
            cohesion: 0.0,
            effectiveness: 0.0
        };
        
        // 标记成员属于该群体
        members.forEach(member => {
            member.groupId = groupId;
            member.groupRole = member === leader ? 'leader' : 'follower';
        });
        
        this.groups.set(groupId, group);
        console.log(`Created group ${groupId} with ${members.length} members`);
        
        return group;
    }

    // 选择群体领导者
    selectGroupLeader(members) {
        // 优先选择特定类型的敌人作为领导者
        const leaderPriority = {
            'elite_guard': 10,
            'heavy': 8,
            'sniper': 7,
            'infantry': 5,
            'scout': 4,
            'medic': 3,
            'demolition': 2,
            'assassin': 1
        };
        
        members.sort((a, b) => {
            const priorityA = leaderPriority[a.type] || 0;
            const priorityB = leaderPriority[b.type] || 0;
            
            if (priorityA !== priorityB) {
                return priorityB - priorityA;
            }
            
            // 如果优先级相同，选择血量更高的
            return (b.health / b.maxHealth) - (a.health / a.maxHealth);
        });
        
        return members[0];
    }

    // 选择最优阵型
    selectOptimalFormation(members) {
        const count = members.length;
        const types = members.map(m => m.type);
        
        // 根据成员类型和数量选择阵型
        if (types.includes('sniper') && count >= 4) {
            return 'diamond'; // 狙击手适合菱形阵
        } else if (types.includes('heavy') && count >= 5) {
            return 'phalanx'; // 重装兵适合方阵
        } else if (count >= 6) {
            return 'wedge'; // 大群体适合楔形阵
        } else if (count >= 4) {
            return 'diamond'; // 中等群体适合菱形阵
        } else {
            return 'line'; // 小群体适合一字阵
        }
    }

    // 解散无效群体
    disbandInvalidGroups() {
        const groupsToDisband = [];
        
        this.groups.forEach((group, groupId) => {
            if (group.members.length < this.minGroupSize || 
                !group.leader || 
                group.leader.health <= 0) {
                groupsToDisband.push(groupId);
            }
        });
        
        groupsToDisband.forEach(groupId => {
            this.disbandGroup(groupId);
        });
    }

    // 解散群体
    disbandGroup(groupId) {
        const group = this.groups.get(groupId);
        if (group) {
            // 清除成员的群体标记
            group.members.forEach(member => {
                delete member.groupId;
                delete member.groupRole;
                delete member.formationPosition;
            });
            
            this.groups.delete(groupId);
            console.log(`Disbanded group ${groupId}`);
        }
    }

    // 执行群体行为
    executeGroupBehaviors(player, obstacles, deltaTime) {
        this.groups.forEach(group => {
            // 更新群体目标
            this.updateGroupTarget(group, player);
            
            // 执行阵型行为
            this.executeFormationBehavior(group, deltaTime);
            
            // 执行协调行为
            this.executeCoordinationBehavior(group, player, deltaTime);
            
            // 执行集群行为
            this.executeFlockingBehavior(group, deltaTime);
        });
    }

    // 更新群体目标
    updateGroupTarget(group, player) {
        // 简化：总是以玩家为目标
        group.target = player;
        
        // 计算群体到目标的距离
        const distance = Math.sqrt(
            Math.pow(group.centerX - player.x, 2) + 
            Math.pow(group.centerY - player.y, 2)
        );
        
        // 根据距离更新群体状态
        if (distance < 150 && group.state !== 'COMBAT') {
            this.transitionGroupState(group, 'COMBAT');
        } else if (distance < 300 && group.state === 'PATROL') {
            this.transitionGroupState(group, 'APPROACH');
        }
    }

    // 执行阵型行为
    executeFormationBehavior(group, deltaTime) {
        const formation = this.formations[group.formation];
        if (!formation) return;
        
        const positions = formation.positions(group.members.length);
        const leaderAngle = this.getLeaderFacingAngle(group);
        
        group.members.forEach((member, index) => {
            if (index >= positions.length) return;
            
            const pos = positions[index];
            
            // 计算世界坐标中的目标位置
            const targetX = group.centerX + 
                pos.x * Math.cos(leaderAngle) - pos.y * Math.sin(leaderAngle);
            const targetY = group.centerY + 
                pos.x * Math.sin(leaderAngle) + pos.y * Math.cos(leaderAngle);
            
            // 存储阵型位置信息
            member.formationPosition = {
                targetX: targetX,
                targetY: targetY,
                role: pos.role
            };
            
            // 计算移动到阵型位置的力
            const dx = targetX - member.x;
            const dy = targetY - member.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 20) {
                const formationForce = 0.3;
                member.vx = (member.vx || 0) + (dx / distance) * formationForce;
                member.vy = (member.vy || 0) + (dy / distance) * formationForce;
            }
        });
    }

    // 获取领导者面向角度
    getLeaderFacingAngle(group) {
        if (group.target && group.leader) {
            return Math.atan2(
                group.target.y - group.leader.y,
                group.target.x - group.leader.x
            );
        }
        return group.leader?.facingAngle || 0;
    }

    // 执行协调行为
    executeCoordinationBehavior(group, player, deltaTime) {
        // 选择合适的协调策略
        const availableRules = Object.values(this.coordinationRules)
            .filter(rule => rule.condition(group));
        
        if (availableRules.length > 0) {
            // 选择最适合当前情况的规则
            const selectedRule = this.selectBestCoordinationRule(group, availableRules, player);
            
            if (selectedRule) {
                group.coordination = selectedRule.name;
                selectedRule.execute(group, player);
            }
        }
    }

    // 选择最佳协调规则
    selectBestCoordinationRule(group, availableRules, player) {
        const distance = Math.sqrt(
            Math.pow(group.centerX - player.x, 2) + 
            Math.pow(group.centerY - player.y, 2)
        );
        
        // 根据情况选择策略
        if (group.averageHealth < 0.4) {
            return availableRules.find(rule => rule.name === '战术撤退');
        } else if (distance < 100) {
            return availableRules.find(rule => rule.name === '同步攻击');
        } else if (distance < 200 && group.members.length >= 4) {
            return availableRules.find(rule => rule.name === '包抄战术');
        } else {
            return availableRules.find(rule => rule.name === '掩护前进');
        }
    }

    // 执行同步攻击
    executeSynchronizedAttack(group, target) {
        const attackRange = 150;
        const membersInRange = group.members.filter(member => {
            const distance = Math.sqrt(
                Math.pow(member.x - target.x, 2) + 
                Math.pow(member.y - target.y, 2)
            );
            return distance <= attackRange;
        });
        
        if (membersInRange.length >= 2) {
            // 同步攻击时机
            const readyToAttack = membersInRange.every(member => 
                !member.attackCooldown || member.attackCooldown <= 100
            );
            
            if (readyToAttack) {
                membersInRange.forEach(member => {
                    member.coordinatedAttack = true;
                    member.attackCooldown = 0;
                    member.animationState = 'attacking';
                });
            } else {
                // 等待同步
                membersInRange.forEach(member => {
                    if (!member.attackCooldown || member.attackCooldown <= 100) {
                        member.attackCooldown = 100;
                    }
                });
            }
        }
    }

    // 执行包抄战术
    executeFlankingManeuver(group, target) {
        const members = group.members;
        const halfCount = Math.floor(members.length / 2);
        
        // 分成两组进行包抄
        const leftFlank = members.slice(0, halfCount);
        const rightFlank = members.slice(halfCount);
        
        const targetAngle = Math.atan2(
            target.y - group.centerY,
            target.x - group.centerX
        );
        
        // 左翼包抄
        leftFlank.forEach(member => {
            const flankAngle = targetAngle + Math.PI / 3;
            const targetX = target.x + Math.cos(flankAngle) * 120;
            const targetY = target.y + Math.sin(flankAngle) * 120;
            
            member.flankTarget = { x: targetX, y: targetY };
            member.tacticalRole = 'left_flank';
        });
        
        // 右翼包抄
        rightFlank.forEach(member => {
            const flankAngle = targetAngle - Math.PI / 3;
            const targetX = target.x + Math.cos(flankAngle) * 120;
            const targetY = target.y + Math.sin(flankAngle) * 120;
            
            member.flankTarget = { x: targetX, y: targetY };
            member.tacticalRole = 'right_flank';
        });
    }

    // 执行掩护前进
    executeCoverAndAdvance(group, target) {
        const members = group.members;
        const halfCount = Math.floor(members.length / 2);
        
        // 分成掩护组和前进组
        const coverTeam = members.slice(0, halfCount);
        const advanceTeam = members.slice(halfCount);
        
        // 掩护组提供火力支援
        coverTeam.forEach(member => {
            member.tacticalRole = 'cover';
            member.shouldAttack = true;
            
            // 保持距离进行掩护射击
            const distance = Math.sqrt(
                Math.pow(member.x - target.x, 2) + 
                Math.pow(member.y - target.y, 2)
            );
            
            if (distance < 180) {
                const angle = Math.atan2(member.y - target.y, member.x - target.x);
                const speed = member.speed * 0.5;
                member.vx = Math.cos(angle) * speed;
                member.vy = Math.sin(angle) * speed;
            }
        });
        
        // 前进组向目标推进
        advanceTeam.forEach(member => {
            member.tacticalRole = 'advance';
            
            const angle = Math.atan2(target.y - member.y, target.x - member.x);
            const speed = member.speed * 0.8;
            member.vx = Math.cos(angle) * speed;
            member.vy = Math.sin(angle) * speed;
        });
    }

    // 执行压制射击
    executeSuppressiveFire(group, target) {
        const heavyUnits = group.members.filter(member => 
            member.type === 'sniper' || member.type === 'heavy'
        );
        
        heavyUnits.forEach(member => {
            member.tacticalRole = 'suppression';
            member.suppressiveFire = true;
            
            // 增加射击频率
            if (member.attackInterval) {
                member.attackInterval *= 0.7;
            }
            
            // 保持最佳射击距离
            const distance = Math.sqrt(
                Math.pow(member.x - target.x, 2) + 
                Math.pow(member.y - target.y, 2)
            );
            
            const optimalRange = member.type === 'sniper' ? 250 : 150;
            
            if (Math.abs(distance - optimalRange) > 30) {
                const angle = Math.atan2(target.y - member.y, target.x - member.x);
                const direction = distance > optimalRange ? 1 : -1;
                const speed = member.speed * 0.3;
                
                member.vx = Math.cos(angle) * speed * direction;
                member.vy = Math.sin(angle) * speed * direction;
            }
        });
    }

    // 执行战术撤退
    executeTacticalRetreat(group, target) {
        const retreatAngle = Math.atan2(
            group.centerY - target.y,
            group.centerX - target.x
        );
        
        group.members.forEach((member, index) => {
            member.tacticalRole = 'retreat';
            
            // 计算撤退位置
            const spreadAngle = (index - group.members.length / 2) * 0.3;
            const finalAngle = retreatAngle + spreadAngle;
            
            const retreatDistance = 200;
            const targetX = member.x + Math.cos(finalAngle) * retreatDistance;
            const targetY = member.y + Math.sin(finalAngle) * retreatDistance;
            
            member.retreatTarget = { x: targetX, y: targetY };
            
            // 边撤退边射击
            if (Math.random() < 0.3) {
                member.shouldAttack = true;
            }
        });
    }

    // 执行集群行为
    executeFlockingBehavior(group, deltaTime) {
        group.members.forEach(member => {
            const neighbors = group.members.filter(other => {
                if (other === member) return false;
                
                const distance = Math.sqrt(
                    Math.pow(other.x - member.x, 2) + 
                    Math.pow(other.y - member.y, 2)
                );
                
                return distance < this.flockingParameters.cohesion.radius;
            });
            
            if (neighbors.length > 0) {
                // 计算集群力
                const cohesionForce = this.calculateCohesion(member, neighbors);
                const separationForce = this.calculateSeparation(member, neighbors);
                const alignmentForce = this.calculateAlignment(member, neighbors);
                
                // 应用集群力
                const params = this.flockingParameters;
                member.vx = (member.vx || 0) + 
                    cohesionForce.x * params.cohesion.weight +
                    separationForce.x * params.separation.weight +
                    alignmentForce.x * params.alignment.weight;
                    
                member.vy = (member.vy || 0) + 
                    cohesionForce.y * params.cohesion.weight +
                    separationForce.y * params.separation.weight +
                    alignmentForce.y * params.alignment.weight;
            }
        });
    }

    // 计算聚合力
    calculateCohesion(member, neighbors) {
        const avgX = neighbors.reduce((sum, n) => sum + n.x, 0) / neighbors.length;
        const avgY = neighbors.reduce((sum, n) => sum + n.y, 0) / neighbors.length;
        
        const dx = avgX - member.x;
        const dy = avgY - member.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            return {
                x: (dx / distance) * this.flockingParameters.cohesion.strength,
                y: (dy / distance) * this.flockingParameters.cohesion.strength
            };
        }
        
        return { x: 0, y: 0 };
    }

    // 计算分离力
    calculateSeparation(member, neighbors) {
        let separationX = 0;
        let separationY = 0;
        let count = 0;
        
        neighbors.forEach(neighbor => {
            const dx = member.x - neighbor.x;
            const dy = member.y - neighbor.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < this.flockingParameters.separation.radius) {
                separationX += dx / distance;
                separationY += dy / distance;
                count++;
            }
        });
        
        if (count > 0) {
            return {
                x: (separationX / count) * this.flockingParameters.separation.strength,
                y: (separationY / count) * this.flockingParameters.separation.strength
            };
        }
        
        return { x: 0, y: 0 };
    }

    // 计算对齐力
    calculateAlignment(member, neighbors) {
        const avgVx = neighbors.reduce((sum, n) => sum + (n.vx || 0), 0) / neighbors.length;
        const avgVy = neighbors.reduce((sum, n) => sum + (n.vy || 0), 0) / neighbors.length;
        
        return {
            x: (avgVx - (member.vx || 0)) * this.flockingParameters.alignment.strength,
            y: (avgVy - (member.vy || 0)) * this.flockingParameters.alignment.strength
        };
    }

    // 更新群体状态
    updateGroupState(group, player, deltaTime) {
        // 计算群体中心
        group.centerX = group.members.reduce((sum, m) => sum + m.x, 0) / group.members.length;
        group.centerY = group.members.reduce((sum, m) => sum + m.y, 0) / group.members.length;
        
        // 更新时间戳
        group.lastUpdate = Date.now();
    }

    // 更新群体统计
    updateGroupStats(group) {
        // 计算平均血量
        group.averageHealth = group.members.reduce((sum, m) => 
            sum + (m.health / m.maxHealth), 0
        ) / group.members.length;
        
        // 计算群体凝聚度
        let totalDistance = 0;
        let pairCount = 0;
        
        for (let i = 0; i < group.members.length; i++) {
            for (let j = i + 1; j < group.members.length; j++) {
                const distance = Math.sqrt(
                    Math.pow(group.members[i].x - group.members[j].x, 2) +
                    Math.pow(group.members[i].y - group.members[j].y, 2)
                );
                totalDistance += distance;
                pairCount++;
            }
        }
        
        const averageDistance = pairCount > 0 ? totalDistance / pairCount : 0;
        group.cohesion = Math.max(0, 1 - averageDistance / this.groupFormationDistance);
        
        // 计算群体效率
        const formation = this.formations[group.formation];
        group.effectiveness = formation ? 
            formation.effectiveness * group.cohesion * group.averageHealth : 0;
    }

    // 状态转换
    transitionGroupState(group, newState) {
        if (group.state !== newState) {
            console.log(`Group ${group.id} transitioning from ${group.state} to ${newState}`);
            group.state = newState;
            
            // 状态转换时的特殊处理
            switch (newState) {
                case 'COMBAT':
                    group.combatStartTime = Date.now();
                    break;
                case 'RETREAT':
                    group.retreatStartTime = Date.now();
                    break;
            }
        }
    }

    // 辅助方法
    isInGroup(enemy) {
        return enemy.groupId !== undefined;
    }

    findNearbyEnemies(enemy, enemies, maxDistance) {
        return enemies.filter(other => {
            if (other === enemy) return false;
            
            const distance = Math.sqrt(
                Math.pow(other.x - enemy.x, 2) + 
                Math.pow(other.y - enemy.y, 2)
            );
            
            return distance <= maxDistance;
        });
    }

    getAverageDistanceToGroup(enemy, group) {
        if (group.members.length <= 1) return 0;
        
        const totalDistance = group.members.reduce((sum, member) => {
            if (member === enemy) return sum;
            
            return sum + Math.sqrt(
                Math.pow(member.x - enemy.x, 2) + 
                Math.pow(member.y - enemy.y, 2)
            );
        }, 0);
        
        return totalDistance / (group.members.length - 1);
    }

    // 调试和可视化
    renderDebugInfo(ctx, enemies) {
        if (!this.debugMode) return;
        
        ctx.save();
        
        // 绘制群体信息
        this.groups.forEach(group => {
            // 绘制群体中心
            ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
            ctx.beginPath();
            ctx.arc(group.centerX, group.centerY, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // 绘制群体范围
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(group.centerX, group.centerY, this.groupFormationDistance, 0, Math.PI * 2);
            ctx.stroke();
            
            // 绘制群体连线
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            group.members.forEach(member => {
                ctx.beginPath();
                ctx.moveTo(group.centerX, group.centerY);
                ctx.lineTo(member.x, member.y);
                ctx.stroke();
            });
            
            // 绘制阵型位置
            if (group.formation) {
                ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
                group.members.forEach(member => {
                    if (member.formationPosition) {
                        ctx.beginPath();
                        ctx.arc(
                            member.formationPosition.targetX, 
                            member.formationPosition.targetY, 
                            5, 0, Math.PI * 2
                        );
                        ctx.fill();
                        
                        // 连线到目标位置
                        ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
                        ctx.beginPath();
                        ctx.moveTo(member.x, member.y);
                        ctx.lineTo(
                            member.formationPosition.targetX, 
                            member.formationPosition.targetY
                        );
                        ctx.stroke();
                    }
                });
            }
            
            // 绘制群体信息文本
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(
                `${group.id} (${group.members.length})`,
                group.centerX - 40, group.centerY - 20
            );
            ctx.fillText(
                `${group.formation} - ${group.state}`,
                group.centerX - 40, group.centerY - 8
            );
            ctx.fillText(
                `Health: ${(group.averageHealth * 100).toFixed(0)}%`,
                group.centerX - 40, group.centerY + 4
            );
            ctx.fillText(
                `Cohesion: ${(group.cohesion * 100).toFixed(0)}%`,
                group.centerX - 40, group.centerY + 16
            );
        });
        
        // 绘制个体群体信息
        enemies.forEach(enemy => {
            if (enemy.groupId) {
                ctx.fillStyle = 'cyan';
                ctx.font = '10px Arial';
                ctx.fillText(
                    `${enemy.groupId}`,
                    enemy.x - 20, enemy.y + 25
                );
                ctx.fillText(
                    `${enemy.groupRole || 'member'}`,
                    enemy.x - 20, enemy.y + 35
                );
                
                if (enemy.tacticalRole) {
                    ctx.fillText(
                        `${enemy.tacticalRole}`,
                        enemy.x - 20, enemy.y + 45
                    );
                }
            }
        });
        
        ctx.restore();
    }

    // 设置调试模式
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    // 获取群体统计信息
    getGroupStats() {
        const stats = {
            totalGroups: this.groups.size,
            totalMembers: 0,
            averageGroupSize: 0,
            formations: {},
            states: {},
            averageCohesion: 0,
            averageEffectiveness: 0
        };
        
        let totalCohesion = 0;
        let totalEffectiveness = 0;
        
        this.groups.forEach(group => {
            stats.totalMembers += group.members.length;
            
            stats.formations[group.formation] = (stats.formations[group.formation] || 0) + 1;
            stats.states[group.state] = (stats.states[group.state] || 0) + 1;
            
            totalCohesion += group.cohesion;
            totalEffectiveness += group.effectiveness;
        });
        
        if (this.groups.size > 0) {
            stats.averageGroupSize = stats.totalMembers / this.groups.size;
            stats.averageCohesion = totalCohesion / this.groups.size;
            stats.averageEffectiveness = totalEffectiveness / this.groups.size;
        }
        
        return stats;
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.GroupBehaviorSystem = GroupBehaviorSystem;
}