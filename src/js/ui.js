/**
 * UI 渲染模块
 * 负责页面元素的渲染和更新
 */

const UIRenderer = {
    /**
     * 难度标签映射
     */
    difficultyLabels: {
        beginner: '入门',
        intermediate: '进阶',
        expert: '专家'
    },

    /**
     * 难度对应分数
     */
    difficultyScores: {
        beginner: 10,
        intermediate: 20,
        expert: 30
    },

    /**
     * 渲染章节导航
     * @param {Array} chapters 章节数据
     * @param {Object} state 应用状态
     * @param {Function} onSelect 选择回调
     */
    renderChapterNav(chapters, state, onSelect) {
        const nav = document.getElementById('chapter-nav');
        if (!nav) return;

        nav.innerHTML = chapters.map(chapter => {
            const isUnlocked = state.unlockedChapters.includes(chapter.id);
            const isCurrent = state.currentChapter === chapter.id;
            const isCompleted = this.isChapterCompleted(chapter, state);

            let className = 'chapter-btn';
            let icon = chapter.icon;
            let disabled = '';

            if (!isUnlocked) {
                className += ' chapter-btn--locked';
                icon = '🔒';
                disabled = 'disabled';
            } else if (isCompleted) {
                className += ' chapter-btn--completed';
                icon = '✅';
            } else if (isCurrent) {
                className += ' chapter-btn--current';
            } else {
                className += ' chapter-btn--available';
            }

            return `
                <button class="${className}" data-chapter="${chapter.id}" ${disabled}>
                    <span class="chapter-btn__icon">${icon}</span>
                    <span>${chapter.title}</span>
                </button>
            `;
        }).join('');

        // 绑定事件
        nav.querySelectorAll('.chapter-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                const chapterId = parseInt(btn.dataset.chapter);
                onSelect(chapterId);
            });
        });
    },

    /**
     * 渲染主内容区
     * @param {Object} chapter 当前章节
     * @param {Object} topic 当前知识点
     * @param {Object} state 应用状态
     * @param {Object} callbacks 回调函数集
     */
    renderContent(chapter, topic, state, callbacks) {
        const content = document.getElementById('main-content');
        if (!content) return;

        const topicId = `${chapter.id}-${topic.term}`;
        const isCompleted = state.completedTopics.includes(topicId);
        const topicIndex = chapter.topics.findIndex(t => t.term === topic.term);
        const totalTopics = chapter.topics.length;

        content.innerHTML = `
            <div class="chapter-header">
                <h2 class="chapter-header__title">
                    <span>${chapter.icon}</span>
                    <span>${chapter.title}</span>
                    <span class="difficulty-tag difficulty-tag--${topic.difficulty}">
                        ${this.difficultyLabels[topic.difficulty]}
                    </span>
                </h2>
                <p class="chapter-header__description">${chapter.description}</p>
            </div>

            <div class="topic-progress ${isCompleted ? 'topic-progress--completed' : ''}">
                知识点 ${topicIndex + 1} / ${totalTopics}
                ${isCompleted ? ' ✅ 已掌握' : ''}
            </div>

            <div class="knowledge-card">
                <h3 class="knowledge-card__title">${topic.term}</h3>
                <p class="knowledge-card__english">${topic.english}</p>
                <p class="knowledge-card__definition">${topic.definition}</p>
                <div class="knowledge-card__tips">
                    <strong>💡 记忆提示：</strong><br>
                    ${topic.tips}
                </div>
            </div>

            <div class="quiz-section">
                <h3 class="quiz-section__title">📝 小测验</h3>
                <div class="quiz-question">
                    <p class="quiz-question__text">${topic.quiz.question}</p>
                    <div class="quiz-options" id="quiz-options">
                        ${topic.quiz.options.map((opt, i) => `
                            <div class="quiz-option" data-index="${i}">
                                ${String.fromCharCode(65 + i)}. ${opt}
                            </div>
                        `).join('')}
                    </div>
                    <div class="quiz-feedback" id="quiz-feedback" style="display: none;"></div>
                </div>
            </div>

            <div class="btn-group">
                <button class="btn btn--secondary" id="prev-btn" ${topicIndex === 0 ? 'disabled' : ''}>
                    ← 上一个
                </button>
                <button class="btn btn--primary" id="next-btn">
                    ${isCompleted ? '下一个 →' : '完成并继续 →'}
                </button>
            </div>
        `;

        // 更新当前章节名称
        const chapterNameEl = document.getElementById('current-chapter-name');
        if (chapterNameEl) {
            chapterNameEl.textContent = chapter.title;
        }

        // 绑定事件
        this.bindQuizEvents(topic, state, callbacks);
        this.bindNavigationEvents(callbacks);
    },

    /**
     * 绑定测验事件
     */
    bindQuizEvents(topic, state, callbacks) {
        const options = document.querySelectorAll('.quiz-option');
        let selectedAnswer = null;
        let answerChecked = false;

        options.forEach(option => {
            option.addEventListener('click', () => {
                if (answerChecked) return;

                options.forEach(opt => opt.classList.remove('quiz-option--selected'));
                option.classList.add('quiz-option--selected');
                selectedAnswer = parseInt(option.dataset.index);
            });
        });

        // 存储选择状态供 next 按钮使用
        window._quizState = {
            getSelected: () => selectedAnswer,
            isChecked: () => answerChecked,
            setChecked: (val) => { answerChecked = val; },
            topic: topic
        };
    },

    /**
     * 绑定导航事件
     */
    bindNavigationEvents(callbacks) {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', callbacks.onPrev);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', callbacks.onNext);
        }
    },

    /**
     * 显示答案反馈
     * @param {boolean} correct 是否正确
     * @param {number} correctIndex 正确答案索引
     * @param {number} selectedIndex 选择的答案索引
     */
    showQuizFeedback(correct, correctIndex, selectedIndex) {
        const feedback = document.getElementById('quiz-feedback');
        const options = document.querySelectorAll('.quiz-option');
        const nextBtn = document.getElementById('next-btn');

        if (correct) {
            options[selectedIndex].classList.add('quiz-option--correct');
            feedback.className = 'quiz-feedback quiz-feedback--correct';
            feedback.innerHTML = '✅ 回答正确！';
        } else {
            options[selectedIndex].classList.add('quiz-option--wrong');
            options[correctIndex].classList.add('quiz-option--correct');
            feedback.className = 'quiz-feedback quiz-feedback--wrong';
            feedback.innerHTML = `❌ 回答错误。正确答案是 ${String.fromCharCode(65 + correctIndex)}`;
        }

        feedback.style.display = 'block';
        nextBtn.textContent = '继续 →';
    },

    /**
     * 更新进度条
     * @param {number} completed 已完成数量
     * @param {number} total 总数量
     */
    updateProgress(completed, total) {
        const percentage = total > 0 ? (completed / total * 100).toFixed(1) : 0;

        const completedEl = document.getElementById('completed-count');
        const totalEl = document.getElementById('total-count');
        const fillEl = document.getElementById('progress-fill');

        if (completedEl) completedEl.textContent = completed;
        if (totalEl) totalEl.textContent = total;
        if (fillEl) fillEl.style.width = `${percentage}%`;
    },

    /**
     * 显示成就弹窗
     * @param {string} title 标题
     * @param {string} description 描述
     */
    showAchievement(title, description) {
        const popup = document.getElementById('achievement-popup');
        const titleEl = document.getElementById('achievement-title');
        const descEl = document.getElementById('achievement-desc');

        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = description;

        if (popup) {
            popup.classList.add('achievement-popup--show');
            setTimeout(() => {
                popup.classList.remove('achievement-popup--show');
            }, 3000);
        }
    },

    /**
     * 显示加载状态
     */
    showLoading() {
        const content = document.getElementById('main-content');
        if (content) {
            content.innerHTML = `
                <div class="loading">
                    <div class="loading__spinner"></div>
                    <span>加载中...</span>
                </div>
            `;
        }
    },

    /**
     * 检查章节是否完成
     * @param {Object} chapter 章节
     * @param {Object} state 状态
     * @returns {boolean}
     */
    isChapterCompleted(chapter, state) {
        return chapter.topics.every(topic =>
            state.completedTopics.includes(`${chapter.id}-${topic.term}`)
        );
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIRenderer;
}
