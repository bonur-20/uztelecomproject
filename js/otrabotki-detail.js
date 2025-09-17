// Обработка отображения деталей оператора
document.addEventListener('DOMContentLoaded', function() {
    const operatorsList = document.querySelector('.otrabotki-operators-list');
    const detailCard = document.querySelector('.otrabotki-detail-card');
    const rightPanel = document.querySelector('.training-layout__right');

    // Показать карточку всегда; если оператор не выбран — установить состояние empty на правой панели
    if (detailCard && rightPanel) {
        const selectedOperator = document.querySelector('.otrabotki-operator-item.selected');
        if (!selectedOperator) {
            rightPanel.classList.add('empty');
            detailCard.style.display = 'flex';
        } else {
            rightPanel.classList.remove('empty');
            detailCard.style.display = 'flex';
        }
    }

    // Обработка клика по оператору
    if (operatorsList) {
        operatorsList.addEventListener('click', function(e) {
            const operatorItem = e.target.closest('.otrabotki-operator-item');
            if (operatorItem) {
                // Снять выделение со всех операторов
                document.querySelectorAll('.otrabotki-operator-item').forEach(item => {
                    item.classList.remove('selected');
                });

                // Выделить выбранного оператора
                operatorItem.classList.add('selected');

                // Показать карточку деталей и убрать состояние пустого с правой панели
                if (detailCard && rightPanel) {
                    rightPanel.classList.remove('empty');
                    detailCard.style.display = 'flex';

                    // Здесь можно добавить код для загрузки данных выбранного оператора
                    // например, через AJAX или из предзагруженных данных

                    // Получаем индекс оператора из атрибута data-idx
                    const operatorIdx = parseInt(operatorItem.getAttribute('data-idx'));

                    // Если есть доступ к данным операторов, обновляем детали через менеджер
                    if (window.otrabotkiOperators && window.updateOperatorDetails) {
                        window.updateOperatorDetails(operatorIdx);
                        return;
                    }

                    // Резервный вариант, если функция менеджера недоступна
                    const operatorName = operatorItem.querySelector('.otrabotki-operator-name').textContent;
                    const operatorAvatar = operatorItem.querySelector('.otrabotki-operator-avatar').src;

                    document.getElementById('otrabotki-detail-name').textContent = operatorName;
                    document.getElementById('otrabotki-detail-avatar').src = operatorAvatar;

                    // Словарь групп для операторов
                    const operatorGroups = {
                        "Abdug'aniyev Abdulaziz Abdug'ofur o'g'li (358)": "Группа 1009",
                        "Abduxalilov Abdulaziz Абдували o'g'li (0308)": "Группа 1242",
                        "Adilova Arofat Faxriddin qizi (0211)": "Группа 1170",
                        "Ahmadova Xilola Mahmud qizi (0256)": "Группа ДОП",
                        "Alimov Shaxzod Ilxomovich (0544)": "Группа 1093",
                        "Ayniddinov Tursunboy Dilshod o'g'li (0372)": "Группа БКМ",
                        "Banyazov Kudratilla Irgashovich (0281)": "Группа 1000",
                        "Baxtiyorov Sirojiddin Furqat o'g'li (269)": "Группа 1170",
                        "Bekmuxamedov Abdumavлон Abduvoxid o'g'li (0365)": "Группа 1242",
                        "Fozilxonov Zoirxon Davron o'g'li (0147)": "Группа 1093",
                        "Riskiyev Bonur Boxodir o'g'li (0485)": "Группа ДОП",
                        "Ruziyeva Xusnora Sodiqjon qizi (247)": "Группа БКМ",
                        "Sobirov Abduxakim Qobil o'g'li (0116)": "Группа 1009"
                    };

                    // Обновляем группу оператора
                    const groupElement = document.querySelector('.otrabotki-detail-group');
                    if (groupElement && operatorName) {
                        const group = operatorGroups[operatorName] || "Группа 1000";
                        groupElement.textContent = group;
                    }
                }
            }
        });
    }
});
