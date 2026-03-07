import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles/base.css';
import './styles/login.css';
import './styles/home.css';
import './styles/chat.css';
import './styles/lesson.css';
import './styles/repeat.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
