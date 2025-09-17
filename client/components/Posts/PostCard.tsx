"use client";
import React, { useState } from 'react';
import { PublicAccount } from '@/schemas/account';
import Link from 'next/link';
import { Comment } from './CommentCard';
import { usePostContext } from '@/context/PostContext';
import { useAuth } from '@/context/AuthContext';
import CommentCreator from './CommentCreator';
import { MessageSquarePlus, Heart } from "lucide-react";

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
  const { likePost, editPost } = usePostContext();
  const { account } = useAuth();
  const [isCommentAdding, setIsCommentAdding] = useState(false);
  const isOwnPost = account && account.id === post.owner.id;
  const [isEditing, setIsEditing] = useState(false);
  const [postContent, setPostContent] = useState<string>(post.content);


  const handleOnLike = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    await likePost(post.id);
  };

  const handleOnSaveEdit = async(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const postForm = {
      content: postContent,
      image_url: post.image_url || undefined,
    };
    const result = await editPost(post.id, postForm);
    setIsEditing(!result);
  };

  return (
    <div className={`${isOwnPost ? "bg-gradient-to-br from-teal-600 to-teal-800" : "bg-gradient-to-br from-teal-700 to-teal-900"} rounded shadow-xl px-4 py-2 hover:scale-[1.01] transform transition duration-300 w-full`}>
      <div className='border-b border-teal-700 py-1 mb-1 flex justify-between items-center'>
        <Link href={`/profile/${post.owner.id}`} className='font-semibold text-lg text-teal-300 cursor-pointer hover:underline'>{post.owner.username}</Link>
        {isOwnPost && (
          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className='cursor-pointer hover:underline'>
            {isEditing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>
      {isEditing ? (
        <div>
          <textarea 
          className='w-full h-32 p-4 rounded-lg bg-teal-50 text-teal-950 shadow-inner resize-none focus:outline-none focus:ring-2 focus:ring-teal-500'
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          />
          <button 
          onClick={(e) => handleOnSaveEdit(e)}
          className='w-full bg-teal-600 hover:bg-teal-500 cursor-pointer text-white font-semibold py-2 rounded transition duration-200'>
            Save
          </button>
        </div>
      ) : (
        <Link href={`/posts/${post.id}`} className='text-xl font-semibold whitespace-pre-wrap break-words mb-2'>
          {post.content}
        </Link>
      )}
      <div className='flex gap-x-2 border-b border-teal-700 py-1 mb-1'>
        {post.tags.map((tag, index) => (
          <div key={index} className="text-sm cursor-pointer hover:underline">
            #{tag}
          </div>
        ))}
      </div>
      <div className='flex items-center justify-between px-2'>
        <div className='flex space-x-4 items-center'>
          <div className='flex items-center gap-x-2 bg-teal-900 rounded-xl px-2 py-1'>
            <p className='text-sm text-teal-300 cursor-default'>{post.likes.length}</p>
            <button
              onClick={(e) => handleOnLike(e)}
              className='hover:scale-[1.1] cursor-pointer transition duration-300 transform'>
              {post.is_liked ? <Heart color={"red"} /> : <Heart />}
            </button>
          </div>
          <div className='flex items-center gap-x-2 bg-teal-900 rounded-xl px-2 py-1'>
            <p className='text-sm text-teal-300 cursor-default'>{post.comments.length}</p>
            <button
              onClick={() => setIsCommentAdding((prev) => !prev)}
              className='hover:scale-[1.1] cursor-pointer transition duration-300 transform'>
              <MessageSquarePlus size={24} />
            </button>
          </div>
        </div>
        <div>
          <p className='text-sm text-teal-300'>Posted on: {new Date(post.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <div className='mt-2 py-2 px-4 border-t border-teal-700'>
        {isCommentAdding && (
          <CommentCreator postID={post.id} />
        )}
      </div>
    </div>
  );
};

export default PostCard;