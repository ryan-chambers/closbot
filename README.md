# Closbot

This is my POC angular/ionic app that I can use as a sommelier-like reference. It uses AI (OpenAI) and RAG (pinecone).

The RAG service (future repo) stores my own wine reviews as well as those I have read and compiled from a variety of other sources. All invocations to the LLM will use the RAG context.

## Features

- Chat, as with a sommelier
- Add a wine review, with optional photo. Reviews will be upserted
- Gallery of previous wines
- Take a picture of a wine menu and get a recommendation
- Past vintages report
