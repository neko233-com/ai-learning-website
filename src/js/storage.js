/**
 * 存储管理模块
 * 负责学习进度的本地存储
 */

const StorageManager = {
    STORAGE_KEY: 'aiLearningState',

    /**
     * 默认状态
     */
    defaultState: {
        currentChapter: 1,
        currentTopicIndex: 0,
        completedTopics: [],
        unlockedChapters: [1],
        totalScore: 0,
        lastVisit: null,
        statistics: {
            totalStudyTime: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            streakDays: 0
        }
    },

    /**
     * 加载状态
     * @returns {Object} 应用状态
     */
    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return this.migrate(parsed);
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
        return { ...this.defaultState };
    },

    /**
     * 保存状态
     * @param {Object} state 应用状态
     */
    save(state) {
        try {
            state.lastVisit = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    },

    /**
     * 数据迁移（处理版本升级）
     * @param {Object} state 旧状态
     * @returns {Object} 迁移后的状态
     */
    migrate(state) {
        // 确保所有必要字段存在
        const migrated = { ...this.defaultState, ...state };

        // 转换旧格式的 Set 为数组
        if (state.completedTopics instanceof Set) {
            migrated.completedTopics = Array.from(state.completedTopics);
        }
        if (state.unlockedChapters instanceof Set) {
            migrated.unlockedChapters = Array.from(state.unlockedChapters);
        }

        // 确保 statistics 字段存在
        if (!migrated.statistics) {
            migrated.statistics = { ...this.defaultState.statistics };
        }

        return migrated;
    },

    /**
     * 重置进度
     */
    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        return { ...this.defaultState };
    },

    /**
     * 导出数据
     * @returns {string} JSON字符串
     */
    export() {
        const state = this.load();
        return JSON.stringify(state, null, 2);
    },

    /**
     * 导入数据
     * @param {string} jsonStr JSON字符串
     * @returns {boolean} 是否成功
     */
    import(jsonStr) {
        try {
            const state = JSON.parse(jsonStr);
            this.save(this.migrate(state));
            return true;
        } catch (error) {
            console.error('Failed to import state:', error);
            return false;
        }
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
