// 测试和调试模块

class GameTester {
    constructor(game) {
        this.game = game;
        this.tests = [];
        this.debugMode = false;
        this.testResults = [];
        this.performanceMetrics = {
            frameDrops: 0,
            memoryLeaks: 0,
            errorCount: 0,
            averageFPS: 0
        };
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
    }

    setupErrorHandling() {
        // 捕获JavaScript错误
        window.addEventListener('error', (event) => {
            this.logError('JavaScript Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // 捕获Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', {
                reason: event.reason
            });
        });
    }

    setupPerformanceMonitoring() {
        this.fpsHistory = [];
        this.memoryHistory = [];
        this.startTime = performance.now();
        
        setInterval(() => {
            this.collectPerformanceData();
        }, 1000);
    }

    collectPerformanceData() {
        if (!this.game) return;
        
        // 收集FPS数据
        this.fpsHistory.push(this.game.fps);
        if (this.fpsHistory.length > 60) {
            this.fpsHistory.shift();
        }
        
        // 检测帧率下降
        if (this.game.fps < 30) {
            this.performanceMetrics.frameDrops++;
        }
        
        // 收集内存数据
        if (performance.memory) {
            const memoryInfo = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
            this.memoryHistory.push(memoryInfo);
            
            // 检测内存泄漏
            if (this.memoryHistory.length > 10) {
                this.memoryHistory.shift();
                const trend = this.calculateMemoryTrend();
                if (trend > 1024 * 1024) { // 1MB增长
                    this.performanceMetrics.memoryLeaks++;
                    this.logWarning('Potential memory leak detected', { trend });
                }
            }
        }
        
        // 计算平均FPS
        this.performanceMetrics.averageFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    }

    calculateMemoryTrend() {
        if (this.memoryHistory.length < 2) return 0;
        
        const recent = this.memoryHistory.slice(-5);
        const older = this.memoryHistory.slice(0, 5);
        
        const recentAvg = recent.reduce((sum, mem) => sum + mem.used, 0) / recent.length;
        const olderAvg = older.reduce((sum, mem) => sum + mem.used, 0) / older.length;
        
        return recentAvg - olderAvg;
    }

    logError(type, details) {
        this.performanceMetrics.errorCount++;
        console.error(`[GameTester] ${type}:`, details);
        
        if (this.game && this.game.uiManager) {
            this.game.uiManager.showNotification(
                `错误: ${details.message || details.reason}`,
                'error',
                5000
            );
        }
    }

    logWarning(message, details) {
        console.warn(`[GameTester] ${message}:`, details);
        
        if (this.game && this.game.uiManager) {
            this.game.uiManager.showNotification(
                `警告: ${message}`,
                'warning',
                3000
            );
        }
    }

    // 自动化测试
    runAutomatedTests() {
        console.log('[GameTester] 开始自动化测试...');
        
        this.testGameInitialization();
        this.testPlayerMovement();
        this.testEnemySpawning();
        this.testCollisionDetection();
        this.testWeaponSystems();
        this.testPerformanceOptimization();
        this.testUIResponsiveness();
        
        this.generateTestReport();
    }

    testGameInitialization() {
        const test = {
            name: '游戏初始化测试',
            passed: true,
            details: []
        };

        try {
            // 检查游戏对象
            if (!this.game) {
                test.passed = false;
                test.details.push('游戏对象未初始化');
            }

            // 检查画布
            if (!this.game.canvas || !this.game.ctx) {
                test.passed = false;
                test.details.push('画布未正确初始化');
            }

            // 检查玩家
            if (!this.game.player) {
                test.passed = false;
                test.details.push('玩家对象未初始化');
            }

            // 检查系统
            if (!this.game.waveSystem || !this.game.performanceOptimizer) {
                test.passed = false;
                test.details.push('关键系统未初始化');
            }

        } catch (error) {
            test.passed = false;
            test.details.push(`初始化错误: ${error.message}`);
        }

        this.testResults.push(test);
    }

    testPlayerMovement() {
        const test = {
            name: '玩家移动测试',
            passed: true,
            details: []
        };

        try {
            const initialX = this.game.player.x;
            const initialY = this.game.player.y;

            // 模拟按键
            this.game.keys['w'] = true;
            this.game.player.update(16); // 模拟16ms帧时间
            
            if (this.game.player.y >= initialY) {
                test.passed = false;
                test.details.push('向上移动失败');
            }

            this.game.keys['w'] = false;

        } catch (error) {
            test.passed = false;
            test.details.push(`移动测试错误: ${error.message}`);
        }

        this.testResults.push(test);
    }

    testEnemySpawning() {
        const test = {
            name: '敌人生成测试',
            passed: true,
            details: []
        };

        try {
            const initialEnemyCount = this.game.enemies.length;
            
            // 强制生成敌人
            this.game.spawnEnemy();
            
            if (this.game.enemies.length <= initialEnemyCount) {
                test.passed = false;
                test.details.push('敌人生成失败');
            }

        } catch (error) {
            test.passed = false;
            test.details.push(`敌人生成错误: ${error.message}`);
        }

        this.testResults.push(test);
    }

