import { AsyncHandler } from "../utils/Asynchandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.model.js";
import { Profile } from "../models/profile.model.js";



const createprofile = AsyncHandler(async (req, res, next) => {
    const { firstname, lastname, bio, about, dob, hobbies, favmovies } = req.body;
    const user_id = req.user._id;
    

    
    let dateObject = null;
    if (dob) {
        const [day, month, year] = dob.split("/");
        dateObject = new Date(`${year}-${month}-${day}`);
    }

    const user = await User.findById(user_id);
    if (!user) {
        return next(new ApiError(404, "User not found"));
    }

    let profilepicpath = req.file?.path;
    if (profilepicpath) {
        const profile_pic = await uploadOnCloudinary(profilepicpath);
        if (!profile_pic) {
            return next(new ApiError(500, "Profile picture upload failed"));
        }

        profilepicpath = profile_pic.secure_url;
    }

    // Create profile
    const createdprofile = await Profile.create({
        firstname,
        lastname,
        bio,
        profilepic: profilepicpath || null,
        about,
        dob: dateObject || null,
        hobbies,
        favmovies,
        user: user._id,
    });

    if (!createdprofile) {
        return next(new ApiError(500, "Profile creation failed"));
    }

    // Send a success response
    res.status(201).json({
        success: true,
        message: "Profile created successfully",
        profile: {
            id: createdprofile._id,
            firstname: createdprofile.firstname,
            lastname: createdprofile.lastname,
            bio: createdprofile.bio,
            profilepic: createdprofile.profilepic,
            about: createdprofile.about,
            dob: createdprofile.dob,
            hobbies: createdprofile.hobbies,
            favmovies: createdprofile.favmovies,
        },
    });
});
    

const editprofile = AsyncHandler(async (req, res, next) => {
    try {
        const { firstname, lastname, bio, about, dob, hobbies, favmovies } = req.body;
        const user_id = req.user._id;

        if (!user_id) {
            return next(new ApiError(400, "User ID is required"));
        }

        let user = await User.findById(user_id);
        if (!user) {
            user = new User({ _id: user_id }); 
            await user.save();
        }

        let profile_user = await Profile.findOne({ user: user._id });
        if (!profile_user) {
            profile_user = new Profile({ user: user._id });
        }

        let profile_pic_url = profile_user.profilepic;
        if (req.file?.path) {
            const uploadedPic = await uploadOnCloudinary(req.file.path);
            if (!uploadedPic) {
                return next(new ApiError(500, "Profile picture upload failed"));
            }
            profile_pic_url = uploadedPic.secure_url;
        }

        const hobbiesArray = Array.isArray(hobbies) ? hobbies : (hobbies ? [hobbies] : []);
        const favmoviesArray = Array.isArray(favmovies) ? favmovies : (favmovies ? [favmovies] : []);

        profile_user.firstname = firstname || profile_user.firstname;
        profile_user.lastname = lastname || profile_user.lastname;
        profile_user.bio = bio || profile_user.bio;
        profile_user.profilepic = profile_pic_url;
        profile_user.about = about || profile_user.about;
        profile_user.dob = dob || profile_user.dob;
        profile_user.hobbies = hobbiesArray;
        profile_user.favmovies = favmoviesArray;

        await profile_user.save();

        res.status(200).json(
            new ApiResponse(200, "Profile updated successfully", {
                id: profile_user._id,
                firstname: profile_user.firstname,
                lastname: profile_user.lastname,
                bio: profile_user.bio,
                profilepic: profile_user.profilepic,
                about: profile_user.about,
                dob: profile_user.dob,
                hobbies: profile_user.hobbies,
                favmovies: profile_user.favmovies,
            })
        );
    } catch (error) {
        next(error); 
    }
});


const showprofile = AsyncHandler(async (req, res) => {
    const { _id } = req.params;


    if (!_id) {
        return res.status(400).json({ message: " _id  is required" });
    }

    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const profile = await Profile.findOne({ user: user._id });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Send successful response
        return res.status(200).json({
            message: "Profile fetched successfully",
            data: {
                id: profile._id,
                firstname: profile.firstname,
                lastname: profile.lastname,
                bio: profile.bio,
                profilepic: profile.profilepic,
                about: profile.about,
                dob: profile.dob,
                hobbies: profile.hobbies,
                favmovies: profile.favmovies,
                Y_id: user.Y_id,
            },
        });
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
});


const showuserprofile = AsyncHandler(async (req, res) => {

    const Y_id = req.user.Y_id;
    

    // Validate _id or Y_id
    if (!Y_id) {
        return res.status(400).json({ message: " _id  is required" });
    }

    try {
        // Find the user using Y_id or _id
        const user = await User.findOne({ Y_id });   // Search by _id

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch the profile associated with the user
        const profile = await Profile.findOne({ user: user._id });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Send successful response
        return res.status(200).json({
            message: "Profile fetched successfully",
            data: {
                id: profile._id,
                firstname: profile.firstname,
                lastname: profile.lastname,
                bio: profile.bio,
                profilepic: profile.profilepic,
                about: profile.about,
                dob: profile.dob,
                hobbies: profile.hobbies,
                favmovies: profile.favmovies,
                Y_id: user.Y_id,
            },
        });
    } catch (error) {
        console.error("Error fetching profile:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
});

const allprofile = AsyncHandler(async (req, res) => {

    const allprofile = await Profile.find()
        .populate({
            path: 'user',
            select: 'Y_id email',
        })
        .sort({ createdAt: -1 });

    if (!allprofile) {
        throw new ApiError(400, "profiles not found")
    }

    res.status(200).json({
        message: "profiles fetch succfully ",
        data: allprofile
    })

})


export { editprofile, showprofile, createprofile, showuserprofile, allprofile };