const wrappers = document.querySelectorAll('.input-wrapper');

wrappers.forEach(wrapper => {
    const input = wrapper.querySelector('input');
    const tooltip = wrapper.querySelector('.tooltip');

    input.addEventListener('input', () => {
        tooltip.textContent = input.value;
    });

    input.addEventListener('mouseover', () => {
        tooltip.textContent = input.value;
    });
});