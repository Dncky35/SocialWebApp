"use client";
import React, { useState } from 'react';
import { PublicAccount } from '@/schemas/account';
import Link from 'next/link';
import { Comment } from './Comment';
import { usePostContext } from '@/context/PostContext';
import CommentCreator from './CommentCreator';

export interface Post {
  id: string;
  content: string;
  image_url: string;
  tags: string[];
  likes: string[];
  is_liked?: boolean;
  comments: Comment[]; // CREATE A SCHEMA FOR COMMENT AND USE HERE AS TYPE
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  owner: PublicAccount;
};

interface PostProps {
  post: Post;
};

const PostCard: React.FC<PostProps> = ({ post }) => {
  const { likePost, error, isLoading } = usePostContext();
  const [ isCommentAdding, setIsCommentAdding ] = useState(false);
  
  const handleOnLike = async( e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const result = await likePost(post.id);

    if(result){
      console.log(JSON.stringify(result));
    }
  };
  
  return (
    <div className='bg-emerald-900 rounded shadow-xl mb-4 px-4 py-2'>
      <div className='border-b border-emerald-700 py-1 mb-1'>
        <Link href={`/profile/${post.owner.username}`} className='font-semibold text-lg text-emerald-300 cursor-pointer hover:underline'>{post.owner.username}</Link>
      </div>
      <div className='text-xl font-semibold whitespace-pre-wrap break-words mb-2'>
        {post.content}
      </div>
      <div className='flex gap-x-2 border-b border-emerald-700 py-1 mb-1'>
        {post.tags.map((tag, index) => (
        <div key={index} className="text-sm cursor-pointer hover:underline">
          #{tag}
        </div>
      ))}
      </div>
      <div className='flex items-center justify-between px-2'>
        <div className='flex space-x-4 items-center'> 
          <Link href={`/profile/${post.owner.username}`} className='text-sm text-emerald-300 hover:underline cursor-pointer'>{post.likes.length}</Link>
          <button
          onClick={(e) => handleOnLike(e)} 
          className='bg-emerald-600 text-white px-1 py-1 cursor-pointer rounded-full hover:bg-emerald-700 transition duration-300'>
            {post.is_liked ? "❤️" : "🤍"}
          </button>
          <Link href={"/posts/" + post.id + "/comments"} className='text-sm text-emerald-300 hover:underline cursor-pointer'>{post.comments.length}</Link>
          <button 
          onClick={() => setIsCommentAdding((prev) => !prev)}
          className='bg-emerald-600 text-white px-1 py-1 cursor-pointer rounded-full hover:bg-emerald-700 transition duration-300'>
            ✍
            </button>
        </div>
        <div>
          <p className='text-sm text-emerald-300'>Posted on: {new Date(post.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <div className='mt-2 py-2 px-4 border-t border-emerald-700'>
        {isCommentAdding &&(
          <CommentCreator postID={post.id} />
        )}
      </div>
    </div>
  );
};

export default PostCard;