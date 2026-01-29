/**
 * 多模态AI学习平台 - 主应用模块
 * @version 1.0.0
 */

class AILearningApp {
    constructor() {
        this.knowledgeBase = null;
        this.state = null;
        this.initialized = false;
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            // 显示加载状态
            UIRenderer.showLoading();

            // 加载知识库
            await this.loadKnowledgeBase();

            // 加载用户状态
            this.state = StorageManager.load();

            // 确保状态有效
            this.validateState();

            // 渲染界面
            this.render();

            // 标记初始化完成
            this.initialized = true;

            console.log('AI Learning App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('应用初始化失败，请刷新页面重试');
        }
    }

    /**
     * 加载知识库数据
     */
    async loadKnowledgeBase() {
        try {
            const response = await fetch('./src/data/knowledge-base.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.knowledgeBase = await response.json();
        } catch (error) {
            console.error('Failed to load knowledge base:', error);
            throw error;
        }
    }

    /**
     * 验证并修正状态
     */
    validateState() {
        const chapters = this.knowledgeBase.chapters;

        // 确保当前章节有效
        if (this.state.currentChapter < 1 || this.state.currentChapter > chapters.length) {
            this.state.currentChapter = 1;
        }

        // 确保当前知识点索引有效
        const currentChapter = chapters.find(c => c.id === this.state.currentChapter);
        if (this.state.currentTopicIndex >= currentChapter.topics.length) {
            this.state.currentTopicIndex = 0;
        }

        // 确保第一章始终解锁
        if (!this.state.unlockedChapters.includes(1)) {
            this.state.unlockedChapters.push(1);
        }

        this.saveState();
    }

    /**
     * 渲染整个界面
     */
    render() {
        this.renderChapterNav();
        this.renderContent();
        this.updateProgress();
    }

    /**
     * 渲染章节导航
     */
    renderChapterNav() {
        UIRenderer.renderChapterNav(
            this.knowledgeBase.chapters,
            this.state,
            (chapterId) => this.selectChapter(chapterId)
        );
    }

    /**
     * 渲染主内容
     */
    renderContent() {
        const chapter = this.getCurrentChapter();
        const topic = this.getCurrentTopic();

        UIRenderer.renderContent(chapter, topic, this.state, {
            onPrev: () => this.prevTopic(),
            onNext: () => this.nextTopic()
        });
    }

    /**
     * 更新进度显示
     */
    updateProgress() {
        const totalTopics = this.knowledgeBase.chapters.reduce(
            (sum, c) => sum + c.topics.length, 0
        );
        const completedCount = this.state.completedTopics.length;

        UIRenderer.updateProgress(completedCount, totalTopics);
    }

    /**
     * 获取当前章节
     */
    getCurrentChapter() {
        return this.knowledgeBase.chapters.find(c => c.id === this.state.currentChapter);
    }

    /**
     * 获取当前知识点
     */
    getCurrentTopic() {
        const chapter = this.getCurrentChapter();
        return chapter.topics[this.state.currentTopicIndex];
    }

    /**
     * 选择章节
     */
    selectChapter(chapterId) {
        if (!this.state.unlockedChapters.includes(chapterId)) {
            return;
        }

        this.state.currentChapter = chapterId;
        this.state.currentTopicIndex = 0;

        // 找到第一个未完成的知识点
        const chapter = this.getCurrentChapter();
        for (let i = 0; i < chapter.topics.length; i++) {
            const topicId = `${chapterId}-${chapter.topics[i].term}`;
            if (!this.state.completedTopics.includes(topicId)) {
                this.state.currentTopicIndex = i;
                break;
            }
        }

        this.saveState();
        this.render();
    }

    /**
     * 上一个知识点
     */
    prevTopic() {
        if (this.state.currentTopicIndex > 0) {
            this.state.currentTopicIndex--;
            this.saveState();
            this.renderContent();
        }
    }

    /**
     * 下一个知识点
     */
    nextTopic() {
        const chapter = this.getCurrentChapter();
        const topic = this.getCurrentTopic();
        const topicId = `${chapter.id}-${topic.term}`;
        const quizState = window._quizState;

        // 如果还没完成，需要先答题
        if (!this.state.completedTopics.includes(topicId)) {
            const selectedAnswer = quizState?.getSelected();

            if (selectedAnswer === null) {
                alert('请先回答测验问题！');
                return;
            }

            if (!quizState.isChecked()) {
                const correct = selectedAnswer === topic.quiz.answer;

                // 显示答案反馈
                UIRenderer.showQuizFeedback(correct, topic.quiz.answer, selectedAnswer);
                quizState.setChecked(true);

                if (correct) {
                    // 标记完成
                    this.state.completedTopics.push(topicId);

                    // 计算得分
                    const score = UIRenderer.difficultyScores[topic.difficulty];
                    this.state.totalScore += score;

                    // 更新统计
                    this.state.statistics.correctAnswers++;

                    // 检查是否完成章节
                    if (UIRenderer.isChapterCompleted(chapter, this.state)) {
                        this.unlockNextChapter(chapter.id);
                    }

                    this.saveState();
                    this.updateProgress();
                    this.renderChapterNav();
                } else {
                    this.state.statistics.wrongAnswers++;
                    this.saveState();
                }

                return;
            }
        }

        // 移动到下一个知识点
        if (this.state.currentTopicIndex < chapter.topics.length - 1) {
            this.state.currentTopicIndex++;
        } else if (this.state.currentChapter < this.knowledgeBase.chapters.length) {
            // 进入下一章
            const nextChapterId = this.state.currentChapter + 1;
            if (this.state.unlockedChapters.includes(nextChapterId)) {
                this.state.currentChapter = nextChapterId;
                this.state.currentTopicIndex = 0;
                this.renderChapterNav();
            }
        }

        this.saveState();
        this.renderContent();
    }

    /**
     * 解锁下一章
     */
    unlockNextChapter(currentChapterId) {
        const nextChapterId = currentChapterId + 1;

        if (nextChapterId <= this.knowledgeBase.chapters.length &&
            !this.state.unlockedChapters.includes(nextChapterId)) {

            this.state.unlockedChapters.push(nextChapterId);

            const currentChapter = this.knowledgeBase.chapters.find(c => c.id === currentChapterId);
            UIRenderer.showAchievement(
                '🎉 章节完成！',
                `恭喜完成${currentChapter.title}，下一章已解锁！`
            );
        }
    }

    /**
     * 保存状态
     */
    saveState() {
        StorageManager.save(this.state);
    }

    /**
     * 重置进度
     */
    resetProgress() {
        if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
            this.state = StorageManager.reset();
            this.render();
        }
    }

    /**
     * 导出数据
     */
    exportData() {
        const data = StorageManager.export();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-learning-progress-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const content = document.getElementById('main-content');
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #f44336;">
                    <h3>⚠️ ${message}</h3>
                    <button class="btn btn--primary" onclick="location.reload()">
                        刷新页面
                    </button>
                </div>
            `;
        }
    }
}

// 创建全局实例
const app = new AILearningApp();

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// 导出供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AILearningApp;
}
