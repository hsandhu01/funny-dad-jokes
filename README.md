# Funny Dad Jokes Extravaganza

A modern, interactive web application for sharing, rating, and enjoying dad jokes. Built with React, TypeScript, and Firebase.

## 🚀 Features

- Browse a vast collection of dad jokes
- Filter jokes by categories
- Rate jokes and see average ratings
- Submit your own dad jokes
- Daily featured "Joke of the Day"
- User authentication (Google and Email/Password)
- Dark mode for late-night joking
- Responsive design for mobile and desktop

## 🔧 Technologies Used

- React 18
- TypeScript
- Firebase (Firestore & Authentication)
- React Router for navigation
- Redux Toolkit for state management
- Styled-components for styling
- React Bootstrap for UI components
- PWA features for offline support

## 🚀 Getting Started

1. Clone the repository:
    \`\`\`bash
    git clone https://github.com/hsandhu01/funny-dad-jokes.git
    \`\`\`

2. Install dependencies:
    \`\`\`bash
    cd funny-dad-jokes
    npm install
    \`\`\`

3. Create a \`.env\` file in the root directory and add your Firebase configuration:
    \`\`\`env
    REACT_APP_FIREBASE_API_KEY=your_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
    REACT_APP_FIREBASE_PROJECT_ID=your_project_id
    REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    REACT_APP_FIREBASE_APP_ID=your_app_id
    \`\`\`

4. Start the development server:
    \`\`\`bash
    npm start
    \`\`\`

## 📁 Project Structure

\`\`\`plaintext
src/
├── components/
│   ├── JokeDisplay.tsx
│   ├── JokeSubmissionForm.tsx
│   └── ...
├── pages/
│   ├── Home.tsx
│   ├── Profile.tsx
│   └── ...
├── hooks/
├── services/
│   └── firebase.ts
├── store/
├── styles/
├── types/
├── utils/
└── App.tsx
\`\`\`

## 🔜 Upcoming Features

- [ ] Email/Password authentication
- [ ] User profiles
- [ ] Joke search functionality
- [ ] Social media sharing
- [ ] Leaderboard for top-rated jokes
- [ ] Animated transitions and interactions
- [ ] PWA implementation

## 🤝 Contributing

We welcome contributions to the Funny Dad Jokes Extravaganza! Please follow these steps:

1. Fork the repository
2. Create a new branch: \`git checkout -b feature-name\`
3. Make your changes and commit them: \`git commit -m 'Add some feature'\`
4. Push to the branch: \`git push origin feature-name\`
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License.

## 📞 Contact

If you have any questions or suggestions, please open an issue or contact me at Me@harrysandhu.tech.

Happy joking! 😄

