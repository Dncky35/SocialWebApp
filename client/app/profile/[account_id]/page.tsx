import useRedirect from "@/hooks/useRedirect";

const ProfilePage:React.FC = () => {
    useRedirect("home");
    return(
        <div></div>
    )
}

export default ProfilePage;