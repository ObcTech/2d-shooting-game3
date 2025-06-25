/**
 * 开发者控制台
 * 整合所有开发工具和调试功能
 */

class DeveloperConsole {
    constructor() {
        this.isVisible = false;
        this.consolePanel = null;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.maxHistoryLength = 50;
        
        // 可用命令
        this.commands = {
            'help': {
                description: '显示所有可用命令',
                execute: () => this.showHelp()
            },
            'clear': {
                description: '清除控制台输出',
                execute: () => this.clearOutput()
            },
            'fps': {
                description: '显示当前FPS',
                execute: () => this.showFPS()
            },
            'performance': {
                description: '显示性能报告',
                execute: () => this.showPerformanceReport()
            },
            'config': {
                description: '配置管理 - config get/set/reset [path] [value]',
                execute: (args) => this.handleConfig(args)
            },
            'effects': {
                description: '特效控制 - effects toggle/preset [name]',
                execute: (args) => this.handleEffects(args)
            },
            'spawn': {
                description: '生成实体 - spawn enemy/powerup/boss [type]',
                execute: (args) => this.handleSpawn(args)
            },
            'teleport': {
                description: '传送玩家 - teleport [x] [y]',
                execute: (args) => this.handleTeleport(args)
            },
            'god': {
                description: '切换无敌模式',
                execute: () => this.toggleGodMode()
            },
            'noclip': {
                description: '切换穿墙模式',
                execute: () => this.toggleNoClip()
            },
            'timescale': {
                description: '设置时间缩放 - timescale [value]',
                execute: (args) => this.setTimeScale(args)
            },
            'reload': {
                description: '重新加载游戏',
                execute: () => this.reloadGame()
            },
            'export': {
                description: '导出游戏数据',
                execute: () => this.exportGameData()
            },
            'screenshot': {
                description: '截取游戏画面',
                execute: () => this.takeScreenshot()
            }
        };
        
        this.createConsoleUI();
        this.setupEventListeners();
    }
    
    // 创建控制台UI
    createConsoleUI() {
        this.consolePanel = document.createElement('div');
        this.consolePanel.id = 'developer-console';
        this.consolePanel.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            right: 10px;
            height: 300px;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #00ff00;
            border-radius: 10px;
            padding: 15px;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 1001;
            display: none;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
        `;
        
        // 创建标题栏
        this.createTitleBar();
        
        // 创建输出区域
        this.createOutputArea();
        
        // 创建输入区域
        this.createInputArea();
        
        document.body.appendChild(this.consolePanel);
    }
    
    // 创建标题栏
    createTitleBar() {
        const titleBar = document.createElement('div');
        titleBar.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #00ff00;
        `;
        
        const title = document.createElement('h3');
        title.textContent = '开发者控制台';
        title.style.cssText = `
            margin: 0;
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #00ff00;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
        `;
        
        closeBtn.addEventListener('click', () => {
            this.hide();
        });
        
        titleBar.appendChild(title);
        titleBar.appendChild(closeBtn);
        this.consolePanel.appendChild(titleBar);
    }
    
    // 创建输出区域
    createOutputArea() {
        this.outputArea = document.createElement('div');
        this.outputArea.style.cssText = `
            height: 200px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid #333;
            padding: 10px;
            margin-bottom: 10px;
            white-space: pre-wrap;
            word-wrap: break-word;
        `;
        
        // 显示欢迎信息
        this.output('开发者控制台已启动');
        this.output('输入 "help" 查看可用命令');
        this.output('按 ~ 键切换控制台显示');
        this.output('---');
        
        this.consolePanel.appendChild(this.outputArea);
    }
    
