import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom';
import Login from './components/users/Login';
import Signup from './components/users/Signup';
import AuthPage from './components/users/AuthPage';
import Home from './components/Home';
import Navbar from './Navbar';
import Footerbar from './Footerbar';
import Sidebar from './Sidebar';
import { getToken, getProfile, getAvatar } from './services/authService';

import ProfileForm from './components/profiles/ProfileForm';
import Profile from './components/profiles/Profile';
import Chat from './components/chats/Chat';
import NotificationsPage from './components/notifications/NotificationsPage';
import Wonk from './components/wonks/Wonk';
import Comment from './components/comments/Comment';
import NewChallengeForm from './components/challenges/NewChallengeForm';
import ChallengeList from './components/challenges/ChallengeList';
import ChallengePage from './components/challenges/ChallengePage';
import ChallengeEntryForm from './components/entries/ChallengeEntryForm';
import ChallengeEntryPage  from './components/entries/ChallengeEntryPage';
import ChallengeParticipants from './components/challenges/ChallengeParticipants';
import PurchaseTokens from './components/tokens/PurchaseTokens';
import Wallet from './components/tokens/Wallet';
import FollowerList from './components/followers/FollowerList';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Fab from './components/wonks/Fab'; // Import your FAB component
import PostingPage from './components/wonks/PostingPage';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [hasProfile, setHasProfile] = useState(!!getProfile());
  const stripePromise = loadStripe('pk_test_51QhHJI09lAIkKgmAbU8uCbM9Q1nymlhiM63u4k4Xc7q2M4D8uURywg7gfDYMD5z9Hqw6Nk80M7gotAgojdNFk7Yj00JPy1kFfo');

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  const ProtectedRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  const DispProfileRoute = ({ children }) => {
    return hasProfile ? children : <Navigate to="/create-profile" />;
  };
  
  return (
    <Router>
      <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
        <Navbar isLoggedIn={isLoggedIn} hasProfile={hasProfile}/>
         <div className="d-flex flex-grow-1" style={{ position: 'relative' }}>
          <Sidebar isLoggedIn={isLoggedIn} hasProfile={hasProfile} />
          
          <div className="flex-grow-1 position-relative">
            <div className="container position-relative" style={{ minHeight: '80vh' }}> {/* Consider enough space usage */}
              <Routes>
                 <Route
                  path="/"
                  element={
                    isLoggedIn ? (
                      <Navigate to="/home" />
                    ) : (
                      <Navigate to="/auth" />
                    )
                  }
                />
                <Route path="/" element={<Navigate to="/auth" />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setHasProfile={setHasProfile}/>} />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                      <Home setHasProfile={setHasProfile} />
                    </ProtectedRoute>
                  }
                />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={<ProtectedRoute><Home setHasProfile={setHasProfile}/></ProtectedRoute>}/>
                <Route path="/create-profile" element={<ProtectedRoute><ProfileForm /></ProtectedRoute>}/>
                <Route path="/profile/:id" element={<ProtectedRoute><DispProfileRoute><ProfileWrapper/></DispProfileRoute></ProtectedRoute>}/>
                <Route path="/edit-profile" element={<ProtectedRoute><DispProfileRoute><ProfileFormWrapper/></DispProfileRoute></ProtectedRoute>}/>
                <Route path="/chat/:id" element={<ChatWrapper />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/wonks/:id" element={<WonkWrapper />} />
                <Route path="/wonks/:wonkId/comments/:commentId" element={<CommentWrapper />} />
                <Route path="/challenges" element={<ChallengeList token={getToken()} joinedChallenges={false} createdChallenges={false}/>} /> 
                <Route path="/joined-challenges" element={<ChallengeList token={getToken()} joinedChallenges={true} createdChallenges={false}/>} />
                <Route path="/created-challenges" element={<ChallengeList token={getToken()} joinedChallenges={false} createdChallenges={true}/>} />
                <Route path="/challenges/new" element={<NewChallengeForm token={getToken()} />} />
                <Route path="/challenges/:id" element={<ChallengePageWrapper />} />
                <Route path="/edit/challenges/:id" element={<NewChallengeFormWrapper />} />
                <Route path="/challenges/:challengeId/entries/:participantId" element={<EntriesFormWrapper />} />
                <Route path="/challenges/:challengeId/entries/:participantId/:entryId" element={<EntriesFormWrapper />} />
                <Route path="/challenges/:challengeId/challenge_participants/:participantId/entries/:entryId" element={<ChallengeEntryPageWrapper />} />
                <Route path="/challenges/:challengeId/challenge_participants/:creatorId" element={<ChallengeParticipantsWrapper />} />
                <Route path="/tokens/purchase" element={<PurchaseTokensWrapper/>} />
                <Route path="/:profileId/followers" element={<FollowerListWrapper />} />
                <Route path="/:profileId/following" element={<FollowerListWrapper />} />
                <Route path="/post" element={<PostingPage />} />
              </Routes>
              {isLoggedIn && (
                <Fab onClick={() => console.log("FAB Clicked!")} />
              )}
            </div>
          </div>
         </div>
        <Footerbar isLoggedIn={isLoggedIn} hasProfile={hasProfile} setIsLoggedIn={setIsLoggedIn} setHasProfile={setHasProfile}/>
      </div>
    </Router>
  );


  function PurchaseTokensWrapper() {
     return (
      <Elements stripe={stripePromise}>
        <PurchaseTokens
          token={getToken()}
          profileId={localStorage.getItem('profile_id')}
        />
      </Elements>
    );
  }

  function FollowerListWrapper() {
    const location = useLocation();
    const { profileId } = useParams();
    return <FollowerList token={getToken()} profileId={profileId} listType={location.pathname.split('/')[2]} />;
  }


  function ChallengeParticipantsWrapper() {
    const { challengeId, creatorId } = useParams();
    return <ChallengeParticipants token={getToken()} challengeId={challengeId} creatorId={creatorId} profileId={localStorage.getItem('profile_id')}/>;
  }

  function ChallengeEntryPageWrapper() {
    const { challengeId, participantId, entryId } = useParams();
    return <ChallengeEntryPage token={getToken()} challengeId={challengeId} participantId={participantId} entryId={entryId}/>;
  }

  function EntriesFormWrapper() {
    const { challengeId, participantId, entryId } = useParams();
    return <ChallengeEntryForm token={getToken()} challengeId={challengeId} participantId={participantId} entryId={entryId}/>;
  }

  function NewChallengeFormWrapper() {
    const { id } = useParams();
    return <NewChallengeForm token={getToken()} challengeId={id}/>;
  }

  function ChallengePageWrapper() {
    const { id } = useParams();
    return <ChallengePage token={getToken()} challengeId={id} profileId={localStorage.getItem('profile_id')}/>;
  }

  function ChatWrapper() {
    const { id } = useParams();
    return <Chat chatId={id} />;
  }

  function CommentWrapper() {
    const { wonkId, commentId } = useParams();
    return <Comment token={getToken()} wonkId={wonkId} profileId={localStorage.getItem('profile_id')} commentId={commentId}/>;
  }

  function ProfileWrapper() {
    const { id } = useParams();
    return <Profile token={getToken()} profileId={id} />;
  }

  function WonkWrapper() {
    const { id } = useParams();
    return <Wonk token={getToken()} wonkId={id} profileId={localStorage.getItem('profile_id')}/>;
  }

  function ProfileFormWrapper() {
    return <ProfileForm profileId={localStorage.getItem('profile_id')} />;
  }

  function SelectChatMessage() {
    return <div>Select a chat from the list to view details.</div>;
  }
};

export default App;
