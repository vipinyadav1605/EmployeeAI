from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpoint
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from decouple import config
VECTOR_DB_PATH = "faiss_index"

#  Embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

#  LLM (Better than HuggingFaceHub old version)
llm = HuggingFaceEndpoint(
    # repo_id="google/flan-t5-base",
    repo_id = "mistralai/Mistral-7B-Instruct-v0.2",
    temperature=0.3,
    max_new_tokens=512,
    huggingfacehub_api_token=config("HUGGINGFACEHUB_API_TOKEN")
)

#  Step 1: Create Vector DB
def create_vector_db(file_path):
    loader = PyPDFLoader(file_path)
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    docs = splitter.split_documents(documents)

    if not docs:
        return "No content found."

    db = FAISS.from_documents(docs, embeddings)
    db.save_local(VECTOR_DB_PATH)

    return "Vector DB created successfully"


#  Prompt Template (VERY IMPORTANT)
prompt = PromptTemplate(
    template="""
You are an intelligent assistant.

Answer ONLY from the given context.
If the answer is not in context, say: "I don't know."

Context:
{context}

Question:
{question}

Answer:
""",
    input_variables=["context", "question"]
)
#  Helper function
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


#  Step 2: Ask Question (RAG)
def ask_rag(question):
    db = FAISS.load_local(
        VECTOR_DB_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )
    print("Vector DB loaded successfully.")
    retriever = db.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 4}  
    )
    print("Retriever created successfully.")
    parallel_chain = RunnableParallel({
        "context": retriever | RunnableLambda(format_docs),
        "question": RunnablePassthrough()
    })
    print("Parallel chain created successfully.")

    # main_chain = parallel_chain | prompt | llm 
    print("Main chain created successfully.")
    print(f"Invoking RAG process for question: {question}")
    # result = main_chain.invoke(question)
    # result = main_chain.invoke({"question": question})
    docs = retriever.invoke(question)
    context = "\n\n".join([doc.page_content for doc in docs])

    print("Context ready")

    # result = llm.invoke(f"""
    # Answer only from context:

    # {context}

    # Question: {question}
    # """)
    # result=llm.invoke("Hello, how are you?")
    # print("LLM response:", result)

    # return str(result)
    return "here is your answer for this query"
    