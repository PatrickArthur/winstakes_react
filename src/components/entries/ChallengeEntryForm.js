import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import consumer from '../../consumer';

const ChallengeEntryForm = ({ challengeId, participantId, entryId, token }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileAttachment, setFileAttachment] = useState(null);
  const [videoAttachment, setVideoAttachment] = useState(null);
  const [entry, setEntry] = useState([]);
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();
  const [evidenceAttachment, setEvidenceAttachment] = useState([]);
  const API_URL = 'http://localhost:4000'; // Replace this with your API's base route
  const [error, setError] = useState(null);


  useEffect(() => {
     const fetchEntryData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/challenges/${challengeId}/challenge_participants/${participantId}/entries/${entryId}`, 
          {
            headers: {
              'Authorization': `Bearer ${token}`,  // Include the token in the request headers
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEntry(data.entry);
        setTitle(data.entry.title);
        setDescription(data.entry.description)
        setFileAttachment(data.entry.file_attachment)
        setVideoAttachment(data.entry.video_attachment)
        console.log('evidence_attachment_urls:', data.entry.evidence_attachment_urls);
        setEvidenceAttachment(data.entry.evidence_attachment_urls)
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchEntryData();
  }, [challengeId, participantId, entryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = entryId 
      ? `${API_URL}/challenges/${challengeId}/challenge_participants/${participantId}/entries/${entryId}`
      : `${API_URL}/challenges/${challengeId}/challenge_participants/${participantId}/entries`;

    const method = entryId ? 'PUT' : 'POST';

    const formData = new FormData();
  
    formData.append("entry[title]", title);
    formData.append("entry[description]", description);
  


    if (fileAttachment) {
      const fileBlob = new Blob([fileAttachment], { type: fileAttachment.type });
      console.log(`Appending file: ${fileAttachment.name}`);
      formData.append("entry[file_attachment]", fileBlob, fileAttachment.name);
    } else {
      console.log('No file to attach');
    }

    if (videoAttachment) {
      const videoBlob = new Blob([videoAttachment], { type: 'video/mp4' }); // Adjust MIME type as per your video
      formData.append("entry[video_attachment]", videoBlob, videoAttachment.name);
    }

    
    if (Array.isArray(evidenceAttachment) && evidenceAttachment.length > 0) {
      console.log('Preparing to append files to FormData...');
      
      evidenceAttachment.forEach((file, index) => {
        if (file instanceof File) { // Ensure each item is a File instance
          formData.append('entry[evidence_attachment][]', file, file.name || `evidence_file_${index}`);
          console.log(`Appended file: ${file.name || `evidence_file_${index}`}`);
        } else {
          console.error(`Item at index ${index} is not a valid File object`);
        }
      });
    } else {
      console.error('No valid files found to append');
    }

  
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,

        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setEntry(data.entry)
      navigate(`/challenges/${challengeId}/entries`);
    } catch (err) {
      setError(err.message);
      console.error('There was a problem with the fetch operation:', err);
    }
  };

  useEffect(() => {
    const subscription = consumer.subscriptions.create(
        { channel: "EntriesChannel" },
        {
          received(data) {
            const { entry, action } = data;

            setEntries((prevEntries) => {
              switch (action) {
                case "create":
                  return [...prevEntries, entry];
                case "update":
                  return prevEntries.map((e) => e.id === entry.id ? entry : e);
              }
            });
          },
        }
      );

      return () => {
        subscription.unsubscribe();
      };
  }, []);

  const createChangeHandler = (setter) => (e) => {
    const { type, value, files } = e.target;
    if (type === 'file' && files.length > 0) {
        // If the type is 'file' and there are files selected, set the first file object
        console.log(files[0])
        setter(files[0]);
    } else if (type === 'textarea' || type === 'text') {
        // If the type is 'textarea' or 'text', set the value directly
        setter(value);
    } else {
        // Optionally handle other input types or errors
        console.warn('Unhandled input type or no file selected.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="form-container">
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={createChangeHandler(setTitle)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={createChangeHandler(setDescription)}
        ></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="fileAttachment">File Attachment:</label>
        {fileAttachment && (
          <p>
            <img
              src={fileAttachment}
              alt="File Attachment"
              className="attachment-thumbnail"
            />
          </p>
        )}
        <input
          type="file"
          id="fileAttachment"
          onChange={createChangeHandler(setFileAttachment)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="videoAttachment">Video Attachment:</label>
        {videoAttachment && (
          <p>
            <video controls className="video-thumbnail">
              <source src={videoAttachment} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </p>
        )}
        <input
          type="file"
          id="videoAttachment"
          accept="video/*"
          onChange={createChangeHandler(setVideoAttachment)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="evidenceAttachment">Evidence Attachment:</label>
        {evidenceAttachment && evidenceAttachment.length > 0 && (
          <ul className="attachment-list">
            {evidenceAttachment.map((url, index) => (
              <li key={index}>
                <img
                  src={url}
                  alt={`Evidence Attachment ${index + 1}`}
                  className="attachment-image"
                />
              </li>
            ))}
          </ul>
        )}
        <input
          type="file"
          id="evidenceAttachment"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            setEvidenceAttachment(files);
          }}
        />
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default ChallengeEntryForm;