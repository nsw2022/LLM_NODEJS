$(document).ready(function() {
    const data = ["Apple", "Banana", "Cherry", "Date", "Fig", "Grape", "Kiwi", "Mango", "Orange", "Peach"];

    $('#autocomplete-input').on('input', function() {
        const input = $(this).val().toLowerCase();
        const resultsContainer = $('#autocomplete-results');
        resultsContainer.empty();

        if (input) {
            const filteredData = data.filter(item => item.toLowerCase().includes(input));
            if (filteredData.length) {
                filteredData.forEach(item => {
                    resultsContainer.append(`<div class="autocomplete-item">${item}</div>`);
                });
                resultsContainer.show();
            } else {
                resultsContainer.hide();
            }
        } else {
            resultsContainer.hide();
        }
    });

    // 선택 이벤트 처리
    $('#autocomplete-results').on('click', '.autocomplete-item', function() {
        $('#autocomplete-input').val($(this).text());
        $('#autocomplete-results').empty().hide();
    });
});
