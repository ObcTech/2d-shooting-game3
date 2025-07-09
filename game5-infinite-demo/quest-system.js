// 任务系统
class QuestSystem {
    constructor() {
        this.activeQuests = new Map();
        this.completedQuests = new Set();
        this.questTemplates = new Map();
        this.questCounter = 0;
        
        this.initializeQuestTemplates();
    }
    
    // 初始化任务模板
    initializeQuestTemplates() {
        // 主线任务
        this.addQuestTemplate('main_001', {
            title: '建立基地',
            description: '在这片荒芜的土地上建立你的第一个基地',
            type: 'main',
            objectives: [
                { type: 'build', target: 'headquarters', amount: 1, current: 0 }
            ],
            rewards: {
                experience: 100,
                resources: { wood: 50, stone: 30 }
            },
            prerequisites: [],
            unlocks: ['main_002']
        });
        
        this.addQuestTemplate('main_002', {
            title: '资源收集',
            description: '收集足够的资源来扩展你的基地',
            type: 'main',
            objectives: [
                { type: 'collect', target: 'wood', amount: 100, current: 0 },
                { type: 'collect', target: 'stone', amount: 50, current: 0 }
            ],
            rewards: {
                experience: 150,
                resources: { metal: 20 }
            },
            prerequisites: ['main_001'],
            unlocks: ['main_003']
        });
        
        this.addQuestTemplate('main_003', {
            title: '建造工作坊',
            description: '建造一个工作坊来制作更好的装备',
            type: 'main',
            objectives: [
                { type: 'build', target: 'workshop', amount: 1, current: 0 }
            ],
            rewards: {
                experience: 200,
                items: ['basic_weapon_blueprint']
            },
            prerequisites: ['main_002'],
            unlocks: ['main_004']
        });
        
        // 支线任务
        this.addQuestTemplate('side_001', {
            title: '清理周边',
            description: '消灭基地周围的敌人威胁',
            type: 'side',
            objectives: [
                { type: 'kill', target: 'any_enemy', amount: 10, current: 0 }
            ],
            rewards: {
                experience: 80,
                resources: { wood: 20 }
            },
            prerequisites: [],
            unlocks: []
        });
        
        this.addQuestTemplate('side_002', {
            title: '探索者',
            description: '探索新的区域，发现未知的秘密',
            type: 'side',
            objectives: [
                { type: 'explore', target: 'new_biome', amount: 3, current: 0 }
            ],
            rewards: {
                experience: 120,
                items: ['map_fragment']
            },
            prerequisites: [],
            unlocks: ['side_003']
        });
        
        // 日常任务
        this.addQuestTemplate('daily_001', {
            title: '每日收集',
            description: '收集日常所需的基础资源',
            type: 'daily',
            objectives: [
                { type: 'collect', target: 'wood', amount: 50, current: 0 },
                { type: 'collect', target: 'stone', amount: 25, current: 0 }
            ],
            rewards: {
                experience: 50,
                resources: { food: 10 }
            },
            prerequisites: [],
            unlocks: [],
            resetDaily: true
        });
        
        this.addQuestTemplate('daily_002', {
            title: '每日战斗',
            description: '与敌人战斗，保持战斗技能',
            type: 'daily',
            objectives: [
                { type: 'kill', target: 'any_enemy', amount: 5, current: 0 }
            ],
            rewards: {
                experience: 60,
                resources: { metal: 5 }
            },
            prerequisites: [],
            unlocks: [],
            resetDaily: true
        });
        
        // 成就任务
        this.addQuestTemplate('achievement_001', {
            title: '建筑大师',
            description: '建造10个不同的建筑',
            type: 'achievement',
            objectives: [
                { type: 'build_different', target: 'any_building', amount: 10, current: 0 }
            ],
            rewards: {
                experience: 500,
                title: 'Master Builder'
            },
            prerequisites: [],
            unlocks: []
        });
        
        this.addQuestTemplate('achievement_002', {
            title: '探险家',
            description: '探索所有类型的生物群系',
            type: 'achievement',
            objectives: [
                { type: 'explore_all_biomes', target: 'biomes', amount: 5, current: 0 }
            ],
            rewards: {
                experience: 800,
                title: 'Explorer',
                items: ['legendary_compass']
            },
            prerequisites: [],
            unlocks: []
        });
    }
    
    // 添加任务模板
    addQuestTemplate(id, template) {
        this.questTemplates.set(id, template);
    }
    
    // 开始任务
    startQuest(templateId) {
        const template = this.questTemplates.get(templateId);
        if (!template) return false;
        
        // 检查前置条件
        for (const prereq of template.prerequisites) {
            if (!this.completedQuests.has(prereq)) {
                return false;
            }
        }
        
        // 检查是否已经有相同任务
        for (const quest of this.activeQuests.values()) {
            if (quest.templateId === templateId) {
                return false;
            }
        }
        
        // 创建任务实例
        const questId = `quest_${++this.questCounter}`;
        const quest = {
            id: questId,
            templateId: templateId,
            title: template.title,
            description: template.description,
            type: template.type,
            objectives: template.objectives.map(obj => ({ ...obj })),
            rewards: { ...template.rewards },
            startTime: Date.now(),
            isCompleted: false
        };
        
        this.activeQuests.set(questId, quest);
        return quest;
    }
    
