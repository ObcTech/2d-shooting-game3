// 视觉效果配置文件
const VISUAL_CONFIG = {
    // 粒子系统配置
    PARTICLES: {
        MAX_PARTICLES: 500,
        POOL_SIZE: 1000,
        
        // 爆炸效果
        EXPLOSION: {
            PARTICLE_COUNT: 15,
            SPEED_RANGE: [2, 8],
            SIZE_RANGE: [2, 6],
            LIFE_RANGE: [30, 60],
            COLORS: {
                DEFAULT: '#ff6b6b',
                ENEMY: '#ff4757',
                PLAYER: '#4ecdc4',
                WEAPON: '#ffa502'
            }
        },
        
        // 枪口闪光
        MUZZLE_FLASH: {
            PARTICLE_COUNT: 8,
            SPEED_RANGE: [1, 4],
            SIZE_RANGE: [1, 3],
            LIFE_RANGE: [5, 15],
            SPREAD_ANGLE: Math.PI / 4
        },
        
        // 撞击效果
        IMPACT: {
            PARTICLE_COUNT: 6,
            SPEED_RANGE: [1, 3],
            SIZE_RANGE: [1, 2],
            LIFE_RANGE: [10, 20]
        },
        
        // 轨迹效果
        TRAIL: {
            PARTICLE_COUNT: 2,
            SPEED_RANGE: [0.5, 1.5],
            SIZE_RANGE: [0.5, 1.5],
            LIFE_RANGE: [5, 10]
        }
    },
    
    // 屏幕震动配置
    SCREEN_SHAKE: {
        MAX_INTENSITY: 10,
        DECAY_RATE: 0.9,
        FREQUENCY: 0.1
    },
    
    // 伤害数字配置
    DAMAGE_NUMBERS: {
        FONT_SIZE: 16,
        LIFE_TIME: 60,
        RISE_SPEED: 2,
        FADE_SPEED: 0.02,
        COLORS: {
            NORMAL: '#ff4757',
            CRITICAL: '#ffa502',
            HEAL: '#2ed573'
        }
    },
    
    // 武器特效配置
    WEAPON_EFFECTS: {
        PISTOL: {
            MUZZLE_FLASH: {
                color: '#ffa502',
                intensity: 0.8,
                size: 1.0
            },
            TRAIL: {
                color: '#ffa502',
                intensity: 0.6,
                size: 0.8
            },
            IMPACT: {
                color: '#ff6b6b',
                intensity: 0.7,
                size: 0.9
            }
        },
        
        SHOTGUN: {
            MUZZLE_FLASH: {
                color: '#ff7675',
                intensity: 1.2,
                size: 1.5
            },
            TRAIL: {
                color: '#ff7675',
                intensity: 0.4,
                size: 0.6
            },
            IMPACT: {
                color: '#ff4757',
                intensity: 1.0,
                size: 1.2
            }
        },
        
        LASER: {
            MUZZLE_FLASH: {
                color: '#00d2d3',
                intensity: 1.5,
                size: 1.2
            },
            TRAIL: {
                color: '#00d2d3',
                intensity: 1.0,
                size: 1.0
            },
            IMPACT: {
                color: '#4ecdc4',
                intensity: 1.3,
                size: 1.1
            }
        },
        
        ROCKET: {
            MUZZLE_FLASH: {
                color: '#fd79a8',
                intensity: 2.0,
                size: 2.0
            },
            TRAIL: {
                color: '#fd79a8',
                intensity: 1.5,
                size: 1.5
            },
            IMPACT: {
                color: '#e84393',
                intensity: 2.5,
                size: 2.0
            }
        }
    },
    
    // 环境特效配置
    ENVIRONMENT: {
        GRID_GLOW: {
            enabled: true,
            intensity: 0.3,
            pulse_speed: 0.02
        },
        
        BACKGROUND_PARTICLES: {
            enabled: true,
            count: 20,
            speed: 0.5,
            size: 1
        },
        
        LIGHTING: {
            ambient: 0.7,
            dynamic: true,
            shadows: true
        }
    },
    
    // 视觉特效增强配置
    ENHANCED_EFFECTS: {
        // 光照系统
        LIGHTING: {
            AMBIENT_LIGHT: {
                r: 0.1,
                g: 0.1,
                b: 0.15,
                intensity: 0.3
            },
            
            MUZZLE_FLASH: {
                radius: { min: 20, max: 50 },
                color: { r: 1, g: 0.8, b: 0.6 },
                intensity: 1.5,
                duration: 150,
                flicker: true
            },
            
            EXPLOSION: {
                radius: { min: 60, max: 120 },
                color: { r: 1, g: 0.6, b: 0.2 },
                intensity: 2.0,
                duration: 300,
                flicker: true
            },
            
            WEAPON_GLOW: {
                radius: 15,
                color: { r: 0.4, g: 0.8, b: 1.0 },
                intensity: 0.8,
                pulse: true
            }
        },
        
        // 后处理效果
        POST_PROCESSING: {
            SCREEN_SHAKE: {
                max_intensity: 10,
                default_duration: 300,
                decay_rate: 0.9
            },
            
            COLOR_FILTERS: {
                DAMAGE: {
                    r: 1, g: 0.3, b: 0.3,
                    alpha: 0.3,
                    duration: 200
                },
                
                HEAL: {
                    r: 0.3, g: 1, b: 0.3,
                    alpha: 0.2,
                    duration: 300
                },
                
                POWERUP: {
                    r: 0.3, g: 0.3, b: 1,
                    alpha: 0.15,
                    duration: 500
                }
            },
            
            BLUR: {
                max_radius: 5,
                fade_speed: 0.1
            },
            
            CHROMATIC_ABERRATION: {
                max_intensity: 3,
                color_separation: 2
            }
        },
        
        // 特殊效果
        SPECIAL_EFFECTS: {
            SLOW_MOTION: {
                time_scale: 0.3,
                duration: 1000,
                ease_in: 200,
                ease_out: 300
            },
            
            FREEZE_FRAME: {
                duration: 100,
                flash_intensity: 0.8
            },
            
            BULLET_TIME: {
                time_scale: 0.1,
                duration: 2000,
                particle_multiplier: 2.0
            }
        }
    },
    
    // 性能配置
    PERFORMANCE: {
        PARTICLE_QUALITY: {
            LOW: 0.5,
            MEDIUM: 0.75,
            HIGH: 1.0,
            ULTRA: 1.5
        },
        
        EFFECT_DISTANCE: {
            NEAR: 200,
            MEDIUM: 400,
            FAR: 600
        },
        
        LOD_LEVELS: {
            HIGH_DETAIL: 0,
            MEDIUM_DETAIL: 1,
            LOW_DETAIL: 2
        },
        
        // 视觉特效性能设置
        ENHANCED_EFFECTS_PERFORMANCE: {
            LOW: {
                lighting: false,
                post_processing: false,
                particle_count_multiplier: 0.3
            },
            MEDIUM: {
                lighting: true,
                post_processing: true,
                particle_count_multiplier: 0.7
            },
            HIGH: {
                lighting: true,
                post_processing: true,
                particle_count_multiplier: 1.0
            }
        }
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VISUAL_CONFIG;
} else {
    window.VISUAL_CONFIG = VISUAL_CONFIG;
}