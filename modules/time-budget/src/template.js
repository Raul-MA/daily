import { translate } from './i18n.js';

const layout = `
    <div class="app-shell">
        <header class="app-header">
            <a class="brand" href="#/time" aria-label="[[Time Budget home]]">
                <span class="brand-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img">
                        <circle cx="12" cy="13" r="7.5"></circle>
                        <path d="M12 13V8.5M12 13l3.5 2M9 3h6"></path>
                    </svg>
                </span>
                <span>[[Time Budget]]</span>
            </a>
            <span class="privacy-note"><span class="status-dot" aria-hidden="true"></span> [[Saved on this device]]</span>
        </header>

        <section id="setupScreen" class="screen setup-screen" aria-labelledby="setupTitle">
            <div class="hero">
                <p class="eyebrow">[[Plan with the time you have]]</p>
                <h1 id="setupTitle">[[Make every minute count.]]</h1>
                <p class="hero-copy">[[Set your finish time, give each task a budget, and focus on one thing at a time.]]</p>
            </div>

            <div class="setup-grid">
                <section class="panel deadline-panel" aria-labelledby="deadlineTitle">
                    <div class="section-heading">
                        <span class="step-number" aria-hidden="true">1</span>
                        <div>
                            <h2 id="deadlineTitle">[[Choose your finish time]]</h2>
                            <p>[[When do you need to be done?]]</p>
                        </div>
                    </div>
                    <label class="sr-only" for="goalTime">[[Finish time]]</label>
                    <input type="time" id="goalTime" class="time-input" required>
                    <div id="setupTimeRemaining" class="setup-time-remaining hidden" aria-live="polite"></div>
                </section>

                <section class="panel tasks-panel" aria-labelledby="tasksTitle">
                    <div class="section-heading">
                        <span class="step-number" aria-hidden="true">2</span>
                        <div>
                            <h2 id="tasksTitle">[[Build your plan]]</h2>
                            <p>[[Add tasks in the order you’ll do them.]]</p>
                        </div>
                    </div>

                    <div class="task-column-labels" aria-hidden="true">
                        <span>[[Task]]</span>
                        <span>[[Minutes]]</span>
                    </div>
                    <div id="taskList" class="task-list"></div>
                    <button type="button" class="button ghost add-task-btn" data-time-click="app.addTaskInput()">
                        <span aria-hidden="true">＋</span> [[Add task]]
                    </button>
                    <div id="remainingAssignedTime" class="remaining-assigned-time hidden" aria-live="polite"></div>
                </section>

                <button type="button" class="button primary start-budget-btn" data-time-click="app.startBudget()">
                    [[Start my plan]]
                    <span aria-hidden="true">→</span>
                </button>

                <details class="panel template-section">
                    <summary>
                        <span>
                            <strong>[[Templates]]</strong>
                            <small>[[Save or reuse the task list above]]</small>
                        </span>
                        <span class="summary-icon" aria-hidden="true">⌄</span>
                    </summary>
                    <div class="template-body">
                        <p class="template-explainer">[[Templates save the current task names, order, and minute budgets so you can reuse this plan later.]]</p>
                        <label for="templateSelect">[[Load a saved template]]</label>
                        <select id="templateSelect" data-time-change="app.loadTemplate()">
                            <option value="">[[Choose a template]]</option>
                        </select>
                        <div class="template-controls">
                            <label class="sr-only" for="templateName">[[New template name]]</label>
                            <input type="text" id="templateName" placeholder="[[Name this plan]]" maxlength="60">
                            <button type="button" class="button secondary" data-time-click="app.saveTemplate()">[[Save current plan]]</button>
                        </div>
                        <div class="template-io">
                            <button type="button" class="text-button danger-text" data-time-click="app.deleteTemplate()">[[Delete selected]]</button>
                            <button type="button" class="text-button" data-time-click="app.exportTemplates()">[[Export templates]]</button>
                            <label class="text-button btn-file-label">
                                [[Import templates]]
                                <input type="file" accept=".json,application/json" data-time-change="app.importTemplates(this)" hidden>
                            </label>
                        </div>
                    </div>
                </details>
            </div>
        </section>

        <section id="timerScreen" class="screen timer-screen hidden" aria-labelledby="currentTaskName">
            <header class="session-header">
                <button type="button" class="button ghost compact" data-time-click="app.resetApp()" aria-label="[[Edit this session]]">
                    <span aria-hidden="true">←</span> [[Edit plan]]
                </button>
                <div class="session-deadline">
                    <span>[[Finish by]] <strong id="goalTimeDisplay"></strong></span>
                    <span>[[Now]] <strong id="currentTime"></strong></span>
                </div>
            </header>

            <div class="timer-layout">
                <section class="focus-panel">
                    <div class="focus-kicker">
                        <span class="pulse-dot" aria-hidden="true"></span>
                        [[Current focus]]
                    </div>
                    <h1 id="currentTaskName"></h1>
                    <div class="task-info">[[Budgeted for]] <strong id="allocatedTime"></strong></div>

                    <div class="progress-container" role="timer" aria-live="off">
                        <svg class="circular-progress" viewBox="0 0 200 200" aria-hidden="true">
                            <circle class="progress-bg" cx="100" cy="100" r="85"></circle>
                            <circle class="progress-bar" cx="100" cy="100" r="85" id="progressCircle"></circle>
                        </svg>
                        <div class="progress-center">
                            <div id="timeDisplay" class="time-display">0:00</div>
                            <span>[[remaining]]</span>
                        </div>
                    </div>

                    <div class="task-controls">
                        <button type="button" id="startPauseBtn" class="button primary" data-time-click="app.toggleTimer()">[[Start focus]]</button>
                        <button type="button" class="button secondary" data-time-click="app.completeTask()">[[Mark done]]</button>
                    </div>
                    <p class="shortcut-hint">[[Tip: press]] <kbd>[[Space]]</kbd> [[to pause or resume.]]</p>
                </section>

                <aside class="session-sidebar">
                    <section class="deadline-card" aria-label="[[Session time remaining]]">
                        <span>[[Time until finish]]</span>
                        <strong class="time-remaining" id="timeRemaining"></strong>
                    </section>

                    <section class="queue-panel" aria-labelledby="queueTitle">
                        <div class="queue-heading">
                            <div>
                                <p class="eyebrow">[[Up next]]</p>
                                <h2 id="queueTitle">[[Task queue]]</h2>
                            </div>
                            <button type="button" class="icon-add-button" data-time-click="app.addRemainingTask()" aria-label="[[Add another task]]">＋</button>
                        </div>
                        <div id="remainingTasksList" class="remaining-tasks-list"></div>
                    </section>
                </aside>
            </div>
        </section>
    </div>

    <div id="reallocationModal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="reallocationTitle">
        <div class="modal-content">
            <div class="modal-icon" aria-hidden="true">↗</div>
            <p class="eyebrow">[[Adjust the plan]]</p>
            <h2 id="reallocationTitle">[[This task ran over]]</h2>
            <p class="deficit-info">[[You used]] <strong id="deficitAmount"></strong> [[extra. Take that time from the tasks below, or continue without changing them.]]</p>
            <div id="reallocationList" class="reallocation-list"></div>
            <div class="realloc-summary" id="reallocSummary" aria-live="polite"></div>
            <div class="modal-actions">
                <button type="button" class="button ghost" data-time-click="app.skipReallocation()">[[Keep current budgets]]</button>
                <button type="button" class="button primary" data-time-click="app.applyReallocation()" id="applyReallocBtn" disabled>[[Apply changes]]</button>
            </div>
        </div>
    </div>

    <div id="toast" class="toast hidden" role="status" aria-live="polite"></div>
    `;

export function template(language) {
  return layout.replace(/\[\[([^\]]+)\]\]/g, (_, text) => translate(language, text));
}
