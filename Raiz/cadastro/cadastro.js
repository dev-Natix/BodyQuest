document.querySelector('form').addEventListener('submit', function (event) {
    let is_valid = true;
    const inputs = document.querySelectorAll('.input');
    const senha = document.querySelector('#senha');
    const confirma_senha = document.querySelector('#confirma_senha');
    const nascimento = document.querySelector('#nascimento');
    const container = document.querySelector('.container');

    document.querySelectorAll('.error-message').forEach(el => el.remove());

    const errors = [];

    inputs.forEach(input => {
        input.style.borderColor = "#0A0A0A";
        input.addEventListener('input', function () {
            if (this.value.trim() !== "") this.style.borderColor = "#0A0A0A";
        });
    });

    let has_empty = false;
    inputs.forEach(input => {
        if (input.value.trim() === "") {
            has_empty = true;
            is_valid = false;
            input.style.borderColor = "#F05656";
        }
    });
    if (has_empty) errors.push("Por favor, preencha todos os campos obrigatórios.");

    if (senha.value.trim() !== confirma_senha.value.trim()) {
        is_valid = false;
        senha.style.borderColor = "#F05656";
        confirma_senha.style.borderColor = "#F05656";
        errors.push("As senhas não coincidem.");
    }

    const today = new Date();
    const minDate = new Date('1930-01-01');

    if (nascimento.value.trim() !== "") {
        const dn = new Date(nascimento.value);
        if (!isNaN(dn.getTime())) {
            if (dn < minDate || dn > today) {
                is_valid = false;
                nascimento.style.borderColor = "#F05656";
                errors.push("Data de nascimento inválida. Por favor, insira uma data entre 01/01/1930 e a data atual.");
            } else {
                let age = today.getFullYear() - dn.getFullYear();
                const m = today.getMonth() - dn.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dn.getDate())) age--;

                if (age < 12) {
                    is_valid = false;
                    nascimento.style.borderColor = "#F05656";
                    errors.push("Você precisa ter pelo menos 12 anos para se cadastrar.");
                }
            }
        } else {
            is_valid = false;
            nascimento.style.borderColor = "#F05656";
            errors.push("Data de nascimento inválida.");
        }
    }

    if (!is_valid) {
        event.preventDefault();
        const el = document.createElement('h3');
        el.classList.add('error-message');
        el.textContent = errors[0];
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