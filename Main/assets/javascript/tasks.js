const addTaskBtn  = document.getElementById("addTaskBtn");
const taskDialog  = document.getElementById("taskDialog");
const cancelBtn   = document.getElementById("cancelBtn");
const taskForm    = document.getElementById("taskForm");
const tasksTable  = document.getElementById("tasksTable").querySelector("tbody");

const viewDialog    = document.getElementById("viewDialog");
const closeViewBtn  = document.getElementById("closeViewBtn");
const viewDia       = document.getElementById("viewDia");
const viewTreino    = document.getElementById("viewTreino");
const viewAgua      = document.getElementById("viewAgua");
const viewSono      = document.getElementById("viewSono");
const viewConcluido = document.getElementById("viewConcluido");

let tasks = [];
let editingTaskId = null; 

function getTodayDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

function metasCumpridas(treino, agua, sono) {
  const treinoOk = treino !== "Nenhum";
  const aguaOk   = parseFloat(String(agua).replace(",", ".")) > 3;
  const sonoOk   = sono === "mais de 8h" || sono === "6h à 8h";
  return treinoOk && aguaOk && sonoOk;
}

async function carregarMetas() {
  try {
    const resp = await fetch("../api/metas.php"); 
    if (!resp.ok) throw new Error("Erro ao carregar metas");
    const data = await resp.json();

    tasks = data.map(item => ({
      id: item.id,
      dia: item.dia,             
      treino: item.treino,
      agua: item.agua,           
      sono: item.sono,
      concluido: !!item.concluido,
    }));

    updateTable();
  } catch (err) {
    console.error(err);
  }
}

async function salvarOuAtualizarMeta({ id = 0, treino, agua, sono }) {
  const resp = await fetch("../api/metas.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, treino, agua, sono }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.sucesso === false) {
    throw new Error(data.mensagem || "Erro ao salvar metas");
  }
}

function updateTable() {
  tasksTable.innerHTML = "";

  tasks.forEach(task => {
    const row        = document.createElement("tr");
    const tdDia      = document.createElement("td");
    const tdMeta     = document.createElement("td");
    const tdAlterar  = document.createElement("td");
    const tdVerMetas = document.createElement("td");

    tdDia.dataset.label      = "Dia";
    tdMeta.dataset.label     = "Metas concluídas";
    tdAlterar.dataset.label  = "Alterar";
    tdVerMetas.dataset.label = "Ver metas";

    tdDia.textContent  = task.dia;
    tdMeta.textContent = task.concluido ? "Sim" : "Não";

    const viewLink = document.createElement("a");
    viewLink.href = "#";
    viewLink.textContent = "Ver";
    viewLink.style.marginRight = "15px";
    viewLink.addEventListener("click", (e) => {
      e.preventDefault();

      viewDia.textContent       = task.dia;
      viewTreino.textContent    = task.treino;
      viewAgua.textContent      = `${task.agua}L`; 
      viewSono.textContent      = task.sono;
      viewConcluido.textContent = task.concluido ? "Sim" : "Não";

      viewDialog.showModal();
    });

    const editLink = document.createElement("a");
    editLink.href = "#";
    editLink.textContent = "Alterar Metas";
    editLink.addEventListener("click", (e) => {
      e.preventDefault();
      const today = getTodayDate();
      if (today !== task.dia) {
        alert("Você só pode alterar metas no mesmo dia em que foram criadas.");
        return;
      }

      document.getElementById("treino").value = task.treino;
      document.getElementById("agua").value   = task.agua;
      document.getElementById("sono").value   = task.sono;

      const submitBtn = document.getElementById("submitBtn");
      submitBtn.textContent = "Alterar";
      submitBtn.setAttribute("data-action", "alterar");

      editingTaskId = task.id;
      taskDialog.showModal();
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

addTaskBtn.addEventListener("click", () => {
  const today = getTodayDate();

  if (tasks.find(t => t.dia === today)) {
    alert("As metas de hoje já foram adicionadas. Você pode alterá-las se quiser.");
    return;
  }

  document.getElementById("treino").value = "Nenhum";
  document.getElementById("agua").value   = "";
  document.getElementById("sono").value   = "mais de 8h";

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.textContent = "Salvar";
  submitBtn.setAttribute("data-action", "salvar");
  editingTaskId = null;

  taskDialog.showModal();
});

cancelBtn.addEventListener("click", () => {
  taskDialog.close();
});

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const treino = document.getElementById("treino").value;
  const agua   = document.getElementById("agua").value;
  const sono   = document.getElementById("sono").value;

  const submitBtn = document.getElementById("submitBtn");
  const action    = submitBtn.getAttribute("data-action");

  const today = getTodayDate();

  try {
    if (action === "salvar") {
      if (tasks.find(t => t.dia === today)) {
        alert("As metas de hoje já foram adicionadas. Você pode alterá-las se quiser.");
        taskDialog.close();
        return;
      }

      await salvarOuAtualizarMeta({ id: 0, treino, agua, sono });
    } else if (action === "alterar" && editingTaskId) {
      await salvarOuAtualizarMeta({ id: editingTaskId, treino, agua, sono });
    }

    await carregarMetas();
    taskDialog.close();
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao salvar metas");
  }
});

closeViewBtn.addEventListener("click", () => {
  viewDialog.close();
});

carregarMetas();
