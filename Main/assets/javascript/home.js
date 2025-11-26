document.addEventListener('DOMContentLoaded', () => {
  const cardMeta = document.getElementById('card-meta');
  const metaStatusText = document.getElementById('meta-status-text');
  const metaStatusDetail = document.getElementById('meta-status-detail');

  const workoutTitle = document.getElementById('workout-title');
  const workoutExercises = document.getElementById('workout-exercises');

  const userNameEl = document.getElementById('user-name');
  const birthdayCard = document.getElementById('card-birthday');
  const birthdayText = document.getElementById('birthday-text');

  function formatTodayBR() {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  function setMetaCardState(state) {
    if (!cardMeta) return;
    cardMeta.classList.remove(
      'dashboard-card--neutral',
      'dashboard-card--success',
      'dashboard-card--warning',
      'dashboard-card--empty'
    );
    cardMeta.classList.add(state);
  }

  function formatExercise(e) {
    const parts = [];
    if (e.nome_exercicio) parts.push(e.nome_exercicio);
    if (e.tipo_exercicio === 'cardiovascular') parts.push('cardio');
    if (e.tipo_exercicio === 'musculacao') parts.push('musculação');
    if (e.duracao_minutos) parts.push(`${e.duracao_minutos} min`);
    if (e.series) parts.push(`${e.series} séries`);
    if (e.repeticoes) parts.push(`${e.repeticoes} reps`);
    return parts.join(' • ');
  }

  async function carregarUsuario() {
    try {
      const resp = await fetch('../api/usuario_logado.php');
      if (!resp.ok) return;
      const data = await resp.json();

      if (data.ok && data.nome && userNameEl) {
        userNameEl.textContent = data.nome;
      }

      if (birthdayCard && birthdayText) {
        if (data.ok && data.aniversario_hoje) {
          birthdayCard.style.display = 'block';
          birthdayText.textContent = `Feliz aniversário, ${data.nome}! Que seu novo ano seja cheio de saúde, conquistas e muitos treinos concluídos. 🎉 🎂`;
        } else {
          birthdayCard.style.display = 'none';
        }
      }
    } catch (e) {
      if (birthdayCard) {
        birthdayCard.style.display = 'none';
      }
    }
  }

  async function carregarMetaDia() {
    if (!metaStatusText || !metaStatusDetail) return;
    metaStatusText.textContent = 'Carregando suas metas...';
    metaStatusDetail.textContent = '';
    setMetaCardState('dashboard-card--neutral');

    try {
      const resp = await fetch('../api/metas.php');
      if (!resp.ok) {
        metaStatusText.textContent = 'Não foi possível carregar as metas.';
        setMetaCardState('dashboard-card--warning');
        return;
      }

      const metas = await resp.json();
      const hoje = formatTodayBR();
      const metaHoje = Array.isArray(metas)
        ? metas.find(m => m.dia === hoje)
        : null;

      if (!metaHoje) {
        metaStatusText.textContent = 'Você ainda não definiu suas metas para hoje.';
        metaStatusDetail.textContent = 'Acesse a página de metas e crie o desafio do dia.';
        setMetaCardState('dashboard-card--empty');
        return;
      }

      if (metaHoje.concluido) {
        metaStatusText.textContent = 'Parabéns! Você concluiu sua meta de hoje. 🎉';
        metaStatusDetail.textContent = `Treino: ${metaHoje.treino} • Água: ${metaHoje.agua.toFixed(2)} L • Sono: ${metaHoje.sono}`;
        setMetaCardState('dashboard-card--success');
      } else {
        metaStatusText.textContent = 'Você ainda não concluiu sua meta de hoje.';
        metaStatusDetail.textContent = `Treino: ${metaHoje.treino} • Água: ${metaHoje.agua.toFixed(2)} L • Sono: ${metaHoje.sono}`;
        setMetaCardState('dashboard-card--warning');
      }
    } catch (e) {
      metaStatusText.textContent = 'Erro ao carregar suas metas.';
      metaStatusDetail.textContent = '';
      setMetaCardState('dashboard-card--warning');
    }
  }

  async function carregarTreinoDia() {
    if (!workoutTitle || !workoutExercises) return;
    workoutTitle.textContent = 'Carregando treino...';
    workoutExercises.innerHTML = '';

    try {
      const resp = await fetch('../api/workouts.php?action=list');
      if (!resp.ok) {
        workoutTitle.textContent = 'Não foi possível carregar seus treinos.';
        return;
      }

      const data = await resp.json();
      if (!data.ok || !Array.isArray(data.treinos) || data.treinos.length === 0) {
        workoutTitle.textContent = 'Você ainda não cadastrou treinos.';
        return;
      }

      let treino = data.treinos.find(t => t.exercicios && t.exercicios.length > 0) || data.treinos[0];

      workoutTitle.textContent = `Treino do dia: ${treino.nome}`;
      workoutExercises.innerHTML = '';

      if (treino.exercicios && treino.exercicios.length > 0) {
        treino.exercicios.forEach(e => {
          const li = document.createElement('li');
          li.className = 'dashboard-list__item';
          li.textContent = formatExercise(e);
          workoutExercises.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.className = 'dashboard-list__item';
        li.textContent = 'Nenhum exercício cadastrado para este treino.';
        workoutExercises.appendChild(li);
      }
    } catch (e) {
      workoutTitle.textContent = 'Erro ao carregar seus treinos.';
      workoutExercises.innerHTML = '';
    }
  }

  carregarUsuario();
  carregarMetaDia();
  carregarTreinoDia();
});
