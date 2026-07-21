const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadImage = async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded"
            });
        }

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "ANVYRA"
            },
            (error, result) => {

                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: error.message
                    });
                }

                res.status(200).json({
                    success: true,
                    image: result.secure_url,
                    public_id: result.public_id
                });

            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = { uploadImage };