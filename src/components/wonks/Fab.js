import { useNavigate } from 'react-router-dom';
import './Fab.css'; // Your FAB styles

const Fab = () => {
  const navigate = useNavigate();

  return (
    <button className="fab" onClick={() => navigate('/post')}>
      +
    </button>
  );
};

export default Fab;