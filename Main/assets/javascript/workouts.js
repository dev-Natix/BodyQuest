document.addEventListener('DOMContentLoaded', function () {

  const workoutModal = {
    openBtn: document.getElementById('add-workout-btn'),
    closeBtn: document.getElementById('close-workout-btn'),
    modal: document.getElementById('add-workout'),
    form: document.getElementById('form-workout'),
  };

  const exerciceModal = {
    openBtn: document.getElementById('open-btn'),
    closeBtn: document.getElementById('close-btn'),
    modal: document.getElementById('modal-add-exercice'),
    form: document.getElementById('form-exercice'),
  };

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

  if (workoutModal.openBtn && workoutModal.modal) {
    workoutModal.openBtn.addEventListener('click', function () {
      abrirModal(workoutModal);
    });
  }

  if (workoutModal.closeBtn && workoutModal.modal) {
    workoutModal.closeBtn.addEventListener('click', function () {
      fecharModal(workoutModal);
    });
  }

  if (exerciceModal.openBtn && exerciceModal.modal) {
    exerciceModal.openBtn.addEventListener('click', function () {
      abrirModal(exerciceModal);
    });
  }

  if (exerciceModal.closeBtn && exerciceModal.modal) {
    exerciceModal.closeBtn.addEventListener('click', function () {
      fecharModal(exerciceModal);
    });
  }

  [workoutModal, exerciceModal].forEach(function (modalObj) {
    if (!modalObj.modal) return;

    modalObj.modal.addEventListener('click', function (event) {
      if (event.target === modalObj.modal) {
        fecharModal(modalObj);
      }
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;

    [workoutModal, exerciceModal].forEach(function (modalObj) {
      if (
        modalObj.modal &&
        modalObj.modal.getAttribute('aria-hidden') === 'false'
      ) {
        fecharModal(modalObj);
      }
    });
  });
});
