/**
 * 角色动画系统
 * 实现角色的各种动画状态和过渡效果
 */

class CharacterAnimationSystem {
    constructor() {
        this.animations = new Map();
        this.currentAnimation = null;
        this.animationTime = 0;
        this.frameRate = 60; // FPS
        
        this.initializeAnimations();
    }
    
    initializeAnimations() {
        // 玩家动画
        this.animations.set('player_idle', {
            frames: [
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 1.02, rotation: 0, alpha: 1.0, offsetY: -1 },
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 0.98, rotation: 0, alpha: 1.0, offsetY: 1 }
            ],
            duration: 2000, // 2秒循环
            loop: true
        });
        
        this.animations.set('player_move', {
            frames: [
                { scale: 1.0, rotation: -0.1, alpha: 1.0, offsetY: 0 },
                { scale: 1.05, rotation: 0, alpha: 1.0, offsetY: -2 },
                { scale: 1.0, rotation: 0.1, alpha: 1.0, offsetY: 0 },
                { scale: 0.95, rotation: 0, alpha: 1.0, offsetY: 1 }
            ],
            duration: 400, // 快速循环
            loop: true
        });
        
        this.animations.set('player_shoot', {
            frames: [
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 1.1, rotation: 0, alpha: 1.0, offsetY: -1 },
                { scale: 0.9, rotation: 0, alpha: 1.0, offsetY: 1 },
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 }
            ],
            duration: 200,
            loop: false
        });
        
        this.animations.set('player_hurt', {
            frames: [
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 0.8, rotation: -0.2, alpha: 0.7, offsetY: 2 },
                { scale: 1.2, rotation: 0.2, alpha: 0.5, offsetY: -1 },
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 }
            ],
            duration: 300,
            loop: false
        });
        
        // 敌人动画
        this.animations.set('enemy_idle', {
            frames: [
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 1.01, rotation: 0, alpha: 1.0, offsetY: -0.5 },
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 0.99, rotation: 0, alpha: 1.0, offsetY: 0.5 }
            ],
            duration: 3000,
            loop: true
        });
        
        this.animations.set('enemy_move', {
            frames: [
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 1.03, rotation: 0, alpha: 1.0, offsetY: -1 },
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 0.97, rotation: 0, alpha: 1.0, offsetY: 1 }
            ],
            duration: 600,
            loop: true
        });
        
        this.animations.set('enemy_attack', {
            frames: [
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 1.2, rotation: 0, alpha: 1.0, offsetY: -2 },
                { scale: 0.8, rotation: 0, alpha: 1.0, offsetY: 1 },
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 }
            ],
            duration: 400,
            loop: false
        });
        
        this.animations.set('enemy_death', {
            frames: [
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 1.3, rotation: 0.3, alpha: 0.8, offsetY: -3 },
                { scale: 0.7, rotation: -0.2, alpha: 0.5, offsetY: 2 },
                { scale: 0.3, rotation: 0.5, alpha: 0.2, offsetY: 5 },
                { scale: 0.1, rotation: 1.0, alpha: 0.0, offsetY: 8 }
            ],
            duration: 800,
            loop: false
        });
        
        // Boss动画
        this.animations.set('boss_idle', {
            frames: [
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 1.05, rotation: 0, alpha: 1.0, offsetY: -2 },
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 0.95, rotation: 0, alpha: 1.0, offsetY: 2 }
            ],
            duration: 4000,
            loop: true
        });
        
        this.animations.set('boss_charge', {
            frames: [
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 },
                { scale: 0.8, rotation: -0.1, alpha: 1.0, offsetY: 3 },
                { scale: 1.3, rotation: 0.1, alpha: 1.0, offsetY: -5 },
                { scale: 1.0, rotation: 0, alpha: 1.0, offsetY: 0 }
            ],
            duration: 1000,
            loop: false
        });
    }
    
    // 播放动画
    playAnimation(animationName, onComplete = null) {
        const animation = this.animations.get(animationName);
        if (!animation) return false;
        
        this.currentAnimation = {
            ...animation,
            name: animationName,
            startTime: performance.now(),
            onComplete
        };
        
        this.animationTime = 0;
        return true;
    }
    
    // 更新动画
    update(deltaTime) {
        if (!this.currentAnimation) return null;
        
        const currentTime = performance.now();
        const elapsed = currentTime - this.currentAnimation.startTime;
        const progress = elapsed / this.currentAnimation.duration;
        
        if (progress >= 1) {
            if (this.currentAnimation.loop) {
                // 重新开始循环
                this.currentAnimation.startTime = currentTime;
                return this.getFrameData(0);
            } else {
                // 动画结束
                if (this.currentAnimation.onComplete) {
                    this.currentAnimation.onComplete();
                }
                const finalFrame = this.getFrameData(1);
                this.currentAnimation = null;
                return finalFrame;
            }
        }
        
        return this.getFrameData(progress);
    }
    
    // 获取当前帧数据
    getFrameData(progress) {
        if (!this.currentAnimation) return null;
        
        const frames = this.currentAnimation.frames;
        const frameCount = frames.length;
        
        // 计算当前帧索引
        const frameIndex = progress * (frameCount - 1);
        const currentFrameIndex = Math.floor(frameIndex);
        const nextFrameIndex = Math.min(currentFrameIndex + 1, frameCount - 1);
        const frameProgress = frameIndex - currentFrameIndex;
        
        // 插值计算
        const currentFrame = frames[currentFrameIndex];
        const nextFrame = frames[nextFrameIndex];
        
        return {
            scale: this.lerp(currentFrame.scale, nextFrame.scale, frameProgress),
            rotation: this.lerp(currentFrame.rotation, nextFrame.rotation, frameProgress),
            alpha: this.lerp(currentFrame.alpha, nextFrame.alpha, frameProgress),
            offsetY: this.lerp(currentFrame.offsetY, nextFrame.offsetY, frameProgress)
        };
    }
    
    // 线性插值
    lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    // 检查动画是否正在播放
    isPlaying(animationName = null) {
        if (!this.currentAnimation) return false;
        if (animationName) {
            return this.currentAnimation.name === animationName;
        }
        return true;
    }
    
    // 停止当前动画
    stopAnimation() {
        this.currentAnimation = null;
    }
    
    // 获取当前动画名称
    getCurrentAnimationName() {
        return this.currentAnimation ? this.currentAnimation.name : null;
    }
}

