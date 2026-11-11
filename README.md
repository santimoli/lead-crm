# Lead CRM

Um CRM simples para gerir leads de vendas. Permite criar, listar, editar e
apagar leads, pesquisá-las por nome ou email e filtrá-las por estado.

## Como correr localmente

É preciso ter o Node.js 20.9 ou mais recente.

```bash
git clone https://github.com/santimoli/lead-crm.git
cd lead-crm
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

No PowerShell, o quarto comando é `copy .env.example .env`.

O `prisma migrate dev` cria a base de dados SQLite em prisma/dev.db, gera o
cliente do Prisma e preenche a base com 15 leads de exemplo. Para voltar a
inserir esses dados mais tarde, basta correr `npx prisma db seed`, que executa o
ficheiro prisma/data.js. A aplicação abre em http://localhost:3000.

## Tecnologias

Escolhi o Next.js porque junta a interface e a API no mesmo projeto, e também
porque queria aprender mais sobre ele.

Já tinha utilizado bastante React nos meus projetos académicos, por isso pude
concentrar-me na estrutura da aplicação em vez de aprender uma biblioteca nova.
Escolhi o SQLite para manter o projeto simples: a base de dados é um único
ficheiro e não precisa de configuração.

Para aceder à base de dados escolhi o Prisma, que define o modelo num só
ficheiro, gera as migrações e faz as queries sem escrever SQL. Para validar os
dados recorri ao Zod, porque as regras ficam escritas de forma declarativa,
parecida com as anotações do Bean Validation no Spring Boot. Por fim, o Sonner
mostra notificações curtas depois de cada ação, como "Lead created" ou "Could
not delete lead".

## Funcionalidades

- Criar, editar e apagar leads, com confirmação antes de apagar.
- Barra lateral com os estados (New, Contacted, Qualified, Lost) e o número de
  leads em cada um. Clicar num estado filtra a lista.
- Pesquisa por nome ou email.
- Lista paginada, das mais recentes para as mais antigas, com a data de criação
  em formato relativo ("yesterday", "3 days ago").
- Validação com uma mensagem de erro por baixo de cada campo.
- Emails únicos. Um email repetido devolve um erro 409 com a mensagem no campo
  do email.
- Notificações curtas depois de cada ação.
- Mensagens próprias para quando a lista está a carregar, quando há um erro,
  quando não existem leads e quando a pesquisa não encontra nada.

## Limitações

- Não há testes automáticos. Testei a API à mão no Postman e a interface no
  browser.
- A pesquisa ignora maiúsculas e minúsculas apenas em letras sem acentos, por
  causa da forma como o SQLite compara texto.
- A pesquisa faz um pedido a cada letra escrita, sem debounce.
- O estado é guardado como texto, porque o Prisma não suporta enums no SQLite. O
  Zod só aceita os quatro valores válidos.

## Decisões técnicas

Com o SQLite, o projeto corre logo depois de ser clonado. Em contrapartida, não
serve para uma aplicação em produção com vários servidores. Mudar para
PostgreSQL implicaria alterar o provider no schema.prisma e o DATABASE_URL e
gerar as migrações de novo. O estado poderia então passar a ser um enum.

O código está dividido em camadas, como um controller e um service no Spring
Boot. As rotas tratam apenas de HTTP. O service contém as regras e é o único
código que fala com o Prisma. Quando algo falha, o service lança um erro e a
função errorResponse, em lib/http.js, escolhe o código de estado. Assim, todas
as rotas tratam os erros da mesma forma.

A lista é paginada no servidor. Isso obriga a uma query extra de contagem, mas a
página nunca carrega todas as leads de uma vez. A ordenação é pela data de
criação e depois pelo id, para que a ordem não mude entre páginas quando duas
leads têm a mesma data.

No frontend, o estado da página fica todo em page.js e os componentes recebem os
dados por props. A lista, a paginação e os números da barra lateral dependem uns
dos outros, por isso é mais simples tê-los num só sítio. O lado negativo é que o
page.js ficou com cerca de 200 linhas. Se a aplicação crescesse, separava a
lógica dos pedidos num hook próprio.

Depois de criar, editar ou apagar uma lead, a página volta a pedir a lista ao
servidor, em vez de a atualizar à mão. Custa um pedido extra, mas a ordem, os
filtros e a paginação ficam sempre certos.

A barra lateral inspira-se no Gmail: os estados funcionam como pastas, o que
facilita separar as leads novas, as já contactadas e as qualificadas.

Os números de cada estado vêm de um endpoint próprio, /api/leads/stats, que os
conta na base de dados. Não os calculo no browser porque a lista só traz as 10
leads da página atual, já filtradas, e os totais ficariam errados. Assim, depois
de criar, editar ou apagar uma lead, a página faz dois pedidos: um para a lista
e
outro para os números. Podia juntar os números à resposta da lista e fazer só um
pedido, mas preferi que cada endpoint fizesse uma coisa só.

O mesmo formulário serve para criar e editar. Enquanto está aberto, a pesquisa
fica escondida, mas o filtro mantém-se, para não perder de vista a lead que se
está a editar.

Não utilizei nenhuma biblioteca de componentes. O estilo é feito com CSS Modules
e algumas variáveis de cor em globals.css. Deu mais trabalho escrever à mão os
estilos dos inputs, dos botões e da tabela, e o projeto ficou com menos
dependências.

## Estrutura do projeto

```
prisma/                    Modelo, migrações e seed (data.js)
src/
  app/
    page.js                Página principal
    api/leads/             Rotas da API
  features/leads/
    schema.js              Validação (Zod)
    service.js             Regras e acesso à base de dados
    components/
  lib/                     Prisma, erros e datas
