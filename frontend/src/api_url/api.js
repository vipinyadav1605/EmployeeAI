import load_dotenv from dotenv
load_dotenv()
API=process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export default API;