/**
 * 动画状态机
 * 管理角色的动画状态转换
 */
class AnimationStateMachine {
    constructor(animationSystem) {
        this.animationSystem = animationSystem;
        this.currentState = 'idle';
        this.previousState = null;
        this.stateTransitions = new Map();
        
        this.initializeStates();
    }
    
    initializeStates() {
        // 定义状态转换规则
        this.stateTransitions.set('idle', ['move', 'shoot', 'hurt']);
        this.stateTransitions.set('move', ['idle', 'shoot', 'hurt']);
        this.stateTransitions.set('shoot', ['idle', 'move', 'hurt']);
        this.stateTransitions.set('hurt', ['idle', 'move', 'death']);
        this.stateTransitions.set('death', []); // 死亡状态不能转换
    }
    
    // 切换状态
    changeState(newState, entityType = 'player') {
        // 检查是否可以转换到新状态
        const allowedTransitions = this.stateTransitions.get(this.currentState);
        if (!allowedTransitions || !allowedTransitions.includes(newState)) {
            return false;
        }
        
        this.previousState = this.currentState;
        this.currentState = newState;
        
        // 播放对应的动画
        const animationName = `${entityType}_${newState}`;
        return this.animationSystem.playAnimation(animationName);
    }
    
    // 强制切换状态（忽略转换规则）
    forceState(newState, entityType = 'player') {
        this.previousState = this.currentState;
        this.currentState = newState;
        
        const animationName = `${entityType}_${newState}`;
        return this.animationSystem.playAnimation(animationName);
    }
    
    // 获取当前状态
    getCurrentState() {
        return this.currentState;
    }
    
    // 获取上一个状态
    getPreviousState() {
        return this.previousState;
    }
    
    // 更新状态机
    update(deltaTime) {
        return this.animationSystem.update(deltaTime);
    }
}

/**
 * 角色渲染器
 * 应用动画效果并渲染角色
 */
class AnimatedCharacterRenderer {
    constructor() {
        this.animationSystem = new CharacterAnimationSystem();
        this.stateMachine = new AnimationStateMachine(this.animationSystem);
    }
    
    // 渲染动画角色
    renderCharacter(ctx, x, y, radius, color, animationData = null) {
        ctx.save();
        
        if (animationData) {
            // 应用动画变换
            ctx.translate(x, y + animationData.offsetY);
            ctx.scale(animationData.scale, animationData.scale);
            ctx.rotate(animationData.rotation);
            ctx.globalAlpha = animationData.alpha;
            
            // 绘制角色（相对于变换后的坐标系）
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加动画特效
            if (animationData.scale > 1.1) {
                // 放大时添加外发光
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.fill();
            }
        } else {
            // 无动画时的默认渲染
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // 更新并获取动画数据
    updateAnimation(deltaTime) {
        return this.stateMachine.update(deltaTime);
    }
    
    // 播放动画
    playAnimation(animationName) {
        return this.animationSystem.playAnimation(animationName);
    }
    
    // 切换状态
    changeState(newState, entityType = 'player') {
        return this.stateMachine.changeState(newState, entityType);
    }
    
    // 获取当前状态
    getCurrentState() {
        return this.stateMachine.getCurrentState();
    }
}

// 全局实例
window.characterAnimation = new AnimatedCharacterRenderer();