```

## API

- `GET /api/leads` lista as leads, das mais recentes para as mais antigas.
- `POST /api/leads` cria uma lead e devolve 201.
- `PATCH /api/leads/:id` altera um ou mais campos.
- `DELETE /api/leads/:id` apaga uma lead e devolve 204.
- `GET /api/leads/stats` devolve o total de leads e o número em cada estado.

A listagem aceita search, status (NEW, CONTACTED, QUALIFIED ou LOST), page
(por omissão 1) e pageSize (por omissão 10, no máximo 100). A resposta tem este
formato:

```json
{
  "data": [
    {
      "id": "…",
      "name": "Santi",
      "email": "santiago@gmail.com",
      "company": "LDA",
      "status": "NEW",
      "createdAt": "…",
      "updatedAt": "…"
    }
  ],
  "meta": { "total": 1, "page": 1, "pageSize": 10 }
}
```

O total conta todas as leads que correspondem aos filtros, e não apenas as da
página atual.

Os erros devolvem `{ "error": "mensagem", "fields": { "email": "mensagem" } }`,
com 400 para dados inválidos, 404 para uma lead que não existe e 409 para um
email repetido.

## Abordagem e ferramentas

Comecei por listar os requisitos e planear as camadas. Fiz primeiro o backend: o
modelo da base de dados, a validação, o service e as rotas da API, testando cada
endpoint no Postman antes de avançar. Depois construí o frontend por passos
pequenos (lista, criar, apagar, editar, pesquisa, paginação, estatísticas,
notificações) e só no fim tratei do aspeto.

Ferramentas: IntelliJ IDEA, Postman, Git e GitHub, Prettier e ESLint, e o Claude
como assistente de IA.

## Utilização de IA

Utilizei o Claude como revisor e para me ajudar no debug. Explicou-me conceitos
com que ainda não tinha trabalhado a fundo (Prisma e Zod). Também me mostrou
como encapsular o tratamento de erros em lib/http.js.

No frontend, ajudou-me a escrever o componente de paginação, a pensar na
estrutura e no estilo do layout e a fazer a função de lib/date.js, que mostra a
data de criação em formato relativo.
