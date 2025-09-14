import streamlit as st
import PyPDF2
from gtts import gTTS
import tempfile
import matplotlib.pyplot as plt
from collections import Counter
import re
import io

# ------------------- APP CONFIG -------------------
st.set_page_config(page_title="AI Research Paper Assistant", page_icon="📄", layout="wide")

# ------------------- SESSION STATE -------------------
if "summary" not in st.session_state:
    st.session_state.summary = ""
if "detailed_summary" not in st.session_state:
    st.session_state.detailed_summary = ""
if "audio_file" not in st.session_state:
    st.session_state.audio_file = None
if "pdf_text" not in st.session_state:
    st.session_state.pdf_text = ""
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# ------------------- FUNCTIONS -------------------
def extract_text_from_pdf(uploaded_file):
    text = ""
    reader = PyPDF2.PdfReader(uploaded_file)
    for page in reader.pages:
        page_text = page.extract_text() or ""
        text += page_text
    return text

def generate_summaries(text):
    # Simulated AI Summaries (Replace with LLM API later)
    tldr = text[:300] + "..." if len(text) > 300 else text
    detailed = text[:1000] + "..." if len(text) > 1000 else text
    return tldr, detailed

def generate_visualizations(text):
    # Basic visualization: word frequency
    words = re.findall(r'\b\w+\b', text.lower())
    common_words = [w for w in words if len(w) > 4]
    counter = Counter(common_words)
    most_common = counter.most_common(5)
    labels, values = zip(*most_common)

    fig, ax = plt.subplots()
    ax.bar(labels, values, color="skyblue")
    ax.set_title("Top Keywords in Paper")
    ax.set_ylabel("Frequency")

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    return buf

def text_to_speech(text):
    tts = gTTS(text=text, lang="en")
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    tts.save(temp_file.name)
    return temp_file.name

def chat_with_ai(user_input):
    # Simulated chatbot response
    response = f"This is a simulated answer to: '{user_input}'. Replace with AI model API."
    return response

# ------------------- UI HEADER -------------------
st.title("📄 AI Research Paper Assistant")
st.markdown("Upload a PDF, explore summaries, keyword charts, and chat with an AI assistant.")

uploaded_file = st.file_uploader("Upload PDF", type=["pdf"])

# ------------------- PROCESS PDF -------------------
if uploaded_file and st.button("🔍 Process PDF"):
    with st.spinner("Reading and summarizing your PDF..."):
        text = extract_text_from_pdf(uploaded_file)
        st.session_state.pdf_text = text
        tldr, detailed = generate_summaries(text)
        st.session_state.summary = tldr
        st.session_state.detailed_summary = detailed
        st.session_state.audio_file = text_to_speech(tldr)
    st.success("✅ PDF processed successfully!")

# ------------------- TABS -------------------
if st.session_state.pdf_text:
    tab1, tab2, tab3 = st.tabs(["🧠 Summary", "📊 Visuals", "🤖 AI Assistant"])

    # --- TAB 1: Summary ---
    with tab1:
        st.subheader("TL;DR Summary")
        st.write(st.session_state.summary)

        st.subheader("Detailed Summary")
        st.write(st.session_state.detailed_summary)

        if st.button("🔊 Read Summary Aloud"):
            if st.session_state.audio_file:
                st.audio(st.session_state.audio_file, format="audio/mp3")

    # --- TAB 2: Visuals ---
    with tab2:
        st.subheader("Keyword Analysis")
        chart = generate_visualizations(st.session_state.pdf_text)
        st.image(chart, caption="Top Keywords in Paper")

    # --- TAB 3: AI Assistant ---
    with tab3:
        st.subheader("Chat with AI Assistant")
        user_query = st.text_input("Ask a question about this paper")
        if st.button("💬 Send"):
            if user_query.strip():
                ai_response = chat_with_ai(user_query)
                st.session_state.chat_history.append(("You", user_query))
                st.session_state.chat_history.append(("AI", ai_response))

        for sender, msg in st.session_state.chat_history:
            if sender == "You":
                st.markdown(f"**🧑 You:** {msg}")
            else:
                st.markdown(f"**🤖 AI:** {msg}")
else:
    st.info("📂 Upload a PDF and click **Process PDF** to begin.")
