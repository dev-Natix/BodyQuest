const addTaskBtn = document.getElementById("addTaskBtn");
const taskDialog = document.getElementById("taskDialog");
const cancelBtn = document.getElementById("cancelBtn");
const taskForm = document.getElementById("taskForm");
const tasksTable = document.getElementById("tasksTable").querySelector("tbody");

// Array para armazenar as tarefas em memória
let tasks = [];

function getTodayDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

// ------------------ Metas cumpridas ------------------
function metasCumpridas(treino, agua, sono) {
  const treinoOk = treino !== "nenhum";
  const aguaOk = parseFloat(agua) > 3;
  const sonoOk = sono === "mais de 8h" || sono === "6h à 8h";
  return treinoOk && aguaOk && sonoOk;
}

// ------------------ Atualizar tabela ------------------
function updateTable() {
  tasksTable.innerHTML = "";

  tasks.forEach(task => {
    const row = document.createElement("tr");
    const tdDia = document.createElement("td");
    const tdMeta = document.createElement("td");
    const tdAlterar = document.createElement("td");
    const tdVerMetas = document.createElement("td");

    tdDia.textContent = task.dia;
    tdMeta.textContent = task.concluido ? "Sim" : "Não";

    // 🔹 Botão "Ver metas"
    const viewLink = document.createElement("a");
    viewLink.href = "#";
    viewLink.textContent = "Ver";
    viewLink.style.marginRight = "15px";
    viewLink.addEventListener("click", () => {
      alert(
        `📅 Metas de ${task.dia}\n\n` +
        `Treino: ${task.treino}\n` +
        `Água: ${task.agua}L\n` +
        `Sono: ${task.sono}\n` +
        `Cumprida: ${task.concluido ? "Sim" : "Não"}`
      );
    });

    //  ---------------Botão "Alterar metas"---------------
    const editLink = document.createElement("a");
    editLink.href = "#";
    editLink.textContent = "Alterar Metas";
    editLink.addEventListener("click", () => {
      const today = getTodayDate();
      if (today !== task.dia) {
        alert("Você só pode alterar metas no mesmo dia em que foram criadas.");
        return;
      }

      document.getElementById("treino").value = task.treino;
      document.getElementById("agua").value = task.agua;
      document.getElementById("sono").value = task.sono;

      const submitBtn = document.getElementById("submitBtn");
      submitBtn.textContent = "Alterar";
      submitBtn.setAttribute("data-action", "alterar");

      taskDialog.showModal();

      taskForm.onsubmit = function (e) {
        e.preventDefault();

        task.treino = document.getElementById("treino").value;
        task.agua = document.getElementById("agua").value;
        task.sono = document.getElementById("sono").value;
        task.concluido = metasCumpridas(task.treino, task.agua, task.sono);

        updateTable();
        taskDialog.close();
      };
    });

    tdAlterar.appendChild(editLink);
    tdVerMetas.appendChild(viewLink);

    row.appendChild(tdDia);
    row.appendChild(tdMeta);
    row.appendChild(tdAlterar);
    row.appendChild(tdVerMetas);
    tasksTable.appendChild(row);
  });
}

// ------------------ Adicionar nova meta ------------------
addTaskBtn.addEventListener("click", () => {
  const today = getTodayDate();

  if (tasks.find(t => t.dia === today)) {
    alert("As metas de hoje já foram adicionadas. Você pode alterá-las se quiser.");
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.textContent = "Salvar";
  submitBtn.setAttribute("data-action", "salvar");
  taskDialog.showModal();
});

cancelBtn.addEventListener("click", () => {
  taskDialog.close();
});

// ------------------ Salvar formulário ------------------
taskForm.addEventListener("submit", e => {
  e.preventDefault();
  const treino = document.getElementById("treino").value;
  const agua = document.getElementById("agua").value;
  const sono = document.getElementById("sono").value;

  const today = getTodayDate();

  if (tasks.find(t => t.dia === today)) {
    taskDialog.close();
    return;
  }

  const concluido = metasCumpridas(treino, agua, sono);

  tasks.push({ dia: today, treino, agua, sono, concluido });
  updateTable();
  taskDialog.close();
});

// Inicializa a tabela vazia
updateTable();
