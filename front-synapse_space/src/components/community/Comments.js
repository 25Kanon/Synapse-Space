import React, { useState } from 'react';
import { CommentSection } from 'react-comments-section';
import 'react-comments-section/dist/index.css';

const App = () => {
    const [data, setData] = useState([ ]);

    const onSubmitAction = (data) => {
        console.log('this comment was posted!', data);
    };

    const customNoComment = () => <div className='no-com'>No comments wohoooo!</div>;

    return (
        <CommentSection
            currentUser={{
                currentUserId: '01a',
                currentUserImg: 'https://ui-avatars.com/api/name=Riya&background=random',
                currentUserProfile: 'https://www.linkedin.com/in/riya-negi-8879631a9/',
                currentUserFullName: 'Riya Negi'
            }}
            commentData={data}
            onSubmitAction={(data) => onSubmitAction(data)}
            customNoComment={customNoComment}
            placeholder={"Write a comment..."}
            logIn={{
                onLogin: () => alert("Call login function"),
                signupLink: 'http://localhost:3001/'
            }}
        />
    );
};

export default App;
