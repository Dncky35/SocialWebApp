
import { AuthProvider } from "./AuthContext";
import { PostProvider } from "./PostContext";

export const AppProviders = ({children}: {children: React.ReactNode}) => {
    return (
        <AuthProvider>
            <PostProvider>
                {children}
            </PostProvider>
        </AuthProvider>
    );

};