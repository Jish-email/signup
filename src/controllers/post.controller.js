import { AsyncHandler } from "../utils/Asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/users.model.js";
import { Profile } from "../models/profile.model.js";
import { MiragePost } from "../models/miragepost.model.js";

const postcreate = AsyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user._id;
    

    if (!content) {
        throw new ApiError(400, 'Please provide content');
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const profile = await Profile.findOne({ user: user._id });
    if (!profile) {
        throw new ApiError(404, 'Profile not found');
    }

    const post = await Post.create({
        content: content,
        user: user._id,
        profile: profile._id,  // Linking the profile to the post
    });

    const response = new ApiResponse('Post created successfully', { post });
    res.status(201).json(response);
});


const postget = AsyncHandler(async (req, res) => {
    const posts = await Post.find()
        .populate({
            path: 'user',
            select: 'Y_id email',
        })
        .populate({
            path: 'profile',
            select: 'firstname lastname  profilepic ',
        })
        .sort({ createdAt: -1 });

    if (!posts) {
        return res.status(404).json({ success: false, message: 'No posts found' });
    }

    const apiResponse = new ApiResponse(200, posts, "Post sent successfully");
    return res.status(200).json(apiResponse);
    
});


const createmiragepost = AsyncHandler(async(req,res)=>{
  const { content } = req.body;
  
  if (!content) {
      throw new ApiError(400, 'Please provide content');
  }

  const Miragepost = await MiragePost.create({
      content: content,
  });

  const response = new ApiResponse('Post created successfully', { Miragepost });
  res.status(201).json(response);

})

const getmiragepost = AsyncHandler(async(req,res)=>{
  const Mirageposts = await MiragePost.find()
        .sort({ createdAt: -1 });

    if (!Mirageposts) {
        return res.status(404).json({ success: false, message: 'No posts found' });
    }

    const apiResponse = new ApiResponse(200, Mirageposts, "Post sent successfully");
    return res.status(200).json(apiResponse);
  
})


export { postcreate, postget ,createmiragepost ,getmiragepost};