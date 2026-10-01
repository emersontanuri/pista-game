<script setup lang="ts">
interface ConfigRow {
  name?: string;
  level?: number;
  description: string;
  weight: number;
}
interface ConfigResponse {
  categories: ConfigRow[];
  difficulties: ConfigRow[];
  subcategories: Array<{ id: number; category: string; name: string; description: string }>;
}
interface SubcategoryRow { id: number; category: string; name: string; description: string }
const config = useRuntimeConfig();
if (config.public.appEnv !== "development") await navigateTo("/");
const { data, refresh: refreshData } =
  await useFetch<ConfigResponse>("/api/dev/database");
const rows = computed<ConfigResponse>(() => data.value || { categories: [], difficulties: [], subcategories: [] });
const refresh = () => {
  void refreshData();
};
const save = async (type: "category" | "difficulty", row: ConfigRow) => {
  await $fetch("/api/dev/config", {
    method: "POST",
    body: {
      type,
      key: type === "category" ? row.name : row.level,
      description: row.description,
      weight: row.weight,
    },
  });
  await refreshData();
};
const saveSubcategory = async (row: SubcategoryRow) => {
  await $fetch("/api/dev/config", { method: "POST", body: { type: "subcategory", key: row.id, category: row.category, name: row.name, description: row.description } });
  await refreshData();
};
const subcategoriesByCategory = computed(() => rows.value.subcategories.reduce<Record<string, SubcategoryRow[]>>((groups, row: SubcategoryRow) => { (groups[row.category] ||= []).push(row); return groups }, {}));
const expandedCategory = ref<string | null>(null);
const toggleCategory = (category: string) => { expandedCategory.value = expandedCategory.value === category ? null : category; };
const newSubcategoryName = ref('');
const newSubcategoryDescription = ref('');
const addSubcategory = async (category: string) => { if (!newSubcategoryName.value.trim() || !newSubcategoryDescription.value.trim()) return; await $fetch('/api/dev/config', { method: 'POST', body: { type: 'subcategory', action: 'create', key: 0, category, name: newSubcategoryName.value, description: newSubcategoryDescription.value } }); newSubcategoryName.value = ''; newSubcategoryDescription.value = ''; await refreshData(); };
const removeSubcategory = async (row: SubcategoryRow) => { if (!window.confirm(`Remover a subcategoria "${row.name}"?`)) return; await $fetch('/api/dev/config', { method: 'POST', body: { type: 'subcategory', action: 'delete', key: row.id, description: '' } }); await refreshData(); };
const resizeDescription = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};
</script>
<template>
  <main class="config-page">
    <header>
      <div>
        <span class="eyebrow">AMBIENTE DEVELOPMENT</span>
        <h1>Configuração do sorteio</h1>
        <p>Valores lidos das tabelas <code>categories</code> e <code>difficulties</code> do SQLite.</p>
      </div>
      <div class="actions">
        <button class="secondary-button" @click="refresh">↻ Atualizar</button
        ><NuxtLink class="secondary-button" to="/dev-database"
          >Catálogo</NuxtLink
        ><NuxtLink class="secondary-button" to="/">Voltar ao jogo</NuxtLink>
      </div>
    </header>
      <div v-if="!data" class="state-card">Carregando configuração...</div>
      <section v-else>
      <h2>Categorias</h2>
      <table class="config-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Peso</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows.categories" :key="row.name">
            <td>
              <strong>{{ row.name }}</strong>
            </td>
            <td><textarea v-model="row.description" rows="1" class="description-input" @input="resizeDescription" /></td>
            <td><input v-model.number="row.weight" type="number" min="0" /></td>
            <td>
              <button class="save" @click="save('category', row)">
                Salvar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
      <section v-if="data">
      <h2>Dificuldades</h2>
      <table class="config-table">
        <thead>
          <tr>
            <th>Nota</th>
            <th>Descrição</th>
            <th>Peso</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows.difficulties" :key="row.level">
            <td>
              <strong>{{ row.level }}/10</strong>
            </td>
            <td><textarea v-model="row.description" rows="1" class="description-input" @input="resizeDescription" /></td>
            <td><input v-model.number="row.weight" type="number" min="0" /></td>
            <td>
              <button class="save" @click="save('difficulty', row)">
                Salvar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
    <section v-if="data">
      <h2>Subcategorias</h2>
      <div v-for="(items, category) in subcategoriesByCategory" :key="category" class="subcategory-group">
        <button class="subcategory-toggle" :aria-expanded="expandedCategory === category" @click="toggleCategory(category)">
          <span><strong>{{ category }}</strong><small>{{ items.length }} subcategorias</small></span><b>{{ expandedCategory === category ? '−' : '+' }}</b>
        </button>
        <div v-if="expandedCategory === category" class="subcategory-content"><table class="subcategory-table"><thead><tr><th>Nome</th><th>Descrição</th><th>Ações</th></tr></thead><tbody><tr v-for="row in items" :key="row.id"><td><input v-model="row.name" /></td><td><textarea v-model="row.description" rows="1" class="description-input" @input="resizeDescription" /></td><td class="subcategory-actions"><button class="save" @click="saveSubcategory(row)">Salvar</button><button class="remove" title="Remover subcategoria" @click="removeSubcategory(row)">Remover</button></td></tr></tbody></table><form class="add-subcategory" @submit.prevent="addSubcategory(category)"><input v-model="newSubcategoryName" placeholder="Nova subcategoria" /><textarea v-model="newSubcategoryDescription" rows="1" class="description-input" placeholder="Descrição" @input="resizeDescription" /><button class="save" type="submit">Adicionar</button></form></div>
      </div>
    </section>
  </main>
