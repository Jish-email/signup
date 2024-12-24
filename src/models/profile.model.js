import mongoose from 'mongoose';
const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // Ensure a user reference is mandatory
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        default: "",
    },
    profilepic: {
        type: String,
        default: ""
    },
    about: {
        type: String,
        default: ""
    },
    dob: {
        type: String,
        default: ""
    },
    hobbies: {
        type: [String],
        default: []
    },
    favmovies: {
        type: [String],
        default: []
    }
});


export const Profile = mongoose.model('Profile', profileSchema);

