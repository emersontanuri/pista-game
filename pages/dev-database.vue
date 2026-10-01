<script setup lang="ts">
interface DatabaseWord {
  id: number;
  word: string;
  category: string;
  subcategory: string;
  difficulty: number;
  usage_count: number;
}
interface DatabaseClue {
  id: number;
  word_id: number;
  clue: string;
}
interface DatabaseResponse {
  words: DatabaseWord[];
  clues: DatabaseClue[];
}
const config = useRuntimeConfig();
if (config.public.appEnv !== "development") await navigateTo("/");
const {
  data,
  pending,
  error,
  refresh: refreshData,
} = await useFetch<DatabaseResponse>("/api/dev/database");
const refresh = () => {
  void refreshData();
};
const pageSize = 10;
const currentPage = ref(1);
const expanded = ref<number | null>(null);
const deleting = ref<number | null>(null);
const actionError = ref('');
const words = computed(() => data.value?.words || []);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(words.value.length / pageSize)),
);
const paginatedWords = computed(() =>
  words.value.slice(
    (currentPage.value - 1) * pageSize,
    currentPage.value * pageSize,
  ),
);
const pageNumbers = computed(() =>
  Array.from({ length: totalPages.value }, (_, index) => index + 1),
);
const firstItem = computed(() =>
  words.value.length ? (currentPage.value - 1) * pageSize + 1 : 0,
);
const lastItem = computed(() =>
  Math.min(currentPage.value * pageSize, words.value.length),
);
const cluesByWord = computed(() => {
  const map = new Map<number, string[]>();
  for (const clue of data.value?.clues || [])
    map.set(clue.word_id, [...(map.get(clue.word_id) || []), clue.clue]);
  return map;
});
const toggle = (id: number) => {
  expanded.value = expanded.value === id ? null : id;
};
const deleteWord = async (word: DatabaseWord) => {
  if (!window.confirm(`Excluir a palavra "${word.word}" e todas as suas dicas? Essa ação não pode ser desfeita.`)) return;
  deleting.value = word.id;
  actionError.value = '';
  try {
    await $fetch('/api/dev/database', { method: 'POST', body: { action: 'delete', id: word.id } });
    if (expanded.value === word.id) expanded.value = null;
    await refreshData();
  } catch (error) {
    actionError.value = error instanceof Error ? error.message : 'Não foi possível excluir a palavra.';
  } finally {
    deleting.value = null;
  }
};
const goToPage = (page: number) => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
  expanded.value = null;
};
watch(
  () => words.value.length,
  () => {
    if (currentPage.value > totalPages.value)
      currentPage.value = totalPages.value;
  },
);
</script>
<template>
  <main class="database-page">
    <header class="database-heading">
      <div>
        <span class="eyebrow">AMBIENTE DEVELOPMENT</span>
        <h1>Catálogo SQLite</h1>
        <p>Registros persistidos nas tabelas <code>words</code> e <code>clues</code>.</p>
      </div>
      <div class="database-actions">
        <button class="secondary-button" @click="refresh">↻ Atualizar</button
        ><NuxtLink class="secondary-button" to="/dev-config">Configuração</NuxtLink
        ><NuxtLink class="secondary-button" to="/">Voltar ao jogo</NuxtLink>
      </div>
    </header>
    <div v-if="pending" class="state-card">Carregando banco...</div>
    <div v-else-if="error" class="state-card error-state">
      Não foi possível ler o banco.
    </div>
    <template v-else
      ><div class="database-summary">
        <div>
          <span class="summary-icon">◈</span><strong>{{ words.length }}</strong
          ><span>palavras</span>
        </div>
        <div>
          <span class="summary-icon">☷</span
          ><strong>{{ data?.clues.length || 0 }}</strong
          ><span>dicas</span>
        </div>
        <div>
          <span class="summary-icon">◌</span
          ><strong>{{
            new Set(words.map((word) => word.category)).size
          }}</strong
          ><span>categorias</span>
        </div>
      </div>
      <p v-if="actionError" class="action-error" role="alert">{{ actionError }}</p>
      <section class="table-shell">
        <div class="table-toolbar">
          <div>
            <strong>Palavras cadastradas</strong
            ><span
              >Mostrando {{ firstItem }}–{{ lastItem }} de
              {{ words.length }}</span
            >
          </div>
          <span class="page-size">{{ pageSize }} por página</span>
        </div>
        <table class="database-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Palavra</th>
              <th>Categoria</th>
              <th>Subcategoria</th>
              <th>Nota</th>
              <th>Usos</th>
              <th>Dicas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="word in paginatedWords" :key="word.id"
              ><tr :class="{ selected: expanded === word.id }">
                <td class="muted">#{{ word.id }}</td>
                <td class="word-cell">{{ word.word }}</td>
                <td>
                  <span class="category-label">{{ word.category }}</span>
                </td>
                <td>
                  <span class="subcategory-label">{{ word.subcategory }}</span>
                </td>
                <td>
                  <span class="difficulty">{{ word.difficulty }}/10</span>
                </td>
                <td>
                  <span class="usage">{{ word.usage_count }}</span>
                </td>
                <td class="muted">
                  {{ cluesByWord.get(word.id)?.length || 0 }}
                </td>
                <td class="row-actions">
                  <button class="details-button" @click="toggle(word.id)">
                    {{ expanded === word.id ? "Ocultar" : "Ver dicas" }}
                  </button><button class="delete-button" :disabled="deleting === word.id" @click="deleteWord(word)">{{ deleting === word.id ? "Excluindo…" : "Excluir" }}</button>
                </td>
              </tr>
              <tr v-if="expanded === word.id" class="clues-row">
                <td colspan="8">
                  <div class="clues-panel">
                    <div class="clues-panel-heading">
                      <strong>Dicas associadas</strong
                      ><small
                        >{{ word.category }} / {{ word.subcategory }} ·
                        clues.word_id → {{ word.id }}</small
                      >
                    </div>
                    <ol>
                      <li
                        v-for="(clue, index) in cluesByWord.get(word.id)"
                        :key="clue"
                      >
                        <span>{{ String(index + 1).padStart(2, "0") }}</span
                        >{{ clue }}
                      </li>
                    </ol>
                  </div>
                </td>
              </tr></template
            >
            <tr v-if="!paginatedWords.length">
              <td class="empty-cell" colspan="8">
                Nenhuma palavra cadastrada.
              </td>
            </tr>
          </tbody>
        </table>
        <nav v-if="totalPages > 1" class="pagination" aria-label="Paginação">
          <button
            :disabled="currentPage === 1"
            aria-label="Página anterior"
            @click="goToPage(currentPage - 1)"
          >
            ‹</button
          ><button
            v-for="page in pageNumbers"
            :key="page"
            :class="{ active: currentPage === page }"
            @click="goToPage(page)"
          >
            {{ page }}</button
          ><button
            :disabled="currentPage === totalPages"
            aria-label="Próxima página"
            @click="goToPage(currentPage + 1)"
          >
            ›
          </button>
        </nav>
      </section></template
    >
  </main>
