document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-perfil');
  if (!form) return;

  function setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg || '';
  }

  function clearErrors() {
    setError('e-peso', '');
    setError('e-altura', '');
    setError('e-genero', '');
    setError('e-treino', '');
    setError('e-opeso', '');
  }

  function validateForm() {
    clearErrors();
    let ok = true;

    const peso = document.getElementById('peso');
    const altura = document.getElementById('altura');

    if (peso && peso.value) {
      const v = parseFloat(peso.value.replace(',', '.'));
      if (Number.isNaN(v) || v <= 0) {
        setError('e-peso', 'Informe um peso válido.');
        ok = false;
      }
    }

    if (altura && altura.value) {
      const v = parseFloat(altura.value.replace(',', '.'));
      if (Number.isNaN(v) || v <= 0) {
        setError('e-altura', 'Informe uma altura válida.');
        ok = false;
      }
    }

    const genero = form.querySelector('input[name="genero"]:checked');
    if (!genero) {
      setError('e-genero', 'Selecione uma opção.');
      ok = false;
    }

    const objetivosTreino = form.querySelectorAll('input[name="objetivoTreino[]"]:checked');
    if (objetivosTreino.length === 0) {
      setError('e-treino', 'Escolha pelo menos um objetivo de treino.');
      ok = false;
    }

    const objetivoPeso = form.querySelector('input[name="objetivoPeso"]:checked');
    if (!objetivoPeso) {
      setError('e-opeso', 'Selecione um objetivo de peso.');
      ok = false;
    }

    return ok;
  }

  form.addEventListener('submit', (e) => {
    if (!validateForm()) {
      e.preventDefault();
    }
  });

  fetch('../api/buscar_perfil.php')
    .then(resp => resp.json())
    .then(data => {
      if (!data.ok || !data.perfil) return;
      const p = data.perfil;

      const peso = document.getElementById('peso');
      const altura = document.getElementById('altura');
      if (peso && p.peso !== null) peso.value = p.peso;
      if (altura && p.altura !== null) altura.value = p.altura;

      if (p.genero) {
        const generoInput = document.querySelector(
          `input[name="genero"][value="${p.genero}"]`
        );
        if (generoInput) generoInput.checked = true;
      }

      const objetivosTreino = (p.objetivo_treino || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      objetivosTreino.forEach(val => {
        const checkbox = document.querySelector(
          `input[name="objetivoTreino[]"][value="${val}"]`
        );
        if (checkbox) checkbox.checked = true;
      });

      if (p.objetivo_peso) {
        const objetivoPesoInput = document.querySelector(
          `input[name="objetivoPeso"][value="${p.objetivo_peso}"]`
        );
        if (objetivoPesoInput) objetivoPesoInput.checked = true;
      }
    })
    .catch(err => {
      console.error('Erro ao carregar perfil:', err);
    });
});
