DocBrain is a lightweight Retrieval-Augmented Generation (RAG) demo that lets you upload documents and ask questions about them.
It demonstrates how to combine REST APIs (for clients) with gRPC (for internal service-to-service communication) — the same pattern used in modern backend architectures.
| Service                        | Description                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| **BFF (Backend-for-Frontend)** | REST API that clients (Postman, web apps) use. Forwards requests to the RAG service using gRPC. |
| **RAG Service**                | Handles document indexing and question answering using simple keyword-based retrieval.          |

**Features :**
1) Adding documents through REST API
2) Asking natural language questions.
3) Receiving AI-style answers generated from the content that has been added.

**Architecture :**

<img width="515" height="224" alt="image" src="https://github.com/user-attachments/assets/d3127994-49c5-4b5a-babb-52d67f82ba44" />


