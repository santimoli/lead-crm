# Lead CRM

Um CRM pequeno para gerir leads comerciais. Permite criar, listar, editar e apagar leads, pesquisá-las por nome ou email e filtrá-las por estado.

## Como correr localmente

```bash
git clone https://github.com/santimoli/lead-crm.git
cd lead-crm
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

O `prisma migrate dev` cria a base de dados SQLite em `prisma/dev.db` e gera o cliente do Prisma. A aplicação fica em http://localhost:3000.

## Tecnologias

Escolhi o Next.js porque junta a interface e a API no mesmo projeto, e também porque queria aprender mais sobre ele.

Já tinha utilizado bastante React nos meus projetos académicos, por isso pude concentrar-me na estrutura da aplicação em vez de aprender uma biblioteca nova. Escolhi o SQLite para manter o projeto simples: a base de dados é um único ficheiro e não precisa de configuração.

Para aceder à base de dados escolhi o Prisma, que define o modelo num só ficheiro, gera as migrações e faz as queries sem escrever SQL. Para validar os dados recorri ao Zod, porque as regras ficam escritas de forma declarativa, parecida com as anotações do Bean Validation no Spring Boot. Por fim, o Sonner mostra notificações curtas depois de cada ação, como "Lead criada" ou "Erro ao apagar".

## Estrutura do projeto

```
prisma/
  schema.prisma            Modelo Lead
  migrations/              Histórico SQL da base de dados
src/
  app/api/leads/
    route.js               GET (listar) e POST (criar)
    [id]/route.js          PATCH (editar) e DELETE (apagar)
  features/leads/
    schema.js              Schemas Zod para criar, editar e listar
    service.js             Regras de negócio e queries à base de dados
  lib/
    prisma.js              Cliente Prisma partilhado
    errors.js              NotFoundError e ConflictError
    http.js                Converte erros em respostas HTTP
```

Cada pedido passa por três camadas. A rota trata do HTTP: lê o pedido, valida-o com o schema Zod e envia a resposta. O service tem as regras e é o único código que fala com o Prisma. Quando algo falha, o service lança uma exceção e o `errorResponse` em `lib/http.js` escolhe o código de resposta, por isso todas as rotas tratam os erros da mesma forma.

## API

- `GET /api/leads` lista as leads, das mais recentes para as mais antigas.
- `POST /api/leads` cria uma lead e responde 201 com a lead criada.
- `PATCH /api/leads/:id` altera um ou mais campos e devolve a lead atualizada.
- `DELETE /api/leads/:id` apaga a lead e responde 204, sem corpo.

A listagem aceita `search`, que procura parte do nome ou do email, e `status`, que pode ser `NEW`, `CONTACTED`, `QUALIFIED` ou `LOST`. A paginação faz-se com `page` e `pageSize`, que por defeito são 1 e 20. O `pageSize` vai até 100.

A resposta da listagem tem esta forma:

```json
{
  "data": [{ "id": "…", "name": "Santi", "email": "santiago@gmail.com", "company": "LDA", "status": "NEW", "createdAt": "…", "updatedAt": "…" }],
  "meta": { "total": 1, "page": 1, "pageSize": 20 }
}
```

O `total` conta todas as leads que cumprem os filtros, e não só as da página atual. A interface vai utilizá-lo para calcular o número de páginas.

Os erros têm sempre a mesma forma: `{ "error": "mensagem", "fields": { "email": "mensagem" } }`. O `fields` só aparece quando há um campo concreto com problema.

## Decisões

O estado é guardado como texto (`String`), porque o Prisma não suporta enums em SQLite. Os valores permitidos estão definidos uma única vez no `schema.js`.

Os ids são UUIDs. Não revelam quantas leads existem.

A listagem é paginada e ordenada pela data de criação e depois pelo id, para que a ordem não mude entre páginas quando duas leads têm a mesma data.
