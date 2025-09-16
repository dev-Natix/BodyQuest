document.querySelector('form').addEventListener('submit', function (event) {
    let is_valid = true;
    const inputs = document.querySelectorAll('.input');
    const container = document.querySelector('.container');


    const errors = [];

    inputs.forEach(input => {
        input.style.borderColor = "#0A0A0A";
        input.addEventListener('input', function () {
            if (this.value.trim() !== "") this.style.borderColor = "#0A0A0A";
        });
    });


    inputs.forEach(input => {
        if (input.value.trim() === "") {
            is_valid = false;
            input.style.borderColor = "#F05656";
        }
    });

    if (!is_valid) {
        event.preventDefault();
        const el = document.createElement('h3');
        el.classList.add('error-message');
        el.textContent = "Por favor, preencha todos os campos.";
        el.style.color = "#F05656";
        el.style.margin = "8px 0 0 0";
        container.appendChild(el);
    }
});

function toggleSenha(id, el) {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
        el.textContent = "🔒"; 
    } else {
        input.type = "password";
        el.textContent = "👁️"; 
    }
}