    testCollisionDetection() {
        const test = {
            name: '碰撞检测测试',
            passed: true,
            details: []
        };

        try {
            // 创建测试子弹和敌人
            const bullet = {
                x: 100,
                y: 100,
                radius: 3
            };
            
            const enemy = {
                x: 100,
                y: 100,
                radius: 15
            };

            // 测试碰撞检测函数
            const distance = Math.sqrt(
                Math.pow(bullet.x - enemy.x, 2) + 
                Math.pow(bullet.y - enemy.y, 2)
            );
            
            const collision = distance < (bullet.radius + enemy.radius);
            
            if (!collision) {
                test.passed = false;
                test.details.push('碰撞检测逻辑错误');
            }

        } catch (error) {
            test.passed = false;
            test.details.push(`碰撞检测错误: ${error.message}`);
        }

        this.testResults.push(test);
    }

    testWeaponSystems() {
        const test = {
            name: '武器系统测试',
            passed: true,
            details: []
        };

        try {
            const initialBulletCount = this.game.bullets.length;
            
            // 模拟射击
            this.game.player.shoot(this.game.mouse.x, this.game.mouse.y, this.game.currentWeapon);
            
            if (this.game.bullets.length <= initialBulletCount) {
                test.passed = false;
                test.details.push('武器射击失败');
            }

            // 检查武器配置
            if (!CONFIG.WEAPONS[this.game.currentWeapon]) {
                test.passed = false;
                test.details.push('当前武器配置不存在');
            }

        } catch (error) {
            test.passed = false;
            test.details.push(`武器系统错误: ${error.message}`);
        }

        this.testResults.push(test);
    }

    testPerformanceOptimization() {
        const test = {
            name: '性能优化测试',
            passed: true,
            details: []
        };

        try {
            // 检查性能优化器
            if (!this.game.performanceOptimizer) {
                test.passed = false;
                test.details.push('性能优化器未初始化');
            }

            // 检查对象池
            const poolSizes = this.game.performanceOptimizer.getPoolSizes();
            if (poolSizes.bullets === 0 && poolSizes.particles === 0) {
                test.details.push('对象池可能未正确配置');
            }

            // 检查FPS
            if (this.performanceMetrics.averageFPS < 30) {
                test.details.push(`平均FPS过低: ${this.performanceMetrics.averageFPS.toFixed(1)}`);
            }

        } catch (error) {
            test.passed = false;
            test.details.push(`性能优化错误: ${error.message}`);
        }

        this.testResults.push(test);
    }

    testUIResponsiveness() {
        const test = {
            name: 'UI响应性测试',
            passed: true,
            details: []
        };

        try {
            // 检查UI管理器
            if (!this.game.uiManager) {
                test.passed = false;
                test.details.push('UI管理器未初始化');
            }

            // 测试通知系统
            this.game.uiManager.showNotification('测试通知', 'info', 1000);
            
            if (this.game.uiManager.notifications.length === 0) {
                test.passed = false;
                test.details.push('通知系统无响应');
            }

        } catch (error) {
            test.passed = false;
            test.details.push(`UI测试错误: ${error.message}`);
        }

        this.testResults.push(test);
    }

    generateTestReport() {
        const passedTests = this.testResults.filter(test => test.passed).length;
        const totalTests = this.testResults.length;
        
        console.log('\n=== 游戏测试报告 ===');
        console.log(`测试通过率: ${passedTests}/${totalTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
        console.log('\n详细结果:');
        
        this.testResults.forEach(test => {
            console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
            if (test.details.length > 0) {
                test.details.forEach(detail => {
                    console.log(`   - ${detail}`);
                });
            }
        });
        
        console.log('\n=== 性能指标 ===');
        console.log(`平均FPS: ${this.performanceMetrics.averageFPS.toFixed(1)}`);
        console.log(`帧率下降次数: ${this.performanceMetrics.frameDrops}`);
        console.log(`内存泄漏警告: ${this.performanceMetrics.memoryLeaks}`);
        console.log(`错误计数: ${this.performanceMetrics.errorCount}`);
        
        // 显示测试结果通知
        if (this.game.uiManager) {
            const message = `测试完成: ${passedTests}/${totalTests} 通过`;
            const type = passedTests === totalTests ? 'success' : 'warning';
            this.game.uiManager.showNotification(message, type, 5000);
        }
    }

    // 压力测试
    runStressTest(duration = 30000) {
        console.log('[GameTester] 开始压力测试...');
        
        const startTime = Date.now();
        const stressInterval = setInterval(() => {
            // 生成大量敌人
            for (let i = 0; i < 5; i++) {
                this.game.spawnEnemy();
            }
            
            // 生成大量粒子
            this.game.createExplosion(Math.random() * this.game.width, Math.random() * this.game.height, 20);
            
            // 检查是否超时
            if (Date.now() - startTime > duration) {
                clearInterval(stressInterval);
                console.log('[GameTester] 压力测试完成');
                
                if (this.game.uiManager) {
                    this.game.uiManager.showNotification(
                        '压力测试完成',
                        'info',
                        3000
                    );
                }
            }
        }, 100);
    }

    // 获取诊断信息
    getDiagnostics() {
        return {
            performance: this.performanceMetrics,
            testResults: this.testResults,
            gameState: {
                enemies: this.game.enemies.length,
                bullets: this.game.bullets.length,
                particles: this.game.particles.length,
                score: this.game.score,
                wave: this.game.wave,
                fps: this.game.fps
            },
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
            } : null
        };
    }
}

// 导出测试器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameTester;
} else {
    window.GameTester = GameTester;
}