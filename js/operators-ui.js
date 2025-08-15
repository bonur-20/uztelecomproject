/**
 * Интерфейс операторов
 * Отвечает за отображение списка ошибок, поиск, фильтрацию и обучение
 */

const OperatorsUI = {
    /**
     * Рендеринг списка ошибок оператора
     * @param {Array} errors - Массив ошибок
     */
    renderOperatorErrors: function(errors) {
        const container = document.getElementById('operator-errors-list');
        if (!container) return;
        
        container.innerHTML = errors.map(error => `
            <div class="error-item ${error.isTrained ? 'trained' : ''}" data-error-id="${error.id}">
                <div class="error-header">
                    <div class="error-info">
                        <div class="error-code">${error.code}</div>
                        <div class="error-details">
                            <div class="error-detail-item">
                                <span class="material-icons">schedule</span>
                                <span>Дата/время: ${error.date} ${error.time}</span>
                            </div>
                            <div class="error-detail-item">
                                <span class="material-icons">build</span>
                                <span>Услуга: ${error.service}</span>
                            </div>
                            <div class="error-detail-item">
                                <span class="material-icons">account_circle</span>
                                <span>ЛК: ${error.lk}</span>
                            </div>
                        </div>
                        <div class="error-description">${error.description}</div>
                    </div>
                    <div class="actions-container">
                        ${!error.isTrained ? `
                            <button class="train-error-btn" onclick="OperatorsUI.showTrainingForm(${error.id})">
                                <span class="material-icons">school</span>
                                Обучить
                            </button>
                        ` : ''}
                        <button class="appeal-error-btn" onclick="showAppealForm(${error.id})">
                            <span class="material-icons">gavel</span>
                            Аппеляция
                        </button>
                    </div>
                </div>
                
                ${error.trainingComments.length > 0 ? `
                    <div class="training-comments">
                        ${error.trainingComments.map((comment, index) => `
                            <div class="training-comment ${comment.isOriginal ? 'original' : 'edited'}">
                                <div class="comment-date">
                                    ${comment.isOriginal ? 'Дата обучения:' : 'Отредактировано:'} ${comment.date}
                                </div>
                                <div class="comment-text">${comment.text}</div>
                                ${index === 0 && error.trainingComments.length > 1 ? `
                                    <div class="comment-arrow">
                                        <span class="material-icons">arrow_forward</span>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                        <button class="train-error-btn" onclick="OperatorsUI.editTrainingComment(${error.id})">
                            <span class="material-icons">edit</span>
                            Редактировать
                        </button>
                    </div>
                ` : ''}
                
                <div class="add-comment-form" id="comment-form-${error.id}">
                    <textarea class="comment-input" id="comment-input-${error.id}" 
                              placeholder="Введите комментарий обучения..."></textarea>
                    <div class="comment-form-actions">
                        <button class="comment-btn comment-btn-save" onclick="OperatorsUI.saveTrainingComment(${error.id})">
                            <span class="material-icons">check</span>
                            Сохранить
                        </button>
                        <button class="comment-btn comment-btn-cancel" onclick="OperatorsUI.cancelTrainingComment(${error.id})">
                            <span class="material-icons">close</span>
                            Отменить
                        </button>
                    </div>
                </div>
                
                ${error.appeals && error.appeals.length > 0 ? `
                    <div class="appeals-list">
                        <h4>Аппеляции:</h4>
                        ${error.appeals.map(appeal => `
                            <div class="appeal-item">
                                <div class="appeal-date">
                                    <span class="material-icons">schedule</span>
                                    Отправлено: ${appeal.date}
                                </div>
                                <div class="appeal-text">${appeal.text}</div>
                                <div class="appeal-status ${appeal.status}">
                                    <span class="material-icons">
                                        ${appeal.status === 'pending' ? 'hourglass_empty' : 
                                          appeal.status === 'approved' ? 'check_circle' : 'cancel'}
                                    </span>
                                    ${appeal.status === 'pending' ? 'На рассмотрении' : 
                                      appeal.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    },
    
    /**
     * Показать форму обучения
     * @param {number} errorId - ID ошибки
     */
    showTrainingForm: function(errorId) {
        const form = document.getElementById(`comment-form-${errorId}`);
        if (form) {
            form.classList.add('show');
            const input = document.getElementById(`comment-input-${errorId}`);
            if (input) {
                input.focus();
            }
        }
    },
    
    /**
     * Сохранить комментарий обучения
     * @param {number} errorId - ID ошибки
     */
    saveTrainingComment: function(errorId) {
        const input = document.getElementById(`comment-input-${errorId}`);
        const form = document.getElementById(`comment-form-${errorId}`);
        
        if (!input || !form) return;
        
        const commentText = input.value.trim();
        if (!commentText) {
            alert('Пожалуйста, введите комментарий');
            return;
        }
        
        // Находим ошибку в данных
        const error = OperatorsManager.currentOperatorErrors.find(err => err.id === errorId);
        if (!error) return;
        
        // Создаем новый комментарий
        const now = new Date();
        const dateStr = now.toLocaleDateString('ru-RU');
        const timeStr = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        const newComment = {
            id: error.trainingComments.length + 1,
            date: `${dateStr} ${timeStr}`,
            text: commentText,
            isOriginal: error.trainingComments.length === 0
        };
        
        // Добавляем комментарий и помечаем ошибку как обученную
        error.trainingComments.push(newComment);
        error.isTrained = true;
        
        // Перерендериваем список ошибок
        this.renderOperatorErrors(OperatorsManager.currentOperatorErrors);
        
        console.log(`Добавлен комментарий для ошибки ${errorId}: ${commentText}`);
    },
    
    /**
     * Отменить добавление комментария
     * @param {number} errorId - ID ошибки
     */
    cancelTrainingComment: function(errorId) {
        const form = document.getElementById(`comment-form-${errorId}`);
        const input = document.getElementById(`comment-input-${errorId}`);
        
        if (form && input) {
            form.classList.remove('show');
            input.value = '';
        }
    },
    
    /**
     * Редактировать комментарий обучения
     * @param {number} errorId - ID ошибки
     */
    editTrainingComment: function(errorId) {
        const error = OperatorsManager.currentOperatorErrors.find(err => err.id === errorId);
        if (!error || error.trainingComments.length === 0) return;
        
        const lastComment = error.trainingComments[error.trainingComments.length - 1];
        const newCommentText = prompt('Редактировать комментарий:', lastComment.text);
        
        if (newCommentText && newCommentText.trim() !== lastComment.text) {
            // Создаем новый "отредактированный" комментарий
            const now = new Date();
            const dateStr = now.toLocaleDateString('ru-RU');
            const timeStr = now.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            
            const editedComment = {
                id: error.trainingComments.length + 1,
                date: `${dateStr} ${timeStr}`,
                text: newCommentText.trim(),
                isOriginal: false
            };
            
            error.trainingComments.push(editedComment);
            
            // Перерендериваем список ошибок
            this.renderOperatorErrors(OperatorsManager.currentOperatorErrors);
            
            console.log(`Отредактирован комментарий для ошибки ${errorId}`);
        }
    },
    
    /**
     * Настройка поиска операторов
     * @param {Array} allOperators - Все операторы
     */
    setupOperatorsSearch: function(allOperators) {
        const searchInput = document.getElementById('operators-search-input');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            let filteredOperators = allOperators;
            
            // Применяем поиск
            if (searchTerm) {
                filteredOperators = filteredOperators.filter(operator => 
                    operator.name.toLowerCase().includes(searchTerm)
                );
            }
            
            // Применяем текущий фильтр
            const activeFilter = document.querySelector('input[name="operator-filter"]:checked');
            if (activeFilter) {
                filteredOperators = OperatorsManager.applyOperatorFilter(filteredOperators, activeFilter.value);
            }
            
            OperatorsManager.renderOperatorsList(filteredOperators);
        });
    },
    
    /**
     * Настройка фильтров операторов
     * @param {Array} allOperators - Все операторы
     */
    setupOperatorsFilters: function(allOperators) {
        const filterRadios = document.querySelectorAll('input[name="operator-filter"]');
        
        filterRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    let filteredOperators = allOperators;
                    
                    // Применяем поиск если есть
                    const searchInput = document.getElementById('operators-search-input');
                    if (searchInput && searchInput.value.trim()) {
                        const searchTerm = searchInput.value.toLowerCase().trim();
                        filteredOperators = filteredOperators.filter(operator => 
                            operator.name.toLowerCase().includes(searchTerm)
                        );
                    }
                    
                    // Применяем фильтр
                    filteredOperators = OperatorsManager.applyOperatorFilter(filteredOperators, radio.value);
                    
                    OperatorsManager.renderOperatorsList(filteredOperators);
                }
            });
        });
    }
};

// Добавляем методы в OperatorsManager для обратной совместимости
OperatorsManager.renderOperatorErrors = OperatorsUI.renderOperatorErrors;
OperatorsManager.showTrainingForm = OperatorsUI.showTrainingForm;
OperatorsManager.saveTrainingComment = OperatorsUI.saveTrainingComment;
OperatorsManager.cancelTrainingComment = OperatorsUI.cancelTrainingComment;
OperatorsManager.editTrainingComment = OperatorsUI.editTrainingComment;
OperatorsManager.setupOperatorsSearch = OperatorsUI.setupOperatorsSearch;
OperatorsManager.setupOperatorsFilters = OperatorsUI.setupOperatorsFilters;

// Экспорт для использования в других модулях
window.OperatorsUI = OperatorsUI;
