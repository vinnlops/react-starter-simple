# React Starter — Simple

Template inicial React + TypeScript + Vite, estruturado para escalar. Essa versão (**simple**) **não possui camada de comunicação com backend** — ideal para landing pages, portfólios, protótipos e projetos que não consomem API remota.

Para um projeto que precisa falar com uma API (Axios + React Query), use a versão **full**.

## Stack

- **React 19** + **TypeScript**
- **Vite** — build e dev server
- **React Router DOM 7** — roteamento declarativo baseado em configuração
- **Zustand** — estado global local (sem boilerplate de Context)
- **Tailwind CSS v4** — estilos utilitários
- **React Icons** — ícones

## Estrutura de pastas

```
src/
├── app/router/       # Configuração de rotas (baseada em array, não JSX solto)
├── config/           # Configurações globais (tema)
├── layouts/          # Layouts compartilhados entre páginas
├── pages/            # Uma pasta por página, com components/hooks locais
├── providers/        # Ponto central de providers globais (pronto para expandir)
├── store/            # Estado global (Zustand), por domínio
└── utils/            # Funções utilitárias (tema)
```

### Por que essa separação?

- **`pages/[Página]/components` e `hooks`**: componentes e hooks usados *só* naquela página ficam isolados ali. Se algo passar a ser reutilizado em mais de uma página, sobe para `src/components` ou `src/hooks`.
- **`providers/AppProviders.tsx`** existe vazio (só repassa `children`) de propósito — é o ponto único onde providers globais futuros (auth local, i18n, temas customizados) devem ser adicionados, sem precisar reestruturar o projeto depois.

## Sistema de rotas

Rotas são declaradas como dados (`src/app/router/routes.tsx`), não como JSX solto:

```tsx
export const routes = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "about", element: <AboutPage /> },
        ],
    },
];
```

`createRoutes` converte essa árvore para o formato que o `react-router-dom` espera. Para adicionar uma rota nova, basta editar `routes.tsx` — nenhuma outra parte do sistema precisa mudar.

## Estado global (Zustand)

Cada domínio de estado fica em `store/[domínio]/`, com `*.store.ts` (lógica) e `*.types.ts` (tipos). Exemplos incluídos:

- **`store/example`** — store simples, sem persistência, só como referência de padrão.
- **`store/preferences`** — guarda o tema atual, **persistido** no `localStorage` via middleware `persist` do Zustand.

Import centralizado:

```ts
import { useExampleStore, usePreferencesStore } from "@/store";
```

## Sistema de temas

Tema dinâmico, orientado a configuração — **criar um tema novo não exige tocar em CSS nem em lógica**, só em `src/config/themes.ts`.

### Como funciona

1. **Schema de tokens** (`tokenSchema` em `themes.ts`) define quais variáveis de cor existem (`primary-500`, `muted-700`, `background`, etc). Só muda quando você quer adicionar uma **categoria** nova de cor.
2. **Temas** (`themes` em `themes.ts`) são objetos que preenchem o schema com valores. O TypeScript (`satisfies Record<string, ThemeTokens>`) garante que nenhum tema esqueça uma cor — erro de compilação se faltar.
3. **`applyTheme(theme)`** (em `src/utils/theme.ts`) itera sobre `themeTokenKeys` e injeta cada valor como variável CSS via `style.setProperty`. Nunca precisa ser editada ao criar tema ou token novo.
4. **`getTheme()`** lê o tema atualmente aplicado direto do DOM (`data-theme`), refletindo o estado real independente de qualquer store.
5. **`initTheme()`** é chamada uma vez em `main.tsx`, antes do primeiro render, para aplicar o tema salvo e evitar flash de tema errado.

> **Nota:** nesta versão, `initTheme()` ainda não está chamada em `main.tsx` por padrão — adicione a chamada manualmente se for usar o sistema de temas:
> ```tsx
> import { initTheme } from "./utils/theme";
> initTheme();
> ```

### Criando um tema novo

Só edite `src/config/themes.ts`:

```ts
export const themes = {
    light: { /* ... */ },
    dark: { /* ... */ },
    solarized: {
        background: "#fdf6e3",
        foreground: "#073642",
        // ... resto do schema
    },
} as const satisfies Record<string, ThemeTokens>;
```

Nenhuma outra parte do projeto precisa ser tocada. `themeNames` já reflete o novo tema automaticamente, útil para montar seletores:

```tsx
import { themeNames } from "@/config/themes";
import { usePreferencesStore } from "@/store";

function ThemeSelector() {
    const { theme, setTheme } = usePreferencesStore();
    return (
        <select value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}>
            {themeNames.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
    );
}
```

### Limite técnico do Tailwind

O bloco `@theme` no `src/index.css` precisa listar os nomes das variáveis, pois é isso que gera as classes utilitárias (`bg-primary-500`, `text-muted-700`) em tempo de build. Isso só precisa ser editado ao criar uma **categoria de token nova** (ex: `success`, `danger`) — nunca ao criar um tema novo.

## Scripts

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção (checagem de tipos + build)
npm run lint      # eslint
npm run preview   # preview do build de produção
```

## Convenções gerais

- Alias `@/` aponta para `src/` (configurado no `tsconfig` e `vite.config`).
- Pastas vazias (`components/`, `hooks/`, `constants/`, `types/`, `styles/`) existem propositalmente — são pontos de extensão já estruturados para o projeto crescer sem reorganização.

## Evoluindo para a versão Full

Se o projeto precisar consumir uma API no futuro, adicione:

- `axios`, `@tanstack/react-query`, `@tanstack/react-query-devtools`
- `src/services/`, `src/queries/`, `src/config/env.ts`, `src/env.d.ts`
- `src/providers/QueryProvider.tsx`, envolvendo `children` em `AppProviders.tsx`

Veja a versão **full** deste starter para a referência completa dessa estrutura.