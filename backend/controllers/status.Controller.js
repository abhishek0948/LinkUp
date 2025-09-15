const { uploadFileToCloudinary } = require("../config/cloudinaryConfig");
const Status = require("../models/Status.Model");
const Message = require("../models/Message.Model");
const response = require("../utils/responseHandler");

const createStatus = async (req, res) => {
  const { content, contentType } = req.body;
  const userId = req.user?.userId;

  try {
    let mediaUrl = null;
    let finalCotentType = contentType || "text";

    const file = req.file;

    if (file) {
      const uploadFile = await uploadFileToCloudinary(file);

      if (!uploadFile?.secure_url) {
        return response(res, 400, "failed to upload media");
      }
      mediaUrl = uploadFile?.secure_url;

      if (file.mimetype.startsWith("image")) {
        finalCotentType = "image";
      } else if (file.mimetype.startsWith("video")) {
        finalCotentType = "video";
      } else {
        return response(res, 400, "unsupported file type");
      }
    } else if (content?.trim()) {
      finalCotentType = "text";
    } else {
      return response(res, 400, "message content is required");
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const status = new Status({
      user: userId,
      content: mediaUrl || content,
      contentType: finalCotentType,
      expiresAt: expiresAt
    });

    await status.save();

    const populatedStatus = await Status.findOne({ _id: status?._id })
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture");

    return response(res, 200, "status uploaded successfully", populatedStatus);
  } catch (error) {
    console.error("error creating status", error);
    return response(res,500,"Internal server error");
  }
};

const getStatus = async (req, res) => {
  try {
    const status = await Status.find({
      expiresAt: {
        $gt: new Date(),
      },
    })
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture")
      .sort({ createdAt: -1 });

    return response(res,200,"fetched status successfully",status);
  } catch (error) {
    console.error("error fetching status",error);
    return response(res,500,"Internal server error");
  }
};

const viewStatus = async (req, res) => {
    try {
        const { statusId } = req.params;
        const userId = req.user?.userId;

        const updatedStatus = await Status.findByIdAndUpdate(
            statusId,
            { $addToSet: { viewers: userId } },  
            { new: true } 
        )
        .populate("user", "username profilePicture")
        .populate("viewers", "username profilePicture");

        if (!updatedStatus) {
            return response(res, 404, "status not found");
        }

        return response(res, 200, "status viewed successfully", updatedStatus);
    } catch (error) {
        console.error("error viewing status", error);
        return response(res, 500, "Internal server error");
    }
};

const deleteStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user?.userId;

    const deletedStatus = await Status.findOneAndDelete({
      _id: statusId,
      user: userId, 
    });

    if (!deletedStatus) {
      return response(res, 404, "Status not found or unauthorized to delete");
    }

    return response(res, 200, "Status deleted successfully", deletedStatus);
  } catch (error) {
    console.error("Error deleting status", error);
    return response(res, 500, "Internal server error");
  }
};

module.exports = {
  createStatus,
  getStatus,
  viewStatus,
  deleteStatus
};
