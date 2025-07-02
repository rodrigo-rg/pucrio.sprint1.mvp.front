/*
  --------------------------------------------------------------------------------------
  Obtém a lista de exercícios e suas anotações.
  --------------------------------------------------------------------------------------
*/
const getAnotacoes = async () => {
  let url = 'http://127.0.0.1:5000/anotacoes';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.exercicios.forEach(e =>
        e.anotacoes.forEach(a =>
          insertList(
            a.anotacao_id,
            e.exercicio_nome,
            a.data_execucao,
            a.serie,
            a.repeticoes,
            a.carga,
            a.comentario)
        )
      )
    })
    .catch((error) => {
      console.error('Error:', error);
      alert("Falha ao carregar anotações. Tente novamente.");
    });
}


/*
  --------------------------------------------------------------------------------------
  Carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/
getAnotacoes()


/*
  --------------------------------------------------------------------------------------
  Obtém os dados de uma anotação específica.
  --------------------------------------------------------------------------------------
*/
const getAnotacao = async (id) => {
  let url = 'http://127.0.0.1:5000/anotacao?id=' + id;
  fetch(url, {
    method: 'get',
  })
  .then((response) => response.json())
  .then((data) => {
    const a = data;
    document.getElementById("newExercicioNome").value = a.exercicio_nome;
    // Converte a data de aaaa-mm-dd para dd/mm/aaaa antes de exibir no input
    const [dia, mes, ano] = a.data_execucao.split('/');
    document.getElementById("newDataExecucao").value = `${ano}-${mes}-${dia}`;
    document.getElementById("newSerie").value = a.serie;
    document.getElementById("newRepeticoes").value = a.repeticoes;
    document.getElementById("newCarga").value = a.carga;
    document.getElementById("newComentario").value = a.comentario;
  })
  .catch((error) => {
    console.error('Error:', error);
    alert("Falha ao carregar anotação. Tente novamente.");
  });
}


/*
  --------------------------------------------------------------------------------------
  Função para colocar uma anotação na lista
  --------------------------------------------------------------------------------------
*/
const postAnotacao = async (inputExercicioNome, inputDataExecucao, inputSerie, inputRepeticoes, inputCarga, inputComentario) => {
  const formData = new FormData();
  formData.append('exercicio_nome', inputExercicioNome);
  formData.append('data_execucao', inputDataExecucao);
  formData.append('serie', inputSerie);
  formData.append('repeticoes', inputRepeticoes);
  formData.append('carga', inputCarga);
  formData.append('comentario', inputComentario);

  let url = 'http://127.0.0.1:5000/anotacao';
    const response = await fetch(url, {
      method: 'post',
      body: formData
    })
    if (!response.ok) {
        throw new Error('Erro ao adicionar anotação. Verifique os dados e tente novamente.');
    }
    const data = await response.json();
    return data.anotacao_id;

}


/*
  --------------------------------------------------------------------------------------
  Função para adicionar uma nova anotação
  --------------------------------------------------------------------------------------
*/
const novaAnotacao = () => {
  let inputExercicioNome = document.getElementById("newExercicioNome").value;
    // Converte de aaaa-mm-dd para dd/mm/aaaa, que é o formato aceito pela API.
  let [ano, mes, dia] = document.getElementById("newDataExecucao").value.split("-");
  let inputDataExecucao = `${dia}/${mes}/${ano}`;
  let inputSerie = document.getElementById("newSerie").value;
  let inputRepeticoes = document.getElementById("newRepeticoes").value;
  let inputCarga = document.getElementById("newCarga").value;
  let inputComentario = document.getElementById("newComentario").value;
  
  if (inputExercicioNome === '' || inputDataExecucao === '' || inputSerie === '' ||
      inputRepeticoes === '' || inputCarga === '') {
    alert("Preencha todos os campos!");
  } else if (isNaN(inputSerie) || isNaN(inputRepeticoes) || isNaN(inputCarga)) {
    alert("Campos numéricos precisam ser números!");
  } else {
    postAnotacao(inputExercicioNome, inputDataExecucao, inputSerie, inputRepeticoes, inputCarga, inputComentario)
    .then(anotacaoId => {
      insertList(anotacaoId, inputExercicioNome, inputDataExecucao, inputSerie, inputRepeticoes, inputCarga, inputComentario);
      alert("Item adicionado!");
    })
    .catch(error => {
      alert('Erro ao adicionar anotação. Verifique os dados e tente novamente.');
    });
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertList = (anotacao_id,exercicio_nome,data_execucao,serie,repeticoes,carga,comentario) => {
  var item = [exercicio_nome,data_execucao,serie,repeticoes,carga,comentario];
  var table = document.getElementById('myTable');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }
  // Adiciona na última coluna o botão de carregar a anotação.
  insertButton(row.insertCell(-1), "load");
  // Adiciona na última coluna o botão de excluir a anotação.
  insertButton(row.insertCell(-1), "del")

  row.setAttribute('anotacao_id', anotacao_id);
}


/*
  --------------------------------------------------------------------------------------
  Função para criar o botão load e del em um item da lista.
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent, operacao) => {
  let span = document.createElement("span");
  let txt;
  if (operacao === "load") {
    txt = document.createTextNode("\u25cb");
    span.className = "loadBtn";
    span.onclick = handleLoadClick;
  } else if (operacao === "del") {
    txt = document.createTextNode("\u00d7");
    span.className = "delBtn";
    span.onclick = handleDelClick;
  }
  span.appendChild(txt);
  parent.appendChild(span);
}

function handleLoadClick(event) {
  let div = event.target.parentElement.parentElement;
  const anotacao_id = div.getAttribute('anotacao_id');
  getAnotacao(anotacao_id);
}

function handleDelClick(event) {
  let div = event.target.parentElement.parentElement;
  const anotacao_id = div.getAttribute('anotacao_id');
  if (confirm("Você tem certeza?")) {
    div.remove()
    deleteItem(anotacao_id)
    alert("Removido!")
  }
}


/*
  --------------------------------------------------------------------------------------
  Função para deletar uma anotação do banco.
  --------------------------------------------------------------------------------------
*/
const deleteItem = (anotacao_id) => {
  const formData = new FormData();
  formData.append('id', anotacao_id);
  let url = 'http://127.0.0.1:5000/anotacao?id=' + anotacao_id;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}