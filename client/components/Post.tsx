import React from 'react';
import { PublicAccount } from '@/schemas/account';

export interface Post {
  id: string;
  content: string;
  image_url: string;
  tags: string[];
  likes: string[];
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  owner: PublicAccount;
};

interface PostProps {
  post: Post;
};

const PostCard: React.FC<PostProps> = ({ post }) => {
  return (
    <div className='bg-emerald-900 rounded shadow-xl mb-4 px-4 py-2'>
      <div className='font-semibold text-lg text-emerald-300 cursor-pointer hover:underline'>{post.owner.username}</div>
      <hr className='mb-2'></hr>
      <div className='text-xl font-semibold whitespace-pre-wrap break-words mb-2'>
        {post.content}
      </div>
      <div className='flex gap-x-2'>{post.tags.map((tag, index) => (
        <div key={index} className="text-sm cursor-pointer hover:underline">
          #{tag}
        </div>
      ))}
      </div>
    </div>
  );
};

export default PostCard;