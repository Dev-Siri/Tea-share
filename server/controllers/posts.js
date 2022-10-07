import mongoose from "mongoose";
import PostModel from "../models/postsModel";

export const getPosts = async (req, res) => {
  const { limit } = req.query;

  try {
    let posts;

    if (limit) {
      posts = await PostModel.find().limit(parseInt(`${limit}`));
    } else {
      posts = await PostModel.find();
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPostsBySearchTerm = async (req, res) => {
  const { query, user } = req.query;

  try {
    const findObject = user === "true" ? [{ author: query }] : [{ _id: query }];

    const posts = await PostModel.find({ $or: findObject });

    res.json(posts);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  const post = req.body;

  const newPost = new PostModel({
    ...post,
    createdAt: new Date().toISOString()
  });

  try {
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  const { name, image } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("No posts with that ID");

  const post = await PostModel.findById(id);

  const alreadyLiked = post?.people?.includes(`${name}`);

  if (alreadyLiked) return res.status(304);

  post?.people?.push(`${name}`);
  post?.peopleImage?.push(`${image}`);

  const updatedPost = await PostModel.findByIdAndUpdate(id, post, {
    new: true
  });

  res.json(updatedPost);
};
