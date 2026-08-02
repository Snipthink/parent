/* ============================================================
   IMAGE SETTINGS
   Documents the recommended specification for every image
   used on the website. See images/README-images.txt for a
   human-readable explanation.
   ============================================================ */
const imageSettings = {

    doctor: {
        required_width: 800,
        required_height: 1000,
        aspect_ratio: "4:5",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        recommended_format: "webp",
        max_file_size_kb: 500,
        object_fit: "cover"
    },

    logo: {
        required_width: 512,
        required_height: 512,
        aspect_ratio: "1:1",
        allowed_formats: ["png", "webp", "svg"],
        recommended_format: "png",
        max_file_size_kb: 300,
        object_fit: "contain"
    },

    favicon: {
        required_width: 512,
        required_height: 512,
        aspect_ratio: "1:1",
        allowed_formats: ["png", "webp", "svg"],
        recommended_format: "png",
        max_file_size_kb: 200,
        object_fit: "contain"
    },

    service_icon: {
        required_width: 128,
        required_height: 128,
        aspect_ratio: "1:1",
        allowed_formats: ["png", "webp", "svg"],
        recommended_format: "svg",
        max_file_size_kb: 100,
        object_fit: "contain"
    }
};
