import React, { useState } from 'react';
import './app.css';
import firebase from 'firebase/compat/app';
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useRef } from 'preact/hooks';

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAyG0CUJzY5PNO4Eil7AFpR4V0lMyYyvRM",
  authDomain: "chatapp-b5183.firebaseapp.com",
  projectId: "chatapp-b5183",
  storageBucket: "chatapp-b5183.firebasestorage.app",
  messagingSenderId: "339418770639",
  appId: "1:339418770639:web:db408686b21fade8c2dbba",
  measurementId: "G-HGW641CJ0Z",
});

// Firebase Authentication and Firestore instances
const auth = firebase.auth();
const firestore = firebase.firestore();

export function App() {
  const [user] = useAuthState(auth);

  return (
    <>
      <div className="App">
        <header>
          <h1>Chat App</h1>
          <SignOut />
        </header>
        <section>
          {user ? <ChatRoom /> : <SignIn />}
        </section>
      </div>
    </>
  );
}

// SignIn Component
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

// SignOut Component
function SignOut() {
  return (
    auth.currentUser && (
      <button onClick={() => auth.signOut()}>Sign Out</button>
    )
  );
}

// ChatRoom Component
function ChatRoom() {
  // Reference to the "messages" collection
  const dummy=useRef()
  const messagesRef = firestore.collection('messages'); // Collection ID is "messages"
  const query = messagesRef.orderBy('createdAt').limit(25); // Query for latest 25 messages

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid,photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior:'smooth'})
  };

  return (
    <>
      <main>
        {messages && messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

// ChatMessage Component
function ChatMessage(props) {
  const { text, uid,photoURL } = props.message || {};
  const messageClass=uid===auth.currentUser.uid?'sent':'received';
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="" />
      <p>{text}</p>
    </div>
  )
}

export default App;
