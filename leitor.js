const obter = id => document.getElementById(id);
const total = 12;
const livro = obter('livro');
const leitor = obter('leitor');
const celular = matchMedia('(max-width: 700px)');
const movimentoReduzido = matchMedia('(prefers-reduced-motion: reduce)');
let indice = 0;
let zoom = false;
let virando = false;
let inicio = null;

function pagina(numero) {
  const imagem = new Image();
  imagem.className = 'pagina';
  imagem.src = 'paginas/p-' + String(numero).padStart(3, '0') + '.jpg';
  imagem.alt = numero === 0 ? 'Capa da edição nº 1' : 'Página ' + (numero + 1) + ' da revista';
  imagem.draggable = false;
  return imagem;
}

function quantidade() {
  return celular.matches || zoom || indice === 0 ? 1 : Math.min(2, total - indice);
}

function renderizar() {
  const n = quantidade();
  livro.classList.toggle('unica', n === 1);
  livro.classList.toggle('zoom', zoom);
  livro.replaceChildren(...Array.from({length:n}, (_, i) => pagina(indice + i)));
  obter('numero').textContent = n === 1 ? `Página ${indice + 1} de ${total}` : `Páginas ${indice + 1}–${indice + n} de ${total}`;
  obter('anterior').disabled = indice === 0;
  obter('proxima').disabled = indice + n >= total;
  if (indice + n < total) pagina(indice + n);
}

function virar(sentido) {
  if (virando || leitor.hidden) return;
  const anterior = indice;
  const n = quantidade();
  const dupla = !celular.matches && !zoom;
  const destino = sentido > 0 ? indice + n : Math.max(0, indice - (dupla ? 2 : 1));
  if (destino >= total || destino === anterior) return;
  const velha = pagina(sentido > 0 ? anterior + n - 1 : anterior);
  const largura = livro.firstElementChild.getBoundingClientRect().width;
  indice = destino;
  renderizar();
  obter('janela').scrollTo(0, 0);
  if (movimentoReduzido.matches) return;
  virando = true;
  velha.style.width = largura + 'px';
  velha.alt = '';
  velha.classList.add('folha', sentido > 0 ? 'direita' : 'esquerda');
  livro.append(velha);
  requestAnimationFrame(() => requestAnimationFrame(() => velha.classList.add('virou')));
  setTimeout(() => { velha.remove(); virando = false; }, 580);
}

obter('abrir').onclick = () => {
  obter('entrada').hidden = true;
  leitor.hidden = false;
  renderizar();
  obter('fechar').focus();
};
obter('fechar').onclick = () => {
  leitor.hidden = true;
  obter('entrada').hidden = false;
  obter('abrir').focus();
};
obter('ampliar').onclick = event => {
  zoom = !zoom;
  event.currentTarget.setAttribute('aria-pressed', zoom);
  event.currentTarget.textContent = zoom ? 'Reduzir −' : 'Ampliar ＋';
  if (!zoom && !celular.matches && indice > 0 && indice % 2 === 0) indice--;
  renderizar();
};
obter('anterior').onclick = () => virar(-1);
obter('proxima').onclick = () => virar(1);
celular.addEventListener('change', () => {
  if (!celular.matches && !zoom && indice > 0 && indice % 2 === 0) indice--;
  if (!leitor.hidden) renderizar();
});
document.addEventListener('keydown', event => {
  if (leitor.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    virar(event.key === 'ArrowRight' ? 1 : -1);
  }
});
livro.addEventListener('touchstart', event => {
  inicio = !zoom && event.touches.length === 1 ? [event.touches[0].clientX, event.touches[0].clientY] : null;
}, {passive:true});
livro.addEventListener('touchend', event => {
  if (!inicio || event.touches.length) return;
  const dx = event.changedTouches[0].clientX - inicio[0];
  const dy = event.changedTouches[0].clientY - inicio[1];
  inicio = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) virar(dx < 0 ? 1 : -1);
}, {passive:true});
livro.addEventListener('touchcancel', () => { inicio = null; }, {passive:true});