</template>
<style scoped>
.config-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px;
  color: #16213d;
}
.config-page header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: end;
  border-bottom: 1px solid #e1e7f2;
  padding-bottom: 24px;
}
.config-page h1 {
  margin: 8px 0 6px;
  font: 700 34px "Space Grotesk";
}
.config-page p {
  margin: 0;
  color: #77839a;
}
.actions {
  display: flex;
  gap: 8px;
}
.actions a {
  text-decoration: none;
}
.config-page section {
  margin-top: 28px;
  background: #fff;
  border: 1px solid #dfe6f2;
  border-radius: 16px;
  overflow: hidden;
}
.config-page h2 {
  margin: 0;
  padding: 18px 20px;
  font: 700 18px "Space Grotesk";
  background: #f8faff;
}
.config-page table {
  width: 100%;
  border-collapse: collapse;
}
.config-table { table-layout: fixed; }
.config-table th:first-child, .config-table td:first-child { width: 100px; }
.config-table th:nth-child(2), .config-table td:nth-child(2) { width: auto; }
.config-table th:nth-child(3), .config-table td:nth-child(3) { width: 90px; }
.config-table th:last-child, .config-table td:last-child { width: 100px; }
.config-page th,
.config-page td {
  text-align: left;
  padding: 12px 16px;
  border-top: 1px solid #edf0f6;
  font-size: 13px;
}
.config-page th {
  color: #697693;
  font-size: 10px;
  text-transform: uppercase;
}
.config-page input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #dfe5f0;
  border-radius: 8px;
  color: #25385f;
}
.config-page textarea {
  width: 100%;
  min-height: 38px;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #dfe5f0;
  border-radius: 8px;
  color: #25385f;
  font: inherit;
  line-height: 1.4;
  resize: vertical;
  overflow: hidden;
  field-sizing: content;
}
.config-table td:nth-child(3) { width: 90px; }
.config-table td:nth-child(3) input {
  width: 70px;
}
.save {
  border: 0;
  border-radius: 8px;
  padding: 8px 12px;
  background: #2d48b3;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
.subcategory-group { border-top: 1px solid #edf0f6; }
.subcategory-toggle { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 16px 20px; border: 0; background: #fff; color: #25385f; text-align: left; cursor: pointer; }
.subcategory-toggle:hover { background: #fafbff; }
.subcategory-toggle span { display: flex; align-items: center; gap: 12px; }
.subcategory-toggle small { color: #8793a9; font-size: 12px; font-weight: 500; }
.subcategory-toggle b { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 7px; background: #edf1ff; color: #4056ae; font-size: 18px; }
.subcategory-group table { border-top: 1px solid #edf0f6; }
.subcategory-table { table-layout: fixed; }
.subcategory-table th:first-child, .subcategory-table td:first-child { width: 240px; }
.subcategory-table th:nth-child(2), .subcategory-table td:nth-child(2) { width: auto; }
.subcategory-table th:last-child, .subcategory-table td:last-child { width: 190px; }
.subcategory-table input { width: 100%; }
.subcategory-content { border-top: 1px solid #edf0f6; }
.subcategory-actions { display: flex; gap: 6px; }
.remove { padding: 8px 10px; border: 1px solid #f0caca; border-radius: 8px; background: #fff7f7; color: #b34a4a; font-size: 11px; font-weight: 700; cursor: pointer; }
.add-subcategory { display: grid; grid-template-columns: 1fr 2fr auto; gap: 8px; padding: 14px 16px; background: #fafbff; border-top: 1px solid #edf0f6; }
.add-subcategory input { min-width: 0; }
@media (max-width: 760px) {
  .config-page header {
    display: block;
  }
  .actions {
    margin-top: 18px;
    flex-wrap: wrap;
  }
  .config-page {
    padding: 28px 12px;
  }
  .config-page section {
    overflow-x: auto;
  }
  .config-table { min-width: 0; }
  .config-table th:first-child, .config-table td:first-child { width: 64px; }
  .config-table th:nth-child(2), .config-table td:nth-child(2) { width: auto; }
  .config-table th:nth-child(3), .config-table td:nth-child(3) { width: 58px; }
  .config-table th:last-child, .config-table td:last-child { width: 76px; }
  .subcategory-table { min-width: 0 !important; }
  .subcategory-table th:first-child, .subcategory-table td:first-child { width: 110px; }
  .subcategory-table th:last-child, .subcategory-table td:last-child { width: 132px; }
  .add-subcategory { grid-template-columns: 1fr; }
}
</style>
