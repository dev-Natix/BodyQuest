document.addEventListener('DOMContentLoaded', () => {
  const API_URL = '../api/workouts.php';

  const workoutModal = {
    openBtn: document.getElementById('add-workout-btn'),
    closeBtn: document.getElementById('close-workout-btn'),
    modal: document.getElementById('add-workout'),
    form: document.getElementById('form-workout')
  };

  const exerciceModal = {
    openBtn: document.getElementById('open-btn'),
    closeBtn: document.getElementById('close-btn'),
    modal: document.getElementById('modal-add-exercice'),
    form: document.getElementById('form-exercice')
  };

  const workoutsGrid = document.getElementById('workouts-grid');
  const emptyWorkouts = document.getElementById('empty-workouts');
  const addExerciceBtn = document.getElementById('open-btn');

  let currentWorkoutId = null;

  function abrirModal(modalObj) {
    if (!modalObj.modal) return;
    modalObj.modal.style.display = 'flex';
    modalObj.modal.setAttribute('aria-hidden', 'false');
  }

  function fecharModal(modalObj) {
    if (!modalObj.modal) return;
    modalObj.modal.style.display = 'none';
    modalObj.modal.setAttribute('aria-hidden', 'true');
    if (modalObj.form) {
      modalObj.form.reset();
    }
  }

  function setEmptyState(show) {
    if (!emptyWorkouts || !workoutsGrid) return;
    emptyWorkouts.style.display = show ? 'block' : 'none';
    workoutsGrid.style.display = show ? 'none' : 'grid';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function clearSelectedCards() {
    if (!workoutsGrid) return;
    workoutsGrid.querySelectorAll('.workout-card--selected').forEach(card => {
      card.classList.remove('workout-card--selected');
    });
  }

  function selectWorkoutCard(card) {
    clearSelectedCards();
    card.classList.add('workout-card--selected');
    currentWorkoutId = parseInt(card.dataset.id, 10);
  }

  function formatExercise(e) {
    const parts = [];
    parts.push(escapeHtml(e.nome_exercicio));

    let tipo = e.tipo_exercicio;
    if (tipo === 'cardiovascular') tipo = 'cardio';
    if (tipo === 'musculacao') tipo = 'musculação';
    if (tipo) parts.push(tipo);

    if (e.duracao_minutos) parts.push(`${e.duracao_minutos} min`);
    if (e.series) parts.push(`${e.series} séries`);
    if (e.repeticoes) parts.push(`${e.repeticoes} reps`);

    return parts.join(' - ');
  }

  async function deleteWorkout(treinoId) {
    if (!confirm('Deseja realmente excluir este treino?')) return;

    const formData = new FormData();
    formData.append('action', 'delete_workout');
    formData.append('treino_id', String(treinoId));

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      if (!resp.ok) {
        alert('Erro ao excluir treino.');
        console.error('Erro HTTP ao excluir treino:', resp.status);
        return;
      }

      const data = await resp.json();

      if (!data.ok) {
        alert(data.error || 'Erro ao excluir treino.');
        console.error('Erro na API (delete_workout):', data.error);
        return;
      }

      await loadWorkouts();
    } catch (err) {
      console.error('Erro de rede ao excluir treino:', err);
      alert('Erro de rede ao excluir treino.');
    }
  }


  function renderWorkouts(treinos) {
    if (!workoutsGrid) return;

    workoutsGrid.innerHTML = '';

    if (!treinos || treinos.length === 0) {
      setEmptyState(true);
      currentWorkoutId = null;
      return;
    }

    setEmptyState(false);

    treinos.forEach(t => {
      const card = document.createElement('article');
      card.className = 'workout-card';
      card.dataset.id = t.id;

      const totalExercicios = t.exercicios ? t.exercicios.length : 0;

      let exerciciosInfo = '<p class="workout-card__info">Nenhum exercício cadastrado</p>';

      if (totalExercicios > 0) {
        const linhas = t.exercicios
          .map(e => `<li>${formatExercise(e)}</li>`)
          .join('');

        exerciciosInfo = `
          <p class="workout-card__info">${totalExercicios} exercício(s):</p>
          <ul class="workout-card__exercises">
            ${linhas}
          </ul>
        `;
      }

      card.innerHTML = `
        <header class="workout-card__header">
          <div>
            <h3 class="workout-card__title">${escapeHtml(t.nome)}</h3>
            <span class="workout-card__meta">
              Criado em ${formatDate(t.created_at)}
            </span>
          </div>
          <button type="button" class="workout-card__delete" aria-label="Excluir treino">
            🗑
          </button>
        </header>
        ${exerciciosInfo}
      `;

      const deleteBtn = card.querySelector('.workout-card__delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteWorkout(t.id);
        });
      }

      card.addEventListener('click', () => {
        selectWorkoutCard(card);
      });

      workoutsGrid.appendChild(card);
    });

    currentWorkoutId = null;
  }



  async function loadWorkouts() {
    try {
      const resp = await fetch(`${API_URL}?action=list`, { method: 'GET' });

      if (!resp.ok) {
        console.error('Erro HTTP ao listar treinos:', resp.status);
        return;
      }

      const data = await resp.json();

      if (!data.ok) {
        console.error('Erro na API (list):', data.error);
        return;
      }

      renderWorkouts(data.treinos || []);
    } catch (err) {
      console.error('Erro de rede ao carregar treinos:', err);
    }
  }

  async function submitWorkoutForm(event) {
    event.preventDefault();

    if (!workoutModal.form) return;

    const formData = new FormData(workoutModal.form);
    formData.append('action', 'create_workout');

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      if (!resp.ok) {
        alert('Erro ao salvar treino.');
        console.error('Erro HTTP ao salvar treino:', resp.status);
        return;
      }

      const data = await resp.json();

      if (!data.ok) {
        alert(data.error || 'Erro ao salvar treino.');
        console.error('Erro na API (create_workout):', data.error);
        return;
      }

      await loadWorkouts();
      fecharModal(workoutModal);
    } catch (err) {
      console.error('Erro de rede ao salvar treino:', err);
      alert('Erro de rede ao salvar treino.');
    }
  }

  async function submitExerciceForm(event) {
    event.preventDefault();

    if (!exerciceModal.form) return;

    if (!currentWorkoutId) {
      alert('Selecione um treino antes de adicionar exercícios.');
      return;
    }

    const formData = new FormData(exerciceModal.form);
    formData.append('action', 'create_exercice');
    formData.append('treino_id', String(currentWorkoutId));

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      if (!resp.ok) {
        alert('Erro ao salvar exercício.');
        console.error('Erro HTTP ao salvar exercício:', resp.status);
        return;
      }

      const data = await resp.json();

      if (!data.ok) {
        alert(data.error || 'Erro ao salvar exercício.');
        console.error('Erro na API (create_exercice):', data.error);
        return;
      }

      await loadWorkouts();
      fecharModal(exerciceModal);
    } catch (err) {
      console.error('Erro de rede ao salvar exercício:', err);
      alert('Erro de rede ao salvar exercício.');
    }
  }

  if (workoutModal.openBtn && workoutModal.modal) {
    workoutModal.openBtn.addEventListener('click', () => abrirModal(workoutModal));
  }

  if (workoutModal.closeBtn && workoutModal.modal) {
    workoutModal.closeBtn.addEventListener('click', () => fecharModal(workoutModal));
  }

  if (exerciceModal.openBtn && exerciceModal.modal) {
    exerciceModal.openBtn.addEventListener('click', () => {
      if (!currentWorkoutId) {
        alert('Clique em um treino para selecioná-lo antes de adicionar exercício.');
        return;
      }
      abrirModal(exerciceModal);
    });
  }

  if (exerciceModal.closeBtn && exerciceModal.modal) {
    exerciceModal.closeBtn.addEventListener('click', () => fecharModal(exerciceModal));
  }

  [workoutModal, exerciceModal].forEach(modalObj => {
    if (!modalObj.modal) return;

    modalObj.modal.addEventListener('click', event => {
      if (event.target === modalObj.modal) {
        fecharModal(modalObj);
      }
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

    [workoutModal, exerciceModal].forEach(modalObj => {
      if (
        modalObj.modal &&
        modalObj.modal.getAttribute('aria-hidden') === 'false'
      ) {
        fecharModal(modalObj);
      }
    });
  });

  if (workoutModal.form) {
    workoutModal.form.addEventListener('submit', submitWorkoutForm);
  }

  if (exerciceModal.form) {
    exerciceModal.form.addEventListener('submit', submitExerciceForm);
  }

  loadWorkouts();
});
