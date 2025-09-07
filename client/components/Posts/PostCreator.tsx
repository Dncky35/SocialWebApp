import React, { useState} from "react";
import { usePostContext, tagList } from "@/context/PostContext";
import LoadingComponent from "../Loading";

export interface PostCreationForm {
    content: string,
    image_url?: string,
    tags?: string[],
};

const PostCreator:React.FC = () => {
    const { isLoading, createPost } = usePostContext();
    const [ isExtended, setIsExtended ] = useState(false);
    const [ isAddTag, setIsAddTag ] = useState(false);
    const [ isAddImage, setIsAddImage ] = useState(false);
    const [postForm, setPostForm] = useState<PostCreationForm>({
        content: "",
        image_url: "",
        tags: [],
    });
    // @typescript-eslint/no-unused-vars
    const [tag, setTag] = useState("");
    // const [tagSuggestion, setTagSuggestion] = useState<string | null>(null);

    const handleOnContentChange = (value:string) => {
        setPostForm((prev) => {
            return {
                ...prev,
                content: value,
            };
        });
    };

    const handleOnImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const file = e.target.files?.[0];
        if(!file)
            return;
    }

    const handleOnTagSelected = ( e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if(postForm.tags && postForm.tags.length > 2)
            return;
        const value = (e.target as HTMLInputElement).value;

        if(postForm.tags?.includes(value)){
            return
        }

        setPostForm((prev) => ({
            ...prev,
            tags: [...(prev.tags || []), value],
        }));
        setTag("");
    };

    const handleTagRemove = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const value = (e.target as HTMLButtonElement).value;

        setPostForm((prev) => {
            const updatedTags = prev.tags?.filter((tag) => tag !== value);
            return {
                ...prev,
                tags: updatedTags,
            };
        });

    };


    const handleOnPublish = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        await createPost(postForm.content, postForm.tags, postForm.image_url);
    };

    return(
        <div className="bg-gradient-to-b from-teal-700 to-teal-900 px-6 py-2 rounded-xl shadow-xl w-full max-w-xl mx-auto">
            {isLoading && (
               <LoadingComponent />
            )}
            <div className="flex justify-between items-center mb-4">
                <label
                htmlFor="post"
                className="text-white font-semibold text-lg"
                >
                Share your thoughts:
                </label>
                <button
                onClick={() => setIsExtended((prev) => !prev)}
                aria-label={isExtended ? "Collapse post input" : "Expand post input"}
                className={`cursor-pointer hover:scale-110 transform transition-transform duration-300 ease-in-out text-white text-xl select-none`}
                style={{ rotate: isExtended ? "180deg" : "0deg" }}
                >
                ▼
                </button>
            </div>

            {isExtended && (
                <div className="space-y-4">
                    <div className="bg-teal-800 p-2 rounded-lg shadow-inner">
                        <textarea  id="post"
                            name="post"
                            className="w-full h-32 p-4 rounded-lg 
                            bg-teal-100 text-teal-950 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="What's on your mind?"
                            maxLength={500}
                            value={postForm.content}
                            onChange={(e) => handleOnContentChange(e.target.value)}
                        />
                        <div className="flex flex-col gap-y-2">
                            <ul className="flex items-center flex-wrap gap-2 text-sm">
                                {postForm.tags?.map((tag, index) => (
                                <li key={index} className="bg-teal-500 flex items-center justify-between p-2 rounded-lg text-white">
                                    <p>{tag}</p>
                                    <button 
                                    value={tag}
                                    className="bg-teal-800 text-white hover:bg-teal-700 cursor-pointer rounded ml-2 px-1 text-teal-200" 
                                    onClick={(e) => handleTagRemove(e)}>X</button>
                                </li>
                                ))}
                            </ul>
                            <div className="flex gap-x-2 text-sm">
                                <button onClick={() => {setIsAddTag((prev) => !prev); setIsAddImage(false);}}
                                className="bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-500 
                                text-white cursor-pointer rounded py-2 px-2 hover:shadow-lg transition duration-300 hover:scale-105"  >
                                    Add Tag(s)
                                </button>
                                <button onClick={() => {setIsAddImage((prev) => !prev); setIsAddTag(false);}} 
                                className="bg-teal-900 rounded py-2 hover:bg-teal-900 px-2" disabled={true} >
                                    Add Image
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        {isAddTag && (
                            <div>
                                <div className="grid grid-cols-4 gap-3 ">
                                    {tagList.map((tag, index) => {

                                        if(tag !== "")
                                            return(
                                                <button value={tag} 
                                                onClick={(e) => handleOnTagSelected(e)}
                                                className="bg-gradient-to-b from-teal-500 to-teal-700 p-2 rounded shadow-xl text-sm hover:bg-gradient-to-t hover:scale-110 
                                                hover:-translate-y-1 transition duration-300" key={index}>
                                                    {tag}
                                                </button>
                                            )
                                    })}
                                </div>
                            </div>
                        )}      
                        {isAddImage && (
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-sm text-teal-900 bg-teal-50 rounded-lg cursor-pointer 
                                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-700 file:text-white hover:file:bg-teal-600 file:cursor-pointer"
                                onChange={(e) => handleOnImageChange(e)}
                            />
                        )}      
                    </div>
                    <button onClick={handleOnPublish} 
                    className="w-full bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-500 
                    text-white cursor-pointer rounded py-2 hover:shadow-lg transition duration-300 hover:scale-105" >
                        Publish
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostCreator;