
(() => {
  const form   = document.getElementById('form-perfil');
  if (!form) return;

  const peso   = document.getElementById('peso');
  const altura = document.getElementById('altura');

  const ePeso   = document.getElementById('e-peso');
  const eAltura = document.getElementById('e-altura');
  const eGen    = document.getElementById('e-genero');
  const eTreino = document.getElementById('e-treino');
  const eOPeso  = document.getElementById('e-opeso');

  const rGenero = () => form.querySelectorAll('input[name="genero"]');
  const rOPeso  = () => form.querySelectorAll('input[name="objetivoPeso"]');

  const cMuscu  = document.getElementById('t-muscu');
  const cCorr   = document.getElementById('t-corrida');
  const cAmbos  = document.getElementById('t-ambos');

  // UX: "Ambos" é exclusivo dos outros
  if (cAmbos && cMuscu && cCorr) {
    cAmbos.addEventListener('change', () => {
      if (cAmbos.checked) { cMuscu.checked = false; cCorr.checked = false; }
    });
    [cMuscu, cCorr].forEach(el => el.addEventListener('change', () => {
      if (el.checked) cAmbos.checked = false;
    }));
  }

  // Helpers
  const setErr = (el, msg) => { if (el) el.textContent = msg || ''; };
  const toNum  = (v) => Number(String(v).replace(',', '.'));

  // Validação
  form.addEventListener('submit', (e) => {
    let ok = true;

    // limpa mensagens
    [ePeso, eAltura, eGen, eTreino, eOPeso].forEach(el => setErr(el, ''));

    // Peso (kg): 20–400 (ajuste se quiser)
    const vPeso = toNum(peso.value);
    if (!vPeso) { setErr(ePeso, 'Informe seu peso.'); ok = false; }
    else if (vPeso < 20 || vPeso > 400) { setErr(ePeso, 'Peso inválido (20 a 400 kg).'); ok = false; }

    // Altura (m): 1.20–2.50
    const vAlt = toNum(altura.value);
    if (!vAlt) { setErr(eAltura, 'Informe sua altura.'); ok = false; }
    else if (vAlt < 1.2 || vAlt > 2.5) { setErr(eAltura, 'Altura inválida (1.20 a 2.50 m).'); ok = false; }

    // Gênero: obrigatório
    const genChecked = Array.from(rGenero()).some(r => r.checked);
    if (!genChecked) { setErr(eGen, 'Selecione uma opção.'); ok = false; }

    // Objetivo de treino: pelo menos 1 (musculação, corrida ou ambos)
    const treinoChecked = (cMuscu?.checked || cCorr?.checked || cAmbos?.checked);
    if (!treinoChecked) { setErr(eTreino, 'Escolha pelo menos uma opção.'); ok = false; }

    // Objetivo de peso (radio): obrigatório
    const opesoChecked = Array.from(rOPeso()).some(r => r.checked);
    if (!opesoChecked) { setErr(eOPeso, 'Selecione seu objetivo.'); ok = false; }

    if (!ok) e.preventDefault();
  });

  // Limpa mensagens ao digitar/tocar
  ['input','change'].forEach(evt => {
    form.addEventListener(evt, (ev) => {
      const id = ev.target?.id;
      if (id === 'peso')   setErr(ePeso, '');
      if (id === 'altura') setErr(eAltura, '');
      if (ev.target?.name === 'genero')       setErr(eGen, '');
      if (ev.target?.name?.startsWith('objetivoTreino')) setErr(eTreino, '');
      if (ev.target?.name === 'objetivoPeso') setErr(eOPeso, '');
    });
  });
})();

