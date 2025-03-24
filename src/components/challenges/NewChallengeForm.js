import React, { useEffect, useState, useRef } from 'react';
import './ChallengeForm.css'
import consumer from '../../consumer';
import { useNavigate, useParams} from 'react-router-dom';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the datepicker's styles

const NewChallengeForm = ({token, challengeId}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [challenge, setChallenge] = useState({
    title: '',
    description: '',
    criteria_for_winning: '',
    duration: '',
  });
  const [selectedJudges, setSelectedJudges] = useState([]);
  const [judges, setJudges] = useState([]);
  const [selectedJudgeMethod, setSelectedJudgeMethod] = useState('');
  const [selectedJudgeFinal, setSelectedJudgeFinal] = useState('');
  const [prizeType, setPrizeType] = useState("tokens")
  const [tokenPrizePercentage, setTokenPrizePercentage] = useState(75)
  const [fixedTokenPrize, setFixedTokenPrize] = useState("")
  const [productId, setProductId] = useState(null)
  const [products, setProducts] = useState([])
  const [video, setVideo] = useState(null);
  const fileInputRef = useRef();
  const [criteria, setCriteria] = useState([{ name: '', maxScore: '' }]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
      const fetchChallenge = async () => {
        try {
          const response = await fetch(`${API_URL}/challenges/${challengeId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) throw new Error('Failed to fetch challenge');

          const data = await response.json();
          setChallenge(data.challenge);
          setSelectedJudges(data.challenge.judges)
          setSelectedJudgeMethod(data.challenge.judging_method)
          setSelectedJudgeFinal(data.challenge.finals_judging)
          setPrizeType(data.challenge.prize_type)
          setTokenPrizePercentage(data.challenge.token_prize_percentage || 75)
          setFixedTokenPrize(data.challenge.fixed_token_prize)
          setProductId(data.challenge.product_id)
          setVideo(data.challenge.video_url)
          const mappedCriteria = data.challenge.criteria.map(criterion => ({
            name: criterion.name,
            maxScore: criterion.max_score
          }));
          setCriteria(mappedCriteria);
          setStartDate(data.challenge.start_date);
          setEndDate(data.challenge.end_date);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      if (challengeId) {
        fetchChallenge();
      }
    }, [challengeId, token])

    useEffect(() => {
      const fetchJudges = async () => {
        try {
          const response = await fetch(`${API_URL}/profiles`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) throw new Error('Failed to fetch users');

          const data = await response.json();
          setJudges(data.profiles)
        } catch (err) {
          setError(err.message);
        }
      };

      fetchJudges ();
    }, []);

    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await fetch(`${API_URL}/products`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) throw new Error('Failed to fetch users');

          const data = await response.json();
          setProducts(data)
        } catch (err) {
          setError(err.message);
        }
      };

      fetchProducts ();
    }, []);

  const existingChallenge = challengeId ? true : false

  const [challenges, setChallenges] = useState([]);
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const navigate = useNavigate();

  const API_URL = 'http://localhost:4000'; // Replace this with your API's base route

  useEffect(() => {
    const subscription = consumer.subscriptions.create(
      { channel: 'ChallengesChannel' },
      {
        received(challengeData) {
          // Handle incoming data from ActionCable
          const newChallenge = JSON.parse(challengeData.challenge);
          setChallenges((prevChallenges) => [...prevChallenges, newChallenge]);
        },
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleChange = (e) => {
    if (e.target.id == "judge") {
      const options = e.target.options;
      const selectedJudges = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedJudges.push(options[i].value);
        }
      }
      setSelectedJudges(selectedJudges);
    } else if (e.target.id == "judgeMethod") {
      setSelectedJudgeMethod(e.target.value)
    } else if (e.target.id == "finalJudgeMethod") {
      setSelectedJudgeFinal(e.target.value)
    } else {
      setChallenge({ ...challenge, [e.target.name]: e.target.value });
    }
  };

  const handleCriterionChange = (index, event) => {
    const newCriteria = criteria.map((criterion, idx) => {
      if (idx === index) {
        return { ...criterion, [event.target.name]: event.target.value };
      }
      return criterion;
    });
    debugger
    setCriteria(newCriteria);
  };

  const addCriterion = () => {
    setCriteria([...criteria, { name: '', maxScore: '' }]);
  };

  // Remove criterion input field
  const removeCriterion = (index) => {
    setCriteria(criteria.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const method = existingChallenge ? 'PUT' : 'POST';
    const videoBlob = new Blob([video], { type: 'video/mp4' });
    const formData = new FormData()

    // Append other fields from challenge
    formData.append('challenge[title]', challenge.title);
    formData.append('challenge[description]', challenge.description);
    formData.append('challenge[criteria_for_winning]', challenge.criteria_for_winning);
    formData.append('challenge[duration]', challenge.duration);

    // Append prize data
    formData.append('challenge[judging_method]', selectedJudgeMethod);
    formData.append('challenge[prize_type]', prizeType);
    formData.append('challenge[start_date]', startDate);
    formData.append('challenge[end_date]', endDate);

    criteria.forEach((criterion, index) => {
      formData.append(`criteria[${index}][name]`, criterion.name);
      formData.append(`criteria[${index}][max_score]`, criterion.maxScore);
    });
    
    if (prizeType === 'tokens') {
      if (tokenPrizePercentage !== null) {
        formData.append('challenge[token_prize_percentage]', tokenPrizePercentage.toString());
      }
      if (fixedTokenPrize !== null) {
        formData.append('challenge[fixed_token_prize]', fixedTokenPrize.toString());
      }
    }

    if (prizeType === 'product') {
      formData.append('challenge[product_id]', productId.toString());
    }

    // Append the video blob
    if (videoBlob) {
      formData.append('challenge[video]', videoBlob, video.name || 'video.mp4');
    }

    const data = {
      challenge: formData,  // Ensure this is a plain object if not sending files
    };

    // Make the fetch request with the authorization header
    fetch(`${API_URL}/challenges${existingChallenge ? `/${challenge.id}` : ''}`, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`, // Use the token appropriately
      },
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not okay');
        }
        return response.json();
      })
      .then(data => {
        // Use the response data as needed, e.g., updating state, redirecting, etc.
        navigate(`/challenges/${data.challenge.id}`); 
        console.log('Challenge successfully posted:', data);
      })
      .catch(error => {
        console.error('There was an error submitting the challenge:', error);
      });
  };

  const judgeOptions = judges.map(judge => ({
    value: judge.id,
    label: judge.email,
    avatar: judge.photo_url
  }));

  const CustomOption = ({ innerRef, innerProps, data }) => {
    return (
      <div ref={innerRef} {...innerProps} style={{ display: 'flex', alignItems: 'center', padding: '5px' }}>
        <img
          src={`${API_URL}${data.avatar}`}
          alt={data.label}
          style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
        />
        <span>{data.label}</span>
      </div>
    );
  };

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideo(file);
    }
  };

  const clearVideo = () => {
    setVideo(null);
    // Reset the input file's value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  

  const options = Array.isArray(products)
    ? products
        .filter((p) => p && p.id !== undefined && p.name !== undefined)
        .map((p) => ({ value: p.id, label: p.name }))
    : [];

  // Find the currently selected option from the options array
  const selectedOption = options.find((option) => option.value === productId);

  return (
    <form className="challenge-form" onSubmit={handleSubmit}>
            <h2>{existingChallenge ? 'Edit Challenge' : 'Create a New Challenge'}</h2>
            
            <div className="form-group">
                <label htmlFor="title">Title</label>
                <input 
                    id="title"
                    name="title" 
                    value={challenge.title}
                    onChange={handleChange} 
                    placeholder="Enter the challenge title" 
                    required
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                    id="description"
                    name="description" 
                    value={challenge.description}
                    onChange={handleChange} 
                    placeholder="Describe the challenge" 
                    required
                ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="judgeMethod">Select Judging Method</label>
              <select
                id="judgeMethod"
                onChange={handleChange}
                value={selectedJudgeMethod || ''}
                required
              >
                <option value="" disabled>Select a Judging Method</option>
                <option value="publicVote">Public Vote (Participants and Platform Users)</option>
                <option value="participantsOnly">Participants Only</option>
                <option value="automatedFirstComplete">Hybrid Vote (Particpants and Followers)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="finalJudgeMethod">Select Final Judgement Method</label>
              <select
                id="finalJudgeMethod"
                onChange={handleChange}
                value={selectedJudgeFinal || ''}
                required
              >
                <option value="" disabled>Select how final enteries are Judged</option>
                <option value="judgeByCreator">Judge by Creator</option>
                <option value="selectionOfJudges">Selection of Judges</option>
              </select>
            </div>

            {selectedJudgeFinal == 'selectionOfJudges' && (
                <div className="form-group">
                 <label htmlFor="judge">Select Judges</label>
                 <Select
                   isMulti
                   options={judgeOptions}
                   onChange={(selected) => setSelectedJudges(selected.map(option => option.value))}
                   value={judgeOptions.filter(option => selectedJudges.includes(option.value))}
                   components={{ Option: CustomOption }}
                 />
               </div>
            )}

            <div  className="criteria-container">
              <p>Criteria</p>
                {criteria.map((criterion, index) => (
                  <div key={index} className="criterion-item">
                    <input
                      type="text"
                      name="name"
                      value={criterion.name}
                      placeholder="Criterion Name"
                      onChange={(e) => handleCriterionChange(index, e)}
                    />
                    <input
                      type="number"
                      name="maxScore"
                      value={criterion.maxScore}
                      placeholder="Max Score"
                      onChange={(e) => handleCriterionChange(index, e)}
                    />
                    <FontAwesomeIcon 
                      icon={faTrash} 
                      onClick={() => removeCriterion(index)} 
                      style={{ cursor: 'pointer', color: 'red' }}
                      className="delete-icon"
                    />
                  </div>
                ))}
              <button type="button" className="add-button" onClick={addCriterion}>Add Criterion</button>
            </div>

            <div className="form-group">
                <label htmlFor="criteria_for_winning">Winning Criteria</label>
                <textarea 
                    id="criteria_for_winning"
                    name="criteria_for_winning" 
                    value={challenge.criteria_for_winning}
                    onChange={handleChange} 
                    placeholder="Specify how to win" 
                    required
                ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="startDate" className="signup-label">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="startdate-input"
                dateFormat="yyyy/MM/dd"
                placeholderText="YYYY/MM/DD"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={15}
              />
            </div>

            <div className="form-group">
              <label htmlFor="startDate" className="signup-label">Start Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="enddate-input"
                dateFormat="yyyy/MM/dd"
                placeholderText="YYYY/MM/DD"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={15}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="prize">Prize Type</label>
              <select value={prizeType} onChange={(e) => setPrizeType(e.target.value)}>
                <option value="tokens">Tokens</option>
                <option value="product">Product from Store</option>
              </select>
            </div>

            {prizeType == "tokens" && (
              <>
                <div className="form-group">
                    <label htmlFor="token_prize_percentage">Token Prize Percentage (Default 75%):</label>
                    <input 
                        type="number" 
                        value={tokenPrizePercentage}
                        onChange={(e) => setTokenPrizePercentage(Number(e.target.value))}
                        min="1"
                        max="100"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="fixed_token_prize">Fixed Token Prize (Optional)</label>
                    <input 
                        type="number" 
                        value={fixedTokenPrize}
                        onChange={(e) => setFixedTokenPrize(e.target.value)}
                        placeholder="Enter fixed token prize" 
                    />
                </div>
              </>
            )}

            {prizeType == "product" && (
              <div className="form-group">
                <label htmlFor="prize">Select a Product:</label>
                <Select
                   options={options}
                   value={selectedOption}
                   onChange={(selectedOption) => setProductId(selectedOption.value)}
                   placeholder="Select a product"
                   isClearable={true} 
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="video-upload">Upload Video:</label>
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                onChange={handleVideoChange}
                ref={fileInputRef} // Direct manipulation through ref
              />
            </div>
            {video && (
              <div>
                <h4>Preview:</h4>
                <video width="400" controls>
                  <source src={video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button type="button" onClick={clearVideo}>
                  Clear
                </button>
              </div>
            )}


            <button type="submit">{existingChallenge ? 'Update Challenge' : 'Create Challenge'}</button>
        </form>
  );
}

export default NewChallengeForm;