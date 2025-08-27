import React, { useState} from "react";
import { usePostContext, tagList } from "@/context/PostContext";
import LoadingComponent from "./Loading";

export interface PostCreationForm {
    content: string,
    image_url?: string,
    tags?: string[],
};

const PostCreator:React.FC = () => {
    const [ isExtended, setIsExtended ] = useState(false);
    const [ isAddTag, setIsAddTag ] = useState(false);
    const [ isAddImage, setIsAddImage ] = useState(false);
    const [postForm, setPostForm] = useState<PostCreationForm>({
        content: "",
        image_url: "",
        tags: [],
    });
    const [tag, setTag] = useState("");
    const [tagSuggestion, setTagSuggestion] = useState<string | null>(null);
    const { isLoading, createPost } = usePostContext();

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

    const handleOnTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTag(value);

        // Suggest closest tag (simple filter)
        if(value.length > 0){
            const suggestion = tagList.find((tag) => tag.toLowerCase().startsWith(value.toLowerCase()));
            setTagSuggestion(suggestion || null);
        } else {
            setTagSuggestion(null)
        }
    };

    const handleSuggestionClick = () => {
        if(!tagSuggestion)
            return;

        if(postForm.tags?.includes(tagSuggestion)){
            setTag("");
            setTagSuggestion(null);
            return;
        }

        setPostForm((prev) => ({
            ...prev,
            tags: [...(prev.tags || []), tagSuggestion],
        }));
        setTag("");
        setTagSuggestion(null);
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
        <div className="bg-gradient-to-b from-emerald-700 to-emerald-900 px-6 py-2 rounded-xl shadow-xl w-full max-w-xl mx-auto">
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
                    <div className="bg-emerald-800 p-2 rounded-lg shadow-inner">
                        <textarea  id="post"
                            name="post"
                            className="w-full h-32 p-4 rounded-lg 
                            bg-emerald-100 text-emerald-950 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="What's on your mind?"
                            maxLength={500}
                            value={postForm.content}
                            onChange={(e) => handleOnContentChange(e.target.value)}
                        />
                        <div className="flex flex-col gap-y-2">
                            <ul className="flex items-center flex-wrap gap-2 text-sm">
                                {postForm.tags?.map((tag, index) => (
                                <li key={index} className="bg-emerald-500 flex items-center justify-between p-2 rounded-lg text-white">
                                    <p>{tag}</p>
                                    <button 
                                    value={tag}
                                    className="bg-emerald-800 text-white hover:bg-emerald-700 cursor-pointer rounded ml-2 px-1 text-emerald-200" 
                                    onClick={(e) => handleTagRemove(e)}>X</button>
                                </li>
                                ))}
                            </ul>
                            <div className="flex gap-x-2 text-sm">
                                <button onClick={() => {setIsAddTag((prev) => !prev); setIsAddImage(false);}}
                                className="bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 
                                text-white cursor-pointer rounded py-2 px-2 hover:shadow-lg transition duration-300 hover:scale-105"  >
                                    Add Tag(s)
                                </button>
                                <button onClick={() => {setIsAddImage((prev) => !prev); setIsAddTag(false);}} 
                                className="bg-emerald-900 rounded py-2 hover:bg-emerald-900 px-2" disabled={true} >
                                    Add Image
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        {isAddTag && (
                            <div>
                                <input
                                    className="text-sm bg-emerald-50 text-emerald-950 w-full rounded px-2 py-2"
                                    type="text"
                                    value={tag}
                                    onChange={handleOnTagChange}
                                />
                                {tagSuggestion && (
                                    <div
                                    className="bg-emerald-600 p-2 mt-1 cursor-pointer rounded hover:bg-emerald-700"
                                    onClick={handleSuggestionClick}
                                    >
                                    <p><strong>{tagSuggestion}</strong></p>
                                    </div>
                                )}
                                
                            </div>
                        )}      
                        {isAddImage && (
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-sm text-emerald-900 bg-emerald-50 rounded-lg cursor-pointer 
                                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-700 file:text-white hover:file:bg-emerald-600 file:cursor-pointer"
                                onChange={(e) => handleOnImageChange(e)}
                            />
                        )}      
                    </div>
                    <button onClick={handleOnPublish} 
                    className="w-full bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 
                    text-white cursor-pointer rounded py-2 hover:shadow-lg transition duration-300 hover:scale-105" >
                        Publish
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostCreator;