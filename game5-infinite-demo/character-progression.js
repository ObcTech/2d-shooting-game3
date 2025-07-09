// 角色养成系统
class CharacterProgression {
    constructor() {
        this.level = 1;
        this.experience = 0;
        this.attributePoints = 0;
        this.skillPoints = 0;
        
        // 基础属性
        this.attributes = {
            health: 100,
            maxHealth: 100,
            attack: 10,
            defense: 5,
            speed: 100,
            criticalRate: 0.05,
            criticalDamage: 1.5,
            moveSpeed: 150,
            viewRange: 200,
            resourceEfficiency: 1.0,
            experienceBonus: 1.0,
            luck: 0.1
        };
        
        // 技能树
        this.skillTree = {
            combat: {
                weaponMastery: { level: 0, maxLevel: 10, cost: 1 },
                criticalStrike: { level: 0, maxLevel: 5, cost: 2 },
                berserkerRage: { level: 0, maxLevel: 3, cost: 3 },
                multiShot: { level: 0, maxLevel: 5, cost: 2 },
                weaponSpecialization: { level: 0, maxLevel: 5, cost: 3 }
            },
            survival: {
                healthBoost: { level: 0, maxLevel: 10, cost: 1 },
                armorMastery: { level: 0, maxLevel: 5, cost: 2 },
                regeneration: { level: 0, maxLevel: 5, cost: 3 },
                resistances: { level: 0, maxLevel: 5, cost: 2 },
                lastStand: { level: 0, maxLevel: 3, cost: 4 }
            },
            exploration: {
                speedBoost: { level: 0, maxLevel: 10, cost: 1 },
                treasureHunter: { level: 0, maxLevel: 5, cost: 2 },
                pathfinding: { level: 0, maxLevel: 3, cost: 3 },
                nightVision: { level: 0, maxLevel: 5, cost: 2 },
                mapMastery: { level: 0, maxLevel: 5, cost: 3 }
            },
            crafting: {
                advancedCrafting: { level: 0, maxLevel: 5, cost: 2 },
                resourceEfficiency: { level: 0, maxLevel: 10, cost: 1 },
                qualityBoost: { level: 0, maxLevel: 5, cost: 3 },
                massProduction: { level: 0, maxLevel: 3, cost: 4 },
                masterCraftsman: { level: 0, maxLevel: 3, cost: 5 }
            }
        };
        
        // 装备槽位
        this.equipment = {
            weapon: null,
            armor: null,
            helmet: null,
            boots: null,
            accessory1: null,
            accessory2: null
        };
        
        // 背包
        this.inventory = {
            items: [],
            capacity: 50
        };
        
        this.updateDerivedStats();
    }
    
    // 获取升级所需经验
    getExperienceRequired(level) {
        return Math.floor(100 * Math.pow(1.2, level - 1));
    }
    
    // 添加经验
    addExperience(amount) {
        const bonusAmount = Math.floor(amount * this.attributes.experienceBonus);
        this.experience += bonusAmount;
        
        let leveledUp = false;
        while (this.experience >= this.getExperienceRequired(this.level)) {
            this.experience -= this.getExperienceRequired(this.level);
            this.level++;
            this.attributePoints += 3;
            
            // 每5级获得技能点
            if (this.level % 5 === 0) {
                this.skillPoints += 1;
            }
            
            leveledUp = true;
        }
        
        if (leveledUp) {
            this.updateDerivedStats();
            return true;
        }
        return false;
    }
    
    // 分配属性点
    allocateAttributePoint(attribute) {
        if (this.attributePoints > 0 && this.attributes.hasOwnProperty(attribute)) {
            this.attributePoints--;
            
            switch (attribute) {
                case 'health':
                    this.attributes.health += 20;
                    this.attributes.maxHealth += 20;
                    break;
                case 'attack':
                    this.attributes.attack += 2;
                    break;
                case 'defense':
                    this.attributes.defense += 1;
                    break;
                case 'speed':
                    this.attributes.speed += 5;
                    break;
                case 'criticalRate':
                    this.attributes.criticalRate += 0.01;
                    break;
                case 'moveSpeed':
                    this.attributes.moveSpeed += 10;
                    break;
                case 'luck':
                    this.attributes.luck += 0.02;
                    break;
            }
            
            this.updateDerivedStats();
            return true;
        }
        return false;
    }
    
    // 学习技能
    learnSkill(branch, skillName) {
        if (!this.skillTree[branch] || !this.skillTree[branch][skillName]) {
            return false;
        }
        
        const skill = this.skillTree[branch][skillName];
        if (this.skillPoints >= skill.cost && skill.level < skill.maxLevel) {
            this.skillPoints -= skill.cost;
            skill.level++;
            this.applySkillEffect(branch, skillName, skill.level);
            return true;
        }
        return false;
    }
    
