import React, { useState } from "react";
import { usePostContext, tagList } from "@/context/PostContext";
import LoadingComponent from "../Loading";

export interface PostCreationForm {
  content: string;
  image_url?: string;
  tags?: string[];
}

const PostCreator: React.FC = () => {
  const { isLoading, createPost } = usePostContext();
  const [isExtended, setIsExtended] = useState(false);
  const [isAddTag, setIsAddTag] = useState(false);
  const [isAddImage, setIsAddImage] = useState(false);
  const [postForm, setPostForm] = useState<PostCreationForm>({
    content: "",
    image_url: "",
    tags: [],
  });
  const [tag, setTag] = useState("");

  const handleOnContentChange = (value: string) => {
    setPostForm((prev) => ({ ...prev, content: value }));
  };

  const handleOnTagSelected = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (postForm.tags && postForm.tags.length > 2) return;
    const value = (e.target as HTMLInputElement).value;
    if (postForm.tags?.includes(value)) return;

    setPostForm((prev) => ({ ...prev, tags: [...(prev.tags || []), value] }));
    setTag("");
  };

  const handleTagRemove = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const value = (e.target as HTMLButtonElement).value;
    setPostForm((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== value),
    }));
  };

  const handleOnPublish = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    await createPost(postForm.content, postForm.tags, postForm.image_url);
  };

  return (
    <div className="bg-slate-950/70 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl w-full max-w-xl mx-auto border border-slate-800">
      {/* {isLoading && <LoadingComponent />}} */}

      <div className="flex justify-between items-center mb-4">
        <label htmlFor="post" className="text-gray-100 font-semibold text-lg">
          Share your thoughts:
        </label>
        <button
          onClick={() => setIsExtended((prev) => !prev)}
          aria-label={isExtended ? "Collapse post input" : "Expand post input"}
          className={`cursor-pointer hover:scale-110 transform transition-transform duration-300 ease-in-out text-gray-100 text-xl select-none`}
          style={{ rotate: isExtended ? "180deg" : "0deg" }}
        >
          ▼
        </button>
      </div>

      {isExtended && (
        <div className="space-y-4">
          {/* Textarea */}
          <div className="bg-slate-900/70 p-2 rounded-xl shadow-inner">
            <textarea
              id="post"
              name="post"
              className="w-full h-32 p-4 rounded-xl bg-slate-800 text-gray-100 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="What's on your mind?"
              maxLength={500}
              value={postForm.content}
              onChange={(e) => handleOnContentChange(e.target.value)}
            />

            {/* Tags */}
            <div className="flex flex-col gap-y-2 mt-2">
              <ul className="flex flex-wrap gap-2 text-sm">
                {postForm.tags?.map((tag, index) => (
                  <li
                    key={index}
                    className="bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-between p-2 rounded-xl text-white shadow-md"
                  >
                    <p>{tag}</p>
                    <button
                      value={tag}
                      className="bg-slate-800 text-white hover:bg-slate-700 cursor-pointer rounded ml-2 px-1 text-sm"
                      onClick={handleTagRemove}
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex gap-x-2 text-sm mt-2">
                <button
                  onClick={() => {
                    setIsAddTag((prev) => !prev);
                    setIsAddImage(false);
                  }}
                  className="bg-gradient-to-br from-cyan-500 to-violet-500 text-white cursor-pointer rounded-xl py-2 px-4 hover:shadow-lg hover:scale-105 transition"
                >
                  Add Tag(s)
                </button>
                <button
                  onClick={() => {
                    setIsAddImage((prev) => !prev);
                    setIsAddTag(false);
                  }}
                  className="bg-slate-800 text-gray-100 rounded-xl py-2 px-4 cursor-not-allowed opacity-50"
                  disabled
                >
                  Add Image
                </button>
              </div>
            </div>
          </div>

          {/* Tag Selection */}
          {isAddTag && (
            <div className="grid grid-cols-4 gap-3 mt-2">
              {tagList
                .filter((t) => t !== "")
                .map((tag, index) => (
                  <button
                    key={index}
                    value={tag}
                    onClick={handleOnTagSelected}
                    className="bg-gradient-to-br from-cyan-400 to-violet-500 text-white p-2 rounded-xl shadow-md hover:scale-105 hover:-translate-y-0.5 transition duration-300"
                  >
                    {tag}
                  </button>
                ))}
            </div>
          )}

          {/* Publish */}
          <button
            onClick={handleOnPublish}
            className="w-full bg-gradient-to-br from-cyan-500 to-violet-500 text-white cursor-pointer rounded-xl py-2 hover:shadow-lg hover:scale-105 transition"
          >
            Publish
          </button>
        </div>
      )}
    </div>
  );
};

export default PostCreator;
