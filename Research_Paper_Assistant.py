import streamlit as st
from gtts import gTTS
import fitz  
import tempfile


# App Title & Layout
st.set_page_config(page_title="AI Research Paper Assistant", page_icon="📄", layout="centered")

# Custom CSS
st.markdown(
    """
    <style>
        /* Background */
        .stApp {
            background-color: #9fcbf5 !important;
            color: black !important;
        }

        /* Global text */
        h1, h2, h3, h4, h5, h6, p, label, span {
            color: black !important;
        }


        /* Title */
        .title-card {
            background-color: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0px 4px 8px rgba(0,0,0,0.08);
            text-align: center;
            margin-bottom: 20px;
            color: black !important;

        }

     
    /* File uploader box container */
    div[data-testid="stFileUploader"] {
        border: 2px dashed #2f80ed !important;   /* blue dashed border */
        background-color: #e6f0ff !important;    /* light blue background */
        border-radius: 12px;
        padding: 30px;
    }

    /* Make uploader text white */
    div[data-testid="stFileUploader"] div[role="button"] span {
        color: white !important;
        font-weight: 600;
    }


    /* Browse button inside uploader */
    div[data-testid="stFileUploader"] button {
        background-color: #2f80ed !important;   /* blue background */
        color: white !important;                /* white text */
        border-radius: 6px;
        padding: 5px 15px;
        font-weight: 600;
    }


       /* Buttons */
        div.stButton > button {
            border-radius: 8px;
            padding: 10px 22px;
            font-weight: 600;
            border: none;
        }

        /* Upload & Summarize button */
        div.stButton > button:first-child {
            background: linear-gradient(90deg, #2f80ed, #56ccf2) !important;
            color: white !important;
        }

        /* Back button */
        div.stButton > button[kind="secondary"], div.stButton > button:nth-child(2) {
            background-color: #e6e9f5 !important;
            color: black !important;
        }
    </style>
    """,
    unsafe_allow_html=True
)

# Title Section
st.markdown("<div class='title-card'><h2>📑 Upload Your Research Paper</h2><p>Upload a PDF to get a concise summary</p></div>", unsafe_allow_html=True)

# Main Card Section
st.markdown("<div class='main-card'>", unsafe_allow_html=True)

# File Uploader
uploaded_file = st.file_uploader("Choose PDF File", type=["pdf"])

# Buttons
col1, col2 = st.columns([1, 0.4])
with col1:
    summarize_btn = st.button("📝 Upload & Summarize")
with col2:
    home_btn = st.button("⬅️ Back to Home")

st.markdown("</div>", unsafe_allow_html=True)

# Function: Extract PDF Text
def extract_text_from_pdf(pdf_file):
    text = ""
    pdf_document = fitz.open(stream=pdf_file.read(), filetype="pdf")
    for page_num in range(len(pdf_document)):
        text += pdf_document[page_num].get_text()
    return text

# Function: Create summary
def generate_summary(text):
    return text[:2000] + "..." if len(text) > 2000 else text

# Function: Text-to-Speech
def text_to_speech(text):
    tts = gTTS(text=text, lang="en")
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    tts.save(temp_file.name)
    return temp_file.name

# Initialize session state
if "summary" not in st.session_state:
    st.session_state.summary = ""
if "audio_file" not in st.session_state:
    st.session_state.audio_file = None

# Summarization
if summarize_btn and uploaded_file:
    with st.spinner("Extracting & summarizing..."):
        text = extract_text_from_pdf(uploaded_file)
        st.session_state.summary = generate_summary(text)
        st.session_state.audio_file = text_to_speech(st.session_state.summary)
        st.success("✅ Summary Generated!")

# Display Summary in Card
if st.session_state.summary:
    st.markdown("<div class='main-card'>", unsafe_allow_html=True)
    st.text_area("Summary", st.session_state.summary, height=250)
    if st.button("🔊 Read Summary Aloud"):
        if st.session_state.audio_file:
            st.audio(st.session_state.audio_file, format="audio/mp3")
    st.markdown("</div>", unsafe_allow_html=True)

# Home button action
if home_btn:
    st.info("Back to Home clicked (you can route this later).")
