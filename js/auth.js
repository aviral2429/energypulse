// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');
    const formSignIn = document.getElementById('signInForm');
    const formSignUp = document.getElementById('signUpForm');
    
    // Forms
    const signInEmail = document.getElementById('signInEmail');
    const signInPassword = document.getElementById('signInPassword');
    const btnSignIn = document.getElementById('btnSignIn');
    
    const signUpName = document.getElementById('signUpName');
    const signUpEmail = document.getElementById('signUpEmail');
    const signUpPassword = document.getElementById('signUpPassword');
    const signUpConfirm = document.getElementById('signUpConfirm');
    const btnSignUp = document.getElementById('btnSignUp');
    
    const btnGoogleSignIn = document.getElementById('btnGoogleSignIn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    // Error Elements
    const errors = {
        signInEmail: document.getElementById('signInEmailError'),
        signInPassword: document.getElementById('signInPasswordError'),
        signUpName: document.getElementById('signUpNameError'),
        signUpEmail: document.getElementById('signUpEmailError'),
        signUpPassword: document.getElementById('signUpPasswordError'),
        signUpConfirm: document.getElementById('signUpConfirmError')
    };

    // Tab Switching
    tabSignIn.addEventListener('click', () => {
        tabSignIn.classList.add('active');
        tabSignUp.classList.remove('active');
        formSignIn.classList.add('active');
        formSignUp.classList.remove('active');
    });

    tabSignUp.addEventListener('click', () => {
        tabSignUp.classList.add('active');
        tabSignIn.classList.remove('active');
        formSignUp.classList.add('active');
        formSignIn.classList.remove('active');
    });

    // Validation Functions
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPassword = (password) => password.length >= 6;

    const clearErrors = () => {
        Object.values(errors).forEach(el => {
            if(el) {
                el.classList.remove('show');
                el.textContent = '';
            }
        });
    };

    const showError = (id, message) => {
        if(errors[id]) {
            errors[id].textContent = message;
            errors[id].classList.add('show');
        }
    };

    const setLoading = (button, isLoading) => {
        if(isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    };

    // No auto-redirect or auto-signout on login page.
    // User sees the form, types credentials, submits. Simple.

    // Save user to Firestore
    const saveUserToFirestore = async (user, additionalData = {}) => {
        if (!user) return;
        const userRef = db.collection('users').doc(user.uid);
        
        try {
            const doc = await userRef.get();
            if (!doc.exists) {
                await userRef.set({
                    name: additionalData.name || user.displayName || 'User',
                    email: user.email,
                    photoURL: user.photoURL || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                await userRef.update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error saving user to Firestore', error);
        }
    };

    // Sign Up
    formSignUp.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const name = signUpName.value.trim();
        const email = signUpEmail.value.trim();
        const password = signUpPassword.value;
        const confirm = signUpConfirm.value;
        
        let hasError = false;
        
        if(!name) { showError('signUpName', 'Please enter your name'); hasError = true; }
        if(!isValidEmail(email)) { showError('signUpEmail', 'Please enter a valid email'); hasError = true; }
        if(!isValidPassword(password)) { showError('signUpPassword', 'Password must be at least 6 characters'); hasError = true; }
        if(password !== confirm) { showError('signUpConfirm', 'Passwords do not match'); hasError = true; }
        
        if(hasError) return;
        
        setLoading(btnSignUp, true);
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            // Update profile with name
            await userCredential.user.updateProfile({
                displayName: name
            });
            await saveUserToFirestore(userCredential.user, { name });
            window.location.href = 'dashboard.html';
        } catch (error) {
            showError('signUpEmail', error.message);
            setLoading(btnSignUp, false);
        }
    });

    // Sign In
    formSignIn.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();
        
        const email = signInEmail.value.trim();
        const password = signInPassword.value;
        
        let hasError = false;
        
        if(!isValidEmail(email)) { showError('signInEmail', 'Please enter a valid email'); hasError = true; }
        if(!isValidPassword(password)) { showError('signInPassword', 'Password must be at least 6 characters'); hasError = true; }
        
        if(hasError) return;
        
        setLoading(btnSignIn, true);
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            await saveUserToFirestore(userCredential.user);
            window.location.href = 'dashboard.html';
        } catch (error) {
            showError('signInEmail', 'Invalid email or password.');
            setLoading(btnSignIn, false);
        }
    });

    // Google Sign In
    btnGoogleSignIn.addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const userCredential = await auth.signInWithPopup(provider);
            await saveUserToFirestore(userCredential.user);
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Google sign in error', error);
            alert('Failed to sign in with Google: ' + error.message);
        }
    });

    // Forgot Password
    forgotPasswordLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = signInEmail.value.trim();
        if(!isValidEmail(email)) {
            showError('signInEmail', 'Please enter your email address to reset password');
            return;
        }
        try {
            await auth.sendPasswordResetEmail(email);
            alert('Password reset email sent! Check your inbox.');
        } catch (error) {
            showError('signInEmail', error.message);
        }
    });
});