    // 创建输入区域
    createInputArea() {
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            display: flex;
            align-items: center;
        `;
        
        const prompt = document.createElement('span');
        prompt.textContent = '> ';
        prompt.style.cssText = `
            color: #00ff00;
            margin-right: 5px;
        `;
        
        this.inputField = document.createElement('input');
        this.inputField.type = 'text';
        this.inputField.style.cssText = `
            flex: 1;
            background: transparent;
            border: none;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            outline: none;
        `;
        
        this.inputField.addEventListener('keydown', (e) => {
            this.handleInputKeydown(e);
        });
        
        inputContainer.appendChild(prompt);
        inputContainer.appendChild(this.inputField);
        this.consolePanel.appendChild(inputContainer);
    }
    
    // 设置事件监听器
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === '`' || e.key === '~') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    
    // 处理输入键盘事件
    handleInputKeydown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.executeCommand(this.inputField.value);
                this.inputField.value = '';
                this.historyIndex = -1;
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory(-1);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory(1);
                break;
                
            case 'Tab':
                e.preventDefault();
                this.autoComplete();
                break;
        }
    }
    
    // 导航命令历史
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = -1;
            this.inputField.value = '';
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length - 1;
        }
        
        if (this.historyIndex >= 0) {
            this.inputField.value = this.commandHistory[this.historyIndex];
        }
    }
    
    // 自动补全
    autoComplete() {
        const input = this.inputField.value.toLowerCase();
        const matches = Object.keys(this.commands).filter(cmd => 
            cmd.startsWith(input)
        );
        
        if (matches.length === 1) {
            this.inputField.value = matches[0];
        } else if (matches.length > 1) {
            this.output('可能的命令: ' + matches.join(', '));
        }
    }
    
    // 切换控制台显示
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    // 显示控制台
    show() {
        this.isVisible = true;
        this.consolePanel.style.display = 'block';
        this.inputField.focus();
    }
    
    // 隐藏控制台
    hide() {
        this.isVisible = false;
        this.consolePanel.style.display = 'none';
    }
    
    // 输出信息
    output(message, color = '#00ff00') {
        const line = document.createElement('div');
        line.style.color = color;
        line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        this.outputArea.appendChild(line);
        this.outputArea.scrollTop = this.outputArea.scrollHeight;
    }
    
    // 执行命令
    executeCommand(commandLine) {
        if (!commandLine.trim()) return;
        
        // 添加到历史记录
        this.commandHistory.unshift(commandLine);
        if (this.commandHistory.length > this.maxHistoryLength) {
            this.commandHistory.pop();
        }
        
        // 显示执行的命令
        this.output(`> ${commandLine}`, '#ffff00');
        
        // 解析命令
        const parts = commandLine.trim().split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        // 执行命令
        if (this.commands[command]) {
            try {
                this.commands[command].execute(args);
            } catch (error) {
                this.output(`错误: ${error.message}`, '#ff0000');
            }
        } else {
            this.output(`未知命令: ${command}`, '#ff0000');
            this.output('输入 "help" 查看可用命令');
        }
    }
    
    // 显示帮助信息
    showHelp() {
        this.output('可用命令:');
        Object.entries(this.commands).forEach(([cmd, info]) => {
            this.output(`  ${cmd} - ${info.description}`);
        });
    }
    
    // 清除输出
    clearOutput() {
        this.outputArea.innerHTML = '';
    }
    
    // 显示FPS
    showFPS() {
        if (window.game && window.game.fps !== undefined) {
            this.output(`当前FPS: ${Math.round(window.game.fps)}`);
        } else {
            this.output('无法获取FPS信息');
        }
    }
    
    // 显示性能报告
    showPerformanceReport() {
        if (window.performanceMonitor) {
            const report = window.performanceMonitor.getPerformanceReport();
            this.output('性能报告:');
            this.output(`  平均FPS: ${report.averageFps}`);
            this.output(`  最低FPS: ${report.minimumFps}`);
            this.output(`  最高FPS: ${report.maximumFps}`);
            this.output(`  内存使用: ${report.currentMemory}MB`);
            this.output(`  粒子数量: ${report.particleCount}`);
            this.output(`  实体数量: ${report.entityCount}`);
        } else {
            this.output('性能监控器未初始化');
        }
    }
    
    // 处理配置命令
    handleConfig(args) {
        if (!window.configManager) {
            this.output('配置管理器未初始化', '#ff0000');
            return;
        }
        
        const action = args[0];
        
        switch (action) {
            case 'get':
                const path = args[1];
                if (path) {
                    const value = window.configManager.get(path);
                    this.output(`${path} = ${JSON.stringify(value)}`);
                } else {
                    this.output('请指定配置路径', '#ff0000');
                }
                break;
                
            case 'set':
                const setPath = args[1];
                const setValue = args[2];
                if (setPath && setValue !== undefined) {
                    try {
                        const parsedValue = JSON.parse(setValue);
                        window.configManager.set(setPath, parsedValue);
                        this.output(`已设置 ${setPath} = ${setValue}`);
                    } catch (error) {
                        window.configManager.set(setPath, setValue);
                        this.output(`已设置 ${setPath} = "${setValue}"`);
                    }
                } else {
                    this.output('请指定配置路径和值', '#ff0000');
                }
                break;
                
            case 'reset':
                window.configManager.reset();
                this.output('配置已重置为默认值');
                break;
                
            default:
                this.output('用法: config get/set/reset [path] [value]', '#ff0000');
        }
    }
    
    // 处理特效命令
    handleEffects(args) {
        const action = args[0];
        
        switch (action) {
            case 'toggle':
                if (window.effectsEditor) {
                    window.effectsEditor.toggle();
                    this.output('特效编辑器已切换');
                } else {
                    this.output('特效编辑器未初始化', '#ff0000');
                }
                break;
                
            case 'preset':
                const presetName = args[1];
                if (presetName && window.configManager) {
                    if (window.configManager.applyPreset(presetName)) {
                        this.output(`已应用预设: ${presetName}`);
                    } else {
                        this.output(`未找到预设: ${presetName}`, '#ff0000');
                    }
                } else {
                    this.output('请指定预设名称', '#ff0000');
                }
                break;
                
            default:
                this.output('用法: effects toggle/preset [name]', '#ff0000');
        }
    }
    
    // 处理生成命令
    handleSpawn(args) {
        if (!window.game) {
            this.output('游戏未初始化', '#ff0000');
            return;
        }
        
        const type = args[0];
        const subtype = args[1] || 'basic';
        
        switch (type) {
            case 'enemy':
                // 在玩家附近生成敌人
                const playerX = window.game.player.x;
                const playerY = window.game.player.y;
                const spawnX = playerX + (Math.random() - 0.5) * 200;
                const spawnY = playerY + (Math.random() - 0.5) * 200;
                
                if (window.Enemy) {
                    const enemy = new Enemy(spawnX, spawnY, subtype);
                    window.game.enemies.push(enemy);
                    this.output(`已生成敌人: ${subtype} 在 (${Math.round(spawnX)}, ${Math.round(spawnY)})`);
                }
                break;
                
            case 'powerup':
                // 生成道具
                this.output('道具生成功能待实现');
                break;
                
            case 'boss':
                // 生成Boss
                this.output('Boss生成功能待实现');
                break;
                
            default:
                this.output('用法: spawn enemy/powerup/boss [type]', '#ff0000');
        }
    }
    
    // 处理传送命令
    handleTeleport(args) {
        if (!window.game || !window.game.player) {
            this.output('游戏或玩家未初始化', '#ff0000');
            return;
        }
        
        const x = parseFloat(args[0]);
        const y = parseFloat(args[1]);
        
        if (!isNaN(x) && !isNaN(y)) {
            window.game.player.x = x;
            window.game.player.y = y;
            this.output(`玩家已传送到 (${x}, ${y})`);
        } else {
            this.output('请提供有效的坐标', '#ff0000');
        }
    }
    
    // 切换无敌模式
    toggleGodMode() {
        if (window.game && window.game.player) {
            window.game.player.godMode = !window.game.player.godMode;
            this.output(`无敌模式: ${window.game.player.godMode ? '开启' : '关闭'}`);
        } else {
            this.output('玩家未初始化', '#ff0000');
        }
    }
    
    // 切换穿墙模式
    toggleNoClip() {
        if (window.game && window.game.player) {
            window.game.player.noClip = !window.game.player.noClip;
            this.output(`穿墙模式: ${window.game.player.noClip ? '开启' : '关闭'}`);
        } else {
            this.output('玩家未初始化', '#ff0000');
        }
    }
    
    // 设置时间缩放
    setTimeScale(args) {
        const scale = parseFloat(args[0]);
        
        if (!isNaN(scale) && scale > 0) {
            if (window.game) {
                window.game.timeScale = scale;
                this.output(`时间缩放设置为: ${scale}`);
            } else {
                this.output('游戏未初始化', '#ff0000');
            }
        } else {
            this.output('请提供有效的缩放值 (> 0)', '#ff0000');
        }
    }
    
    // 重新加载游戏
    reloadGame() {
        this.output('正在重新加载游戏...');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
    
    // 导出游戏数据
    exportGameData() {
        const gameData = {
            timestamp: new Date().toISOString(),
            player: window.game ? {
                x: window.game.player.x,
                y: window.game.player.y,
                health: window.game.player.health,
                score: window.game.score
            } : null,
            config: window.configManager ? window.configManager.configs : null,
            performance: window.performanceMonitor ? window.performanceMonitor.getPerformanceReport() : null
        };
        
        const dataStr = JSON.stringify(gameData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `game-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.output('游戏数据已导出');
    }
    
    // 截取游戏画面
    takeScreenshot() {
        if (window.game && window.game.canvas) {
            const canvas = window.game.canvas;
            const link = document.createElement('a');
            link.download = `screenshot-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL();
            link.click();
            this.output('游戏画面已截取');
        } else {
            this.output('无法访问游戏画布', '#ff0000');
        }
    }
}

// 全局实例
window.developerConsole = new DeveloperConsole();

console.log('%c开发者控制台已加载', 'color: #00ff00; font-size: 14px; font-weight: bold;');
console.log('%c按 ~ 键打开/关闭开发者控制台', 'color: #ffff00; font-size: 12px;');
console.log('%c输入 "help" 查看所有可用命令', 'color: #ffffff; font-size: 12px;');