    // 更新任务进度
    updateQuestProgress(action, target, amount = 1) {
        for (const quest of this.activeQuests.values()) {
            if (quest.isCompleted) continue;
            
            let questUpdated = false;
            
            for (const objective of quest.objectives) {
                if (this.matchesObjective(objective, action, target)) {
                    objective.current = Math.min(objective.current + amount, objective.amount);
                    questUpdated = true;
                }
            }
            
            if (questUpdated) {
                this.checkQuestCompletion(quest);
            }
        }
    }
    
    // 检查目标是否匹配
    matchesObjective(objective, action, target) {
        switch (objective.type) {
            case 'kill':
                return action === 'kill' && (objective.target === 'any_enemy' || objective.target === target);
            case 'collect':
                return action === 'collect' && objective.target === target;
            case 'build':
                return action === 'build' && (objective.target === 'any_building' || objective.target === target);
            case 'build_different':
                return action === 'build_different';
            case 'explore':
                return action === 'explore' && (objective.target === 'new_biome' || objective.target === target);
            case 'explore_all_biomes':
                return action === 'explore_biome';
            default:
                return false;
        }
    }
    
    // 检查任务完成
    checkQuestCompletion(quest) {
        const allCompleted = quest.objectives.every(obj => obj.current >= obj.amount);
        
        if (allCompleted && !quest.isCompleted) {
            quest.isCompleted = true;
            quest.completionTime = Date.now();
            return true;
        }
        
        return false;
    }
    
    // 完成任务并获得奖励
    completeQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest || !quest.isCompleted) return null;
        
        // 移除活跃任务
        this.activeQuests.delete(questId);
        
        // 添加到已完成任务
        this.completedQuests.add(quest.templateId);
        
        // 解锁新任务
        const template = this.questTemplates.get(quest.templateId);
        if (template && template.unlocks) {
            for (const unlockId of template.unlocks) {
                this.startQuest(unlockId);
            }
        }
        
        return quest.rewards;
    }
    
    // 获取可用任务
    getAvailableQuests() {
        const available = [];
        
        for (const [templateId, template] of this.questTemplates.entries()) {
            // 检查是否已完成
            if (this.completedQuests.has(templateId)) continue;
            
            // 检查是否已激活
            let isActive = false;
            for (const quest of this.activeQuests.values()) {
                if (quest.templateId === templateId) {
                    isActive = true;
                    break;
                }
            }
            if (isActive) continue;
            
            // 检查前置条件
            const canStart = template.prerequisites.every(prereq => 
                this.completedQuests.has(prereq)
            );
            
            if (canStart) {
                available.push({
                    templateId: templateId,
                    title: template.title,
                    description: template.description,
                    type: template.type,
                    rewards: template.rewards
                });
            }
        }
        
        return available;
    }
    
    // 获取活跃任务
    getActiveQuests() {
        return Array.from(this.activeQuests.values());
    }
    
    // 获取已完成任务
    getCompletedQuests() {
        return Array.from(this.completedQuests);
    }
    
    // 获取任务进度百分比
    getQuestProgress(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest) return 0;
        
        let totalProgress = 0;
        let maxProgress = 0;
        
        for (const objective of quest.objectives) {
            totalProgress += objective.current;
            maxProgress += objective.amount;
        }
        
        return maxProgress > 0 ? (totalProgress / maxProgress) * 100 : 0;
    }
    
    // 重置日常任务
    resetDailyQuests() {
        // 移除已完成的日常任务
        const dailyQuests = Array.from(this.activeQuests.values())
            .filter(quest => {
                const template = this.questTemplates.get(quest.templateId);
                return template && template.resetDaily;
            });
        
        for (const quest of dailyQuests) {
            this.activeQuests.delete(quest.id);
        }
        
        // 重新开始日常任务
        for (const [templateId, template] of this.questTemplates.entries()) {
            if (template.resetDaily) {
                this.startQuest(templateId);
            }
        }
    }
    
    // 获取任务统计
    getQuestStats() {
        const stats = {
            total: this.questTemplates.size,
            completed: this.completedQuests.size,
            active: this.activeQuests.size,
            available: this.getAvailableQuests().length,
            byType: {
                main: 0,
                side: 0,
                daily: 0,
                achievement: 0
            }
        };
        
        for (const template of this.questTemplates.values()) {
            if (stats.byType.hasOwnProperty(template.type)) {
                stats.byType[template.type]++;
            }
        }
        
        return stats;
    }
    
    // 保存任务数据
    saveData() {
        return {
            activeQuests: Array.from(this.activeQuests.entries()),
            completedQuests: Array.from(this.completedQuests),
            questCounter: this.questCounter
        };
    }
    
    // 加载任务数据
    loadData(data) {
        if (data) {
            if (data.activeQuests) {
                this.activeQuests = new Map(data.activeQuests);
            }
            if (data.completedQuests) {
                this.completedQuests = new Set(data.completedQuests);
            }
            this.questCounter = data.questCounter || 0;
        }
    }
    
    // 自动开始初始任务
    initializeStartingQuests() {
        // 开始主线任务
        this.startQuest('main_001');
        
        // 开始一些支线任务
        this.startQuest('side_001');
        
        // 开始日常任务
        this.startQuest('daily_001');
        this.startQuest('daily_002');
    }
}

// 导出类
if (typeof window !== 'undefined') {
    window.QuestSystem = QuestSystem;
}