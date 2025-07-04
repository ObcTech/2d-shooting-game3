// 游戏配置文件 - 必须在所有其他脚本之前加载
const CONFIG = {
    PLAYER: {
        SPEED: 4,
        HEALTH: 100,
        SHOOT_COOLDOWN: 15,
        RADIUS: 15
    },
    ENEMY: {
        SPEED: 1.5,
        SPAWN_INTERVAL: 120,
        MIN_SPAWN_INTERVAL: 30,
        SPAWN_ACCELERATION: 0.5,
        RADIUS: 12
    },
    BULLET: {
        SPEED: 8,
        RADIUS: 3
    },
    AUDIO: {
        ENABLED: true,
        VOLUME: 0.3
    },
    WEAPONS: {
        PISTOL: {
            name: '手枪',
            damage: 1,
            cooldown: 15,
            bulletCount: 1,
            spread: 0,
            bulletSpeed: 8,
            color: '#feca57'
        },
        SHOTGUN: {
            name: '散弹枪',
            damage: 1,
            cooldown: 30,
            bulletCount: 5,
            spread: 0.3,
            bulletSpeed: 6,
            color: '#ff6b6b'
        },
        LASER: {
            name: '激光枪',
            damage: 2,
            cooldown: 8,
            bulletCount: 1,
            spread: 0,
            bulletSpeed: 12,
            color: '#00ff00'
        },
        ROCKET: {
            name: '火箭筒',
            damage: 3,
            cooldown: 60,
            bulletCount: 1,
            spread: 0,
            bulletSpeed: 5,
            color: '#ff4757',
            explosive: true,
            explosionRadius: 50
        }
    },
    POWERUPS: {
        HEALTH: {
            name: '生命包',
            color: '#2ed573',
            effect: 'heal',
            value: 30
        },
        WEAPON: {
            name: '武器升级',
            color: '#ffa502',
            effect: 'weapon'
        },
        SPEED: {
            name: '速度提升',
            color: '#3742fa',
            effect: 'speed',
            value: 1.5,
            duration: 300
        },
        SHIELD: {
            name: '护盾',
            color: '#7bed9f',
            effect: 'shield',
            duration: 180
        }
    },
    LEVELS: {
        CITY: {
            name: '城市废墟',
            backgroundColor: '#2c3e50',
            gridColor: '#34495e',
            obstacles: [
                { x: 200, y: 150, width: 80, height: 60, type: 'building' },
                { x: 400, y: 300, width: 100, height: 80, type: 'building' },
                { x: 600, y: 100, width: 60, height: 120, type: 'building' }
            ]
        },
        FOREST: {
            name: '森林环境',
            backgroundColor: '#27ae60',
            gridColor: '#2ecc71',
            obstacles: [
                { x: 150, y: 200, width: 40, height: 40, type: 'tree' },
                { x: 350, y: 150, width: 40, height: 40, type: 'tree' },
                { x: 500, y: 350, width: 40, height: 40, type: 'tree' },
                { x: 250, y: 400, width: 40, height: 40, type: 'tree' }
            ]
        },
        FACTORY: {
            name: '工厂区域',
            backgroundColor: '#7f8c8d',
            gridColor: '#95a5a6',
            obstacles: [
                { x: 300, y: 200, width: 120, height: 40, type: 'machine' },
                { x: 150, y: 350, width: 80, height: 60, type: 'machine' },
                { x: 550, y: 150, width: 60, height: 100, type: 'machine' }
            ]
        },
        DESERT: {
            name: '沙漠地带',
            backgroundColor: '#f39c12',
            gridColor: '#e67e22',
            obstacles: [
                { x: 200, y: 250, width: 60, height: 30, type: 'rock' },
                { x: 450, y: 180, width: 80, height: 40, type: 'rock' },
                { x: 350, y: 380, width: 50, height: 25, type: 'rock' }
            ]
        }
    },
    GAME_MODES: {
        SURVIVAL: {
            name: '生存模式',
            description: '坚持指定时间',
            targetTime: 180 // 3分钟
        },
        ELIMINATION: {
            name: '歼灭模式',
            description: '击败指定数量敌人',
            targetKills: 50
        },
        ESCORT: {
            name: '护送模式',
            description: '保护NPC到达目标点',
            npcHealth: 100
        }
    },
    BOSSES: {
        TANK_BOSS: {
            name: '重装坦克',
            health: 50,
            speed: 0.8,
            radius: 30,
            color: '#8e44ad',
            abilities: ['charge', 'spawn_minions'],
            damage: 30
        },
        SPEED_BOSS: {
            name: '疾风杀手',
            health: 30,
            speed: 2.5,
            radius: 20,
            color: '#e74c3c',
            abilities: ['dash', 'clone'],
            damage: 25
        },
        FINAL_BOSS: {
            name: '终极毁灭者',
            health: 100,
            speed: 1.2,
            radius: 40,
            color: '#2c3e50',
            abilities: ['laser_beam', 'missile_rain', 'shield'],
            damage: 40
        }
    }
};

// 确保CONFIG在全局可用
window.CONFIG = CONFIG;