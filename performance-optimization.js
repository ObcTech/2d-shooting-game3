// 性能优化模块
// 用于优化游戏性能和内存管理

class PerformanceOptimizer {
    constructor() {
        this.objectPools = {
            bullets: [],
            particles: [],
            enemies: []
        };
        this.maxPoolSize = 100;
        this.frameTimeHistory = [];
        this.maxFrameHistory = 60;
        this.performanceMetrics = {
            avgFrameTime: 16.67,
            memoryUsage: 0,
            objectCount: 0
        };
    }

    // 对象池管理
    getBullet() {
        if (this.objectPools.bullets.length > 0) {
            return this.objectPools.bullets.pop();
        }
        return null; // 需要创建新对象
    }

    returnBullet(bullet) {
        if (this.objectPools.bullets.length < this.maxPoolSize) {
            // 重置对象状态
            bullet.reset && bullet.reset();
            this.objectPools.bullets.push(bullet);
        }
    }

    getParticle() {
        if (this.objectPools.particles.length > 0) {
            return this.objectPools.particles.pop();
        }
        return null;
    }

    returnParticle(particle) {
        if (this.objectPools.particles.length < this.maxPoolSize) {
            particle.reset && particle.reset();
            this.objectPools.particles.push(particle);
        }
    }

    // 性能监控
    updateMetrics(frameTime) {
        this.frameTimeHistory.push(frameTime);
        if (this.frameTimeHistory.length > this.maxFrameHistory) {
            this.frameTimeHistory.shift();
        }

        // 计算平均帧时间
        const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
        this.performanceMetrics.avgFrameTime = sum / this.frameTimeHistory.length;
    }

    // 获取性能建议
    getPerformanceRecommendations() {
        const recommendations = [];
        
        if (this.performanceMetrics.avgFrameTime > 20) {
            recommendations.push('帧率较低，建议减少粒子效果数量');
        }
        
        if (this.performanceMetrics.objectCount > 500) {
            recommendations.push('对象数量过多，建议优化清理机制');
        }
        
        return recommendations;
    }

    // 自适应质量调整
    adjustQuality(game) {
        const avgFPS = 1000 / this.performanceMetrics.avgFrameTime;
        
        if (avgFPS < 45) {
            // 降低质量
            game.particleQuality = Math.max(0.5, game.particleQuality - 0.1);
            game.maxParticles = Math.max(50, game.maxParticles - 10);
        } else if (avgFPS > 55) {
            // 提高质量
            game.particleQuality = Math.min(1.0, game.particleQuality + 0.05);
            game.maxParticles = Math.min(200, game.maxParticles + 5);
        }
    }
}

// 优化的数组清理函数
function optimizedFilter(array, predicate, maxRemovePerFrame = 10) {
    let removeCount = 0;
    for (let i = array.length - 1; i >= 0 && removeCount < maxRemovePerFrame; i--) {
        if (!predicate(array[i])) {
            array.splice(i, 1);
            removeCount++;
        }
    }
    return array;
}

// 批量处理函数
function batchProcess(items, processor, batchSize = 10) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
    }
    
    return new Promise((resolve) => {
        let currentBatch = 0;
        
        function processBatch() {
            if (currentBatch < batches.length) {
                batches[currentBatch].forEach(processor);
                currentBatch++;
                requestAnimationFrame(processBatch);
            } else {
                resolve();
            }
        }
        
        processBatch();
    });
}

// 内存监控
class MemoryMonitor {
    constructor() {
        this.lastMemoryCheck = 0;
        this.memoryCheckInterval = 5000; // 5秒检查一次
    }

    checkMemory() {
        const now = Date.now();
        if (now - this.lastMemoryCheck > this.memoryCheckInterval) {
            if (performance.memory) {
                const memInfo = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
                };
                
                console.log(`内存使用: ${memInfo.used}MB / ${memInfo.total}MB (限制: ${memInfo.limit}MB)`);
                
                // 如果内存使用超过80%，触发垃圾回收建议
                if (memInfo.used / memInfo.limit > 0.8) {
                    console.warn('内存使用率过高，建议清理对象');
                    return true; // 需要清理
                }
            }
            this.lastMemoryCheck = now;
        }
        return false;
    }
}

// 导出优化工具
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PerformanceOptimizer,
        optimizedFilter,
        batchProcess,
        MemoryMonitor
    };
} else {
    window.PerformanceOptimizer = PerformanceOptimizer;
    window.optimizedFilter = optimizedFilter;
    window.batchProcess = batchProcess;
    window.MemoryMonitor = MemoryMonitor;
}