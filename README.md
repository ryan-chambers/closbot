# Closbot

This is my POC angular/ionic app that I can use as a sommelier-like reference. It uses AI (OpenAI) and RAG (pinecone).

The [RAG service](https://github.com/ryan-chambers/assemblage) stores my own wine notes as well as those I have read and compiled from a variety of other sources. All invocations to the LLM will use the RAG context.

## Features

- Chat, as with a sommelier
- Add a wine note, with optional photo. Notes will be upserted to a RAG solution. If taking a picture, the app will attempt to read the label to populate vintage, village, etc.
- Gallery of photos and notes for previous wines
- Take a picture of a wine menu and get a recommendation
- Past vintages report
- Supports English and French
