export const generateRandomUser = () => {
    const timestamp = Date.now();
    return {
        fullName: `Test User ${timestamp}`,
        email: `testuser${timestamp}_${Math.floor(Math.random() * 1000)}@example.com`,
        password: 'Password123!',
    };
};