</template>
<style scoped>
.difficulty-guide {
  display: grid;
  gap: 8px;
  margin: 24px 0;
  padding: 18px 20px;
  background: #f8faff;
  border: 1px solid #e3e8f2;
  border-radius: 16px;
  color: #697693;
  font-size: 12px;
}
.difficulty-guide strong {
  color: #25385f;
  font: 700 15px "Space Grotesk";
}
.difficulty-guide span {
  line-height: 1.4;
}
.difficulty-guide b {
  display: inline-block;
  width: 38px;
  color: #a16b16;
}
.subcategory-label {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 999px;
  background: #f0edff;
  color: #6840ae;
  font-size: 11px;
  font-weight: 700;
}
.database-page {
  min-height: 100vh;
  max-width: 1240px;
  margin: 0 auto;
  padding: 52px 28px 72px;
  color: #16213d;
}
.database-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 28px;
  border-bottom: 1px solid #e1e7f2;
}
.database-heading h1 {
  margin: 8px 0 6px;
  font: 700 34px "Space Grotesk";
}
.database-heading p {
  margin: 0;
  color: #77839a;
}
.database-actions {
  display: flex;
  gap: 10px;
}
.database-actions a {
  text-decoration: none;
}
.database-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin: 24px 0;
}
.database-summary div {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 19px 20px;
  background: linear-gradient(135deg, #fff, #f8faff);
  border: 1px solid #e3e8f2;
  border-radius: 16px;
  box-shadow: 0 10px 28px #344a7b0b;
}
.summary-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #edf1ff;
  color: #4056ae;
  font-weight: 700;
}
.database-summary strong {
  margin-left: 3px;
  font: 700 27px "Space Grotesk";
  color: #2d48b3;
}
.database-summary div > span:last-child {
  color: #77839a;
  font-size: 13px;
}
.table-shell {
  overflow: hidden;
  background: #fff;
  border: 1px solid #dfe6f2;
  border-radius: 18px;
  box-shadow: 0 12px 30px #344a7b0b;
}
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
}
.table-toolbar div {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.table-toolbar strong {
  font: 700 17px "Space Grotesk";
}
.table-toolbar span {
  color: #8793a9;
  font-size: 12px;
}
.page-size {
  padding: 6px 10px;
  border-radius: 8px;
  background: #f4f6fb;
}
.database-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.database-table th {
  padding: 12px 16px;
  background: #f6f8fc;
  border-top: 1px solid #edf0f6;
  border-bottom: 1px solid #e5eaf3;
  color: #697693;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.database-table td {
  padding: 14px 16px;
  border-top: 1px solid #edf0f6;
  font-size: 13px;
}
.database-table tbody tr:not(.clues-row):hover,
.database-table tr.selected {
  background: #fafbff;
}
.word-cell {
  font: 700 15px "Space Grotesk";
}
.muted {
  color: #8b98b1;
}
.category-label,
.difficulty,
.usage {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.category-label {
  background: #edf1ff;
  color: #4056ae;
}
.difficulty {
  background: #fff5df;
  color: #a16b16;
}
.usage {
  min-width: 26px;
  justify-content: center;
  background: #eaf8f1;
  color: #278357;
}
.details-button {
  border: 0;
  background: transparent;
  color: #314aaf;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.details-button:hover {
  text-decoration: underline;
}
.row-actions {
  white-space: nowrap;
}
.delete-button {
  margin-left: 10px;
  padding: 7px 10px;
  border: 1px solid #f0caca;
  border-radius: 8px;
  background: #fff7f7;
  color: #b34a4a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.delete-button:hover:not(:disabled),
.delete-button:focus-visible {
  background: #fbe5e5;
  border-color: #d99595;
}
.delete-button:disabled {
  cursor: wait;
  opacity: 0.55;
}
.action-error {
  margin: 20px 0 0;
  padding: 12px 16px;
  border: 1px solid #f0caca;
  border-radius: 12px;
  background: #fff7f7;
  color: #a33f3f;
  font-size: 13px;
}
.clues-row td {
  padding: 0;
  border-top: 0;
  background: #fafbff;
}
.clues-panel {
  margin: 0 16px 16px;
  padding: 16px;
  background: #f4f6fb;
  border: 1px solid #e3e8f2;
  border-radius: 12px;
}
.clues-panel-heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #25385f;
  font-size: 13px;
}
.clues-panel-heading small {
  color: #9aa5b9;
  font-size: 10px;
  font-weight: 500;
}
.clues-panel ol {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px 24px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.clues-panel li {
  display: flex;
  gap: 8px;
  color: #52617d;
  font-size: 12px;
  line-height: 1.35;
}
.clues-panel li span {
  flex: none;
  color: #9aa5b9;
  font: 600 10px "Space Grotesk";
}
.empty-cell {
  padding: 36px !important;
  text-align: center;
  color: #8793a9;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 18px;
  border-top: 1px solid #edf0f6;
}
.pagination button {
  min-width: 34px;
  height: 34px;
  padding: 0 9px;
  border: 1px solid #dfe5f0;
  border-radius: 9px;
  background: #fff;
  color: #53627f;
  font-weight: 700;
  cursor: pointer;
}
.pagination button:hover:not(:disabled),
.pagination button.active {
  border-color: #2d48b3;
  background: #2d48b3;
  color: #fff;
}
.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
@media (max-width: 760px) {
  .database-page {
    padding: 28px 12px 48px;
  }
  .database-heading {
    display: block;
  }
  .database-actions {
    margin-top: 20px;
  }
  .database-summary {
    gap: 8px;
  }
  .database-summary div {
    display: block;
    padding: 14px;
  }
  .summary-icon {
    margin-bottom: 7px;
  }
  .database-summary strong {
    display: block;
    font-size: 22px;
  }
  .database-summary div > span:last-child {
    font-size: 12px;
  }
  .table-shell {
    overflow-x: auto;
  }
  .table-toolbar {
    min-width: 720px;
  }
  .database-table {
    min-width: 720px;
  }
  .clues-panel ol {
    grid-template-columns: 1fr;
  }
  .pagination {
    min-width: 720px;
  }
}
</style>
<style scoped>
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  background: #fff;
}
.table-toolbar > div {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  min-width: 0;
}
.table-toolbar > div strong {
  white-space: nowrap;
}
.table-toolbar > div span {
  white-space: nowrap;
}
.page-size {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  margin-left: auto;
}
@media (max-width: 760px) {
  .table-toolbar {
    min-width: 720px;
  }
  .toolbar-copy {
    gap: 12px !important;
  }
}
</style>
