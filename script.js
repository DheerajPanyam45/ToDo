class TodoApp {
    constructor() {
        this.categories = JSON.parse(localStorage.getItem('categories')) || [];
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || {};
        this.initializeApp();
    }

    initializeApp() {
        const categoryInput = document.getElementById('categoryInput');
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        
        addCategoryBtn.addEventListener('click', () => {
            const categoryName = categoryInput.value.trim();
            if (categoryName) {
                this.addCategory(categoryName);
                categoryInput.value = '';
            }
        });

        // Add event delegation for task addition
        document.getElementById('categoriesContainer').addEventListener('click', (event) => {
            if (event.target.textContent === 'Add Task') {
                const categoryCard = event.target.closest('.category-card');
                const categoryName = categoryCard.querySelector('.category-header h2').textContent;
                const taskInput = categoryCard.querySelector('.task-input');
                const deadlineInput = categoryCard.querySelector('.deadline-input');
                
                this.addTask(
                    categoryName, 
                    taskInput.value.trim(), 
                    deadlineInput.value
                );
                
                // Reset inputs
                taskInput.value = '';
                deadlineInput.value = '';
            }
        });

        this.renderCategories();
    }

    addCategory(name) {
        // Prevent duplicate categories
        if (this.categories.includes(name)) {
            alert('Category already exists!');
            return;
        }

        this.categories.push(name);
        // Initialize tasks for this category
        this.tasks[name] = this.tasks[name] || [];
        this.saveToLocalStorage();
        this.renderCategories();
    }

    removeCategory(name) {
        // Remove category from list
        this.categories = this.categories.filter(cat => cat !== name);
        // Remove tasks for this category
        delete this.tasks[name];
        this.saveToLocalStorage();
        this.renderCategories();
    }

    addTask(categoryName, taskText, deadline) {
        if (!taskText) return;

        // Ensure the category exists in tasks
        if (!this.tasks[categoryName]) {
            this.tasks[categoryName] = [];
        }

        const task = {
            id: Date.now(),
            text: taskText,
            deadline: deadline || null,
            completed: false
        };

        this.tasks[categoryName].push(task);
        this.saveToLocalStorage();
        this.renderCategories();
    }

    removeTask(categoryName, taskId) {
        this.tasks[categoryName] = this.tasks[categoryName].filter(task => task.id !== taskId);
        this.saveToLocalStorage();
        this.renderCategories();
    }

    toggleTaskCompletion(categoryName, taskId) {
        const task = this.tasks[categoryName].find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveToLocalStorage();
            this.renderCategories();
        }
    }

    calculateDaysRemaining(deadline) {
        if (!deadline) return null;
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const timeDiff = deadlineDate.getTime() - today.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    saveToLocalStorage() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    renderCategories() {
        const container = document.getElementById('categoriesContainer');
        container.innerHTML = '';

        this.categories.forEach(categoryName => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            
            // Category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.innerHTML = `
                <h2>${categoryName}</h2>
                <button onclick="todoApp.removeCategory('${categoryName}')">🗑️</button>
            `;
            categoryCard.appendChild(categoryHeader);

            // Task creator
            const taskCreator = document.createElement('div');
            taskCreator.className = 'task-creator';
            taskCreator.innerHTML = `
                <input type="text" placeholder="Enter task" class="task-input">
                <input type="date" class="deadline-input">
                <button>Add Task</button>
            `;
            categoryCard.appendChild(taskCreator);

            // Task list
            const taskList = document.createElement('div');
            taskList.className = 'task-list';
            
            // Render tasks for this category
            (this.tasks[categoryName] || []).forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
                
                // Calculate days remaining
                const daysRemaining = this.calculateDaysRemaining(task.deadline);
                let deadlineClass = '';
                let deadlineText = '';

                if (task.deadline) {
                    if (daysRemaining < 0) {
                        deadlineClass = 'urgent-deadline';
                        deadlineText = `Overdue by ${Math.abs(daysRemaining)} days`;
                    } else if (daysRemaining <= 3) {
                        deadlineClass = 'warning-deadline';
                        deadlineText = `${daysRemaining} days remaining`;
                    } else {
                        deadlineText = `${daysRemaining} days remaining`;
                    }
                }

                taskItem.innerHTML = `
                    <div>
                        ${task.text}
                        ${task.deadline ? 
                            `<span class="task-deadline ${deadlineClass}">
                                (${new Date(task.deadline).toLocaleDateString()} - ${deadlineText})
                            </span>` : 
                            ''
                        }
                    </div>
                    <div class="task-actions">
                        <button onclick="todoApp.toggleTaskCompletion('${categoryName}', ${task.id})">
                            ${task.completed ? '↩️' : '✅'}
                        </button>
                        <button class="delete-btn" onclick="todoApp.removeTask('${categoryName}', ${task.id})">🗑️</button>
                    </div>
                `;
                taskList.appendChild(taskItem);
            });

            categoryCard.appendChild(taskList);
            container.appendChild(categoryCard);
        });
    }
}

// Initialize the app
const todoApp = new TodoApp();