    // 应用技能效果
    applySkillEffect(branch, skillName, level) {
        switch (branch) {
            case 'combat':
                switch (skillName) {
                    case 'weaponMastery':
                        this.attributes.attack += 2 * level;
                        break;
                    case 'criticalStrike':
                        this.attributes.criticalRate += 0.02 * level;
                        this.attributes.criticalDamage += 0.1 * level;
                        break;
                    case 'berserkerRage':
                        // 特殊技能，在战斗中激活
                        break;
                }
                break;
                
            case 'survival':
                switch (skillName) {
                    case 'healthBoost':
                        this.attributes.maxHealth += 15 * level;
                        this.attributes.health += 15 * level;
                        break;
                    case 'armorMastery':
                        this.attributes.defense += 2 * level;
                        break;
                    case 'regeneration':
                        // 生命恢复，在更新中处理
                        break;
                }
                break;
                
            case 'exploration':
                switch (skillName) {
                    case 'speedBoost':
                        this.attributes.moveSpeed += 8 * level;
                        break;
                    case 'treasureHunter':
                        this.attributes.luck += 0.05 * level;
                        break;
                    case 'pathfinding':
                        this.attributes.viewRange += 30 * level;
                        break;
                }
                break;
                
            case 'crafting':
                switch (skillName) {
                    case 'resourceEfficiency':
                        this.attributes.resourceEfficiency += 0.1 * level;
                        break;
                    case 'advancedCrafting':
                        // 解锁高级配方
                        break;
                }
                break;
        }
        
        this.updateDerivedStats();
    }
    
    // 装备物品
    equipItem(item, slot) {
        if (this.equipment.hasOwnProperty(slot)) {
            // 卸下当前装备
            if (this.equipment[slot]) {
                this.unequipItem(slot);
            }
            
            // 装备新物品
            this.equipment[slot] = item;
            this.applyEquipmentStats(item, true);
            
            // 从背包移除
            const index = this.inventory.items.indexOf(item);
            if (index > -1) {
                this.inventory.items.splice(index, 1);
            }
            
            this.updateDerivedStats();
            return true;
        }
        return false;
    }
    
    // 卸下装备
    unequipItem(slot) {
        if (this.equipment[slot]) {
            const item = this.equipment[slot];
            this.applyEquipmentStats(item, false);
            
            // 放回背包
            if (this.inventory.items.length < this.inventory.capacity) {
                this.inventory.items.push(item);
            }
            
            this.equipment[slot] = null;
            this.updateDerivedStats();
            return item;
        }
        return null;
    }
    
    // 应用装备属性
    applyEquipmentStats(item, equip) {
        if (!item.stats) return;
        
        const multiplier = equip ? 1 : -1;
        
        for (const [stat, value] of Object.entries(item.stats)) {
            if (this.attributes.hasOwnProperty(stat)) {
                this.attributes[stat] += value * multiplier;
            }
        }
    }
    
    // 更新衍生属性
    updateDerivedStats() {
        // 确保生命值不超过最大值
        this.attributes.health = Math.min(this.attributes.health, this.attributes.maxHealth);
        
        // 确保属性在合理范围内
        this.attributes.criticalRate = Math.max(0, Math.min(1, this.attributes.criticalRate));
        this.attributes.luck = Math.max(0, Math.min(1, this.attributes.luck));
    }
    
    // 获取角色总战力
    getPowerLevel() {
        return Math.floor(
            this.attributes.attack * 2 +
            this.attributes.defense * 1.5 +
            this.attributes.maxHealth * 0.1 +
            this.attributes.criticalRate * 100 +
            this.level * 10
        );
    }
    
    // 获取技能分支总等级
    getSkillBranchLevel(branch) {
        if (!this.skillTree[branch]) return 0;
        
        let totalLevel = 0;
        for (const skill of Object.values(this.skillTree[branch])) {
            totalLevel += skill.level;
        }
        return totalLevel;
    }
    
    // 获取角色数据
    getCharacterData() {
        return {
            level: this.level,
            experience: this.experience,
            experienceRequired: this.getExperienceRequired(this.level),
            attributePoints: this.attributePoints,
            skillPoints: this.skillPoints,
            attributes: { ...this.attributes },
            powerLevel: this.getPowerLevel(),
            skillBranches: {
                combat: this.getSkillBranchLevel('combat'),
                survival: this.getSkillBranchLevel('survival'),
                exploration: this.getSkillBranchLevel('exploration'),
                crafting: this.getSkillBranchLevel('crafting')
            }
        };
    }
    
    // 保存数据
    saveData() {
        return {
            level: this.level,
            experience: this.experience,
            attributePoints: this.attributePoints,
            skillPoints: this.skillPoints,
            attributes: this.attributes,
            skillTree: this.skillTree,
            equipment: this.equipment,
            inventory: this.inventory
        };
    }
    
    // 加载数据
    loadData(data) {
        if (data) {
            this.level = data.level || 1;
            this.experience = data.experience || 0;
            this.attributePoints = data.attributePoints || 0;
            this.skillPoints = data.skillPoints || 0;
            this.attributes = { ...this.attributes, ...data.attributes };
            this.skillTree = { ...this.skillTree, ...data.skillTree };
            this.equipment = { ...this.equipment, ...data.equipment };
            this.inventory = { ...this.inventory, ...data.inventory };
            this.updateDerivedStats();
        }
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.CharacterProgression = CharacterProgression;
}