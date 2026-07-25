# Documentation Workflow

## Purpose

Используй этот reference, когда нужно решить, куда относится тема, какие исходные файлы читать и в каком порядке работать перед изменением проектной документации.

## Standard Workflow

1. Проверь Git:
   * текущую ветку;
   * незакоммиченные файлы;
   * относятся ли изменения к текущей задаче.
2. Прочитай корневые правила:
   * `.agents/README.md`;
   * `specs/RULES.md`;
   * `specs/README.md`.
3. Классифицируй задачу:
   * продуктовое поведение;
   * технический механизм;
   * user story;
   * work plan;
   * consistency check;
   * готовность к реализации;
   * изменение кода.
4. Прочитай минимальный релевантный слой документации.
5. Реши, покрыта ли тема:
   * полностью покрыта: не редактируй, сообщи где покрыта;
   * частично покрыта: редактируй самый узкий документ;
   * не покрыта: создай или обнови правильный слой;
   * конфликтует: остановись и сообщи о конфликте.
6. Сделай ограниченные правки.
7. Проверь измененные документы.
8. Сообщи результат перед Git-действиями.
9. Если Work Plan разделен на группы, выполняй одну группу в отдельной ветке от актуального `main`; следующую группу начинай после merge предыдущей и синхронизации `main`.

## Where To Put Information

| Тип информации | Куда помещать |
| --- | --- |
| Бизнес-цель, роли, базовый принцип | `specs/01_global_spec/` |
| Продуктовый поток, зона системы, MVP-граница, открытая продуктовая зона | `specs/02_functional_map/` |
| Конкретное поведение функции и бизнес-правило | `specs/03_feature_specs/` |
| Модель данных, правило доступа, security mechanism, API behavior, architecture decision | `specs/04_technical_specs/` |
| Сценарий, критерии приемки, edge case, путь пользователя | `specs/06_user_stories/` |
| Порядок реализации, зависимости, readiness gates | `work_plans/` |
| Хронология фактически завершенных работ по областям проекта | `roadmap/` |
| Навигация раздела и список текущих документов | `README.md` внутри соответствующего раздела |
| Правила процесса AI-агентов | `.agents/` |

## Required Reading By Task Type

### Product Behavior

Читай:

1. `specs/01_global_spec/Global_Spec.md`;
2. `specs/02_functional_map/Functional_Map.md`;
3. related files in `specs/03_feature_specs/`.

После этого реши, нужно ли обновлять Feature Spec.

### Technical Mechanism

Читай:

1. related Feature Spec;
2. related Technical Spec;
3. `specs/04_technical_specs/Technical_MVP_Implementation_Decisions.md` when architecture or MVP stack is involved.

После этого обнови самый узкий Technical Spec.

### User Story

Читай:

1. related Feature Spec;
2. related Technical Spec;
3. existing User Stories and check reports.

После этого обнови или создай User Story без добавления неутвержденного бизнес-поведения.

### Work Plan

Читай:

1. related Feature Specs;
2. related Technical Specs;
3. related User Stories;
4. existing Work Plans.

После этого обнови или создай Work Plan с этапами, зависимостями и criteria of readiness.

### Code Readiness

Читай:

1. `work_plans/active/Work_Plan_Code_Readiness.md`, если он остается активным;
2. `work_plans/active/Work_Plan_MVP_Order_Flow.md`;
3. `specs/04_technical_specs/Technical_MVP_Implementation_Decisions.md`;
4. the Technical Spec for the feature being implemented.

Пока `Work_Plan_Code_Readiness.md` активен, выполняй его первую незавершенную группу и не создавай код приложения. Код можно начинать только после завершения всего Code Readiness Work Plan, закрытия соответствующего blocker и покрытия ожидаемого поведения.

### Completed Work Plan

Читай:

1. завершенный Work Plan;
2. `roadmap/README.md`;
3. соответствующие журналы областей в `roadmap/`.

Промежуточные commit, push, pull request и merge отдельных групп не завершают активный Work Plan.

Перемещай план в `work_plans/completed/` только после выполнения всех его групп и критериев, ручной проверки итогового результата, явного подтверждения пользователя о завершении всего плана и явного запроса подготовить его финальную публикацию.

После такого подтверждения:

1. перемести план в `work_plans/completed/`;
2. обнови его статус, индексы и все ссылки;
3. добавь записи о фактически выполненных работах во все затронутые журналы roadmap;
4. включи перенос и roadmap в финальный completion commit;
5. выполни финальный push, после которого pull request готов к merge.

## Next-Step Algorithm

Когда пользователь спрашивает "что дальше":

1. Проверь Git status и последнее смерженное состояние.
2. Прочитай `specs/README.md`.
3. Прочитай текущий Work Plan.
4. Найди первый незакрытый blocker или readiness gate.
5. Если документации не хватает, предложи точное обновление документа.
6. Если документации достаточно, предложи минимальный шаг настройки кода или реализации.
7. Сообщи, нужна ли новая ветка для следующего шага.
