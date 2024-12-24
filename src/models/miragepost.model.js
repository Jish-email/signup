import mongoose from 'mongoose';

const miragePostSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true })

export const MiragePost = mongoose.model('MiragePost', miragePostSchema)