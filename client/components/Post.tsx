import React from 'react';

export interface Post {
  _id: string;
  author_id: string;
  content: string;
  image_url: string;
  likes: string[];
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

interface PostProps {
  post: Post;
};

const PostCard: React.FC<PostProps> = ({ post }) => {
  return (
    <div className="bg-emerald-900 text-white p-4 rounded-xl shadow-md mb-4">
      <div className="text-sm text-emerald-300 mb-2 flex justify-between items-center">
        Posted on {new Date(post.created_at).toLocaleString()}{" / "}
        Posted by: {post.author_id}
      </div>
      <div className="text-lg font-semibold mt-2 whitespace-pre-wrap break-words">
        {post.content}
      </div>
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="mt-3 rounded-lg max-h-60 object-cover w-full"
        />
      )}
      <div className="mt-3 text-sm text-emerald-400 flex justify-between items-center">
        <p>{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</p>
        <div className='flex gap-2 justify-between items-center'>
            <button className='bg-emerald-400 cursor-pointer py-1 px-2 rounded-lg text-white hover:bg-emerald-500 transition-colors duration-300 ease-in-out'>
                Like</button>
            <button className='bg-emerald-400 cursor-pointer py-1 px-2 rounded-lg text-white hover:bg-emerald-500 transition-colors duration-300 ease-in-out'>
                Bookmark</button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;