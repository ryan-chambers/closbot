# Copilot Instructions for Closbot

## Project Overview

Closbot is an Angular/Ionic POC app for wine recommendations and note management, integrating AI (OpenAI) and RAG (Pinecone) for context-aware chat and data retrieval. The app supports adding wine notes, gallery browsing, menu photo analysis, and vintage reporting.

## Architecture & Key Components

- **Angular/Ionic Frontend**: UI and navigation, with services for business logic.
- **AI Integration**: `openai.service.ts` manages OpenAI API calls; prompts are defined in `prompt-helper.util.ts`.
- **RAG Integration**: `pinecone.service.ts` handles vector search and context retrieval from Pinecone.
- **Wine Data**: `wine.service.ts` abstracts wine-related operations, delegating to either real (`ai-wine.service.ts`) or fake (`fake-wine.service.ts`) services based on config.
- **Chat**: `chat.service.ts` manages chat state and message flow, using wine and language services.
- **Response Logging**: `response-log.service.ts` and `track-response.decorator.ts` log and track AI responses for debugging and flagging hallucinations.

## Project-Specific Patterns

- **Service Injection**: Use Angular's `inject()` for service dependencies, not constructor injection.
- **Signals/Computed**: State is managed with Angular signals and computed properties (see `chat.service.ts`).
- **AI Prompts**: Prompts for OpenAI are centralized in `prompt-helper.util.ts`.
- **Config Switching**: `config.service.ts` toggles between real and fake services for testing.
- **Response Tracking**: Decorators (`track-response.decorator.ts`) are used to log and flag AI responses for later note.
- **Environment Secrets**: API keys are stored in `environment.ts` (excluded from source control).

## Integration Points

- **OpenAI**: API key required in `environment.ts`.
- **Pinecone**: Used for RAG context; see `pinecone.service.ts` for API usage.
- **Capacitor Plugins**: Camera, filesystem, etc. for mobile features.

## Examples

- To add a wine note: use `WineService.addWineNote()`
- To invoke chat: use `ChatService` methods, which call into wine and AI services
- To flag a hallucinated response: use `WineService.flagResponse()`

## Key Files & Directories

- `src/app/services/` — Core business logic and integrations
- `src/app/models/` — Data models for wines, chat, etc.
- `src/app/components/` — UI components
- `android/` — Native Android build scripts and configs
- `README.md` — High-level project description

---

For unclear or missing conventions, ask the user for clarification or examples from the codebase.
